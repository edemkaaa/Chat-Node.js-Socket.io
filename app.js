const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const Pusher = require('pusher');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000;

// Настройка Pusher
const pusher = new Pusher({
	appId: '1910729', // Ваш App ID
	key: '8479015f563e87bf5b1b', // Ваш Key
	secret: '1d70fc772970f9726ad3', // Ваш Secret
	cluster: 'eu', // Ваш Cluster
	useTLS: true
});

// Настройка EJS
app.set('view engine', 'ejs'); // Укажите EJS как движок представлений
app.set('views', path.join(__dirname, 'views')); // Укажите папку с представлениями

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/');
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	}
});

const upload = multer({ storage: storage });

// Эндпоинт для загрузки файлов
app.post('/upload', upload.single('file'), (req, res) => {
	if (!req.file) {
		return res.status(400).send('No file uploaded.');
	}
	const filePath = '/uploads/' + req.file.filename;
	console.log('File uploaded:', filePath);

	// Отправка события в Pusher
	pusher.trigger('chat', 'file_uploaded', {
		username: req.body.username,
		filePath: filePath
	});

	res.status(200).send({ filePath });
});

// Хранение имен пользователей
const usernames = new Set(); // Используем Set для уникальности имен

// Эндпоинт для отправки сообщений
app.post('/messages', (req, res) => {
	const { username, message } = req.body;
	console.log('Received message:', { username, message });

	// Отправка события в Pusher
	pusher.trigger('chat', 'message', {
		username,
		message
	});

	res.status(200).send('Message sent');
});

// Обработчик для корневого URL
app.get('/', (req, res) => {
	res.render('index'); // Убедитесь, что у вас есть файл index.ejs в папке views
});

// Запуск сервера
const server = http.createServer(app);
const io = socketIo(server);

const activeUsernames = new Set(); // Хранение активных никнеймов

io.on('connection', (socket) => {
	console.log('Новое подключение:', socket.id); // Отладочное сообщение
	socket.username = "Anonymous"; // По умолчанию имя пользователя

	// Обработка изменения имени пользователя
	socket.on('change_username', (data) => {
		if (activeUsernames.has(data.username)) {
			socket.emit('username_error', 'Ник уже занят. Пожалуйста, выберите другой.'); // Отправляем ошибку
		} else {	
			activeUsernames.forEach((username) => {
				if (username === data.username) {
					socket.emit('username_error', 'Ник уже занят. Пожалуйста, выберите другой.'); // Отправляем ошибку
				}
			});
			socket.username = data.username; // Сохраняем никнейм в сокете
			activeUsernames.add(data.username); // Добавляем никнейм в активные
			console.log('Никнейм изменен на:', socket.username); // Отладочное сообщение
		}
	});

	// Обработка нового сообщения
	socket.on('new_message', (data) => {
		// Отправляем сообщение всем клиентам
		io.emit("add_mess", {
			username: socket.username || "Anonymous",
			message: data.message,
			time: data.time // Передаем время
		});
	});

	// Обработчик для загрузки файлов
	socket.on('file_uploaded', (data) => {
		if (data.filePath) {
			console.log('File uploaded event received:', data);
			io.sockets.emit('add_mess', {
				message: '',
				username: data.username,
				className: 'file',
				filePath: data.filePath
			});
		} else {
			console.error('File path is missing:', data);
		}
	});

	socket.on('typing', (data) => {
		socket.broadcast.emit('typing', { username: socket.username });
	});

	socket.on('disconnect', () => {
		activeUsernames.delete(socket.username); // Удаляем никнейм при отключении
		console.log('Клиент отключен:', socket.username);
	});

	socket.on('chat_history', (messages) => {
		messages.forEach(msg => {
			$("#messages").append(`<div><b>${msg.username}</b>: ${msg.message}</div>`);
		});
	});
});

server.listen(port, () => {
	console.log(`Сервер запущен на http://localhost:${port}`);
});
