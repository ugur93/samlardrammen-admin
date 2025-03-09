import { Box, Button, Card, CardContent, InputLabel, List, Paper, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { format } from 'date-fns';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { useAddOrUpdatePaymentStatus, useCreatePersonMutation, useGetPersonById } from '../api/usePersonsApi';
import CustomListItemText from '../components/CustomListItemText';
import { FormDatePicker } from '../components/FormDatePicker';
import MembershipTable from '../components/MembershipTable';
import PaymentEditModal from '../components/PaymentEditModal';
import { RelationsTable } from '../components/RelationsTable';
import { useAppContext } from '../context/AppContext';
import { CreateOrUpdateUserPaymentDetailsFormFields, mapToFormValues, UserFormFields } from '../types/formTypes';
import {
    AdressDatabase,
    MembershipDetails,
    PaymentDetailDatabase,
    PaymentInfoDatabase,
    PersonDetails,
} from '../types/personTypes';
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
        console.log('submit', data);
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
                                    {!isEditing && (
                                        <Button variant="contained" onClick={handleEditClick}>
                                            Rediger
                                        </Button>
                                    )}
                                </Box>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add Relations Table */}
                <Card className="mb-6">
                    <CardContent>
                        <RelationsTable relations={details.relations} personId={details.person.id} />
                    </CardContent>
                </Card>

                <MembershipDetailsView person={details} />
            </div>
        </div>
    );
};

function MembershipDetailsView({ person }: { person: PersonDetails }) {
    const membership = person?.membership;
    const [selectedPayment, setSelectedPayment] = useState<PaymentDetailDatabase | null>(null);
    const [selectedMembership, setSelectedMembership] = useState<MembershipDetails | null>(null);
    const [selectedPaymentInfo, setSelectedPaymentInfo] = useState<PaymentInfoDatabase | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const userPaymentInfoFn = useAddOrUpdatePaymentStatus(person.person.id);

    const handleEditClick = (
        membership: MembershipDetails,
        payment: PaymentDetailDatabase,
        userPayment: PaymentInfoDatabase
    ) => {
        setSelectedPayment(payment);
        setSelectedMembership(membership);
        setSelectedPaymentInfo(userPayment);
        setIsModalOpen(true);
    };

    const handleSaveClick = (data: CreateOrUpdateUserPaymentDetailsFormFields) => {
        userPaymentInfoFn.mutateAsync(data).then(() => {
            setIsModalOpen(false);
            setSelectedPayment(null);
            setSelectedMembership(null);
            setSelectedPaymentInfo(null);
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPayment(null);
        setSelectedMembership(null);
        setSelectedPaymentInfo(null);
    };

    return (
        <>
            <Typography variant="h4" className="!mb-4 text-black">
                Medlemskap
            </Typography>
            <div>
                {membership && membership?.length > 0 ? (
                    <MembershipTable
                        key={'membership.membership.id'}
                        memberships={membership}
                        onEditPayment={handleEditClick}
                    />
                ) : (
                    <p>Ingen medlemskap</p>
                )}

                {isModalOpen && (
                    <PaymentEditModal
                        open={isModalOpen}
                        onClose={handleCloseModal}
                        payment={selectedPayment}
                        membership={selectedMembership}
                        userPaymentInfo={selectedPaymentInfo}
                        onSave={handleSaveClick}
                    />
                )}
            </div>
        </>
    );
}
