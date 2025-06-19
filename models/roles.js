// Create model mongoose
const roleSchema = new mongoose.Schema({
  title: String, 
  description: String,
  deleted: { 
    type: Boolean, 
    default: false 
  },
  deletedDate: Date,
  permissions: {
    type: Array,
    default:[]
  }  
}, {
  timestamps:true
});
// Trường timestamps sẽ tự động thêm 2 thuộc tính updatedAt và createdAt cho từng document.

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema, "product-categories");
// End create model mongoose

module.exports = ProductCategory;