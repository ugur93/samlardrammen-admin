import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
    layout('./pages/PageTemplate.tsx', [
        index('./routes/home.tsx'),
        route('/user-admin', './routes/user.admin.tsx'),
        route('/organization-admin', './routes/organization.admin.tsx'),
        route('/login', './routes/login.tsx'),
        route('/user/:userId?', './routes/user.details.tsx'),
        route('/organization/:organizationId', './routes/organization.details.tsx'),
    ]),
] satisfies RouteConfig;
