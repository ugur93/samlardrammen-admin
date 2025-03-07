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
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { QueryClient } from '@tanstack/react-query';
import 'dayjs/locale/en-gb';
import React, { PropsWithChildren, Suspense, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLoggedInUser, useLogout } from '../api/usePersonsApi';
import { AppContextProvider, defaultPages, pages, useAppContext } from '../context/AppContext';
import LoginMagicLinkPage from './LoginMagicLink';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 2000,
            retry: 0,
        },
    },
});
export default function PageTemplate({ children }: PropsWithChildren<unknown>) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'en-gb'}>
            <AppContextProvider>
                <Box sx={{ flexGrow: 1 }}>
                    <CustomAppBar />
                </Box>
                <LoginProvider>{children}</LoginProvider>
            </AppContextProvider>
        </LocalizationProvider>
    );
}
function LoginProvider({ children }: PropsWithChildren<unknown>) {
    const loggedInUser = useLoggedInUser();
    const navigate = useNavigate();
    const location = useLocation();
    const initialLoggedIn = useRef(loggedInUser != null);
    const currentPage = pages.find((page) => page.url === location.pathname);
    const currentPageRoles = currentPage?.roles ?? [];
    useEffect(() => {
        console.log('loggedInUser', loggedInUser, initialLoggedIn.current, currentPage);
        if (!initialLoggedIn.current && loggedInUser && currentPageRoles.length > 0) {
            const defaultPage = defaultPages[loggedInUser.roles[0]];
            const pageUrl = pages.find((page) => page.name === defaultPage)?.url ?? '/user';
            navigate(pageUrl, { replace: true });
        }
    }, [loggedInUser]);
    if (loggedInUser == null && location.pathname.includes('login') == false && currentPageRoles.length > 0) {
        return <LoginMagicLinkPage />;
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
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
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
    const logoutUser = useLogout();
    const navigate = useNavigate();
    if (user) {
        return (
            <div className="flex items-center space-x-4">
                <Link className="!text-white pr-4" href="#/user">
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
