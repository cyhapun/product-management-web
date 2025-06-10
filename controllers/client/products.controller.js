const Product = require("../../models/product.model");

// Comment ghi chú [Method] path để quản lí dễ

// [GET] /products
module.exports.index = async (req, res) => {
    // Giá trị thuộc tính trong {} là điều kiện để lấy ra danh sách sản phẩm
    // Ví dụ object rỗng -> Lấy tất cả các sản phẩm có trong danh sách.
    // Ở đây ta muốn lấy ra những sản phẩm có hoạt động và deleted có gía trị false.
    const condition = {
        status:"active",
        deleted:false
    };

    const products = await Product.find(condition)
    .sort({position:"desc"});

    // Dùng map():
    const newProducts = products.map(item => ({
            ...item.toObject(),
            newPrice: item.price * (100 - item.discountPercentage) / 100
    }))
    //  Khi bạn gọi await Product.find(), bạn nhận được một mảng các Mongoose Documents.
    //  Nếu bạn in trực tiếp products, bạn sẽ không thấy metadata ('$__', '$isNew'...), vì Mongoose có cơ chế ẩn metadata khi in ra console.
    // console.log(newProducts);
    
    // Dùng forEach():
    // products.forEach(item => {
    //     item.newPrice = item.price * (100 - item.discountPercentage) / 100
    // })

    // console.log(products);

    res.render('client/pages/products/index.pug', {
        pageTitle: "List product",
        products: newProducts
        // products: products
    })
};