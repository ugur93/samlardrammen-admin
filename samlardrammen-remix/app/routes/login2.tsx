import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { redirect } from 'react-router';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import getSupabaseServerClient from '../loaders/supabaseServerClient';
import LoginPage from '../pages/LoginPage';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Innlogging' }, { name: 'description', content: 'Login til din bruker' }];
}

type JwtCustomPayload = JwtPayload & {
    user_roles: string[];
};

export async function loader({ request }: Route.LoaderArgs) {
    const client = getSupabaseServerClient(request);
    const session = await client.auth.getSession();
    const jwtToken = session.data.session?.access_token;
    if (jwtToken) {
        const jwtTokenParsed = jwtDecode<JwtCustomPayload>(jwtToken);
        const roles = jwtTokenParsed.user_roles;
        if (roles.includes('admin')) {
            return redirect('/user-admin');
        } else {
            return redirect('/user');
        }
    }
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader };
}

export default function Login() {
    return <LoginPage />;
}
