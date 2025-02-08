import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import supabase from "../supabase";
import { ChangePasswordValues, CreateUpdateUserFormFields, LoginFormValues } from "../types/formTypes";
import { Database } from "../types/database.types";
import { LoggedInUser } from "../context/AppContext";
import { PersonDatabase, PersonDetails } from "../types/personTypes";


export const QueryKeys = {
    fetchPersons: ["persons"],
    fetchPersonByEmail: (email: string) => ['person', "email", email]
}

const fetchPersons = async (): Promise<PersonDetails[]> => {
    const { data, error } = await supabase.from('person')
        .select('*, address(*)');
    if (error) throw new Error(error.message);
    return data.map((person) => ({
        person: person,
        address: person.address ? person.address[0] : undefined,
        name: `${person.firstname} ${person.lastname}`
    }))
}

const fetchPersonByEmail = async (email?: string): Promise<Database["public"]["Tables"]["person"]["Row"][]> => {
    const { data, error } = await supabase.from('person')
        .select('*')
        .filter("email", "eq", email);
    if (error) throw new Error(error.message);
    return data
};

const fetchPersonByUserId = async (user_id?: string): Promise<PersonDatabase | null> => {
    const { data, error } = await supabase.from('person')
        .select('*')
        .filter("user_id", "eq", user_id);
    if (error) throw new Error(error.message);
    return data.length > 0 ? data[0] : null
};
export function useGetPersons() {
    const { data } = useSuspenseQuery<PersonDetails[], Error>({
        queryKey: ['persons'], // Unique key for the query
        queryFn: fetchPersons, // Function to fetch data
    });

    return data
}
export function useGetPersonByEmail(email: string) {
    const { data } = useSuspenseQuery<Database["public"]["Tables"]["person"]["Row"][], Error>({
        queryKey: QueryKeys.fetchPersonByEmail(email), // Unique key for the query
        queryFn: () => fetchPersonByEmail(email), // Function to fetch data
    });

    return data
}

export function useCreatePersonMutation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (person: CreateUpdateUserFormFields) => {
            const personRef = supabase.from('person')
            const personDbData = {
                id: person.id,
                firstname: person.firstname,
                lastname: person.lastname,
                email: person.email,
                gender: person.gender,
                birthdate: person.birthdate
            }
            console.log(personDbData)
            const result = person.id ? await personRef
                .upsert(personDbData).select() : await personRef.insert([personDbData]).select();

            if (result.error) throw new Error(result.error.message);

            const address = person.address
            const resultaddress = await supabase
                .from('address')
                .insert([{
                    id: address.id,
                    person_id: result.data[0].id,
                    addressLine1: address.addressLine1,
                    addressLine2: address.addressLine2,
                    postcode: address.postcode,
                    city: address.city
                }]);

            if (resultaddress.error) throw new Error(resultaddress.error.message);

            qc.refetchQueries({ queryKey: QueryKeys.fetchPersons });
        }
    })
}
export const changePasswordMutation = () => useMutation({
    mutationFn: async (data: ChangePasswordValues) => {
        if (data.newPassword !== data.confirmPassword) {
            throw new Error("Passwords do not match");
        }
        const user = await supabase.auth.getUser();
        if (!user) throw new Error("User not logged in");

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.data.user?.email!,
            password: data.currentPassword,
        });
        if (signInError) throw new Error("Current password is incorrect");

        const { error: updateError } = await supabase.auth.updateUser({
            password: data.newPassword,
        });
        if (updateError) throw new Error(updateError.message);
    }
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
            qc.invalidateQueries({ queryKey: ["logged-in-user"] });
        }
    })
}

export const useLoggedInUser = () => {

    return useSuspenseQuery<LoggedInUser | null, any>({
        queryKey: ["logged-in-user"],
        queryFn: async () => {
            const user = await supabase.auth.getUser();
            if (user.error) return null
            console.log(user)
            const personDetail = (await fetchPersonByUserId(user.data.user.id))!!
            return {
                user: user.data.user,
                details: { person: { ...personDetail }, name: `${personDetail?.firstname} ${personDetail?.lastname}` },
                roles: personDetail.roles ?? [],
            }
        }
    }).data
}
export const useLogout = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await supabase.auth.signOut()
            qc.invalidateQueries({ queryKey: ["logged-in-user"] })
        }
    })
}