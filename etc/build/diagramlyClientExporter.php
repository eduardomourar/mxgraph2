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
 * with hardcoded boolean values, and it checks the referer
 * or key request parameter to check if the code can be
 * delivered, which is the case if the key is not expired
 * or if the referer is the mxgraph.com/jgraph.com domain.
 *
 * The key is just an encrypted timestamp with a checksum. The
 * key does not include the version number. This means the same
 * version may be accessed with any key that maps to a timestamp
 * which has not expired, given the checksum is correct.
 *
 * The lic is an encrypted referer with a checksum. If this
 * parameter is used then no key is required. The license key
 * for a specific URL can be generated using keygen.php.
 */

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
		$version = $_GET["version"];
		$jsfile = DIR."/mxClient-$version.js";
		
		deliver(getScript($jsfile));
}



/**
 * Delivers the given code as a compressed JavaScript file.
 */
function deliver($code)
{ 

	echo "// http://license.mxgraph.com/hosted \n";
	echo $code;
}

/**
 * Returns the script for the current agent.
 */
function getScript($filename)
{
		$code = file_get_contents($filename);
			
		// Adds a check to report local copies back to the server
		$now = mktime();
		
		// The following is the equivalent of new Date().getTime():
		// eval('\156\145\167\40\104\141\164\145\50\51\56\147\145\164\124\151\155\145\50\51')
		// This is used to check if the cached/local copy is older than 12 months, which should
		// never be the case as the cache expires after 3 months and the timestamp is the
		// timestamp of delivery. If it is older the code will break by nullifying mxGraph.
		$now -= 63; // changes numbers so they can't be found
		$expire = KILL_EVAL_DELAY - 69; // changes numbers so they can't be found
		$check2 = "if((eval('\\156\\145\\167\\40\\104\\141\\164\\145\\50\\51\\56\\147\\145\\164\\124\\151\\155\\145\\50\\51')/1000)-$now>$expire){mxGraph=function(){};}";	
		$code = str_replace("var mxCodecRegistry=", "$check2;var mxCodecRegistry=", $code);

	return $code;
}













main();
?>
