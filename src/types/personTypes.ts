import { Database } from './database.types';

export type PersonDatabase = Database['public']['Tables']['person']['Row'];
export type AdressDatabase = Database['public']['Tables']['address']['Row'];
export type OrganizationsDatabase = Database['public']['Tables']['organization']['Row'];
export type PaymentDetailDatabase = Database['public']['Tables']['payment_detail']['Row'];
export type MembershipDatabase = Database['public']['Tables']['membership']['Row'];
export type PaymentInfoDatabase = Database['public']['Tables']['payment_info']['Row'];

export interface PersonDetails {
    person: PersonDatabase;
    address?: AdressDatabase;
    membership?: MembershipDetails[];
    membershipRemoved?: MembershipDetails[];
    name: string;
}

export interface MembershipDetails {
    membership: MembershipDatabase;
    organization: OrganizationDetails;
    paymentDetails: PaymentInfoDatabase[];
}

export interface OrganizationDetails {
    organization: OrganizationsDatabase;
    paymentDetails: PaymentDetailDatabase[];
}

export function genderVisningsnavn(gender: PersonDetails): string {
    switch (gender.person.gender) {
        case 'male':
            return 'Mann';
        case 'female':
            return 'Kvinne';
    }
    return 'Ukjent';
}
