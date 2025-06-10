module.exports = (query, numberProduct) => {
  let objectPagination = {
      currentPage: parseInt(query.page) || 1,
      limit: 4,
  };
  // The formula: skip = (currentPage - 1) * numberProductPerPage
  // Dùng this nếu dùng objectPagination sẽ bị lỗi.
  objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limit;
  objectPagination.pageNumber = Math.ceil(numberProduct / objectPagination.limit);
  // console.log(pageNumber);
  // console.log(objectPagination.skip);
  return objectPagination;
}