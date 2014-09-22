<?php
/**
 * Copyright (c) 2010, Gaudenz Alder
 *
 * This file is used to deliver the JavaScript code for mxGraph.
 * This is used in the online demo and in all the examples that
 * ship with the evaluation version. Note that this file is
 * replaced with the version in etc/build/mxclient.php on
 * each release (deployment of the online demo).
 *
 * This script does two things: It modifies the JavaScript
 * code so that it only works on the browser that has issued
 * the GET request, that is, it replaces all browser checks
 * with hardcoded boolean values.
 */

/**
 * Defines the expiration of a cached copy in the browser cache (in seconds).
 * The browser should request a new copy after this period. Default is 3 months
 * or 7 889 231 seconds.
 */
define("CACHE_EXPIRE", 7889231);

/**
 * Defines the delay (in seconds) to wait before a local copy is destroyed by
 * nullifying the mxGraph variable using an eval statement. Default is 6 months 
 * or 15778463 seconds.
 */
define("KILL_EVAL_DELAY", 31556926);

/**
 * Global constant that defines the directory for versioned
 * JavaScript code.
 */
define("DIR", "../../../history");

/**
 * Main entry point (program starts here)
 */
function main()
{
	$host = getenv("HTTP_HOST");
	
	if (!isset($_GET["header"]))
	{
		alert("Evaluation invalid, please contact JGraph support.");
		header("HTTP/1.0 202 Accepted ");
	}
	else if (!isset($_GET["version"]))
	{
		alert("No version specified.");
	}
	else
	{
		$version = validateVersion($_GET["version"]);
		$jsfile = DIR."/mxClient-".$version.".js";
		
		if (!file_exists($jsfile))
		{
			alert("The specified version does not exist.");
		}
		else
		{
			$mod = getenv("HTTP_IF_MODIFIED_SINCE");
			
			if (isset($mod))
			{
		        $time = strtotime(preg_replace("/;.*$/", "", $mod));
		        
		        if($time >= filemtime($jsfile))
		        {
		            header("HTTP/1.0 304 Not Modified");
		            exit();
		        }
		    }

			// Specifies the content type and result code
			header("HTTP/1.0 200 OK");
			header("Content-Type: application/x-javascript; charset: UTF-8");

			// Creates the last-modified header out of the JS and this PHP filedate
			$gmt_mtime = gmdate("D, d M Y H:i:s", filemtime($jsfile))." GMT";
			header("Last-Modified: ".$gmt_mtime);
		
			deliver(getScript($jsfile, $version));
		}
	}	
}

/**
 * Delivers JavaScript code to display the given alert message.
 */
function alert($message)
{
	echo "alert(\"$message\");";
}

/**
 * Delivers the given code as a compressed JavaScript file.
 */
function deliver($code)
{ 
	// Delivers compressed JS to client for faster loading
	// but starts two buffers to get correct (compressed)
	// content length from non-compressed outer buffer
	ob_start();
	ob_start("ob_gzhandler");

	// Offset of a specific number of seconds for cache expiration
	$offset = CACHE_EXPIRE;

	// Create the header string in GMT not localtime and add the offset
	$expires = "Expires: " . gmdate("D, d M Y H:i:s", time() + $offset) . " GMT";
	header($expires);
	
	// Indicates that this must not be cached by a shared cache
	header("Cache-Control: private");
	
	if (!isset($_GET["header"]))
	{
		echo "// YOU ARE NOT PERMITED TO EXTRACT THE SOURCE OF THIS APPLICATION FOR EXECUTION LOCALLY.\n";
		echo "// YOUR IP ADDRESS HAS BEEN LOGGED, ABUSES WILL CAUSE ACCESS TO THE JGRAPH SERVER TO BE BLOCKED.\n";
		echo "// File created ".date("d-M-Y H:i:s")." for ".getenv("HTTP_USER_AGENT")." IP ".getenv("REMOTE_ADDR")."\n\n";
	}
	else
	{
		// If header was added to indicate that the GAE proxy wants
		// the file. Therefore, the data, user agent and IP are 
		// added by the proxy and a CRC32 check added instead for
		// the proxy to check for transmission corruption
		// CRC32 checksum of the JavaScript
		$crc32 = crc32($code);
		echo "// crc32=".$crc32."\n\n";
	}
	
	// Delivers the actual JS code (encoded and modified for the user agent)
	echo $code;
	
	ob_end_flush(); // flush inner buffer
	$length = ob_get_length();
	header('Content-Length: '.$length);
	ob_end_flush();
	
	return $length;
}

/**
 * Returns the script for the current agent.
 */
function getScript($filename, $version)
{
	$userAgent = strtoupper(getenv("HTTP_USER_AGENT"));

	$isIe = (strpos($userAgent, "MSIE") !== false);
	$isIe6 = (strpos($userAgent, "MSIE 6") !== false);
	$isNs = (strpos($userAgent, "MOZILLA/") !== false && !$isIe);
	$isOp = (strpos($userAgent, "OPERA/") !== false);
	$isGc = (strpos($userAgent, "CHROME/") !== false);
	$isSf = (strpos($userAgent, "APPLEWEBKIT/") !== false) && !$isGc;
	$isMt = ((strpos($userAgent, "FIREFOX/") !== false) &&
			(strpos($userAgent, "FIREFOX/1") === false) &&
			(strpos($userAgent, "FIREFOX/2") === false)) ||
			((strpos($userAgent, "ICEWEASEL/") !== false) &&
			(strpos($userAgent, "ICEWEASEL/1") === false) &&
			(strpos($userAgent, "ICEWEASEL/2") === false)) ||
			((strpos($userAgent, "SEAMONKEY/") !== false) &&
			(strpos($userAgent, "SEAMONKEY/1") === false)) ||
			((strpos($userAgent, "ICEAPE/") !== false) &&
			(strpos($userAgent, "ICEAPE/1") === false));
	
	// Uses caching for 1.3+ versions
	$major = substr($version, 0, 3);
	$useCache = substr($version, 0, 1) != "0" && $major != "1.0" && $major != "1.1" && $major != "1.2";
	$ext = "";
	
	if ($useCache)
	{
		if ($isIe6)
		{
			$ext = ".ie6";
		}
		else if ($isIe)
		{
			$ext = ".ie";
		}
		else if ($isGc)
		{
			$ext = ".gc";
		}
		else if ($isSf)
		{
			$ext = ".sf";
		}
		else if ($isOp)
		{
			$ext = ".op";
		}
		else if ($isMt)
		{
			$ext = ".mt";
		}
		else if ($isNs)
		{
			$ext = ".ns";
		}
	}
	
	// Checks if there is a cached file that can be delivered
	$cacheFilename = $filename.$ext.".cached";
	
	if ($useCache && file_exists($cacheFilename))
	{
		$code = file_get_contents($cacheFilename);
	}
	else
	{
		$code = file_get_contents($filename);
			
		// Required for earlier version prior to 1.2.0.10
		$isIe7 = (strpos($userAgent, "MSIE 7") !== false);
		$isFf2 = (strpos($userAgent, "FIREFOX/2") !== false) ||
			(strpos($userAgent, "ICEWEASEL/2") !== false);
		$isFf3 = (strpos($userAgent, "FIREFOX/3") !== false) ||
			(strpos($userAgent, "ICEWEASEL/3") !== false);
		$code = str_replace("mxClient.IS_IE7", ($isIe7) ? "true" : "false", $code);
		$code = str_replace("mxClient.IS_FF2", ($isFf2) ? "true" : "false", $code);
		$code = str_replace("mxClient.IS_FF3", ($isFf3) ? "true" : "false", $code);
			
		// Replaces browser-checks in the JS code with static boolean values
		$code = str_replace("mxClient.IS_IE6", ($isIe6) ? "true" : "false", $code);
		$code = str_replace("mxClient.IS_IE", ($isIe) ? "true" : "false", $code);
		$code = str_replace("mxClient.IS_NS", ($isNs) ? "true" : "false", $code);
		$code = str_replace("mxClient.IS_OP", ($isOp) ? "true" : "false", $code);
		$code = str_replace("mxClient.IS_GC", ($isGc) ? "true" : "false", $code);
		$code = str_replace("mxClient.IS_SF", ($isSf) ? "true" : "false", $code);
		$code = str_replace("mxClient.IS_MT", ($isMt) ? "true" : "false", $code);

		// The following is the equivalent of new Date().getTime():
		// eval('\156\145\167\40\104\141\164\145\50\51\56\147\145\164\124\151\155\145\50\51')
		// This is used to check if the cached/local copy is older than 12 months, which should
		// never be the case as the cache expires after 3 months and the timestamp is the
		// timestamp of delivery. If it is older the code will break by nullifying mxGraph.
		$now = mktime() - 63; // changes numbers so they can't be found
		$expire = KILL_EVAL_DELAY - 67; // changes numbers so they can't be found
		$check = "if((eval('\\156\\145\\167\\40\\104\\141\\164\\145\\50\\51\\56\\147\\145\\164\\124\\151\\155\\145\\50\\51')/1000)-$now>$expire){mxGraph=function(){};}";	
		$code = str_replace("var mxCodecRegistry=", "$check;var mxCodecRegistry=", $code);
		
		// Avoids checking all different browsers and
		// uses SVG for everything non-IE
		$isSvg = !$isIe;
		$isVml = $isIe;
		
		// Replaces supported vector format in JS code with static boolean values
		// NOTE: This is no longer replaced to support SVG for IE9 in the eval version
		//$code = str_replace("mxClient.IS_SVG", ($isSvg) ? "true" : "false", $code);
		//$code = str_replace("mxClient.IS_VML", ($isVml) ? "true" : "false", $code);
			
		if ($useCache)
		{
			file_put_contents($cacheFilename, $code);
		}
	}

	return $code;
}

/**
 * Keeps only numeric characters and dots.
 */
function validateVersion($param)
{
	$result = "";

	for ($i = 0; $i < strlen($param); $i++)
	{
		$value = ord($param[$i]);
		
		if (($value >= 48 && $value <= 57) || $value == 46)
		{
			$result .= $param[$i];
		}
	}
	
	return $result;
}

main();
?>
