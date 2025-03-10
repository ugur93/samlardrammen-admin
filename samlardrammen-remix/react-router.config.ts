import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';

export default {
    // Config options...
    // Server-side render by default, to enable SPA mode set this to `false`
    ssr: true,
    presets: [vercelPreset()],
    serverBundles: ['@mui/icons-material'],
    devServerPort: 5151,
} satisfies Config;
