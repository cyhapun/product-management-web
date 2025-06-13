// Change status
const buttonChangeStatus = document.querySelectorAll("[button-change-status]");
if (buttonChangeStatus.length > 0) {
  const formChangeStatus = document.querySelector('#form-change-status');
  const pathChangeStatus = formChangeStatus.getAttribute("data-path");

  buttonChangeStatus.forEach(button => {
    button.addEventListener('click', () => {
      const statusCurrent = button.getAttribute("current-status");
      const productId = button.getAttribute("product-id");
      const statusChange = statusCurrent === "active" ? "inactive" : "active";
      const actionForm = pathChangeStatus + `/${statusChange}/${productId}?_method=PATCH`;

      formChangeStatus.action = actionForm;
      formChangeStatus.submit();
    })
  })
}
// End Change status

// Checkbox multi
const checkboxMulti = document.querySelector("[checkbox-multi]");
if (checkboxMulti) {
  const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
  const inputIdList = checkboxMulti.querySelectorAll("input[name='id']");
  // let countCheckedInput = 0;
 
  inputCheckAll.addEventListener('click', () => {
    if (inputCheckAll.checked) {
      inputIdList.forEach(inputId => {
        inputId.checked = true;
        // countCheckedInput++;
      });
    }
    else {
      inputIdList.forEach(inputId => {
        inputId.checked = false;
      });
      // countCheckedInput = 0;
    }
  });

  // Cách 1 là dùng 1 biến ở ngoài để theo dõi số lượng ô checked.
  // Cách 2 là dùng querySelectorAll("input[name='id']:checked") để xem có bao nhiêu ô checked.
  inputIdList.forEach(inputId => {
    inputId.addEventListener('click', () => {
      // Cách 1: (MADE BY CHP)
      // if (inputId.checked) {
      //   countCheckedInput++;
      //   if (countCheckedInput === inputIdList.length) {
      //     inputCheckAll.checked = true;
      //   }
      // }
      // else {
      //   countCheckedInput--;
      //   inputCheckAll.checked = false;
      // }

      // Cách 2:
      const numberInputChecked = checkboxMulti.querySelectorAll('input[name="id"]:checked').length;

      if (numberInputChecked === inputIdList.length) {
        inputCheckAll.checked = true;
      }
      else {
        inputCheckAll.checked = false;
      }
    });
  });
}
// End checkbox multi

// Form change multi
const formChangeMulti = document.querySelector("[form-change-multi]");
if (formChangeMulti) {
  formChangeMulti.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const checkboxMulti = document.querySelector("[checkbox-multi]");
    const checkedInputList = checkboxMulti.querySelectorAll("input[name='id']:checked");

    if (checkedInputList.length > 0) {
      // Cách lấy phần tử trong form bằng event:
      const typeAction = e.target.elements.type.value;
      // Confirm delete product:
      if (typeAction === "delete-product") {
        const isConfirm = confirm("Are you sure you want to delete product?");
        if (!isConfirm) {
          return;
        }
      }
      
      const listIdModify = [];
      const inputIdModify = formChangeMulti.querySelector("input[name='ids']");

      checkedInputList.forEach(input => {
        if (typeAction === "change-position") {
          // Ra tag tr sau đó truy cập vào ô input chứa vị trí:
          const newProductPosition = input.closest('tr').querySelector("input[name='product-position']").value;

          listIdModify.push(input.value + '-' + newProductPosition);
        } 
        else {
          listIdModify.push(input.value);
        }
      });

      // Dùng hàm join to convert array => string
      inputIdModify.value = listIdModify.join(', ');
      formChangeMulti.submit();
    }
    else {
      alert("At least one product to modify!");
    }
  })
}
// End form change multi

// Delete product
const productDeleteButtonList = document.querySelectorAll("[button-delete-product]");
if (productDeleteButtonList.length > 0) {
  const formDeleteProduct = document.querySelector("#form-delete-product");
  // Có thể dùng hàm confirm() có sẳn để confirm delete thay vì dùng modal trong bootstrap.
  productDeleteButtonList.forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('product-id');

      const pathDefault = formDeleteProduct.getAttribute('data-path');
      formDeleteProduct.action = pathDefault + `/${productId}?_method=DELETE`;
      formDeleteProduct.submit();
    });
  });
}
// End delete product


// ModifyProduct
// Có thể sử dụng thẻ a thì k cần bắt sự kiện
const buttonModify = document.querySelectorAll("[button-modify]");
if (buttonModify) {
  buttonModify.forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute("product-id");
      const defaultPath = button.getAttribute("default-path");
      const directPath = defaultPath + '/' + productId;
      window.location.href = directPath;
    })
  });   
}
// End ModifyProduct

// DetailProduct
const buttonDetail = document.querySelectorAll("[button-detail]");
if (buttonDetail) {
  buttonDetail.forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute("product-id");
      const defaultPath = button.getAttribute("default-path");
      const directPath = defaultPath + '/' + productId;
      window.location.href = directPath;
    })
  });
}