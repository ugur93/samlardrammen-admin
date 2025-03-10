import { BlogNavigationProvider } from '../context/BlogNavigationContext';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import BlogListingPage from '../pages/BlogListingPage';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'New React Router App' }, { name: 'description', content: 'Welcome to React Router!' }];
}
export async function loader() {
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader };
}
export default function BlogDetail() {
    return (
        <BlogNavigationProvider>
            <BlogListingPage />
        </BlogNavigationProvider>
    );
}
