const productsHelper = require('../../helpers/client/products');
const Products = require('../../models/product.model');

// [GET] /
module.exports.index = async (req, res) => {
    // Get featured products
    let featuredProducts = await Products.find({
        deleted: false,
        status: 'active',
        featured: true,
    }).limit(10); // Limit the amount of featured product

    featuredProducts = productsHelper.calculateNewPrice(featuredProducts);
    // End of get featured products

    // Get new products
    let newProducts = await Products.find({
        deleted: false,
        status: 'active',
    }).sort({position: "desc"}).limit(6); // Limit the amount of new products

    newProducts = productsHelper.calculateNewPrice(newProducts);
    // End of get new products
    
    
    res.render('client/pages/home/index.pug', {
        pageTitle: "Home page",
        featuredProducts: featuredProducts,
        newProducts: newProducts,
    })
};