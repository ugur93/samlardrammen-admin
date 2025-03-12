import { type RouteConfig, layout, route } from '@react-router/dev/routes';

export default [
    layout('./pages/PageTemplate.tsx', [
        route('/user-admin', './routes/user.admin.tsx'),
        route('/organization-admin', './routes/organization.admin.tsx'),
        route('/login', './routes/login.tsx'),
        route('/user/:userId?', './routes/user.details.tsx'),
        route('/organization/:organizationId', './routes/organization.details.tsx'),
        route('/blog', './routes/blogs.tsx'),
        route('/blog/*', './routes/blogDetail.tsx'),
        route('/about-us', './routes/aboutus.tsx'),
        route('/history', './routes/ourhistory.tsx'),
    ]),
] satisfies RouteConfig;
