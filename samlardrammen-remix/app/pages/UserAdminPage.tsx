import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    IconButton,
    Link,
    List,
    Menu,
    MenuItem,
    MenuList,
    Paper,
    Radio,
    RadioGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import TablePaginationActions from '@mui/material/TablePagination/TablePaginationActions';
import TableSortLabel from '@mui/material/TableSortLabel';
import { format } from 'date-fns';
import React, { Fragment, useMemo, useState } from 'react';
import { Controller, FormProvider, type SubmitHandler, useForm } from 'react-hook-form';

import { useGetOrganizations } from '../api/useOrganizationsApi';
import { useCreatePersonMutation, useGetPersons } from '../api/usePersonsApi';
import CustomListItemText from '../components/CustomListItemText';
import { FormDatePicker } from '../components/FormDatePicker';
import MembershipPaymentRow from '../components/MembershipPaymentRow';
import Searchfield from '../components/Searchfield';
import TableFilterHeader, { orgFilterLabel } from '../components/TableFilterHeader';
import MembersTableProvider, {
    type FilterOption,
    type MembersTableData,
    useMembersTable,
} from '../context/MembersTableContext';
import { type UserFormFields, mapToFormValues } from '../types/formTypes';
import { type MembershipDetails, type PersonDetails, genderVisningsnavn } from '../types/personTypes';

interface HeadCell {
    disablePadding: boolean;
    id: keyof MembersTableData;
    label: string;
    className?: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'name',
        numeric: false,
        disablePadding: true,
        label: 'Navn',
    },
    {
        id: 'age',
        numeric: false,
        disablePadding: false,
        label: 'Alder',
    },
    {
        id: 'birthdate',
        numeric: false,
        disablePadding: false,
        label: 'Fødsesldato',
    },
    {
        id: 'email',
        numeric: false,
        disablePadding: false,
        label: 'Email',
    },
    {
        id: 'gender',
        numeric: false,
        disablePadding: false,
        label: 'Kjønn',
    },
    {
        id: 'membership',
        numeric: false,
        disablePadding: false,
        label: 'Medlemskap',
        className: 'w-[300px]',
    },
];
const headCellsMobile: readonly HeadCell[] = [
    {
        id: 'name',
        numeric: false,
        disablePadding: true,
        label: 'Navn',
    },
    {
        id: 'age',
        numeric: false,
        disablePadding: false,
        label: 'Alder',
    },
    {
        id: 'email',
        numeric: false,
        disablePadding: false,
        label: 'Email',
    },
];

export const UserAdminPage: React.FC = () => {
    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <MembersTableProvider>
                <React.Suspense>
                    <MembersTable />
                </React.Suspense>
            </MembersTableProvider>
        </Box>
    );
};

const MembersTable: React.FC = () => {
    // React Query to fetch data
    const data = useGetPersons();
    useGetOrganizations();
    const { page, rowsPerPage, filteredRows, handleChangeRowsPerPage, setPage, setSearchTerm, selectedOptions } =
        useMembersTable();
    const [createOrEdit, setCreateOrEdit] = useState<PersonDetails | boolean | undefined>(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    function mapPersondetailsToTableData(personDetails: PersonDetails): MembersTableData {
        return {
            id: personDetails.person.id,
            name: `${personDetails.person.firstname} ${personDetails.person.lastname}`,
            birthdate: personDetails.person.birthdate
                ? format(new Date(personDetails.person.birthdate), 'dd/MM/yyyy')
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

    function copyMailListToClipboard() {
        const mailList = filteredRows.map((d) => d.email).join(';');
        navigator.clipboard.writeText(mailList);
    }

    // Export to CSV function
    function exportToCsv() {
        // Get the organization filter if it exists
        const organizationFilter = selectedOptions.find((option) => option.label == orgFilterLabel);

        // Create CSV data
        const csvData = filteredRows.map((row) => {
            // Get filtered memberships for this person
            const memberships = row.membership || [];
            let filteredMemberships = memberships;

            if (organizationFilter && organizationFilter.value.length > 0) {
                filteredMemberships =
                    memberships?.filter((m) => organizationFilter.value.includes(m.organization.organization.name)) ||
                    [];
            }

            // Create payment status string for each membership
            // Each organization status on a new line for better readability in Excel/spreadsheets
            const membershipStatus = filteredMemberships
                .map((m) => {
                    const orgName = m.organization.organization.name || '';
                    const isPaid = m.paymentDetails.some((p) => p.payment_state === 'paid');
                    return `${orgName}: ${isPaid ? 'Betalt' : 'Ikke betalt'}`;
                })
                .join('\n'); // Use newlines to separate organizations in the CSV cell

            // Return CSV row, replacing null/undefined with empty strings
            return {
                name: row.name || '',
                email: row.email || '',
                paymentStatus: membershipStatus || '',
            };
        });

        // Create CSV header
        const csvHeader = 'Navn;Email;Betalingsstatus\n';

        // Create CSV content
        // We need to properly escape fields, especially those with newlines
        const csvContent = csvData
            .map((row) => {
                // Escape fields properly for CSV format
                // For fields containing newlines, quotes, or commas, wrap in quotes and escape internal quotes
                const escapeCsvField = (field: string) => {
                    // Replace any double quotes with two double quotes (CSV escaping)
                    const escaped = field.replace(/"/g, '""');
                    // Always wrap in quotes to handle potential commas and newlines
                    return `"${escaped}"`;
                };

                return [escapeCsvField(row.name), escapeCsvField(row.email), escapeCsvField(row.paymentStatus)].join(
                    ';'
                );
            })
            .join('\n');

        // Create and download file
        const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `medlemsliste-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom color="black">
                Medlemmer
            </Typography>
            <Box className="pb-2 text-black flex flex-row gap-4">
                <Box className="flex flex-row gap-2 items-center">
                    <Typography fontSize={12} variant="subtitle1">
                        Antall medlemmer:
                    </Typography>
                    <Typography fontSize={12} variant="body1">
                        {data.length}
                    </Typography>
                </Box>
                <Box className="flex flex-row gap-2 items-center">
                    <Typography fontSize={12} variant="subtitle1">
                        Antall betalende:
                    </Typography>
                    <Typography fontSize={12} variant="body1">
                        {data.map(mapPersondetailsToTableData).filter((d) => d.age >= 16).length}
                    </Typography>
                </Box>
            </Box>
            <div>
                <div className="flex justify-between">
                    <Button variant="contained" color="primary" onClick={() => setCreateOrEdit(true)} sx={{ mb: 2 }}>
                        Legg til medlem
                    </Button>

                    <div className="flex flex-row items-center gap-2">
                        <Button onClick={copyMailListToClipboard} variant="text">
                            Kopier mailliste
                        </Button>
                        <Button onClick={exportToCsv} variant="outlined" startIcon={<DownloadIcon />}>
                            Last ned CSV
                        </Button>
                    </div>
                </div>
            </div>
            <Paper>
                <Searchfield onChange={setSearchTerm} size="small" />

                <TableContainer component={Paper} sx={{ maxHeight: isMobile ? '65vh' : 840 }}>
                    <TableFilterMenu />
                    {isMobile ? (
                        <TableMobile setCreateOrEdit={setCreateOrEdit} />
                    ) : (
                        <TableDesktop setCreateOrEdit={setCreateOrEdit} />
                    )}
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={isMobile ? [] : [10, 20, 50, { label: 'Alle', value: -1 }]}
                    count={filteredRows.length}
                    component="div"
                    rowsPerPage={rowsPerPage}
                    labelRowsPerPage="Rader per side"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} av ${count}`}
                    page={page}
                    showFirstButton
                    showLastButton
                    slotProps={{
                        select: {
                            inputProps: {
                                'aria-label': 'rows per page',
                            },
                            native: true,
                        },
                    }}
                    onPageChange={(e, page) => setPage(page)}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                />
            </Paper>
            <Dialog open={createOrEdit !== false} keepMounted onClose={() => setCreateOrEdit(false)}>
                <React.Suspense>
                    {createOrEdit !== false && (
                        <CreateOrEditUserDialog
                            person={createOrEdit as PersonDetails}
                            onClose={() => setCreateOrEdit(false)}
                        />
                    )}
                </React.Suspense>
            </Dialog>
        </Container>
    );
};

interface TableProps {
    setCreateOrEdit: (PersonDetails: PersonDetails | boolean | undefined) => void;
}
function TableMobile({ setCreateOrEdit }: TableProps) {
    const data = useGetPersons();
    const { visibleRows: rows, order, orderBy, createSortHandler, selectedOptions } = useMembersTable();

    // Filter organizations based on selected filters
    const getFilteredMemberships = (membership: MembershipDetails[]) => {
        const organizationFilter = selectedOptions.find((option) => option.label == orgFilterLabel);
        // If "All" is selected, show all memberships
        if (organizationFilter == null || organizationFilter.value.length === 0) {
            return membership;
        }

        return membership?.filter((m) => organizationFilter.value.includes(m.organization.organization.name));
    };

    return (
        <Table stickyHeader size="small" padding="normal" className="!w-[300px]">
            <TableHead>
                <TableRow>
                    {headCellsMobile.map((headCell) => (
                        <TableCell key={headCell.id} size="small">
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                className={headCell.className}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {rows?.map((personDetails) => (
                    <Fragment key={personDetails.id + '-' + personDetails.name}>
                        <TableRow>
                            <TableCell>
                                <Link href={`user/${personDetails.id}`}>{personDetails.name}</Link>
                            </TableCell>
                            <TableCell>{personDetails.age}</TableCell>
                            <TableCell className="w-[100px]">{personDetails.email}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={3}>
                                <Box sx={{ margin: 1 }}>
                                    <List dense disablePadding>
                                        <CustomListItemText
                                            primary={'Fødselsdato'}
                                            secondary={personDetails.birthdate}
                                        />
                                        <CustomListItemText primary={'Kjønn'} secondary={personDetails.gender} />

                                        <div className="flex flex-col gap-2 w-fit">
                                            <Typography variant="subtitle1">Medlemskap/betaling</Typography>
                                            {getFilteredMemberships(personDetails.membership)?.map((m) => (
                                                <MembershipPaymentRow
                                                    key={m.organization.organization.id}
                                                    membership={m}
                                                    personId={personDetails.id}
                                                />
                                            ))}
                                        </div>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<EditIcon />}
                                            onClick={() =>
                                                setCreateOrEdit(data.find((p) => p.person.id == personDetails.id))
                                            }
                                        >
                                            Rediger
                                        </Button>
                                    </List>
                                </Box>
                            </TableCell>
                        </TableRow>
                    </Fragment>
                ))}
            </TableBody>
        </Table>
    );
}
function TableDesktop({ setCreateOrEdit }: TableProps) {
    const data = useGetPersons();
    const { visibleRows: rows, order, orderBy, createSortHandler, selectedOptions } = useMembersTable();

    // Filter organizations based on selected filters
    const getFilteredMemberships = (membership: MembershipDetails[]) => {
        const organizationFilter = selectedOptions.find((option) => option.label == orgFilterLabel);
        // If "All" is selected, show all memberships
        if (organizationFilter == null || organizationFilter.value.length === 0) {
            return membership;
        }

        return membership?.filter((m) => organizationFilter.value.includes(m.organization.organization.name));
    };

    return (
        <Table stickyHeader size="small">
            <TableHead>
                <TableRow>
                    {headCells.map((headCell) => (
                        <TableCell key={headCell.id}>
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                className={headCell.className}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                            </TableSortLabel>
                        </TableCell>
                    ))}

                    <TableCell></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows?.map((personDetails) => (
                    <TableRow key={'desktop' + '-' + personDetails.id}>
                        <TableCell className="w-[150px]">
                            <Link href={`/user/${personDetails.id}`}>{personDetails.name}</Link>
                        </TableCell>
                        <TableCell>{personDetails.age}</TableCell>
                        <TableCell>{personDetails.birthdate}</TableCell>
                        <TableCell>{personDetails.email}</TableCell>
                        <TableCell>{personDetails.gender}</TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-2">
                                {getFilteredMemberships(personDetails.membership)?.map((m) => (
                                    <MembershipPaymentRow
                                        key={m.organization.organization.id}
                                        membership={m}
                                        personId={personDetails.id}
                                    />
                                ))}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => setCreateOrEdit(data.find((p) => p.person.id == personDetails.id))}
                            >
                                Rediger
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

interface CreateUserDialogProps {
    person?: PersonDetails;
    onClose: () => void;
}

const CreateOrEditUserDialog: React.FC<CreateUserDialogProps> = ({ onClose, person }) => {
    const orgs = useGetOrganizations();
    const organizationsList = useMemo(
        () =>
            orgs.map((org) => ({
                id: org.organization.id,
                name: org.organization.name,
            })),
        []
    );

    const createPersonFn = useCreatePersonMutation();
    const methods = useForm<UserFormFields>({
        defaultValues: mapToFormValues(person),
    });
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        control,
        watch,
    } = methods;

    const onSubmit: SubmitHandler<UserFormFields> = async (data) => {
        console.log('SUBMITTING', data);
        createPersonFn.mutate({ person: data, existingPerson: person });
        onClose();
        reset();
    };
    const organizations = watch('organizations');

    return (
        <>
            <DialogTitle>{person ? 'Oppdater medlem' : 'Legg til medlem'} </DialogTitle>
            <DialogContent>
                <FormProvider {...methods}>
                    <form id="create-user-form" onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            margin="dense"
                            label="Fornavn"
                            fullWidth
                            {...register('firstname', { required: 'Navn er påkrevd' })}
                            error={Boolean(errors.firstname)}
                            helperText={errors.firstname?.message}
                        />
                        <TextField
                            margin="dense"
                            label="Etternavn"
                            fullWidth
                            {...register('lastname', { required: 'Etternavn er påkrevd' })}
                            error={Boolean(errors.lastname)}
                            helperText={errors.lastname?.message}
                        />
                        <TextField
                            margin="dense"
                            label="Telefonnummer"
                            fullWidth
                            {...register('phoneNumber')}
                            error={Boolean(errors.phoneNumber)}
                            helperText={errors.phoneNumber?.message}
                        />
                        <TextField
                            margin="dense"
                            label="Email"
                            fullWidth
                            {...register('email', {
                                // pattern: {
                                //     value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                //     message: 'Invalid email address',
                                // },
                            })}
                            error={Boolean(errors.email)}
                            helperText={errors.email?.message}
                        />
                        <FormDatePicker name="birthdate" label="Fødselsdato" />
                        <div>
                            <FormControl
                                component="fieldset"
                                margin="dense"
                                sx={{ mt: 2 }}
                                error={Boolean(errors.gender)}
                            >
                                <FormLabel component="legend">Kjønn</FormLabel>
                                <Controller
                                    rules={{ required: true }}
                                    control={control}
                                    name="gender"
                                    render={({ field }) => (
                                        <RadioGroup row {...field}>
                                            <FormControlLabel value="male" control={<Radio />} label="Mann" />
                                            <FormControlLabel value="female" control={<Radio />} label="Kvinne" />
                                        </RadioGroup>
                                    )}
                                />
                                {errors.gender && <p style={{ color: 'red' }}>{errors.gender.message}</p>}
                            </FormControl>
                        </div>
                        <FormControl fullWidth margin="dense" className="mb-4">
                            <FormLabel component="legend">Medlemskap</FormLabel>

                            <TableContainer>
                                <Table size={'small'}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className="w-[55px]">Medlem</TableCell>
                                            <TableCell>Organisasjon</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {organizationsList.map((org) => (
                                            <TableRow key={org.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        {...register(`organizations`)}
                                                        value={org.id}
                                                        defaultChecked={organizations.includes(org.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>{org.name}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </FormControl>
                        <FormLabel component="legend">Addresse (valgfri)</FormLabel>
                        <Box>
                            <TextField
                                margin="dense"
                                label="Addresselinje 1"
                                fullWidth
                                {...register('address.addressLine1')}
                            />
                            <TextField
                                margin="dense"
                                label="Addresselinje 2"
                                fullWidth
                                {...register('address.addressLine2')}
                            />
                            <TextField margin="dense" label="Postkode" fullWidth {...register('address.postcode')} />
                            <TextField margin="dense" label="By" fullWidth {...register('address.city')} />
                        </Box>
                    </form>
                </FormProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Avbryt</Button>
                <Button form="create-user-form" type="submit" variant="contained">
                    {person ? 'Oppdater' : 'Opprett'}
                </Button>
            </DialogActions>
        </>
    );
};

function DenseMenu({ options }: { options: FilterOption[] }) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const { selectedOptions, setSelectedOptions } = useMembersTable();
    const open = Boolean(anchorEl);
    const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (option: FilterOption) => {
        const exists = selectedOptions.find((o) => o.label === option.label);
        const updatedOptions = exists
            ? selectedOptions.filter((o) => o.label !== option.label)
            : [...selectedOptions, option].filter((o) => o.value !== 'all');

        setSelectedOptions(updatedOptions.length === 0 ? [{ label: 'Alle', value: 'all' }] : updatedOptions);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <div>
            <IconButton onClick={handleClickListItem}>
                <FilterListIcon />
            </IconButton>
            <Menu
                id="lock-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'lock-button',
                    role: 'listbox',
                }}
            >
                <MenuList dense>
                    <MenuItem
                        key={'all'}
                        className="flex items-center"
                        onClick={() => setSelectedOptions([{ label: 'Alle', value: 'all' }])}
                    >
                        Reset
                    </MenuItem>
                    {options
                        .filter((d) => d.value !== 'all')
                        .map((option) => (
                            <MenuItem
                                key={option.label}
                                className="flex items-center"
                                selected={selectedOptions.some((o) => o.label === option.label)}
                                onClick={() => handleMenuItemClick(option)}
                            >
                                <Checkbox checked={selectedOptions.some((o) => o.label === option.label)}></Checkbox>
                                {option.label}
                            </MenuItem>
                        ))}
                </MenuList>
            </Menu>
        </div>
    );
}

function TableFilterMenu() {
    return <TableFilterHeader className="mb-3" />;
}
