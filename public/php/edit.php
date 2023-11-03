<?php
$jsonString = file_get_contents("../levels.json");
file_put_contents('../levels.backup.json', $jsonString);
$data = json_decode($jsonString, true);

$jsonLevel = $_POST['level'];
$level = json_decode($jsonLevel, true);
$hashedPasswordFromRequest = $_POST['password'];
$storedPassword = file_get_contents('../password');

if (password_verify($hashedPasswordFromRequest, $storedPassword)) {
  die("Invalid password.");
}
if ($level === null) {
    die("Level can't be null");
}

array_push($data['levels'], $level);

$newJsonString = json_encode($data);
file_put_contents('../levels.json', $newJsonString);
?>
