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
export const base = '/samlardrammen-admin/#';

const defaultPages = { admin: 'user-admin', user: 'user' } as Record<string, string>;
const pages: PageDetail[] = [
    {
        name: 'user',
        url: `/user`,
        roles: ['user'],
        label: 'User',
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
export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
    const loggedInUser = useLoggedInUser();
    const navigate = useNavigate();
    const location = useLocation();

    if (loggedInUser == null && location.pathname.includes('login') == false) {
        navigate('/login');
        return null;
    }

    useEffect(() => {
        if ((loggedInUser != null && location.pathname.includes('login') == true) || location.pathname === '/') {
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
