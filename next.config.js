import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Ensure font TTF files are bundled with the serverless API function on Vercel,
    // so fs.readFileSync can reach them even when public/ is served via CDN separately.
    outputFileTracingIncludes: {
      '/api/export/profile/[id]': ['./public/fonts/**/*.ttf'],
    },
  },
}

export default withNextIntl(nextConfig)
