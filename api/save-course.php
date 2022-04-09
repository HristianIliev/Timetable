<?php

require_once('../db/db.php');

function validate($course) {
    if (!isset($course["title"]) && !isset($course["description"]) && !isset($course["day"]) && !isset($course["startTime"]) && !isset($course["endTime"])) {
        return ["isValid" => false, "message" => "Некоректни данни!"];
    }

    return ["isValid" => true, "message" => "Данните са валидни!"];
}

$post = file_get_contents("php://input");

if ($post) {
    $course = json_decode($post, true);

    $valid = validate($course);

    if (!$valid["isValid"]) {
        http_response_code(400);
        exit($valid["message"]);
    }

    try {
        $db = new DB();
        $connection = $db->getConnection();

        $sql = "INSERT INTO courses (title, description, day, start_time, end_time, dependencies) 
                VALUES (:title, :description, :day, :startTime, :endTime, :dependencies)";

        $stmt = $connection->prepare($sql);
        $stmt->execute($course);

        $courseId = $connection->lastInsertId();

        echo json_encode(["status" => "SUCCES", "message" => "Курсът е записан", "id" => $courseId]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "ERROR", "message" => "Грешка при запис на курс"]);
    }

} else {
    http_response_code(400);
    exit(json_encode(["status" => "ERROR", "message" => "Грешка!"]));
}

?>