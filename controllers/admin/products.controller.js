const Products = require('../../models/product.model');
const ProductCategories = require('../../models/productCategory.model.js');
const Accounts = require('../../models/account.model.js');

// Tách từng chức năng theo module để reuse and easy to management
const buttonStatusFilterHelper = require('../../helpers/filterStatus');
const searchObjectHelper = require('../../helpers/search.js');
const paginationHelper = require('../../helpers/pagination.js');
const createTreeHelper = require('../../helpers/createTree.js');
const isFuturedHelper = require('../../helpers/checkFeatured.js')

// Comment ghi chú [Method] path để quản lí dễ

// [GET] /admin/product-list
module.exports.products = async (req, res) => {
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
  const numberProduct = await Products.countDocuments(condition);
  const objectPagination = paginationHelper(req.query, numberProduct);
  // End Pagination
  
  // Query data from database
  let products = await Products.find(condition)
  .sort(sortCondition)
  .skip(objectPagination.skip)
  .limit(objectPagination.limit);

  // Cách 2 tìm kiếm sản phẩm: ta lấy danh sách product như bình thường rồi dùng 1 hàm filter kiểm tra xem product đó có keyword đó không:
  // if (req.query.keyword) {
  //   const filterProducts = products.filter(product => product.title.toLocaleLowerCase().includes(req.query.keyword.toLocaleLowerCase()));

  //   products = filterProducts;
  // }

  // Lấy thông tin người tạo sản phẩm từ accountId  
  for (let i = 0; i < products.length; i++) {
    const account = await Accounts.findOne({_id: products[i].createdBy.accountId, deleted: false});
    if (account) {
      products[i].creator = account.fullName;
    } else {
      products[i].creator = null;
    }
  }

  // Lấy thông tin người cập nhật sản phẩm từ accountId
  for (let i = 0; i < products.length; i++) {
    if (products[i].updatedBy && products[i].updatedBy.length > 0) {
      const account = await Accounts.findOne({_id: products[i].updatedBy[products[i].updatedBy.length - 1].accountId, deleted: false});
      if (account) {
        products[i].updatedBy[products[i].updatedBy.length - 1].fullName = account.fullName;
      } else {
        products[i].updatedBy[products[i].updatedBy.length - 1].fullName = null;
      }
    }
  }

  res.render('admin/pages/products/index', {
    pageTitle: "Products",
    products: products,
    buttonStatusFilter: buttonStatusFilter,
    keyword: searchObj.keyword,
    pagination: objectPagination
  })
}

// [PATCH] /admin/product-list/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  // req.params dùng để lấy tham số từ URL khi sử dụng route parameters(trả về 1 object chứa các tham số).
  // console.log(req.params);

  const newStatus = req.params.status;
  const productId = req.params.id;
  const updated = {
    accountId: res.locals.user._id || null,
    updatedAt: new Date()
  }

  // Do trường id trong DB có tên _id
  await Products.updateOne({_id: productId}, {
    status:newStatus, 
    $push: {
      updatedBy: updated
    }
  });
  
  // Thông báo cập nhật thành công.
  req.flash('success', 'Cập nhật trạng thái sản phẩm thành công thành công!');

  // Chuyển hướng về trang trước đó 
  // res.redirect('back');
  // An toàn và bảo mật hơn
  res.redirect(req.get("Referrer") || "/");
}

// [PATCH] /admin/product-list/multi-change
module.exports.multiChange = async (req, res) => {
  // Mở phần network sẽ thấy có dữ liệu nhưng nodejs k nhận được
  // Nên ta cần tải thư viện body-parser để có thể lấy được dữ liệu từ req.body
  // console.log(req.body);
  const ids = req.body.ids.split(', ');
  const type = req.body.type;
  const updated = {
    accountId: res.locals.user._id || null,
    updatedAt: new Date()
  }

  switch (type) {
    case "active":
      await Products.updateMany({_id: {$in:ids}}, {status: type, $push: {updatedBy: updated}});      
      req.flash('success', `Cập nhật trạng thái thành công cho ${ids.length} sản phẩm!`);
      break;
    case "inactive":
      await Products.updateMany({_id: {$in:ids}}, {status: type, $push: {updatedBy: updated}});    
      req.flash('success', `Cập nhật trạng thái thành công cho ${ids.length} sản phẩm!`);
      break;
    case "delete-product":
      // Xóa mềm
      const deletedBy = {
        accountId: res.locals.user._id || null,
        deletedAt: new Date()
      }
      await Products.updateMany({_id: {$in:ids, deletedBy:deletedBy}}, {
        deleted:true,
        deletedBy: {
          accountId: res.locals.user._id || null,
          deletedAt: new Date()
        }
      });    
      req.flash('success', `Đã xóa ${ids.length} sản phẩm thành công!`);
      break;
    case "change-position":
      // Lưu ý forEach là một phương thức đồng bộ. Khi truyền một hàm bất đồng bộ (async function) vào forEach, 
      // nó sẽ gọi hàm đó ngay lập tức cho từng phần tử, nhưng không chờ từng Promise hoàn thành trước khi tiếp tục với phần tử tiếp theo.
      // (Khi sử dụng await trong một vòng lặp, vòng lặp cần trả về một Promise để có thể await được. Nhưng forEach luôn trả về undefined,
      //  vì vậy không thể await nó thay vào đó sử dụng for of để thay thế.
      for (const product of ids) {    
        // Ta có thể dùng như này hoặc destructuring (phá vỡ cấu trúc):
        // Lưu ý {a, b} dành cho object
        // const productId = product.split('-')[0];
        // const productPosition = product.split('-')[1];
        const [productId, productPosition] =  product.split('-');
        // Lưu ý kiểu dữ liệu lưu trữ trong DB       
        await Products.updateOne({_id:productId}, {
          position: parseInt(productPosition),
          $push: {
            updatedBy: updated
          }
        });
      }
      req.flash('success', `Thay đổi vị trí cho ${ids.length} sản phẩm thành công!`);
    default:
      break;
  }

  // Chuyển hướng về trang trước đó 
  // res.redirect('back');
  // An toàn và bảo mật hơn
  res.redirect(req.get("Referrer") || "/");
}

// [DELETE] /admin/product-list/delete-product/:id
// Phương thức chỉ có tác dụng ngữ nghĩa k ảnh hưởng gì nên ta có thể dùng bất kì phương thức gì cũng được.
module.exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;

  // Có 2 kiểu delete product: Một là xóa hẳn khỏi db, hai là xóa 'mềm' gán thuộc tính deleted=true để k hiển thị ra giao diện.
  // Xóa hẳn khỏi DB:
  // await Products.deleteOne({_id: productId});
  
  // Xóa 'mềm':
  await Products.updateOne({_id:productId}, {
    deleted:true, 
    deletedBy: {
      accountId: res.locals.user._id || null, 
      deletedAt: new Date()
    }
  });

  // --> Ta có thể làm 1 trang 'Thùng rác'(xóa mềm) và trong trang đó có chức năng khôi phục và xóa vĩnh viễn(xóa khỏi DB).

  // Thông báo xóa thành công
  req.flash('success', `Đã xóa sản phẩm thành công!`);
  // Chuyển hướng về trang trước đó 
  // res.redirect('back');
  // An toàn và bảo mật hơn
  res.redirect(req.get("Referrer") || "/");
}

// [GET] /admin/product-list/create-new
module.exports.createNewProduct = async (req, res) => {
  const categories = await ProductCategories.find({deleted:false});
  const categoryTree = createTreeHelper(categories);

  res.render('admin/pages/products/createNew', {
    pageTitle: 'Create new product',
    categoryTree: categoryTree,
  });
}

// [POST] /admin/product-list/create-new
module.exports.createNewProductMethodPost = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  req.body.position = req.body.position === '' ? parseInt(await Products.countDocuments()) + 1 : parseInt(req.body.position);
  // req.file là một obj của ảnh tải từ user.
  // Nếu k có ảnh -> undefined -> error if not check
  // req.body.thumbnail = req.file ? `/uploads/${req.file.filename}` : ''; comment do ta đã dùng middleware upload để xử lý ảnh trước khi đến controller này.
  // // Trả về 1 object:
  // console.log(req.body);
  if (req.body.featured) {
    req.body.featured = isFuturedHelper(req.body.featured);
  }
  
  req.body.createdBy = {
    accountId: res.locals.user._id || null, 
  };
  
  // Tạo mới 1 sản phẩm:
  const newProduct = new Products(req.body);
  await newProduct.save();

  // Thông báo thành công:
  req.flash('success', `Thêm sản phẩm thành công!`);

  // Dùng để chuyển hướng (redirect) người dùng về trang trước đó hoặc chuyển hướng về trang chủ ("/") nếu không có trang trước.
  // Ngoài ra ta có thể fix cứng 1 trang web cụ thể
  res.redirect(req.get("Referrer") || "/");
} 

// [GET] /admin/product-list/modify-product/:id
module.exports.modifyProduct = async (req, res) => {
  const categories = await ProductCategories.find({deleted:false});
  const categoryTree = createTreeHelper(categories);

  // Sử dụng try/catch đề phòng trường hợp id ko hợp lệ -> sập server
  try {
    const productId = req.params.id;
    const product = await Products.findOne({_id:productId, deleted:false});

    res.render('admin/pages/products/modifyProduct', {
      pageTitle: 'Modify product',
      product: product,
      categoryTree: categoryTree,
    });
  }
  catch(error) {
    req.flash("error", "Product is undefined!")
    res.redirect(`${res.locals.prefixAdmin}/products`);
  }
}

// [PATCH] /admin/product-list/modify-product/:id
module.exports.modifyProductMethodPatch = async (req, res) => {
  const productId = req.params.id;
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  req.body.position = req.body.position === '' ? parseInt(await Products.countDocuments()) + 1 : parseInt(req.body.position);
  // req.file là một obj của ảnh tải từ user.
  // Nếu k có ảnh -> undefined -> error if not check
  // if (req.file) { 
  //   req.body.thumbnail = `/uploads/${req.file.filename}`;
  // } không sử dụng nữa do ta đã dùng middleware upload để xử lý ảnh trước khi đến controller này.
  if (req.body.featured) {
    req.body.featured = isFuturedHelper(req.body.featured);
  }
  
  const updated = {
    accountId: res.locals.user._id || null,
    updatedAt: new Date()
  }

  try {
    await Products.updateOne({_id:productId}, {
      ...req.body,
      $push: {
        updatedBy: updated
      }
    });
  }
  catch (error) {
    req.flash("error", "Product is undefined!")
    return res.redirect(req.get("Referrer") || "/");
  }

  // // Thông báo thành công:
  req.flash('success', `Update product successfully!`);
  // Dùng để chuyển hướng (redirect) người dùng về trang trước đó hoặc chuyển hướng về trang chủ ("/") nếu không có trang trước.
  // Ngoài ra ta có thể fix cứng 1 trang web cụ thể
  res.redirect(req.get("Referrer") || "/");
}

// [GET] /admin/product-list/detail-product/:id
module.exports.detailProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const find = {
      deleted: false,
      _id: productId,
    }
    const product = await Products.findOne(find);
    res.render('admin/pages/products/detailProduct', {
      pageTitle: product.title || "Product Detail",
      product: product,
    });
  }
  catch (error) {
    req.flash("error", "Product is undefined!")
    return res.redirect(req.get("Referrer") || "/");
  }
}