import {
  Container,
  CircularProgress,
  Typography,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Collapse,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Box,
  Chip,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Link,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import supabase from '../supabase';
import PageTemplate from './PageTemplate';
import { useState, useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useCreatePersonMutation, useGetPersons } from '../api/usePersonsApi';
import { CreateOrUpdateOrganizationFormFields, CreateOrUpdateOrganizationPaymentDetailFormFields, CreateUpdateUserFormFields, mapToFormValues, mapToOrganizationFormValues } from '../types/formTypes';
import { OrganizationDetails, PersonDatabase, PersonDetails } from '../types/personTypes';
import EditIcon from '@mui/icons-material/Edit';
import { convertDateStringToOnlyDate } from '../utils/dateutils';
import React from 'react';
import { useGetAllUsers } from '../api/useAdminApi';
import { useCreateOrganizationApi, useDeleteOrganizationApi, useGetOrganizations } from '../api/useOrganizationsApi';
import { DeleteOutline } from '@mui/icons-material';


export const OrganizationsPage: React.FC = () => {
  return <PageTemplate>
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <OrganizationsTable />
    </Box>
  </PageTemplate >
}

const OrganizationsTable: React.FC = () => {
  // React Query to fetch data
  const data = useGetOrganizations()
  const [createOrEdit, setCreateOrEdit] = useState<OrganizationDetails | boolean>(false);
  const [deleteOrganization, setDeleteOrganization] = useState<OrganizationDetails>();
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom color='black'>
        Dernekler
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setCreateOrEdit(true)}
        sx={{ mb: 2 }}
      >
        Yeni dernek ekle
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Navn</TableCell>
              <TableCell>Organisasjonsnummer</TableCell>
              <TableCell>Kontonummer</TableCell>
              <TableCell width={"5px"}></TableCell>
              <TableCell width={"5px"}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((organization) => (
              <TableRow key={organization.organization.id}>
                <TableCell>{organization.organization.name}</TableCell>
                <TableCell>{organization.organization.organization_number}</TableCell>
                <TableCell>{organization.organization.bank_account_number}</TableCell>
                <TableCell><IconButton onClick={() => setCreateOrEdit(organization)}><EditIcon /></IconButton></TableCell>
                <TableCell><IconButton onClick={() => setDeleteOrganization(organization)}><DeleteOutline /></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {deleteOrganization != undefined && <DeleteOrganizationnDialog open organization={deleteOrganization} onClose={() => setDeleteOrganization(undefined)} />}
      {createOrEdit != false && <CreateOrganizationDialog open organization={typeof createOrEdit == "object" ? createOrEdit : undefined} onClose={() => setCreateOrEdit(false)} />}

    </Container>
  );
};

interface CreateOrganizationDialogProps {
  open: boolean;
  organization?: OrganizationDetails
  onClose: () => void;
}


const DeleteOrganizationnDialog: React.FC<CreateOrganizationDialogProps> = ({ open, onClose, organization }) => {
  const deleteFn = useDeleteOrganizationApi()


  const onSubmit = async () => {
    deleteFn.mutate(organization?.organization.id!!)
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Slette organisasjon</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Ønsker du å slette {organization?.organization.name}?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Avbryt</Button>
        <Button form="create-user-form" color="error" onClick={onSubmit} variant="contained">
          Slett
        </Button>
      </DialogActions>
    </Dialog >
  );
};
const CreateOrganizationDialog: React.FC<CreateOrganizationDialogProps> = ({ open, onClose, organization }) => {
  const createOrUpdateOrganizationFn = useCreateOrganizationApi()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, },
  } = useForm<CreateOrUpdateOrganizationFormFields>({
    defaultValues: mapToOrganizationFormValues(organization),
  });

  const onSubmit: SubmitHandler<CreateOrUpdateOrganizationFormFields> = async (data) => {
    createOrUpdateOrganizationFn.mutate(data)
    onClose();
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{organization ? "Oppdater organisasjon" : "Opprett organisasjon"}</DialogTitle>
      <DialogContent>
        <form id="create-user-form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            margin="dense"
            label="Navn"
            fullWidth
            {...register('name', { required: 'Navn er påkrevd' })}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
          <TextField
            margin="dense"
            label="Kontonummer"
            type='number'
            fullWidth
            {...register('bank_account_number')}
            error={Boolean(errors.bank_account_number)}
            helperText={errors.bank_account_number?.message}
          />
          <TextField
            margin="dense"
            label="Organisasjonsnummer"
            type='number'
            fullWidth
            {...register('organization_number')}
            error={Boolean(errors.organization_number)}
            helperText={errors.organization_number?.message}
          />

        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Avbryt</Button>
        <Button form="create-user-form" type="submit" variant="contained">
          {organization ? 'Oppdater' : 'Opprett'}
        </Button>
      </DialogActions>
    </Dialog >
  );
};