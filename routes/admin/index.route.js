// const systemConfig = require('../../config/system');
const dashboardRoutes = require('./dashboard.route');
const productListRoutes = require('./productList.route');
const productCategoryRoutes = require('./productCategory.route')
const roleRoutes = require('./roles.route')
const accountListRoutes = require('./accounts.route');

module.exports = (app) => {
  // Sử dụng biến trong systemConfig
  // const PATH_ADMIN = systemConfig.prefixAdmin;
  // app.use(PATH_ADMIN + '/dashboard', dashboardRoute.index);
  
  app.use(app.locals.prefixAdmin + '/dashboard', dashboardRoutes);
  app.use(app.locals.prefixAdmin + '/product-list', productListRoutes);
  app.use(app.locals.prefixAdmin + '/product-category', productCategoryRoutes);
  app.use(app.locals.prefixAdmin + '/roles', roleRoutes);
  app.use(app.locals.prefixAdmin + '/accounts', accountListRoutes);
}