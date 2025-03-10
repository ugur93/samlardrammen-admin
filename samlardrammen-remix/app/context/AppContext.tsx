import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import * as supabasePkg from '@supabase/supabase-js';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import r from 'react';
import { useLoggedInUser } from '../api/usePersonsApi';
import { type PersonDetails } from '../types/personTypes';
const { createContext, useContext } = r;

export interface LoggedInUser {
    user: supabasePkg.User;
    details: PersonDetails;
    roles: string[];
    isAdmin: boolean;
}
interface AppContextProps {
    user: LoggedInUser | null;
    roles: string[];
    isAdmin: boolean;
    pages: PageDetail[];
}
const AppContext = createContext<AppContextProps>({
    user: null,
    isAdmin: false,
    roles: [],
    pages: [],
});

interface AppContextProviderProps {
    children: r.ReactNode;
}

interface PageDetail {
    name: string;
    url: string;
    roles: string[];
    label: string;
}
export const base = '/samlardrammen-admin/#';

export const defaultPages = { admin: 'user-admin', user: 'user' } as Record<string, string>;
export const pages: PageDetail[] = [
    {
        name: 'user',
        url: `/user`,
        roles: ['user'],
        label: 'User',
    },
    {
        name: 'blog',
        url: `/blog`,
        roles: [],
        label: 'Nyheter',
    },
    {
        name: 'about_us',
        url: `/about`,
        roles: [],
        label: 'Om oss',
    },
    {
        name: 'our_history',
        url: `/history`,
        roles: [],
        label: 'Vår historie',
    },
    {
        name: 'user-admin',
        url: `/user-admin`,
        roles: ['admin'],
        label: 'Medlemmer',
    },
    {
        name: 'organizations',
        url: `/organization-admin`,
        roles: ['admin'],
        label: 'Organisasjoner',
    },
];

function getPages(roles: string[]): PageDetail[] {
    return pages.filter((page) => page.roles.length == 0 || page.roles.some((role) => roles.includes(role)));
}
export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }: r.PropsWithChildren<unknown>) => {
    const { person: loggedInUser } = useLoggedInUser();

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'nb'}>
            <AppContext.Provider
                value={{
                    user: loggedInUser,
                    isAdmin: loggedInUser?.roles?.includes('admin') ?? false,
                    roles: loggedInUser?.roles ?? [],
                    pages: getPages(loggedInUser?.roles ?? []),
                }}
            >
                {children}
            </AppContext.Provider>
            <ReactQueryDevtools initialIsOpen={false} />
        </LocalizationProvider>
    );
};

export const useAppContext = () => useContext(AppContext);

export default AppContext;
