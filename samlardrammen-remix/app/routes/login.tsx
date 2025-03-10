import { supabaseClientLoader } from '../loaders/supabaseloader';
import LoginPage from '../pages/LoginPage';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Innlogging' }, { name: 'description', content: 'Login til din bruker' }];
}

export async function loader() {
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader };
}

export default function Login() {
    return <LoginPage />;
}
