// Initial
var socket = io();

// CLIENT_SEND_MESSAGE
const formSendData = document.querySelector(".chat .inner-form");

if (formSendData) {
  formSendData.addEventListener("submit", (e) => {
    e.preventDefault();

    const content = e.target.elements.content.value;

    if (content) {
      socket.emit("CLIENT_SEND_MESSAGE", content);
      e.target.elements.content.value = "";
    }
  });
}
// End CLIENT_SEND_MESSAGE

// Client receive notification from server (SERVER_RETURN_MESSAGE)
socket.on('SERVER_RETURN_MESSAGE', (data) => {
    // Lấy myId và phần thân của chat
    const myId = document.querySelector('[myId]').getAttribute('myId');
    const body = document.querySelector('.chat .inner-body');

    // Tạo thẻ div chứa toàn bộ tin nhắn
    const div = document.createElement('div');

    if (myId === data.userId) {
        // --- Xử lý TIN NHẮN ĐI ---
        // Thêm ĐẦY ĐỦ các lớp class giống hệt như trong file Pug
        div.classList.add('inner-outgoing', 'text-end', 'mb-2');

        div.innerHTML = `
            <div class="inner-content d-inline-block px-3 py-2 text-white">
                ${data.content}
            </div>
        `;
    } else {
        // --- Xử lý TIN NHẮN ĐẾN ---
        // Thêm ĐẦY ĐỦ các lớp class giống hệt như trong file Pug
        div.classList.add('inner-incoming', 'd-flex', 'align-items-start', 'mb-2');
        const initial = data.fullName ? data.fullName[0].toUpperCase() : 'U';

        div.innerHTML = `
            <div class="avatar bg-secondary text-white rounded-circle me-2" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                ${initial}
            </div>
            <div class="d-flex flex-column">
                <div class="inner-name small text-muted mb-1">${data.fullName}</div>
                <div class="inner-content d-inline-block px-3 py-2">
                    ${data.content}
                </div>
            </div>
        `;
    }

    // Thêm tin nhắn mới vào cuối và cuộn xuống
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
});

// End Client receive notification from server (SERVER_RETURN_MESSAGE)

// Scroll Chat To Bottom
const bodyChat = document.querySelector(".chat .inner-body");

if (bodyChat) {
  bodyChat.scrollTop = bodyChat.scrollHeight;
}
// End Scroll Chat To Bottom
