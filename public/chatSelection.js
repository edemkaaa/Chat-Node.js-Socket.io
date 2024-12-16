$(document).ready(function() {
    $(".chat-item").on("click", function() {
        const chatId = $(this).data("chat-id");
        $("#messages").empty(); // Очищаем сообщения при смене чата
        console.log("Выбран чат с ID:", chatId);

        // Удаляем класс 'active' у всех элементов и добавляем только к выбранному
        $(".chat-item").removeClass("active");
        $(this).addClass("active");

        // Здесь можно добавить логику для загрузки сообщений, если это необходимо
    });
});