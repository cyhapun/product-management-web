const ProductCategories = require('../../models/productCategory.model');

const buttonStatusFilterHelper = require('../../helpers/filterStatus');
const searchObjectHelper = require('../../helpers/search.js');
const paginationHelper = require('../../helpers/pagination.js');
const createTreeHelper = require('../../helpers/createTree')

// [GET] /admin/product-category
module.exports.index = async (req, res) => {
  // req sẽ chứa mọi thông tin yêu cầu từ client
  // Ở đây ta sẽ lấy ra yêu cầu từ url bằng req.query (sau dấu ?)
  // console.log(req);
  // console.log(req.query);
  // console.log(req.query.status);  

  let condition = {
    deleted: false,
  }

  // Filter by status
  const buttonStatusFilter = buttonStatusFilterHelper(req.query);
  // End filter by status

  // Sort
  const sortCondition = {};
  if (req.query.sortBy && req.query.sortValue) {
    // Use '[]' or '.' is okay but use '[]' when the key is dynamic(we dont know the key in advance)
    sortCondition[req.query.sortBy] = req.query.sortValue;
  }
  else {
    sortCondition.position = 'desc'; // Default sort by position ascending
  }
  // End sort

  // Tìm kiếm sản phẩm (Filter product):
  //Trả về một object gồm regex(để tìm kiếm) và keyword để làm giá trị cho ô input:
  const searchObj = searchObjectHelper(req.query);
  // Cách 1 tìm kiếm sản phẩm: Dùng regex
  if (searchObj.regex) {
    condition.title = searchObj.regex;
  }  
  // Gán điều kiện tìm products cho model:
  if (req.query.status) {
    condition.status = req.query.status;
  }
  // Kết thúc tìm kiếm sản phẩm(End filter product)

  // Pagination
  const numberProductCategory = await ProductCategories.countDocuments(condition);
  const objectPagination = paginationHelper(req.query, numberProductCategory);
  // End Pagination
  
  // Query data from database
  let categories = await ProductCategories.find(condition)
  .sort(sortCondition)
  .skip(objectPagination.skip)
  .limit(objectPagination.limit);

  res.render('admin/pages/productCategory/index', {
    pageTitle: "Product categories",
    productCategories: categories,
    buttonStatusFilter: buttonStatusFilter,
    keyword: searchObj.keyword,
    pagination: objectPagination
  })
}

// [GET] /admin/product-category/create-new
module.exports.createNewCategory = async (req, res) => {
  const categories = await ProductCategories.find({deleted:false});
  const categoriesTree = createTreeHelper(categories)

  res.render('admin/pages/productCategory/createNewCategory', {
      pageTitle: 'Create new category',
      categories: categoriesTree,
    }
  )
}

// [POST] /admin/product-category/create-new
module.exports.createNewCategoryMethodPost = async (req, res) => {
  req.body.position = req.body.position === '' ? parseInt(await ProductCategories.countDocuments()) + 1 : parseInt(req.body.position);
  // req.file là một obj của ảnh tải từ user.
  // Nếu k có ảnh -> undefined -> error if not check
  // req.body.thumbnail = req.file ? `/uploads/${req.file.filename}` : ''; 
  // comment do ta đã dùng middleware upload để xử lý ảnh trước khi đến controller này.

  // Tạo mới 1 sản phẩm:
  const newCategories = new ProductCategories(req.body);
  await newCategories.save();

  // Thông báo thành công:
  req.flash('success', `Thêm sản phẩm thành công!`);

  // Dùng để chuyển hướng (redirect) người dùng về trang trước đó hoặc chuyển hướng về trang chủ ("/") nếu không có trang trước.
  // Ngoài ra ta có thể fix cứng 1 trang web cụ thể
  res.redirect(req.get("Referrer") || "/");
}

// [GET] /admin/product-category/modify-product/:id
module.exports.modifyCategory = async (req, res) => {
  try {
    const category = await ProductCategories.findOne({_id: req.params.id, deleted:false})
    const categories = await ProductCategories.find({deleted:false});
    const categoryTree = createTreeHelper(categories)

    res.render("admin/pages/productCategory/modifyProductCategory", {
      category: category,
      categoryTree: categoryTree
    });
  }
  catch (error){
    req.flash("error", "Product category is undefined!")
    return res.redirect(req.get("Referrer") || "/admin/product-category");
  }
}

// [PACTH] /admin/product-category/modify-product/:id
module.exports.modifyProductCategoryMethodPost = async (req, res) => {
  const categoryId = req.params.id;
  req.body.position = req.body.position === '' ? parseInt(await Products.countDocuments()) + 1 : parseInt(req.body.position);

  try {
    await CategoriesProduct.updateOne({_id:categoryId}, req.body);
  }
  catch (error) {
    req.flash("error", "Product category is undefined, update fail!")
    return res.redirect(req.get("Referrer") || "/");
  }
  // // Thông báo thành công:
  req.flash('success', `Update product category successfully!`);
  // Dùng để chuyển hướng (redirect) người dùng về trang trước đó hoặc chuyển hướng về trang chủ ("/") nếu không có trang trước.
  // Ngoài ra ta có thể fix cứng 1 trang web cụ thể
  res.redirect(req.get("Referrer") || "/admin/product-category");
}