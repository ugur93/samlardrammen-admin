import DeleteIcon from '@mui/icons-material/Delete';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { createClient, type User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useActionData, useLoaderData, useSubmit } from 'react-router';
import type { Route } from '../+types/root';
import { useGetPersonByEmailSimple, useUpdatePersonRoles } from '../api/usePersonsApi';
import { supabaseClientLoader } from '../loaders/supabaseloader';
import { getUserRoles } from '../loaders/supabaseServerClient';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Medlemmer' }, { name: 'description', content: 'Medlemsliste' }];
}

export async function loader({ request }: Route.LoaderArgs) {
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    const roles = await getUserRoles(request);
    if (roles) {
        if (roles.includes('admin')) {
            const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            });
            const {
                data: { users },
            } = await supabase.auth.admin.listUsers({
                page: 1,
                perPage: 1000,
            });
            return { ...supabaseloader, users, hasAccess: true };
        }
    }
    return { ...supabaseloader, users: [], hasAccess: false };
}

// Action to handle user deletion
export async function action({ request }: Route.ActionArgs) {
    // Verify the user has admin role
    const roles = await getUserRoles(request);
    if (!roles || !roles.includes('admin')) {
        return { success: false, message: 'Insufficient permissions' };
    }

    const formData = await request.formData();
    const action = formData.get('action') as string;
    const userId = formData.get('userId') as string;

    if (action === 'deleteUser' && userId) {
        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        try {
            // Delete user from Supabase Auth
            const { error } = await supabase.auth.admin.deleteUser(userId);
            if (error) throw error;
            return { success: true, message: 'Bruker slettet' };
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, message: 'Feil ved sletting av bruker' };
        }
    }

    return { success: false, message: 'Invalid action' };
}

type Order = 'asc' | 'desc';
type UserSortKey = 'email' | 'last_sign_in_at';

// Available roles for selection
const availableRoles = ['admin', 'user', 'editor', 'contributor'];

// User Row component that fetches person data by email and displays roles
function UserRow({ user }: { user: User }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const submit = useSubmit();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null);

    // Get person data based on email to access roles
    const personData = useGetPersonByEmailSimple(user.email ?? user.user_metadata.email);
    const updateRoles = useUpdatePersonRoles();

    const formatDate = (dateString?: string | null): string => {
        if (!dateString) return 'Aldri innlogget';

        const date = new Date(dateString);
        return (
            date.toLocaleDateString('nb-NO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }) +
            ' ' +
            date.toLocaleTimeString('nb-NO', {
                hour: '2-digit',
                minute: '2-digit',
            })
        );
    };

    // Function to add a role to user
    const handleAddRole = async (roleToAdd: string) => {
        if (!personData?.person) return;

        const currentRoles = personData.person.roles || [];
        if (!currentRoles.includes(roleToAdd)) {
            const newRoles = [...currentRoles, roleToAdd];
            await updateRoles(personData.person.id, user.email!, user.id, newRoles);
        }
        setRoleMenuAnchor(null);
    };

    // Function to remove a role from user
    const handleRemoveRole = async (roleToRemove: string) => {
        if (!personData?.person?.roles) return;

        const newRoles = personData.person.roles.filter((role) => role !== roleToRemove);
        await updateRoles(personData.person.id, user.email!, user.id, newRoles);
    };

    // Handle delete user
    const handleDeleteUser = () => {
        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('action', 'deleteUser');
        submit(formData, { method: 'post' });
        setDeleteDialogOpen(false);
    };

    // Get available roles for user (roles that are not already assigned)
    const getAvailableRoles = () => {
        const currentRoles = personData?.person?.roles || [];
        return availableRoles.filter((role) => !currentRoles.includes(role));
    };

    // Open role menu
    const handleOpenRoleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setRoleMenuAnchor(event.currentTarget);
    };

    // Close role menu
    const handleCloseRoleMenu = () => {
        setRoleMenuAnchor(null);
    };

    // Mobile card view rendering
    if (isMobile) {
        return (
            <Card sx={{ mb: 2, position: 'relative' }}>
                <CardContent sx={{ pb: 1 }}>
                    <Typography variant="subtitle1" component="div" fontWeight="medium" gutterBottom>
                        {user.email}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Sist innlogget: {formatDate(user.last_sign_in_at)}
                    </Typography>

                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="body2" component="div" gutterBottom>
                            Roller:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {personData?.person?.roles && personData.person.roles.length > 0 ? (
                                personData.person.roles.map((role, index) => (
                                    <Chip
                                        key={index}
                                        label={role}
                                        color={role === 'admin' ? 'primary' : 'default'}
                                        size="small"
                                        onDelete={() => handleRemoveRole(role)}
                                        sx={{ mb: 0.5 }}
                                    />
                                ))
                            ) : (
                                <Typography variant="caption" color="text.secondary">
                                    Ingen roller
                                </Typography>
                            )}

                            {/* Only show the add button if there are available roles to add */}
                            {getAvailableRoles().length > 0 && (
                                <>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={handleOpenRoleMenu}
                                        sx={{ height: 32, minWidth: 'auto', ml: 0.5 }}
                                    >
                                        + Rolle
                                    </Button>
                                    <Menu
                                        anchorEl={roleMenuAnchor}
                                        open={Boolean(roleMenuAnchor)}
                                        onClose={handleCloseRoleMenu}
                                    >
                                        {getAvailableRoles().map((role) => (
                                            <MenuItem key={role} onClick={() => handleAddRole(role)} dense>
                                                {role}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </>
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            Slett
                        </Button>
                    </Box>
                </CardContent>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle>Slett bruker</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Er du sikker på at du vil slette brukeren {user.email}? Dette kan ikke angres.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Avbryt</Button>
                        <Button onClick={handleDeleteUser} color="error">
                            Slett
                        </Button>
                    </DialogActions>
                </Dialog>
            </Card>
        );
    }

    // Standard table row for desktop view
    return (
        <TableRow
            key={user.id}
            sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
        >
            <TableCell component="th" scope="row">
                {user.email}
            </TableCell>
            <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
            <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                    {personData?.person?.roles && personData.person.roles.length > 0 ? (
                        personData.person.roles.map((role, index) => (
                            <Chip
                                key={index}
                                label={role}
                                color={role === 'admin' ? 'primary' : 'default'}
                                size="small"
                                onDelete={() => handleRemoveRole(role)}
                            />
                        ))
                    ) : (
                        <Typography variant="caption" color="text.secondary">
                            Ingen roller
                        </Typography>
                    )}

                    {/* Only show the add button if there are available roles to add */}
                    {getAvailableRoles().length > 0 && (
                        <>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={handleOpenRoleMenu}
                                sx={{ height: 24, minWidth: 'auto', ml: 1 }}
                            >
                                +
                            </Button>
                            <Menu
                                anchorEl={roleMenuAnchor}
                                open={Boolean(roleMenuAnchor)}
                                onClose={handleCloseRoleMenu}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                {getAvailableRoles().map((role) => (
                                    <MenuItem key={role} onClick={() => handleAddRole(role)} dense>
                                        {role}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </>
                    )}
                </Box>
            </TableCell>
            <TableCell align="right">
                <IconButton color="error" onClick={() => setDeleteDialogOpen(true)} size="small">
                    <DeleteIcon />
                </IconButton>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Slett bruker</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Er du sikker på at du vil slette brukeren {user.email}? Dette kan ikke angres.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Avbryt</Button>
                        <Button onClick={handleDeleteUser} color="error">
                            Slett
                        </Button>
                    </DialogActions>
                </Dialog>
            </TableCell>
        </TableRow>
    );
}

export default function UserRegisteredAdmin() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { users, hasAccess } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const [sortedUsers, setSortedUsers] = useState<typeof users>([]);
    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<UserSortKey>('last_sign_in_at');
    const [notificationOpen, setNotificationOpen] = useState(false);

    useEffect(() => {
        if (actionData?.message) {
            setNotificationOpen(true);
        }
    }, [actionData]);

    useEffect(() => {
        if (users) {
            const sorted = [...users].sort((a, b) => {
                if (orderBy === 'email') {
                    return order === 'asc'
                        ? (a.email || '').localeCompare(b.email || '')
                        : (b.email || '').localeCompare(a.email || '');
                } else {
                    const dateA = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
                    const dateB = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
                    return order === 'asc' ? dateA - dateB : dateB - dateA;
                }
            });
            setSortedUsers(sorted);
        }
    }, [users, order, orderBy]);

    const handleRequestSort = (property: UserSortKey) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    if (!hasAccess) {
        return <div>Ingen tilgang</div>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4, px: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: { xs: 2, sm: 4 } }}>
                <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" gutterBottom>
                    Medlemsliste
                </Typography>
                <Typography variant={isMobile ? 'body2' : 'subtitle1'} color="text.secondary" gutterBottom>
                    Oversikt over alle registrerte brukere i systemet
                </Typography>

                {/* Notification message */}
                {notificationOpen && actionData?.message && (
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2,
                            mb: 2,
                            bgcolor: actionData.success ? 'success.light' : 'error.light',
                        }}
                    >
                        <Typography variant={isMobile ? 'body2' : 'body1'}>{actionData.message}</Typography>
                        <Button size="small" onClick={() => setNotificationOpen(false)}>
                            Lukk
                        </Button>
                    </Paper>
                )}
            </Box>

            {isMobile ? (
                // Mobile view - card list
                <Box>
                    {sortedUsers.map((user) => (
                        <UserRow key={user.id} user={user} />
                    ))}
                </Box>
            ) : (
                // Desktop view - table
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                    <TableContainer sx={{ borderRadius: 1 }}>
                        <Table aria-label="sortable user table">
                            <TableHead sx={{ backgroundColor: 'primary.light' }}>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'email'}
                                            direction={orderBy === 'email' ? order : 'asc'}
                                            onClick={() => handleRequestSort('email')}
                                        >
                                            Email
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'last_sign_in_at'}
                                            direction={orderBy === 'last_sign_in_at' ? order : 'asc'}
                                            onClick={() => handleRequestSort('last_sign_in_at')}
                                        >
                                            Sist innlogget
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Roller</TableCell>
                                    <TableCell align="right">Handling</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedUsers.map((user) => (
                                    <UserRow key={user.id} user={user} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Container>
    );
}
