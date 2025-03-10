import { convertDateStringToOnlyDate } from '../utils/dateutils';
import { type OrganizationDetails, type PaymentDetailDatabase, type PersonDetails } from './personTypes';

export interface UserFormFields {
    personId?: number;
    firstname: string;
    lastname: string;
    email: string;
    birthdate: string;
    gender: string;
    phoneNumber: string;
    organizations: number[];

    address: {
        id?: number;
        addressLine1?: string;
        addressLine2?: string;
        postcode?: string;
        city?: string;
    };

    paymenDetails: {
        membership_id: number;
        payment_detail_id: number;
        amount: number;
        payment_date: string;
    }[];
}

export interface CreateOrUpdateUserPaymentDetailsFormFields {
    id?: number;
    membership_id: number;

    payment_detail_id: number;
    amount: number;
    paymentState: 'paid' | 'unpaid';
    payment_date?: string | null;
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

export function mapToFormValues(person?: PersonDetails | null): UserFormFields {
    return {
        personId: person?.person?.id ?? undefined,
        firstname: person?.person?.firstname || '',
        lastname: person?.person?.lastname || '',
        email: person?.person?.email || '',
        birthdate: convertDateStringToOnlyDate(person?.person?.birthdate) || '',
        gender: person?.person?.gender || '',
        phoneNumber: person?.person?.phone_number || '',
        address: {
            id: person?.address?.id ?? undefined,
            addressLine1: person?.address?.addressLine1 || '',
            addressLine2: person?.address?.addressLine2 || '',
            postcode: person?.address?.postcode || '',
            city: person?.address?.city || '',
        },
        organizations:
            person?.membership?.filter((m) => m.membership.is_member).map((c) => c.membership.organization_id!) || [],
        paymenDetails: [],
    };
}

export interface CreateOrUpdateOrganizationFormFields {
    orgId?: number | null;
    editMode?: boolean;
    name: string;
    bank_account_number: string;
    organization_number: string;
}

export interface CreateOrUpdateOrganizationPaymentDetailFormFields {
    id: number | null;
    organization_id: number;
    amount: number;
    late_fee: number;
    deadline: string;
    year: number;
}
export function mapToPaymentDetails(
    organizationId: number,
    paymentDetails?: PaymentDetailDatabase
): CreateOrUpdateOrganizationPaymentDetailFormFields {
    return {
        id: paymentDetails?.id ?? undefined,
        organization_id: organizationId,
        amount: paymentDetails?.amount ?? 0,
        late_fee: paymentDetails?.late_fee ?? 0,
        deadline: paymentDetails?.payment_deadline ?? '',
        year: paymentDetails?.year ?? new Date().getFullYear(),
    };
}

export function mapToOrganizationFormValues(organization?: OrganizationDetails): CreateOrUpdateOrganizationFormFields {
    return {
        orgId: organization?.organization?.id ?? undefined,
        editMode: false,
        name: organization?.organization?.name || '',
        bank_account_number: organization?.organization?.bank_account_number || '',
        organization_number: organization?.organization?.organization_number || '',
    };
}
