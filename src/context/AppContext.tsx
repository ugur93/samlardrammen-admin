import { User } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, ReactNode, useContext } from 'react';
import { useLoggedInUser } from '../api/usePersonsApi';
import { PersonDetails } from '../types/personTypes';

export interface LoggedInUser {
    user: User;
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
    children: ReactNode;
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
        url: `/organizations`,
        roles: ['admin'],
        label: 'Organisasjoner',
    },
];

function getPages(roles: string[]): PageDetail[] {
    return pages.filter((page) => page.roles.length == 0 || page.roles.some((role) => roles.includes(role)));
}
export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }: PropsWithChildren<unknown>) => {
    const loggedInUser = useLoggedInUser();

    return (
        <AppContext.Provider
            value={{
                user: loggedInUser,
                isAdmin: loggedInUser?.roles.includes('admin') ?? false,
                roles: loggedInUser?.roles ?? [],
                pages: getPages(loggedInUser?.roles ?? []),
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);

export default AppContext;
