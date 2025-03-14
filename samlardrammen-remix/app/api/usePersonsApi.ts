import type { SupabaseClient } from '@supabase/supabase-js';
import * as supabasejs from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { type LoggedInUser } from '../context/AppContext';
import { type Database } from '../types/database.types';
import {
    type ChangePasswordValues,
    type CreateOrUpdateUserPaymentDetailsFormFields,
    type LoginFormValues,
    type UserFormFields,
} from '../types/formTypes';
import { mapPersonResponse, type PersonDatabase, type PersonDetails } from '../types/personTypes';
import { useGetSupabaseClient } from './useSupabase';

const personQUery =
    '*, address(*), membership(*, payment_info(*), organization(*, payment_detail(*))), relations:person_relation!person_id(*, relatedPerson:person!person_related_id(*))';
const personQUery2 = '*, address(*), membership(*, payment_info(*), organization(*, payment_detail(*)))';
export const QueryKeys = {
    loggedInUser: ['logged-in-user'],
    fetchPersons: ['persons'],
    fetchPersonsSimple: ['persons', 'simple'],
    fetchPersonByEmail: (email: string) => [...QueryKeys.fetchPersonBy(), 'email', email],
    fetchPersonByUserIdOrEmail: (id?: string | number, email?: string) => [
        ...QueryKeys.fetchPersonBy(),
        'idmail',
        id,
        email,
    ],
    fetchPersonBy: () => ['person', 'by'],
    fetchPersonById: (id?: string | number) => [...QueryKeys.fetchPersonBy(), 'id', id],
};

const fetchPersonsSimple = async (): Promise<PersonDatabase[]> => {
    const supabase = useGetSupabaseClient();
    const { data, error } = await supabase.from('person').select('*');
    if (error) throw new Error(error.message);
    return data;
};
const fetchPersons = (supabase: SupabaseClient) => async (): Promise<PersonDetails[]> => {
    const { data, error } = await supabase.from('person').select(personQUery2);
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
                relations: [],
            }) as PersonDetails
    );
};

const fetchPersonByEmail =
    (supabase: supabasejs.SupabaseClient) =>
    async (email?: string): Promise<PersonDetails | null> => {
        const { data: person, error } = await supabase.from('person').select(personQUery).eq('email', email!).single();
        if (error) {
            console.error(error);
            return null;
        }
        return mapPersonResponse(person);
    };
const fetchPersonById =
    (supabase: supabasejs.SupabaseClient) =>
    async (user_id?: string): Promise<PersonDetails | null> => {
        if (!user_id) return null;
        const { data: person, error } = await supabase
            .from('person')
            .select(personQUery)
            .filter('id', 'eq', user_id)
            .single();
        if (error) {
            console.error(error);
            return null;
        }
        return mapPersonResponse(person);
    };
const fetchPersonByUserIdOrEmail =
    (supabaseClient: supabasejs.SupabaseClient) =>
    async (user_id?: string, email?: string): Promise<PersonDetails | null> => {
        const personDetailsUser = await fetchPersonByUserId(supabaseClient)(user_id);
        if (personDetailsUser) return personDetailsUser;
        const personDetailsEmail = await fetchPersonByEmail(supabaseClient)(email);
        return personDetailsEmail;
    };
const fetchPersonByUserId =
    (supabase: supabasejs.SupabaseClient) =>
    async (user_id?: string): Promise<PersonDetails | null> => {
        const { data: person, error } = await supabase
            .from('person')
            .select(personQUery)
            .filter('user_id', 'eq', user_id)
            .single();
        if (error) {
            console.error(error);
            return null;
        }
        return mapPersonResponse(person);
    };

export function useGetPersonsSimple() {
    const { data } = useSuspenseQuery<PersonDatabase[], Error>({
        queryKey: QueryKeys.fetchPersonsSimple, // Unique key for the query
        queryFn: fetchPersonsSimple, // Function to fetch data
    });

    return data;
}
export function useGetPersons() {
    const supabase = useGetSupabaseClient();
    const { data } = useSuspenseQuery<PersonDetails[], Error>({
        queryKey: QueryKeys.fetchPersons, // Unique key for the query
        queryFn: fetchPersons(supabase), // Function to fetch data
    });

    return data;
}

export function useGetPersonById(id?: string) {
    const supabase = useGetSupabaseClient();

    const { data } = useSuspenseQuery<PersonDetails | null, Error>({
        queryKey: QueryKeys.fetchPersonById(id?.toString()), // Unique key for the query
        queryFn: () => fetchPersonById(supabase)(id), // Function to fetch data
    });

    return data;
}
export function useGetPersonByEmail(email: string) {
    const supabase = useGetSupabaseClient();
    const { data } = useSuspenseQuery<PersonDetails | null, Error>({
        queryKey: QueryKeys.fetchPersonByEmail(email), // Unique key for the query
        queryFn: () => fetchPersonByEmail(supabase)(email), // Function to fetch data
    });

    return data;
}
export function useAddOrUpdatePaymentStatus(userId: number) {
    const qc = useQueryClient();
    const supabase = useGetSupabaseClient();

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
                amount: paymentInfo.amount,
            } as Database['public']['Tables']['payment_info']['Insert'];
            const result = paymentInfo.id
                ? await paymentInfoRef.upsert(paymentInfoDbData).select()
                : await paymentInfoRef.insert([paymentInfoDbData], { defaultToNull: false }).select();

            if (result.error) throw new Error(result.error.message);

            qc.refetchQueries({ queryKey: QueryKeys.fetchPersonById(userId.toString()) });
            qc.setQueryData(QueryKeys.fetchPersons, (data: PersonDetails[]) => {
                console.log('Updating payment state for person', userId, paymentInfo.membership_id, result.data[0]);
                return (
                    data?.map((p) => {
                        if (p.person.id === userId) {
                            return {
                                ...p,
                                membership: p.membership?.map((m) => {
                                    if (m.membership.id === paymentInfo.membership_id) {
                                        return {
                                            ...m,
                                            paymentDetails: m.paymentDetails.map((pd) => {
                                                if (pd.payment_detail_id === result.data[0].payment_detail_id) {
                                                    return {
                                                        ...pd,
                                                        payment_state: paymentInfo.paymentState,
                                                    };
                                                }
                                                return pd;
                                            }),
                                        };
                                    }
                                    return m;
                                }),
                            };
                        }
                        return p;
                    }) ?? []
                );
            });
        },
    });
}

export function useCreatePersonMutation() {
    const qc = useQueryClient();
    const supabase = useGetSupabaseClient();

    return useMutation({
        mutationFn: async ({
            person,
            existingPerson,
        }: {
            person: UserFormFields;
            existingPerson?: PersonDetails | null;
        }) => {
            const personRef = supabase.from('person');
            const adressRef = supabase.from('address');
            const personDbData = {
                id: person.personId ?? undefined,
                firstname: person.firstname,
                lastname: person.lastname,
                email: person.email,
                phone_number: person.phoneNumber,
                gender: person.gender,
                birthdate: person.birthdate?.trim().length > 0 ? dayjs(person.birthdate, 'DD/MM/YYYY').format() : null,
            };
            if (!personDbData.id) {
                delete personDbData.id;
            }
            const result = person.personId
                ? await personRef.update(personDbData).eq('id', person.personId).select()
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
            const updatedAdress = {
                id: person.address?.id,
                person_id: result.data[0].id,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                postcode: address.postcode,
                city: address.city,
            };
            if (!updatedAdress.id) {
                delete updatedAdress.id;
            }
            const resultaddress = updatedAdress.id
                ? await adressRef.update(updatedAdress).eq('id', updatedAdress.id!).select()
                : await adressRef
                      .insert([
                          {
                              ...updatedAdress,
                          },
                      ])
                      .select();

            await updateMembership(supabase, personId, person, existingPerson);
            if (resultaddress.error) throw new Error(resultaddress.error.message);

            await qc.invalidateQueries({ queryKey: QueryKeys.fetchPersonBy() });
            await qc.invalidateQueries({ queryKey: QueryKeys.fetchPersons });
        },
    });
}

async function updateMembership(
    supabase: SupabaseClient,
    personId: number,
    personForm: UserFormFields,
    existingPerson?: PersonDetails | null
) {
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
export const changePasswordMutation = () => {
    const supabase = useGetSupabaseClient();

    return useMutation({
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
};
export const loginMutation = () => {
    const qc = useQueryClient();
    const supabase = useGetSupabaseClient();

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
    const supabase = useGetSupabaseClient();
    const { data: user, isFetching: isLoadingUser } = useQuery<supabasejs.User | null>({
        queryKey: QueryKeys.loggedInUser,
        queryFn: async () => {
            console.log('Fetching logged in user');
            const user = await supabase.auth.getUser();
            if (user.error) return null;
            return user.data.user;
        },
    });

    const { data: person, isFetching: isLoadingPerson } = useQuery<LoggedInUser | null>({
        enabled: !!user,
        queryKey: QueryKeys.fetchPersonByUserIdOrEmail(user?.id, user?.email),
        queryFn: async () => {
            if (!user) return null;
            const personDetails = (await fetchPersonByUserIdOrEmail(supabase)(user.id, user.email))!;

            return {
                user: user,
                details: personDetails,
                isAdmin: personDetails?.person?.roles?.includes('admin') ?? false,
                roles: personDetails?.person?.roles ?? [],
            };
        },
    });
    return { person, isLoading: isLoadingUser || isLoadingPerson };
};
export const useLogout = () => {
    const qc = useQueryClient();
    const supabase = useGetSupabaseClient();

    return useMutation({
        mutationFn: async () => {
            await supabase.auth.signOut();
            qc.invalidateQueries({ queryKey: ['logged-in-user'] });
        },
    });
};
