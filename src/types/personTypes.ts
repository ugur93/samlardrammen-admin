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
