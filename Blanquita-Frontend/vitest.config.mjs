import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.{js,jsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: [
        'src/utils/**',
        'src/hooks/**',
        'src/constants/Values.js',
        'src/components/layout/InputCodigo.jsx',
        'src/components/layout/InputMedida.jsx',
        'src/components/Produccion/comunes.jsx',
      ],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
  },
});
