import { BlogNavigationProvider } from '../context/BlogNavigationContext';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import BlogListingPage from '../pages/BlogListingPage';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Samlardrammen nyheter' }, { name: 'description', content: 'Samlardrammen nyheter' }];
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
