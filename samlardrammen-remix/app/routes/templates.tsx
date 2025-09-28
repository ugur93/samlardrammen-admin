import { renderToString } from 'react-dom/server';
const files = import.meta.glob('../email-templates/*.mdx', {
    eager: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as Record<string, { frontmatter: any; default: any }>;
export const loader = async () => {
    const templates = await Promise.all(
        Object.keys(files)
            .filter((f) => f.endsWith('.mdx'))
            .map(async (fname) => {
                const file = files[fname]
                const data = file.frontmatter;
                const Content = file.default;
                return {
                    id: data.id ?? fname.replace(/\.md$/, ''),
                    name: data.name ?? data.id,
                    //@ts-ignore
                    subject: data.subject ?? file.subject,
                    content: renderToString(<Content />),
                };
            })
    );
    return templates;
};
