/**
 * chat.js — Client-side Socket.IO untuk Group Chat
 * Dijalankan di browser, include via <script src="/js/chat.js">
 */

// ── Ambil data dari HTML ──────────────────────────────────────
const appData     = document.getElementById('app-data')
const MY_ID       = appData.dataset.userId
const MY_NAME     = appData.dataset.username
const CURRENT_ROOM = appData.dataset.room || 'general'

// ── Connect ke socket.io server ──────────────────────────────
const socket = io()

// ── DOM Elements ─────────────────────────────────────────────
const messagesDiv     = document.getElementById('messages')
const chatForm        = document.getElementById('chat-form')
const messageInput    = document.getElementById('message-input')
const typingIndicator = document.getElementById('typing-indicator')
const onlineUsersList = document.getElementById('online-users-list')

// ── Join room saat halaman dibuka ────────────────────────────
socket.emit('join-room', CURRENT_ROOM)

// ── Helper: render satu message bubble ───────────────────────
function renderMessage(msg) {
    const isMine = msg.sender?._id === MY_ID || msg.sender === MY_ID

    // System message (join/leave)
    if (msg.type === 'system') {
        const div = document.createElement('div')
        div.className = 'text-center msg-system my-2'
        div.textContent = msg.content
        messagesDiv.appendChild(div)
        scrollToBottom()
        return
    }

    const wrapper = document.createElement('div')
    wrapper.className = `d-flex mb-3 ${isMine ? 'justify-content-end' : ''}`

    const senderName = isMine ? 'Kamu' : (msg.sender?.username || msg.senderName || '?')
    const time = new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    wrapper.innerHTML = `
        <div class="msg-bubble p-3 ${isMine ? 'mine' : 'other'}">
            ${!isMine ? `<div class="small fw-bold mb-1" style="color:#e94560;">${senderName}</div>` : ''}
            <div>${escapeHtml(msg.content)}</div>
            <div class="text-muted small mt-1">${time}</div>
        </div>
    `
    messagesDiv.appendChild(wrapper)
    scrollToBottom()
}

// ── Helper: scroll ke bawah ───────────────────────────────────
function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight
}

// ── Helper: escape HTML (XSS prevention) ─────────────────────
function escapeHtml(text) {
    const div = document.createElement('div')
    div.appendChild(document.createTextNode(text))
    return div.innerHTML
}

// ── Socket Events dari SERVER ─────────────────────────────────

// Terima history pesan room
socket.on('room-history', (messages) => {
    messagesDiv.innerHTML = ''
    messages.forEach(renderMessage)
})

// Terima pesan baru real-time
socket.on('new-message', renderMessage)

// Update daftar online users di sidebar
socket.on('online-users', (users) => {
    onlineUsersList.innerHTML = users
        .map(u => `
            <div class="d-flex align-items-center gap-2 p-2 mb-1">
                <span style="width:8px;height:8px;border-radius:50%;background:#28a745;display:inline-block;"></span>
                <span style="color:#c0c0d0;">${escapeHtml(u.username)}</span>
            </div>
        `)
        .join('')
})

// Typing indicator
let typingTimeout
socket.on('user-typing', ({ username }) => {
    typingIndicator.textContent = `${username} sedang mengetik...`
})
socket.on('user-stop-typing', () => {
    typingIndicator.textContent = ''
})

// Notifikasi push (DM dari user lain)
socket.on('notification', ({ from, content, type }) => {
    const toastEl = document.getElementById('notif-toast')
    document.getElementById('notif-body').textContent = `💬 ${from}: ${content}`
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 })
    toast.show()

    // Browser notification (kalau user kasih izin)
    if (Notification.permission === 'granted') {
        new Notification(`Pesan dari ${from}`, { body: content })
    }
})

// ── Kirim pesan saat form submit ──────────────────────────────
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const content = messageInput.value.trim()
    if (!content) return

    socket.emit('send-message', { room: CURRENT_ROOM, content })
    messageInput.value = ''

    // Stop typing indicator
    socket.emit('stop-typing', { room: CURRENT_ROOM })
    clearTimeout(typingTimeout)
})

// ── Typing indicator saat ngetik ─────────────────────────────
messageInput.addEventListener('input', () => {
    socket.emit('typing', { room: CURRENT_ROOM })
    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
        socket.emit('stop-typing', { room: CURRENT_ROOM })
    }, 1500)  // stop typing after 1.5s idle
})

// ── Minta izin browser notification ──────────────────────────
if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission()
}
