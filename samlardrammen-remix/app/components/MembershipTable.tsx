import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { type MembershipDetails, type PaymentDetailDatabase, type PaymentInfoDatabase } from '../types/personTypes';

interface MembershipTableProps {
    memberships: MembershipDetails[];
    onEditPayment?: (
        membership: MembershipDetails,
        payment: PaymentDetailDatabase,
        userPayment: PaymentInfoDatabase
    ) => void;
}

const MembershipTable: React.FC<MembershipTableProps> = ({ memberships, onEditPayment }) => {
    const theme = useTheme();
    const { isAdmin } = useAppContext();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Function to format account number with spaces (e.g., "1234 56 78901")
    const formatAccountNumber = (accountNumber: string) => {
        if (!accountNumber) return '';
        return accountNumber.replace(/(\d{4})(\d{2})(\d+)/, '$1 $2 $3');
    };

    // Function to format date to Norwegian format
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('no-NO');
    };

    // Function to check if a payment is overdue
    const isPaymentOverdue = (deadline: string | null, paymentStatus?: string | null) => {
        if (!deadline || paymentStatus === 'paid') return false;
        const deadlineDate = new Date(deadline);
        const today = new Date();
        return deadlineDate < today;
    };

    const getPaymentStatusIcon = (status?: string | null) => {
        switch (status) {
            case 'paid':
                return <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />;
            case 'unpaid':
                return <CancelIcon fontSize="small" sx={{ color: 'error.main' }} />;
            default:
                return <AccessTimeIcon fontSize="small" sx={{ color: 'warning.main' }} />;
        }
    };

    const getPaymentStatusColor = (status?: string | null) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'unpaid':
                return 'error';
            default:
                return 'warning';
        }
    };

    const getPaymentStatusText = (status?: string | null) => {
        switch (status) {
            case 'paid':
                return 'Betalt';
            case 'unpaid':
                return 'Ikke betalt';
            default:
                return 'Ikke betalt';
        }
    };

    // Calculate responsive column count
    const getGridColumns = () => {
        if (isMobile) return 12;
        if (isMediumScreen) return 6;
        return 4;
    };

    return (
        <Box sx={{ mt: 2 }}>
            {memberships.map((membershipDetails, index) => {
                // Get account number from organization data
                const accountNumber = membershipDetails.organization.organization.bank_account_number || '';

                return (
                    <Paper
                        key={index}
                        elevation={2}
                        sx={{
                            mb: 3,
                            p: { xs: 2, md: 3 },
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                boxShadow: 3,
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', md: 'center' },
                                mb: 2,
                            }}
                        >
                            <Box>
                                <Typography variant="h6" component="h3" gutterBottom>
                                    {membershipDetails.organization.organization.name}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                        label={membershipDetails.membership.is_member ? 'Medlem' : 'Medlem'}
                                        color={membershipDetails.membership.is_member ? 'success' : 'success'}
                                        size="small"
                                        sx={{ mb: { xs: 1, md: 0 } }}
                                    />
                                </Stack>
                            </Box>

                            {accountNumber && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        bgcolor: 'background.default',
                                        p: 1,
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        mt: { xs: 2, md: 0 },
                                    }}
                                >
                                    <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            Kontonummer for betaling
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {formatAccountNumber(accountNumber)}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight={500}>
                                Betalingshistorikk
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            {membershipDetails.organization.paymentDetails
                                .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
                                .filter((p) => {
                                    const userPaymentInfo = membershipDetails.paymentDetails.find(
                                        (info) => info.payment_detail_id === p.id
                                    );
                                    return !p.deleted || userPaymentInfo?.payment_state == 'paid';
                                })
                                .map((payment, paymentIndex) => {
                                    const paymentInfo = membershipDetails.paymentDetails.find(
                                        (info) => info.payment_detail_id === payment.id
                                    );

                                    const paymentDeadline = payment.payment_deadline;
                                    const isOverdue = isPaymentOverdue(paymentDeadline, paymentInfo?.payment_state);
                                    const paidAmount = payment.amount;
                                    const actualAmount = paymentInfo?.amount || paidAmount;
                                    const hasDiscrepancy = actualAmount !== paidAmount && paidAmount !== 0;

                                    return (
                                        <Grid item xs={12} sm={getGridColumns()} key={paymentIndex}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    height: '100%',
                                                    borderLeft: '4px solid',
                                                    borderColor: paymentInfo
                                                        ? theme.palette[
                                                              getPaymentStatusColor(paymentInfo.payment_state)
                                                          ].main
                                                        : theme.palette.grey[300],
                                                    boxShadow: 1,
                                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: 2,
                                                    },
                                                }}
                                            >
                                                <CardContent>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Typography variant="h6" component="div" fontWeight={500}>
                                                            {payment.year}
                                                        </Typography>
                                                        {onEditPayment && isAdmin && (
                                                            <Tooltip title="Rediger betaling">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() =>
                                                                        onEditPayment(
                                                                            membershipDetails,
                                                                            payment,
                                                                            paymentInfo
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        bgcolor: 'background.default',
                                                                        '&:hover': {
                                                                            bgcolor: 'action.hover',
                                                                        },
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>

                                                    <Divider sx={{ my: 1.5 }} />

                                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                                                        {getPaymentStatusIcon(paymentInfo?.payment_state)}
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {getPaymentStatusText(paymentInfo?.payment_state)}
                                                        </Typography>
                                                    </Box>

                                                    {/* Payment Deadline Section */}
                                                    {paymentDeadline && (
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                mt: 1,
                                                                gap: 1,
                                                                color: isOverdue ? 'error.main' : 'text.primary',
                                                            }}
                                                        >
                                                            <DateRangeIcon fontSize="small" />
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {isOverdue ? 'Forfalt' : 'Betalingsfrist'}:{' '}
                                                                {formatDate(paymentDeadline)}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            mt: 1.5,
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                        }}
                                                    >
                                                        <span>Beløp:</span>
                                                        <span style={{ fontWeight: 500 }}>{actualAmount} NOK</span>
                                                    </Typography>

                                                    {hasDiscrepancy && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mt: 1,
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                            }}
                                                        >
                                                            <span>Betalt beløp:</span>
                                                            <span style={{ fontWeight: 500 }}>{paidAmount} NOK</span>
                                                        </Typography>
                                                    )}
                                                    {isOverdue && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mt: 1,
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                color: 'warning.main',
                                                            }}
                                                        >
                                                            <span>Forsinkelsesgebyr:</span>
                                                            <span style={{ fontWeight: 500 }}>
                                                                {payment.late_fee} NOK
                                                            </span>
                                                        </Typography>
                                                    )}

                                                    {paymentInfo?.payment_date && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mt: 1,
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                            }}
                                                        >
                                                            <span>Betalingsdato:</span>
                                                            <span style={{ fontWeight: 500 }}>
                                                                {format(
                                                                    new Date(paymentInfo.payment_date),
                                                                    'dd/MM/yyyy'
                                                                )}
                                                            </span>
                                                        </Typography>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                        </Grid>
                    </Paper>
                );
            })}
        </Box>
    );
};

export default MembershipTable;
