import type { NextConfig } from 'next'

const nextConfig = {
  // Ngrok tunnel for local dev testing (roj)
  allowedDevOrigins: ['dominant-deadly-narwhal.ngrok-free.app'],
  // biome-ignore lint/suspicious/useAwait: `headers` needs to be async
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://dashboard.copilot.app https://dashboard.copilot-staging.app https://dashboard.copilot-staging.com https://dashboard.assembly.com https://*.myassembly.com;",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
} satisfies NextConfig

export default nextConfig
