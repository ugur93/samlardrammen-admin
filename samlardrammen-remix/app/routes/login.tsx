import { redirect } from 'react-router';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import { getUserRoles } from '../loaders/supabaseServerClient';
import LoginMagicLinkPage from '../pages/LoginMagicLink';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Innlogging' }, { name: 'description', content: 'Login til din bruker' }];
}

export async function loader({ request }: Route.LoaderArgs) {
    const roles = await getUserRoles(request);
    if (roles) {
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
    return <LoginMagicLinkPage />;
}
