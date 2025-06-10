const Products = require('../../models/product.model');

// Tách từng chức năng theo module để reuse and easy to management
const buttonStatusFilterHelper = require('../../helpers/filterStatus');
const searchObjectHelper = require('../../helpers/search.js');
const paginationHelper = require('../../helpers/pagination.js');

// Comment ghi chú [Method] path để quản lí dễ
// [GET] /admin/products
module.exports.products = async (req, res) => {
  // req sẽ chứa mọi thông tin yêu cầu từ client
  // Ở đây ta sẽ lấy ra yêu cầu từ url bằngbằng req.query
  // console.log(req);
  // console.log(req.query);
  // console.log(req.query.status);  

  let condition = {
    deleted: false,
  }

  // Filter by status
  const buttonStatusFilter = buttonStatusFilterHelper(req.query);
  // End filter by status

  // Tìm kiếm sản phẩm (Filter product):
  //Trả về một object gồm regex(để tìm kiếm) và keyword để làm giá trị cho ô input:
  const searchObj = searchObjectHelper(req.query);
  // console.log(searchObj);
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
  // sort theo position
  let products = await Products.find(condition)
  .sort({position:"desc"})
  .skip(objectPagination.skip)
  .limit(objectPagination.limit);

  // Cách 2 tìm kiếm sản phẩm: ta lấy danh sách product như bình thường rồi dùng 1 hàm filter kiểm tra xem product đó có keyword đó không:
  // if (req.query.keyword) {
  //   const filterProducts = products.filter(product => product.title.toLocaleLowerCase().includes(req.query.keyword.toLocaleLowerCase()));

  //   products = filterProducts;
  // }

  // console.log(products);

  res.render('admin/pages/products/index', {
    pageTitle: "Products",
    products: products,
    buttonStatusFilter: buttonStatusFilter,
    keyword: searchObj.keyword,
    pagination: objectPagination
  })
}

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  // req.params dùng để lấy tham số từ URL khi sử dụng route parameters(trả về 1 object chứa các tham số).
  // console.log(req.params);

  const newStatus = req.params.status;
  const productId = req.params.id;

  // Do trường id trong DB có tên _id
  await Products.updateOne({_id: productId}, {status:newStatus});
  
  // Thông báo cập nhật thành công.
  req.flash('success', 'Cập nhật trạng thái sản phẩm thành công thành công!');

  // Chuyển hướng về trang trước đó 
  // res.redirect('back');
  // An toàn và bảo mật hơn
  res.redirect(req.get("Referrer") || "/");
}

// [PATCH] /admin/products/multi-change
module.exports.multiChange = async (req, res) => {
  // Mở phần network sẽ thấy có dữ liệu nhưng nodejs k nhận được
  // Nên ta cần tải thư viện body-parser để có thể lấy được dữ liệu từ req.body
  // console.log(req.body);
  const ids = req.body.ids.split(', ');
  const type = req.body.type;

  switch (type) {
    case "active":
      await Products.updateMany({_id: {$in:ids}}, {status: type});      
      req.flash('success', `Cập nhật trạng thái thành công cho ${ids.length} sản phẩm!`);
      break;
    case "inactive":
      await Products.updateMany({_id: {$in:ids}}, {status: type});    
      req.flash('success', `Cập nhật trạng thái thành công cho ${ids.length} sản phẩm!`);
      break;
    case "delete-product":
      // Xóa mềm
      await Products.updateMany({_id: {$in:ids}}, {
        deleted:true,
        deletedDate: new Date()
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
          position: parseInt(productPosition)
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

// [DELETE] /admin/products/delete-product/:id
// Phương thức chỉ có tác dụng ngữ nghĩa k ảnh hưởng gì nên ta có thể dùng bất kì phương thức gì cũng được.
module.exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;

  // Có 2 kiểu delete product: Một là xóa hẳn khỏi db, hai là xóa 'mềm' gán thuộc tính deleted=true để k hiển thị ra giao diện.
  // Xóa hẳn khỏi DB:
  // await Products.deleteOne({_id: productId});
  // Xóa 'mềm':
  await Products.updateOne({_id:productId}, {
    deleted:true, 
    deletedDate: new Date()
  });

  // --> Ta có thể làm 1 trang 'Thùng rác'(xóa mềm) và trong trang đó có chức năng khôi phục và xóa vĩnh viễn(xóa khỏi DB).

  // Thông báo xóa thành công
  req.flash('success', `Đã xóa sản phẩm thành công!`);
  // Chuyển hướng về trang trước đó 
  // res.redirect('back');
  // An toàn và bảo mật hơn
  res.redirect(req.get("Referrer") || "/");
}

// [GET] /admin/products/create-new
module.exports.createNewProduct = (req, res) => {
  res.render('admin/pages/products/createNew', {
    pageTitle: 'Create new product'
  });
}

// [POST] /admin/products/create-new
module.exports.createNewProductMethodPost = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  req.body.position = req.body.position === '' ? parseInt(await Products.countDocuments()) + 1 : parseInt(req.body.position);
  // req.file là một obj của ảnh tải từ user.
  // Nếu k có ảnh -> undefined -> error if not check
  req.body.thumbnail = req.file ? `/uploads/${req.file.filename}` : '';
  // // Trả về 1 object:
  // console.log(req.body);

  // Tạo mới 1 sản phẩm:
  const newProduct = new Products(req.body);
  await newProduct.save();

  // Thông báo thành công:
  req.flash('success', `Thêm sản phẩm thành công!`);

  // Dùng để chuyển hướng (redirect) người dùng về trang trước đó hoặc chuyển hướng về trang chủ ("/") nếu không có trang trước.
  // Ngoài ra ta có thể fix cứng 1 trang web cụ thể
  res.redirect(req.get("Referrer") || "/");
} 

// [GET] /admin/products/modify-product/:id
module.exports.modifyProduct = async (req, res) => {
  // Sử dụng try/catch đề phòng trường hợp id ko hợp lệ -> sập server
  try {
    const productId = req.params.id;
    const product = await Products.findOne({_id:productId, deleted:false});
    // console.log(product);
    res.render('admin/pages/products/modifyProduct', {
      pageTitle: 'Modify product',
      product: product,
    });
  }
  catch(error) {
    req.flash("error", "Product is undefined!")
    res.redirect(`${res.locals.prefixAdmin}/products`);
  }
}

// [PATCH] /admin/product/modify-product/:id
module.exports.modifyProductMethodPatch = async (req, res) => {
  console.log(req.file);
  const productId = req.params.id;
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  req.body.position = req.body.position === '' ? parseInt(await Products.countDocuments()) + 1 : parseInt(req.body.position);
  // req.file là một obj của ảnh tải từ user.
  // Nếu k có ảnh -> undefined -> error if not check
  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }

  try {
    await Products.updateOne({_id:productId}, req.body);
  }
  catch (error) {
    req.flash("error", "Product is undefined!")
    return res.redirect(req.get("Referrer") || "/");
  }

  // // Thông báo thành công:
  req.flash('success', `Update product successf!`);
  // Dùng để chuyển hướng (redirect) người dùng về trang trước đó hoặc chuyển hướng về trang chủ ("/") nếu không có trang trước.
  // Ngoài ra ta có thể fix cứng 1 trang web cụ thể
  res.redirect(req.get("Referrer") || "/");
}