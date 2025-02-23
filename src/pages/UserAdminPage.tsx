import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
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
} from '@mui/material';
import TablePaginationActions from '@mui/material/TablePagination/TablePaginationActions';
import TableSortLabel from '@mui/material/TableSortLabel';
import React, { useMemo, useState } from 'react';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useGetOrganizations } from '../api/useOrganizationsApi';
import { useCreatePersonMutation, useGetPersons } from '../api/usePersonsApi';
import { FormDatePicker } from '../components/FormDatePicker';
import { base } from '../context/AppContext';
import { mapToFormValues, UserFormFields } from '../types/formTypes';
import { genderVisningsnavn, MembershipDetails, PersonDetails } from '../types/personTypes';
import { getComparator, Order } from '../types/table.types';
import PageTemplate from './PageTemplate';
interface MembersTableData {
    id: number;
    name: string;
    birthdate: string;
    age: number | string;
    email: string | null;
    gender: string;
    membership: MembershipDetails[] | undefined;
    paid: MembershipDetails[] | undefined;
}
interface HeadCell {
    disablePadding: boolean;
    id: keyof MembersTableData;
    label: string;
    className?: string;
    numeric: boolean;
}
interface FilterOption {
    label: string;
    value: string | FilterOption;
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

const filterOptions: FilterOption[] = [
    {
        label: 'Alle',
        value: 'all',
    },
    {
        label: 'Kvinner',
        value: 'women',
    },
    {
        label: 'Menn',
        value: 'man',
    },
    {
        label: 'Barn under 16',
        value: 'children',
    },
    {
        label: 'Betalt',
        value: 'paid',
    },
];

export default function AdminPage() {
    return (
        <PageTemplate>
            <MembersTable />
        </PageTemplate>
    );
}

export const UserAdminPage: React.FC = () => {
    return (
        <PageTemplate>
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <MembersTable />
            </Box>
        </PageTemplate>
    );
};

const MembersTable: React.FC = () => {
    // React Query to fetch data
    const data = useGetPersons();
    useGetOrganizations();
    const [order, setOrder] = React.useState<Order>('asc');
    const [selectedOptions, setSelectedOptions] = React.useState<FilterOption[]>([{ label: 'Alle', value: 'all' }]);
    const [orderBy, setOrderBy] = React.useState<keyof MembersTableData>('name');
    const [createOrEdit, setCreateOrEdit] = useState<PersonDetails | boolean | undefined>(false);
    const [rowsPerPage, setRowsPerPage] = useState<number>(20);
    const [page, setPage] = useState<number>(0);

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
    const visibleRows = React.useMemo(
        () =>
            [...data.map(mapPersondetailsToTableData)]
                .sort(getComparator(order, orderBy))
                .filter((d) => filterOption(d, selectedOptions))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [order, orderBy, selectedOptions, data, rowsPerPage, page]
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
    function copyMailListToClipboard() {
        const mailList = [...data.map(mapPersondetailsToTableData)]
            .sort(getComparator(order, orderBy))
            .filter((d) => filterOption(d, selectedOptions))
            .map((d) => d.email)
            .join(';');
        navigator.clipboard.writeText(mailList);
    }
    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom color="black">
                Medlemmer
            </Typography>
            <div className="flex justify-between">
                <Button variant="contained" color="primary" onClick={() => setCreateOrEdit(true)} sx={{ mb: 2 }}>
                    Legg til medlem
                </Button>

                <div className="flex flex-row items-center">
                    <Button onClick={copyMailListToClipboard} variant="text">
                        Kopier mailliste
                    </Button>
                    <DenseMenu
                        selectedOptions={selectedOptions}
                        onChange={setSelectedOptions}
                        options={filterOptions}
                    />
                </div>
            </div>

            <Paper>
                <TableContainer component={Paper} sx={{ maxHeight: 840 }}>
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
                            {visibleRows?.map((personDetails) => (
                                <TableRow key={personDetails.id}>
                                    <TableCell className="w-[150px]">
                                        <Link href={`${base}/user/${personDetails.id}`}>{personDetails.name}</Link>
                                    </TableCell>
                                    <TableCell>{personDetails.age}</TableCell>
                                    <TableCell>{personDetails.birthdate}</TableCell>
                                    <TableCell>{personDetails.email}</TableCell>
                                    <TableCell>{personDetails.gender}</TableCell>
                                    <TableCell>
                                        <table>
                                            <tbody>
                                                {personDetails.membership?.map((m) => (
                                                    <tr key={m.organization.organization.id}>
                                                        <td>{m.organization.organization.name}</td>
                                                        <td className="w-[10px]">
                                                            {m.paymentDetails.some((d) => d.payment_state == 'paid') ? (
                                                                <CheckIcon color="primary" />
                                                            ) : (
                                                                <MoneyOffIcon color="error" />
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() =>
                                                setCreateOrEdit(data.find((p) => p.person.id == personDetails.id))
                                            }
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, { label: 'Alle', value: -1 }]}
                    colSpan={7}
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    labelRowsPerPage="Rader per side"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} av ${count}`}
                    page={page}
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

interface CreateUserDialogProps {
    open: boolean;
    person?: PersonDetails;
    onClose: () => void;
}

const CreateOrEditUserDialog: React.FC<CreateUserDialogProps> = ({ open, onClose, person }) => {
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
        setValue,
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
                                pattern: {
                                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                    message: 'Invalid email address',
                                },
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

function DenseMenu({
    options,
    selectedOptions,
    onChange,
}: {
    options: FilterOption[];
    selectedOptions: FilterOption[];
    onChange: (options: FilterOption[]) => void;
}) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);
    const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (option: FilterOption) => {
        const exists = selectedOptions.find((o) => o.label === option.label);
        const updatedOptions = exists
            ? selectedOptions.filter((o) => o.label !== option.label)
            : [...selectedOptions, option].filter((o) => o.value !== 'all');

        onChange(updatedOptions.length === 0 ? [{ label: 'Alle', value: 'all' }] : updatedOptions);
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
                        onClick={() => onChange([{ label: 'Alle', value: 'all' }])}
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

function filterOption(data: MembersTableData, selectedOptions: FilterOption[]) {
    let result = true;
    if (selectedOptions.some((o) => o.value === 'all')) {
        return true;
    }
    if (selectedOptions.some((o) => o.value == 'women')) {
        result = result && data.gender == 'Kvinne';
    }
    if (selectedOptions.some((o) => o.value == 'man')) {
        result = result && data.gender == 'Mann';
    }
    if (selectedOptions.some((o) => o.value == 'children')) {
        result = result && Number(data.age) < 16;
    }
    if (selectedOptions.some((o) => o.value == 'paid')) {
        result = result && data.paid?.length !== 0;
    }
    return result;
}
