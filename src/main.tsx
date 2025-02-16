import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router';
import './index.css';
import LoginPage from './pages/LoginPage.tsx';
import { OrganizationDetailssPage } from './pages/OrganizationDetailsPage.tsx';
import { OrganizationsPage } from './pages/OrganizationsPage.tsx';
import PageTemplate from './pages/PageTemplate.tsx';
import { UserAdminPage } from './pages/UserAdminPage.tsx';
import UserDetailsPage from './pages/UserPage.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter basename="">
            <Routes>
                <Route
                    path="login"
                    element={
                        <PageTemplate>
                            <LoginPage />
                        </PageTemplate>
                    }
                />
                <Route path="user-admin" element={<UserAdminPage />} />
                <Route path="user" element={<UserDetailsPage />} />
                <Route path="user/:id" element={<UserDetailsPage />} />
                <Route path="organizations" element={<OrganizationsPage />} />
                <Route path="organization/:id" element={<OrganizationDetailssPage />} />
            </Routes>
        </HashRouter>
    </StrictMode>
);
