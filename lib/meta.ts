const BASE = 'https://graph.facebook.com/v20.0'

export async function exchangeCodeForToken(code: string): Promise<string> {
  const url = new URL(`${BASE}/oauth/access_token`)
  url.searchParams.set('client_id', process.env.META_APP_ID!)
  url.searchParams.set('client_secret', process.env.META_APP_SECRET!)
  url.searchParams.set('redirect_uri', process.env.META_REDIRECT_URI!)
  url.searchParams.set('code', code)

  const res = await fetch(url.toString())
  const data = await res.json()
  console.log('SHORT TOKEN RESPONSE:', JSON.stringify(data, null, 2))
  if (data.error) throw new Error(data.error.message)
  return data.access_token
}

export async function getLongLivedToken(shortToken: string): Promise<string> {
  const url = new URL(`${BASE}/oauth/access_token`)
  url.searchParams.set('grant_type', 'fb_exchange_token')
  url.searchParams.set('client_id', process.env.META_APP_ID!)
  url.searchParams.set('client_secret', process.env.META_APP_SECRET!)
  url.searchParams.set('fb_exchange_token', shortToken)

  const res = await fetch(url.toString())
  const data = await res.json()
  console.log('LONG TOKEN RESPONSE:', JSON.stringify(data, null, 2))
  if (data.error) throw new Error(data.error.message)
  return data.access_token
}

export async function getIGAccountFromPages(userToken: string) {
  const PAGE_ID = '1095788086959709'
  const IG_USER_ID = '17841418231940887'

  const testRes = await fetch(
    `${BASE}/${IG_USER_ID}?fields=id,username,followers_count&access_token=${userToken}`
  )
  const testData = await testRes.json()
  console.log('IG ACCESS TEST:', JSON.stringify(testData, null, 2))

  if (testData.error) throw new Error(`Token tidak bisa akses IG: ${testData.error.message}`)

  return {
    pageId: PAGE_ID,
    pageAccessToken: userToken,
    igUserId: IG_USER_ID,
  }
}

export async function getIGProfile(igUserId: string, pageAccessToken: string) {
  const res = await fetch(
    `${BASE}/${igUserId}?fields=id,username,followers_count,media_count,profile_picture_url&access_token=${pageAccessToken}`
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data
}