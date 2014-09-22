<?php
/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */

// Creates a create table statement for each table in $db
$db = isset($_REQUEST["db"]) ? $_REQUEST["db"] : null;

if (!isset($db))
{
	echo "No database selected";
}
else
{
	// Action is refresh for a SQL response
	$action = isset($_REQUEST["action"]) ? $_REQUEST["action"] : null;
	$sql = "";
	
	// Opens the database connection (use PMA config in production)
	$database = mysql_connect("localhost", "root", "root") or die("Connection Failure");
	
	// Queries all tables in the database
	$results = mysql_query("SHOW TABLES FROM $db", $database) or die("Failed Show Tables for $db");
	$tables = array();
	
	while($row = mysql_fetch_row($results))
	{
		array_push($tables, $row[0]);
	}
	
	mysql_free_result($results);
	
	// Selects the database
	mysql_select_db($db, $database) or die ("Database not found");
	
	// Queries all table definitions
	foreach ($tables as $table)
	{
		$results = mysql_query("SHOW CREATE TABLE $table", $database) or die("Failed Show Create Table for $table");
		$row = mysql_fetch_row($results);
		$sql .= "\n".$row[1];
		mysql_free_result($results);
	}
	
	mysql_close($database);
	
	// Here is a sample sql statement to parse in the client
	$sql2 = "CREATE TABLE `city` (\n".
		"  `city_id` smallint(5) unsigned NOT NULL auto_increment,\n".
		"  `city` varchar(50) NOT NULL,\n".
		"  `country_id` smallint(5) unsigned NOT NULL,\n".
		"  `last_update` timestamp NOT NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,\n".
		"  PRIMARY KEY  (`city_id`),\n".
		"  KEY `idx_fk_country_id` (`country_id`),\n".
		"  CONSTRAINT `fk_city_country` FOREIGN KEY (`country_id`) REFERENCES `country` (`country_id`) ON UPDATE CASCADE\n".
		") ENGINE=InnoDB DEFAULT CHARSET=utf8\n".
		"CREATE TABLE `country` (\n".
		"  `country_id` smallint(5) unsigned NOT NULL auto_increment,\n".
		"  `country` varchar(50) NOT NULL,\n".
		"  `last_update` timestamp NOT NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,\n".
		"  PRIMARY KEY  (`country_id`)\n".
		") ENGINE=InnoDB DEFAULT CHARSET=utf8\n".
		"CREATE TABLE `address` (\n".
		"  `address_id` smallint(5) unsigned NOT NULL auto_increment,\n".
		"  `address` varchar(50) NOT NULL,\n".
		"  `address2` varchar(50) default NULL,\n".
		"  `district` varchar(20) NOT NULL,\n".
		"  `city_id` smallint(5) unsigned NOT NULL,\n".
		"  `postal_code` varchar(10) default NULL,\n".
		"  `phone` varchar(20) NOT NULL,\n".
		"  `last_update` timestamp NOT NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,\n".
		"  PRIMARY KEY  (`address_id`),\n".
		"  KEY `idx_fk_city_id` (`city_id`),\n".
		"  CONSTRAINT `fk_address_city` FOREIGN KEY (`city_id`) REFERENCES `city` (`city_id`) ON UPDATE CASCADE\n".
		") ENGINE=InnoDB DEFAULT CHARSET=utf8\n";
	
	// Loads the template into a single string
	$template = file_get_contents("designer.html");
	
	// Replaces the placeholder in the template with the XML data
	// which is then parsed into the graph model. Note: In a production
	// environment you should use a template engine instead.
	if ($action == "refresh")
	{
		echo $sql;
	}
	else
	{
		$sql = addslashes(htmlentities(str_replace("\n", "\\n", $sql)));
		$page = str_replace("%sql%", $sql, $template);
		
		// Makes sure there is no caching on the client side
		header("Pragma: no-cache"); // HTTP 1.0
		header("Cache-control: private, no-cache, no-store");
		header("Expires: 0");
		
		echo $page;
	}
}
?>
