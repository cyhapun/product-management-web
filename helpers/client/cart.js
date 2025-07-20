const Products = require("../../models/product.model"); 

module.exports.validateGuestCart = async (rawCart) => {
  let cart = [];
  let totalQuantity = 0;

  // Parse JSON 
  try {
    if (rawCart) {
      rawCart = decodeURIComponent(rawCart);
      cart = JSON.parse(rawCart);
      if (!Array.isArray(cart)) throw new Error("Cart is not an array!");
    }
  } catch (err) {
    console.warn("Cookie guestCart is wrong:", err.message);
    return []; // Reset cart
  }

  let validCart = [];

  for (let item of cart) {
    if (!item.productId || typeof item.quantity !== "number") continue;

    // Kiểm tra productId có tồn tại trong DB
    const product = await Products.findById(item.productId).select("title price thumbnail stock");
    if (!product) continue; 
    if (product.stock <= 0) continue;
    let qty = Math.min(Math.max(1, item.quantity), product.stock);
    
    validCart.push({
      productId: product._id,
      title: product.title,
      price: product.price, 
      thumbnail: product.thumbnail,
      quantity: qty
    });

    totalQuantity += qty;
  }
  validCart.totalQuantity = totalQuantity;

  return validCart;
}
