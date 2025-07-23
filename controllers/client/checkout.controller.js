const CartHelpers = require('../../helpers/client/cart');
const Carts = require('../../models/cart.model');
const Orders = require('../../models/order.model');

// [GET] '/checkout'
module.exports.index = async (req, res) => {
  try {
    const token = req.cookies.token;
    let carts = null;

    if (token) {
      // User login
      const user = await Accounts.findOne({ token });
      if (user) {
        carts = await Carts.findOne({ userId: user._id });
        if (!carts) {
          carts = { products: [], totalQuantity: 0, totalPrice: 0 };
        }
        // Enrich thông tin sản phẩm từ DB
        carts = await CartHelpers.addInfoProductInCart(carts);
      } else {
        res.clearCookie('token');
      }
    } else {
      // Guest: lấy cookie + validate
      if (req.cookies.guestCart) {
        carts = await CartHelpers.validateGuestCart(req.cookies.guestCart);
        carts = await CartHelpers.addInfoProductInCart(carts);
      }
      if (!carts) carts = { products: [], totalQuantity: 0 };
    }

    res.render('client/pages/checkout/index.pug', {
      pageTitle: "Checkout",
      cart: carts,
    });

  } catch (error) {
    console.error("Error when display cart:", error);
    res.redirect(req.get("Referrer") || "/");
  }
}

// [POST] '/checkout/order'
module.exports.orderPost = async (req, res) => {
  try {
    const info = req.body;
    const token = req.cookies.token;
    let cart = null;
    let tmpCart = null;

    if (token) {
      const user = await Accounts.findOne({
        token:token,
      });

      if (user) {
        cart = await Carts.findOne({
          userId: user._id,
        });

        if (cart) {
          tmpCart = {...cart};
          cart.products = [];
          cart.totalQuantity = 0;
          cart.totalPrice = 0;
          await cart.save();
        }
        else {
          req.flash('error', 'Cart not found for user.');
          return res.redirect('/checkout');
        }
      }
      else {
        res.clearCookie('token');
      }
    }
    else {
      if (!res.locals.cart) {
        cart = await CartHelpers.validateGuestCart(req.cookies.guestCart);
        if (cart) {
          tmpCart = cart;
          cart.products = [];
          cart.totalQuantity = 0;
          cart.totalPrice = 0;
          res.cookie('guestCart', JSON.stringify(cart), { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }); // 30 days
        }
      }
      else {
        tmpCart = {...res.locals.cart};
        res.locals.cart.products = [];
        res.locals.cart.totalQuantity = 0;
        res.locals.cart.totalPrice = 0;

        res.cookie('guestCart', JSON.stringify(res.locals.cart), { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }); // 30 days
      }
    }
    const order = new Orders({
      userId: token ? user._id : null,
      info: {
        fullName: info.fullName,
        email: info.email,
        phone: info.phone,
        address: info.address
      },
      products: tmpCart.products.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder: item.productInfo.price, // Lưu giá tại thời điểm order
        discountPercentage: item.productInfo.discountPercentage // Lưu phần trăm giảm giá nếu có
      })),
      totalPrice: tmpCart.totalPrice,
      totalQuantity: tmpCart.totalQuantity,
    });
    await order.save();
    req.flash('success', 'Order placed successfully!');
    return res.redirect(`/checkout/success/${order._id}`);
    
  } catch(error) {
    console.error("Error when placing order:", error);
    req.flash('error', 'Failed to place order.');
    res.redirect('/checkout');
  }
}

// [GET] '/checkout/success/:orderId'
module.exports.success = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Tìm đơn hàng & populate thông tin sản phẩm
    const order = await Orders.findOne({
      _id: orderId,
      deleted: false,
    }).populate({
      path: 'products.productId',
      select: 'title thumbnail', // chỉ lấy tên & ảnh sản phẩm
    });

    if (!order) {
      return res.render('client/pages/404NotFound.pug', {  
        pageTitle: 'Not found',
      });
    }

    res.render('client/pages/checkout/orderSuccess.pug', {
      pageTitle: 'Order Successfully',
      order: order,
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};