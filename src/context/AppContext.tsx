import { User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLoggedInUser } from '../api/usePersonsApi';
import { PersonDetails } from '../types/personTypes';

export interface LoggedInUser {
    user: User;
    details: PersonDetails;
    roles: string[];
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
const base = '/samlardrammen-admin';

const defaultPages = { admin: 'user-admin', user: 'user' } as Record<string, string>;
const pages: PageDetail[] = [
    {
        name: 'user',
        url: `${base}/user`,
        roles: ['user'],
        label: 'User',
    },
    {
        name: 'user-admin',
        url: `${base}/user-admin`,
        roles: ['admin'],
        label: 'Uyeler',
    },
    {
        name: 'organizations',
        url: `${base}/organizations`,
        roles: ['admin'],
        label: 'Dernekler',
    },
];

function getPages(roles: string[]): PageDetail[] {
    return pages.filter((page) => page.roles.length == 0 || page.roles.some((role) => roles.includes(role)));
}
export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
    const loggedInUser = useLoggedInUser();
    const navigate = useNavigate();
    const location = useLocation();

    if (loggedInUser == null && location.pathname !== '/login') {
        navigate('/login');
        return null;
    }

    useEffect(() => {
        if (loggedInUser != null && location.pathname === '/login') {
            const defaultPage = defaultPages[loggedInUser.roles[0]];
            const pageUrl = pages.find((page) => page.name === defaultPage)?.url ?? '/';
            navigate(pageUrl);
        }
    }, [loggedInUser]);

    return (
        <AppContext.Provider
            value={{
                user: loggedInUser,
                roles: loggedInUser?.roles ?? [],
                isAdmin: loggedInUser?.roles.includes('admin') ?? false,
                pages: getPages(loggedInUser?.roles ?? []),
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);

export default AppContext;
