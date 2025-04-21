import mdx from '@mdx-js/rollup';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { defineConfig } from 'vite';
// https://vite.dev/config/
export default defineConfig({
    base: '/samlardrammen-admin/',
    plugins: [
        react(),
        tailwindcss(),
        mdx({
            remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        }),
    ],
});
