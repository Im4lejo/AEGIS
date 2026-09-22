<?php

class Model
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    /*
    |--------------------------------------------------------------------------
    | QUERY
    |--------------------------------------------------------------------------
    */

    public function query($sql, $params = [])
    {
        if (!is_array($params)) {
            $params = [$params];
        }

        if (empty($params)) {
            return $this->db->query($sql);
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /*
    |--------------------------------------------------------------------------
    | FETCH
    |--------------------------------------------------------------------------
    */

    public function fetch($sql, $params = [])
    {
        return $this->query($sql, $params)->fetch(PDO::FETCH_ASSOC);
    }

    /*
    |--------------------------------------------------------------------------
    | FETCH ALL
    |--------------------------------------------------------------------------
    */

    public function fetchAll($sql, $params = [])
    {
        return $this->query($sql, $params)->fetchAll(PDO::FETCH_ASSOC);
    }
}
