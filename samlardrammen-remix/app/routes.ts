import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
    layout('./pages/PageTemplate.tsx', [
        index('./routes/blogs.tsx', { id: 'blogsindex' }),
        route('/login', './routes/login.tsx'),
        route('/login2', './routes/login2.tsx'),
        route('/auth/confirm', './routes/login.tsx', { id: 'confirm' }),
        route('/blog', './routes/blogs.tsx'),
        route('/blog/*', './routes/blogDetail.tsx'),
        route('/about-us', './routes/aboutus.tsx'),
        route('/history', './routes/ourhistory.tsx'),
        layout('./pages/AdminLayout.tsx', [
            route('/user-admin', './routes/user.admin.tsx'),
            route('/user-registered-admin', './routes/user.registered.admin.tsx'),
            route('/organization-admin', './routes/organization.admin.tsx'),
            route('/sendEmail', './routes/email.resource.ts'),
            route('/organization/:organizationId', './routes/organization.details.tsx'),
        ]),
        layout('./pages/AuthLayout.tsx', [route('/user/:userId?', './routes/user.details.tsx')]),
    ]),
] satisfies RouteConfig;
