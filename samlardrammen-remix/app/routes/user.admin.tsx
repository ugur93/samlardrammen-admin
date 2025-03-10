import type { Route } from '../+types/root';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import { UserAdminPage } from '../pages/UserAdminPage';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Medlemmer' }, { name: 'description', content: 'Medlemsliste' }];
}

export async function loader() {
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader };
}

export default function UserAdmin({ loaderData }: Route.ComponentProps) {
    console.log(loaderData);
    return <UserAdminPage />;
}
