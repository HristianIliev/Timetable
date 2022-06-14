<?php

require_once("../db/db.php");

try {

    $db = new DB();
    $connection = $db->getConnection();

    $entityBody = json_decode(file_get_contents('php://input'));

    $sql = "SELECT * FROM users";

    $stmt = $connection->prepare($sql);
    $stmt->execute([]);

    $users = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($users, $row);
    }

    for($i = 0; $i < count($users); $i++) {
	    if ($users[$i]["email"] == $entityBody->email && $users[$i]["password"] == $entityBody->password) {
            http_response_code(200);

            return;
        }
    }

    http_response_code(401);

    echo json_encode(["status" => "ERROR", "message" => "Няма такъв потребител"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "ERROR", "message" => "Грешка при логин"]);
}

?>