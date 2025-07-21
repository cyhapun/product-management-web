// Alert
function showStockWarning(stock) {
  Swal.fire({
      icon: 'warning',
      title: 'Stock limit reached',
      text: `Only ${stock} items available in stock.`,
      confirmButtonColor: '#3085d6',
  });
}
// End alert

// Update quantity client view
function updateQuantity(button, change) {
  const input = button.parentElement.querySelector('.quantity-input');
  let currentValue = parseInt(input.value);
  const stock = parseInt(input.dataset.stock);

  let newValue = currentValue + change;
  if (newValue < 1) newValue = 1;

  if (!isNaN(stock) && newValue > stock) {
      showStockWarning(stock);
      newValue = stock;
  }

  input.value = newValue;
  updateRowTotal(input);
}

function updateRowTotal(input) {
  const stock = parseInt(input.dataset.stock);
  let quantity = parseInt(input.value);

  if (!isNaN(stock) && quantity > stock) {
      showStockWarning(stock);
      quantity = stock;
      input.value = stock;
  }
  if (quantity < 1 || isNaN(quantity)) {
      quantity = 1;
      input.value = 1;
  }

  const card = input.closest('.card');
  const priceElement = card.querySelector('.price-text');
  const totalPriceElement = card.querySelector('.total-price');

  const price = parseFloat(priceElement.innerText.replace(/[^0-9.-]+/g,""));
  const total = price * quantity;

  totalPriceElement.innerText = total.toLocaleString() + '$';
  updateCartTotal();
}

function updateCartTotal() {
  const allTotals = document.querySelectorAll('.total-price');
  let subtotal = 0;
  allTotals.forEach(el => {
      const val = parseFloat(el.innerText.replace(/[^0-9.-]+/g,""));
      subtotal += val;
  });
  document.getElementById('cart-subtotal').innerText = subtotal.toLocaleString() + '$';
}
// End update quantity client view

//- Update quantity submit server
async function saveCartToServer() {
  const rows = document.querySelectorAll('.cart-item-card');
  const products = [];

  rows.forEach(row => {
    const id = row.querySelector('input[type="hidden"]').value;
    const quantity = parseInt(row.querySelector('.quantity-input').value);
    products.push({ id, quantity });
  });

  try {
    const res = await fetch('/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products })
    });

    const result = await res.json();

    if (result.success) {
      updateMiniCartCount(result.totalQuantity);
      Swal.fire({
        icon: 'success',
        title: 'Cart updated!',
        text: 'Your cart has been successfully updated.',
        timer: 2000,
        showConfirmButton: false,
        scrollbarPadding: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Update failed',
        text: result.message || 'Something went wrong!',
        scrollbarPadding: false
      });
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Server error',
      text: 'Could not connect to server',
      scrollbarPadding: false
    });
  }
}

function updateMiniCartCount(newTotalQuantity) {
  const miniCart = document.querySelector('.mini-cart-total-quantity');
  if (miniCart) {
    miniCart.innerHTML = `(${newTotalQuantity})`;
  }
}
// End update quantity submit server