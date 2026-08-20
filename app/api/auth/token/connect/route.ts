import { NextRequest, NextResponse } from 'next/server'
import {
  debugAccessToken,
  exchangeForLongLivedToken,
  getCurrentPageAccount,
  getInstagramBusinessAccount,
  getInstagramProfile,
  getPageAccountById,
  getPageAccounts,
  MetaApiError,
  type PageAccount,
} from '@/lib/meta'
import { supabaseAdmin } from '@/lib/supabase'
import { encryptAccessToken } from '@/lib/token-crypto'

export const runtime = 'nodejs'

const SIXTY_DAYS_IN_SECONDS = 60 * 24 * 60 * 60
// Facebook Login for Business pada project ini sebelumnya memakai pasangan akun
// test berikut karena /me/accounts dapat mengembalikan [] walau token valid.
// Fallback hanya diterima bila token benar-benar bisa membaca IG user ini.
const KNOWN_TEST_PAGE_ID = '1095788086959709'
const KNOWN_TEST_IG_USER_ID = '17841418231940887'

function errorResponse(error: string, status: number) {
  return NextResponse.json(
    { success: false, error },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}

function metaErrorResponse(error: MetaApiError) {
  console.warn('[auth/token/connect] Meta API rejected request:', {
    operation: error.operation,
    status: error.status,
    code: error.code,
  })

  if (error.operation === 'exchange' || error.code === 190) {
    return errorResponse(
      'Access token tidak valid atau sudah kedaluwarsa. Generate token baru di Graph API Explorer lalu coba lagi.',
      401,
    )
  }

  if (error.operation === 'pages') {
    return errorResponse(
      `Token valid, tetapi Meta menolak request GET /me/accounts${error.code ? ` (kode ${error.code})` : ''}. Coba request yang sama di Graph API Explorer untuk melihat detail akses Page dari Meta.`,
      403,
    )
  }

  if (error.operation === 'debug-token') {
    return errorResponse(
      'Token tidak dapat diverifikasi untuk Meta App ini. Generate token baru dengan App ID 1426999336130882 lalu coba lagi.',
      401,
    )
  }

  if (error.operation === 'page-details') {
    return errorResponse(
      `Token valid, tetapi Meta menolak pembacaan Page yang tercantum pada token${error.code ? ` (kode ${error.code})` : ''}.`,
      403,
    )
  }

  return errorResponse(
    `Facebook Page ditemukan, tetapi Meta menolak pembacaan akun Instagram${error.code ? ` (kode ${error.code})` : ''}.`,
    403,
  )
}

async function discoverPageAccounts(accessToken: string): Promise<{
  pages: PageAccount[]
  tokenExpiresAt?: number
}> {
  const details = await debugAccessToken(accessToken)

  if (!details.isValid) {
    throw new MetaApiError(
      'Access token tidak valid.',
      'debug-token',
      401,
      190,
    )
  }

  if (details.type === 'PAGE') {
    const page = await getCurrentPageAccount(accessToken)
    return { pages: [page], tokenExpiresAt: details.expiresAt }
  }

  const pages = await getPageAccounts(accessToken)
  if (pages.length > 0 || details.pageTargetIds.length === 0) {
    return { pages, tokenExpiresAt: details.expiresAt }
  }

  const pagesFromTokenTargets: PageAccount[] = []
  for (const pageId of details.pageTargetIds) {
    try {
      pagesFromTokenTargets.push(await getPageAccountById(pageId, accessToken))
    } catch (error) {
      // A granular target can become stale or refer to an asset the token can no
      // longer read. Continue with the other targets without guessing the cause.
      if (!(error instanceof MetaApiError)) throw error
    }
  }

  return { pages: pagesFromTokenTargets, tokenExpiresAt: details.expiresAt }
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return errorResponse('Body request harus berupa JSON yang valid.', 400)
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('access_token' in body) ||
    typeof body.access_token !== 'string'
  ) {
    return errorResponse('Field access_token wajib diisi.', 400)
  }

  const shortToken = body.access_token.trim()
  if (!shortToken) {
    return errorResponse('Access token tidak boleh kosong.', 400)
  }

  if (shortToken.length > 8192) {
    return errorResponse('Access token terlalu panjang.', 400)
  }

  if (!process.env.META_APP_ID || !process.env.META_APP_SECRET) {
    return errorResponse('Konfigurasi Meta di server belum lengkap.', 500)
  }

  try {
    const longLivedToken = await exchangeForLongLivedToken(shortToken)
    const discovery = await discoverPageAccounts(longLivedToken.accessToken)
    const pages = discovery.pages

    let connectedAccount:
      | {
          igUserId: string
          pageId: string
          pageAccessToken: string
          profile: Awaited<ReturnType<typeof getInstagramProfile>>
        }
      | undefined
    let firstLookupError: MetaApiError | undefined

    for (const page of pages) {
      if (!page.access_token) continue

      try {
        const igUserId = page.instagram_business_account?.id
          ?? await getInstagramBusinessAccount(page.id, page.access_token)
        if (!igUserId) continue

        const profile = await getInstagramProfile(igUserId, page.access_token)
        connectedAccount = {
          igUserId,
          pageId: page.id,
          pageAccessToken: page.access_token,
          profile,
        }
        break
      } catch (error) {
        if (error instanceof MetaApiError && !firstLookupError) {
          firstLookupError = error
        }
      }
    }

    // Known limitation of this app's Facebook Login for Business setup:
    // /me/accounts may be empty. Preserve the verified legacy path for the
    // existing test account, but only after proving the supplied token can read it.
    if (!connectedAccount) {
      try {
        const profile = await getInstagramProfile(
          KNOWN_TEST_IG_USER_ID,
          longLivedToken.accessToken,
        )
        connectedAccount = {
          igUserId: KNOWN_TEST_IG_USER_ID,
          pageId: KNOWN_TEST_PAGE_ID,
          pageAccessToken: longLivedToken.accessToken,
          profile,
        }
      } catch (error) {
        if (error instanceof MetaApiError && !firstLookupError) {
          firstLookupError = error
        }
      }
    }

    if (!connectedAccount) {
      if (pages.length === 0) {
        return errorResponse(
          'Token valid, tetapi Meta mengembalikan GET /me/accounts dengan data kosong dan token tidak memuat target Page yang bisa dibaca. Jalankan GET /me/accounts di Graph API Explorer dengan token yang sama untuk memeriksa respons aset dari Meta.',
          404,
        )
      }

      if (firstLookupError) return metaErrorResponse(firstLookupError)

      return errorResponse(
        `Meta mengembalikan ${pages.length} Facebook Page, tetapi tidak satu pun memiliki field instagram_business_account.`,
        404,
      )
    }

    const { igUserId, pageId, pageAccessToken, profile } = connectedAccount
    const expiresIn = longLivedToken.expiresIn && longLivedToken.expiresIn > 0
      ? longLivedToken.expiresIn
      : SIXTY_DAYS_IN_SECONDS
    const tokenExpiresAt = discovery.tokenExpiresAt && discovery.tokenExpiresAt > 0
      ? new Date(discovery.tokenExpiresAt * 1000).toISOString()
      : new Date(Date.now() + expiresIn * 1000).toISOString()
    const now = new Date().toISOString()

    const { error: databaseError } = await supabaseAdmin
      .from('instagram_accounts')
      .upsert(
        {
          user_id: igUserId,
          ig_user_id: igUserId,
          page_id: pageId,
          username: profile.username,
          profile_picture_url: profile.profile_picture_url ?? null,
          followers_count: profile.followers_count ?? 0,
          media_count: profile.media_count ?? 0,
          access_token: encryptAccessToken(pageAccessToken),
          token_expires_at: tokenExpiresAt,
          updated_at: now,
        },
        { onConflict: 'ig_user_id' },
      )

    if (databaseError) {
      console.error('[auth/token/connect] Supabase upsert failed:', databaseError.message)
      return errorResponse(
        'Akun Instagram ditemukan, tetapi data koneksi gagal disimpan. Silakan coba lagi beberapa saat lagi.',
        500,
      )
    }

    const response = NextResponse.json(
      {
        success: true,
        redirect: '/loading-data',
        account: {
          ig_user_id: igUserId,
          username: profile.username,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )

    response.cookies.set('session_ig_user_id', igUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SIXTY_DAYS_IN_SECONDS,
      path: '/',
    })

    return response
  } catch (error) {
    if (error instanceof MetaApiError) return metaErrorResponse(error)

    const message = error instanceof Error ? error.message : String(error)
    console.error('[auth/token/connect] Unexpected error:', message)
    return errorResponse(
      'Gagal menghubungi layanan Meta. Periksa koneksi lalu coba lagi.',
      502,
    )
  }
}
