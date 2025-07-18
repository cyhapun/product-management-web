const Products = require("../../models/product.model");
const ProductsHelper = require('../../helpers/client/products');
const mongoose = require('mongoose');
const ProductCategories = require('../../models/productCategory.model');
const ProductCategoryHelper = require('../../helpers/client/productCategories');

// [GET] /products
module.exports.index = async (req, res) => {
    // Giá trị thuộc tính trong {} là điều kiện để lấy ra danh sách sản phẩm
    // Ví dụ object rỗng -> Lấy tất cả các sản phẩm có trong danh sách.
    // Ở đây ta muốn lấy ra những sản phẩm có hoạt động và deleted có gía trị false.
    const condition = {
        status:"active",
        deleted:false
    };

    const products = await Products.find(condition)
    .sort({position:"desc"});
    
    // Add new price
    const newProducts = ProductsHelper.calculateNewPrice(products);
    //  Khi bạn gọi await Product.find(), bạn nhận được một mảng các Mongoose Documents.
    //  Nếu bạn in trực tiếp products, bạn sẽ không thấy metadata ('$__', '$isNew'...), vì Mongoose có cơ chế ẩn metadata khi in ra console.
    // console.log(newProducts);
    
    // Dùng forEach():
    // products.forEach(item => {
    //     item.newPrice = item.price * (100 - item.discountPercentage) / 100
    // })

    res.render('client/pages/products/index.pug', {
        pageTitle: "Product list",
        products: newProducts
        // products: products
    });
};

// [GET] /products/detail/:slugProduct
module.exports.detail = async (req, res) => {
    const productId = req.params.id;

    // Tìm kiếm theo ID nếu hợp lệ, ngược lại dùng slug
    const query = mongoose.Types.ObjectId.isValid(productId)
        ? { _id: productId, deleted: false, status: "active" }
        : { slug: productId, deleted: false, status: "active" };

    try {
        const product = await Products.findOne(query);

        if (!product) {
            return res.status(404).render('client/pages/404NotFound', {
                pageTitle: "Not Found",
            });
        }
        product.newPrice = product.price * (100 - product.discountPercentage) / 100;
        res.render('client/pages/products/detailProduct', {
            pageTitle: product.title,
            product: product,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).render('client/pages/500', {
            pageTitle: "Server Error"
        });
    }
};

// [GET] /products/:slugProductCategory
module.exports.getProductsByCategory = async (req, res) => {
    // Get list category (children and it)
    const slugProductCategory = req.params.slugProductCategory;
    const productCategory = await ProductCategories.findOne({
        deleted: false,
        status: 'active',
        slug: slugProductCategory,
    })
    if (!productCategory) {
        return res.render('client/pages/404NotFound.pug', {
            pageTitle: "Not found category",
        });
    }

    const productCategories = await ProductCategories.find({
        deleted: false,
        status: 'active',
    })
    const categoryList = ProductCategoryHelper.getChildrenProductCategory(productCategories, productCategory);
    const categoryIds = categoryList.map(c => c._id.toString());
    // End of get list category 
    
    const productsByCategory = await Products.find({
        deleted: false,
        status: 'active',
        category: { $in: categoryIds },
    }).sort({position:"desc"});
    const newProducts = ProductsHelper.calculateNewPrice(productsByCategory);
   
    res.render('client/pages/products/index.pug', {
        pageTitle: productCategory.title,
        products: newProducts,
    });
}
