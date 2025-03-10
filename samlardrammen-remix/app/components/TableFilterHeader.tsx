import {
    Box,
    Checkbox,
    Chip,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    type SelectChangeEvent,
    Typography,
} from '@mui/material';
import React, { useMemo } from 'react';
import { useGetOrganizations } from '../api/useOrganizationsApi';
import { useMembersTable } from '../context/MembersTableContext';
import { type MembershipDetails } from '../types/personTypes';

interface TableFilterHeaderProps {
    className?: string;
}

const TableFilterHeader: React.FC<TableFilterHeaderProps> = ({ className }) => {
    const orgs = useGetOrganizations().filter((d) => d.paymentDetails.some((p) => !p.deleted));
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

    // Gender filter
    const genderLabel = 'gender';
    const selectedGenders = useMemo(() => {
        return selectedOptions.find((p) => p.label === genderLabel)?.value ?? [];
    }, [selectedOptions, genderLabel]);

    // Age filter - paying members (16+)
    const ageLabel = 'age_group';
    const selectedAgeGroups = useMemo(() => {
        return selectedOptions.find((p) => p.label === ageLabel)?.value ?? [];
    }, [selectedOptions, ageLabel]);

    const handleOrganizationChange = (event: SelectChangeEvent<string[]>) => {
        const selectedValues =
            typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

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

        // Apply the organization filter first
        const newOptions = [...selectedOptions.filter((opt) => opt.label !== orgFilterLabel), updatedOptions];
        setSelectedOptions(newOptions);

        // Then update the payment status filter to work with the new org selection
        // Use a slight delay to ensure React has processed the first update
        const paymentStatusValues = selectedOptions.find((opt) => opt.label === paymentStatusLabel)?.value || [];
        if (paymentStatusValues.length > 0) {
            setTimeout(() => {
                updatePaymentStatusFilter(paymentStatusValues, selectedValues);
            }, 10);
        }
    };

    const updatePaymentStatusFilter = (paymentValues: string[], orgValues: string[]) => {
        const updatedOptions = {
            label: paymentStatusLabel,
            value: paymentValues,
            filter: (data: any) => {
                if (paymentValues.length === 0) return true;

                const isPaid = paymentValues.includes('paid');
                const isUnpaid = paymentValues.includes('unpaid');

                if (isPaid && isUnpaid) return true;
                if (!isPaid && !isUnpaid) return true;

                return data.membership?.some((m) => {
                    // Skip organizations that aren't selected when we have org filters
                    if (orgValues.length > 0 && !orgValues.includes(m.organization.organization.name)) {
                        return false;
                    }

                    const currentYearPayment = getCurrentYearPaymentDetail(m);
                    if (!currentYearPayment) return false;

                    const personPayment = m.paymentDetails.find((pd) => pd.payment_detail_id === currentYearPayment.id);

                    if (!personPayment) return isUnpaid;
                    return isPaid ? personPayment.payment_state === 'paid' : personPayment.payment_state !== 'paid';
                });
            },
        };

        setSelectedOptions((prevOptions) => [
            ...prevOptions.filter((opt) => opt.label !== paymentStatusLabel),
            updatedOptions,
        ]);
    };

    const handlePaymentStatusChange = (event: SelectChangeEvent<string[]>) => {
        const selectedValues =
            typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

        // Get current organization values
        const orgValues = selectedOptions.find((opt) => opt.label === orgFilterLabel)?.value || [];

        // Update payment status filter using the helper function
        updatePaymentStatusFilter(selectedValues, orgValues);
    };

    const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const checked = event.target.checked;

        // If "all" is selected, unselect others
        if (value === 'all' && checked) {
            setGenderFilter([]);
            return;
        }

        // Update gender selections
        let currentValues = [...selectedGenders];

        if (checked && !currentValues.includes(value)) {
            currentValues.push(value);
        } else if (!checked && currentValues.includes(value)) {
            currentValues = currentValues.filter((val) => val !== value);
        }

        setGenderFilter(currentValues);
    };

    const handleAgeGroupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const checked = event.target.checked;

        // If "all" is selected, unselect others
        if (value === 'all' && checked) {
            setAgeFilter([]);
            return;
        }

        // Update age group selections
        let currentValues = [...selectedAgeGroups];

        if (checked && !currentValues.includes(value)) {
            currentValues.push(value);
        } else if (!checked && currentValues.includes(value)) {
            currentValues = currentValues.filter((val) => val !== value);
        }

        setAgeFilter(currentValues);
    };

    const setGenderFilter = (values: string[]) => {
        const updatedOptions = {
            label: genderLabel,
            value: values,
            filter: (data: any) => {
                if (values.length === 0) return true;

                if (values.includes('Mann') && data.gender === 'Mann') return true;
                if (values.includes('Kvinne') && data.gender === 'Kvinne') return true;

                return false;
            },
        };

        setSelectedOptions([...selectedOptions.filter((opt) => opt.label !== genderLabel), updatedOptions]);
    };

    const setAgeFilter = (values: string[]) => {
        const updatedOptions = {
            label: ageLabel,
            value: values,
            filter: (data: any) => {
                if (values.length === 0) return true;

                if (values.includes('paying') && Number(data.age) >= 16) return true;
                if (values.includes('non-paying') && Number(data.age) < 16) return true;

                return false;
            },
        };

        setSelectedOptions([...selectedOptions.filter((opt) => opt.label !== ageLabel), updatedOptions]);
    };

    const resetAllFilters = () => {
        setSelectedOptions([]);
    };

    // Helper function to check if a filter is active
    const isAllSelected = (group: string) => {
        const groupValues = group === genderLabel ? selectedGenders : selectedAgeGroups;
        return groupValues.length === 0;
    };

    return (
        <Paper className={`p-2 ${className}`}>
            <Box className="flex flex-wrap gap-4 mb-2">
                <Typography variant="subtitle2">Filtrer medlemmer:</Typography>
                {selectedOptions.length > 0 && (
                    <Chip
                        label="Nullstill alle filtre"
                        onClick={resetAllFilters}
                        variant="outlined"
                        color="primary"
                        size="small"
                    />
                )}
            </Box>

            <Box className="flex flex-wrap gap-3">
                {/* Group 1: Organization and Payment Status */}
                <Box className="flex-1 min-w-[200px]">
                    <FormLabel component="legend" className="text-sm font-medium mb-1">
                        Medlemskap og betaling
                    </FormLabel>
                    <Box className="flex flex-col gap-2">
                        <FormControl fullWidth size="small">
                            <Typography variant="caption">
                                Organisasjon
                                {selectedOrganizations.length > 0 && (
                                    <span className="ml-1 text-blue-500">({selectedOrganizations.length} valgt)</span>
                                )}
                            </Typography>
                            <Select
                                multiple
                                displayEmpty
                                value={selectedOrganizations}
                                onChange={handleOrganizationChange}
                                input={<OutlinedInput margin="dense" />}
                                renderValue={(selected) => {
                                    if (selected.length === 0) {
                                        return <em>Alle organisasjoner</em>;
                                    }
                                    return (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} size="small" />
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

                        <FormControl fullWidth size="small">
                            <Typography variant="caption">
                                Betalingsstatus
                                {selectedOrganizations.length > 0 && (
                                    <span className="ml-1 text-gray-500 text-xs">
                                        (for{' '}
                                        {selectedOrganizations.length === 1
                                            ? 'valgt organisasjon'
                                            : 'valgte organisasjoner'}
                                        )
                                    </span>
                                )}
                            </Typography>
                            <Select
                                multiple
                                displayEmpty
                                value={selectedPaymentStatus}
                                onChange={handlePaymentStatusChange}
                                input={<OutlinedInput margin="dense" />}
                                renderValue={(selected) => {
                                    if (selected.length === 0) {
                                        return <em>Alle</em>;
                                    }
                                    return (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip
                                                    key={value}
                                                    label={value === 'paid' ? 'Betalt' : 'Ikke betalt'}
                                                    size="small"
                                                />
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
                    </Box>
                </Box>

                <Divider orientation="vertical" flexItem />

                {/* Group 2: Gender */}
                <Box className="flex-1 min-w-[150px]">
                    <FormLabel component="legend" className="text-sm font-medium mb-1">
                        Kjønn
                    </FormLabel>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isAllSelected(genderLabel)}
                                    onChange={handleGenderChange}
                                    value="all"
                                    size="small"
                                />
                            }
                            label={<Typography variant="body2">Alle</Typography>}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectedGenders.includes('Mann')}
                                    onChange={handleGenderChange}
                                    value="Mann"
                                    size="small"
                                />
                            }
                            label={<Typography variant="body2">Mann</Typography>}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectedGenders.includes('Kvinne')}
                                    onChange={handleGenderChange}
                                    value="Kvinne"
                                    size="small"
                                />
                            }
                            label={<Typography variant="body2">Kvinne</Typography>}
                        />
                    </FormGroup>
                </Box>

                <Divider orientation="vertical" flexItem />

                {/* Group 3: Age Groups */}
                <Box className="flex-1 min-w-[150px]">
                    <FormLabel component="legend" className="text-sm font-medium mb-1">
                        Aldersgruppe
                    </FormLabel>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isAllSelected(ageLabel)}
                                    onChange={handleAgeGroupChange}
                                    value="all"
                                    size="small"
                                />
                            }
                            label={<Typography variant="body2">Alle</Typography>}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectedAgeGroups.includes('paying')}
                                    onChange={handleAgeGroupChange}
                                    value="paying"
                                    size="small"
                                />
                            }
                            label={<Typography variant="body2">Betalende (16+)</Typography>}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectedAgeGroups.includes('non-paying')}
                                    onChange={handleAgeGroupChange}
                                    value="non-paying"
                                    size="small"
                                />
                            }
                            label={<Typography variant="body2">Barn (under 16)</Typography>}
                        />
                    </FormGroup>
                </Box>
            </Box>
        </Paper>
    );
};

function getCurrentYearPaymentDetail(membership: MembershipDetails) {
    const currentYear = new Date().getFullYear();
    return membership.organization.paymentDetails.find((p) => p.year === currentYear && p.deleted === false);
}

export default TableFilterHeader;
