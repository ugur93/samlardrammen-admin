import { Database } from './database.types';

export type PersonDatabase = Database['public']['Tables']['person']['Row'];
export type AdressDatabase = Database['public']['Tables']['address']['Row'];
export type OrganizationsDatabase = Database['public']['Tables']['organization']['Row'];
export type PaymentDetailDatabase = Database['public']['Tables']['payment_detail']['Row'];
export type MembershipDatabase = Database['public']['Tables']['membership']['Row'];
export type PaymentInfoDatabase = Database['public']['Tables']['payment_info']['Row'];
export type RelationInfoDatabase = Database['public']['Tables']['person_relation']['Row'];
export type RelationInfoUpdateDatabase = Database['public']['Tables']['person_relation']['Insert'];

type OrganzationResponse = OrganizationsDatabase & {
    payment_detail: PaymentDetailDatabase[];
};
type MembershipResponse = MembershipDatabase & {
    organization: OrganzationResponse | null;
    payment_info: PaymentInfoDatabase[];
};
type PersonResponse = PersonDatabase & {
    membership?: MembershipResponse[];
    address?: AdressDatabase[];
    relations: RelationsResponse[];
};
export type RelationsResponse = RelationInfoDatabase & {
    relatedPerson: PersonDatabase;
};
export interface PersonDetails {
    person: PersonDatabase;
    address?: AdressDatabase;
    membership?: MembershipDetails[];
    membershipRemoved?: MembershipDetails[];
    relations: RelationsResponse[];
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

export function mapPersonResponse(person?: PersonResponse | null): PersonDetails | null {
    if (!person) return null;
    return {
        person: person as PersonDatabase,
        membership: person.membership?.map((membership) => ({
            membership: membership,
            paymentDetails: membership.payment_info,
            organization: {
                organization: membership.organization!,
                paymentDetails: membership.organization!.payment_detail,
            },
        })),
        address: person.address ? person.address[0] : undefined,
        name: `${person.firstname} ${person.lastname}`,
        relations: person.relations,
    };
}
