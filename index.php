<?php

$uri = explode('/', $_SERVER['REQUEST_URI']);
$view = "views/";
$view.= "object.php";

// show the things
require_once("views/head.php");
require_once($view);
if (!$uri[1]) {
	require_once("views/clock.php");
}
require_once("views/analyzer.php");
require_once("views/foot.php");
?>
