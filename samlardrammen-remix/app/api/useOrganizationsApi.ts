import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { type Database } from '../types/database.types';
import {
    type CreateOrUpdateOrganizationFormFields,
    type CreateOrUpdateOrganizationPaymentDetailFormFields,
} from '../types/formTypes';
import { type OrganizationDetails } from '../types/personTypes';
import { useGetSupabaseClient } from './useSupabase';

export const QueryKeys = {
    fetchOrganizations: ['organizations'],
    fetchOrganizationById: (id: number | string) => ['organizations', id?.toString()],
};
const fetchOrganizations = async (): Promise<OrganizationDetails[]> => {
    const supabase = useGetSupabaseClient();
    const { data, error } = await supabase.from('organization').select('*, payment_detail(*)');
    if (error) throw new Error(error.message);
    return data.map((organization) => ({
        organization: organization,
        paymentDetails: organization.payment_detail.filter((pd) => !pd.deleted),
    }));
};
const fetchOrganizationById = async (id: string): Promise<OrganizationDetails> => {
    const supabase = useGetSupabaseClient();
    const { data: organization, error } = await supabase
        .from('organization')
        .select('*, payment_detail(*)')
        .filter('id', 'eq', id)
        .single();
    if (error) throw new Error(error.message);
    return {
        organization: organization,
        paymentDetails: organization.payment_detail.filter((pd) => !pd.deleted),
    };
};
export function useGetOrganization(id: string) {
    const { data } = useSuspenseQuery<OrganizationDetails, Error>({
        queryKey: QueryKeys.fetchOrganizationById(id), // Unique key for the query
        queryFn: () => fetchOrganizationById(id), // Function to fetch data
    });

    return data;
}

export function useGetOrganizations() {
    const { data } = useSuspenseQuery<OrganizationDetails[], Error>({
        queryKey: ['organizations'], // Unique key for the query
        queryFn: fetchOrganizations, // Function to fetch data
    });

    return data;
}
export function useDeleteOrganizationApi() {
    const qc = useQueryClient();
    const supabase = useGetSupabaseClient();

    return useMutation({
        mutationFn: async (orgId: number) => {
            const orgRef = supabase.from('organization');

            const result = await orgRef.delete().eq('id', orgId);

            if (result.error) throw new Error(result.error.message);

            qc.refetchQueries({ queryKey: QueryKeys.fetchOrganizations });
        },
    });
}
export function useCreateOrganizationApi() {
    const qc = useQueryClient();
    const supabase = useGetSupabaseClient();

    return useMutation({
        mutationFn: async (org: CreateOrUpdateOrganizationFormFields) => {
            const orgRef = supabase.from('organization');
            const organizationDbData = {
                id: org.orgId ?? undefined,
                name: org.name,
                bank_account_number: org.bank_account_number,
                organization_number: org.organization_number,
            };
            const result = org.orgId
                ? await orgRef.upsert(organizationDbData).select()
                : await orgRef.insert([organizationDbData], { defaultToNull: false }).select();

            if (result.error) throw new Error(result.error.message);

            qc.refetchQueries({ queryKey: QueryKeys.fetchOrganizations });
            qc.refetchQueries({ queryKey: QueryKeys.fetchOrganizationById(org.orgId?.toString()) });
        },
    });
}

export function useDeletePaymentDetailsApi() {
    const qc = useQueryClient();
    const supabase = useGetSupabaseClient();

    return useMutation({
        mutationFn: async ({ paymentId, organizationId }: { paymentId: number; organizationId: number }) => {
            const orgRef = supabase.from('payment_detail');

            const resultDelete = await orgRef.delete().eq('id', paymentId);

            if (resultDelete.status === 409) {
                await orgRef.update({ deleted: true }).eq('id', paymentId);
            }

            qc.refetchQueries({ queryKey: QueryKeys.fetchOrganizationById(organizationId.toString()) });
        },
    });
}

export function useCreatePaymentDetailApi() {
    const qc = useQueryClient();
    const supabase = useGetSupabaseClient();

    return useMutation({
        mutationFn: async (payment: CreateOrUpdateOrganizationPaymentDetailFormFields) => {
            const paymentRef = supabase.from('payment_detail');
            const paymentDetailDbData: Database['public']['Tables']['payment_detail']['Insert'] = {
                id: payment.id ?? undefined,
                organization_id: payment.organization_id,
                amount: payment.amount,
                late_fee: payment.late_fee,
                payment_deadline: payment.deadline,
                year: payment.year,
            };
            const result = payment.id
                ? await paymentRef.upsert(paymentDetailDbData).select()
                : await paymentRef.insert([paymentDetailDbData], { defaultToNull: false }).select();

            if (result.error) throw new Error(result.error.message);

            qc.refetchQueries({ queryKey: QueryKeys.fetchOrganizationById(payment.organization_id.toString()) });
        },
    });
}
