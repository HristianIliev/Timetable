
<?php

require_once("../db/db.php");

try {

    $db = new DB();
    $connection = $db->getConnection();

    $sql = "SELECT c.id, c.title, c.description, c.day, c.dependencies, c.start_time as startTime, c.end_time as endTime FROM courses c";

    $stmt = $connection->prepare($sql);
    $stmt->execute([]);

    $courses = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($courses, $row);
    }

    echo json_encode($courses);
} catch (PDOException $e) {
    echo json_encode(["status" => "ERROR", "message" => "Грешка при извличане на курсовете"]);
}



?>