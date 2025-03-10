import { supabaseClientLoader } from '../loaders/supabaseloader';
import BlogDetailPage from '../pages/BlogDetailPage';
import { fetchBlogPostBySlug } from '../services/blogService';

export function meta({ data: { blogPost } }: Route.MetaArgs<typeof loader>) {
    console.log(blogPost);
    return [
        {
            title: blogPost.content.title,
            openGraph: {
                description: blogPost.content.preview,
                title: blogPost.content.title,
                images: [
                    {
                        url: blogPost.content.image?.filename,
                    },
                ],
            },
            twitter: {
                description: blogPost.content.preview,
                title: blogPost.content.title,
                images: [
                    {
                        url: blogPost.content.image?.filename,
                    },
                ],
            },
        },
        { name: 'description', content: blogPost.content.preview },
    ];
}

export async function loader({ params }: Route.LoaderArgs) {
    const path = params['*'];
    const blogPost = await fetchBlogPostBySlug(path);

    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader, blogPost };
}

export default function BlogDetail({ loaderData }: Route.ComponentProps) {
    return <BlogDetailPage />;
}
