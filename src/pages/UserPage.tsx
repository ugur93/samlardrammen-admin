import EditIcon from '@mui/icons-material/Edit';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    IconButton,
    InputLabel,
    List,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import { format } from 'date-fns';
import React, { Fragment, useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { useAddOrUpdatePaymentStatus, useCreatePersonMutation, useGetPersonById } from '../api/usePersonsApi';
import CustomListItemText from '../components/CustomListItemText';
import { FormDatePicker } from '../components/FormDatePicker';
import { useAppContext } from '../context/AppContext';
import { CreateOrUpdateUserPaymentDetailsFormFields, mapToFormValues, UserFormFields } from '../types/formTypes';
import { AdressDatabase, MembershipDetails, PaymentDetailDatabase, PersonDetails } from '../types/personTypes';
import PageTemplate from './PageTemplate';
export default function UserDetailsPage() {
    return (
        <PageTemplate>
            <UserDetails />
        </PageTemplate>
    );
}

export const UserDetails: React.FC = () => {
    const { user } = useAppContext();
    const userId = useParams<{ id: string }>().id;
    const userDetails = useGetPersonById(userId);

    const [isEditing, setIsEditing] = useState(false);

    function getUserDetails() {
        if (userId !== undefined) {
            return userDetails;
        }
        return user?.details;
    }
    const createPersonFn = useCreatePersonMutation();
    const methods = useForm<UserFormFields>({
        defaultValues: mapToFormValues(getUserDetails()),
    });

    const { register, handleSubmit, reset } = methods;

    const onSubmit = (data: UserFormFields) => {
        console.log(data);
        createPersonFn.mutate({ person: data, existingPerson: userDetails });
        reset(mapToFormValues(getUserDetails()));
        setIsEditing(false);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        reset(mapToFormValues(getUserDetails()));
    };

    function formatterAdresse(adresse?: AdressDatabase) {
        const toAdressLine = (tekst?: string | null) => (tekst ? `${tekst},` : '');
        return `${toAdressLine(adresse?.addressLine1)}${toAdressLine(adresse?.addressLine2)}${toAdressLine(adresse?.city)}${toAdressLine(adresse?.postcode)}`;
    }
    const details = getUserDetails();
    if (!details) return null;
    return (
        <div className="p-6 flex justify-center">
            <div className="w-full max-w-4xl">
                <Typography variant="h4" className="text-black">
                    {details.name}
                </Typography>

                <Card className="mb-6">
                    <CardContent>
                        {isEditing ? (
                            <FormProvider {...methods}>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col gap-4">
                                    <TextField
                                        size="small"
                                        label="Navn"
                                        {...register('firstname')}
                                        placeholder="Isim"
                                        className="border p-2 w-full"
                                    />
                                    <TextField
                                        size="small"
                                        label="Etternavn"
                                        {...register('lastname')}
                                        placeholder="Soyisim"
                                        className="border p-2 w-full mt-2"
                                    />

                                    <FormDatePicker name="birthdate" label="Fødselsdato" />

                                    <TextField
                                        size="small"
                                        label="Epost"
                                        type="email"
                                        {...register('email')}
                                        className="border p-2 w-full"
                                    />
                                    <TextField
                                        size="small"
                                        label="Telefon"
                                        type="text"
                                        {...register('phoneNumber')}
                                        className="border p-2 w-full"
                                    />
                                    <div>
                                        <InputLabel className="pb-5">Address:</InputLabel>
                                        <div className="flex flex-col gap-4">
                                            <TextField
                                                size="small"
                                                label="Addresselinje 1"
                                                {...register('address.addressLine1')}
                                                placeholder="Street"
                                                className="border p-2 w-full"
                                            />
                                            <TextField
                                                size="small"
                                                label="Addresselinje 2"
                                                {...register('address.addressLine2')}
                                                placeholder="Street"
                                                className="border p-2 w-full"
                                            />
                                            <TextField
                                                size="small"
                                                label="By"
                                                {...register('address.city')}
                                                placeholder="City"
                                                className="border p-2 w-full mt-2"
                                            />
                                            <TextField
                                                size="small"
                                                label="Postnummer"
                                                {...register('address.postcode')}
                                                placeholder="Postnummer"
                                                className="border p-2 w-full mt-2"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <Button variant="outlined" onClick={() => setIsEditing(false)}>
                                            Avbryt
                                        </Button>
                                        <Button variant="contained" type="submit">
                                            Lagre
                                        </Button>
                                    </div>
                                </form>
                            </FormProvider>
                        ) : (
                            <div>
                                <Grid container spacing={2}>
                                    <List dense disablePadding>
                                        <CustomListItemText primary={'Navn'} secondary={details.name} />
                                        <CustomListItemText
                                            primary={'Fødselsdato'}
                                            secondary={
                                                details.person.birthdate
                                                    ? format(new Date(details.person.birthdate), 'dd/MM/yyyy')
                                                    : ''
                                            }
                                        />
                                        <CustomListItemText primary={'Email'} secondary={details.person.email} />
                                        <CustomListItemText
                                            primary={'Telefon'}
                                            secondary={details.person.phone_number}
                                        />
                                        <CustomListItemText
                                            primary={'Adresse'}
                                            secondary={formatterAdresse(details.address)}
                                        />
                                    </List>
                                </Grid>
                                <Box className="flex flex-row gap-2 pt-3">
                                    {!isEditing && user?.isAdmin && (
                                        <Button variant="contained" onClick={handleEditClick}>
                                            Rediger
                                        </Button>
                                    )}
                                </Box>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <MembershipDetailsView person={details} />
            </div>
        </div>
    );
};

function MembershipDetailsView({ person }: { person: PersonDetails }) {
    const membership = person?.membership;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <>
            <Typography variant="h4" className="!mb-4 text-black">
                Medlemskap
            </Typography>
            <Card className="mb-6">
                <CardContent>
                    {membership && membership?.length > 0 ? (
                        membership
                            .sort((b) => (b.membership.is_member ? -1 : 1))
                            .map((membership) => (
                                <div
                                    key={membership.membership.id}
                                    className={`mb-4 ${!membership.membership.is_member ? 'bg-red-100' : ''}`}
                                >
                                    <div className="flex flex-row gap-2 align-middle self-center p-2">
                                        <Typography variant="h6">
                                            {membership.organization.organization.name}
                                        </Typography>
                                        {!membership.membership.is_member && (
                                            <div className="self-center">(Medlemskapet er avsluttet)</div>
                                        )}
                                    </div>
                                    <Card className="p-4">
                                        <Typography variant="h6">Betalinger</Typography>
                                        <div className="bg-gray-50 p-2 mb-2">
                                            <p>
                                                <strong>Kontonummer:</strong>{' '}
                                                {membership.organization.organization.bank_account_number}
                                            </p>
                                        </div>
                                        {isMobile ? (
                                            <TableMobile membership={membership} person={person} />
                                        ) : (
                                            <TableDesktop membership={membership} person={person} />
                                        )}
                                    </Card>
                                </div>
                            ))
                    ) : (
                        <p>Uyelik yok</p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

interface TableProps {
    membership: MembershipDetails;
    person: PersonDetails;
}
function TableMobile({ membership, person }: TableProps) {
    const { user } = useAppContext();

    return (
        <Table className="w-full">
            <TableHead>
                <TableRow>
                    <TableCell>År</TableCell>
                    <TableCell>Beløp</TableCell>
                    <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {membership.organization.paymentDetails
                    .filter((p) => {
                        const userPaymentInfo = membership.paymentDetails.find((pd) => pd.payment_detail_id === p.id);
                        return !p.deleted || userPaymentInfo?.payment_state == 'paid';
                    })
                    .map((payment, index) => {
                        const userPaymentInfo = membership.paymentDetails.find(
                            (pd) => pd.payment_detail_id === payment.id
                        );
                        return (
                            <Fragment key={index}>
                                <TableRow
                                    key={index}
                                    className={`${userPaymentInfo?.payment_state != 'paid' ? 'bg-red-100' : ''}`}
                                >
                                    <TableCell>{payment.year}</TableCell>
                                    <TableCell>NOK {(userPaymentInfo?.amount ?? payment.amount!).toFixed(2)}</TableCell>
                                    {user?.roles.includes('admin') ? (
                                        <ViewOrEditPaymentStatus
                                            paymentDetail={payment}
                                            membership={membership}
                                            user={person}
                                        />
                                    ) : (
                                        <TableCell>
                                            {userPaymentInfo?.payment_state == 'paid' ? 'Betalt' : 'Ikke betalt'}
                                        </TableCell>
                                    )}
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        <Box sx={{ margin: 1 }}>
                                            <Grid container spacing={2}>
                                                <List dense disablePadding>
                                                    <CustomListItemText
                                                        primary={'Frist'}
                                                        secondary={
                                                            payment.payment_deadline
                                                                ? format(
                                                                      new Date(payment.payment_deadline),
                                                                      'dd/MM/yyyy'
                                                                  )
                                                                : ''
                                                        }
                                                    />
                                                    <CustomListItemText
                                                        primary={'Forsinkelsesgebyr'}
                                                        secondary={
                                                            <div className="w-max">
                                                                NOK {payment.late_fee?.toFixed(2)}
                                                            </div>
                                                        }
                                                    />
                                                </List>
                                            </Grid>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </Fragment>
                        );
                    })}
            </TableBody>
        </Table>
    );
}
function TableDesktop({ membership, person }: TableProps) {
    const { user } = useAppContext();

    return (
        <Table className="w-full">
            <TableHead>
                <TableRow>
                    <TableCell>År</TableCell>
                    <TableCell>Beløp</TableCell>
                    <TableCell>Frist</TableCell>
                    <TableCell>Forsinkelsesgebyr</TableCell>
                    <TableCell>Status</TableCell>
                    {user?.isAdmin && <TableCell></TableCell>}
                </TableRow>
            </TableHead>
            <TableBody>
                {membership.organization.paymentDetails
                    .filter((p) => {
                        const userPaymentInfo = membership.paymentDetails.find((pd) => pd.payment_detail_id === p.id);
                        return !p.deleted || userPaymentInfo?.payment_state == 'paid';
                    })
                    .map((payment, index) => {
                        const userPaymentInfo = getPaymentDetail(payment, membership);
                        return (
                            <TableRow
                                key={index}
                                className={`${userPaymentInfo?.payment_state != 'paid' ? 'bg-red-100' : ''}`}
                            >
                                <TableCell>{payment.year}</TableCell>
                                <TableCell>NOK {(userPaymentInfo?.amount ?? payment.amount!).toFixed(2)}</TableCell>
                                <TableCell>
                                    {' '}
                                    {payment.payment_deadline
                                        ? format(new Date(payment.payment_deadline), 'dd/MM/yyyy')
                                        : ''}
                                </TableCell>
                                <TableCell>NOK {payment.late_fee?.toFixed(2)}</TableCell>
                                {user?.isAdmin ? (
                                    <ViewOrEditPaymentStatus
                                        paymentDetail={payment}
                                        membership={membership}
                                        user={person}
                                    />
                                ) : (
                                    <TableCell>
                                        {userPaymentInfo?.payment_state == 'paid' ? 'Betalt' : 'Ikke betalt'}
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
            </TableBody>
        </Table>
    );
}

function ViewOrEditPaymentStatus({
    paymentDetail,
    membership,
    user,
}: {
    paymentDetail: PaymentDetailDatabase;
    membership: MembershipDetails;
    user: PersonDetails;
}) {
    const [editPayment, setEditPayment] = useState<number>();
    const userPaymentInfoFn = useAddOrUpdatePaymentStatus(user.person.id);
    const userPaymentInfo = getPaymentDetail(paymentDetail, membership);
    const paid = userPaymentInfo?.payment_state == 'paid';
    const {
        setError,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<CreateOrUpdateUserPaymentDetailsFormFields>({
        defaultValues: {
            id: userPaymentInfo?.id,
            membership_id: membership.membership.id,
            payment_detail_id: paymentDetail.id,
            amount: userPaymentInfo?.amount ?? 0,
            paymentState: userPaymentInfo?.payment_state ?? 'unpaid',
            payment_date: userPaymentInfo?.payment_date ?? null,
        },
    });

    useEffect(() => {
        reset({
            id: userPaymentInfo?.id,
            membership_id: membership.membership.id,
            payment_detail_id: paymentDetail.id,
            amount: userPaymentInfo?.amount ?? 0,
            paymentState: userPaymentInfo?.payment_state ?? 'unpaid',
            payment_date: userPaymentInfo?.payment_date,
        } as CreateOrUpdateUserPaymentDetailsFormFields);
    }, [userPaymentInfo]);

    function onSave(data: CreateOrUpdateUserPaymentDetailsFormFields) {
        setEditPayment(undefined);
        userPaymentInfoFn.mutateAsync(data).then(() => {
            reset();
        });
    }

    return (
        <>
            {editPayment != paymentDetail.id ? (
                <TableCell>{paid ? 'Betalt' : 'Ikke betalt'}</TableCell>
            ) : (
                <TableCell>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            name="paymentState"
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    size="small"
                                    displayEmpty
                                    inputProps={{ 'aria-label': 'Without label' }}
                                >
                                    <MenuItem value={'unpaid'}>Ikke betalt</MenuItem>
                                    <MenuItem value={'paid'}>Betalt</MenuItem>
                                </Select>
                            )}
                        />
                    </FormControl>
                </TableCell>
            )}
            {editPayment != paymentDetail.id ? (
                <TableCell>
                    <IconButton onClick={() => setEditPayment(paymentDetail.id)}>
                        <EditIcon />
                    </IconButton>
                </TableCell>
            ) : (
                <TableCell>
                    <IconButton onClick={handleSubmit(onSave)}>
                        <SaveAltIcon />
                    </IconButton>
                </TableCell>
            )}
        </>
    );
}

function getPaymentDetail(paymentDetail: PaymentDetailDatabase, membership: MembershipDetails) {
    return membership.paymentDetails.find((pd) => pd.payment_detail_id === paymentDetail.id);
}
