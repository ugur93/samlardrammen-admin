export const isDev = false;
export const storyblokEnv: 'draft' | 'published' = isDev ? 'draft' : 'published';
export const sbParams = { version: storyblokEnv };
