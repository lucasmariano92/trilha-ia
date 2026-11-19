/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Política de segurança de conteúdo (CSP) injetada SOMENTE no build de produção
 * (no modo de desenvolvimento o Vite precisa de scripts inline para o recarregamento).
 * Não há chamadas a servidores externos: fontes do sistema, nenhum script de terceiros.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function cspMeta(): Plugin {
  return {
    name: 'trilha-csp-meta',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="no-referrer" />`,
      );
    },
  };
}

export default defineConfig({
  // caminhos relativos: funciona no GitHub Pages em subpasta (rotas usam hash, ex.: #/modulo/1.1)
  base: './',
  plugins: [react(), cspMeta()],
  build: { sourcemap: false, target: 'es2022' },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    css: false,
  },
});
