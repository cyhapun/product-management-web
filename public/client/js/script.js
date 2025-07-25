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

// Back button
 function goBack() {
    if (document.referrer && document.referrer !== window.location.href) {
      // Nếu có referrer (trang trước) → quay lại
      window.location.href = document.referrer;
    } else {
      // Nếu không có (mở trực tiếp) → fallback
      window.location.href = "/";
    }
  }
// End back button