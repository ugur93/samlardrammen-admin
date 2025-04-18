import { Outlet, redirect, useLoaderData } from 'react-router';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import getSupabaseServerClient, { getUserRoles } from '../loaders/supabaseServerClient';
import NoAccessPage from './NoAccessPage';

export async function loader({ request }: Route.LoaderArgs) {
    const client = getSupabaseServerClient(request);
    const session = await client.auth.getUserIdentities();
    if (session.data == null || session.error) {
        return redirect('/login');
    }
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    const roles = await getUserRoles(request);
    if (roles) {
        return { ...supabaseloader, hasAccess: roles.includes('admin') };
    }
    return { ...supabaseloader, hasAccess: false };
}

export default function AdminLayout() {
    const { hasAccess } = useLoaderData<typeof loader>();
    return <div>{hasAccess ? <Outlet /> : <NoAccessPage />}</div>;
}
