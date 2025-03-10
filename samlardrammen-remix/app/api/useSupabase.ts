import { createBrowserClient } from '@supabase/ssr';
import { useLoaderData } from 'react-router';

export const useGetSupabaseClient = () => {
    const { env } = useLoaderData();

    return createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
};
