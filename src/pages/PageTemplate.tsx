import { AppBar, Box, Button, CircularProgress, Container, Link, Toolbar, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import 'dayjs/locale/en-gb';
import { PropsWithChildren, Suspense, useEffect, useRef } from 'react';
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
        <QueryClientProvider client={queryClient}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'en-gb'}>
                <AppContextProvider>
                    <Box sx={{ flexGrow: 1 }}>
                        <CustomAppBar />
                    </Box>
                    <LoginProvider>{children}</LoginProvider>
                </AppContextProvider>
            </LocalizationProvider>
            <ReactQueryDevtools />
        </QueryClientProvider>
    );
}
function LoginProvider({ children }: PropsWithChildren<unknown>) {
    const loggedInUser = useLoggedInUser();
    const navigate = useNavigate();
    const location = useLocation();
    const initialLoggedIn = useRef(loggedInUser != null);

    useEffect(() => {
        console.log('loggedInUser', loggedInUser, initialLoggedIn.current);
        if (!initialLoggedIn.current && loggedInUser) {
            const defaultPage = defaultPages[loggedInUser.roles[0]];
            const pageUrl = pages.find((page) => page.name === defaultPage)?.url ?? '/user';
            navigate(pageUrl, { replace: true });
        }
    }, [loggedInUser]);
    if (loggedInUser == null && location.pathname.includes('login') == false) {
        return <LoginMagicLinkPage />;
    }
    return (
        <Box>
            <Suspense fallback={<CircularProgress />}>{children}</Suspense>
        </Box>
    );
}

function CustomAppBar() {
    const { pages } = useAppContext();
    const navigate = useNavigate();
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
                    <UserButton />
                </Toolbar>
            </Container>
        </AppBar>
    );
}

function UserButton() {
    const { user } = useAppContext();
    const logoutUser = useLogout();
    if (user) {
        return (
            <div className="flex items-center space-x-4">
                <Link className="!text-white pr-4" href="#/user">
                    {user.details?.name}
                </Link>
                <Button
                    onClick={() => logoutUser.mutate()}
                    className="!bg-red-100 text-white py-1 px-3 rounded hover:!bg-red-200"
                >
                    Çıkış
                </Button>
            </div>
        );
    }
    return (
        <Button
            className=" text-white py-1 px-3 rounded hover:bg-blue-600"
            onClick={() => (window.location.href = '/login')}
        >
            Giriş
        </Button>
    );
}
