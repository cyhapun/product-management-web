const mongoose = require('mongoose');
// slug là một phần của URL được tối ưu hóa để dễ đọc và thân thiện với công cụ tìm kiếm.
const slugUpdater = require('mongoose-slug-updater');
mongoose.plugin(slugUpdater); // Kích hoạt plugin

// Create model mongoose
const productCategorySchema = new mongoose.Schema({
  title: String, 
  parent_id:{
    type:String,
    default:""
  },
  description: String,
  thumbnail: String,
  status: String,
  deleted: { type: Boolean, default: false },
  position: Number,
  deletedDate: Date,
  slug: { type: String, slug: "title", unique: true },
}, {
  timestamps:true
});
// Trường timestamps sẽ tự động thêm 2 thuộc tính updatedAt và createdAt cho từng document.

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema, "product-categories");
// End create model mongoose

module.exports = ProductCategory;