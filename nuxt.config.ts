import { resolve } from 'node:path';

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-quasar-ui',
    'dayjs-nuxt',
    'fluent-ffmpeg',
    '@sidebase/nuxt-auth',
  ],
  css: ['@/assets/css/tailwind.css'],
  build: {
    transpile: ['trpc-nuxt'],
  },
  alias: {
    cookie: resolve(__dirname, 'node_modules/cookie'),
  },

  // environment variables
  runtimeConfig: {
    auth: {
      secret: process.env.NEXTAUTH_SECRET,
    },
    authCredentials: {
      // github
      githubClientId: process.env.GITHUB_CLIENT_ID,
      githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
      // discord
      discordClientId: process.env.DISCORD_CLIENT_ID,
      discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
      // google
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    s3: {
      bucket: process.env.S3_BUCKET,
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY,
    },
    webhook: {
      discordUrl: process.env.WEBHOOK_DISCORD_URL,
    },
    public: {
      baseUrl: process.env.AUTH_ORIGIN,
      s3Endpoint: process.env.S3_ENDPOINT,
      s3Bucket: process.env.S3_BUCKET,
    },
  },

  auth: {
    origin: process.env.AUTH_ORIGIN,
    provider: {
      type: 'authjs',
    },
  },

  quasar: {
    extras: {
      fontIcons: ['material-icons-outlined', 'fontawesome-v6'],
    },
    iconSet: 'material-symbols-outlined',
    config: {
      brand: {
        primary: '#833deb',
        secondary: '#ee3664',
        accent: '#82B1FF',
        dark: '#2c2c2c',
        positive: '#21BA45',
        negative: '#C10015',
        info: '#31CCEC',
        warning: '#F2C037',
      },
    },
  },
});
