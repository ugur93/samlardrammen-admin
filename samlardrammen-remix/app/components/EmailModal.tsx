'use client';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Modal,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import React, { lazy, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = lazy(() => import('react-quill-new'));

interface EmailModalProps {
    open: boolean;
    onClose: () => void;
    initialRecipients?: string[];
    onSuccess?: () => void;
}

interface EmailFormData {
    subject: string;
    content: string;
    recipients: string[];
    bcc: string[];
    recipientInput: string;
    bccInput: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const EmailModal: React.FC<EmailModalProps> = ({ open, onClose, initialRecipients = [], onSuccess }) => {
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        getValues,
        setFocus,
    } = useForm<EmailFormData>({
        defaultValues: {
            subject: '',
            content: '',
            recipients: ['samlardrammen@gmail.com'],
            bcc: initialRecipients,
            recipientInput: '',
            bccInput: '',
        },
    });

    // Watch form fields for UI updates
    const recipientInput = useWatch({ control, name: 'recipientInput' });
    const bccInput = useWatch({ control, name: 'bccInput' });
    const recipients = useWatch({ control, name: 'recipients' });
    const bcc = useWatch({ control, name: 'bcc' });

    // Reset form when modal is opened with new initialRecipients
    useEffect(() => {
        if (open) {
            reset({
                subject: '',
                content: '',
                recipients: ['samlardrammen@gmail.com'],
                bcc: initialRecipients,
                recipientInput: '',
                bccInput: '',
            });

            // Focus on recipient input if no initial recipients
            if (!initialRecipients.length) {
                setTimeout(() => setFocus('recipientInput'), 100);
            } else {
                setTimeout(() => setFocus('subject'), 100);
            }
        }
    }, [open, initialRecipients, reset, setFocus]);

    const sendEmailMutation = useMutation({
        mutationFn: async (data: { to: string; bcc: string; subject: string; html: string }) => {
            const response = await fetch('/sendEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Kunne ikke sende e-post');
            }

            return response.json();
        },
        onSuccess: () => {
            if (onSuccess) onSuccess();
            reset();
            onClose();
        },
    });

    const validateAndAddEmail = (input: string, type: 'recipient' | 'bcc') => {
        const trimmedInput = input.trim();

        if (!trimmedInput) return false;

        // Handle multiple emails separated by comma, semicolon, or space
        const emails = trimmedInput
            .split(/[,;\s]+/)
            .map((email) => email.trim())
            .filter((email) => email && EMAIL_REGEX.test(email));

        if (!emails.length) return false;

        if (type === 'recipient') {
            const uniqueEmails = emails.filter((email) => !recipients.includes(email));
            if (uniqueEmails.length) {
                setValue('recipients', [...recipients, ...uniqueEmails]);
                setValue('recipientInput', '');
                return true;
            }
        } else {
            const uniqueEmails = emails.filter((email) => !bcc.includes(email));
            if (uniqueEmails.length) {
                setValue('bcc', [...bcc, ...uniqueEmails]);
                setValue('bccInput', '');
                return true;
            }
        }

        return false;
    };

    const handleAddRecipient = () => {
        validateAndAddEmail(getValues('recipientInput'), 'recipient');
    };

    const handleRemoveRecipient = (email: string) => {
        setValue(
            'recipients',
            recipients.filter((item) => item !== email)
        );
    };

    const handleAddBcc = () => {
        validateAndAddEmail(getValues('bccInput'), 'bcc');
    };

    const handleRemoveBcc = (email: string) => {
        setValue(
            'bcc',
            bcc.filter((item) => item !== email)
        );
    };

    const onSubmit = (formData: EmailFormData) => {
        // Try to add any remaining text in the input fields
        if (formData.recipientInput.trim()) {
            validateAndAddEmail(formData.recipientInput, 'recipient');
        }

        if (formData.bccInput.trim()) {
            validateAndAddEmail(formData.bccInput, 'bcc');
        }

        // Get the updated recipients list after adding any remaining inputs
        const updatedFormData = getValues();

        if (updatedFormData.recipients.length === 0) {
            return; // Form won't submit without recipients
        }

        sendEmailMutation.mutate({
            to: updatedFormData.recipients.join(', '),
            bcc: updatedFormData.bcc.length > 0 ? updatedFormData.bcc.join(', ') : '',
            subject: updatedFormData.subject,
            html: updatedFormData.content,
        });
    };

    // Handle key press for recipients and bcc inputs
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, fieldType: 'recipient' | 'bcc') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (fieldType === 'recipient') {
                if (validateAndAddEmail(recipientInput, 'recipient')) {
                    // If email was added successfully, focus on subject if no other recipients
                    if (recipients.length === 0) {
                        setTimeout(() => setFocus('subject'), 100);
                    }
                }
            } else {
                validateAndAddEmail(bccInput, 'bcc');
            }
        }
    };

    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
        ],
    };

    const [showAllRecipients, setShowAllRecipients] = React.useState(false);
    const [showAllBcc, setShowAllBcc] = React.useState(false);

    return (
        <>
            <Modal
                open={open}
                onClose={() => {
                    if (!sendEmailMutation.isPending) {
                        reset();
                        onClose();
                    }
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: '80%', md: 700 },
                        maxHeight: '90vh',
                        bgcolor: 'background.paper',
                        p: 4,
                        borderRadius: 2,
                        overflowY: 'auto',
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">Send e-post</Typography>
                        </Box>
                        <IconButton onClick={onClose} size="small" disabled={sendEmailMutation.isPending}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {sendEmailMutation.isError && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {sendEmailMutation.error instanceof Error
                                ? sendEmailMutation.error.message
                                : 'Kunne ikke sende e-post'}
                        </Typography>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Mottakere *
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Controller
                                    name="recipientInput"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            size="small"
                                            placeholder="Skriv e-postadresse (trykk Enter for å legge til)"
                                            onKeyDown={(e) => handleKeyDown(e, 'recipient')}
                                            error={recipients.length === 0 && !!errors.recipients}
                                            helperText={recipients.length === 0 ? 'Minst én mottaker er påkrevd' : ''}
                                        />
                                    )}
                                />
                                <IconButton onClick={handleAddRecipient} color="primary">
                                    <AddIcon />
                                </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, minHeight: '32px' }}>
                                {recipients.length > 10 ? (
                                    <>
                                        {recipients.slice(0, 5).map((email) => (
                                            <Chip
                                                key={email}
                                                label={
                                                    email.length > 20 && window.innerWidth < 600
                                                        ? `${email.substring(0, 17)}...`
                                                        : email
                                                }
                                                onDelete={() => handleRemoveRecipient(email)}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{
                                                    maxWidth: { xs: '100%', sm: '300px' },
                                                    '& .MuiChip-label': {
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    },
                                                }}
                                            />
                                        ))}
                                        <Chip
                                            label={`+${recipients.length - 5} more`}
                                            size="small"
                                            color="default"
                                            onClick={() => setShowAllRecipients(true)}
                                        />
                                    </>
                                ) : (
                                    recipients.map((email) => (
                                        <Chip
                                            key={email}
                                            label={
                                                email.length > 20 && window.innerWidth < 600
                                                    ? `${email.substring(0, 17)}...`
                                                    : email
                                            }
                                            onDelete={() => handleRemoveRecipient(email)}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{
                                                maxWidth: { xs: '100%', sm: '300px' },
                                                '& .MuiChip-label': {
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                },
                                            }}
                                        />
                                    ))
                                )}
                            </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                BCC (blindkopi)
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Controller
                                    name="bccInput"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            size="small"
                                            placeholder="Legg til blindkopi (trykk Enter for å legge til)"
                                            onKeyDown={(e) => handleKeyDown(e, 'bcc')}
                                        />
                                    )}
                                />
                                <IconButton onClick={handleAddBcc} color="primary">
                                    <AddIcon />
                                </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, minHeight: '32px' }}>
                                {bcc.length > 10 ? (
                                    <>
                                        {bcc.slice(0, 5).map((email) => (
                                            <Chip
                                                key={email}
                                                label={
                                                    email.length > 20 && window.innerWidth < 600
                                                        ? `${email.substring(0, 17)}...`
                                                        : email
                                                }
                                                onDelete={() => handleRemoveBcc(email)}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{
                                                    maxWidth: { xs: '100%', sm: '300px' },
                                                    '& .MuiChip-label': {
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    },
                                                }}
                                            />
                                        ))}
                                        <Chip
                                            label={`+${bcc.length - 5} more`}
                                            size="small"
                                            color="default"
                                            onClick={() => setShowAllBcc(true)}
                                        />
                                    </>
                                ) : (
                                    bcc.map((email) => (
                                        <Chip
                                            key={email}
                                            label={
                                                email.length > 20 && window.innerWidth < 600
                                                    ? `${email.substring(0, 17)}...`
                                                    : email
                                            }
                                            onDelete={() => handleRemoveBcc(email)}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{
                                                maxWidth: { xs: '100%', sm: '300px' },
                                                '& .MuiChip-label': {
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                },
                                            }}
                                        />
                                    ))
                                )}
                            </Box>
                        </Box>

                        <Controller
                            name="subject"
                            control={control}
                            rules={{ required: 'Emne er påkrevd' }}
                            render={({ field }) => (
                                <TextField
                                    label="Emne *"
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.subject}
                                    helperText={errors.subject?.message}
                                    {...field}
                                />
                            )}
                        />

                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                            Melding *
                        </Typography>
                        <Controller
                            name="content"
                            control={control}
                            rules={{ required: 'Innhold er påkrevd' }}
                            render={({ field }) => (
                                <Box sx={{ mb: 3 }}>
                                    <ReactQuill
                                        theme="snow"
                                        modules={modules}
                                        style={{ height: '200px', marginBottom: '50px' }}
                                        placeholder="Skriv innholdet i e-posten her..."
                                        {...field}
                                    />
                                    {errors.content && (
                                        <Typography color="error" variant="caption">
                                            {errors.content.message}
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 10 }}>
                            <Button
                                type="button"
                                onClick={() => {
                                    reset();
                                    onClose();
                                }}
                                sx={{ mr: 2 }}
                                disabled={sendEmailMutation.isPending}
                            >
                                Avbryt
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={sendEmailMutation.isPending || recipients.length === 0}
                                startIcon={sendEmailMutation.isPending ? null : <EmailIcon />}
                            >
                                {sendEmailMutation.isPending ? 'Sender...' : 'Send e-post'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Modal>

            <Dialog
                open={showAllRecipients}
                onClose={() => setShowAllRecipients(false)}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        width: { xs: '95%', sm: '80%', md: '100%' },
                        maxWidth: { xs: '95%', sm: '80%', md: '768px' },
                        margin: { xs: '8px', sm: '16px' },
                        overflow: 'hidden',
                    },
                }}
            >
                <DialogTitle sx={{ py: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            Alle mottakere ({recipients.length})
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CloseIcon fontSize="small" />}
                            onClick={() => setShowAllRecipients(false)}
                            sx={{
                                minWidth: { xs: '60px', sm: 'auto' },
                                p: { xs: '4px 8px', sm: '5px 15px' },
                            }}
                        >
                            Lukk
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent
                    sx={{ py: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 }, maxHeight: { xs: '60vh', sm: '70vh' } }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: { xs: 0.5, sm: 1 },
                            pb: 1,
                            maxHeight: { xs: 'calc(60vh - 70px)', sm: 'calc(70vh - 80px)' },
                            overflow: 'auto',
                        }}
                    >
                        {recipients.map((email) => (
                            <Chip
                                key={email}
                                label={
                                    email.length > 20 && window.innerWidth < 600
                                        ? `${email.substring(0, 17)}...`
                                        : email
                                }
                                onDelete={() => {
                                    handleRemoveRecipient(email);
                                    if (recipients.length <= 11) {
                                        setShowAllRecipients(false);
                                    }
                                }}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                    mb: 1,
                                    mr: 1,
                                    maxWidth: { xs: 'calc(100% - 8px)', sm: '300px' },
                                    height: { xs: '28px', sm: '32px' },
                                    '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        px: { xs: 1, sm: 1.5 },
                                    },
                                    '& .MuiChip-deleteIcon': {
                                        width: { xs: '16px', sm: '20px' },
                                        height: { xs: '16px', sm: '20px' },
                                        margin: { xs: '0 4px 0 -4px', sm: '0 5px 0 -6px' },
                                    },
                                }}
                            />
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showAllBcc}
                onClose={() => setShowAllBcc(false)}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        width: { xs: '95%', sm: '80%', md: '100%' },
                        maxWidth: { xs: '95%', sm: '80%', md: '768px' },
                        margin: { xs: '8px', sm: '16px' },
                        overflow: 'hidden',
                    },
                }}
            >
                <DialogTitle sx={{ py: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            Alle blindkopimottakere ({bcc.length})
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CloseIcon fontSize="small" />}
                            onClick={() => setShowAllBcc(false)}
                            sx={{
                                minWidth: { xs: '60px', sm: 'auto' },
                                p: { xs: '4px 8px', sm: '5px 15px' },
                            }}
                        >
                            Lukk
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent
                    sx={{ py: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 }, maxHeight: { xs: '60vh', sm: '70vh' } }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: { xs: 0.5, sm: 1 },
                            pb: 1,
                            maxHeight: { xs: 'calc(60vh - 70px)', sm: 'calc(70vh - 80px)' },
                            overflow: 'auto',
                        }}
                    >
                        {bcc.map((email) => (
                            <Chip
                                key={email}
                                label={
                                    email.length > 20 && window.innerWidth < 600
                                        ? `${email.substring(0, 17)}...`
                                        : email
                                }
                                onDelete={() => {
                                    handleRemoveBcc(email);
                                    if (bcc.length <= 11) {
                                        setShowAllBcc(false);
                                    }
                                }}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                    mb: 1,
                                    mr: 1,
                                    maxWidth: { xs: 'calc(100% - 8px)', sm: '300px' },
                                    height: { xs: '28px', sm: '32px' },
                                    '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        px: { xs: 1, sm: 1.5 },
                                    },
                                    '& .MuiChip-deleteIcon': {
                                        width: { xs: '16px', sm: '20px' },
                                        height: { xs: '16px', sm: '20px' },
                                        margin: { xs: '0 4px 0 -4px', sm: '0 5px 0 -6px' },
                                    },
                                }}
                            />
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EmailModal;
