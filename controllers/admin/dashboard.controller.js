// Comment ghi chú [Method] path để quản lí dễ

// [GET] /admin/dashboard
module.exports.dashboard = (req, res) => {
  res.render('./admin/pages/dashboard/index.pug', {
    pageTitle: "Dashboard",
  })
}