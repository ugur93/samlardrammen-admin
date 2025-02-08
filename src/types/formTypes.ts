import { convertDateStringToOnlyDate } from "../utils/dateutils";
import { OrganizationDetails, PersonDetails } from "./personTypes";

export interface CreateUpdateUserFormFields {
    id: number | null;
    firstname: string;
    lastname: string;
    email: string;
    birthdate: string;
    gender: string;
    organizations: [],

    address: {
        id: number | null;
        addressLine1?: string;
        addressLine2?: string;
        postcode?: string;
        city?: string;
    },


}

export interface LoginFormValues {
    email: string;
    password: string;
}

export interface ChangePasswordValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export function mapToFormValues(person?: PersonDetails): CreateUpdateUserFormFields {
    return {
        id: person?.person?.id,
        firstname: person?.person?.firstname || '',
        lastname: person?.person?.lastname || '',
        email: person?.person?.email || '',
        birthdate: convertDateStringToOnlyDate(person?.person?.birthdate) || '',
        gender: person?.person?.gender || '',
        address: {
            id: person?.address?.id,
            addressLine1: person?.address?.addressLine1 || '',
            addressLine2: person?.address?.addressLine2 || '',
            postcode: person?.address?.postcode || '',
            city: person?.address?.city || '',
        },
        organizations: [],
    }
}

export interface CreateOrUpdateOrganizationFormFields {
    id: number | null;
    name: string;
    bank_account_number: string;
    organization_number: string;

}

export interface CreateOrUpdateOrganizationPaymentDetailFormFields {
    id: number | null;
    organization_id: number;
    amount: number;
    deadline: string;
    year: number;

}

export function mapToOrganizationFormValues(organization?: OrganizationDetails): CreateOrUpdateOrganizationFormFields {
    return {
        id: organization?.organization?.id,
        name: organization?.organization?.name || '',
        bank_account_number: organization?.organization?.bank_account_number || '',
        organization_number: organization?.organization?.organization_number || '',
    }
}