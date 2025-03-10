import { useSuspenseQuery } from '@tanstack/react-query';
import { useGetSupabaseClient } from './useSupabase';

export function useGetAllUsers() {
    const supabase = useGetSupabaseClient();

    return useSuspenseQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const {
                data: { users },
                error,
            } = await supabase.auth.admin.listUsers();
            return users;
        },
    }).data;
}
