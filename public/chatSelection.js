$(document).ready(function() {
    console.log("chatSelection.js загружен");

    // Переменная для хранения текущего чата
    let currentChatId = null;

    // Обработка выбора чата
    $(".chat-item").on("click", function() {
        currentChatId = $(this).data("chat-id");
        $("#messages").empty(); // Очищаем сообщения при смене чата
        console.log("Выбран чат с ID:", currentChatId);
        
        // Запрашиваем историю сообщений для выбранного чата
        socket.emit('get_chat_history', currentChatId);
    });
}); 