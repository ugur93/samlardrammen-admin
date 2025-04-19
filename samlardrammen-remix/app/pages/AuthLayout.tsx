import { Outlet, redirect } from 'react-router';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import getSupabaseServerClient from '../loaders/supabaseServerClient';

export async function loader({ request }: Route.LoaderArgs) {
    const client = getSupabaseServerClient(request);
    const session = await client.auth.getUserIdentities();
    if (session.data == null || session.error) {
        return redirect('/login');
    }
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader };
}

export default function AuthLayout() {
    return (
        <div>
            <Outlet />
        </div>
    );
}
