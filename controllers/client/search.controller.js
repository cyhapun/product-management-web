const Products = require('../../models/product.model');
const productsHelper = require('../../helpers/client/products');

// [GET] /search
module.exports.index = async (req, res) => {
  const keyword = req.query.keyword;
  let products = [];

  if (keyword) {
    const regex = new RegExp(keyword, 'i');
    products = await Products.find({
      deleted:false,
      status: 'active',
      title: regex,
    });
    if (products) {
      products = productsHelper.calculateNewPrice(products);
    }
  }

  res.render('client/pages/search/index.pug', {
    pageTitle: "Results",
    keyword: keyword,
    products:products,
  });
}