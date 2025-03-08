document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const usernameInput = document.getElementById('username');
    const sendButton = document.getElementById('send-button');

    // Проверка, поддерживается ли localStorage
    const username = localStorage.getItem('chat-username') || '';
    usernameInput.value = username;

    // Сохранение имени пользователя при изменении
    usernameInput.addEventListener('change', () => {
        localStorage.setItem('chat-username', usernameInput.value);
    });

    // Подключение к серверу Socket.io
    const socket = io('http://localhost:3000');

    // Обработка подключения к серверу
    socket.on('connect', () => {
        addSystemMessage('Вы подключились к чату');
    });

    // Обработка отключения от сервера
    socket.on('disconnect', () => {
        addSystemMessage('Соединение с сервером потеряно');
    });

    // Получение сообщения от сервера
    socket.on('chat message', (data) => {
        addMessage(data, false);
    });

    // Получение уведомления о подключении нового пользователя
    socket.on('user connected', (username) => {
        addSystemMessage(`${username} присоединился к чату`);
    });

    // Получение уведомления об отключении пользователя
    socket.on('user disconnected', (username) => {
        addSystemMessage(`${username} покинул чат`);
    });

    // Отправка сообщения
    function sendMessage() {
        const message = messageInput.value.trim();
        const username = usernameInput.value.trim() || 'Аноним';

        if (message) {
            const messageData = {
                username,
                text: message,
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            };

            // Отправка сообщения на сервер
            socket.emit('chat message', messageData);

            // Добавление сообщения в чат
            addMessage(messageData, true);

            // Очистка поля ввода
            messageInput.value = '';
        }
    }

    // Добавление сообщения в чат
    function addMessage(data, isSent) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isSent ? 'sent' : 'received');

        const usernameElement = document.createElement('div');
        usernameElement.classList.add('username');
        usernameElement.textContent = data.username;

        const textElement = document.createElement('div');
        textElement.classList.add('text');
        textElement.textContent = data.text;

        const timeElement = document.createElement('div');
        timeElement.classList.add('time');
        timeElement.textContent = data.time;

        messageElement.appendChild(usernameElement);
        messageElement.appendChild(textElement);
        messageElement.appendChild(timeElement);

        chatMessages.appendChild(messageElement);
        
        // Прокрутка чата вниз
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Добавление системного сообщения
    function addSystemMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'system');
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        
        // Прокрутка чата вниз
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Обработчики событий
    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Добавление демо-сообщений, если нет соединения с сервером
    setTimeout(() => {
        if (!socket.connected) {
            addSystemMessage('Не удалось подключиться к серверу. Показываем демо-режим.');
            
            // Демо-сообщения
            addMessage({
                username: 'Мария',
                text: 'Привет всем! Как дела?',
                time: '12:30'
            }, false);
            
            setTimeout(() => {
                addMessage({
                    username: 'Иван',
                    text: 'Привет! Всё отлично, спасибо!',
                    time: '12:31'
                }, false);
            }, 1000);
            
            setTimeout(() => {
                addMessage({
                    username: 'Анна',
                    text: 'Привет, ребята! Что нового?',
                    time: '12:33'
                }, false);
            }, 2000);
        }
    }, 3000);
}); 