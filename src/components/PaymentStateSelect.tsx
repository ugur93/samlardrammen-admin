import { Box, FormControl, MenuItem, OutlinedInput, Select, SelectChangeEvent, Typography } from '@mui/material';
import React from 'react';
import { useAddOrUpdatePaymentStatus } from '../api/usePersonsApi';
import { MembershipDetails } from '../types/personTypes';

interface PaymentStateSelectProps {
    personId: number;
    membership: MembershipDetails;
    readOnly?: boolean;
    paymentDetailId?: number; // For accessing a specific payment instead of just the current year
}

const PaymentStateSelect: React.FC<PaymentStateSelectProps> = ({
    personId,
    membership,
    readOnly = false,
    paymentDetailId,
}) => {
    const userPaymentInfoFn = useAddOrUpdatePaymentStatus(personId);

    const handleChange = (event: SelectChangeEvent) => {
        if (readOnly) return;

        const paymentDetail = paymentDetailId
            ? membership.organization.paymentDetails.find((p) => p.id === paymentDetailId)
            : getCurrentYearPaymentDetail(membership);

        if (!paymentDetail) return;

        const personPaymentDetail = getPersonPaymentDetail(paymentDetail.id);
        const state = event.target.value === 'true' ? 'paid' : 'unpaid';
        userPaymentInfoFn.mutate({
            id: personPaymentDetail?.id,
            membership_id: membership.membership.id,
            payment_detail_id: paymentDetail.id,
            paymentState: state,
            amount: state == 'unpaid' ? 0 : (paymentDetail.amount ?? 0),
        });
    };

    function getPersonPaymentDetail(detailId?: number) {
        const paymentDetail = detailId
            ? membership.organization.paymentDetails.find((p) => p.id === detailId)
            : getCurrentYearPaymentDetail(membership);

        return membership.paymentDetails
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .find((d) => d.payment_detail_id === paymentDetail?.id);
    }

    function paymentStatus() {
        const personPaymentDetail = paymentDetailId
            ? getPersonPaymentDetail(paymentDetailId)
            : getPersonPaymentDetail();

        const state = personPaymentDetail?.payment_state === 'paid';
        return state ? 'true' : 'false';
    }

    const isPaid = paymentStatus() === 'true';

    return (
        <FormControl size="small" sx={{ width: 130, m: 0, p: 0 }}>
            <Select
                labelId="payment-select-label"
                id={'payment-select' + personId + '-' + (paymentDetailId || '')}
                value={paymentStatus()}
                onChange={handleChange}
                disabled={readOnly}
                sx={{
                    height: '28px',
                    '.MuiOutlinedInput-notchedOutline': {
                        borderColor: isPaid ? 'green' : 'orangered',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: isPaid ? 'darkgreen' : 'red',
                    },
                    backgroundColor: isPaid ? 'rgba(0, 128, 0, 0.05)' : 'rgba(255, 69, 0, 0.05)',
                    fontSize: '0.8rem',
                    p: 0,
                    opacity: readOnly ? 0.8 : 1,
                    pointerEvents: readOnly ? 'none' : 'auto',
                }}
                MenuProps={{
                    PaperProps: {
                        sx: {
                            '& .MuiMenuItem-root': {
                                fontSize: '0.8rem',
                                py: 0.5,
                            },
                        },
                    },
                }}
                input={<OutlinedInput margin="dense" />}
            >
                <MenuItem dense value={'true'}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ color: 'green', fontSize: '1rem' }}>●</span>
                        <Typography variant="body2">Betalt</Typography>
                    </Box>
                </MenuItem>
                <MenuItem dense value={'false'}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ color: 'orangered', fontSize: '1rem' }}>●</span>
                        <Typography variant="body2">Ikke betalt</Typography>
                    </Box>
                </MenuItem>
            </Select>
        </FormControl>
    );
};

function getCurrentYearPaymentDetail(membership: MembershipDetails) {
    const currentYear = new Date().getFullYear();
    return membership.organization.paymentDetails.find((p) => p.year === currentYear && p.deleted === false);
}

export default PaymentStateSelect;
