import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js';
import { FileUploadWithPreview } from 'https://unpkg.com/file-upload-with-preview/dist/index.js';

// --- KHỞI TẠO ---
const upload = new FileUploadWithPreview('upload-image', {
  multiple: true,
  maxFileCount: 6,
  accept: 'image/*', // Chỉ chấp nhận file ảnh
});
const socket = io();

// --- LẤY CÁC ELEMENT DOM CẦN THIẾT ---
const formSendData = document.querySelector(".chat .inner-form");
const previewContainer = document.querySelector('.inner-preview-images');
const chatContainer = document.querySelector('.chat');


// --- HÀM CẬP NHẬT HIỂN THỊ KHUNG PREVIEW ---
// Hàm này là trái tim của logic, kiểm tra và ẩn/hiện preview
const updatePreviewVisibility = () => {
    // Dùng setTimeout để đảm bảo hàm chạy sau khi thư viện đã cập nhật xong mảng file
    setTimeout(() => {
        if (upload.cachedFileArray.length > 0) {
            previewContainer.classList.add('visible');
        } else {
            previewContainer.classList.remove('visible');
        }
        scrollChatToBottom();
    }, 100); // Đợi 100ms là đủ an toàn
};

// --- GỬI DỮ LIỆU LÊN SERVER ---
if (formSendData) {
    formSendData.addEventListener("submit", (e) => {
        e.preventDefault();
        const content = e.target.elements.content.value;
        const images = upload.cachedFileArray;

        if (content.trim() || images.length > 0) {
            socket.emit("CLIENT_SEND_MESSAGE", {
                content: content,
                images: images
            });
            e.target.elements.content.value = "";
            upload.clearPreviewPanel(); 
            updatePreviewVisibility(); // Cập nhật sau khi gửi
            socket.emit("CLIENT_TYPING", "off");
        }
    });

    const inputContent = formSendData.querySelector("input[name='content']");
    inputContent.addEventListener("input", () => {
        sendTypingIndicatorToServer();
    });
}


// --- XỬ LÝ KÉO THẢ (DRAG AND DROP) ---
if (chatContainer) {
    chatContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        chatContainer.classList.add('drag-over');
    });

    chatContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        chatContainer.classList.remove('drag-over');
    });

    chatContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        chatContainer.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            upload.addFiles(files);
            updatePreviewVisibility(); // Cập nhật sau khi thả file
        }
    });
}


// --- PHẦN QUAN TRỌNG NHẤT: LẮNG NGHE SỰ KIỆN THÊM/XÓA ẢNH ---
// MutationObserver sẽ theo dõi mọi thay đổi trong DOM của khung preview.
const observer = new MutationObserver(() => {
    // Bất cứ khi nào có thay đổi (thêm/xóa ảnh), gọi hàm cập nhật.
    updatePreviewVisibility();
});

// Bắt đầu theo dõi:
// Lắng nghe sự thay đổi của các phần tử con (childList) bên trong khung preview.
// subtree: true để theo dõi cả các phần tử con lồng sâu bên trong.
observer.observe(document.querySelector('.custom-file-container'), { 
    childList: true, 
    subtree: true 
});


// --- NHẬN DỮ LIỆU TỪ SERVER ---
socket.on('SERVER_RETURN_MESSAGE', (data) => {
    const myId = document.querySelector('[myId]').getAttribute('myId');
    const body = document.querySelector('.chat .inner-body');
    const innerListTyping = document.querySelector(".inner-list-typing");

    const messageElement = createMessageElement(data, myId);

    const typingBoxToRemove = innerListTyping.querySelector(`.box-typing[user-id="${data.userId}"]`);
    if(typingBoxToRemove) {
        typingBoxToRemove.remove();
    }

    body.insertBefore(messageElement, innerListTyping);
    scrollChatToBottom();
});

socket.on("SERVER_RETURN_TYPING", (data) => {
    const { userId, fullName, type } = data;
    const innerListTyping = document.querySelector(".inner-list-typing");
    const myId = document.querySelector('[myId]').getAttribute('myId');

    if (userId === myId) return;

    const existingTyping = innerListTyping.querySelector(`.box-typing[user-id="${userId}"]`);

    if (type === "on" && !existingTyping) {
        const boxTyping = document.createElement("div");
        boxTyping.className = 'message-container incoming box-typing';
        boxTyping.setAttribute("user-id", userId);
        
        const initial = fullName ? fullName[0].toUpperCase() : 'U';

        boxTyping.innerHTML = `
            <div class="message-avatar">${initial}</div>
            <div class="message-content-wrapper">
                <div class="message-sender-name ml-0">${fullName}</div>
                <div class="message-bubble">
                    <div class="inner-dots"><span></span><span></span><span></span></div>
                </div>
            </div>
        `;
        innerListTyping.appendChild(boxTyping);
        scrollChatToBottom();
    } else if (type === "off" && existingTyping) {
        existingTyping.remove();
    }
});


// --- CÁC HÀM HỖ TRỢ ---
function createMessageElement(data, myId) {
    const isOutgoing = data.userId === myId;
    const template = document.getElementById(isOutgoing ? 'message-template-outgoing' : 'message-template-incoming');
    const messageClone = template.content.cloneNode(true);
    
    const messageBody = messageClone.querySelector('.message-body');

    if (data.content) {
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = data.content;
        messageBody.appendChild(bubble);
    }

    if (data.images && data.images.length > 0) {
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'message-images';
        data.images.forEach(imageUrl => {
            imagesContainer.innerHTML += `
                <a href="${imageUrl}" target="_blank">
                    <img src="${imageUrl}" alt="Image">
                </a>
            `;
        });
        messageBody.appendChild(imagesContainer);
    }

    if (!isOutgoing) {
        const name = data.fullName || 'Unknown';
        messageClone.querySelector('.message-avatar').textContent = name[0].toUpperCase();
        messageClone.querySelector('.message-sender-name').textContent = name;
    }
    
    if(isOutgoing) {
       const wrapper = messageClone.querySelector('.message-content-wrapper');
       wrapper.append(...messageBody.childNodes);
       messageBody.remove();
    }

    return messageClone.firstElementChild;
}

function scrollChatToBottom() {
    const bodyChat = document.querySelector(".chat .inner-body");
    if (bodyChat) {
        bodyChat.scrollTop = bodyChat.scrollHeight;
    }
}
document.addEventListener("DOMContentLoaded", scrollChatToBottom);

const buttonEmoij = document.querySelector('.button-emoij');
if (buttonEmoij) {
    const tooltip = buttonEmoij.querySelector('.tooltip');
    const popperInstance = Popper.createPopper(buttonEmoij, tooltip, { placement: 'top-end' });

    buttonEmoij.addEventListener('click', () => {
        tooltip.classList.toggle('shown');
        popperInstance.update();
    });

    document.addEventListener('click', (e) => {
        if (!buttonEmoij.contains(e.target)) {
            tooltip.classList.remove('shown');
        }
    });
}

const emoijPicker = document.querySelector('emoji-picker');
if (emoijPicker) {
    emoijPicker.addEventListener('emoji-click', event => {
        const chatInput = document.querySelector(".chat .inner-form input[name='content']");
        const icon = event.detail.unicode;
        chatInput.value += icon;
        chatInput.focus();
        sendTypingIndicatorToServer();
    });
}

let typingTimeout;
function sendTypingIndicatorToServer() {
    clearTimeout(typingTimeout);
    socket.emit("CLIENT_TYPING", "on");
    typingTimeout = setTimeout(() => {
        socket.emit("CLIENT_TYPING", "off");
    }, 3000);
}