import EditIcon from '@mui/icons-material/Edit';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import {
    Button,
    Card,
    CardContent,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { useAddOrUpdatePaymentStatus, useGetPersonById } from '../api/usePersonsApi';
import { useAppContext } from '../context/AppContext';
import { CreateOrUpdateUserPaymentDetailsFormFields, mapToFormValues, UserFormFields } from '../types/formTypes';
import { MembershipDetails, PaymentDetailDatabase, PersonDetails } from '../types/personTypes';
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
    const navigate = useNavigate();
    const { register, handleSubmit, reset } = useForm<UserFormFields>({
        defaultValues: mapToFormValues(getUserDetails()),
    });

    function getUserDetails() {
        if (userId !== undefined) {
            return userDetails;
        }
        return user?.details;
    }
    // const mutation = useMutation({
    //     mutationFn: (updatedUser: User) => {
    //         return new Promise<void>((resolve) => {
    //             setTimeout(() => {
    //                 console.log("Updated user information", updatedUser);
    //                 resolve();
    //             }, 1000);
    //         });
    //     }
    // });

    const onSubmit = (data: UserFormFields) => {
        // mutation.mutate(data, {
        //     onSuccess: () => {
        //         setIsEditing(false);
        //     },
        // });
    };

    const handleEditClick = () => {
        setIsEditing(true);
        reset(mapToFormValues(getUserDetails()));
    };

    const details = getUserDetails();
    if (!details) return null;
    return (
        <div className="p-6 flex justify-center">
            <div className="w-full max-w-4xl">
                <header className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-md mb-6">
                    <h1 className="text-2xl font-bold">Uyelik</h1>
                    {!isEditing && (
                        <Button className="bg-white text-blue-600" onClick={handleEditClick}>
                            Update Information
                        </Button>
                    )}
                </header>

                <Card className="mb-6">
                    <CardContent>
                        <h2 className="text-xl font-semibold pb-4">Detajlar</h2>
                        {isEditing ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col gap-4">
                                <TextField
                                    size="small"
                                    label="Isim"
                                    {...register('firstname')}
                                    placeholder="Isim"
                                    className="border p-2 w-full"
                                />
                                <TextField
                                    size="small"
                                    label="Soy isim"
                                    {...register('lastname')}
                                    placeholder="Soyisim"
                                    className="border p-2 w-full mt-2"
                                />
                                <TextField
                                    size="small"
                                    label="Dogum tarihi"
                                    type="date"
                                    {...register('birthdate')}
                                    className="border p-2 w-full"
                                />
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
                                            label="Adress"
                                            {...register('address.addressLine1')}
                                            placeholder="Street"
                                            className="border p-2 w-full"
                                        />
                                        <TextField
                                            size="small"
                                            label="Sehir"
                                            {...register('address.city')}
                                            placeholder="City"
                                            className="border p-2 w-full mt-2"
                                        />
                                        <TextField
                                            size="small"
                                            label="Posta kodu"
                                            {...register('address.postcode')}
                                            placeholder="Zip Code"
                                            className="border p-2 w-full mt-2"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="bg-blue-600 text-white">
                                    Save
                                </Button>
                            </form>
                        ) : (
                            <>
                                <p>
                                    <strong>Isim:</strong> {details.name}
                                </p>
                                <p>
                                    <strong>Dogum tarihi:</strong>{' '}
                                    {details.person.birthdate
                                        ? format(new Date(details.person.birthdate), 'dd/MM/yyyy')
                                        : ''}
                                </p>
                                <p>
                                    <strong>Email:</strong> {details.person.email}
                                </p>
                                <p>
                                    <strong>Telefon:</strong> {details.person.id}
                                </p>
                                <p>
                                    <strong>Address:</strong> {details.address?.addressLine1}{' '}
                                    {details.address?.addressLine2}, {details.address?.city},{' '}
                                    {details.address?.postcode}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                {/* 
                <Card className="mb-6">
                    <CardContent>
                        <h2 className="text-xl font-semibold">Relations</h2>
                        {relations.length > 0 ? (
                            <ul className="list-disc list-inside">
                                {relations.map((relation, index) => (
                                    <li key={index} className="cursor-pointer text-blue-600 underline" onClick={() => handleRelationClick(relation)}>
                                        {relation.type}: {relation.firstname} {relation.lastname}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No relations available.</p>
                        )}
                    </CardContent>
                </Card> */}

                <MembershipDetailsView user={details} />
            </div>
        </div>
    );
};

function MembershipDetailsView({ user }: { user: PersonDetails }) {
    const membership = user?.membership;
    const [editPayment, setEditPayment] = useState<number>();
    const [paymentDetails, setPaymentDetails] = useState<Record<number, boolean>>({});

    const handleChange = (event: SelectChangeEvent) => {
        setPaymentDetails({ ...paymentDetails, [editPayment!]: event.target.value == '2' });
    };

    function onSave(paymentId: number, paid: boolean) {
        console.log('PaymentId', paymentId, 'Paid', paid);
        setEditPayment(undefined);
    }

    return (
        <Card className="mb-6">
            <CardContent>
                <Typography variant="h5">Uyelik</Typography>
                {membership && membership?.length > 0 ? (
                    membership
                        .filter((m) => m.membership.is_member)
                        .map((membership) => (
                            <div key={membership.membership.id} className="mb-4">
                                <h3 className="text-lg font-medium mb-2">
                                    {membership.organization.organization.name}
                                </h3>
                                <Card className="p-2">
                                    <h3 className="text-lg font-medium mb-2">Ødemeler</h3>
                                    <div className="bg-gray-50 p-2 mb-2">
                                        <p>
                                            <strong>Account Info:</strong>{' '}
                                            {membership.organization.organization.bank_account_number}
                                        </p>
                                    </div>
                                    <Table className="w-full">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>År</TableCell>
                                                <TableCell>Beløp</TableCell>
                                                <TableCell>Betalt dato</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {membership.organization.paymentDetails.map((payment, index) => {
                                                const userPaymentInfo = membership.paymentDetails.find(
                                                    (pd) => pd.payment_detail_id === payment.id
                                                );
                                                console.log(userPaymentInfo, payment);
                                                return (
                                                    <TableRow
                                                        key={index}
                                                        className={`${userPaymentInfo?.payment_state != 'paid' ? 'bg-red-100' : ''}`}
                                                    >
                                                        <TableCell>{payment.year}</TableCell>
                                                        <TableCell>
                                                            NOK{' '}
                                                            {(userPaymentInfo?.amount ?? payment.amount!).toFixed(2)}
                                                        </TableCell>
                                                        <ViewOrEditPaymentStatus
                                                            paymentDetail={payment}
                                                            membership={membership}
                                                            user={user}
                                                        />
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>
                        ))
                ) : (
                    <p>Uyelik yok</p>
                )}
            </CardContent>
        </Card>
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
    const userPaymentInfo = membership.paymentDetails.find((pd) => pd.payment_detail_id === paymentDetail.id);
    const paid = userPaymentInfo?.payment_state == 'paid';
    console.log('UserPaymentInfo', userPaymentInfo);
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
            payment_date: userPaymentInfo?.payment_date,
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
        console.log('SUBMIT', data);
        if (data.paymentState == 'paid') {
            if (data.payment_date == undefined) {
                setError('payment_date', { message: 'Betalt dato er påkrevd når status er betalt' });
                return;
            }
        }
        setEditPayment(undefined);
        userPaymentInfoFn.mutateAsync(data).then(() => {
            reset();
        });
    }

    return (
        <>
            <TableCell>
                {editPayment != paymentDetail.id ? (
                    <Typography>
                        {userPaymentInfo?.payment_date ? dayjs(userPaymentInfo?.payment_date).format('DD/MM/YYYY') : ''}
                    </Typography>
                ) : (
                    <Controller
                        control={control}
                        name="payment_date"
                        render={({ field }) => {
                            return (
                                <DatePicker
                                    value={dayjs(field.value)}
                                    inputRef={field.ref}
                                    slotProps={{
                                        textField: { size: 'small', helperText: errors.payment_date?.message },
                                    }}
                                    onChange={(date) => {
                                        field.onChange(date);
                                    }}
                                />
                            );
                        }}
                    />
                )}
            </TableCell>
            {editPayment != paymentDetail.id ? (
                <TableCell>{paid ? 'Ødendi' : 'Ødenmedi'}</TableCell>
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
