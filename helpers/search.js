module.exports = (query) => {
  // Dùng để hiển thị keyword tìm kiếm trên thanh tìm kiếm:
  let searchObj = {
    keyword: query.keyword || "",
  };
  
  // Cách 1 tìm kiếm sản phẩm: để lấy trang product theo tìm kiếm keyword
  // // trim() dùng để xóa kí tự khoảng trắng ở đầu và cuối trong chuỗi.
  if (query.keyword) {
    searchObj.regex = new RegExp(searchObj.keyword, "i"); 
    // Đây là biểu thức chính quy (regex) là một mẫu (pattern) dùng để tìm kiếm, kiểm tra hoặc thay thế chuỗi trong lập trình.
    // Ta có rất nhiều biến thể cho regex và option.
    // Ngoài cách sử dụng regex trong Mongoose ta có thể dùng regex trong JS rồi truyền cho mongosse.
    // condition.title = { $regex: query.keyword, $options: "i" };
  }
  return searchObj;
}