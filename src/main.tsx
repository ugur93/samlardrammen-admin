import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as dayjs from 'dayjs';
import 'dayjs/locale/nb';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router';
import { BlogNavigationProvider } from './contexts/BlogNavigationContext';
import './index.css';
import AboutPage from './pages/AboutPage.tsx';
import BlogDetailPage from './pages/BlogDetailPage.tsx';
import BlogListingPage from './pages/BlogListingPage.tsx';
import LoginMagicLinkPage from './pages/LoginMagicLink.tsx';
import { OrganizationDetailssPage } from './pages/OrganizationDetailsPage.tsx';
import { OrganizationsPage } from './pages/OrganizationsPage.tsx';
import OurHistoryPage from './pages/OurHistoryPage.tsx';
import PageTemplate from './pages/PageTemplate.tsx';
import { UserAdminPage } from './pages/UserAdminPage.tsx';
import UserDetailsPage from './pages/UserPage.tsx';
dayjs.locale('nb');
// Create a React Query client
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

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BlogNavigationProvider>
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<UserDetailsPage />} />
                        <Route
                            path="login"
                            element={
                                <PageTemplate>
                                    <LoginMagicLinkPage />
                                </PageTemplate>
                            }
                        />
                        <Route path="user-admin" element={<UserAdminPage />} />
                        <Route path="user" element={<UserDetailsPage />} />
                        <Route path="user/:id" element={<UserDetailsPage />} />
                        <Route path="organizations" element={<OrganizationsPage />} />
                        <Route path="organization/:id" element={<OrganizationDetailssPage />} />
                        <Route
                            path="auth/confirm"
                            element={
                                <PageTemplate>
                                    <LoginMagicLinkPage />
                                </PageTemplate>
                            }
                        />
                        {/* Blog routes */}
                        <Route path="blog" element={<BlogListingPage />} />
                        <Route path="about" element={<AboutPage />} />
                        <Route path="history" element={<OurHistoryPage />} />
                        {/* Use wildcard path matching for blog details to support multiple slashes */}
                        <Route path="blog/*" element={<BlogDetailPage />} />
                    </Routes>
                </HashRouter>
            </BlogNavigationProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </StrictMode>
);
