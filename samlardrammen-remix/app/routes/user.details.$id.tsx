import type { Route } from '../+types/root';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import UserDetailsPage from '../pages/UserPage';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Medlemmer' }, { name: 'description', content: 'Medlemsliste' }];
}

export async function loader({ params }: Route.LoaderArgs) {
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader, userId: params.userId };
}

export default function UserDetailsId({ userId }: Route.ComponentProps) {
    return <UserDetailsPage userId={userId} />;
}
