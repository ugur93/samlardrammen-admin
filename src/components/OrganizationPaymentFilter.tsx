import {
    Box,
    Checkbox,
    Chip,
    FormControl,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    Typography,
} from '@mui/material';
import React, { useMemo } from 'react';
import { useGetOrganizations } from '../api/useOrganizationsApi';
import { useMembersTable } from '../context/MembersTableContext';
import { MembershipDetails } from '../types/personTypes';

interface OrganizationPaymentFilterProps {
    showPaidFilter?: boolean;
}

const OrganizationPaymentFilter: React.FC<OrganizationPaymentFilterProps> = ({ showPaidFilter = true }) => {
    const orgs = useGetOrganizations();
    const { selectedOptions, setSelectedOptions } = useMembersTable();

    // Organization filter
    const orgFilterLabel = 'organization';
    const selectedOrganizations = useMemo(() => {
        return selectedOptions.find((p) => p.label === orgFilterLabel)?.value ?? [];
    }, [selectedOptions, orgFilterLabel]);

    // Payment status filter
    const paymentStatusLabel = 'payment_status';
    const selectedPaymentStatus = useMemo(() => {
        return selectedOptions.find((p) => p.label === paymentStatusLabel)?.value ?? [];
    }, [selectedOptions, paymentStatusLabel]);

    const handleOrganizationChange = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;

        // On autofill we get a stringified value
        const selectedValues = typeof value === 'string' ? value.split(',') : value;

        const updatedOptions = {
            label: orgFilterLabel,
            value: selectedValues,
            filter: (data: any) => {
                if (selectedValues.length === 0) return true;
                return selectedValues.some((orgName) =>
                    data.membership?.some((m) => m.organization.organization.name === orgName)
                );
            },
        };

        setSelectedOptions([...selectedOptions.filter((opt) => opt.label !== orgFilterLabel), updatedOptions]);
    };

    const handlePaymentStatusChange = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;

        const selectedValues = typeof value === 'string' ? value.split(',') : value;

        const updatedOptions = {
            label: paymentStatusLabel,
            value: selectedValues,
            filter: (data: any) => {
                if (selectedValues.length === 0) return true;

                const isPaid = selectedValues.includes('paid');
                const isUnpaid = selectedValues.includes('unpaid');

                if (isPaid && isUnpaid) return true;
                if (!isPaid && !isUnpaid) return true;

                return data.membership?.some((m) => {
                    const currentYearPayment = getCurrentYearPaymentDetail(m);
                    if (!currentYearPayment) return false;

                    const personPayment = m.paymentDetails.find((pd) => pd.payment_detail_id === currentYearPayment.id);

                    if (!personPayment) return isUnpaid;
                    return isPaid ? personPayment.payment_state === 'paid' : personPayment.payment_state !== 'paid';
                });
            },
        };

        setSelectedOptions([...selectedOptions.filter((opt) => opt.label !== paymentStatusLabel), updatedOptions]);
    };

    return (
        <div className="flex flex-row gap-2 p-2">
            <FormControl sx={{ m: 1, width: 300 }}>
                <Typography variant="caption">Organisasjon</Typography>
                <Select
                    multiple
                    size="small"
                    displayEmpty
                    value={selectedOrganizations}
                    onChange={handleOrganizationChange}
                    input={<OutlinedInput />}
                    renderValue={(selected) => {
                        if (selected.length === 0) {
                            return <em>Alle organisasjoner</em>;
                        }
                        return (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        );
                    }}
                >
                    {orgs.map((org) => (
                        <MenuItem key={org.organization.id} value={org.organization.name!}>
                            <Checkbox checked={selectedOrganizations.includes(org.organization.name!)} />
                            <ListItemText primary={org.organization.name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {showPaidFilter && (
                <FormControl sx={{ m: 1, width: 250 }}>
                    <Typography variant="caption">Betalingsstatus</Typography>
                    <Select
                        multiple
                        size="small"
                        displayEmpty
                        value={selectedPaymentStatus}
                        onChange={handlePaymentStatusChange}
                        input={<OutlinedInput />}
                        renderValue={(selected) => {
                            if (selected.length === 0) {
                                return <em>Alle</em>;
                            }
                            return (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value === 'paid' ? 'Betalt' : 'Ikke betalt'} />
                                    ))}
                                </Box>
                            );
                        }}
                    >
                        <MenuItem value="paid">
                            <Checkbox checked={selectedPaymentStatus.includes('paid')} />
                            <ListItemText primary="Betalt" />
                        </MenuItem>
                        <MenuItem value="unpaid">
                            <Checkbox checked={selectedPaymentStatus.includes('unpaid')} />
                            <ListItemText primary="Ikke betalt" />
                        </MenuItem>
                    </Select>
                </FormControl>
            )}
        </div>
    );
};

function getCurrentYearPaymentDetail(membership: MembershipDetails) {
    const currentYear = new Date().getFullYear();
    return membership.organization.paymentDetails.find((p) => p.year === currentYear && p.deleted === false);
}

export default OrganizationPaymentFilter;
