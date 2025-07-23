const Users = require('../../models/user.model');
const Products = require('../../models/product.model');
const Cart = require('../../models/cart.model');
const CartHelpers = require('../../helpers/client/cart');

// [GET] /cart
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

    res.render("client/pages/cart/index", {
      pageTitle: "Cart",
      cart
    });
  } catch (error) {
    console.error("Error when display cart:", error);
    res.redirect("/");
  }
};

// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
  try {
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity) || 1;
    const userToken = req.cookies.userToken;

    if (userToken) {
      const user = await Users.findOne({ deleted: false, status: 'active', userToken });
      if (user) {
        let cart = res.locals.cart;

        // Nếu res.locals.cart không phải Mongoose document => load lại
        if (!cart || !cart._id) {
          cart = await Cart.findOne({ userId: user._id });
          if (!cart) {
            cart = new Cart({ userId: user._id, products: [] });
          }
        }

        const existingItem = cart.products.find(item => item.productId.toString() === productId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.products.push({ productId, quantity });
        }

        // Update totalQuantity
        cart.totalQuantity = cart.products.reduce((sum, p) => sum + p.quantity, 0);

        await cart.save(); // ✅ luôn là mongoose doc
        req.flash("success", "Added product successfully!");
        return res.redirect(req.get("Referrer") || "/");
      }
      res.clearCookie('userToken');
    }

    // Guest → lưu cookie
    const product = await Products.findById(productId).select("title price thumbnail stock");
    if (!product || product.stock <= 0) {
      req.flash("error", "Product not available!");
      return res.redirect(req.get("Referrer") || "/");
    }

    const existing = res.locals.cart.products.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      res.locals.cart.products.push({ productId, quantity });
    }

    res.locals.cart.totalQuantity += quantity;

    res.cookie('guestCart', JSON.stringify(res.locals.cart), {
      maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
    });

    req.flash("success", "Added product successfully!");
    res.redirect(req.get("Referrer") || "/");

  } catch (error) {
    console.error("Error when adding product to cart:", error);
    req.flash("error", "Added product failed!");
    res.redirect("/");
  }
};

// [GET] /cart/delete/:productId
module.exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userToken = req.cookies.userToken;
    const product = await Products.findOne({ deleted: false, status: 'active', _id: productId });

    if (!product) {
      req.flash("error", "Product is not existed!");
      return res.redirect(req.get("Referrer") || "/");
    }

    if (userToken) {
      const user = await Users.findOne({ userToken });
      if (user) {
        let cart = res.locals.cart;
        if (!cart || !cart._id) {
          cart = await Cart.findOne({ userId: user._id });
        }

        if (!cart) {
          req.flash("error", "Cart is empty!");
          return res.redirect(req.get("Referrer") || "/");
        }

        cart.products = cart.products.filter(item => item.productId.toString() !== productId);
        cart.totalQuantity = cart.products.reduce((sum, p) => sum + p.quantity, 0);
        await cart.save();

        req.flash("success", "Deleted product successfully!");
        return res.redirect(req.get("Referrer") || "/");
      } else {
        res.clearCookie("userToken");
      }
    }

    // Guest
    if (res.locals.cart) {
      res.locals.cart.products = res.locals.cart.products.filter(item => item.productId !== productId);
      res.locals.cart.totalQuantity = res.locals.cart.products.reduce((sum, p) => sum + p.quantity, 0);
    }

    res.cookie('guestCart', JSON.stringify(res.locals.cart), {
      maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
    });

    req.flash("success", "Deleted product successfully!");
    res.redirect(req.get("Referrer") || "/");
  } catch (error) {
    console.error("Error when deleting product from cart:", error);
    req.flash("error", "Delete product failed!");
    res.redirect(req.get("Referrer") || "/");
  }
};

// [POST] /cart/update - AJAX
module.exports.updateCart = async (req, res) => {
  try {
    const userToken = req.cookies.userToken;
    const products = req.body.products;

    if (userToken) {
      const user = await Users.findOne({ userToken });
      if (user) {
        let cart = res.locals.cart;
        if (!cart || !cart._id) {
          cart = await Cart.findOne({ userId: user._id });
        }
        if (!cart) return res.json({ success: false, message: 'Cart not found!' });

        // Update quantity
        cart.products.forEach(item => {
          const updated = products.find(p => p.id === item.productId.toString());
          if (updated) {
            let q = parseInt(updated.quantity);
            if (q < 1) q = 1;
            item.quantity = q;
          }
        });

        cart.totalQuantity = cart.products.reduce((sum, p) => sum + p.quantity, 0);

        await cart.save();
        return res.json({ success: true, totalQuantity: cart.totalQuantity });
      }
      res.clearCookie('userToken');
    }

    // Guest
    res.locals.cart.products.forEach(item => {
      const updated = products.find(p => p.id === item.productId.toString());
      if (updated) {
        let q = parseInt(updated.quantity);
        if (q < 1) q = 1;
        item.quantity = q;
      }
    });

    res.locals.cart.totalQuantity = res.locals.cart.products.reduce((sum, p) => sum + p.quantity, 0);

    res.cookie('guestCart', JSON.stringify(res.locals.cart), {
      maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
    });

    return res.json({ success: true, totalQuantity: res.locals.cart.totalQuantity });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: 'Update failed!' });
  }
};
