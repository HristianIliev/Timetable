<?php
require_once("../db/db.php");

if (isset($_GET["id"])) {
    $id = $_GET["id"];

    try {
        $db = new DB();
        $connection = $db->getConnection();

        $sql = "DELETE FROM courses WHERE id = ?";
        $connection->prepare($sql)->execute([$id]);

        echo json_encode(["status" => "SUCCESS", "message" => "Курсът е изтрит"]);

    } catch (PDOException $e) {
		http_response_code(500);
        echo json_encode(["status" => "ERROR", "message" => "Грешка при изтриване на курс"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "ERROR", "message" => "Некоректни данни"]);
}
?>