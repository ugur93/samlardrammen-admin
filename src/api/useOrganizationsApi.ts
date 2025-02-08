import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import supabase from "../supabase";
import { OrganizationDetails, OrganizationsDatabase, PersonDetails } from "../types/personTypes";
import { CreateOrUpdateOrganizationFormFields, CreateUpdateUserFormFields } from "../types/formTypes";

export const QueryKeys = {
    fetchOrganizations: ["organizations"],
}
const fetchOrganizations = async (): Promise<OrganizationDetails[]> => {
    const { data, error } = await supabase.from('organization')
        .select('*, payment_detail(*)');
    if (error) throw new Error(error.message);
    return data.map((organization) => ({
        organization: organization,
        paymentDetails: organization.payment_detail
    }))
}

export function useGetOrganizations() {

    const { data } = useSuspenseQuery<OrganizationDetails[], Error>({
        queryKey: ['organizations'], // Unique key for the query
        queryFn: fetchOrganizations, // Function to fetch data
    });

    return data
}
export function useDeleteOrganizationApi() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (orgId: number) => {
            const orgRef = supabase.from('organization')

            const result = await orgRef.delete().eq('id', orgId);

            if (result.error) throw new Error(result.error.message);

            qc.refetchQueries({ queryKey: QueryKeys.fetchOrganizations });
        }
    })
}
export function useCreateOrganizationApi() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (org: CreateOrUpdateOrganizationFormFields) => {
            const orgRef = supabase.from('organization')
            const organizationDbData = {
                id: org.id ?? undefined,
                name: org.name,
                bank_account_number: org.bank_account_number,
                organization_number: org.organization_number,
            }
            console.log(organizationDbData)
            const result = org.id ? await orgRef
                .upsert(organizationDbData).select() : await orgRef.insert([organizationDbData], { defaultToNull: false }).select();

            if (result.error) throw new Error(result.error.message);

            qc.refetchQueries({ queryKey: QueryKeys.fetchOrganizations });
        }
    })
}