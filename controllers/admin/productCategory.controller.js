// [GET] /admin/product-category
module.exports.index = async (req, res) => {
  res.render('admin/pages/product-category/index', {
      pageTitle: 'Product category',
    }
  )
}
