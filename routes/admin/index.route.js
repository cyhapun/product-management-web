// const systemConfig = require('../../config/system');
const dashboardRoutes = require('./dashboard.route');
const productListRoutes = require('./productList.route');
const productCategoryRoutes = require('./productCategory.route')
const roleRoutes = require('./roles.route')
const accountListRoutes = require('./accounts.route');
const authRoutes = require('./auth.route');
const authMiddleware = require('../../middlewares/admin/auth.middleware');
const profileRoutes = require('./profile.route');
const settingsRoutes = require('./settings.route');

module.exports = (app) => {
  // Sử dụng biến trong systemConfig
  // const PATH_ADMIN = systemConfig.prefixAdmin;
  // app.use(PATH_ADMIN + '/dashboard', dashboardRoute.index);
  
  app.use(app.locals.prefixAdmin + '/dashboard', 
    authMiddleware.requireAdmin,
    dashboardRoutes);

  app.use(app.locals.prefixAdmin + '/product-list', 
    authMiddleware.requireAdmin,
    productListRoutes);
  
  app.use(app.locals.prefixAdmin + '/product-category', 
    authMiddleware.requireAdmin,
    productCategoryRoutes);

  app.use(app.locals.prefixAdmin + '/roles', 
    authMiddleware.requireAdmin,
    roleRoutes);
    
  app.use(app.locals.prefixAdmin + '/accounts', 
    authMiddleware.requireAdmin,
    accountListRoutes);
  
  app.use(app.locals.prefixAdmin + '/auth', authRoutes);

  app.use(app.locals.prefixAdmin + '/profile', 
    authMiddleware.requireAdmin,
    profileRoutes);

  app.use(app.locals.prefixAdmin + '/settings',
    authMiddleware.requireAdmin,
    settingsRoutes);
}