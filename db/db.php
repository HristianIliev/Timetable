<?php

    class DB {

        private $connection;

        function __construct() {
            $json = file_get_contents('./../db_connection_data.json');
            $json_data = json_decode($json,true);

            $host = $json_data["host"];
            $dbname = $json_data["dbname"];
            $username = $json_data["username"];
            $password = $json_data["password"];

            $dsn = "mysql:host=$host;dbname=$dbname";

            $this->connection = new PDO($dsn, $username, $password);
        }

        function getConnection() {
            return $this->connection;
        }

    }



?>