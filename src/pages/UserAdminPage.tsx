import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    IconButton,
    InputLabel,
    Link,
    MenuItem,
    OutlinedInput,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { useGetAllUsers } from '../api/useAdminApi';
import { useGetOrganizations } from '../api/useOrganizationsApi';
import { useCreatePersonMutation, useGetPersons } from '../api/usePersonsApi';
import { mapToFormValues, UserFormFields } from '../types/formTypes';
import { genderVisningsnavn, PersonDetails } from '../types/personTypes';
import { isStringEmpty } from '../utils/stringutils';
import PageTemplate from './PageTemplate';
export default function AdminPage() {
    return (
        <PageTemplate>
            <MembersTable />
        </PageTemplate>
    );
}

type UseradminTabs = 'members' | 'users';
export const UserAdminPage: React.FC = () => {
    const [tab, setTab] = React.useState<UseradminTabs>();

    const handleChange = (event: React.SyntheticEvent, newValue: UseradminTabs) => {
        setTab(newValue);
    };
    return (
        <PageTemplate>
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {/* <Tabs value={tab} onChange={handleChange} centered>
        <Tab value={"users"} label="Uyeler" />
        <Tab value="members" label="Kunlanicilar" />
      </Tabs>
      {tab === "members" && <MembersTable />}
      {tab === "users" && <UsersTable />} */}
                <MembersTable />
            </Box>
        </PageTemplate>
    );
};
// Type Definition for Person

const UsersTable: React.FC = () => {
    const users = useGetAllUsers();

    console.log(users);

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom color="black">
                Kullanıcılar
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.email}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

const MembersTable: React.FC = () => {
    // React Query to fetch data
    const data = useGetPersons();
    const createPersonFn = useCreatePersonMutation();
    const [editableRow, setEditableRow] = useState<`users.${number}` | undefined>(undefined);

    const [createOrEdit, setCreateOrEdit] = useState<PersonDetails | boolean>(false);

    const methods = useForm<{ users: UserFormFields[] }>({
        defaultValues: {
            users: data.map(mapToFormValues),
        },
    });
    const { reset, control, setError, getValues } = methods;
    const fields = useFieldArray({ name: 'users', control });
    const onSubmit = async (index: number) => {
        const data = getValues(`users.${index}`);

        if (isStringEmpty(data.firstname)) {
            setError(`users.${index}.firstname`, { message: 'Feltet er påkrevd' });
            return;
        }
        createPersonFn.mutate(data);
        setEditableRow(undefined);
    };
    useEffect(() => {
        reset({ users: data.map(mapToFormValues) });
    }, [data]);

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom color="black">
                Uyeler
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setCreateOrEdit(true)} sx={{ mb: 2 }}>
                Opprett bruker
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Navn</TableCell>
                            <TableCell>Alder</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Kjønn</TableCell>
                            <TableCell>Medlemskap</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.map((personDetails) => (
                            <TableRow key={personDetails.person.id}>
                                <TableCell>
                                    <Link href={`/user/${personDetails.person.id}`}>
                                        {personDetails.person.firstname} {personDetails.person.lastname}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {personDetails.person.birthdate
                                        ? new Date(personDetails.person.birthdate).toLocaleDateString()
                                        : '-'}
                                </TableCell>
                                <TableCell>{personDetails.person.email}</TableCell>
                                <TableCell>{genderVisningsnavn(personDetails)}</TableCell>
                                <TableCell>
                                    {personDetails.membership?.map((d) => d.organization.organization.name).join(', ')}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => setCreateOrEdit(personDetails)}>
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {createOrEdit != false && (
                <CreateOrEditUserDialog
                    open
                    person={typeof createOrEdit == 'object' ? createOrEdit : undefined}
                    onClose={() => setCreateOrEdit(false)}
                    refetch={() => null}
                />
            )}
        </Container>
    );
};

interface CreateUserDialogProps {
    open: boolean;
    person?: PersonDetails;
    onClose: () => void;
    refetch: () => void;
}

const CreateOrEditUserDialog: React.FC<CreateUserDialogProps> = ({ open, onClose, person }) => {
    const organizationsList = useGetOrganizations().map((org) => ({
        id: org.organization.id,
        name: org.organization.name,
    }));

    const createPersonFn = useCreatePersonMutation();
    console.log(person);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        control,
        getValues,
        watch,
    } = useForm<UserFormFields>({
        defaultValues: mapToFormValues(person),
    });

    const onSubmit: SubmitHandler<UserFormFields> = async (data) => {
        console.log('SUBMITTING', data);
        createPersonFn.mutate(data);
        onClose();
        reset();
    };
    const organizations = watch('organizations');

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Yeni üye ekle</DialogTitle>
            <DialogContent>
                <form id="create-user-form" onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        margin="dense"
                        label="İsim"
                        fullWidth
                        {...register('firstname', { required: 'İsim yazılması lazım' })}
                        error={Boolean(errors.firstname)}
                        helperText={errors.firstname?.message}
                    />
                    <TextField
                        margin="dense"
                        label="Soy isim"
                        fullWidth
                        {...register('lastname', { required: 'Last name is required' })}
                        error={Boolean(errors.lastname)}
                        helperText={errors.lastname?.message}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        fullWidth
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                message: 'Invalid email address',
                            },
                        })}
                        error={Boolean(errors.email)}
                        helperText={errors.email?.message}
                    />
                    <TextField
                        margin="dense"
                        label="Doğum Tarihi"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        {...register('birthdate', { required: 'Birthdate is required' })}
                        error={Boolean(errors.birthdate)}
                        helperText={errors.birthdate?.message}
                    />
                    <FormControl component="fieldset" margin="dense" sx={{ mt: 2 }} error={Boolean(errors.gender)}>
                        <FormLabel component="legend">Cinsiyet</FormLabel>
                        <Controller
                            rules={{ required: true }}
                            control={control}
                            name="gender"
                            render={({ field }) => (
                                <RadioGroup row {...field}>
                                    <FormControlLabel value="male" control={<Radio />} label="Erker" />
                                    <FormControlLabel value="female" control={<Radio />} label="Kadin" />
                                </RadioGroup>
                            )}
                        />
                        {errors.gender && <p style={{ color: 'red' }}>{errors.gender.message}</p>}
                    </FormControl>
                    <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
                        <InputLabel id="organizations-label">Organizations</InputLabel>
                        <Controller
                            control={control}
                            name="organizations"
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    labelId="organizations-label"
                                    multiple
                                    value={organizations}
                                    input={<OutlinedInput label="Organizations" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {(selected as number[])?.map((value) => {
                                                const org = organizationsList.find((org) => org.id === value);
                                                return <Chip key={value} label={org?.name || value} />;
                                            })}
                                        </Box>
                                    )}
                                >
                                    {organizationsList.map((org) => (
                                        <MenuItem key={org.id} value={org.id}>
                                            {org.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>
                    <FormLabel component="legend">Ev addressi (opsiyonel)</FormLabel>
                    <Box>
                        <TextField margin="dense" label="Address 1" fullWidth {...register('address.addressLine1')} />
                        <TextField margin="dense" label="Address 2" fullWidth {...register('address.addressLine2')} />
                        <TextField margin="dense" label="Posta kodu" fullWidth {...register('address.postcode')} />
                        <TextField margin="dense" label="Şehir" fullWidth {...register('address.city')} />
                    </Box>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Avbryt</Button>
                <Button form="create-user-form" type="submit" variant="contained">
                    {person ? 'Oppdater' : 'Opprett'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
