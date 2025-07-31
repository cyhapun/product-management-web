import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js';
import { FileUploadWithPreview } from 'https://unpkg.com/file-upload-with-preview/dist/index.js';

// Upload image preview
const upload = new FileUploadWithPreview('upload-image', {
  multiple:true,
  maxFileCount:6,
});
// End upload image preview

// Initial socket connection
const socket = io();

// ----------------- GỬI DỮ LIỆU LÊN SERVER -----------------
const formSendData = document.querySelector(".chat .inner-form");
if (formSendData) {
    // ---- Gửi tin nhắn ----
    formSendData.addEventListener("submit", (e) => {
        e.preventDefault();
        const content = e.target.elements.content.value;
        const images = upload.cachedFileArray;

        if (content || images.length > 0) {
            socket.emit("CLIENT_SEND_MESSAGE", {
                content: content,
                images: images
            });
            e.target.elements.content.value = "";
            upload.clearPreviewPanel();
            // Sau khi gửi, ngay lập tức tắt trạng thái typing
            socket.emit("CLIENT_TYPING", "off");
        }
    });

    // ---- Gửi trạng thái đang gõ ----
    const inputContent = formSendData.querySelector("input[name='content']");

    inputContent.addEventListener("input", () => {
        sendTypingIndicatorToServer();
    });
}
// ----------------- HẾT GỬI DỮ LIỆU -----------------

// ----------------- NHẬN DỮ LIỆU TỪ SERVER -----------------

// ---- Nhận tin nhắn trả về ----
socket.on('SERVER_RETURN_MESSAGE', (data) => {
    const myId = document.querySelector('[myId]').getAttribute('myId');
    const body = document.querySelector('.chat .inner-body');
    const innerListTyping = document.querySelector(".inner-list-typing");

    const div = document.createElement('div');

    // --- BẮT ĐẦU PHẦN CẬP NHẬT ---

    // Chuẩn bị nội dung văn bản (nếu có)
    let htmlContent = "";
    if (data.content) {
        htmlContent = `<div class="inner-content" style="word-wrap: break-word; white-space: pre-wrap;">${data.content}</div>`;
    }

    // Chuẩn bị nội dung hình ảnh (nếu có)
    let htmlImages = "";
    if (data.images && data.images.length > 0) {
        htmlImages += `<div class="inner-images mt-2 d-flex flex-wrap">`;
        data.images.forEach(imageUrl => {
            htmlImages += `
                <a href="${imageUrl}" target="_blank">
                    <img src="${imageUrl}" alt="Image" class="img-thumbnail m-1" style="width: 100px; height: 100px; object-fit: cover;">
                </a>
            `;
        });
        htmlImages += `</div>`;
    }

    if (myId === data.userId) {
        // Tin nhắn của mình
        div.classList.add('inner-outgoing', 'text-end', 'mb-2');
        
        // Gán class cho nội dung văn bản của mình
        if(data.content) {
            htmlContent = `<div class="inner-content d-inline-block px-3 py-2 text-white" style="word-wrap: break-word; white-space: pre-wrap;">${data.content}</div>`;
        }

        div.innerHTML = `
            <div class="d-inline-block">
                ${htmlContent}
                ${htmlImages}
            </div>
        `;
    } else {
        // Tin nhắn của người khác
        div.classList.add('inner-incoming', 'd-flex', 'align-items-start', 'mb-2');
        const initial = data.fullName ? data.fullName[0].toUpperCase() : 'U';
        
        // Gán class cho nội dung văn bản của người khác
        if(data.content) {
            htmlContent = `<div class="inner-content d-inline-block px-3 py-2">${data.content}</div>`;
        }
        
        div.innerHTML = `
            <div class="avatar bg-secondary text-white rounded-circle me-2" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                ${initial}
            </div>
            <div class="d-flex flex-column">
                <div class="inner-name small text-muted mb-1">${data.fullName}</div>
                <div class="message-body">
                   ${htmlContent}
                   ${htmlImages}
                </div>
            </div>
        `;
    }

    // --- KẾT THÚC PHẦN CẬP NHẬT ---

    // Xóa chỉ báo "đang gõ" của người vừa gửi tin
    const typingBoxToRemove = innerListTyping.querySelector(`.box-typing[user-id="${data.userId}"]`);
    if(typingBoxToRemove) {
        typingBoxToRemove.remove();
    }

    body.insertBefore(div, innerListTyping); // Thêm tin nhắn vào trước khu vực typing
    body.scrollTop = body.scrollHeight;
});


// ---- Nhận trạng thái đang gõ ----
socket.on("SERVER_RETURN_TYPING", (data) => {
    const { userId, fullName, type } = data;
    const innerListTyping = document.querySelector(".inner-list-typing");
    const myId = document.querySelector('[myId]').getAttribute('myId');

    // Bỏ qua nếu là chính mình
    if (userId === myId) {
        return;
    }

    if (type === "on") {
        // Kiểm tra xem box typing đã tồn tại chưa
        const existTyping = innerListTyping.querySelector(`.box-typing[user-id="${userId}"]`);

        if (!existTyping) {
            const boxTyping = document.createElement("div");
            boxTyping.classList.add('inner-incoming', 'd-flex', 'align-items-start', 'mb-2', 'box-typing', 'is-typing');
            boxTyping.setAttribute("user-id", userId);

            const initial = fullName ? fullName[0].toUpperCase() : 'U';

            boxTyping.innerHTML = `
                <div class="avatar bg-secondary text-white rounded-circle me-2" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${initial}
                </div>
                <div class="d-flex flex-column">
                    <div class="inner-name small text-muted mb-1 ml-2">${fullName}</div>
                    <div class="inner-content d-inline-block px-3 py-2 ml-2">
                        <div class="inner-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            `;
            innerListTyping.appendChild(boxTyping);
            scrollChatToBottom();
        }
    } else { // type === "off"
        // Tìm và xóa box typing khi người dùng dừng gõ
        const boxTypingToRemove = innerListTyping.querySelector(`.box-typing[user-id="${userId}"]`);
        if (boxTypingToRemove) {
            boxTypingToRemove.remove();
        }
    }
});

// ----------------- HẾT NHẬN DỮ LIỆU -----------------


// ----------------- CÁC CHỨC NĂNG KHÁC -----------------

// ---- Cuộn xuống cuối khung chat ----
function scrollChatToBottom() {
    const bodyChat = document.querySelector(".chat .inner-body");
    if (bodyChat) {
        bodyChat.scrollTop = bodyChat.scrollHeight;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    scrollChatToBottom();
});

// ---- Xử lý Emoji Picker ----
const buttonEmoij = document.querySelector('.button-emoij');
if (buttonEmoij) {
    const tooltip = buttonEmoij.querySelector('.tooltip');
    Popper.createPopper(buttonEmoij, tooltip, {
        placement: 'top-end',
    });

    buttonEmoij.addEventListener('click', () => {
        const chatInput = document.querySelector(".chat .inner-form input[name='content']");
        chatInput.setSelectionRange(chatInput.value.length, chatInput.value.length);
        chatInput.focus();
        tooltip.classList.toggle('shown');
    });

    document.addEventListener('click', (e) => {
        if (!buttonEmoij.contains(e.target)) {
            tooltip.classList.remove('shown');
        }
    });
}

const emoijPicker = document.querySelector('emoji-picker');
if (emoijPicker) {
    const chatInput = document.querySelector(".chat .inner-form input[name='content']");
    emoijPicker.addEventListener('emoji-click', event => {
        const icon = event.detail.unicode;
        chatInput.value += icon;
        
        chatInput.setSelectionRange(chatInput.value.length, chatInput.value.length);
        chatInput.focus();

        // ---- Gửi trạng thái đang gõ ----
        sendTypingIndicatorToServer();
    });
}
// ----------------- HẾT CÁC CHỨC NĂNG KHÁC -----------------

// Helper functions
// Typing indicator
let typingTimeout;
function sendTypingIndicatorToServer() {
    // Mỗi khi gõ, hủy timeout trước đó
    clearTimeout(typingTimeout);

    // Gửi sự kiện đang gõ lên server
    // Server sẽ tự biết user nào đang gõ dựa trên socket connection
    socket.emit("CLIENT_TYPING", "on");

    // Tạo một timeout mới. Nếu sau 3 giây không gõ gì thêm,
    // gửi sự kiện đã dừng gõ.
    typingTimeout = setTimeout(() => {
        socket.emit("CLIENT_TYPING", "off");
    }, 3000);
}
// End typing indicator