import React, { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useGetOrganizations } from '../api/useOrganizationsApi';
import { useGetPersons } from '../api/usePersonsApi';
import { genderVisningsnavn, type MembershipDetails, type PersonDetails } from '../types/personTypes';
import { getComparator, type Order } from '../types/table.types';
export interface FilterOption {
    label: string;
    value: any;
    filter?: (data: MembersTableData) => boolean;
}
export interface MembersTableData {
    id: number;
    name: string;
    birthdate: string;
    age: number | string;
    email: string | null;
    gender: string;
    membership: MembershipDetails[] | undefined;
    paid: MembershipDetails[] | undefined;
}
type MembersTableProps = {
    page: number;
    orderBy: keyof MembersTableData;
    selectedOptions: FilterOption[];
    order: Order;
    filteredRows: MembersTableData[];
    visibleRows: MembersTableData[];
    createSortHandler: (property: keyof MembersTableData) => (event: React.MouseEvent<unknown>) => void;
    handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    rowsPerPage: number;
    setSelectedOptions: React.Dispatch<React.SetStateAction<FilterOption[]>>;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    searchTerm: string | undefined;
    setSearchTerm: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const MembersTableContext = createContext<MembersTableProps>({} as MembersTableProps);
export default function MembersTableProvider({ children }: PropsWithChildren<unknown>) {
    const data = useGetPersons();
    useGetOrganizations();
    const [order, setOrder] = React.useState<Order>('asc');
    const [selectedOptions, setSelectedOptions] = React.useState<FilterOption[]>([]);
    const [orderBy, setOrderBy] = React.useState<keyof MembersTableData>('name');
    const [rowsPerPage, setRowsPerPage] = useState<number>(30);
    const [page, setPage] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>();

    function mapPersondetailsToTableData(personDetails: PersonDetails): MembersTableData {
        return {
            id: personDetails.person.id,
            name: `${personDetails.person.firstname} ${personDetails.person.lastname}`,
            birthdate: personDetails.person.birthdate
                ? new Date(personDetails.person.birthdate).toLocaleDateString()
                : '-',
            age: personDetails.person.birthdate
                ? new Date().getFullYear() - new Date(personDetails.person.birthdate).getFullYear()
                : '-',
            email: personDetails.person.email,
            gender: genderVisningsnavn(personDetails),
            membership: personDetails.membership,
            paid:
                personDetails.membership?.filter((m) => m.paymentDetails.some((d) => d.payment_state == 'paid')) || [],
        };
    }
    function toSearchValue(data: MembersTableData) {
        return data.email?.toLocaleLowerCase() + data.name?.toLocaleLowerCase();
    }
    const filteredRows = useMemo(() => {
        return data.map(mapPersondetailsToTableData).filter((d) => filterOption(d, selectedOptions));
    }, [selectedOptions, data]);
    const visibleRows = useMemo(
        () =>
            filteredRows
                .sort(getComparator(order, orderBy))
                .filter((d) => {
                    return searchTerm && searchTerm.trim().length > 0
                        ? toSearchValue(d).includes(searchTerm.toLowerCase())
                        : true;
                })
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [order, orderBy, selectedOptions, data, rowsPerPage, page, searchTerm]
    );
    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof MembersTableData) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };
    const createSortHandler = (property: keyof MembersTableData) => (event: React.MouseEvent<unknown>) => {
        handleRequestSort(event, property);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    function filterOption(data: MembersTableData, selectedOptions: FilterOption[]) {
        let result = true;
        if (selectedOptions.length == 0) {
            return true;
        }
        selectedOptions.forEach((option) => {
            if (option.filter) {
                result = result && option.filter(data);
            }
        });
        return result;
    }

    return (
        <MembersTableContext.Provider
            value={{
                filteredRows,
                order,
                orderBy,
                selectedOptions,
                page,
                rowsPerPage,
                visibleRows,
                searchTerm,
                setSearchTerm,
                createSortHandler,
                handleChangeRowsPerPage,
                setSelectedOptions,
                setPage,
            }}
        >
            {children}
        </MembersTableContext.Provider>
    );
}
export const useMembersTable = () => useContext(MembersTableContext);
