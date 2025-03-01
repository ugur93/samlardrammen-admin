import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { LoggedInUser } from '../context/AppContext';
import supabase from '../supabase';
import { Database } from '../types/database.types';
import {
    ChangePasswordValues,
    CreateOrUpdateUserPaymentDetailsFormFields,
    LoginFormValues,
    UserFormFields,
} from '../types/formTypes';
import { mapPersonResponse, PersonDetails } from '../types/personTypes';

export const QueryKeys = {
    loggedInUser: ['logged-in-user'],
    fetchPersons: ['persons'],
    fetchPersonByEmail: (email: string) => ['person', 'email', email],
    fetchPersonById: (id?: string | number) => ['person', 'id', id],
};

const fetchPersons = async (): Promise<PersonDetails[]> => {
    const { data, error } = await supabase
        .from('person')
        .select('*, address(*), membership(*, payment_info(*), organization(*, payment_detail(*)))');
    if (error) throw new Error(error.message);
    return data.map(
        (person) =>
            ({
                person: person,
                membership: person.membership
                    .filter((m) => m.is_member)
                    .map((membership) => ({
                        membership: membership,
                        organization: {
                            organization: membership.organization,
                            paymentDetails: membership.organization!.payment_detail,
                        },
                        paymentDetails: membership.payment_info,
                    })),
                membershipRemoved: person.membership
                    .filter((m) => !m.is_member)
                    .map((membership) => ({
                        membership: membership,
                        organization: {
                            organization: membership.organization,
                            paymentDetails: membership.organization!.payment_detail,
                        },
                        paymentDetails: membership.payment_info,
                    })),
                address: person.address ? person.address[0] : undefined,
                name: `${person.firstname} ${person.lastname}`,
            }) as PersonDetails
    );
};

const fetchPersonByEmail = async (email?: string): Promise<PersonDetails | null> => {
    const { data: person, error } = await supabase
        .from('person')
        .select('*, address(*), membership(*, payment_info(*), organization(*, payment_detail(*)))')
        .eq('email', email!)
        .single();
    if (error) {
        console.error(error);
        return null;
    }
    return mapPersonResponse(person);
};
const fetchPersonById = async (user_id?: string): Promise<PersonDetails | null> => {
    if (!user_id) return null;
    const { data: person, error } = await supabase
        .from('person')
        .select('*, address(*), membership(*, payment_info(*), organization(*, payment_detail(*)))')
        .filter('id', 'eq', user_id)
        .single();
    if (error) {
        console.error(error);
        return null;
    }
    return mapPersonResponse(person);
};
const fetchPersonByUserIdOrEmail = async (user_id?: string, email?: string): Promise<PersonDetails | null> => {
    const personDetailsUser = await fetchPersonByUserId(user_id);
    if (personDetailsUser) return personDetailsUser;
    const personDetailsEmail = await fetchPersonByEmail(email);
    return personDetailsEmail;
};
const fetchPersonByUserId = async (user_id?: string): Promise<PersonDetails | null> => {
    const { data: person, error } = await supabase
        .from('person')
        .select('*, address(*), membership(*, payment_info(*), organization(*, payment_detail(*)))')
        .filter('user_id', 'eq', user_id)
        .single();
    if (error) {
        console.error(error);
        return null;
    }
    return mapPersonResponse(person);
};
export function useGetPersons() {
    const { data } = useSuspenseQuery<PersonDetails[], Error>({
        queryKey: ['persons'], // Unique key for the query
        queryFn: fetchPersons, // Function to fetch data
    });

    return data;
}

export function useGetPersonById(id?: string) {
    const { data } = useSuspenseQuery<PersonDetails | null, Error>({
        queryKey: QueryKeys.fetchPersonById(id), // Unique key for the query
        queryFn: () => fetchPersonById(id), // Function to fetch data
    });

    return data;
}
export function useGetPersonByEmail(email: string) {
    const { data } = useSuspenseQuery<PersonDetails | null, Error>({
        queryKey: QueryKeys.fetchPersonByEmail(email), // Unique key for the query
        queryFn: () => fetchPersonByEmail(email), // Function to fetch data
    });

    return data;
}
export function useAddOrUpdatePaymentStatus(userId: number) {
    console.log(userId);
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (paymentInfo: CreateOrUpdateUserPaymentDetailsFormFields) => {
            const paymentInfoRef = supabase.from('payment_info');
            const paymentInfoDbData = {
                id: paymentInfo.id ?? undefined,
                payment_detail_id: paymentInfo.payment_detail_id,
                membership_id: paymentInfo.membership_id,
                payment_date:
                    paymentInfo.paymentState == 'unpaid' || paymentInfo.payment_date == ''
                        ? null
                        : paymentInfo.payment_date,
                payment_state: paymentInfo.paymentState,
            } as Database['public']['Tables']['payment_info']['Insert'];
            const result = paymentInfo.id
                ? await paymentInfoRef.upsert(paymentInfoDbData).select()
                : await paymentInfoRef.insert([paymentInfoDbData], { defaultToNull: false }).select();

            if (result.error) throw new Error(result.error.message);

            qc.refetchQueries({ queryKey: QueryKeys.fetchPersonById(userId.toString()) });
        },
    });
}
export function useCreatePersonMutation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({
            person,
            existingPerson,
        }: {
            person: UserFormFields;
            existingPerson?: PersonDetails | null;
        }) => {
            const personRef = supabase.from('person');
            const personDbData = {
                id: person.personId ?? undefined,
                firstname: person.firstname,
                lastname: person.lastname,
                email: person.email,
                phone_number: person.phoneNumber,
                gender: person.gender,
                birthdate: person.birthdate?.trim().length > 0 ? person.birthdate : null,
            };
            if (!personDbData.id) {
                delete personDbData.id;
            }
            const result = person.personId
                ? await personRef.upsert(personDbData).select()
                : await personRef
                      .insert([
                          {
                              ...personDbData,
                          },
                      ])
                      .select();

            if (result.error) throw new Error(result.error.message);
            const personId = result.data[0].id;

            const address = person.address;
            const resultaddress = await supabase.from('address').insert([
                {
                    person_id: result.data[0].id,
                    addressLine1: address.addressLine1,
                    addressLine2: address.addressLine2,
                    postcode: address.postcode,
                    city: address.city,
                },
            ]);

            await updateMembership(personId, person, existingPerson);
            if (resultaddress.error) throw new Error(resultaddress.error.message);

            await qc.resetQueries({ queryKey: QueryKeys.fetchPersonById(personId.toString()) });
            await qc.refetchQueries({ queryKey: QueryKeys.fetchPersons });
        },
    });
}

async function updateMembership(personId: number, personForm: UserFormFields, existingPerson?: PersonDetails | null) {
    const removeMembership = existingPerson?.membership?.filter(
        (membership) => !personForm.organizations.includes(membership.membership.organization_id!.toString())
    );
    for (const membership of removeMembership ?? []) {
        console.log(`Removing membership ${membership} from person ${personId}`, personId, membership);
        await supabase.from('membership').update({ is_member: false }).filter('id', 'eq', membership.membership.id);
    }

    const addMembership = personForm.organizations.filter(
        (d) =>
            !existingPerson?.membershipRemoved?.some((m) => m.membership.organization_id == d) &&
            !existingPerson?.membership?.some((m) => m.membership.organization_id == d)
    );

    if (addMembership.length > 0) {
        console.log('Adding membership for person and organizations', personId, addMembership);
        await supabase.from('membership').upsert(
            addMembership.map(
                (organization_id) => ({
                    person_id: personId,
                    organization_id: organization_id,
                }),
                { onConflict: 'organization_id' }
            )
        );
    }

    const uniqueMembershipRemoved = Array.from(
        new Map((existingPerson?.membershipRemoved || []).map((m) => [m.organization.organization.id, m])).values()
    );

    const updateMembership =
        uniqueMembershipRemoved?.filter((membership) =>
            personForm.organizations.includes(membership.membership.organization_id!.toString())
        ) ?? [];

    if (updateMembership.length > 0) {
        console.log('Enabling membership for person', personId, updateMembership);
        await supabase.from('membership').upsert(
            updateMembership.map((membership) => ({
                id: membership.membership.id,
                is_member: true,
                person_id: personId,
                organization_id: membership.membership.organization_id,
            }))
        );
    }
}
export const changePasswordMutation = () =>
    useMutation({
        mutationFn: async (data: ChangePasswordValues) => {
            if (data.newPassword !== data.confirmPassword) {
                throw new Error('Passwords do not match');
            }
            const user = await supabase.auth.getUser();
            if (!user) throw new Error('User not logged in');

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.data.user?.email!,
                password: data.currentPassword,
            });
            if (signInError) throw new Error('Current password is incorrect');

            const { error: updateError } = await supabase.auth.updateUser({
                password: data.newPassword,
            });
            if (updateError) throw new Error(updateError.message);
        },
    });

export const loginMutation = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (data: LoginFormValues) => {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });
            if (error) throw new Error(error.message);
            qc.invalidateQueries({ queryKey: ['logged-in-user'] });
        },
    });
};

export const useLoggedInUser = () => {
    return useSuspenseQuery<LoggedInUser | null>({
        queryKey: QueryKeys.loggedInUser,
        queryFn: async () => {
            console.log('Fetching logged in user');
            const user = await supabase.auth.getUser();
            if (user.error) return null;
            const personDetails = (await fetchPersonByUserIdOrEmail(user.data.user.id, user.data.user.email))!;

            return {
                user: user.data.user,
                details: personDetails,
                isAdmin: personDetails?.person?.roles?.includes('admin') ?? false,
                roles: personDetails?.person?.roles ?? [],
            };
        },
    }).data;
};
export const useLogout = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await supabase.auth.signOut();
            qc.invalidateQueries({ queryKey: ['logged-in-user'] });
        },
    });
};
