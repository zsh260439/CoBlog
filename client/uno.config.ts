import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['btn', 'px-4 py-1 rounded inline-block bg-primary text-white cursor-pointer hover:bg-primary/90 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-primary'],
  ],
  theme: {
    colors: {
      primary: '#1c1c1e',
      secondary: '#242428',
      accent: {
        1: '#8e8e93',
        2: '#64a0c1',
        3: '#7cb391',
        4: '#9b8dc4',
      },
    },
    boxShadow: {
      'brutal': '4px 4px 0px 0px rgba(0,0,0,1)',
      'brutal-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
    },
    borderRadius: {
      none: '0px',
      sm: '2px',
      md: '6px',
    }
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        display: 'Space Grotesk',
        sans: 'Inter',
        mono: 'JetBrains Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
