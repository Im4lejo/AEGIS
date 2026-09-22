<?php

class Database
{
    private static $instance = null;

    public static function connect()
    {
        if (self::$instance === null) {

            $config = require ROOT_PATH . '/config/database.php';

            try {

                self::$instance = new PDO(
                    "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}",
                    $config['user'],
                    $config['password']
                );

                self::$instance->setAttribute(
                    PDO::ATTR_ERRMODE,
                    PDO::ERRMODE_EXCEPTION
                );

            } catch (PDOException $e) {

                die('Error de conexión: ' . $e->getMessage());
            }
        }

        return self::$instance;
    }
}