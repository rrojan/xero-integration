export const getAuthUrl = () => {
  const clientId = process.env.NEXT_PUBLIC_XERO_CLIENT_ID
  const redirectUri =
    'https://dominant-deadly-narwhal.ngrok-free.app/auth/callback'
  const scope = 'openid profile email accounting.transactions offline_access'
  const responseType = 'code'
  const state = 'random_state_string' // In production, generate a random string and validate it in the callback

  return `https://login.xero.com/identity/connect/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`
}
