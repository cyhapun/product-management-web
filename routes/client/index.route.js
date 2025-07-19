const productRouters = require('./product.route');
const homeRouters = require('./home.route');
const productCategoryMiddlewares = require('../../middlewares/client/productCategory.middleware')
const searchRouters = require('./search.route');

module.exports = (app) => {
    app.use(productCategoryMiddlewares.addProductCategoriesDropdown);

    app.use('/', homeRouters);

    app.use('/products',productRouters);

    app.use('/search', searchRouters);
}