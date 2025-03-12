import { supabaseClientLoader } from '../loaders/supabaseloader';
import BlogDetailPage from '../pages/BlogDetailPage';
import { fetchBlogPostBySlug } from '../services/blogService';

export function meta({ data: { blogPost } }: Route.MetaArgs<typeof loader>) {
    return [
        {
            title: blogPost.content.title,
        },
        {
            property: 'og:title',
            content: blogPost.content.title,
        },
        {
            property: 'og:image',
            content: blogPost.content.image?.filename,
        },
        { name: 'description', content: blogPost.content.preview },
        { name: 'og:locale', content: 'tr' },
        { name: 'og:description', content: blogPost.content.preview },
    ];
}

export async function loader({ params }: Route.LoaderArgs) {
    const path = params['*'];
    const blogPost = await fetchBlogPostBySlug(path);

    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader, blogPost };
}

export default function BlogDetail() {
    return <BlogDetailPage />;
}
