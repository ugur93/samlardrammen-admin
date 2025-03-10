import type { Route } from '../+types/root';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import { OrganizationDetailsPage } from '../pages/OrganizationDetailsPage';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Medlemmer' }, { name: 'description', content: 'Medlemsliste' }];
}

export async function loader() {
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader };
}

export default function UserDetailsId({ params }: Route.ComponentProps) {
    return <OrganizationDetailsPage organizationId={params.organizationId!} />;
}
