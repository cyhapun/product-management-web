const productRouters = require('./product.route');
const homeRouters = require('./home.route');
const productCategoryMiddlewares = require('../../middlewares/client/productCategory.middleware')
const searchRouters = require('./search.route');
const cartRouters = require('./cart.route');
const cartMiddlewares = require('../../middlewares/client/cart.middleware');
const checkoutRouters = require('./checkout.route');
const userRouters = require('./user.route');
const userMiddlerwares = require('../../middlewares/client/user.middlerware');
const settingsMiddlerwares = require('../../middlewares/client/settings.middleware');
const chatRouters = require('./chat.route');

module.exports = (app) => {
    app.use(settingsMiddlerwares.generalSettings);
    app.use(userMiddlerwares.addInfoUser);
    app.use(productCategoryMiddlewares.addProductCategoriesDropdown);
    app.use(cartMiddlewares.addTotalQuantityInCart);

    app.use('/', homeRouters);

    app.use('/products', productRouters);

    app.use('/search', searchRouters);

    app.use('/cart',
        cartMiddlewares.getCartWithInfoProducts, 
        cartRouters);

    app.use('/checkout', 
        cartMiddlewares.getCartWithInfoProducts,
        checkoutRouters);

    app.use('/user', 
        userRouters
    );

    app.use('/chat', 
        chatRouters
    );
}