import crypto from 'crypto'

const TOKEN_PREFIX = 'enc:v1:'

function getEncryptionKey() {
  const appSecret = process.env.META_APP_SECRET
  if (!appSecret) {
    throw new Error('META_APP_SECRET diperlukan untuk melindungi access token.')
  }

  return crypto
    .createHash('sha256')
    .update(`creator-dashboard:page-access-token:v1:${appSecret}`)
    .digest()
}

export function encryptAccessToken(accessToken: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(accessToken, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return [
    'enc',
    'v1',
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join(':')
}

export function decryptAccessToken(storedToken: string) {
  // Backward compatibility untuk token OAuth lama yang tersimpan sebagai plaintext.
  if (!storedToken.startsWith(TOKEN_PREFIX)) return storedToken

  const [, version, ivValue, authTagValue, encryptedValue] = storedToken.split(':')
  if (version !== 'v1' || !ivValue || !authTagValue || !encryptedValue) {
    throw new Error('Format access token tersimpan tidak valid.')
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivValue, 'base64url'),
  )
  decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'))

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}
