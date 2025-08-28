import Script from 'next/script'
import z from 'zod'

interface CallbackPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

const CallbackPage = async ({ searchParams }: CallbackPageProps) => {
  const searchParamsObj = await searchParams
  const code = z.string().parse(searchParamsObj.code)
  // const state = z.string().nullish().parse(searchParamsObj.state)

  const resp = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          `${process.env.NEXT_PUBLIC_XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`,
        ).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code || '',
      redirect_uri:
        'https://dominant-deadly-narwhal.ngrok-free.app/auth/callback',
    }),
  })
  const data = await resp.json()
  console.info('Token response:', data)
  return (
    <div className="py-8 px-4">
      <div>Connecting Xero Integration...</div>
      <Script defer={true}>{`window.close();`}</Script>
    </div>
  )
}

export default CallbackPage
