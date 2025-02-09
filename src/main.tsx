import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import AdminPage, { UserAdminPage } from './pages/UserAdminPage.tsx';
import UserDetailsPage from './pages/UserPage.tsx';
import PageTemplate from './pages/PageTemplate.tsx';
import LoginPage from './pages/LoginPage.tsx';
import { OrganizationsPage } from './pages/OrganizationsPage.tsx';
import { OrganizationDetailssPage } from './pages/OrganizationDetailsPage.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PageTemplate>
                            <LoginPage />
                        </PageTemplate>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <PageTemplate>
                            <LoginPage />
                        </PageTemplate>
                    }
                />
                <Route path="/user-admin" element={<UserAdminPage />} />
                <Route path="/user" element={<UserDetailsPage />} />
                <Route path="/user/:id" element={<UserDetailsPage />} />
                <Route path="/organizations" element={<OrganizationsPage />} />
                <Route path="/organization/:id" element={<OrganizationDetailssPage />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
