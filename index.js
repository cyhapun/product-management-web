const express = require('express');
// Package để có thể lấy được dữ liệu từ req.body
const methodOverride = require('method-override');
// Package để có thể sử dụng có method Delete, Patch, ... trong form
const bodyParser = require('body-parser');
// Package để hiển thị thông báo cập nhật thành công
const flash = require('express-flash');
const session = require('express-session');
// For Tinymce
const path = require('path')

// Use env
require('dotenv').config()

const port = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;
// End use env

// Connect database by mongoose
const mongoose = require('./config/database');

mongoose.connect(MONGODB_URL);
// End connect database by mongoose

const routeClient = require('./routes/client/index.route');
const routeAdmin = require('./routes/admin/index.route');
const app = express();

// Package để có thể sử dụng có method Delete, Patch, ... trong form
app.use(methodOverride('_method'));

// Package để có thể lấy được dữ liệu từ req.body (Middleware)
app.use(bodyParser.urlencoded({extended :false}));

// App Locals Variable  
// Các biến lưu trong app.locals có phạm vi toàn cục và tồn tại suốt vòng đời của ứng dụng.
// Chủ yếu được sử dụng để lưu dữ liệu chung mà các template (view) cần truy cập.
// Không bị mất đi giữa các request, trừ khi server được khởi động lại.
const systemConfig = require('./config/system');

app.locals.prefixAdmin = systemConfig.prefixAdmin;

// Flash (Package để hiển thị thông báo cập nhật thành công)
app.use(session({
    secret: 'randomKey',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } 
}));
app.use(flash());
// Thay vì truyền thủ công trong từng res.render(), Dùng middleware để thêm flash messages vào res.locals:
// Middleware toàn cục
app.use((req, res, next) => {
    res.locals.message = req.flash();  // Gán message vào res.locals
    res.locals.prefixAdmin = systemConfig.prefixAdmin;
    next();
});
// End Flash

// TinyMCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// End TinyMCE

app.use(express.static(`${__dirname}/public`));
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

// Routes
routeClient(app);
routeAdmin(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}!`)
})