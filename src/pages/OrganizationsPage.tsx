import { DeleteOutline, SaveOutlined } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useCreateOrganizationApi, useDeleteOrganizationApi, useGetOrganizations } from '../api/useOrganizationsApi';
import { FormControlledTextField } from '../components/FormControlledTextField';
import { base } from '../context/AppContext';
import { CreateOrUpdateOrganizationFormFields, mapToOrganizationFormValues } from '../types/formTypes';
import { isStringEmpty } from '../utils/stringutils';
import PageTemplate from './PageTemplate';

export const OrganizationsPage: React.FC = () => {
    return (
        <PageTemplate>
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <OrganizationsTable />
            </Box>
        </PageTemplate>
    );
};

const OrganizationsTable: React.FC = () => {
    // React Query to fetch data
    const data = useGetOrganizations();
    const [editableRow, setEditableRow] = useState<`organizations.${number}` | undefined>(undefined);
    const [deleteOrganization, setDeleteOrganization] = useState<CreateOrUpdateOrganizationFormFields>();
    const createOrUpdateOrganizationFn = useCreateOrganizationApi();

    const methods = useForm<{ organizations: CreateOrUpdateOrganizationFormFields[] }>({
        defaultValues: {
            organizations: data.map(mapToOrganizationFormValues),
        },
    });
    const { reset, control, setError, getValues } = methods;
    const fields = useFieldArray({ name: 'organizations', control });
    const onSubmit = async (index: number) => {
        const data = getValues(`organizations.${index}`);

        if (isStringEmpty(data.name)) {
            setError(`organizations.${index}.name`, { message: 'Feltet er påkrevd' });
            return;
        }
        createOrUpdateOrganizationFn.mutate(data);
        setEditableRow(undefined);
    };
    useEffect(() => {
        reset({ organizations: data.map(mapToOrganizationFormValues) });
    }, [data]);
    return (
        <FormProvider {...methods}>
            <Container sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom color="black">
                    Organisasjoner
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        fields.append({} as CreateOrUpdateOrganizationFormFields);
                        setEditableRow(`organizations.${fields.fields.length}`);
                    }}
                    sx={{ mb: 2 }}
                >
                    Legg til ny organisasjon
                </Button>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Navn</TableCell>
                                <TableCell>Organisasjonsnummer</TableCell>
                                <TableCell>Kontonummer</TableCell>
                                <TableCell width={'5px'}></TableCell>
                                <TableCell width={'5px'}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fields.fields?.map((organization, index) => (
                                <TableRow key={organization.id}>
                                    <TableCell>
                                        {editableRow === `organizations.${index}` ? (
                                            <FormControlledTextField
                                                type="text"
                                                name={`organizations.${index}.name`}
                                                editable={editableRow === `organizations.${index}`}
                                            />
                                        ) : (
                                            <Link href={`${base}/organization/${organization.orgId}`}>
                                                <FormControlledTextField
                                                    type="text"
                                                    name={`organizations.${index}.name`}
                                                    editable={editableRow === `organizations.${index}`}
                                                />
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <FormControlledTextField
                                            type="number"
                                            name={`organizations.${index}.organization_number`}
                                            editable={editableRow === `organizations.${index}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormControlledTextField
                                            type="number"
                                            name={`organizations.${index}.bank_account_number`}
                                            editable={editableRow === `organizations.${index}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {editableRow === `organizations.${index}` ? (
                                            <IconButton
                                                onClick={() => {
                                                    onSubmit(index);
                                                }}
                                            >
                                                <SaveOutlined />
                                            </IconButton>
                                        ) : (
                                            <IconButton onClick={() => setEditableRow(`organizations.${index}`)}>
                                                <EditIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => setDeleteOrganization(organization)}>
                                            <DeleteOutline />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {deleteOrganization != undefined && (
                    <DeleteOrganizationnDialog
                        open
                        organization={deleteOrganization}
                        onClose={() => setDeleteOrganization(undefined)}
                    />
                )}
            </Container>
        </FormProvider>
    );
};

interface CreateOrganizationDialogProps {
    open: boolean;
    organization?: CreateOrUpdateOrganizationFormFields;
    onClose: () => void;
}

const DeleteOrganizationnDialog: React.FC<CreateOrganizationDialogProps> = ({ open, onClose, organization }) => {
    const deleteFn = useDeleteOrganizationApi();

    const onSubmit = async () => {
        deleteFn.mutate(organization?.orgId);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Slette organisasjon</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    Ønsker du å slette {organization?.name}?
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
