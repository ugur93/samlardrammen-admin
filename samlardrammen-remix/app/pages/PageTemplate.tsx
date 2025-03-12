import MenuIcon from '@mui/icons-material/Menu';
import {
    AppBar,
    Box,
    Button,
    CircularProgress,
    Container,
    IconButton,
    Link,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import 'dayjs/locale/en-gb';
import React, { Suspense, type PropsWithChildren } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useLoggedInUser, useLogout } from '../api/usePersonsApi';
import { AppContextProvider, useAppContext } from '../context/AppContext';
import { supabaseClientLoader } from '../loaders/supabaseloader';

export async function loader() {
    const [supabaseloader] = await Promise.all([supabaseClientLoader()]);
    return { ...supabaseloader };
}

export default function PageTemplate() {
    return (
        <AppContextProvider>
            <div className="w-full">
                <Box sx={{ flexGrow: 1 }}>
                    <CustomAppBar />
                </Box>
                <LoginProvider>
                    <Outlet />
                </LoginProvider>
            </div>
        </AppContextProvider>
    );
}
function LoginProvider({ children }: PropsWithChildren<unknown>) {
    const { isLoading } = useLoggedInUser();

    if (isLoading) {
        return (
            <Stack alignItems="center">
                <CircularProgress />
            </Stack>
        );
    }

    return (
        <Box>
            <Suspense fallback={<CircularProgress />}>{children}</Suspense>
        </Box>
    );
}

function CustomAppBar() {
    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'sans-serif',
                            fontWeight: 700,
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Samlardrammen
                    </Typography>

                    <ToolbarMenu />

                    <UserButton />
                </Toolbar>
            </Container>
        </AppBar>
    );
}

function ToolbarMenu() {
    const theme = useTheme();
    const { pages } = useAppContext();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if (pages.length === 0) return;
    if (!isMobile) {
        return (
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'flex' } }}>
                {pages.map((page) => (
                    <Button
                        key={page.label}
                        sx={{ my: 2, color: 'white', display: 'block' }}
                        onClick={() => navigate(page.url)}
                    >
                        {page.label}
                    </Button>
                ))}
            </Box>
        );
    }
    return (
        <>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
            >
                <MenuIcon />
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {pages.map((page) => (
                    <MenuItem key={page.label} sx={{ my: 2, display: 'block' }} onClick={() => navigate(page.url)}>
                        {page.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

function UserButton() {
    const { user } = useAppContext();
    console.log(user);
    const logoutUser = useLogout();
    const navigate = useNavigate();
    if (user) {
        return (
            <div className="flex items-center space-x-4">
                <Link className="!text-white pr-4" href="/user">
                    {user.details?.name ?? user.user?.email}
                </Link>
                <Button
                    onClick={() => logoutUser.mutate()}
                    className="!bg-red-100 text-white py-1 px-3 rounded hover:!bg-red-200"
                >
                    Logg ut
                </Button>
            </div>
        );
    }
    return (
        <Button
            className="!bg-red-100 text-white py-1 px-3 rounded hover:!bg-red-200"
            onClick={() => navigate('/login')}
        >
            Logg inn
        </Button>
    );
}
