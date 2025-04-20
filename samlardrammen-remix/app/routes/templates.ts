import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';

export const loader = async () => {
    const templatesDir = path.join(process.cwd(), 'app', 'email-templates');
    const files = await fs.readdir(templatesDir);
    const templates = await Promise.all(
        files
            .filter((f) => f.endsWith('.html'))
            .map(async (fname) => {
                const raw = await fs.readFile(path.join(templatesDir, fname), 'utf-8');
                const { data, content } = matter(raw);
                console.log(data, 'content', content, raw);
                return {
                    id: data.id ?? fname.replace(/\.md$/, ''),
                    name: data.name ?? data.id,
                    subject: data.subject,
                    content,
                };
            })
    );
    console.log(templates);
    return templates;
};
