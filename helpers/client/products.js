module.exports.calculateNewPrice = (productList) => {
   return productList.map(item => ({
      ...item.toObject(),
      newPrice: item.price * (100 - item.discountPercentage) / 100
    }))
} 