<?php
require_once("../db/db.php");

if (isset($_GET["email"])) {
    $email = $_GET["email"];

    try {
        $db = new DB();
        $connection = $db->getConnection();

        $sql = "SELECT * FROM users WHERE email = ?";

        $stmt = $connection->prepare($sql);
        $stmt->execute([$email]);

        $users = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($users, $row);
        }

        echo json_encode(["specialty" => $users[0]["specialty"]]);
    } catch (PDOException $e) {
		http_response_code(500);
        echo json_encode(["status" => "ERROR", "message" => "Грешка"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "ERROR", "message" => "Некоректни данни"]);
}
?>