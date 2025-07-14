// buttonStatusFilter
const buttonStatusFilter = document.querySelectorAll("[button-status]");
// Trả về một nodelist giống như mảng nhưng k phải là mảng thật sự
if (buttonStatusFilter.length > 0) {
  console.log('a')
  const url = new URL(window.location.href);

  buttonStatusFilter.forEach((button, index) => {
    button.addEventListener("click", () => {
      const status = button.getAttribute("button-status");
      status ? url.searchParams.set("status", status) : url.searchParams.delete("status"); 
      
      // Nếu i === index, bật class "active". Nếu không, gỡ class "active".
      buttonStatusFilter.forEach((btn, i) => {
        btn.classList.toggle("active", i === index);
      });

      // Xem màn hình console để biết thêm về object url
      // console.log(url);
      url.searchParams.delete("page");
      window.location.href = url.href;
    });
  });  
}
// End buttonStatusFilter

// Form search
const formSearch = document.getElementById("form-search");
if (formSearch) {
  // console.log(formSearch)
  let url = new URL(window.location.href);

  formSearch.addEventListener('submit', e => {
    e.preventDefault();
    // console.log(e);
    // console.log(e.target.elements.keyword.value);
    const keyword = e.target.elements.keyword.value;

    if (keyword) {
      url.searchParams.set("keyword", keyword);
    }
    else {
      url.searchParams.delete("keyword");
    }
    url.searchParams.delete("page");

    // console.log(url.href);
    window.location.href = url.href;
  });
}
// End Form search 

// Pagination
// Có thể mở rộng hơn: Đi đến trang cuối/đầu, chỉ hiển thị 2 3 trang xung quang trang hiện tại,...
const pagePagination = document.querySelectorAll('.page-link');
if (pagePagination.length > 0) {
  const url = new URL(window.location.href);

  pagePagination.forEach(page => {
    page.addEventListener('click', () => {
      url.searchParams.set('page', parseInt(page.getAttribute("dirPage")));
      window.location.href = url.href;
    });
  });
  
}
// End paginationt

// Show alert
const showAlert = document.querySelector("[show-alert]");
if (showAlert) {
  const displayTime = parseInt(showAlert.getAttribute("display-time"));
  const closeAlert = showAlert.querySelector("[close-alert]");

  closeAlert.addEventListener('click', () => {
    showAlert.classList.add("alert-hidden");
  })
  setTimeout(() => {
    showAlert.classList.add("alert-hidden");
  }, displayTime);

}
// End show alert

// Preview Image Upload
const previewUploadImages = document.querySelectorAll('[upload-image-input]');
previewUploadImages.forEach(uploadImage => {
  uploadImage.addEventListener('change', e => {
    const uploadImageInput = uploadImage.nextElementSibling;
    console.log(uploadImageInput);
    // Bản chất của uploadImagelà e.target và uploadImage.files nó chứa 1 mảng gồm nhiều file.
    const [file] = uploadImage.files;
  
    // URL.createObjectURL() tạo 1 đường dẫn tạm thời sao đó gán cho attribute src trong tag img.
    if (file) {
      uploadImageInput.src = URL.createObjectURL(file);
    }
    else {
      uploadImageInput.src = '#';
    }
  })
})
// Thêm chức năng xóa ảnh đang chọn.
// End preview image upload
