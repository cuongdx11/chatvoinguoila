const socket = io();
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const usernameModal = document.getElementById('username-modal');
const usernameInput = document.getElementById('username-input');
const usernameSubmit = document.getElementById('username-submit');
const chatContainer = document.getElementById('chat-container');
const themeSelect = document.getElementById('theme-select');
const themeToggle = document.getElementById('theme-toggle');

let username = '';
let userId = '';

// Theme switching function
function setTheme(theme) {
    document.body.className = theme ? `theme-${theme}` : '';
    localStorage.setItem('chatTheme', theme);
}

// Load saved theme
const savedTheme = localStorage.getItem('chatTheme');
if (savedTheme) {
    setTheme(savedTheme);
    themeSelect.value = savedTheme;
}

// Theme select event listener
themeSelect.addEventListener('change', (e) => {
    setTheme(e.target.value);
});

// Dark mode toggle
themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    this.innerHTML = document.body.classList.contains('dark-mode') ?
        '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

usernameModal.style.display = 'block';

usernameSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    username = usernameInput.value.trim();
    if (username) {
        socket.emit('set username', username);
    }
});

socket.on('username set', (data) => {
    username = data.username;
    userId = data.userId;
    usernameModal.style.display = 'none';
    chatContainer.style.display = 'block';
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chatInput.value && username) {
        socket.emit('chat message', chatInput.value);
        chatInput.value = '';
    }
});

socket.on('waiting', () => {
    chatMessages.innerHTML = '';
    const messageElement = document.createElement('div');
    messageElement.classList.add('system-message');
    messageElement.textContent = 'Waiting for a partner...';
    chatMessages.appendChild(messageElement);
    chatForm.style.display = 'none';
});

socket.on('chat start', (partner) => {
    chatMessages.innerHTML = '';
    const messageElement = document.createElement('div');
    messageElement.classList.add('system-message');
    messageElement.textContent = `You are now chatting with ${partner.username}`;
    chatMessages.appendChild(messageElement);
    chatForm.style.display = 'flex';
});

socket.on('chat message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(data.userId === userId ? 'self' : 'other');
    
    const usernameElement = document.createElement('div');
    usernameElement.classList.add('username');
    usernameElement.textContent = data.username;
    
    const textElement = document.createElement('div');
    textElement.textContent = data.message;
    
    messageElement.appendChild(usernameElement);
    messageElement.appendChild(textElement);
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('partner left', () => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('system-message');
    messageElement.textContent = 'Your chat partner has left. Refresh the page to start a new chat.';
    chatMessages.appendChild(messageElement);
    chatForm.style.display = 'none';
});


