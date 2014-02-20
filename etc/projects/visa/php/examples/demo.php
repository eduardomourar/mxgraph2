<?php
/**
 * $Id: demo.php,v 1.1 2012/11/15 13:26:49 gaudenz Exp $
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: Demo
 * 
 * Demo for the VISA Network Editor PHP backend. This file can be run via a
 * GET request. Possible URL parameters are
 * 
 * - format to specify the output format
 * - example to specify the example number
 * - file to request a save dialog
 * 
 * Format is one of xml, png, jpg or gif. If no format is given, then the
 * mxClient is used to display the diagram. Gif, png and jpg will produce
 * bitmap images.
 * 
 * Example is a number from 1 to 8 speifying the example diagram to render.
 * If no example is given, then the first diagram is rendered.
 * 
 * File is an optional parameter to request a save dialog with the given
 * filename.
 * 
 * Example:
 * (code)
 * demo.php?format=png&example=2
 * (end)
 */
if (file_exists("../../../mxgraph/php/src/mxServer.php"))
{
	include_once("../../../mxgraph/php/src/mxServer.php");
}
else
{
	include_once("../../../../../php/src/mxServer.php");
}

include_once("../src/vsPerimeter.php");
include_once("../src/vsEdgeStyle.php");
include_once("../src/vsGraphModel.php");
include_once("../src/vsNetworkLayout.php");
include_once("../src/vsGdCanvas.php");
include_once("../src/vsGraph.php");

class Demo
{

	/**
	 * Variable: doc
	 *
	 * Holds the XML document.
	 */
	var $template = "demo.tpl";

	/**
	 * Function: run
	 * 
	 * Implements the lifecycle of the demo object.
	 */
	function run()
	{
		$format = null;
		$layout = null;
		$ex = null;
		$file = null;
		
		if (isset($_GET["format"]))
		{
			$format = $_GET["format"]; 
		}
		
		if (isset($_GET["layout"]))
		{
			$layout = $_GET["layout"]; 
		}
		
		if (isset($_GET["example"]))
		{
			$ex = $_GET["example"];
		}
		
		if (isset($_GET["file"]))
		{
			$file = $_GET["file"];
		}
	
		$model = null;

		if (isset($ex))
		{
			$fn = "example$ex";
			$model = $this->$fn();
		
			$graph = new vsGraph($model);
			$graph->loadStyle("../../xml/src/defaultstyle.xml");
	
			if (!isset($layout) || $layout == "1")
			{
				$layout = new vsNetworkLayout($graph);
				$layout->execute($graph->getDefaultParent());
			}
	
			if ($file != null)
			{
				header("Content-Disposition: attachment; filename=\"$file\"");
			}
	
			if ($format == "png" || $format == "gif" || $format == "jpg")
			{
				$image = $graph->createImage(null, "#FFFFFF");
				
				// Creates an interlaced image for better loading in the browser
				if ($format == "jpg")
				{
					imageInterlace($image, 1);
				}
				
				// Marks background color as being transparent. This is supported
				// by GIF and PNG but currently only used for GIF so that one can
				// request a non-transparent image in PNG format.
				else if ($format == "gif")
				{
					imageColorTransparent($image, imageColorAllocate($image, 255, 255, 255));
				}

				header("Content-Type: image/$format");
				echo mxUtils::encodeImage($image, $format);
			}
			else
			{
				$xmlNode = $model->getXml();
				$xml = $xmlNode->ownerDocument->saveXML($xmlNode);
	
				if ($format == "xml")
				{
					header("Content-type: application/xml");
					echo $xml;
				}
				else
				{
					echo $this->createPage($this->template, array("xml" => $xml));
				}
			}
		}
		else
		{
			echo "No example specified";
		}
		
		//error_log("memory usage: ".(memory_get_usage()/1048576)." MB");
	}
	
	/**
	 * Function: createPage
	 * 
	 * Poor man's template engine.
	 * 
	 * Creates a string by replacing all variables of the form {$key} in
	 * <template> with the respective value in the given associative array.
	 * 
	 * This function is not for production use!
	 */
	function createPage($template, $vars)
	{
		$page = file_get_contents($template);
	
		foreach ($vars as $key => $value)
		{
			$value = addslashes(htmlentities(str_replace("\n", "&#xa;", $value)));
			$page = str_replace("{\$".$key."}", $value, $page);
		}
		
		return $page;
	}

	/**
	 * Function: example1
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network, both rows have a end vertex.
	 */
	function example1()
	{
		// Creates a graph model
		$model = new vsGraphModel("Endpoint LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "PPUSC61", "DNEC 669087\nVPI/VCI = 1/132\nPCR = 256kpbs\n45Mbps"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v4 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE 2", "ASE2Name\nIP = .136", "Ctk ID ABC 821960\nT1 Ckt ID = ABC 1234 Chls 1-4\n256kpbs"),
			80, 30, "ase");
		$v5 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"R2=2611\nR2Name\nLO = .97"),
			80, 60);
		$v6 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"S2Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v8 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v9 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "PPUSC61", "DNEC 669087\nVPI/VCI = 1/132\nPCR = 256kpbs\n45Mbps"),
			50, 20);
		$v10 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v11 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE 2", "ASE2Name\nIP = .136", "Ctk ID ABC 821960\nT1 Ckt ID = ABC 1234 Chls 1-4\n256kpbs"),
			80, 30, "ase");
		$v12 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"R1=2611\nR1Name\nLO = .97"),
			80, 60);
		$v13 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"S1Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v14 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null), $v2, $v3, "carrier");
		$model->connect($model->createLink(null), $v3, $v4, "carrier");
		$model->connect($model->createLink(null, "", "", ".2 (S0/0.1)\nDLCI 232"), $v4, $v5);
		$model->connect($model->createLink(null, "", "", "p3"), $v4, $v6);
		$model->connect($model->createLink(null, "", "e0/0, .131", "p1"), $v5, $v6);
		$model->connect($model->createLink(null, "", "p3"), $v6, $v7);
		$model->connect($model->createLink(null, "OC3"), $v8, $v9);
		$model->connect($model->createLink(null), $v9, $v10, "carrier");
		$model->connect($model->createLink(null), $v10, $v11, "carrier");
		$model->connect($model->createLink(null, "", "", ".66 (S0/0.1)\nDLCI 232"), $v11, $v12);
		$model->connect($model->createLink(null, "", "", "p3"), $v11, $v13);
		$model->connect($model->createLink(null, "", "e0/0, .131", "p1"), $v12, $v13);
		$model->connect($model->createLink(null, "", "p5"), $v13, $v14);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "e1/0 .162", "e1/0 .161"), $v5, $v12);
		$model->connect($model->createLink(null, "Crossover", "p2", "p2"), $v6, $v13);
		$model->connect($model->createLink(null, "Crossover", "p12", "p12"), $v13, $v6);
		$model->connect($model->createLink(null), $v7, $v14);
		
		return $model;
	}

	/**
	 * Function: example2
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network, both rows have two end vertices.
	 */
	function example2()
	{
		// Creates a graph model
		$model = new vsGraphModel("Member's LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v4 = $model->insert($model->createEntity(null, 1, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v5 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr></table>"),
			140, 60, "isr");
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v8 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v10 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v11 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v12 = $model->insert($model->createEntity(null, 2, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v13 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v14 = $model->insert($model->createEntity(null, 2, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr></table>"),
			140, 60, "isr");
		$v15 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v16 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null, "YFBHMW6S.0001\nVCC = 1/62\nPCR = 4632Kbps\n45Mbps"), $v2, $v3, "carrier");
		$model->connect($model->createLink(null), $v3, $v4, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null, "YFBD6DS00002, TACM=511437\nYFBD6DS00002, TACM=511437\nYFBD6DS00002, TACM=511437"), $v4, $v5);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v4, $v6);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v6, $v7);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v6, $v8);
		$model->connect($model->createLink(null, "OC3"), $v9, $v10);
		$model->connect($model->createLink(null, "YFBHMW6S.0001\nVCC = 1/62\nPCR = 4632Kbps\n45Mbps"), $v10, $v11, "carrier");
		$model->connect($model->createLink(null, "DHEC 594014.801\nDHEC 594014.802\nDHEC 594014.803"), $v11, $v12, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null), $v12, $v13);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v12, $v14);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v14, $v15);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v14, $v16);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "fa1/0", "fa1/0"), $v6, $v14);
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v14, $v6);
		
		return $model;
	}

	/**
	 * Function: example3
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network, both rows have a common end vertex.
	 */
	function example3()
	{
		// Creates a graph model
		$model = new vsGraphModel("Endpoint LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "PPUSC61", "DNEC 669087\nVPI/VCI = 1/132\nPCR = 256kpbs\n45Mbps"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v4 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE 2", "ASE2Name\nIP = .136", "Ctk ID ABC 821960\nT1 Ckt ID = ABC 1234 Chls 1-4\n256kpbs"),
			80, 30, "ase");
		$v5 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"R2=2611\nR2Name\nLO = .97"),
			80, 60);
		$v6 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"S2Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v7 = $model->insert($model->createEntity(null, null, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v8 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v9 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "PPUSC61", "DNEC 669087\nVPI/VCI = 1/132\nPCR = 256kpbs\n45Mbps"),
			50, 20);
		$v10 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v11 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE 2", "ASE2Name\nIP = .136", "Ctk ID ABC 821960\nT1 Ckt ID = ABC 1234 Chls 1-4\n256kpbs"),
			80, 30, "ase");
		$v12 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"R1=2611\nR1Name\nLO = .97"),
			80, 60);
		$v13 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"S1Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null), $v2, $v3, "carrier");
		$model->connect($model->createLink(null), $v3, $v4, "carrier");
		$model->connect($model->createLink(null, "", "", ".2 (S0/0.1)\nDLCI 232"), $v4, $v5);
		$model->connect($model->createLink(null, "", "", "p3"), $v4, $v6);
		$model->connect($model->createLink(null, "", "e0/0, .131", "p1"), $v5, $v6);
		$model->connect($model->createLink(null, "", "p3"), $v6, $v7);
		$model->connect($model->createLink(null, "OC3"), $v8, $v9);
		$model->connect($model->createLink(null), $v9, $v10, "carrier");
		$model->connect($model->createLink(null), $v10, $v11, "carrier");
		$model->connect($model->createLink(null, "", "", ".66 (S0/0.1)\nDLCI 232"), $v11, $v12);
		$model->connect($model->createLink(null, "", "", "p3"), $v11, $v13);
		$model->connect($model->createLink(null, "", "e0/0, .131", "p1"), $v12, $v13);
		$model->connect($model->createLink(null, "", "p5"), $v13, $v7);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "e1/0 .162", "e1/0 .161"), $v5, $v12);
		$model->connect($model->createLink(null, "Crossover", "p2", "p2"), $v6, $v13);
		$model->connect($model->createLink(null, "Crossover", "p12", "p12"), $v13, $v6);
		
		return $model;
	}

	/**
	 * Function: example4
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network, the special middle row (row 3) is used for a common vertex
	 * between each rows end vertex.
	 */
	function example4()
	{
		// Creates a graph model
		$model = new vsGraphModel("Endpoint LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "PPUSC61", "DNEC 669087\nVPI/VCI = 1/132\nPCR = 256kpbs\n45Mbps"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v4 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE 2", "ASE2Name\nIP = .136", "Ctk ID ABC 821960\nT1 Ckt ID = ABC 1234 Chls 1-4\n256kpbs"),
			80, 30, "ase");
		$v5 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"R2=2611\nR2Name\nLO = .97"),
			80, 60);
		$v6 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"S2Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v8 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v9 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "PPUSC61", "DNEC 669087\nVPI/VCI = 1/132\nPCR = 256kpbs\n45Mbps"),
			50, 20);
		$v10 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v11 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE 2", "ASE2Name\nIP = .136", "Ctk ID ABC 821960\nT1 Ckt ID = ABC 1234 Chls 1-4\n256kpbs"),
			80, 30, "ase");
		$v12 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"R1=2611\nR1Name\nLO = .97"),
			80, 60);
		$v13 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"S1Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v14 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertex in third row
		$v15 = $model->insert($model->createEntity(null, null, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null), $v2, $v3, "carrier");
		$model->connect($model->createLink(null), $v3, $v4, "carrier");
		$model->connect($model->createLink(null, "", "", ".2 (S0/0.1)\nDLCI 232"), $v4, $v5);
		$model->connect($model->createLink(null, "", "", "p3"), $v4, $v6);
		$model->connect($model->createLink(null, "", "e0/0, .131", "p1"), $v5, $v6);
		$model->connect($model->createLink(null, "", "p3"), $v6, $v7);
		$model->connect($model->createLink(null, "OC3"), $v8, $v9);
		$model->connect($model->createLink(null), $v9, $v10, "carrier");
		$model->connect($model->createLink(null), $v10, $v11, "carrier");
		$model->connect($model->createLink(null, "", "", ".66 (S0/0.1)\nDLCI 232"), $v11, $v12);
		$model->connect($model->createLink(null, "", "", "p3"), $v11, $v13);
		$model->connect($model->createLink(null, "", "e0/0, .131", "p1"), $v12, $v13);
		$model->connect($model->createLink(null, "", "p5"), $v13, $v14);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "e1/0 .162", "e1/0 .161"), $v5, $v12);
		$model->connect($model->createLink(null, "Crossover", "p2", "p2"), $v6, $v13);
		$model->connect($model->createLink(null, "Crossover", "p12", "p12"), $v13, $v6);
		
		// Adds crossovers to middle row
		$model->connect($model->createLink(null), $v7, $v15);
		$model->connect($model->createLink(null), $v14, $v15);
		
		return $model;
	}

	/**
	 * Function: example5
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network, both rows have three end vertices.
	 */
	function example5()
	{
		// Creates a graph model
		$model = new vsGraphModel("Member's LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v4 = $model->insert($model->createEntity(null, 1, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v5 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr></table>"),
			140, 60, "isr");
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v8 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v8b = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v10 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v11 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v12 = $model->insert($model->createEntity(null, 2, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v13 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v14 = $model->insert($model->createEntity(null, 2, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr></table>"),
			140, 60, "isr");
		$v15 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v16 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v17 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null, "YFBHMW6S.0001\nVCC = 1/62\nPCR = 4632Kbps\n45Mbps"), $v2, $v3, "carrier");
		$model->connect($model->createLink(null), $v3, $v4, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null, "YFBD6DS00002, TACM=511437\nYFBD6DS00002, TACM=511437\nYFBD6DS00002, TACM=511437"), $v4, $v5);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v4, $v6);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v6, $v7);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v6, $v8);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v6, $v8b);
		$model->connect($model->createLink(null, "OC3"), $v9, $v10);
		$model->connect($model->createLink(null, "YFBHMW6S.0001\nVCC = 1/62\nPCR = 4632Kbps\n45Mbps"), $v10, $v11, "carrier");
		$model->connect($model->createLink(null, "DHEC 594014.801\nDHEC 594014.802\nDHEC 594014.803"), $v11, $v12, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null), $v12, $v13);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v12, $v14);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v14, $v15);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v14, $v16);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v14, $v17);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "fa1/0", "fa1/0"), $v6, $v14);
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v14, $v6);
		
		return $model;
	}

	/**
	 * Function: example6
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network, the special middle row (row 3) is used for a shared vertex
	 * between each row and two endpoints connected to the shared vertex.
	 */
	function example6()
	{
		// Creates a graph model
		$model = new vsGraphModel("Endpoint LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "PPUSC61", "DNEC 669087\nVPI/VCI = 1/132\nPCR = 256kpbs\n45Mbps"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v4 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE 2", "ASE2Name\nIP = .136", "Ctk ID ABC 821960\nT1 Ckt ID = ABC 1234 Chls 1-4\n256kpbs"),
			80, 30, "ase");
		$v5 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"R2=2611\nR2Name\nLO = .97"),
			80, 60);
		$v6 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"S2Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v8 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v9 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "PPUSC61", "DNEC 669087\nVPI/VCI = 1/132\nPCR = 256kpbs\n45Mbps"),
			50, 20);
		$v10 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v11 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE 2", "ASE2Name\nIP = .136", "Ctk ID ABC 821960\nT1 Ckt ID = ABC 1234 Chls 1-4\n256kpbs"),
			80, 30, "ase");
		$v12 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"R1=2611\nR1Name\nLO = .97"),
			80, 60);
		$v13 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"S1Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v14 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertex in third row
		$v15 = $model->insert($model->createEntity(null, null, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null), $v2, $v3, "carrier");
		$model->connect($model->createLink(null), $v3, $v4, "carrier");
		$model->connect($model->createLink(null, "", "", ".2 (S0/0.1)\nDLCI 232"), $v4, $v5);
		$model->connect($model->createLink(null, "", "", "p3"), $v4, $v6);
		$model->connect($model->createLink(null, "", "e0/0, .131", "p1"), $v5, $v6);
		$model->connect($model->createLink(null, "", "p3"), $v6, $v15);
		$model->connect($model->createLink(null, "OC3"), $v8, $v9);
		$model->connect($model->createLink(null), $v9, $v10, "carrier");
		$model->connect($model->createLink(null), $v10, $v11, "carrier");
		$model->connect($model->createLink(null, "", "", ".66 (S0/0.1)\nDLCI 232"), $v11, $v12);
		$model->connect($model->createLink(null, "", "", "p3"), $v11, $v13);
		$model->connect($model->createLink(null, "", "e0/0, .131", "p1"), $v12, $v13);
		$model->connect($model->createLink(null, "", "p5"), $v13, $v15);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "e1/0 .162", "e1/0 .161"), $v5, $v12);
		$model->connect($model->createLink(null, "Crossover", "p2", "p2"), $v6, $v13);
		$model->connect($model->createLink(null, "Crossover", "p12", "p12"), $v13, $v6);
		
		// Adds crossovers to middle row
		$model->connect($model->createLink(null), $v15, $v7);
		$model->connect($model->createLink(null), $v15, $v14);
		
		return $model;
	}

	/**
	 * Function: example7
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network, the rows have an uneven number of devices.
	 */
	function example7()
	{
		// Creates a graph model
		$model = new vsGraphModel("Member's LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v4 = $model->insert($model->createEntity(null, 1, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v5 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr></table>"),
			140, 60, "isr");
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v8 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v10 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v12 = $model->insert($model->createEntity(null, 2, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v13 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v14 = $model->insert($model->createEntity(null, 2, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr></table>"),
			140, 60, "isr");
		$v15 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v16 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null, "YFBHMW6S.0001\nVCC = 1/62\nPCR = 4632Kbps\n45Mbps"), $v2, $v3, "carrier");
		$model->connect($model->createLink(null), $v3, $v4, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null, "YFBD6DS00002, TACM=511437\nYFBD6DS00002, TACM=511437\nYFBD6DS00002, TACM=511437"), $v4, $v5);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v4, $v6);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v6, $v7);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v6, $v8);
		$model->connect($model->createLink(null, "OC3"), $v9, $v10);
		$model->connect($model->createLink(null, "YFBHMW6S.0001\nVCC = 1/62\nPCR = 4632Kbps\n45Mbps"), $v10, $v12);
		$model->connect($model->createLink(null), $v12, $v13);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v12, $v14);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v14, $v15);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v14, $v16);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "fa1/0", "fa1/0"), $v6, $v14);
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v14, $v6);
		
		return $model;
	}

	/**
	 * Function: example8
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network, both rows have two end vertices.
	 */
	function example8()
	{
		// Creates a graph model
		$model = new vsGraphModel("Member's LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v4 = $model->insert($model->createEntity(null, 1, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v5 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr></table>"),
			140, 60, "isr");
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v8 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v10 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v11 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v12 = $model->insert($model->createEntity(null, 2, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v13 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v14 = $model->insert($model->createEntity(null, 2, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr></table>"),
			140, 60, "isr");
		$v15 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v16 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null, "YFBHMW6S.0001\nVCC = 1/62\nPCR = 4632Kbps\n45Mbps"), $v2, $v3, "carrier");
		$model->connect($model->createLink(null), $v3, $v4, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null, "YFBD6DS00002, TACM=511437\nYFBD6DS00002, TACM=511437\nYFBD6DS00002, TACM=511437"), $v4, $v5);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v4, $v6);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v6, $v7);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v6, $v8);
		$model->connect($model->createLink(null, "OC3"), $v9, $v10);
		$model->connect($model->createLink(null, "YFBHMW6S.0001\nVCC = 1/62\nPCR = 4632Kbps\n45Mbps"), $v10, $v11, "carrier");
		$model->connect($model->createLink(null, "DHEC 594014.801\nDHEC 594014.802\nDHEC 594014.803"), $v11, $v12, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null), $v12, $v13);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v12, $v14);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v14, $v15);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v14, $v16);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "fa1/0", "fa1/0"), $v6, $v14);
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v4, $v14);
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v12, $v6);
		
		return $model;
	}

	/**
	 * Function: example9
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network, both endpoints have an incoming crossover edge.
	 */
	function example9()
	{
		// Creates a graph model
		$model = new vsGraphModel("Endpoint LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "PPUSC61", "DNEC 669087\nVPI/VCI = 1/132\nPCR = 256kpbs\n45Mbps"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v4 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE 2", "ASE2Name\nIP = .136", "Ctk ID ABC 821960\nT1 Ckt ID = ABC 1234 Chls 1-4\n256kpbs"),
			80, 30, "ase");
		$v5 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"R2=2611\nR2Name\nLO = .97"),
			80, 60);
		$v6 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"S2Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v8 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v9 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "PPUSC61", "DNEC 669087\nVPI/VCI = 1/132\nPCR = 256kpbs\n45Mbps"),
			50, 20);
		$v10 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v11 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE 2", "ASE2Name\nIP = .136", "Ctk ID ABC 821960\nT1 Ckt ID = ABC 1234 Chls 1-4\n256kpbs"),
			80, 30, "ase");
		$v12 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"R1=2611\nR1Name\nLO = .97"),
			80, 60);
		$v13 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"S1Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v14 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null), $v2, $v3, "carrier");
		$model->connect($model->createLink(null), $v3, $v4, "carrier");
		$model->connect($model->createLink(null, "", "", ".2 (S0/0.1)\nDLCI 232"), $v4, $v5);
		$model->connect($model->createLink(null, "", "", "p3"), $v4, $v6);
		$model->connect($model->createLink(null, "", "e0/0, .131", "p1"), $v5, $v6);
		$model->connect($model->createLink(null, "", "p3"), $v6, $v7);
		$model->connect($model->createLink(null, "OC3"), $v8, $v9);
		$model->connect($model->createLink(null), $v9, $v10, "carrier");
		$model->connect($model->createLink(null), $v10, $v11, "carrier");
		$model->connect($model->createLink(null, "", "", ".66 (S0/0.1)\nDLCI 232"), $v11, $v12);
		$model->connect($model->createLink(null, "", "", "p3"), $v11, $v13);
		$model->connect($model->createLink(null, "", "e0/0, .131", "p1"), $v12, $v13);
		$model->connect($model->createLink(null, "", "p5"), $v13, $v14);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "e1/0 .162", "e1/0 .161"), $v5, $v12);
		$model->connect($model->createLink(null, "Crossover", "p2", "p2"), $v6, $v13);
		$model->connect($model->createLink(null, "Crossover", "p12", "p12"), $v13, $v6);
		$model->connect($model->createLink(null), $v6, $v14);
		$model->connect($model->createLink(null), $v13, $v7);
		
		return $model;
	}

	/**
	 * Function: example10
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network there is an additional column of devices on the left-hand side.
	 */
	function example10()
	{
		// Creates a graph model
		$model = new vsGraphModel("Member's LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v4 = $model->insert($model->createEntity(null, 1, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v5 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v6 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"R2=2611\nR2Name\nLO = .97"),
			80, 60);
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"S2Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v8 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"R4=2611\nR2Name\nLO = .97"),
			80, 60);
		$v9 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v10 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v11 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v12 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v13 = $model->insert($model->createEntity(null, 2, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v14 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v15 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"R2=2611\nR2Name\nLO = .97"),
			80, 60);
		$v16 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"S2Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v17 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"R4=2611\nR2Name\nLO = .97"),
			80, 60);
		$v18 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null, ""), $v2, $v3, "carrier");
		$model->connect($model->createLink(null, "nCCT ID 1\nPCR = 10808Kbps2"), $v3, $v4, "carrier;strokeWidth=4");
		$model->connect($model->createLink(null), $v4, $v5);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v6, $v7);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v5, $v7);
		$model->connect($model->createLink(null, "", "p5", "fa 1/4"), $v4, $v7);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v7, $v8);
		$model->connect($model->createLink(null, "", "fa 0/1"), $v8, $v9);
		$model->connect($model->createLink(null, "OC3"), $v10, $v11);
		$model->connect($model->createLink(null, ""), $v11, $v12, "carrier");
		$model->connect($model->createLink(null, "PCR = 10808Kbps2\nCCT ID 2"), $v12, $v13, "carrier;strokeWidth=4");
		$model->connect($model->createLink(null), $v13, $v14);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v14, $v15);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v15, $v16);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v14, $v16);
		$model->connect($model->createLink(null, "", "p5", "fa 1/4"), $v13, $v16);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v16, $v17);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v17, $v18);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "fa1/0", "fa1/0"), $v7, $v16);
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v16, $v7);
		
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v6, $v15);
		$model->connect($model->createLink(null), $v9, $v18);
		
		return $model;
	}
	

	/**
	 * Function: example11
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network, there are multiple columns of endpoints.
	 */
	function example11()
	{
		// Creates a graph model
		$model = new vsGraphModel("Member's LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v4 = $model->insert($model->createEntity(null, 1, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v5 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr></table>"),
			140, 60, "isr");
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v7b = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v8 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v8b = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v10 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v11 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v12 = $model->insert($model->createEntity(null, 2, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v13 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v14 = $model->insert($model->createEntity(null, 2, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr></table>"),
			140, 60, "isr");
		$v15 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v15b = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v16 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v16b = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null, "YFBHMW6S.0001\nVCC = 1/62\nPCR = 4632Kbps\n45Mbps"), $v2, $v3, "carrier");
		$model->connect($model->createLink(null), $v3, $v4, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null, "YFBD6DS00002, TACM=511437\nYFBD6DS00002, TACM=511437\nYFBD6DS00002, TACM=511437"), $v4, $v5);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v4, $v6);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v6, $v7);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v7, $v7b);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v6, $v8);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v8, $v8b);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v6, $v16);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v6, $v15);
		$model->connect($model->createLink(null, "OC3"), $v9, $v10);
		$model->connect($model->createLink(null, "YFBHMW6S.0001\nVCC = 1/62\nPCR = 4632Kbps\n45Mbps"), $v10, $v11, "carrier");
		$model->connect($model->createLink(null, "DHEC 594014.801\nDHEC 594014.802\nDHEC 594014.803"), $v11, $v12, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null), $v12, $v13);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v12, $v14);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v14, $v8);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v14, $v7);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v14, $v15);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v15, $v15b);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v14, $v16);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v16, $v16b);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "fa1/0", "fa1/0"), $v6, $v14);
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v14, $v6);
		
		return $model;
	}

	/**
	 * Function: example12
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network, no ASE shapes are used.
	 */
	function example12()
	{
		// Creates a graph model
		$model = new vsGraphModel("Endpoint LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "PPUSC61", "DNEC 669087\nVPI/VCI = 1/132\nPCR = 256kpbs\n45Mbps"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v5 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"R2=2611\nR2Name\nLO = .97"),
			80, 60);
		$v6 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"S2Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v8 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<b>APC AccRtrName1</b>\n<hr size='1'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11"),
			110, 110, "router");
		$v9 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "PPUSC61", "DNEC 669087\nVPI/VCI = 1/132\nPCR = 256kpbs\n45Mbps"),
			50, 20);
		$v10 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v12 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"R1=2611\nR1Name\nLO = .97"),
			80, 60);
		$v13 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"S1Name\n2912\nIP = .135\nDG = .129"),
			60, 60);
		$v14 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null), $v2, $v3, "carrier");
		$model->connect($model->createLink(null), $v3, $v5, "carrier");
		$model->connect($model->createLink(null, "", "e0/0, .131", "p1"), $v5, $v6);
		$model->connect($model->createLink(null, "", "p3"), $v6, $v7);
		$model->connect($model->createLink(null, "OC3"), $v8, $v9);
		$model->connect($model->createLink(null), $v9, $v10, "carrier");
		$model->connect($model->createLink(null), $v10, $v12, "carrier");
		$model->connect($model->createLink(null, "", "e0/0, .131", "p1"), $v12, $v13);
		$model->connect($model->createLink(null, "", "p5"), $v13, $v14);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "e1/0 .162", "e1/0 .161"), $v5, $v12);
		$model->connect($model->createLink(null, "Crossover", "p2", "p2"), $v6, $v13);
		$model->connect($model->createLink(null, "Crossover", "p12", "p12"), $v13, $v6);
		$model->connect($model->createLink(null), $v7, $v14);
		
		return $model;
	}

	/**
	 * Function: example13
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. In this
	 * network, the "Router2" and "ISR2" shapes are used.
	 */
	function example13()
	{
		// Creates a graph model
		$model = new vsGraphModel("Member's LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName1</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			110, 120, "defaultVertex");
		$v2 = $model->insert($model->createEntity(null, 1, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v4 = $model->insert($model->createEntity(null, 1, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v5 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr><tr>".
			"<td colspan='2' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>LO1=10.XX.YYY.Z\nAS 12345</td></tr></table>"),
			140, 80, "isr");
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v8 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName1</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345\nSecond Line</td></tr></table>"),
			110, 130, "defaultVertex");
		$v10 = $model->insert($model->createEntity(null, 2, "SWITCH",
			"ATM SW", "EMUSC60"),
			50, 20);
		$v11 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v12 = $model->insert($model->createEntity(null, 2, "IMA",
			"IMA1", null, "I1W4400140\nIP = .134"),
			60, 60, "ima");
		$v13 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v14 = $model->insert($model->createEntity(null, 2, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr><tr>".
			"<td colspan='2' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>LO1=10.XX.YYY.Z\nAS 12345</td></tr></table>"),
			140, 80, "isr");
		$v15 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		$v16 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Endpoint Firewall\n\n10.168.6.21", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null, "OC3"), $v1, $v2);
		$model->connect($model->createLink(null, "YFBHMW6S.0001\nVCC = 1/62\nPCR = 4632Kbps\n45Mbps"), $v2, $v3, "carrier");
		$model->connect($model->createLink(null), $v3, $v4, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null, "YFBD6DS00002, TACM=511437\nYFBD6DS00002, TACM=511437\nYFBD6DS00002, TACM=511437"), $v4, $v5);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v4, $v6);
		$model->connect($model->createLink(null, "", "test"), $v6, $v7);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v6, $v8);
		$model->connect($model->createLink(null, "OC3"), $v9, $v10);
		$model->connect($model->createLink(null, "YFBHMW6S.0001\nVCC = 1/62\nPCR = 4632Kbps\n45Mbps"), $v10, $v11, "carrier");
		$model->connect($model->createLink(null, "DHEC 594014.801\nDHEC 594014.802\nDHEC 594014.803"), $v11, $v12, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null), $v12, $v13);
		$model->connect($model->createLink(null, "", "", ".2 (ATM2/0.1)\nVCC = 1/62"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/4"), $v12, $v14);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v14, $v15);
		$model->connect($model->createLink(null, "", "fa 1/9"), $v14, $v16);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "fa1/0", "fa1/0"), $v6, $v14);
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v14, $v6);
		
		return $model;
	}

	/**
	 * Function: example14
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. The network
	 * is in the MPLS diagram format.
	 */
	function example14()
	{
		// Creates a graph model
		$model = new vsGraphModel("Member's LAN",
			"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName1</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			110, 120, "defaultVertex");
		$v2 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v2b = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v5 = $model->insert($model->createEntity(null, 1, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr><tr>".
			"<td colspan='2' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>LO1=10.XX.YYY.Z\nAS 12345</td></tr></table>"),
			140, 80, "isr");
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE",
			"Customer\nInterface", "", "", true),
			90, 60);
		
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName1</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345\nSecond Line</td></tr></table>"),
			110, 130, "defaultVertex");
		$v10 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v10b = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v11 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192"),
			70, 60, "network");
		$v13 = $model->insert($model->createEntity(null, 2, "ASE",
			"ASE1", null, "A1W440140\nIP = .133"),
			80, 30, "ase");
		$v14 = $model->insert($model->createEntity(null, 2, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr><tr>".
			"<td colspan='2' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>LO1=10.XX.YYY.Z\nAS 12345</td></tr></table>"),
			140, 80, "isr");
		$v15 = $model->insert($model->createEntity(null, 2, "DEVICE",
			"Customer\nInterface", "", "", true),
			90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null), $v1, $v2);
		$model->connect($model->createLink(null), $v1, $v2b);
		$model->connect($model->createLink(null), $v2, $v3);
		$model->connect($model->createLink(null), $v2, $v2b);
		$model->connect($model->createLink(null), $v2b, $v3);
		$model->connect($model->createLink(null), $v2, $v11, "dashed=1");
		$model->connect($model->createLink(null), $v2b, $v11, "dashed=1");
		$model->connect($model->createLink(null), $v3, $v5, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null, "", "", "IP = 10.99.19.11\n.2 (ATM2/0.1)\nVCC = 1/62"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v5, $v6);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v6, $v7);
		$model->connect($model->createLink(null), $v9, $v10);
		$model->connect($model->createLink(null), $v9, $v10b);
		$model->connect($model->createLink(null), $v10, $v10b);
		$model->connect($model->createLink(null), $v10, $v11);
		$model->connect($model->createLink(null), $v10b, $v11);
		$model->connect($model->createLink(null), $v10, $v3, "dashed=1");
		$model->connect($model->createLink(null), $v10b, $v3, "dashed=1");
		$model->connect($model->createLink(null, "DHEC 594014.801\nDHEC 594014.802\nDHEC 594014.803"), $v11, $v13, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null, "", "", "IP = 10.99.19.11\n.2 (ATM2/0.1)\nVCC = 1/62"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v13, $v14);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v14, $v15);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "fa1/0", "fa1/0"), $v6, $v14);
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v14, $v6);
		
		return $model;
	}

	/**
	 * Function: example15
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. The network
	 * contains a server stack with 6 servers, a lan shape and a member host.
	 */
	function example15()
	{
		// Creates a graph model (null means no demarcation line)
		$model = new vsGraphModel(null,
			"Endpoint Network Address\nis 10.xxx.xxx.0 /27\nunless otherwise noted.",
			"fillColor=#E8E8E8");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName1</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			110, 120, "defaultVertex");
		$v2 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v2b = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192", "Ckt ID = DEEC xxxxxx\nT1 Ckt ID = DHEC xxxxxx\nChnls 1-24\nPE IP = 10.xx.10x.xx\nPCR = 1544Kbps"),
			70, 60, "network");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3\nLine4</td><td align='center'>Line1\nLine2\nLine3</td></tr><tr>".
			"<td colspan='2' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>LO1=10.XX.YYY.Z\nAS 12345</td></tr></table>"),
			140, 100, "isr");
		$v7 = $model->insert($model->createEntity(null, null, "SERVER",
			"xxxx01\nEA Server\nSUN\nV210", "", "", true),
			70, 80, "fillColor=yellow");
		
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName1</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345\nSecond Line</td></tr></table>"),
			110, 130, "defaultVertex");
		$v10 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v10b = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v11 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192", "", "Ckt ID = BCBJxxxx.0001\nTACM ID = xxxxxx\nChnls 1-24\nPE IP = Waiting for VzB\nPCR = 1544Kbps"),
			70, 60, "network");
		$v14 = $model->insert($model->createEntity(null, 2, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3\nLine4</td><td align='center'>Line1\nLine2\nLine3</td></tr><tr>".
			"<td colspan='2' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>LO1=10.XX.YYY.Z\nAS 12345</td></tr></table>"),
			140, 100, "isr");
		$v15 = $model->insert($model->createEntity(null, null, "SERVER",
			"xxxx02\nEA Server\nSUN\nV210", "", "", true),
			70, 80, "fillColor=yellow");
		$v16 = $model->insert($model->createEntity(null, null, "SERVER",
			"xxxx03\nEA Server\nSUN\nV210", "", "", true),
			70, 80, "fillColor=yellow");
		$v17 = $model->insert($model->createEntity(null, null, "SERVER",
			"xxxx04\nEA Server\nSUN\nV210", "", "", true),
			70, 80, "fillColor=yellow");
		$v18 = $model->insert($model->createEntity(null, null, "SERVER",
			"xxxx05\nEA Server\nSUN\nV210", "", "", true),
			70, 80, "fillColor=yellow");
		$v19 = $model->insert($model->createEntity(null, null, "SERVER",
			"xxxx06\nEA Server\nSUN\nV210", "", "", true),
			70, 80, "fillColor=yellow");
		$v20 = $model->insert($model->createEntity(null, null, "LAN",
			"", "", "", true),
			20, 80, "lan");
		

		$v21 = $model->insert($model->createEntity(null, null, "HOST",
			"M\nE\nM\nB\nE\nR\n\nH\nO\nS\nT", "", "", true),
			24, 300, "fontSize=14");

		// Adds Edges
		$model->connect($model->createLink(null), $v1, $v2);
		$model->connect($model->createLink(null), $v1, $v2b);
		$model->connect($model->createLink(null), $v2, $v3);
		$model->connect($model->createLink(null), $v2, $v2b);
		$model->connect($model->createLink(null), $v2b, $v3);
		$model->connect($model->createLink(null), $v2, $v11, "dashed=1");
		$model->connect($model->createLink(null), $v2b, $v11, "dashed=1");
		$model->connect($model->createLink(null, "", "", "s0/0/0\nCE=10.xx.10x.xx"), $v3, $v6);
		$model->connect($model->createLink(null, "", "fa 1/6", "bge0\n.190"), $v6, $v7);
		$model->connect($model->createLink(null), $v9, $v10);
		$model->connect($model->createLink(null), $v9, $v10b);
		$model->connect($model->createLink(null), $v10, $v10b);
		$model->connect($model->createLink(null), $v10, $v11);
		$model->connect($model->createLink(null), $v10b, $v11);
		$model->connect($model->createLink(null), $v10, $v3, "dashed=1");
		$model->connect($model->createLink(null), $v10b, $v3, "dashed=1");
		$model->connect($model->createLink(null, "", "", "S0/0/0\nCE=Waiting for\nVzB"), $v11, $v14);
		$model->connect($model->createLink(null, "", "fa 22/666", "bge0\n.190"), $v6, $v15);
		$model->connect($model->createLink(null, "", "fa 1/6", "bge0\n.190"), $v14, $v7);
		$model->connect($model->createLink(null, "", "fa 1/6", "bge0\n.190"), $v14, $v15);
		
		$model->connect($model->createLink(null, "", "fa 1/5", "bge0\n.190"), $v6, $v16);
		$model->connect($model->createLink(null, "", "fa 1/7", "bge0\n.190"), $v6, $v17);
		$model->connect($model->createLink(null, "", "fa 1/9", "bge0\n.190"), $v6, $v18);
		$model->connect($model->createLink(null, "", "fa 1/6", "bge0\n.190"), $v6, $v19);
		$model->connect($model->createLink(null, "", "fa 1/6", "bge0\n.190"), $v14, $v16);
		$model->connect($model->createLink(null, "", "fa 1/8", "bge12\n.190"), $v14, $v17);
		$model->connect($model->createLink(null, "", "fa 1/10", "bge0\n.190"), $v14, $v18);
		$model->connect($model->createLink(null, "", "fa 1/6", "bge0\n.190"), $v14, $v19);
		
		$model->connect($model->createLink(null, "", "bge 1"), $v7, $v20);
		$model->connect($model->createLink(null, "", "bge 1"), $v15, $v20);
		$model->connect($model->createLink(null, "", "bge 1"), $v16, $v20);
		$model->connect($model->createLink(null, "", "bge 1"), $v17, $v20);
		$model->connect($model->createLink(null, "", "bge 1"), $v18, $v20);
		$model->connect($model->createLink(null, "", "bge 1"), $v19, $v20);
		
		$model->connect($model->createLink(null), $v20, $v21);

		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "fa1/0", "fa1/0"), $v6, $v14);
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v14, $v6);
		
		return $model;
	}

	/**
	 * Function: example16
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. The network
	 * contains a server stack with 2 servers, a lan shape and a member host.
	 */
	function example16()
	{
		// Creates a graph model (null means no demarcation line)
		$model = new vsGraphModel(null,
			"Endpoint Network Address\nis 10.xxx.xxx.0 /27\nunless otherwise noted.",
			"fillColor=#E8E8E8");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APE</b></td></tr><tr><td valign='top' height='100%'></td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'> </td></tr></table>"),
			110, 120, "defaultVertex");
		$v2 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v2b = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192", "Ckt ID = DEEC xxxxxx\nT1 Ckt ID = DHEC xxxxxx\nChnls 1-24\nPE IP = 10.xx.10x.xx\nPCR = 1544Kbps"),
			70, 60, "network");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3\nLine4</td><td align='center'>Line1\nLine2\nLine3</td></tr><tr>".
			"<td colspan='2' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>LO1=10.XX.YYY.Z\nAS 12345</td></tr></table>"),
			140, 100, "isr");
		$v7 = $model->insert($model->createEntity(null, null, "SERVER",
			"xxxx01\nEA Server\nSUN\nV210", "", "", true),
			70, 80, "fillColor=yellow");
		
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC</b></td></tr><tr><td valign='top' height='100%'></td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'> </td></tr></table>"),
			110, 130, "defaultVertex");
		$v10 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v10b = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v11 = $model->insert($model->createEntity(null, 2, "NETWORK",
			"<b>AT&T</b>\nCIR = 192", "", "Ckt ID = BCBJxxxx.0001\nTACM ID = xxxxxx\nChnls 1-24\nPE IP = Waiting for VzB\nPCR = 1544Kbps"),
			70, 60, "network");
		$v14 = $model->insert($model->createEntity(null, 2, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3\nLine4</td><td align='center'>Line1\nLine2\nLine3</td></tr><tr>".
			"<td colspan='2' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>LO1=10.XX.YYY.Z\nAS 12345</td></tr></table>"),
			140, 100, "isr");
		$v15 = $model->insert($model->createEntity(null, null, "SERVER",
			"xxxx02\nEA Server\nSUN\nV210", "", "", true),
			70, 80, "fillColor=yellow");

		$v20 = $model->insert($model->createEntity(null, null, "LAN",
			"", "", "", true),
			20, 80, "lan");

		$v21 = $model->insert($model->createEntity(null, null, "HOST",
			"M\nE\nM\nB\nE\nR\n\nH\nO\nS\nT", "", "", true),
			24, 300, "fontSize=14");

		// Adds Edges
		$model->connect($model->createLink(null), $v1, $v2);
		$model->connect($model->createLink(null), $v1, $v2b);
		$model->connect($model->createLink(null), $v2, $v3);
		$model->connect($model->createLink(null), $v2, $v2b);
		$model->connect($model->createLink(null), $v2b, $v3);
		$model->connect($model->createLink(null), $v2, $v11, "dashed=1");
		$model->connect($model->createLink(null), $v2b, $v11, "dashed=1");
		$model->connect($model->createLink(null, "", "", "s0/0/0\nCE=10.xx.10x.xx"), $v3, $v6);
		$model->connect($model->createLink(null, "", "fa 1/6", "bge0\n.190"), $v6, $v7);
		$model->connect($model->createLink(null), $v9, $v10);
		$model->connect($model->createLink(null), $v9, $v10b);
		$model->connect($model->createLink(null), $v10, $v10b);
		$model->connect($model->createLink(null), $v10, $v11);
		$model->connect($model->createLink(null), $v10b, $v11);
		$model->connect($model->createLink(null), $v10, $v3, "dashed=1");
		$model->connect($model->createLink(null), $v10b, $v3, "dashed=1");
		$model->connect($model->createLink(null, "", "", "S0/0/0\nCE=Waiting for\nVzB"), $v11, $v14);
		$model->connect($model->createLink(null, "", "fa 22/666", "bge0\n.190"), $v6, $v15);
		$model->connect($model->createLink(null, "", "fa 1/5", "bge0\n.190"), $v14, $v7);
		$model->connect($model->createLink(null, "", "fa 1/6", "bge0\n.190"), $v14, $v15);
		
		$model->connect($model->createLink(null, "", "bge 1"), $v7, $v20);
		$model->connect($model->createLink(null, "", "bge 1"), $v15, $v20);
		
		$model->connect($model->createLink(null), $v20, $v21);

		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "fa1/0", "fa1/0"), $v6, $v14);
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v14, $v6);
		
		return $model;
	}

	/**
	 * Function: example17
	 * 
	 * Creates and returns a new <vsGraphModel> with a sample network. The network contains
	 * one row and a server stack with 2 servers, a lan shape and a member host.
	 */
	function example17()
	{
		// Creates a graph model (null means no demarcation line)
		$model = new vsGraphModel(null,
			"Note: All IP addresses are in the 10.xx.xx.0\nnetwork unless otherwise specified.",
			"fillColor=#E8E8E8");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName1</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nSubint=17.1.86.1\nOSPF AREA = 3\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			110, 120, "defaultVertex");
		$v2 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v2b = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK",
			"<b>AT&T</b>\nCIR = 192", "Ckt ID = DEEC xxxxxx\nT1 Ckt ID = DHEC xxxxxx\nChnls 1-24\nPE IP = 10.xx.10x.xx\nPCR = 1544Kbps"),
			70, 60, "network");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3\nLine4</td><td align='center'>Line1\nLine2\nLine3</td></tr><tr>".
			"<td colspan='2' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>LO1=10.XX.YYY.Z\nAS 12345</td></tr></table>"),
			140, 100, "isr");
		$v7 = $model->insert($model->createEntity(null, null, "SERVER",
			"xxxx01\nEA Server\nSUN\nV210", "", "", true),
			70, 80, "fillColor=#FF9900");

		$v15 = $model->insert($model->createEntity(null, null, "SERVER",
			"xxxx02\nEA Server\nSUN\nV210", "", "", true),
			70, 80, "fillColor=#FF9900");

		$v20 = $model->insert($model->createEntity(null, null, "LAN",
			"", "", "", true),
			20, 80, "lan");

		$v21 = $model->insert($model->createEntity(null, null, "HOST",
			"VTS3\n#1\n#2\n#3\n#4", "", "", true),
			40, 100, "");

		// Adds Edges
		$model->connect($model->createLink(null), $v1, $v2);
		$model->connect($model->createLink(null), $v1, $v2b);
		$model->connect($model->createLink(null), $v2, $v3);
		$model->connect($model->createLink(null), $v2, $v2b);
		$model->connect($model->createLink(null), $v2b, $v3);
		$model->connect($model->createLink(null, "", "", "s0/0/0\nCE=10.xx.10x.xx"), $v3, $v6);
		$model->connect($model->createLink(null, "", "fa 1/6", "bge0\n.190"), $v6, $v7);
		$model->connect($model->createLink(null, "", "fa 22/666", "bge0\n.190"), $v6, $v15);
		
		$model->connect($model->createLink(null, "", "bge 1"), $v7, $v20);
		$model->connect($model->createLink(null, "", "bge 1"), $v15, $v20);
		
		$model->connect($model->createLink(null), $v20, $v21);
		
		return $model;
	}
	
	/**
	* Function: example18
	*
	* Creates and returns a new <vsGraphModel> with a sample network. The network contains
	* four tunnel routers.
	*/
	function example18()
	{
		// Creates a graph model
		$model = new vsGraphModel("Member's LAN",
				"Note: All IP addresses are in the 10.1.205.0\nnetwork unless otherwise specified.");
				
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName1</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			110, 120, "defaultVertex");
		$v1b = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName2</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			110, 120, "defaultVertex");
		$v2 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v2b = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK", "<b>AT&T</b>\nCIR = 192"), 70, 60, "network");
		$v5 = $model->insert($model->createEntity(null, 1, "ASE", "ASE1", null, "A1W440140\nIP = .133"), 80, 30, "ase");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr><tr>".
			"<td colspan='2' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>LO1=10.XX.YYY.Z\nAS 12345</td></tr></table>"),
			140, 80, "isr");
		$v7 = $model->insert($model->createEntity(null, 1, "DEVICE", "Customer\nInterface", "", "", true), 90, 60);
				
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName3</b></td></tr><tr><td valign='top' height='100%'>ATM7/1/0.40\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345\nSecond Line</td></tr></table>"),
			110, 82, "defaultVertex");
		$v9b = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName4</b></td></tr><tr><td valign='top' height='100%'>ATM7/1/0.40\nSubint=17.1.86.1</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345\nSecond Line</td></tr></table>"),
			110, 82, "defaultVertex");
		$v10 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v10b = $model->insert($model->createEntity(null, 2, "ROUTER", "<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v11 = $model->insert($model->createEntity(null, 2, "NETWORK", "<b>AT&T</b>\nCIR = 192"), 70, 60, "network");
		$v13 = $model->insert($model->createEntity(null, 2, "ASE", "ASE1", null, "A1W440140\nIP = .133"), 80, 30, "ase");
		$v14 = $model->insert($model->createEntity(null, 2, "ISR", "<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='50%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"Line1\nLine2\nLine3</td><td align='center'>Line1\nLine2\nLine3</td></tr><tr>".
			"<td colspan='2' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>LO1=10.XX.YYY.Z\nAS 12345</td></tr></table>"),
			140, 80, "isr");
		$v15 = $model->insert($model->createEntity(null, 2, "DEVICE", "Customer\nInterface", "", "", true), 90, 60);
		
		// Adds Edges
		$model->connect($model->createLink(null), $v1, $v2);
		$model->connect($model->createLink(null), $v1, $v2b, "dashed=1");
		$model->connect($model->createLink(null), $v1b, $v2, "dashed=1");
		$model->connect($model->createLink(null), $v1b, $v2b);
		$model->connect($model->createLink(null), $v2, $v3);
		$model->connect($model->createLink(null), $v2, $v2b);
		$model->connect($model->createLink(null), $v2b, $v3);
		$model->connect($model->createLink(null), $v2, $v11, "dashed=1");
		$model->connect($model->createLink(null), $v2b, $v11, "dashed=1");
		$model->connect($model->createLink(null), $v3, $v5, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null, "", "", "IP = 10.99.19.11\n.2 (ATM2/0.1)\nVCC = 1/62"), $v5, $v6);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v5, $v6);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v6, $v7);
		$model->connect($model->createLink(null), $v9, $v10);
		$model->connect($model->createLink(null), $v9, $v10b, "dashed=1");
		$model->connect($model->createLink(null), $v9b, $v10, "dashed=1");
		$model->connect($model->createLink(null), $v9b, $v10b);
		$model->connect($model->createLink(null), $v10, $v10b);
		$model->connect($model->createLink(null), $v10, $v11);
		$model->connect($model->createLink(null), $v10b, $v11);
		$model->connect($model->createLink(null), $v10, $v3, "dashed=1");
		$model->connect($model->createLink(null), $v10b, $v3, "dashed=1");
		$model->connect($model->createLink(null, "DHEC 594014.801\nDHEC 594014.802\nDHEC 594014.803"), $v11, $v13, "carrier;strokeWidth=2");
		$model->connect($model->createLink(null, "", "", "IP = 10.99.19.11\n.2 (ATM2/0.1)\nVCC = 1/62"), $v13, $v14);
		$model->connect($model->createLink(null, "", "", "fa 1/3"), $v13, $v14);
		$model->connect($model->createLink(null, "", "fa 1/6"), $v14, $v15);
		
		// Adds crossovers
		$model->connect($model->createLink(null, "Crossover", "fa1/0", "fa1/0"), $v6, $v14);
		$model->connect($model->createLink(null, "Crossover", "fa1/1", "fa1/1"), $v14, $v6);
		
		return $model;
	}
	
	/**
	* Function: example19
	*
	* Creates and returns a new <vsGraphModel> with a sample network. The network represents the
	* example for 2 tunnel router pairs in the specification.
	*/
	function example19()
	{
		// Creates a graph model
		$model = new vsGraphModel();
	
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
				"<table style='font-size:11px;' width='100%' height='100%'><tr>".
				"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
				"<b>APC AccRtrName1</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nLO=172.11.255.11</td></tr></table>"),
				110, 68, "defaultVertex");
		$v1b = $model->insert($model->createEntity(null, 1, "ROUTER",
				"<table style='font-size:11px;' width='100%' height='100%'><tr>".
				"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
				"<b>APC AccRtrName2</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nLO=172.11.255.11</td></tr></table>"),
				110, 68, "defaultVertex");
		$v2 = $model->insert($model->createEntity(null, 1, "ROUTER",
				"<table style='font-size:11px;' width='100%' height='100%'><tr>".
				"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
				"CE Router</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
				"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
				100, 80, "defaultVertex");
		$v2b = $model->insert($model->createEntity(null, 1, "ROUTER",
				"<table style='font-size:11px;' width='100%' height='100%'><tr>".
				"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
				"CE Router</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
				"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
				100, 80, "defaultVertex");
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK", "ATT\nMPLS\nNetwork\nBGP AS\n13979"), 120, 130, "network");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
				"<table style='font-size:11px;' width='100%' height='100%'><tr>".
				"<td align='center' style='border-width:0 0 1 0px;border-style:dashed;border-color:black;'>".
				"2811\nRTRNM\nTun1 = XYZ\nTun2 = ZBC\nLo1 = 123\nAS 64701</td></tr><tr><td valign='top' align='center' height='100%'>Loopback10 = \n172.22.25.1/30</td></tr></table>"),
				140, 122, "isr");
		$v7 = $model->insert($model->createEntity(null, null, "DEVICE", "Customers\nNetwork", "", "", true), 60, 260);
	
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
				"<table style='font-size:11px;' width='100%' height='100%'><tr>".
				"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
				"<b>APC AccRtrName3</b></td></tr><tr><td valign='top' height='100%'>ATM7/1/0.40\nLO=172.11.255.11</td></tr>".
				"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345\nSecond Line</td></tr></table>"),
				110, 82, "defaultVertex");
		$v9b = $model->insert($model->createEntity(null, 2, "ROUTER",
				"<table style='font-size:11px;' width='100%' height='100%'><tr>".
				"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
				"<b>APC AccRtrName4</b></td></tr><tr><td valign='top' height='100%'>ATM7/1/0.40\nSubint=17.1.86.1</td></tr>".
				"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345\nSecond Line</td></tr></table>"),
				110, 82, "defaultVertex");
		$v10 = $model->insert($model->createEntity(null, 2, "ROUTER",
				"<table style='font-size:11px;' width='100%' height='100%'><tr>".
				"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
				"CE Router</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
				"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
				100, 80, "defaultVertex");
		$v10b = $model->insert($model->createEntity(null, 2, "ROUTER", "<table style='font-size:11px;' width='100%' height='100%'><tr>".
				"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
				"CE Router</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
				"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
				100, 80, "defaultVertex");
		$v11 = $model->insert($model->createEntity(null, 2, "NETWORK", "VZB\nMPLS\nNetwork\nBGP AS\n65000"), 120, 130, "network");
		$v14 = $model->insert($model->createEntity(null, 2, "ISR",
				"<table style='font-size:11px;' width='100%' height='100%'><tr>".
				"<td align='center' style='border-width:0 0 1 0px;border-style:dashed;border-color:black;'>".
				"2811\nRTRNM\nTun1 = XYZ\nTun2 = ZBC\nLo1 = 123\nAS 64701</td></tr><tr><td valign='top' align='center' height='100%'>Loopback10 = \n172.22.25.1/30</td></tr></table>"),
				140, 122, "isr");
	
		// Adds Edges
		$model->connect($model->createLink(null), $v1, $v2);
		$model->connect($model->createLink(null), $v1, $v2b, "dashed=1");
		$model->connect($model->createLink(null), $v1b, $v2, "dashed=1");
		$model->connect($model->createLink(null), $v1b, $v2b);
		$model->connect($model->createLink(null), $v2, $v3);
		$model->connect($model->createLink(null), $v2, $v2b);
		$model->connect($model->createLink(null), $v2b, $v3);
		$model->connect($model->createLink(null), $v2, $v11, "dashed=1");
		$model->connect($model->createLink(null), $v2b, $v11, "dashed=1");
		$model->connect($model->createLink(null, "", "", "Ser0/0/0.777 CCT ID3\n1.1.0.117/30"), $v3, $v6);
		$model->connect($model->createLink(null, "", "Fa0/0\n10.1.208.153/20"), $v6, $v7);
		$model->connect($model->createLink(null), $v9, $v10);
		$model->connect($model->createLink(null), $v9, $v10b, "dashed=1");
		$model->connect($model->createLink(null), $v9b, $v10, "dashed=1");
		$model->connect($model->createLink(null), $v9b, $v10b);
		$model->connect($model->createLink(null), $v10, $v10b);
		$model->connect($model->createLink(null), $v10, $v11);
		$model->connect($model->createLink(null), $v10b, $v11);
		$model->connect($model->createLink(null), $v10, $v3, "dashed=1");
		$model->connect($model->createLink(null), $v10b, $v3, "dashed=1");
		$model->connect($model->createLink(null, "", "", "Ser0/0/0.777 CCT ID3\n1.1.0.117/30"), $v11, $v14);
		$model->connect($model->createLink(null, "", "Fa0/0\n10.1.208.154/20"), $v14, $v7);
	
		return $model;
	}
		
	/**
	* Function: example20
	*
	* Creates and returns a new <vsGraphModel> with a sample network. The network represents the
	* example for a single cloud with dial backup RTR.
	*/
	function example20()
	{
		// Creates a graph model
		$model = new vsGraphModel();
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName1</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nLO=172.11.255.11</td></tr></table>"),
			110, 120, "defaultVertex");
		$v2 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router1</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v2b = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router2</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK", "ATT\nMPLS\nNetwork\nBGP AS\n13979"), 120, 130, "network");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td align='center' style='border-width:0 0 1 0px;border-style:dashed;border-color:black;'>".
			"2811\nRTRNM\nTun1 = XYZ\nTun2 = ZBC\nLo1 = 123\nAS 64701</td></tr><tr><td valign='top' align='center' height='100%'>Loopback10 = \n172.22.25.1/30</td></tr></table>"),
			140, 122, "isr");
		$v7 = $model->insert($model->createEntity(null, null, "DEVICE", "Customers\nNetwork", "", "", true), 60, 260);
		$v8 = $model->insert($model->createEntity(null, null, "NETWORK", "PSTN Network"), 120, 130, "network");
		$v8b = $model->insert($model->createEntity(null, 2, "ROUTER",
					"<table style='font-size:11px;' width='100%' height='100%'><tr>".
					"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
					"BACKUP RTR</td></tr><tr><td valign='top' height='100%'>7206\nLo0=10.XX.YYY.Z</td></tr>".
					"</table>", "", "Line1\nLine2"),
					100, 80, "defaultVertex");
		
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName3</b></td></tr><tr><td valign='top' height='100%'>ATM7/1/0.40\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345\nSecond Line</td></tr></table>"),
			110, 120, "defaultVertex");
		$v10 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router3</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v10b = $model->insert($model->createEntity(null, 2, "ROUTER", "<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router4</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
			
		// Adds Edges
		$model->connect($model->createLink(null, ""), $v1, $v2);
		$model->connect($model->createLink(null, ""), $v1, $v2b);
		$model->connect($model->createLink(null, ""), $v2, $v3);
		$model->connect($model->createLink(null, ""), $v2, $v2b);
		$model->connect($model->createLink(null, ""), $v2b, $v3);
		$model->connect($model->createLink(null, "", "", "Ser0/0/0.777 CCT ID3\n1.1.0.117/30"), $v3, $v6);
		$model->connect($model->createLink(null, "BRI0/1/0 ISDN Dial Backup\n123-456-7890 & 987-654-3210\n1.24.254.3/27"), $v6, $v8,
			"align=left;verticalAlign=top");
		$model->connect($model->createLink(null, ""), $v8, $v8b);
		$model->connect($model->createLink(null, "", "Fa0/0\n10.1.208.153/20"), $v6, $v7);
		$model->connect($model->createLink(null, ""), $v9, $v10);
		$model->connect($model->createLink(null, ""), $v9, $v10b);
		$model->connect($model->createLink(null, ""), $v10, $v10b);
		$model->connect($model->createLink(null, ""), $v10, $v3);
		$model->connect($model->createLink(null, ""), $v10b, $v3);

		return $model;
	}

	/**
	 * Function: example21
	 *
	 * Creates and returns a new <vsGraphModel> with a sample network. The network represents the
	 * example for a VSAT node with an endpoint but without a remote location.
	 */
	function example21()
	{
		// Creates a graph model
		$model = new vsGraphModel(null, "Endpoint Network Address:\n10.AA.BB.CC/24", "fillColor=#E8E8E8");

		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName1</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nLO=172.11.255.11</td></tr></table>"),
			110, 120, "defaultVertex");
		$v2 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router1</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v2b = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router2</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK", "TELCO MPLS cloud\nCCTID\nAS1234\n12k"), 280, 220, "network;fillColor=#99EEFF;");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='45%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"R1 = 2800\nRTRNAME2\nTunnelABC = .21\nLO0 = .17</td>".
			"<td align='center' style='color:#0000FF;'>Vlan 1000\nIP = .11\nDG = .12</td>".
			"<td align='center' style='color:#FF0000;'>Vlan 1001\nIP = .13\nDG = .14</td></tr><tr>".
			"<td colspan='3' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>".
			"LO1 = 10.AA.BB.92\nAS 1234</td></tr></table>"),
			200, 100, "isr");
		$v6b = $model->insert($model->createEntity(null, null, "SERVER", "Server1\nSUN\nV11\nABCDA", "", "", true), 70, 80, "fillColor=yellow");
		$v7 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='45%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"R1 = 2800\nRTRNAME1\nTunnelABC = .12\nLO0 = .13</td>".
			"<td align='center' style='color:#FF0000;'>Vlan XYZ\nIP = .11\nDG = .12</td>".
			"<td align='center' style='color:#0000FF;'>Vlan ABC\nIP = .13\nDG = .14</td></tr><tr>".
			"<td colspan='3' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>".
			"LO1=10.XX.YYY.Z</td></tr></table>"),
			200, 100, "isr");
		$v7b = $model->insert($model->createEntity(null, null, "SERVER", "Server2\nSUN\nV11\nABCDA", "", "", true), 70, 80, "fillColor=yellow");
		$v8 = $model->insert($model->createEntity(null, null, "DEVICE", "<b>LABEL</b>\n<hr size='1'><b>AA</b>"), 80, 50, "vsat");
		$v8b = $model->insert($model->createEntity(null, null, "NETWORK", "VSAT\n\n(Refer to XXYYZZ\nDiagram)"), 160, 160, "network;fillColor=#99EEFF;");
		
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName3</b></td></tr><tr><td valign='top' height='100%'>ATM7/1/0.40\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345\nSecond Line</td></tr></table>"),
			110, 120, "defaultVertex");
		$v10 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router3</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v10b = $model->insert($model->createEntity(null, 2, "ROUTER", "<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router4</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");

		// Adds Edges
		$model->connect($model->createLink(null, ""), $v1, $v2);
		$model->connect($model->createLink(null, ""), $v1, $v2b);
		$model->connect($model->createLink(null, ""), $v2, $v3, "dashed=1");
		$model->connect($model->createLink(null, ""), $v2, $v2b);
		$model->connect($model->createLink(null, ""), $v2b, $v3, "dashed=1");
		$model->connect($model->createLink(null, "", "XX.YY.XX.ZZ", "S 0/0/0\nXX.YY.XX.AA"), $v3, $v6);
		// Two additional arguments in connect are the source and target label styles
		$model->connect($model->createLink(null, "", "fa0/1/0", "bge2\n.201"), $v6, $v6b,
			"strokeColor=#FF0000", null, "fontColor=#FF0000");
		$model->connect($model->createLink(null, "", "fa0/1/2", "bge0\n.202"), $v6, $v7b,
			"strokeColor=#FF0000", null, "fontColor=#FF0000");
		$model->connect($model->createLink(null, "", "fa0/1/2", "bge2\n.142"), $v7, $v7b,
			"strokeColor=#0000FF", null, "fontColor=#0000FF");
		$model->connect($model->createLink(null, "", "fa0/1/0", "bge0\n.141"), $v7, $v6b,
			"strokeColor=#0000FF", null, "fontColor=#0000FF");
		$model->connect($model->createLink(null, "", "fa0/1/1", "fa0/1/1"), $v6, $v7,
			"shape=wave", "align=right");
		$model->connect($model->createLink(null, "10.AA.BB.128/30", "fa 0/0\n<font style='color:#0000FF;'>.6 129/30</font>", ".6.130/30"), $v7, $v8,
			"shape=wave;align=left;spacingLeft=10", "align=right");
		$model->connect($model->createLink(null, "", ""), $v8, $v8b);
		$model->connect($model->createLink(null, "", "", "2/6"), $v9, $v10);
		$model->connect($model->createLink(null, "", "0/2", "2/6"), $v9, $v10b);
		$model->connect($model->createLink(null, ""), $v10, $v10b);
		$model->connect($model->createLink(null, ""), $v10, $v3);
		$model->connect($model->createLink(null, ""), $v10b, $v3);
		
		// Virtual connections (curved)
		// FIXME: Dashed curves (see mxGdCanvas.quadDashed)
		$model->connect($model->createLink(null, ""), $v1, $v7, "shape=curve;dashed=1;strokeColor=#00FF00;");
		$model->connect($model->createLink(null, ""), $v9, $v6, "shape=curve;dashed=1;strokeColor=#00FF00;");
		
		// Sets the endpoint location label ("Endpoint Location" is default)
		$model->endpointLocationLabel = "Endpoint Location";
		$model->endpointLocationStyle = "endpointLocation";
		
		// Sets the remote location label ("Remote Location" is default)
		$model->remoteLocationLabel = "Remote Location";
		//$model->remoteLocationStyle = "remoteLocation";
		
		return $model;
	}
	
	
	/**
	* Function: example22
	*
	* Creates and returns a new <vsGraphModel> with a sample network. The network represents the
	* example for a VSAT node with an endpoint but without a remote location.
	*/
	function example22()
	{
		// Creates a graph model
		$model = new vsGraphModel(null, "Endpoint Network Address:\n10.AA.BB.CC/24", "fillColor=#E8E8E8");
		
		// Adds vertices in first row
		$v1 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName1</b></td></tr><tr><td valign='top' height='100%'>7600\nATM7/1/0.40\nLO=172.11.255.11</td></tr></table>"),
			110, 120, "defaultVertex");
		$v2 = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router1</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v2b = $model->insert($model->createEntity(null, 1, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router2</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v3 = $model->insert($model->createEntity(null, 1, "NETWORK", "TELCO MPLS cloud\nCCTID\nAS1234\n12k"), 280, 220, "network;fillColor=#99EEFF;");
		$v6 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='45%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"R1 = 2800\nRTRNAME2\nTunnelABC = .21\nLO0 = .17</td>".
			"<td align='center' style='color:#0000FF;'>Vlan 1000\nIP = .11\nDG = .12</td>".
			"<td align='center' style='color:#FF0000;'>Vlan 1001\nIP = .13\nDG = .14</td></tr><tr>".
			"<td colspan='3' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>".
			"LO1 = 10.AA.BB.92\nAS 1234</td></tr></table>"),
			200, 100, "isr");
		$v6b = $model->insert($model->createEntity(null, null, "SERVER", "Server1\nSUN\nV11\nABCDA", "", "", true), 70, 80, "fillColor=yellow");
		$v7 = $model->insert($model->createEntity(null, 1, "ISR",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td width='45%' align='center' style='border-width:0 1 0 0px;border-style:dashed;border-color:black;'>".
			"R1 = 2800\nRTRNAME1\nTunnelABC = .12\nLO0 = .13</td>".
			"<td align='center' style='color:#FF0000;'>Vlan XYZ\nIP = .11\nDG = .12</td>".
			"<td align='center' style='color:#0000FF;'>Vlan ABC\nIP = .13\nDG = .14</td></tr><tr>".
			"<td colspan='3' align='center' style='border-width:1 0 0 0px;border-style:dashed;border-color:black;'>".
			"LO1=10.XX.YYY.Z</td></tr></table>"),
			200, 100, "isr");
		$v7b = $model->insert($model->createEntity(null, null, "SERVER", "Server2\nSUN\nV11\nABCDA", "", "", true), 70, 80, "fillColor=yellow");
		$v8 = $model->insert($model->createEntity(null, null, "DEVICE", "RTRNAME3"), 80, 30);
		$v8b = $model->insert($model->createEntity(null, null, "DEVICE", "<b>LABEL</b>\n<hr size='1'><b>AA</b>"), 80, 50, "vsat");
		$v8c = $model->insert($model->createEntity(null, null, "NETWORK", "VSAT\n\n(Refer to Hub\nDiagram)"), 160, 160, "network;fillColor=#99EEFF;");
		
		// Adds vertices in second row
		$v9 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"<b>APC AccRtrName3</b></td></tr><tr><td valign='top' height='100%'>ATM7/1/0.40\nLO=172.11.255.11</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345\nSecond Line</td></tr></table>"),
			110, 120, "defaultVertex");
		$v10 = $model->insert($model->createEntity(null, 2, "ROUTER",
			"<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router3</td></tr><tr><td valign='top' height='100%'>7600\nVLAN179=\n10.XX.YYY.Z</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		$v10b = $model->insert($model->createEntity(null, 2, "ROUTER", "<table style='font-size:11px;' width='100%' height='100%'><tr>".
			"<td style='border-width:0 0 1 0px;border-style:solid;border-color:black;'>".
			"CE Router4</td></tr><tr><td valign='top' height='100%'>7600</td></tr>".
			"<tr><td align='center' style='border-width:1 0 0 0px;border-style:solid;border-color:black;'>AS 12345</td></tr></table>"),
			100, 80, "defaultVertex");
		
		// Adds Edges
		$model->connect($model->createLink(null, ""), $v1, $v2);
		$model->connect($model->createLink(null, ""), $v1, $v2b);
		$model->connect($model->createLink(null, ""), $v2, $v3, "dashed=1");
		$model->connect($model->createLink(null, ""), $v2, $v2b);
		$model->connect($model->createLink(null, ""), $v2b, $v3, "dashed=1");
		$model->connect($model->createLink(null, "", "SRC Label", "TARGET LABEL"), $v3, $v6);
		// Two additional arguments in connect are the source and target label styles
		$model->connect($model->createLink(null, "", "fa0/1/0", "bge2\n.201"), $v6, $v6b,
			"strokeColor=#FF0000", null, "fontColor=#FF0000");
		$model->connect($model->createLink(null, "", "fa0/1/2", "bge0\n.202"), $v6, $v7b,
			"strokeColor=#FF0000", null, "fontColor=#FF0000");
		$model->connect($model->createLink(null, "", "fa0/1/2", "bge2\n.142"), $v7, $v7b,
			"strokeColor=#0000FF", null, "fontColor=#0000FF");
		$model->connect($model->createLink(null, "", "fa0/1/0", "bge0\n.141"), $v7, $v6b,
			"strokeColor=#0000FF", null, "fontColor=#0000FF");
		$model->connect($model->createLink(null, "", "fa0/1/1", "fa0/1/1"), $v6, $v7,
			"shape=wave", "align=right");
		$e = $model->connect($model->createLink(null, "Edge Label", "SRC\nLabel", "Target\nLabel"), $v7, $v8,
			"align=left;fontColor=#0000FF", "align=right;fontColor=#0000FF");
		$model->connect($model->createLink(null, "Edge\nLabel", "SRC Label", "TRGT Label"), $v8, $v8b,
			"shape=wave;horizontal=0;align=center;verticalAlign=top;spacingTop=22;fontColor=#0000FF;", "fontColor=#0000FF;align=right;", "fontColor=#0000FF;align=right;");
		$e->geometry->offset = new mxPoint(0, 10);
		$model->connect($model->createLink(null, "", ""), $v8b, $v8c);
		
		$model->connect($model->createLink(null, "", "", "2/6"), $v9, $v10);
		$model->connect($model->createLink(null, "", "0/2", "2/6"), $v9, $v10b);
		$model->connect($model->createLink(null, ""), $v10, $v10b);
		$model->connect($model->createLink(null, ""), $v10, $v3);
		$model->connect($model->createLink(null, ""), $v10b, $v3);
		
		// Virtual connections (curved)
		$model->connect($model->createLink(null, ""), $v1, $v7, "shape=curve;dashed=1;strokeColor=#00FF00;");
		$model->connect($model->createLink(null, ""), $v9, $v6, "shape=curve;dashed=1;strokeColor=#00FF00;");
		
		// Sets the endpoint location label ("Endpoint Location" is default)
		$model->endpointLocationLabel = "Endpoint Location";
		$model->endpointLocationStyle = "endpointLocation";
		
		// Sets the remote location label ("Remote Location" is default)
		$model->remoteLocationLabel = "Remote Location";
		$model->remoteLocationStyle = "remoteLocation";
		
		return $model;
	}
}

// Uses the font that ships in the examples directory
putenv("GDFONTPATH=".realpath("."));
mxConstants::$DEFAULT_FONTFAMILY = "Vera";

// Creates and runs a demo object
$demo = new Demo();
$demo->run();

?>
