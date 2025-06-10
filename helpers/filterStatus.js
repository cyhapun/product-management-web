module.exports = (query) => {
  // Tạo một mảng data của các nút bấm filter theo trạng thái hoạt động
  // dùng BE quản lí thay FE.
  let buttonStatusFilter = [
    {
      name:"All",
      status:"",
      class:""
    },
    {
      name:"Active",
      status:"active",
      class:""
    },
    {
      name:"Inactive",
      status:"inactive",
      class:""
    }
  ];
  // Gán class 'active' để hiện thị button đang chọn:
  if (query.status) {
    const indexActive = buttonStatusFilter.findIndex(btn => btn.status === query.status);
    buttonStatusFilter[indexActive].class = "active";
  }
  else {
    const indexActive = buttonStatusFilter.findIndex(btn => btn.status === "");
    buttonStatusFilter[indexActive].class = "active";
  }
  return buttonStatusFilter;
}