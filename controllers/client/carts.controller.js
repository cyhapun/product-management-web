const Carts = require('../../models/cart.model');
const Accounts = require('../../models/account.model');
const Products = require('../../models/product.model');
const CartHelpers = require('../../helpers/client/cart');

// [GET] /cart
module.exports.index = async (req, res) => {
  try {
    res.render("client/pages/cart/index", {
      pageTitle: "Cart",
      cart: res.locals.cart,
    });

  } catch (error) {
    console.error("Error when display cart:", error);
    res.redirect(req.get("Referrer") || "/");
  }
};

// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
  try {
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity) || 1;
    const token = req.cookies.token;
    
    // Nếu user login (chỉ mở khi cần)
    if (token) {
      const user = await Accounts.findOne({ token: token, deleted: false });
      if (user) {
        const existingItem = res.locals.cart.products.find(
          item => item.productId.toString() === productId
        );
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          res.locals.cart.products.push({ productId, quantity });
        }

        await res.locals.cart.save();
        req.flash("success", "Added product successfully!");
        return res.redirect(req.get("Referrer") || "/");
      }
      res.clearCookie('token');
    }
    // Lấy thông tin sản phẩm từ DB để lưu đầy đủ vào cookie
    const product = await Products.findById(productId).select("title price thumbnail stock");
    if (!product || product.stock <= 0) {
      req.flash("error", "Product not available!");
      return res.redirect(req.get("Referrer") || "/");
    }

    const existing = res.locals.cart.products.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      res.locals.cart.products.push({
        productId,
        quantity
      });
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
    res.redirect(req.get("Referrer") || "/");
  }
};

// [GET] /cart/delete/:productId
module.exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const token = req.cookies.token;
    const product = await Products.findOne({deleted:false, status:'active', _id:productId});
    
    if (!product) {
      req.flash("error", "Product is not existed!");
      return res.redirect(req.get("Referrer") || "/");
    }

    if (token) {
      const user = await Accounts.findOne({token:token});

      if (user) {
        if (!res.locals.cart) {
          res.locals.cart = {
            products:[],
            totalQuantity:0,
          };
          req.flash("error", "Cart is empty!");
          return res.redirect(req.get("Referrer") || "/");
        }
        res.locals.cart.products = res.locals.cart.products.filter(item => item.productId != productId);
        await res.locals.cart.save();
        req.flash("success", "Deleted product successfully!");
        return res.redirect(req.get("Referrer") || "/");
      }
      else {
        res.clearCookie("token");
      }
    }
    if (res.locals.cart) {
      res.locals.cart.products = res.locals.cart.products.filter(item => item.productId != productId);
    }

    res.cookie('guestCart', JSON.stringify(res.locals.cart), {
      maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
    });

    req.flash("success", "Deleted product successfully!");
    res.redirect(req.get("Referrer") || "/");
  } catch(error) {
    console.error("Error when deleting product to cart:", error);
    req.flash("error", "Delete product failed!");
    res.redirect(req.get("Referrer") || "/");
  }
}

// [POST] /cart/update - AJAX
module.exports.updateCart = async (req, res) => {
  try {
    const token = req.cookies.token;
    const products = req.body.products;
    
    if (token) {
      const user = await Accounts.findOne({ token });
    
      if (user) {
        if (!res.locals.cart) {
          return res.json({ success: false, message: 'Cart not found!' });
        }     
        // Update quantity
        res.locals.cart.products.forEach(item => {
          const updated = products.find(p => p.id === item.productId.toString());
          if (updated) {
            let q = parseInt(updated.quantity);
            if (q < 1) q = 1;
            item.quantity = q;
          }
        });

        // Update totalQuantity
        res.locals.cart.totalQuantity = res.locals.cart.products.reduce((sum, p) => sum + p.quantity, 0);
        
        await res.locals.cart.save();
        return res.json({ success: true });
      }
      res.clearCookie('token');
    }
    // Update quantity
    res.locals.cart.products.forEach(item => {
      const updated = products.find(p => p.id === item.productId.toString());
      if (updated) {
        let q = parseInt(updated.quantity);
        if (q < 1) q = 1;
        item.quantity = q;
      }
    });

    // Update totalQuantity
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