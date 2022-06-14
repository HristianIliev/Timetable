
<?php

require_once("../db/db.php");

try {
    $specialty = $_GET["specialty"];

    $db = new DB();
    $connection = $db->getConnection();

    $sql = "SELECT c.specialty, c.id, c.title, c.description, c.day, c.dependencies, c.start_time as startTime, c.end_time as endTime FROM courses c";

    $stmt = $connection->prepare($sql);
    $stmt->execute();
    $courses = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($courses, $row);
    }

    $result = [];
    for($i = 0; $i < count($courses); $i++) {
	    if ($courses[$i]["specialty"] == $specialty) {
            array_push($result, $courses[$i]);
        }
    }

    echo json_encode($result);
} catch (PDOException $e) {
    echo json_encode(["status" => "ERROR", "message" => "Грешка при извличане на курсовете"]);
}



?>