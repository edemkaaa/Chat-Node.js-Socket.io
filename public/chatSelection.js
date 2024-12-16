$(document).ready(function() {
    $(".chat-item").on("click", function() {
        const chatId = $(this).data("chat-id");
        currentChatId = chatId; // Обновляем currentChatId
        console.log("Текущий ID чата:", currentChatId); // Отладочное сообщение
        $("#messages").empty(); // Очищаем сообщения при смене чата
        console.log("Выбран чат с ID:", chatId);

        // Удаляем класс 'active' у всех элементов и добавляем только к выбранному
        $(".chat-item").removeClass("active");
        $(this).addClass("active");

        // Загружаем сообщения из локального хранилища
        loadMessagesFromLocalStorage(chatId);
    });

    // Функция для загрузки сообщений из локального хранилища
    function loadMessagesFromLocalStorage(chatId) {
        const messages = JSON.parse(localStorage.getItem(`chat_${chatId}`)) || [];
        console.log("Загружаем сообщения из локального хранилища для чата:", chatId, messages); // Отладочное сообщение
        messages.forEach(msg => {
            $("#messages").append(`
                <div class="message">
                    <div>
                        <b>${msg.username}</b>: ${msg.message}
                    </div>
                    <div class="message-time">${msg.time}</div>
                </div>
            `);
        });
    }
});

socket.on('chat_changed', (chatId) => {
    currentChatId = chatId; // Обновляем currentChatId
});