const Carts = require('../../models/cart.model');
const Accounts = require('../../models/account.model');
const Products = require('../../models/product.model');
const CartHelpers = require('../../helpers/client/cart');

// [GET] /cart
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

    res.render("client/pages/cart/index", {
      pageTitle: "Cart",
      cart: carts
    });

  } catch (error) {
    console.error("Error when display cart:", error);
    res.redirect(req.get("Referrer") || "/");
  }
};

// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
  try {
    const token = req.cookies.token;
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity) || 1;

    // Nếu user login (chỉ mở khi cần)
    if (token) {
      const user = await Accounts.findOne({ token: token, deleted: false });
      if (user) {
        let cart = await Carts.findOne({ userId: user._id });
        if (!cart) {
          cart = new Carts({ userId: user._id, products: [] });
        }

        const existingItem = cart.products.find(
          item => item.productId.toString() === productId
        );
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.products.push({ productId, quantity });
        }

        await cart.save();
        req.flash("success", "Added product successfully!");
        res.clearCookie('guestCart'); // clear guestCart nếu có
        return res.redirect(req.get("Referrer") || "/");
      }
      res.clearCookie('token');
    }

    // Guest (not logged in)
    let guestCart = { products: [], totalQuantity: 0 };
    try {
      if (req.cookies.guestCart) {
        guestCart = JSON.parse(req.cookies.guestCart);
      }
    } catch (e) {
      guestCart = { products: [], totalQuantity: 0 };
    }

    // Lấy thông tin sản phẩm từ DB để lưu đầy đủ vào cookie
    const product = await Products.findById(productId).select("title price thumbnail stock");
    if (!product || product.stock <= 0) {
      req.flash("error", "Product not available!");
      return res.redirect(req.get("Referrer") || "/");
    }

    const existing = guestCart.products.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      guestCart.products.push({
        productId,
        quantity
      });
    }

    guestCart.totalQuantity += quantity;

    res.cookie('guestCart', JSON.stringify(guestCart), {
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
    let carts = null;
    const product = await Products.findOne({deleted:false, status:'active', _id:productId});
    
    if (!product) {
      req.flash("error", "Product is not existed!");
      return res.redirect(req.get("Referrer") || "/");
    }

    if (token) {
      const user = await Accounts.findOne({token:token});

      if (user) {
        carts = await Carts.findOne({
          userId: user._id,
        });
        if (!carts) {
          carts = {
            products:[],
            totalQuantity:0,
          };
          req.flash("error", "Cart is empty!");
          return res.redirect(req.get("Referrer") || "/");
        }
        carts.products = carts.products.filter(item => item.productId != productId);
        await carts.save();
        req.flash("success", "Deleted product successfully!");
        return res.redirect(req.get("Referrer") || "/");
      }
      else {
        res.clearCookie("token");
      }
    }
    if (req.cookies.guestCart) {
      carts = await CartHelpers.validateGuestCart(req.cookies.guestCart);
    }
    if (carts) {
      carts.products = carts.products.filter(item => item.productId != productId);
    }

    res.cookie('guestCart', JSON.stringify(carts), {
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
    const { products } = req.body; 
    const token = req.cookies.token;
    
    if (token) {
      const user = await Accounts.findOne({ token });
    
      if (user) {
        const carts = await Carts.findOne({ userId: user._id });
        if (!carts) {
          return res.json({ success: false, message: 'Cart not found!' });
        }     
        // Update quantity
        carts.products.forEach(item => {
          const updated = products.find(p => p.id === item.productId.toString());
          if (updated) {
            let q = parseInt(updated.quantity);
            if (q < 1) q = 1;
            item.quantity = q;
          }
        });

        // Update totalQuantity
        carts.totalQuantity = carts.products.reduce((sum, p) => sum + p.quantity, 0);
        
        await carts.save();
           
        return res.json({ success: true });
      }
      res.clearCookie('token');
    }
    let carts = req.cookies.guestCart || [];
    carts = await CartHelpers.validateGuestCart(carts);
    
    // Update quantity
    carts.products.forEach(item => {
      const updated = products.find(p => p.id === item.productId.toString());
      if (updated) {
        let q = parseInt(updated.quantity);
        if (q < 1) q = 1;
        item.quantity = q;
      }
    });

    // Update totalQuantity
    carts.totalQuantity = carts.products.reduce((sum, p) => sum + p.quantity, 0);
    
    res.cookie('guestCart', JSON.stringify(carts), {
      maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
    });

    return res.json({ success: true, totalQuantity: carts.totalQuantity });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: 'Update failed!' });
  }
};