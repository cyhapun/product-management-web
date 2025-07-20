const Carts = require('../../models/cart.model');
const Accounts = require('../../models/account.model');

// [POST] 'cart/add/:productId'
module.exports.addPost = async (req, res) => {
  try {
    const token = req.cookies.token; 
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity || 1);

    if (token && 0) {
      const user = await Accounts.findOne({ token });
      if (!user) {
        res.clearCookie('token');
      }
      else {
        let cart = await Carts.findOne({ userId: user._id });
        if (!cart) {
          cart = new Carts({ userId: user._id, products: [] });
        }

        const existingItem = cart.products.find(item => item.productId.toString() === productId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.products.push({ productId, quantity });
        }

        await cart.save();
        req.flash("success", "Added product successfully!");
        return res.redirect(req.get('Referrer') || "/products");
      }
    }

    let guestCart = [];
    if (req.cookies.guestCart) {
      guestCart = JSON.parse(req.cookies.guestCart);
    }

    const existing = guestCart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      guestCart.push({ productId, quantity });
    }
    res.cookie('guestCart', JSON.stringify(guestCart), { maxAge: 1000 * 60 * 60 * 24 * 30 }); // 30 ngày
    req.flash("success", "Added product successfully!");
    res.redirect(req.get('Referrer') || "/products");
  }
  catch {
    req.flash("error", "Added product failed!");
    res.redirect(req.get('Referrer') || "/products");
  }
};
