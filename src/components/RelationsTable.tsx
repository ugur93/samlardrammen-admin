import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Autocomplete,
    Box,
    Button,
    Card,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useGetPersonsSimple, useLoggedInUser } from '../api/usePersonsApi';
import { useAddUpdateRelationMutation, useDeleteRelationMutation } from '../api/useRelationsApi';
import { PersonDatabase, RelationsResponse } from '../types/personTypes';
import { RelationType, relationTypeLabels } from '../types/relationTypes';

interface RelationsTableProps {
    relations: RelationsResponse[];
    personId: number;
}

export const RelationsTable: React.FC<RelationsTableProps> = ({ relations, personId }) => {
    const theme = useTheme();
    const user = useLoggedInUser();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const persons = useGetPersonsSimple();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
    const [relationType, setRelationType] = useState<RelationType>(RelationType.SPOUSE);
    const [hasAccess, setHasAccess] = useState<boolean>(false);
    const [availablePersons, setAvailablePersons] = useState<PersonDatabase[]>([]);
    const [editingRelation, setEditingRelation] = useState<RelationsResponse | null>(null);
    const [relationToDelete, setRelationToDelete] = useState<RelationsResponse | null>(null);

    // Use mock mutations
    const addUpdateRelationMutation = useAddUpdateRelationMutation();
    const deleteRelationMutation = useDeleteRelationMutation();

    useEffect(() => {
        // Filter out already related persons
        const relatedPersonIds = relations.map((relation) => relation.relatedPerson?.id);
        const filtered = persons.filter((person) => !relatedPersonIds.includes(person.id) && person.id !== personId);
        setAvailablePersons(filtered);
    }, [relations, personId]);

    const handleAddRelation = () => {
        addUpdateRelationMutation.mutate(
            {
                id: editingRelation?.id,
                personId,
                relation_type: relationType,
                relatedPersonId: (selectedPerson ?? editingRelation?.relatedPerson.id)!,
                has_access: hasAccess,
            },
            {
                onSuccess: () => {
                    handleClose();
                },
            }
        );
    };

    const handleEditRelation = (relation: RelationsResponse) => {
        setEditingRelation(relation);
        setRelationType(relation.relation_type as RelationType);
        setHasAccess(relation.has_access);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (relation: RelationsResponse) => {
        setRelationToDelete(relation);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!relationToDelete) return;

        deleteRelationMutation.mutate(relationToDelete, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setRelationToDelete(null);
            },
        });
    };

    const handleClose = () => {
        setIsDialogOpen(false);
        setSelectedPerson(null);
        setRelationType(RelationType.SPOUSE);
        setHasAccess(false);
        setEditingRelation(null);
    };

    const relationsFiltered = relations.filter((relation) => relation.relatedPerson != null);

    // Mobile card view component
    const MobileRelationCard = ({ relation }: { relation: RelationsResponse }) => (
        <Card sx={{ mb: 1, p: 2 }}>
            <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                    <Link to={`/user/${relation.relatedPerson.id}`}>
                        {relation.relatedPerson.firstname} {relation.relatedPerson.lastname}
                    </Link>
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        Relasjon:
                    </Typography>
                    <Typography variant="body2">
                        {relationTypeLabels[relation.relation_type as RelationType] || relation.relation_type}
                    </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        Har tilgang:
                    </Typography>
                    <Chip
                        size="small"
                        label={relation.has_access ? 'Ja' : 'Nei'}
                        color={relation.has_access ? 'success' : 'default'}
                        variant="outlined"
                        sx={{
                            borderRadius: '4px',
                            backgroundColor: relation.has_access ? '#e8f5e9' : '#f5f5f5',
                            borderColor: relation.has_access ? '#66bb6a' : '#bdbdbd',
                            fontWeight: 'bold',
                            '& .MuiChip-label': {
                                color: relation.has_access ? '#2e7d32' : '#757575',
                            },
                        }}
                    />
                </Box>

                <Box display="flex" justifyContent="flex-end" mt={1}>
                    <IconButton size="small" color="primary" onClick={() => handleEditRelation(relation)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(relation)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Stack>
        </Card>
    );

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Familierelasjoner</Typography>
                {user?.isAdmin && (
                    <Button variant="outlined" color="primary" size="small" onClick={() => setIsDialogOpen(true)}>
                        Legg til familierelasjon
                    </Button>
                )}
            </Box>

            {relationsFiltered && relationsFiltered.length > 0 ? (
                isMobile ? (
                    // Mobile view with cards
                    <Stack spacing={1}>
                        {relations.map((relation) => (
                            <MobileRelationCard key={relation.id} relation={relation} />
                        ))}
                    </Stack>
                ) : (
                    // Desktop view with table
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Navn</TableCell>
                                    <TableCell>Relasjon</TableCell>
                                    {user?.isAdmin && <TableCell>Har tilgang</TableCell>}
                                    {user?.isAdmin && <TableCell align="right">Handlinger</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {relationsFiltered
                                    .sort((a, b) => (a.id > b.id ? 1 : -1))
                                    .map((relation) => (
                                        <TableRow key={relation.id}>
                                            <TableCell>
                                                <Link to={`/user/${relation.relatedPerson.id}`}>
                                                    {relation.relatedPerson.firstname} {relation.relatedPerson.lastname}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {relationTypeLabels[relation.relation_type as RelationType] ||
                                                    relation.relation_type}
                                            </TableCell>
                                            {user?.isAdmin && (
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={relation.has_access ? 'Ja' : 'Nei'}
                                                        variant="outlined"
                                                        sx={{
                                                            borderRadius: '4px',
                                                            backgroundColor: relation.has_access
                                                                ? '#e8f5e9'
                                                                : '#f5f5f5',
                                                            borderColor: relation.has_access ? '#66bb6a' : '#bdbdbd',
                                                            fontWeight: 'bold',
                                                            '& .MuiChip-label': {
                                                                color: relation.has_access ? '#2e7d32' : '#757575',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                            )}
                                            {user?.isAdmin && (
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleEditRelation(relation)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteClick(relation)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
            ) : (
                <Typography variant="body2">Ingen relasjoner registrert</Typography>
            )}

            {/* Add/Edit Dialog */}
            <Dialog
                open={isDialogOpen}
                onClose={handleClose}
                fullScreen={false}
                fullWidth
                maxWidth={isMobile ? 'xs' : 'sm'}
                sx={
                    isMobile
                        ? {
                              '& .MuiDialog-paper': {
                                  margin: '16px',
                                  width: 'calc(100% - 32px)',
                                  maxHeight: 'calc(100% - 64px)',
                              },
                          }
                        : {}
                }
            >
                <DialogTitle sx={isMobile ? { fontSize: '1.1rem', py: 1.5 } : {}}>
                    {editingRelation ? 'Rediger relasjon' : 'Legg til relasjon'}
                </DialogTitle>
                <DialogContent sx={isMobile ? { py: 1 } : {}}>
                    {!editingRelation && (
                        <FormControl fullWidth margin="normal" size={isMobile ? 'small' : 'medium'}>
                            <Autocomplete
                                id="person-select-autocomplete"
                                options={availablePersons}
                                getOptionKey={(option) => option.id}
                                getOptionLabel={(option) =>
                                    `${option.firstname} ${option.lastname} (alder ${option.birthdate ? new Date().getFullYear() - new Date(option.birthdate).getFullYear() : 'ukjent'})`
                                }
                                renderInput={(params) => (
                                    <TextField
                                        key={params.id}
                                        {...params}
                                        label="Søk etter person"
                                        variant="outlined"
                                    />
                                )}
                                onChange={(_, newValue) => {
                                    setSelectedPerson(newValue ? newValue.id : null);
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                fullWidth
                                size={isMobile ? 'small' : 'medium'}
                            />
                        </FormControl>
                    )}

                    {editingRelation && (
                        <Typography variant="body1" gutterBottom>
                            Person: {editingRelation.relatedPerson.firstname} {editingRelation.relatedPerson.lastname}
                        </Typography>
                    )}

                    <FormControl fullWidth margin="normal" size={isMobile ? 'small' : 'medium'}>
                        <InputLabel id="relation-type-label">Relasjonstype</InputLabel>
                        <Select
                            labelId="relation-type-label"
                            value={relationType}
                            onChange={(e) => setRelationType(e.target.value as RelationType)}
                            label="Relasjonstype"
                        >
                            {Object.entries(relationTypeLabels).map(([value, label]) => (
                                <MenuItem key={value} value={value}>
                                    {label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={<Checkbox checked={hasAccess} onChange={(e) => setHasAccess(e.target.checked)} />}
                        label="Har tilgang til å se data"
                        style={{ marginTop: 16 }}
                    />
                </DialogContent>
                <DialogActions sx={isMobile ? { px: 2, pb: 2 } : {}}>
                    <Button onClick={handleClose} color="primary" size={isMobile ? 'small' : 'medium'}>
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleAddRelation}
                        color="primary"
                        variant="contained"
                        size={isMobile ? 'small' : 'medium'}
                        disabled={(!editingRelation && !selectedPerson) || addUpdateRelationMutation.isPending}
                    >
                        {addUpdateRelationMutation.isPending ? (
                            <CircularProgress size={isMobile ? 20 : 24} />
                        ) : editingRelation ? (
                            'Oppdater'
                        ) : (
                            'Legg til'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                fullScreen={false}
                fullWidth
                maxWidth="xs"
                sx={
                    isMobile
                        ? {
                              '& .MuiDialog-paper': {
                                  margin: '16px',
                                  width: 'calc(100% - 32px)',
                                  maxHeight: 'calc(100% - 64px)',
                              },
                          }
                        : {}
                }
            >
                <DialogTitle sx={isMobile ? { fontSize: '1.1rem', py: 1.5 } : {}}>Bekreft sletting</DialogTitle>
                <DialogContent sx={isMobile ? { py: 1 } : {}}>
                    {relationToDelete && (
                        <Typography variant={isMobile ? 'body2' : 'body1'}>
                            Er du sikker på at du vil slette relasjonen med {relationToDelete.relatedPerson.firstname}{' '}
                            {relationToDelete.relatedPerson.lastname}?
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={isMobile ? { px: 2, pb: 2 } : {}}>
                    <Button
                        onClick={() => setIsDeleteDialogOpen(false)}
                        color="primary"
                        size={isMobile ? 'small' : 'medium'}
                    >
                        Avbryt
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        color="error"
                        variant="contained"
                        size={isMobile ? 'small' : 'medium'}
                        disabled={deleteRelationMutation.isPending}
                    >
                        {deleteRelationMutation.isPending ? <CircularProgress size={isMobile ? 20 : 24} /> : 'Slett'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
