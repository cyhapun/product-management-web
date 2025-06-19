const mongoose = require('mongoose');

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

const Role = mongoose.model('Role', roleSchema, "roles");
// End create model mongoose

module.exports = Role;