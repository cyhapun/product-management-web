const productsHelper = require('../../helpers/client/products');
const Products = require('../../models/product.model');

// [GET] /
module.exports.index = async (req, res) => {
    let featuredProducts = await Products.find({
        deleted: false,
        status: 'active',
        featured: true,
    }).limit(10); // Limit the amount of featured product

    featuredProducts = productsHelper.calculateNewPrice(featuredProducts);
    
    res.render('client/pages/home/index.pug', {
        pageTitle: "Home page",
        featuredProducts: featuredProducts,
    })
};