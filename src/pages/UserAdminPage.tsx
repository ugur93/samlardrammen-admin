import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    Checkbox,
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
    ListItemText,
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
import React, { useState } from 'react';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useGetOrganizations } from '../api/useOrganizationsApi';
import { useCreatePersonMutation, useGetPersons } from '../api/usePersonsApi';
import { FormDatePicker } from '../components/FormDatePicker';
import { base } from '../context/AppContext';
import { mapToFormValues, UserFormFields } from '../types/formTypes';
import { genderVisningsnavn, PersonDetails } from '../types/personTypes';
import PageTemplate from './PageTemplate';
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
    const [createOrEdit, setCreateOrEdit] = useState<PersonDetails | boolean>(false);

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom color="black">
                Medlemmer
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setCreateOrEdit(true)} sx={{ mb: 2 }}>
                Legg til medlem
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
                                    <Link href={`${base}/user/${personDetails.person.id}`}>
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
        <Dialog open={open} onClose={onClose}>
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
                                required: 'Email er påkrevd',
                                pattern: {
                                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                    message: 'Invalid email address',
                                },
                            })}
                            error={Boolean(errors.email)}
                            helperText={errors.email?.message}
                        />
                        <FormDatePicker name="birthdate" />
                        <FormControl component="fieldset" margin="dense" sx={{ mt: 2 }} error={Boolean(errors.gender)}>
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
                        <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
                            <InputLabel id="organizations-label">Medlemskap</InputLabel>
                            <Controller
                                control={control}
                                name="organizations"
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        labelId="organizations-label"
                                        multiple
                                        value={organizations}
                                        input={<OutlinedInput label="Medlemskap" />}
                                        renderValue={(organization) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {organization?.map((value) => {
                                                    const org = organizationsList.find((org) => org.id === value);
                                                    return <Chip key={value} label={org?.name || value} />;
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {organizationsList.map((org) => (
                                            <MenuItem key={org.id} value={org.id}>
                                                <Checkbox checked={organizations.includes(org.id)} />
                                                <ListItemText primary={org.name} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
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
        </Dialog>
    );
};
