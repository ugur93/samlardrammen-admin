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
    Paper,
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
import React, { Fragment, useState } from 'react';
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
    if (!details) {
        return (
            <Paper className="pt-3 p-4">
                <Typography variant="body1" className="text-black">
                    Fant ingen bruker med epost <strong>{user?.user?.email}</strong>. Det skyldes at din epost ikke er
                    registrert til en bruker i vårt system. Send mail til{' '}
                    <a href="mailto:samlardrammen@gmail.com">samlardrammen@gmail.com</a> for å få registrert din e-post
                    på riktig person. Legg til både navn og riktig epost i mailen.
                </Typography>
            </Paper>
        );
    }
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
            <div>
                {membership && membership?.length > 0 ? (
                    membership
                        .sort((b) => (b.membership.is_member ? -1 : 1))
                        .map((membership) => (
                            <div
                                key={membership.membership.id}
                                className={`mb-1 ${!membership.membership.is_member ? 'bg-red-100' : ''}`}
                            >
                                <div className="flex flex-row gap-2 align-middle self-center p-2">
                                    <Typography variant="h6">{membership.organization.organization.name}</Typography>
                                    {!membership.membership.is_member && (
                                        <div className="self-center">(Medlemskapet er avsluttet)</div>
                                    )}
                                </div>
                                <Card className="p-2">
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
                    <p>Ingen medlemskap</p>
                )}
            </div>
        </>
    );
}

interface TableProps {
    membership: MembershipDetails;
    person: PersonDetails;
}
function TableMobile({ membership, person }: TableProps) {
    const { user } = useAppContext();
    const [editingPaymentId, setEditingPaymentId] = useState<number>();
    const userPaymentInfoFn = useAddOrUpdatePaymentStatus(person.person.id);

    const handleEditClick = (paymentDetailId: number) => {
        setEditingPaymentId(paymentDetailId);
    };

    const handleSaveClick = (data: CreateOrUpdateUserPaymentDetailsFormFields) => {
        userPaymentInfoFn.mutateAsync(data).then(() => {
            setEditingPaymentId(undefined);
        });
    };

    const handleCancelEdit = () => {
        setEditingPaymentId(undefined);
    };

    return (
        <Table className="w-full">
            <TableHead>
                <TableRow>
                    <TableCell>År</TableCell>
                    <TableCell>Beløp</TableCell>
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
                        const userPaymentInfo = membership.paymentDetails.find(
                            (pd) => pd.payment_detail_id === payment.id
                        );
                        const isEditing = editingPaymentId === payment.id;

                        return (
                            <Fragment key={index}>
                                <TableRow className={`${userPaymentInfo?.payment_state != 'paid' ? 'bg-red-100' : ''}`}>
                                    <TableCell>{payment.year}</TableCell>

                                    {isEditing && user?.isAdmin ? (
                                        <EditablePaymentRow
                                            payment={payment}
                                            membership={membership}
                                            userPaymentInfo={userPaymentInfo}
                                            onSave={handleSaveClick}
                                            onCancel={handleCancelEdit}
                                            isMobile={true}
                                        />
                                    ) : (
                                        <>
                                            <TableCell>
                                                {userPaymentInfo?.amount
                                                    ? `NOK ${userPaymentInfo.amount.toFixed(2)}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {userPaymentInfo?.payment_state === 'paid' ? 'Betalt' : 'Ikke betalt'}
                                            </TableCell>
                                            {user?.isAdmin && (
                                                <TableCell>
                                                    <IconButton onClick={() => handleEditClick(payment.id)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            )}
                                        </>
                                    )}
                                </TableRow>
                                {!isEditing && (
                                    <TableRow>
                                        <TableCell colSpan={user?.isAdmin ? 5 : 4}>
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
                                                        {userPaymentInfo?.payment_state == 'paid' && (
                                                            <CustomListItemText
                                                                primary={'Betalt'}
                                                                secondary={
                                                                    <div className="w-max">
                                                                        NOK {userPaymentInfo?.amount?.toFixed(2)}
                                                                    </div>
                                                                }
                                                            />
                                                        )}
                                                    </List>
                                                </Grid>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
                        );
                    })}
            </TableBody>
        </Table>
    );
}

function TableDesktop({ membership, person }: TableProps) {
    const { user } = useAppContext();
    const [editingPaymentId, setEditingPaymentId] = useState<number>();
    const userPaymentInfoFn = useAddOrUpdatePaymentStatus(person.person.id);

    const handleEditClick = (paymentDetailId: number) => {
        setEditingPaymentId(paymentDetailId);
    };

    const handleSaveClick = (data: CreateOrUpdateUserPaymentDetailsFormFields) => {
        userPaymentInfoFn.mutateAsync(data).then(() => {
            setEditingPaymentId(undefined);
        });
    };

    const handleCancelEdit = () => {
        setEditingPaymentId(undefined);
    };

    return (
        <Table className="w-full">
            <TableHead>
                <TableRow>
                    <TableCell>År</TableCell>
                    <TableCell>Beløp</TableCell>
                    <TableCell>Betalt</TableCell>
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
                        const isEditing = editingPaymentId === payment.id;

                        return (
                            <TableRow
                                key={index}
                                className={`${userPaymentInfo?.payment_state != 'paid' ? 'bg-red-100' : ''}`}
                            >
                                <TableCell>{payment.year}</TableCell>
                                <TableCell>NOK {payment.amount!.toFixed(2)}</TableCell>

                                {isEditing && user?.isAdmin ? (
                                    <EditablePaymentRow
                                        payment={payment}
                                        membership={membership}
                                        userPaymentInfo={userPaymentInfo}
                                        onSave={handleSaveClick}
                                        onCancel={handleCancelEdit}
                                    />
                                ) : (
                                    <>
                                        <TableCell>
                                            {userPaymentInfo?.payment_state == 'paid' && userPaymentInfo?.amount
                                                ? `NOK ${userPaymentInfo.amount.toFixed(2)}`
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {payment.payment_deadline
                                                ? format(new Date(payment.payment_deadline), 'dd/MM/yyyy')
                                                : ''}
                                        </TableCell>
                                        <TableCell>NOK {payment.late_fee?.toFixed(2)}</TableCell>
                                        <TableCell>
                                            {userPaymentInfo?.payment_state === 'paid' ? 'Betalt' : 'Ikke betalt'}
                                        </TableCell>
                                        {user?.isAdmin && (
                                            <TableCell>
                                                <IconButton onClick={() => handleEditClick(payment.id)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </>
                                )}
                            </TableRow>
                        );
                    })}
            </TableBody>
        </Table>
    );
}

// Extract EditablePaymentRow component
function EditablePaymentRow({
    payment,
    membership,
    userPaymentInfo,
    onSave,
    onCancel,
    isMobile = false,
}: {
    payment: PaymentDetailDatabase;
    membership: MembershipDetails;
    userPaymentInfo: any;
    onSave: (data: CreateOrUpdateUserPaymentDetailsFormFields) => void;
    onCancel: () => void;
    isMobile?: boolean;
}) {
    const { control, handleSubmit } = useForm<CreateOrUpdateUserPaymentDetailsFormFields>({
        defaultValues: {
            id: userPaymentInfo?.id,
            membership_id: membership.membership.id,
            payment_detail_id: payment.id,
            amount:
                userPaymentInfo?.payment_state == 'unpaid'
                    ? payment.amount
                    : (userPaymentInfo?.amount ?? payment.amount ?? 0),
            paymentState: userPaymentInfo?.payment_state ?? 'unpaid',
            payment_date: userPaymentInfo?.payment_date ?? null,
        },
    });

    const saveForm = handleSubmit((data) => {
        onSave(data);
    });

    return (
        <>
            {!isMobile && (
                <TableCell>
                    <Controller
                        control={control}
                        name="amount"
                        render={({ field }) => (
                            <TextField
                                {...field}
                                size="small"
                                type="number"
                                fullWidth={isMobile}
                                value={field.value}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    field.onChange(isNaN(value) ? 0 : value);
                                }}
                            />
                        )}
                    />
                </TableCell>
            )}
            {!isMobile && (
                <TableCell>
                    {payment.payment_deadline ? format(new Date(payment.payment_deadline), 'dd/MM/yyyy') : ''}
                </TableCell>
            )}
            {!isMobile && <TableCell>NOK {payment.late_fee?.toFixed(2)}</TableCell>}
            <TableCell>
                <FormControl fullWidth>
                    <Controller
                        control={control}
                        name="paymentState"
                        render={({ field }) => (
                            <Select {...field} size="small" displayEmpty value={field.value}>
                                <MenuItem value={'unpaid'}>Ikke betalt</MenuItem>
                                <MenuItem value={'paid'}>Betalt</MenuItem>
                            </Select>
                        )}
                    />
                </FormControl>
            </TableCell>
            <TableCell>
                <IconButton onClick={saveForm}>
                    <SaveAltIcon />
                </IconButton>
            </TableCell>
        </>
    );
}

function getPaymentDetail(paymentDetail: PaymentDetailDatabase, membership: MembershipDetails) {
    return membership.paymentDetails.find((pd) => pd.payment_detail_id === paymentDetail.id);
}
