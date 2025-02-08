import { Database } from './database.types';


export type PersonDatabase = Database["public"]["Tables"]["person"]["Row"]
export type AdressDatabase = Database["public"]["Tables"]["address"]["Row"]
export type OrganizationsDatabase = Database["public"]["Tables"]["organization"]["Row"]
export type PaymentDetailDatabase = Database["public"]["Tables"]["payment_detail"]["Row"]

export interface PersonDetails {
    person: PersonDatabase;
    address?: AdressDatabase;
    name: string
}

export interface OrganizationDetails {

    organization: OrganizationsDatabase;
    paymentDetails: PaymentDetailDatabase[]
}