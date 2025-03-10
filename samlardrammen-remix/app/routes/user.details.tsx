import type { Route } from '../+types/root';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import UserDetailsPage from '../pages/UserPage';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Medlemmer' }, { name: 'description', content: 'Medlemsliste' }];
}

export async function loader() {
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader };
}

export default function UserDetailsId({ params }: Route.ComponentProps) {
    return <UserDetailsPage userId={params.userId} />;
}
