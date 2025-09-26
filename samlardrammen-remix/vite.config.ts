import mdx from '@mdx-js/rollup';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command }) => ({
    ssr: {
        noExternal: command === 'build' ? true : [ /^@mui\//],  // Add MUI to externalize in dev for faster builds
    },
    plugins: [
        mdx({
            remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        }),
        tailwindcss(),
        reactRouter(),
        tsconfigPaths(),
    ],
    resolve: {
        alias: [
            {
                find: /^@mui\/icons-material\/(.*)/,
                replacement: '@mui/icons-material/esm/$1',
            },
        ],
    },
  ...(command === 'serve' && {
        build: {
            minify: false,
            sourcemap: false,  // Disable if not needed
        },
        server: {
            hmr: {
                overlay: false,
            },
        },
    }),
}));
