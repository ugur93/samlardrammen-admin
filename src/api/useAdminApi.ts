import { useSuspenseQuery } from '@tanstack/react-query';
import supabase from '../supabase';

export function useGetAllUsers() {
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
