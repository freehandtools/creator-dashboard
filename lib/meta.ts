const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0'

type MetaErrorBody = {
  error?: {
    code?: number
    error_subcode?: number
    message?: string
    type?: string
  }
}

type LongLivedTokenResponse = MetaErrorBody & {
  access_token?: string
  expires_in?: number
  token_type?: string
}

export type PageAccount = {
  id: string
  name?: string
  access_token?: string
  instagram_business_account?: {
    id: string
  }
}

type PageAccountsResponse = MetaErrorBody & {
  data?: PageAccount[]
}

type InstagramBusinessAccountResponse = MetaErrorBody & {
  instagram_business_account?: {
    id: string
  }
}

type DebugTokenResponse = MetaErrorBody & {
  data?: {
    app_id?: string
    expires_at?: number
    granular_scopes?: Array<{
      scope?: string
      target_ids?: string[]
    }>
    is_valid?: boolean
    type?: string
    user_id?: string
  }
}

export type AccessTokenDetails = {
  expiresAt?: number
  isValid: boolean
  pageTargetIds: string[]
  type?: string
}

export type InstagramProfile = {
  id: string
  username: string
  name?: string
  profile_picture_url?: string
  followers_count?: number
  media_count?: number
}

export class MetaApiError extends Error {
  constructor(
    message: string,
    public readonly operation:
      | 'exchange'
      | 'debug-token'
      | 'pages'
      | 'page-details'
      | 'instagram-account'
      | 'profile',
    public readonly status: number,
    public readonly code?: number,
  ) {
    super(message)
    this.name = 'MetaApiError'
  }
}

async function metaGet<T extends MetaErrorBody>(
  path: string,
  params: Record<string, string>,
  operation: MetaApiError['operation'],
): Promise<T> {
  const url = new URL(`${GRAPH_API_BASE}/${path}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url, { cache: 'no-store' })
  const data = await response.json().catch(() => null) as T | null
  const graphError = data?.error

  if (!response.ok || graphError) {
    throw new MetaApiError(
      graphError?.message ?? `Meta Graph API merespons HTTP ${response.status}`,
      operation,
      response.status,
      graphError?.code,
    )
  }

  if (!data) {
    throw new MetaApiError(
      'Meta Graph API mengembalikan respons yang tidak dapat dibaca.',
      operation,
      502,
    )
  }

  return data
}

export async function exchangeForLongLivedToken(shortToken: string) {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error('Konfigurasi META_APP_ID atau META_APP_SECRET belum tersedia.')
  }

  const data = await metaGet<LongLivedTokenResponse>(
    'oauth/access_token',
    {
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortToken,
    },
    'exchange',
  )

  if (!data.access_token) {
    throw new MetaApiError(
      'Meta tidak mengembalikan long-lived access token.',
      'exchange',
      502,
    )
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  }
}

export async function getPageAccounts(userAccessToken: string): Promise<PageAccount[]> {
  const data = await metaGet<PageAccountsResponse>(
    'me/accounts',
    {
      fields: 'id,name,access_token',
      limit: '100',
      access_token: userAccessToken,
    },
    'pages',
  )

  return data.data ?? []
}

export async function debugAccessToken(accessToken: string): Promise<AccessTokenDetails> {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error('Konfigurasi META_APP_ID atau META_APP_SECRET belum tersedia.')
  }

  const data = await metaGet<DebugTokenResponse>(
    'debug_token',
    {
      input_token: accessToken,
      access_token: `${appId}|${appSecret}`,
    },
    'debug-token',
  )

  const pageScopes = new Set(['pages_show_list', 'pages_read_engagement'])
  const pageTargetIds = data.data?.granular_scopes
    ?.filter((permission) => permission.scope && pageScopes.has(permission.scope))
    .flatMap((permission) => permission.target_ids ?? []) ?? []

  return {
    expiresAt: data.data?.expires_at,
    isValid: data.data?.is_valid === true,
    pageTargetIds: [...new Set(pageTargetIds)],
    type: data.data?.type?.toUpperCase(),
  }
}

export async function getPageAccountById(
  pageId: string,
  accessToken: string,
): Promise<PageAccount> {
  return metaGet<PageAccount & MetaErrorBody>(
    pageId,
    {
      fields: 'id,name,access_token,instagram_business_account',
      access_token: accessToken,
    },
    'page-details',
  )
}

export async function getCurrentPageAccount(pageAccessToken: string): Promise<PageAccount> {
  const page = await metaGet<PageAccount & MetaErrorBody>(
    'me',
    {
      fields: 'id,name,instagram_business_account',
      access_token: pageAccessToken,
    },
    'page-details',
  )

  return { ...page, access_token: pageAccessToken }
}

export async function getInstagramBusinessAccount(
  pageId: string,
  pageAccessToken: string,
): Promise<string | null> {
  const data = await metaGet<InstagramBusinessAccountResponse>(
    pageId,
    {
      fields: 'instagram_business_account',
      access_token: pageAccessToken,
    },
    'instagram-account',
  )

  return data.instagram_business_account?.id ?? null
}

export async function getInstagramProfile(
  igUserId: string,
  pageAccessToken: string,
): Promise<InstagramProfile> {
  return metaGet<InstagramProfile & MetaErrorBody>(
    igUserId,
    {
      fields: 'id,username,name,profile_picture_url,followers_count,media_count',
      access_token: pageAccessToken,
    },
    'profile',
  )
}
