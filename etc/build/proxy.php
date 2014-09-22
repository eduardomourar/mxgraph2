<?php
/**
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Simple mechanism to fake the referer for requesting the JS code. The code
 * is still modified for a specific agent so that would have to be passed
 * along from the incoming request for a working proxy.
 */
$server = "www.mxgraph.com";
$page = "demo/mxgraph/src/js/mxclient.php?version=1.2.0.7";
$fp = fsockopen($server, 80, $errno, $errstr, 30);

if (!$fp)
{
    echo "$errstr ($errno)<br />\n";
}
else
{
    $out = "GET /$page HTTP/1.1\r\n";
    $out .= "Host: $server\r\n";
    $out .= "User-Agent: Proxy that fakes the referer\r\n";
    $out .= "Connection: Close\r\n";
	$out .= "Referer: http://www.mxgraph.com/demo/mxgraph/editors/diagrameditor.html\r\n\r\n";

    fwrite($fp, $out);

    while (!feof($fp))
    {
        echo fgets($fp, 128);
    }

    fclose($fp);
}

?>
