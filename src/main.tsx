import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import AdminPage, { UserAdminPage } from './pages/UserAdminPage.tsx';
import UserDetailsPage from './pages/UserPage.tsx';
import PageTemplate from './pages/PageTemplate.tsx';
import LoginPage from './pages/LoginPage.tsx';
import { OrganizationsPage } from './pages/OrganizationsPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageTemplate><LoginPage /></PageTemplate>} />
        <Route path="/login" element={<PageTemplate><LoginPage /></PageTemplate>} />
        <Route path="/user-admin" element={<UserAdminPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/organizations" element={<OrganizationsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);


function UserPage() {
  return <PageTemplate>
    <UserDetailsPage />
  </PageTemplate>
}