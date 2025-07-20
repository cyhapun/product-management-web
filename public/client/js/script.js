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