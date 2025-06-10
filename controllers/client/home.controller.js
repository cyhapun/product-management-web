// Comment ghi chú [Method] path để quản lí dễ

// [GET] /home
module.exports.index = (req, res) => {
    res.render('client/pages/home/index.pug', {
        pageTitle: "Trang chu",
    })
};