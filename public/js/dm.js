/**
 * dm.js — Client-side Socket.IO untuk Private DM
 */

const appData       = document.getElementById('app-data')
const MY_ID         = appData.dataset.userId
const MY_NAME       = appData.dataset.username
const RECIPIENT_ID  = appData.dataset.recipientId
const RECIPIENT_NAME = appData.dataset.recipientName

const socket          = io()
const messagesDiv     = document.getElementById('messages')
const dmForm          = document.getElementById('dm-form')
const messageInput    = document.getElementById('message-input')
const typingIndicator = document.getElementById('typing-indicator')

// Scroll ke bawah saat halaman dibuka (lihat history terbaru)
messagesDiv.scrollTop = messagesDiv.scrollHeight

function escapeHtml(text) {
    const div = document.createElement('div')
    div.appendChild(document.createTextNode(text))
    return div.innerHTML
}

function renderDM(msg) {
    const isMine = msg.sender?._id === MY_ID || msg.sender === MY_ID
    const senderName = isMine ? 'Kamu' : RECIPIENT_NAME
    const time = new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    const wrapper = document.createElement('div')
    wrapper.className = `d-flex mb-3 ${isMine ? 'justify-content-end' : ''}`
    wrapper.innerHTML = `
        <div class="msg-bubble p-3 ${isMine ? 'mine' : 'other'}">
            ${!isMine ? `<div class="small fw-bold mb-1" style="color:#e94560;">${senderName}</div>` : ''}
            <div>${escapeHtml(msg.content)}</div>
            <div class="text-muted small mt-1">${time}</div>
        </div>
    `
    messagesDiv.appendChild(wrapper)
    messagesDiv.scrollTop = messagesDiv.scrollHeight
}

// Terima DM baru
socket.on('new-private-message', renderDM)

// Typing
let typingTimeout
socket.on('user-typing', () => {
    typingIndicator.textContent = `${RECIPIENT_NAME} sedang mengetik...`
})
socket.on('user-stop-typing', () => {
    typingIndicator.textContent = ''
})

// Kirim DM
dmForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const content = messageInput.value.trim()
    if (!content) return

    socket.emit('send-private', { recipientId: RECIPIENT_ID, content })
    messageInput.value = ''
    socket.emit('stop-typing', {})
    clearTimeout(typingTimeout)
})

messageInput.addEventListener('input', () => {
    socket.emit('typing', {})
    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => socket.emit('stop-typing', {}), 1500)
})
