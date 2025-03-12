import type { Route } from '../+types/root';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import { OrganizationsPage } from '../pages/OrganizationsPage';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Organisasjoner' }];
}

export async function loader() {
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader };
}

export default function OrganizationAdmin() {
    return <OrganizationsPage />;
}
