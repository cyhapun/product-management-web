const CartHelpers = require('../../helpers/client/cart');
const Carts = require('../../models/cart.model');
const Orders = require('../../models/order.model');
const Users = require('../../models/user.model');

// [GET] '/checkout'
module.exports.index = async (req, res) => {
  try {
    let cart = res.locals.cart;
    if (cart && typeof cart.toObject === "function") {
      cart = cart.toObject();
    }
    // Nếu chưa có thông tin productInfo thì enrich
    if (cart && cart.products && cart.products.length > 0 && !cart.products[0].productInfo) {
      cart = await CartHelpers.addInfoProductInCart(cart);
    }

    res.render('client/pages/checkout/index.pug', {
      pageTitle: "Checkout",
      cart
    });

  } catch (error) {
    console.error("Error when display checkout:", error);
    res.redirect("/");
  }
};

// [POST] '/checkout/order'
module.exports.orderPost = async (req, res) => {
  try {
    const info = req.body;
    const cart = res.locals.cart;     // ✅ dùng luôn cart đã load sẵn
    const user = res.locals.user;     // ✅ dùng luôn user đã load sẵn
    
    // Nếu cart trống
    if (!cart) {
      req.flash("error", "Your cart is empty!");
      return res.redirect("/checkout");
    }

    // Deep copy cart để lưu order
    let tmpCart = JSON.parse(JSON.stringify(cart));

    // ✅ Nếu user đã login → reset DB cart
    if (user) {
      cart.products = [];
      cart.totalQuantity = 0;
      cart.totalPrice = 0;
      await cart.save();
    } else {
      // ✅ Guest → reset guestCart cookie
      const emptyGuestCart = { products: [], totalQuantity: 0, totalPrice: 0 };
      res.cookie("guestCart", JSON.stringify(emptyGuestCart), {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true
      });
    }
    if (!tmpCart.products[0].productInfo) {
      tmpCart = await CartHelpers.addInfoProductInCart(tmpCart);
    }
    // ✅ Tạo order từ tmpCart
    const order = new Orders({
      userId: user ? user._id : null,
      info: {
        fullName: info.fullName,
        email: info.email,
        phone: info.phone,
        address: info.address
      },
      products: tmpCart.products.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder: item.productInfo.price || 0,
        discountPercentage: item.productInfo.discountPercentage || 0
      })),
      totalPrice: tmpCart.totalPrice,
      totalQuantity: tmpCart.totalQuantity
    });

    await order.save();

    req.flash("success", "Order placed successfully!");
    return res.redirect(`/checkout/success/${order._id}`);

  } catch (error) {
    console.error("Error when placing order:", error);
    req.flash("error", "Failed to place order.");
    res.redirect("/checkout");
  }
};


// [GET] '/checkout/success/:orderId'
module.exports.success = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Orders.findOne({
      _id: orderId,
      deleted: false,
    }).populate({
      path: 'products.productId',
      select: 'title thumbnail'
    });

    if (!order) {
      return res.render('client/pages/404NotFound.pug', { pageTitle: 'Order not found' });
    }

    res.render('client/pages/checkout/orderSuccess.pug', {
      pageTitle: 'Order Successfully',
      order
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// [GET] '/checkout/order/detail/:orderId'
module.exports.orderDetail = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Orders.findOne({
      _id: orderId,
      deleted: false
    }).populate({
      path: 'products.productId',
      select: 'title thumbnail price slug'
    });

    if (!order) {
      return res.render('client/pages/404NotFound.pug', { pageTitle: 'Order Not Found' });
    }

    const statusSteps = [
      { key: 'pending', label: 'Pending' },
      { key: 'confirmed', label: 'Confirmed' },
      { key: 'shipped', label: 'Shipped' },
      { key: 'completed', label: 'Completed' }
    ];

    res.render('client/pages/checkout/orderDetail.pug', {
      pageTitle: `Order Detail`,
      order,
      statusSteps
    });

  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};
