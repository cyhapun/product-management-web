const mongoose = require('mongoose');
// slug là một phần của URL được tối ưu hóa để dễ đọc và thân thiện với công cụ tìm kiếm.
const slugUpdater = require('mongoose-slug-updater');
mongoose.plugin(slugUpdater); // Kích hoạt plugin

// Create model mongoose
const productSchema = new mongoose.Schema({
  title: String, 
  category: {
    type:String,
    default:""
  },
  description: String,
  price: Number,
  discountPercentage: Number,
  stock: Number,
  thumbnail: String,
  status: String,
  createdBy: {
    createdAt: { type: Date, default: Date.now },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
  },
  deleted: { type: Boolean, default: false },
  position: Number,
  deletedBy: {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    deletedAt: Date
  },
  slug: { type: String, slug: "title", unique: true },
}, {
  timestamps:true
});
// Trường timestamps sẽ tự động thêm 2 thuộc tính updatedAt và createdAt cho từng document.

const Product = mongoose.model('Product', productSchema, "products");
// End create model mongoose

module.exports = Product;