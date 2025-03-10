import { supabaseClientLoader } from '../loaders/supabaseloader';
import LoginPage from '../pages/LoginPage';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'New React Router App' }, { name: 'description', content: 'Welcome to React Router!' }];
}

export async function loader() {
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader };
}

export default function Home({ loaderData }: Route.ComponentProps) {
    console.log(loaderData);
    return <LoginPage />;
}
