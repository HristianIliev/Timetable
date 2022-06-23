<?php

require_once('../db/db.php');

function validate($course) {
    if (!isset($course["title"]) && !isset($course["teacher"]) && !isset($course["location"]) && !isset($course["description"]) && !isset($course["day"]) && !isset($course["startTime"]) && !isset($course["specialty"])) {
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

        unset($course["id"]);

        $sql = "INSERT INTO courses (title, teacher, location, description, day, start_time, end_time, dependencies, specialty) 
                VALUES (:title, :teacher, :location, :description, :day, :startTime, :endTime, :dependencies, :specialty)";

        unset($course->id);
        
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