const ProductCategories = require('../../models/productCategory.model');
const createTreeHelper = require('../../helpers/createTree');

module.exports.addProductCategoriesDropdown = async (req, res, next) => {
  const categories = await ProductCategories.find({deleted:false});
  const categoriesTree = createTreeHelper(categories)
  
  res.locals.productCategoriesDropdown = categoriesTree;
  next();
} 