let socket; // Объявляем переменную здесь
let currentChatId = null; // Объявляем переменную для текущего чата

$(document).ready(function() {
  console.log("chat.js загружен");

  // Инициализация Pusher
  const pusher = new Pusher('8479015f563e87bf5b1b', {
    cluster: 'eu',
    encrypted: true
  });

  socket = io.connect("http://localhost:3000"); // Инициализируем socket
  console.log("Подключение к сокетам:", socket); // Проверка подключения

  var message = $("#message");
  var send_message = $("#send_message");
  var emoji_button = $("#emoji_button");
  var emoji_menu = $("#emoji_menu");
  var file_input = $("#file_input");
  var username = $("#username");

  // Установка никнейма
  $("#username").on("change", function() {
    const name = $(this).val();
    if (name) {
      socket.emit("change_username", { username: name });
      $("#nickname_display").text(name); // Обновляем отображаемый ник
      $("#current_nickname").show(); // Показываем текущий ник
      console.log("Никнейм установлен:", name);
      $(this).val(''); // Очищаем поле ввода после установки
    }
  });

  // Обработка ошибки никнейма
  socket.on('username_error', function(errorMessage) {
    alert(errorMessage); // Показываем сообщение об ошибке
    $("#username").val(''); // Очищаем поле ввода
  });

  // Показать/скрыть меню смайлов
  emoji_button.on("click", function(event) {
    event.stopPropagation();
    emoji_menu.toggle(); // Переключить видимость меню смайлов

    // Позиционирование меню над кнопкой
    const buttonOffset = $(this).offset();
    const buttonHeight = $(this).outerHeight(); // Высота кнопки

    emoji_menu.css({
      top: buttonOffset.top - emoji_menu.outerHeight() - 10, // 10px отступ сверху
      left: buttonOffset.left
    });

    console.log("Меню смайлов открыто");
  });

  // Закрытие меню смайлов при клике вне меню
  $(document).on("click", function(event) {
    if (!$(event.target).closest('#emoji_button').length && !$(event.target).closest('#emoji_menu').length) {
      emoji_menu.hide();
    }
  });

  // Добавление смайла в поле ввода
  $(document).on("click", ".emoji", function() {
    const emoji = $(this).data("emoji");
    message.val(message.val() + emoji); // Добавляем смайл в поле ввода
    emoji_menu.hide(); // Скрываем меню после выбора
    console.log("Смайл выбран:", emoji);
  });

  // Отправка сообщения
  send_message.on("click", () => {
    const messageText = message.val().trim(); // Получаем текст сообщения
    if (messageText !== "") {
      const timestamp = new Date().toLocaleTimeString(); // Получаем текущее время
      socket.emit("new_message", {
        message: messageText,
        time: timestamp // Отправляем время вместе с сообщением
      });
      $("#message").val(""); // Очищаем поле ввода
    } else {
      console.log("Сообщение пустое."); // Лог для отладки
    }
  });

  // Обрботка загрузки файла
  file_input.change(function() {
    var file = file_input[0].files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        socket.emit("new_message", {
          message: `<img src="${e.target.result}" alt="Image" style="max-width: 200px;"/>`,
          className: "image" // Пример класса для изображений
        });
      };
      reader.readAsDataURL(file);
      file_input.val(""); // Очищаем поле ввода
      console.log("Файл загружен:", file.name);
    }
  });

  // Обработка новых сообщений
  socket.on("add_mess", (data) => {
    // Добавляем сообщение с рамкой и временем
    $("#messages").append(`
        <div class="message">
            <div>
                <b>${data.username}</b>: ${data.message}
            </div>
            <div class="message-time">${data.time}</div>
        </div>
    `);
  });

  socket.on('connect', () => {
    console.log('Клиент подключен к сокетам'); // Отладочное сообщение
  });

  socket.on('disconnect', () => {
    console.log('Клиент отключен от сокетов'); // Отладочное сообщение
  });

  socket.on('chat_history', (messages) => {
    messages.forEach(msg => {
      $("#messages").append(`<div><b>${msg.username}</b>: ${msg.message}</div>`);
    });
  });

  $("#send_username").one("click", function() {
    const name = $("#username").val().trim(); // Убираем пробелы
    console.log("Введенный никнейм:", name); // Отладочное сообщение
    if (name) {
        socket.emit("change_username", { username: name });
        $("#nickname_display").text(name); // Обновляем отображаемый ник
        $("#current_nickname").show(); // Показываем текущий ник
        console.log("Никнейм установлен:", name);
        $("#username").val(''); // Очищаем поле ввода после установки
    } else {
        alert("Пожалуйста, введите никнейм."); // Сообщение об ошибке
    }
  });

  socket.on('chat_changed', (chatId) => {
    currentChatId = chatId; // Обновляем currentChatId
  });
});
