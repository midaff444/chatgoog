const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Создание Express приложения
const app = express();
const server = http.createServer(app);

// Настройка Socket.io с CORS
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, './')));

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Хранение информации о пользователях
const users = {};

// Обработка подключений Socket.io
io.on('connection', (socket) => {
    console.log('Пользователь подключился:', socket.id);
    
    // Обработка сообщений чата
    socket.on('chat message', (data) => {
        // Сохранение имени пользователя
        if (!users[socket.id]) {
            users[socket.id] = data.username;
            // Уведомление о новом пользователе
            socket.broadcast.emit('user connected', data.username);
        }
        
        // Отправка сообщения всем, кроме отправителя
        socket.broadcast.emit('chat message', data);
    });
    
    // Обработка отключения
    socket.on('disconnect', () => {
        console.log('Пользователь отключился:', socket.id);
        
        // Уведомление об отключении пользователя
        if (users[socket.id]) {
            io.emit('user disconnected', users[socket.id]);
            delete users[socket.id];
        }
    });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
}); 