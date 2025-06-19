// Change status
const buttonChangeStatus = document.querySelectorAll("[button-change-status]");
if (buttonChangeStatus.length > 0) {
  const formChangeStatus = document.querySelector('#form-change-status');
  const pathChangeStatus = formChangeStatus.getAttribute("data-path");

  buttonChangeStatus.forEach(button => {
    button.addEventListener('click', () => {
      const statusCurrent = button.getAttribute("current-status");
      const productCategoryId = button.getAttribute("productCategory-id");
      const statusChange = statusCurrent === "active" ? "inactive" : "active";
      const actionForm = pathChangeStatus + `/${statusChange}/${productCategoryId}?_method=PATCH`;

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
      if (typeAction === "delete-productCategory") {
        const isConfirm = confirm("Are you sure you want to delete this category?");
        if (!isConfirm) {
          return;
        }
      }
      
      const listIdModify = [];
      const inputIdModify = formChangeMulti.querySelector("input[name='ids']");

      checkedInputList.forEach(input => {
        if (typeAction === "change-position") {
          // Ra tag tr sau đó truy cập vào ô input chứa vị trí:
          const newProductCategoryPosition = input.closest('tr').querySelector("input[name='productCategory-position']").value;

          listIdModify.push(input.value + '-' + newProductCategoryPosition);
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
      alert("At least one category to modify!");
    }
  })
}
// End form change multi

// Delete product
const productCategoryDeleteButtonList = document.querySelectorAll("[button-delete-productCategory]");
if (productCategoryDeleteButtonList.length > 0) {
  const formDeleteProduct = document.querySelector("#form-delete-product");
  // Có thể dùng hàm confirm() có sẳn để confirm delete thay vì dùng modal trong bootstrap.
  productCategoryDeleteButtonList.forEach(btn => {
    btn.addEventListener('click', () => {
      const productCategoryId = btn.getAttribute('productCategory-id');

      const pathDefault = formDeleteProduct.getAttribute('data-path');
      formDeleteProduct.action = pathDefault + `/${productCategoryId}?_method=DELETE`;
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
      const productCategoryId = button.getAttribute("productCategory-id");
      const defaultPath = button.getAttribute("default-path");
      const directPath = defaultPath + '/' + productCategoryId;
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
      const productCategoryId = button.getAttribute("productCategory-id");
      const defaultPath = button.getAttribute("default-path");
      const directPath = defaultPath + '/' + productCategoryId;
      window.location.href = directPath;
    })
  });
}

// Sort products
const buttonSort = document.querySelector("[sort-select]");
const buttonClearSort = document.querySelector("[sort-clear]");
if (buttonSort && buttonClearSort) {
  const url = new URL(window.location.href);
  buttonSort.addEventListener('change', () => {
    const conditionSort = buttonSort.value;
    const sortBy = conditionSort.split('-')[0];
    const sortValue = conditionSort.split('-')[1];
    
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('sortValue', sortValue);

    window.location.href = url.href;
  });

  buttonClearSort.addEventListener('click', () => {
    url.searchParams.delete('sortBy');
    url.searchParams.delete('sortValue');

    window.location.href = url.href;
  });

  const sortBy = url.searchParams.get('sortBy');
  const sortValue = url.searchParams.get('sortValue');
  if (sortBy && sortValue) {
    const stringSort = `${sortBy}-${sortValue}`
    const optionSelected = buttonSort.querySelector(`option[value='${stringSort}']`)
    // Because selected is the attribute default so we can use '.'
    optionSelected.selected = true
  }
}
// End Sort products