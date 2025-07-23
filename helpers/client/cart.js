const Products = require("../../models/product.model");

// Validate guest cart from cookie
module.exports.validateGuestCart = async (rawCart) => {
  let cart = { products: [], totalQuantity: 0 };

  try {
    if (rawCart) {
      rawCart = decodeURIComponent(rawCart);
      cart = JSON.parse(rawCart);
      if (!Array.isArray(cart.products)) throw new Error("Cart products is not array!");
    }
  } catch (err) {
    console.warn("Cookie guestCart is wrong:", err.message);
    return { products: [], totalQuantity: 0, totalPrice: 0 };
  }

  const validProducts = [];
  let totalQuantity = 0;
  let totalPrice = 0;

  for (const item of cart.products) {
    if (!item.productId || typeof item.quantity !== "number") continue;

    // Kiểm tra tồn tại sản phẩm & stock
    const product = await Products.findById(item.productId)
      .select("price discountPercentage stock");

    if (!product || product.stock <= 0) continue;

    // Giới hạn quantity >=1 và <= stock
    const qty = Math.min(Math.max(1, item.quantity), product.stock);

    // Tính giá sau khuyến mãi
    const priceNew = product.price * (100 - (product.discountPercentage || 0)) / 100;
    totalPrice += priceNew * qty;

    validProducts.push({
      productId: item.productId,
      quantity: qty
    });

    totalQuantity += qty;
  }
  
  return {
    products: validProducts,
    totalQuantity,
    totalPrice
  };
};

// Add full product info for user login cart (from DB)
module.exports.addInfoProductInCart = async (cart) => {
  if (!cart || !Array.isArray(cart.products) || cart.products.length === 0) {
    return {
      products: [],
      totalQuantity: 0,
      totalPrice: 0,
    };
  }

  const enrichedProducts = [];
  let totalPrice = 0;
  let totalQuantity = 0;

  for (const item of cart.products) {
    const product = await Products.findOne({
      _id: item.productId,
      deleted: false,
      status: "active"
    }).select("title thumbnail slug price discountPercentage stock");

    if (!product) continue;

    const priceNew = product.price * (100 - (product.discountPercentage || 0)) / 100;
    const totalPriceItem = priceNew * item.quantity;

    enrichedProducts.push({
      productId: item.productId,
      quantity: item.quantity,
      productInfo: product,
      totalPrice: totalPriceItem
    });

    totalQuantity += item.quantity;
    totalPrice += totalPriceItem;
  }

  cart.products = enrichedProducts;
  cart.totalQuantity = totalQuantity;
  cart.totalPrice = totalPrice;

  return cart;
};
