import type { Route } from '../+types/root';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import UserDetailsPage from '../pages/UserPage';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Medlem detaljer' }, { name: 'description', content: 'Medlem detaljer' }];
}

export async function loader() {
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader };
}

export default function UserDetailsId({ params }: Route.ComponentProps) {
    return <UserDetailsPage userId={params.userId} />;
}
