import { defineConfig } from '@vite-pwa/assets-generator/config'

/**
 * `pnpm generate-pwa-assets` rebuilds the icons in `public/` from
 * `public/logo.svg`. The logo already carries its own padding, so nothing here
 * adds more: the maskable safe zone is baked into the artwork.
 */
export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  images: ['public/logo.svg'],
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, 'favicon.ico']],
      padding: 0,
    },
    maskable: {
      sizes: [512],
      padding: 0,
      resizeOptions: { background: '#123524' },
    },
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: { background: '#123524' },
    },
  },
})
