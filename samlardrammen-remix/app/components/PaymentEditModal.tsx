import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { type CreateOrUpdateUserPaymentDetailsFormFields } from '../types/formTypes';
import { type MembershipDetails, type PaymentDetailDatabase, type PaymentInfoDatabase } from '../types/personTypes';

interface PaymentEditModalProps {
    open: boolean;
    onClose: () => void;
    payment: PaymentDetailDatabase | null;
    membership: MembershipDetails | null;
    userPaymentInfo: PaymentInfoDatabase | null;
    onSave: (data: CreateOrUpdateUserPaymentDetailsFormFields) => void;
}

const PaymentEditModal: React.FC<PaymentEditModalProps> = ({
    open,
    onClose,
    payment,
    membership,
    userPaymentInfo,
    onSave,
}) => {
    console.log('payment', payment, userPaymentInfo, membership);
    const { control, handleSubmit, formState } = useForm<CreateOrUpdateUserPaymentDetailsFormFields>({
        defaultValues: {
            id: userPaymentInfo?.id,
            membership_id: membership?.membership.id,
            payment_detail_id: payment?.id,
            amount:
                userPaymentInfo?.payment_state == 'unpaid'
                    ? (payment?.amount ?? 0)
                    : (userPaymentInfo?.amount ?? payment?.amount ?? 0),
            paymentState: userPaymentInfo?.payment_state ?? 'unpaid',
            payment_date: userPaymentInfo?.payment_date ?? null,
        },
    });

    const saveForm = handleSubmit((data) => {
        onSave(data);
        onClose();
    });

    if (!payment || !membership) {
        return null;
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Rediger betaling for {payment.year}</DialogTitle>
            <DialogContent>
                <div className="flex flex-col gap-4 pt-4">
                    <TextField
                        label="Beløp"
                        fullWidth
                        type="number"
                        InputProps={{
                            startAdornment: <span className="mr-2">NOK</span>,
                        }}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        {...control.register('amount', {
                            valueAsNumber: true,
                        })}
                    />

                    <FormControl fullWidth size="small">
                        <InputLabel>Betalingsstatus</InputLabel>
                        <Controller
                            control={control}
                            name="paymentState"
                            render={({ field }) => (
                                <Select {...field} displayEmpty label="Betalingsstatus">
                                    <MenuItem value={'unpaid'}>Ikke betalt</MenuItem>
                                    <MenuItem value={'paid'}>Betalt</MenuItem>
                                </Select>
                            )}
                        />
                    </FormControl>

                    <Controller
                        control={control}
                        name="payment_date"
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Betalingsdato"
                                type="date"
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value || null)}
                            />
                        )}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Avbryt</Button>
                <Button onClick={saveForm} variant="contained" color="primary">
                    Lagre
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentEditModal;
