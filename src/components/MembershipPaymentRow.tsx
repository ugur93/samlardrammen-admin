import { Box, Typography } from '@mui/material';
import React from 'react';
import { MembershipDetails } from '../types/personTypes';
import PaymentStateSelect from './PaymentStateSelect';

interface MembershipPaymentRowProps {
    membership: MembershipDetails;
    personId: number;
}

const MembershipPaymentRow: React.FC<MembershipPaymentRowProps> = ({ membership, personId }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                gap: 1,
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    flex: '1 1 auto',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '60%',
                    minWidth: 100,
                }}
            >
                {membership.organization.organization.name}
            </Typography>
            <PaymentStateSelect personId={personId} membership={membership} />
        </Box>
    );
};

export default MembershipPaymentRow;
