import { DeleteOutline } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { User } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { useCreatePaymentDetailApi, useDeletePaymentDetailsApi, useGetOrganization } from '../api/useOrganizationsApi';
import { CreateOrUpdateOrganizationPaymentDetailFormFields, mapToPaymentDetails } from '../types/formTypes';
import { PaymentDetailDatabase } from '../types/personTypes';
import PageTemplate from './PageTemplate';

export const OrganizationDetailssPage: React.FC = () => {
    return (
        <PageTemplate>
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <OrganizationDetailsView />
            </Box>
        </PageTemplate>
    );
};

const OrganizationDetailsView: React.FC = () => {
    const organizationId = useParams<{ id: string }>().id;
    const organization = useGetOrganization(organizationId!);
    // React Query to fetch data
    const [showPaymentDetails, setShowPaymentDetails] = useState<Record<string, boolean>>({});
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    // const { register, handleSubmit, reset } = useForm<User>({ defaultValues: mockUser });
    const [createOrEdit, setCreateOrEdit] = useState<PaymentDetailDatabase | boolean>(false);
    const [deleteOrganization, setDeletePayment] = useState<PaymentDetailDatabase>();
    const mutation = useMutation({
        mutationFn: (updatedUser: User) => {
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    console.log('Updated user information', updatedUser);
                    resolve();
                }, 1000);
            });
        },
    });

    const onSubmit = (data: User) => {
        mutation.mutate(data, {
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const handleEditClick = () => {
        setIsEditing(true);
        // reset(mockUser);
    };
    return (
        <Container className="p-6 flex justify-center">
            <div className="w-full max-w-4xl">
                <header className="flex justify-between items-center bg-grey-300 text-black p-4 rounded-md mb-6">
                    <h1 className="text-2xl font-bold">{organization.organization.name}</h1>
                    {!isEditing && (
                        <Button className="bg-white text-blue-600" onClick={handleEditClick}>
                            Update Information
                        </Button>
                    )}
                </header>

                <Card className="mb-6">
                    <CardContent>
                        {isEditing ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col gap-4">
                                {/* <TextField size="small" label="Isim" {...register("firstname")} placeholder="Isim" className="border p-2 w-full" />
                <TextField size="small" label="Soy isim" {...register("lastname")} placeholder="Soyisim" className="border p-2 w-full mt-2" />
                <TextField size="small" label="Dogum tarihi" type="date" {...register("birthdate")} className="border p-2 w-full" />
                <TextField size="small" label="Epost" type="email" {...register("email")} className="border p-2 w-full" />
                <TextField size="small" label="Telefon" type="text" {...register("phoneNumber")} className="border p-2 w-full" />
                <div>
                  <InputLabel className="pb-5">Address:</InputLabel>
                  <div className="flex flex-col gap-4">
                    <TextField size="small" label="Adress" {...register("address.street")} placeholder="Street" className="border p-2 w-full" />
                    <TextField size="small" label="Sehir" {...register("address.city")} placeholder="City" className="border p-2 w-full mt-2" />
                    <TextField size="small" label="Posta kodu" {...register("address.zipCode")} placeholder="Zip Code" className="border p-2 w-full mt-2" />
                  </div>
                </div>
                <Button type="submit" className="bg-blue-600 text-white">Save</Button> */}
                            </form>
                        ) : (
                            <>
                                <p>
                                    <strong>Organisasjonsnummer:</strong>{' '}
                                    {organization.organization.organization_number}
                                </p>
                                <p>
                                    <strong>Kontonummer:</strong> {organization.organization.bank_account_number}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <Button variant="contained" color="primary" onClick={() => setCreateOrEdit(true)} sx={{ mb: 2 }}>
                        Yeni ødeme ekle
                    </Button>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>År</TableCell>
                                    <TableCell>Kostnad</TableCell>
                                    <TableCell>Frist</TableCell>
                                    <TableCell width={'5px'}></TableCell>
                                    <TableCell width={'5px'}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {organization.paymentDetails?.map((detail) => (
                                    <TableRow key={detail.id}>
                                        <TableCell>{detail.year}</TableCell>
                                        <TableCell>{detail.amount}</TableCell>
                                        <TableCell>
                                            {detail.payment_deadline
                                                ? new Date(detail.payment_deadline).toLocaleDateString()
                                                : ''}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => setCreateOrEdit(detail)}>
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => setDeletePayment(detail)}>
                                                <DeleteOutline />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {deleteOrganization != undefined && (
                        <DeletePaymentDetailDialog
                            open
                            payment={deleteOrganization}
                            onClose={() => setDeletePayment(undefined)}
                            organizationId={Number(organizationId)}
                        />
                    )}
                    {createOrEdit != false && (
                        <CreatePaymentDetailnDialog
                            open
                            payment={typeof createOrEdit == 'object' ? createOrEdit : undefined}
                            onClose={() => setCreateOrEdit(false)}
                            organizationId={Number(organizationId)}
                        />
                    )}
                </Card>
            </div>
        </Container>
    );
};

interface CreateOrganizationDialogProps {
    open: boolean;
    payment?: PaymentDetailDatabase;
    organizationId: number;
    onClose: () => void;
}

const DeletePaymentDetailDialog: React.FC<CreateOrganizationDialogProps> = ({
    open,
    onClose,
    payment,
    organizationId,
}) => {
    const deleteFn = useDeletePaymentDetailsApi();

    const onSubmit = async () => {
        deleteFn.mutate({ paymentId: payment?.id!, organizationId });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Slette betaling</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    Ønsker du å slette {payment?.year}?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Avbryt</Button>
                <Button form="create-user-form" color="error" onClick={onSubmit} variant="contained">
                    Slett
                </Button>
            </DialogActions>
        </Dialog>
    );
};
const CreatePaymentDetailnDialog: React.FC<CreateOrganizationDialogProps> = ({
    open,
    onClose,
    payment,
    organizationId,
}) => {
    const createOrUpdateOrganizationFn = useCreatePaymentDetailApi();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateOrUpdateOrganizationPaymentDetailFormFields>({
        defaultValues: mapToPaymentDetails(organizationId, payment),
    });

    const onSubmit: SubmitHandler<CreateOrUpdateOrganizationPaymentDetailFormFields> = async (data) => {
        createOrUpdateOrganizationFn.mutate(data);
        onClose();
        reset();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{payment ? 'Oppdater betaling' : 'Opprett betaling'}</DialogTitle>
            <DialogContent>
                <form id="create-user-form" onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        margin="dense"
                        label="År"
                        fullWidth
                        {...register('year', { required: 'Årstall er påkrevd' })}
                        error={Boolean(errors.year)}
                        helperText={errors.year?.message}
                    />
                    <TextField
                        margin="dense"
                        label="Betaling"
                        type="number"
                        fullWidth
                        {...register('amount')}
                        error={Boolean(errors.amount)}
                        helperText={errors.amount?.message}
                    />
                    <TextField
                        margin="dense"
                        label="Frist"
                        type="date"
                        fullWidth
                        {...register('deadline')}
                        error={Boolean(errors.deadline)}
                        helperText={errors.deadline?.message}
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Avbryt</Button>
                <Button form="create-user-form" type="submit" variant="contained">
                    {payment ? 'Oppdater' : 'Opprett'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
