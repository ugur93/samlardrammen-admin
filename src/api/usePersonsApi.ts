import { User } from '@supabase/supabase-js';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { LoggedInUser } from '../context/AppContext';
import supabase from '../supabase';
import { Database } from '../types/database.types';
import {
    ChangePasswordValues,
    CreateOrUpdateUserPaymentDetailsFormFields,
    LoginFormValues,
    UserFormFields,
} from '../types/formTypes';
import { mapPersonResponse, PersonDatabase, PersonDetails } from '../types/personTypes';

const personQUery =
    '*, address(*), membership(*, payment_info(*), organization(*, payment_detail(*))), relations:person_relation!person_id(*, relatedPerson:person!person_related_id(*))';
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
    const { data, error } = await supabase.from('person').select('*');
    if (error) throw new Error(error.message);
    return data;
};
const fetchPersons = async (): Promise<PersonDetails[]> => {
    const { data, error } = await supabase.from('person').select(personQUery);
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
                relations: person.relations,
            }) as PersonDetails
    );
};

const fetchPersonByEmail = async (email?: string): Promise<PersonDetails | null> => {
    const { data: person, error } = await supabase.from('person').select(personQUery).eq('email', email!).single();
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
        .select(personQUery)
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
    const { data } = useSuspenseQuery<PersonDetails[], Error>({
        queryKey: QueryKeys.fetchPersons, // Unique key for the query
        queryFn: fetchPersons, // Function to fetch data
    });

    return data;
}

export function useGetPersonById(id?: string) {
    const { data } = useSuspenseQuery<PersonDetails | null, Error>({
        queryKey: QueryKeys.fetchPersonById(id?.toString()), // Unique key for the query
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
                amount: paymentInfo.amount,
            } as Database['public']['Tables']['payment_info']['Insert'];
            const result = paymentInfo.id
                ? await paymentInfoRef.upsert(paymentInfoDbData).select()
                : await paymentInfoRef.insert([paymentInfoDbData], { defaultToNull: false }).select();

            if (result.error) throw new Error(result.error.message);

            qc.refetchQueries({ queryKey: QueryKeys.fetchPersonById(userId.toString()) });
            qc.setQueryData(QueryKeys.fetchPersons, (data: PersonDetails[]) => {
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

            await updateMembership(personId, person, existingPerson);
            if (resultaddress.error) throw new Error(resultaddress.error.message);

            await qc.resetQueries({ queryKey: QueryKeys.fetchPersonBy() });
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
    const user = useSuspenseQuery<User | null>({
        queryKey: QueryKeys.loggedInUser,
        queryFn: async () => {
            console.log('Fetching logged in user');
            const user = await supabase.auth.getUser();
            if (user.error) return null;
            return user.data.user;
        },
    }).data;

    return useSuspenseQuery<LoggedInUser | null>({
        queryKey: QueryKeys.fetchPersonByUserIdOrEmail(user?.id, user?.email),
        queryFn: async () => {
            if (!user) return null;
            const personDetails = (await fetchPersonByUserIdOrEmail(user.id, user.email))!;

            return {
                user: user,
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
