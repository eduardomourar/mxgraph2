<?php
/**
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: vsNetworkLayout
 * 
 * Implements a custom layout for the VISA Network Editor.
 */

class vsNetworkLayout
{

	/**
	 * Variable: graph
	 * 
	 * Reference to the enclosing <mxGraph>.
	 */
	var $graph;
	
	/**
	 * Variable: mpls
	 * 
	 * Specifies if the diagram has MPLS format.
	 */
	var $mpls = false;
	
	/**
	* Variable: $vsatTopSpacing
	*
	* Specifies the additional spacing from top in VSAT networks.
	*/
	var $vsatTopSpacing = 140;
	
	/**
	* Variable: $verticalCurveSize
	*
	* Specifies the vertical curve size for virtual conections in VSAT diagrams.
	* Default is 140.
	*/
	var $verticalCurveSize = 140;

	/**
	* Variable: $vsatHorizontalSpacing
	* 
	* Specifies the spacing between the router stack and the carrier network.
	* Default is 150.
	*/
	var $vsatHorizontalSpacing = 150;
	
	/**
	* Variable: $endpointLocationHorizontalSpacing
	*
	* Specifies the spacing between the carrier network and the endpoint location.
	* Default is 100.
	*/
	var $endpointLocationHorizontalSpacing = 100;
	
	/**
	* Variable: $endpointLocationVerticalSpacing
	*
	* Specifies the vertical spacing between devices in the endpoint location.
	* Default is 120.
	*/
	var $endpointLocationVerticalSpacing = 120;
	
	/**
	* Variable: commonRow
	* 
	* Specifies if the diagram has one common row after a set of router pairs
	* in an MPLS layout.
	*/
	var $commonRow = false;
	
	/**
	* Variable: dialbackEdge
	* 
	* Stores the dialbackEdge for special layout handling.
	*/
	var $dialbackEdge = null;
	
	/**
	 * Function: verticalSpacing
	 * 
	 * Vertical distance between two rows. Default is 120.
	 */
	var $verticalSpacing = 120;

	/**
	 * Function: mplsVerticalSpacingReduction
	 * 
	 * Defines the reduction of vertical spacing between rows
	 * in MPLS diagram format. Default is 40.
	 */
	var $mplsVerticalSpacingReduction = 40;
		
	/**
	 * Function: mplsVerticalRouterSpacing
	 * 
	 * Defines the vertical spacing between the two routers
	 * in the left-hand MPLS diagram block. Default is 20.
	 */
	var $mplsVerticalRouterSpacing = 20;
		
	/**
	 * Function: mplsHorizontalRouterSpacing
	 * 
	 * Defines the horizontal spacing between the two routers
	 * in the first device in the diagram. Default is 20.
	 */
	var $mplsHorizontalRouterSpacing = 20;
		
	/**
	 * Function: $mplsHorizontalSpacing
	 * 
	 * Defines the horizontal spacing between the MPLS device block
	 * and the rest of the diagram. Default is 60.
	 */
	var $mplsHorizontalSpacing = 60;

	/**
	 * Function: x0
	 * 
	 * Left border width. Default is 20.
	 */
	var $x0 = 20;

	/**
	 * Function: y0
	 * 
	 * Top border height. Default is 20.
	 */
	var $y0 = 20;

	/**
	 * Function: demarcationMargin
	 * 
	 * Margin of the demarcation line. Default is 20.
	 */
	var $demarcationMargin = 30;

	/**
	 * Function: serversHorizontalSpacing
	 * 
	 * Defines the extra horizontal space to add before the server stack.
	 * Default is 90.
	 */
	var $serversHorizontalSpacing = 90;

	/**
	 * Function: serversHorizontalSpacing
	 * 
	 * Defines the extra horizontal space to add before the server stack
	 * in the case of a single row. Default is 40.
	 */
	var $singleRowServersHorizontalSpacing = 40;

	/**
	 * Function: lanHorizontalSpacing
	 * 
	 * Defines the distance between the server-stack and the LAN device.
	 * Default is 60.
	 */
	var $lanHorizontalSpacing = 60;

	/**
	 * Function: lanOversize
	 * 
	 * Defines the additional height of the lan compared to the server stack.
	 * Default is 20.
	 */
	var $lanOversize = 20;

	/**
	 * Function: hostHorizontalSpacing
	 * 
	 * Defines the distance between the LAN device and the member host.
	 * Default is 40.
	 */
	var $hostHorizontalSpacing = 40;

	/**
	 * Function: serverVerticalSpacing
	 * 
	 * Defines the vertical spacing between the servers in the server tack.
	 * Default is 6.
	 */
	var $serverVerticalSpacing = 6;

	/**
	 * Function: serverConnectionSegment
	 * 
	 * Defines the size of the horizontal segment for connections to servers.
	 * Default is 10.
	 */
	var $serverConnectionSegment = 10;

	/**
	 * Function: shortEdgeLength
	 * 
	 * The shorter of the two predefined edge lengths. Default is 40.
	 */
	var $shortEdgeLength = 40;

	/**
	 * Function: longEdgeLength
	 * 
	 * The longer of the two predefined edge lengths. Default is 90.
	 */
	var $longEdgeLength = 90;
	
	/**
	* Function: $veryLongEdgeLength
	*
	* The longest edge lengths for oversize labels. Default is 140.
	*/
	var $veryLongEdgeLength = 140;
	
	/**
	 * Function: minEndpointDistance
	 * 
	 * Minimum length of the edges between endpoint devices and the main
	 * network. Default is 50.
	 */
	var $minEndpointDistance = 50;

	/**
	 * Function: minDeviceSpacing
	 * 
	 * Minimum vertical spacing between parallel devices. Default is 10.
	 */
	var $minDeviceSpacing = 10;

	/**
	 * Function: demarcationShift
	 * 
	 * Horizontal shift of the demarcation line. Default is -10.
	 */
	var $demarcationShift = -30;
	
	/**
	 * Function: notice
	 * 
	 * Reference to the cell that contains the notice.
	 */
	var $notice = null;
	
	/**
	 * Function: noticePadding
	 * 
	 * Space between the notice text and the cellborder. Default is 10.
	 */
	var $noticePadding = 20;

	/**
	 * Function: verticalEndpointShift
	 * 
	 * Inset of endpoint devices which are only connected via a shared
	 * endpoint. Default is 20.
	 */
	var $verticalEndpointShift = 20;		

	/**
	 * Function: horizontalRouteSpacing
	 * 
	 * Distance between the target point and the first bend of a routed
	 * horizontal edge. Default is 10.
	 */
	var $horizontalRouteSpacing = 10;		

	/**
	 * Function: minDetourDistance
	 * 
	 * Minimum vertical distance of a detoured connection. Default is 20.
	 */
	var $minDetourDistance = 20;		

	/**
	 * Function: maxDetourDistance
	 * 
	 * Maxmimum vertical distance of a detoured connection. Default is 50.
	 */
	var $maxDetourDistance = 50;		

	/**
	 * Function: verticalLabelSpacing
	 * 
	 * Vertical spacing for multiple detour labels. Default is 4.
	 */
	var $verticalLabelSpacing = 4;

	/**
	 * Function: detailEdgeLabelSpacing
	 * 
	 * Vertical spacing between details of a cell and label of an outgoing edge.
	 * Default is 6.
	 */
	var $detailEdgeLabelSpacing = 8;

	/**
	 * Function: horizontalEdgeLabelSpacing
	 * 
	 * Minimum horizontal distance between a label and an edge. Default is 4.
	 * Vertical spacing for multiple detour labels. Default is 4.
	 */
	var $horizontalEdgeLabelSpacing = 4;

	/**
	 * Function: verticalControlPointDistance
	 * 
	 * Vertical distance between a crossover control point and the border of
	 * the closest cell. Default is 10.
	 */
	var $verticalControlPointDistance = 10;
	
	/**
	 * Function: $minRowHeights
	 *
	 * Holds minimum row heights for the MPLS part of a diagram. This is
	 * currently only used for pairs of tunnel routers.
	 */
	var $minRowHeights = array();
	
	/**
	* Function: $tunnelRouterVerticalSpacing
	*
	* Defines the vertical spacing between tunnel routers. Default is 20.
	*/
	var $tunnelRouterVerticalSpacing = 20;
	
	/**
	* Function: $tunnelRouterHorizontalSpacing
	* 
	* Specifies the amount of added space between then first two columns
	* if there are pairs of tunnel routers. Default is 40.
	*/
	var $tunnelRouterHorizontalSpacing = 40;
	
	/**
	 * Constructor: vsNetworkLayout
	 * 
	 * Constructs a new network layout for the given graph.
	 *
	 * Parameters:
	 * 
	 * graph - Reference to the enclosing <mxGraph>.
	 */
	function vsNetworkLayout(&$graph)
	{
		$this->graph =& $graph;
	}

	/**
	 * Function: getRow
	 * 
	 * Returns the row number for the given cell.
	 */
	function getRow(&$cell)
	{
		return $cell->getAttribute("row");
	}

	/**
	 * Function: isEndpoint
	 * 
	 * Returns the true if the given cell is an endpoint device.
	 */
	function isEndpoint(&$cell)
	{
		return $cell->getAttribute("endpoint");
	}

	/**
	 * Function: isServer
	 * 
	 * Returns the true if the given cell is an server device.
	 */
	function isServer(&$cell)
	{
		return $cell->value->nodeName == "SERVER";
	}
	
	/**
	 * Function: execute
	 * 
	 * Implements the basic layout algorithm. This is the entry point.
	 */
	function execute(&$parent = null)
	{
		$model =& $this->graph->getModel();
		
		if ($parent == null)
		{
			$parent = $this->graph->getDefaultParent();
		}

		if ($model->getParent($parent) === $model->getRoot())
		{
			$roots =& $this->graph->findTreeRoots($parent);
			$diagramRoots =& $this->checkMpls($roots);

			$model->beginUpdate();
			try
			{
				$diagram =& $this->build($diagramRoots);
				$dx = 0;
				
				// Shifts the non-MPLS part of the diagram to the right to make space
				// between the first two columns if there are pairs of tunnel routers.
				if (sizeof($this->minRowHeights) > 0)
				{
					$dx = $this->tunnelRouterHorizontalSpacing;
				}
				
				if ($model->vsat)
				{
					$this->y0 += $this->vsatTopSpacing;
				}

				$this->layout($parent, $diagram, $dx);

				if ($this->mpls)
				{
					$this->layoutMpls($roots, $diagram, $diagramRoots, $dx);					
				}

				// Special handling for endpoint locations
				if ($model->vsat)
				{
					$this->layoutVsatNetwork($diagramRoots);
				}
				
				// Special handling for dialback edge
				else if ($this->dialbackEdge != null)
				{
					$this->layoutDialback($diagramRoots, $this->dialbackEdge);
				}
				
			}
			catch (Exception $e)
			{
				$model->endUpdate();
				throw($e);
			}
			$model->endUpdate();
		}
	}

	/**
	* Function: layoutVsatNetwork
	* 
	* Layouts the endpoint location network start with the given carrier network.
	*/
	function layoutVsatNetwork($diagramRoots)
	{
		// Gets vertical center from left most router in second row
		$tmp = $diagramRoots[1];
		$midY = $tmp->geometry->y + $tmp->geometry->height / 2;
		
		// Gets the horizontal origin from second column router
		$tmp = $tmp->getEdgeAt(0)->getTerminal(false);
		$x0 = $tmp->geometry->x +  $tmp->geometry->width;
		
		// Places the carrier network
		$carrierNetwork = $diagramRoots[0];
		$cg = $carrierNetwork->geometry;
		$cg->x = $x0 + $this->vsatHorizontalSpacing;
		$cg->y = $midY - $cg->height / 2;
		
		for ($i = 0; $i < $carrierNetwork->getEdgeCount(); $i++)
		{
			$edge = $carrierNetwork->getEdgeAt($i);
			
			// Routes incoming and outgoing edges
			if ($edge->getTerminal(true) === $carrierNetwork)
			{
				$this->layoutEndpointLocation($edge);
			}
			else 
			{
				$edge->geometry->points[1]->x = $x0 + $this->vsatHorizontalSpacing * 0.4;
				$edge->geometry->points[1]->y = $midY;
			}
		}
	}
	
	/**
	* Function: layoutRemoteLocation
	* 
	* Layouts the remote location network from the given incoming edge and returns the
	* vertical top border of the network.
	*/
	function layoutRemoteLocation($in, $y0, $right)
	{
		$sourceGeo = $in->getTerminal(true)->geometry;
		$dy = $this->vsatTopSpacing - 30;
		$dx = 0;
		
		// Places SAT node
		$sat = $in->getTerminal(false);
		$sg = $sat->geometry;
		$eg = null;
		
		// Places intermediate router
		if ($sat->getChildCount() == 2)
		{
			$sg->x = $sourceGeo->x;
			$sg->y = $y0 - $sg->height + 30;
			$y0 -= $dy - 90 + $sg->height;
			$eg = $sg;
			$dx = 40;
			
			// Aligns main edge label
			$in2 = $sat->getEdgeAt(1);
			$in->geometry->points = array(new mxPoint($sg->x + $sg->width / 2, $sourceGeo->y - 1));
			$this->addToStyle($in2, "verticalAlign=middle");
			
			$sat = $in2->getTerminal(false);
			$sg = $sat->geometry;
		}
		
		if ($sat->getChildCount() > 2)
		{
			$sg->x = $sourceGeo->x;
			$sg->y = $y0 - $sg->height;
			
			// Routes incoming edge into SAT node and aligns main edge label
			$in->geometry->points = array(new mxPoint($sg->x + $sg->width / 2, $sourceGeo->y - 1));
			$this->addToStyle($in, "verticalAlign=middle");
			
			// Gets outgoing edge to cloud (via SAT shape child)
			$out = $sat->getEdgeAt(1);
			
			// Reconnects to originate from sat shape
			$child = $sat->getChildAt(2);
			$this->graph->getModel()->setTerminal($out, $child, true);
			
			// Places VSAT network cloud
			$vsg = $out->getTerminal(false)->geometry;
			$vsg->x = $sg->x - $vsg->width + $dx - $this->endpointLocationHorizontalSpacing - 20;
			$vsg->y = max(20, $sg->y - $dy - $sg->height);
			
			// Routes edge from SAT node to VSAT cloud
			$out->geometry->points = array(new mxPoint($sg->x + $child->geometry->x * $sg->width +
				$child->geometry->offset->x - 1,
				$sg->y + $child->geometry->offset->y + $child->geometry->height / 2 - 7),
				new mxPoint($vsg->x + $vsg->width + 1, $vsg->y + $vsg->height / 2));
		}
			
		if ($eg != null)
		{
			// Inserts remote location rectangle
			$left = $eg->x - $dx;
			$child = $sat->getChildAt(2);
			$top = max(20, $sg->y - $child->geometry->height - 20);
			$width = $right - $left + 10;
			$height = $eg->y + $eg->height - $top + 36;
			
			$this->insertRemoteLocation($left, $top, $width, $height);
			
			return $top + $height + 20;
		}
		else
		{
			return $sg->y - $this->endpointLocationVerticalSpacing;
		}
	}
	
	/**
	* Function: layoutEndpointServers
	*
	* Layouts the given endpoint serves and incoming edges and returns
	* the right border of the server stack.
	*/
	function addToStyle($cell, $text)
	{
		if (strlen($cell->style) == 0)
		{
			$cell->style = $text;
		}
		else
		{
			$cell->style .= ";".$text;
		}
	}
	
	/**
	* Function: layoutEndpointServers
	* 
	* Layouts the given endpoint serves and incoming edges and returns
	* the right border of the server stack.
	*/
	function layoutEndpointServers($servers, $x0)
	{
		// Specification defines 2 endpoints
		$srv1 = $servers[0];
		$srv2 = $servers[1];
		
		// Gets both router geometries
		$ig1 = $srv1->getEdgeAt(0)->getTerminal(true)->geometry;
		$ig2 = $srv1->getEdgeAt(1)->getTerminal(true)->geometry;

		// Places server 1
		$sg1 = $srv1->geometry;
		$sg1->x = $x0;
		$sg1->y = $ig1->y + $ig1->height / 2 - $sg1->height / 2;
		
		// Places server 2
		$sg2 = $srv2->geometry;
		$sg2->x = $x0;
		$sg2->y = $ig2->y + $ig2->height / 2 - $sg2->height / 2;
		
		// Route1 edge from ISR 1 to server 1
		$srv1->getEdgeAt(0)->geometry->points = array(new mxPoint($ig1->x + $ig1->width + 1, $ig1->y + 2 * $ig1->height / 3));
		$this->addToStyle($srv1->getEdgeAt(0)->getChildAt(1), "verticalAlign=bottom");
		
		// Routes edge from ISR 2 to server 1
		$srv1->getEdgeAt(1)->geometry->points = array(new mxPoint($ig2->x + $ig2->width + 50, $ig2->y + 2 * $ig2->height / 3),
			new mxPoint($ig2->x + $ig2->width + 50, $sg1->y + 5 * $sg1->height / 6));
		$this->addToStyle($srv1->getEdgeAt(1)->getChildAt(1), "verticalAlign=top");
		
		// Routes edge from ISR 1 to server 2
		$srv2->getEdgeAt(0)->geometry->points = array(new mxPoint($ig1->x + $ig1->width + 90, $ig1->y + $ig1->height / 3),
			new mxPoint($ig1->x + $ig1->width + 90, $sg2->y + 2 * $sg2->height / 3));
		$this->addToStyle($srv2->getEdgeAt(0)->getChildAt(1), "verticalAlign=top");
		
		// Routes edge from ISR 2 to server 2
		$srv2->getEdgeAt(1)->geometry->points = array(new mxPoint($ig2->x + $ig2->width + 1, $ig2->y + $ig2->height / 3));
		$this->addToStyle($srv2->getEdgeAt(1)->getChildAt(1), "verticalAlign=bottom");
		
		return max($sg2->x + $sg1->width, $sg2->x + $sg2->width);
	}
	
	/**
	* Function: layoutVirtualConnections
	*
	* Layouts the non-orthogonal edges from endpoint routers to corresponding
	* tunnel routers.
	*/
	function layoutVirtualConnections($curve1, $curve2)
	{
		// LATER: Add code to compute curve control point -
		// verticalCurveSize below will work for most values.
		// Routes the first curved virtual connection
		if ($curve1 != null)
		{
			$sg = $curve1->getTerminal(true)->geometry;
			$ig = $curve1->getTerminal(false)->geometry;
			$x0 = $sg->x + $sg->width / 2;
			$curve1->geometry->points = array(new mxPoint($x0, $sg->y + $sg->height + 1),
			new mxPoint($x0 + ($ig->x - 1 - $x0) / 2.5, $sg->y + $sg->height + $this->verticalCurveSize),
			new mxPoint($ig->x - 1, $ig->y + 7 * $ig->height / 8));
		}
		
		// Routes the second curved virtual connection
		if ($curve2 != null)
		{
			$sg = $curve2->getTerminal(true)->geometry;
			$ig = $curve2->getTerminal(false)->geometry;
			$x0 = $sg->x + $sg->width / 2;
			$curve2->geometry->points = array(new mxPoint($x0, $sg->y - 1),
				new mxPoint($x0 + ($ig->x - 1 - $x0) / 4, $sg->y - $this->verticalCurveSize),
				new mxPoint($ig->x - 1, $ig->y + $ig->height / 3));
		}
	}
	
	/**
	 * Function: layoutEndpointLocation
	 * 
	 * Layouts the devices inside the endpoint location group. The remote
	 * location is layouted separatedly even if visually part of this group.
	 *
	 */
	function layoutEndpointLocation($in)
	{
		$cg = $in->getTerminal(true)->geometry;
		
		// Places entry node
		$isr1 = $in->getTerminal(false);
		$ig1 = $isr1->geometry;
		$ig1->x = $cg->x + $cg->width + $this->endpointLocationHorizontalSpacing;
		$ig1->y = $cg->y + $cg->height * 0.9 - $ig1->height;
		
		// Routes edge from network to entry node
		$in->geometry->points = array(new mxPoint($cg->x + $cg->width + 1, $cg->y + $cg->height / 2),
		new mxPoint($ig1->x - 1, $ig1->y + $ig1->height / 2));
		
		// Places source label of edge to entry node inside cloud shape
		$in->getChildAt(0)->geometry->offset = new mxPoint(-2, 0);
		$in->getChildAt(0)->style = "sourceLabel;align=right;verticalAlign=middle;";
		
		// Processes all outgoing edges of the entry node to find the endpoints and
		// the edge that points upwards to the next device and the remote location.
		// We also try and find the incoming virtual dashed curve connection from
		// the router on the corresponding row.
		$servers = array();
		$curve1 = null;
		$up = null;
		
		for ($i = 0; $i < $isr1->getEdgeCount(); $i++)
		{
			$edge = $isr1->getEdgeAt($i);
			
			if ($edge->getTerminal(true) === $isr1)
			{
				$target = $edge->getTerminal(false);
				
				if ($target->value->getAttribute("endpoint") == "1")
				{
					array_push($servers, $target);
				}
				else
				{
					$up = $edge;
				}
			}
			else if ($edge !== $in)
			{
				$curve1 = $edge;
			}
		}
		
		if ($up != null)
		{
			// Places ISR 2
			$isr2 = $up->getTerminal(false);
			$ig2 = $isr2->geometry;
			$ig2->x = $ig1->x;
			$ig2->y = $ig1->y - $this->endpointLocationVerticalSpacing - $ig2->height + 30;
			
			// Routes edge from ISR 1 to ISR 2 (vertical edge)
			$up->geometry->points = array(new mxPoint($ig1->x + $ig1->width / 2, $ig1->y - 1));
			
			// Places servers and routes all incoming edges to servers
			$right = $this->layoutEndpointServers($servers, $ig1->x + $ig1->width + $this->vsatHorizontalSpacing);
	
			// Processes all outgoing connections from the second router to find the sat connection and
			// second virtual dashed curve connection from the source on the corresponding row.
			$curve2 = null;
			$sat = null;
			
			for ($i = 0; $i < $isr2->getEdgeCount(); $i++)
			{
				$edge = $isr2->getEdgeAt($i);
					
				if ($edge->getTerminal(true) === $isr2)
				{
					$target = $edge->getTerminal(false);
				
					if ($target->value->getAttribute("endpoint") != "1")
					{
						$sat = $edge;
					}
				}
				else if ($edge !== $up)
				{
					$curve2 = $edge;
				}
			}
			
			// Routes the curved virtual connection from endpoint routers to tunnel routers
			$this->layoutVirtualConnections($curve1, $curve2);
			
			// Layouts sat connection
			if ($sat != null)
			{
				$y0 = $this->layoutRemoteLocation($sat, $ig2->y - $this->endpointLocationVerticalSpacing, $right);
				
				// Inserts endpoint location rectangle
				$left = $ig1->x;
				$top = max(20, $y0);
				$height = $ig1->y + $ig1->height - $top + 32;
				
				// Adds left border (depending on incoming edge target label width);
				$tmp = mxUtils::getSizeForString($this->graph->getLabel($in->getChildAt(1)));
				$left -= min(90, max(60, $tmp->width + 20));
				$width = $right - $left + 10;
				
				$this->insertEndpointLocation($left, $top, $width, $height);

				// Places notice in the middle of the diagram
				if ($this->notice != null)
				{
					$ng = $this->notice->geometry;
					$ng->x = $cg->x + ($cg->width - $ng->width) / 2;
					$ng->y = ($top + $height - $ng->height) / 2;
				}
			}
		}
	}
	
	/**
	* Function: insertRemoteLocation
	*
	* Inserts group around the remote location.
	*/
	function insertRemoteLocation($x, $y, $w, $h)
	{
		$model =& $this->graph->getModel();
		$group = $this->graph->createVertex($this->graph->getDefaultParent(),
			null, $model->remoteLocationLabel, $x, $y, $w, $h, $model->remoteLocationStyle);
		$model->add($this->graph->getDefaultParent(), $group, 0);
	}
	
	/**
	* Function: insertEndpointLocation
	*
	* Inserts group around the endpoint location.
	*/
	function insertEndpointLocation($x, $y, $w, $h)
	{
		$model =& $this->graph->getModel();
		$group = $this->graph->createVertex($this->graph->getDefaultParent(),
			null, $model->endpointLocationLabel, $x, $y, $w, $h, $model->endpointLocationStyle);
		$model->add($this->graph->getDefaultParent(), $group, 0);
	}
	
	/**
	* Function: layoutDialback
	*
	* Invokes <layout> on all cells returned by <mxGraph.findTreeRoots> for
	* the given parent, or the default parent if no parent is specified, and
	* then invokes <placeDemarcationLine> to tune the graph layout. All steps
	* are executed in a single transaction on the <graph> model.
	*/
	function layoutDialback($diagramRoots, $dialbackEdge)
	{
		// Gets the first node of the common row
		$ref = $diagramRoots[0]->geometry;
		$cg = $dialbackEdge->target->geometry;
		$cg->x = $ref->x;
		$cg->y = $ref->y + $ref->height + $this->verticalSpacing + $this->mplsVerticalRouterSpacing;
		
		$dg = $dialbackEdge->geometry;
		$dg->points[0] = new mxPoint($cg->x + $cg->width, $cg->y + $cg->height / 2);
		
		// Gets the bottom right device in the MPLS block
		// LATER: Make indices more generic
		$ref = $this->graph->getModel()->getTerminal($diagramRoots[1]->edges[1], false)->geometry;

		// Gets the target terminal of the outgoing edge
		$out = $dialbackEdge->target->cell->edges[1];
		$fg = $this->graph->getModel()->getTerminal($out, false)->geometry;
		$fg->x = $ref->x;
		$fg->y = $ref->y + $ref->height + 2 * $this->mplsVerticalRouterSpacing;
		
		$og = $out->geometry;
		$og->points[0] = new mxPoint($cg->x, $cg->y + $cg->height / 2);
		$og->points[1] = new mxPoint($fg->x + $fg->width, $fg->y + $fg->height / 2);
	}
	
	/**
	 * Function: layout
	 * 
	 * Invokes <layout> on all cells returned by <mxGraph.findTreeRoots> for
	 * the given parent, or the default parent if no parent is specified, and
	 * then invokes <placeDemarcationLine> to tune the graph layout. All steps
	 * are executed in a single transaction on the <graph> model.
	 */
	function layout(&$parent, &$diagram, $dx)
	{
		$x0 = $this->x0 + $dx;
		$top = $this->y0 + $this->demarcationMargin;
		$y0 = $top;
		
		$maxCol = $this->normalize($diagram);
		
		// Defines an array of column widths for all rows
		// and finds the column widths, row heights and
		// vertical row centers
		$cx = array();
		$rh = array();
		$cy = array();
		$height = 0;

		for ($i = 0; $i < sizeof($diagram->rows); $i++)
		{
			$rowHeight = max($this->arrangeRow($diagram->rows[$i], $cx),
				($diagram->serversHeight - $this->verticalSpacing) / 2);
			
			// Checks if tunnel router pairs need more vertical space
			if (isset($this->minRowHeights[$i]))
			{
				$rowHeight = max($rowHeight, $this->minRowHeights[$i] - $this->mplsVerticalSpacingReduction);
			}

			array_push($rh, $rowHeight);
		}

		// Stores the row heights in the diagram
		$diagram->rowHeights = $rh;

		if (sizeof($cx) > 0)
		{
			// Sums all column widths with two available possible edge lengths
			$cx[0]->cx = $cx[0]->width / 2;
			
			for ($i = 1; $i < sizeof($cx); $i++)
			{
				$spacing = ($cx[$i]->prev < $this->longEdgeLength) ?
					(($cx[$i]->prev < $this->shortEdgeLength) ?
					$this->shortEdgeLength : $this->longEdgeLength) :
					$this->veryLongEdgeLength;
				$cx[$i]->cx = $cx[$i-1]->cx + $cx[$i-1]->width / 2 +
					$spacing + $cx[$i]->width / 2;
			}

			// Layouts the endpoints and gets any extra vertical space
			// NOTE: The return value of layoutEndpoints used to be in dy,
			// but it is currently ignored as it seems to have no effect.
			$this->layoutEndpoints($diagram->ends, $x0, $cx, $y0, $rh);
			$dy = 0;
			
			// Applies the row widths and heights to position
			// the devices within the rows
			$elbows = array();
			$maxDy = max($this->verticalSpacing, $dy);
			
			for ($i = 0; $i < sizeof($diagram->rows); $i++)
			{
				$tmp = 0;
				
				// Shifts common row to vertical center
				if ($this->commonRow && $i == 0)
				{
					$tmp += ($rh[0] + $this->verticalSpacing) / 2;
				}
				
				$elbows = array_merge($elbows, $this->layoutRow(
					$diagram->rows[$i], $x0, $y0 + $tmp, $cx, $rh[$i], $diagram));
				$cy[$i] = $y0 + $rh[$i] / 2;
				$y0 += $rh[$i] + $maxDy;
				$height = $y0 - $maxDy;
			}
			
			// Handles exception where the server stack is smaller than
			// the diagram height, in which case the vertical spacing
			// between the servers is increased
			$serverCount = sizeof($diagram->servers);
			
			if ($serverCount > 0)
			{
				$dy = max($this->serverVerticalSpacing,
					($height - $diagram->serversHeight) / $serverCount);
			}
			else
			{
				$dy = $this->serverVerticalSpacing;
			}

			// Uses short edge length for single row
			$x0 += (sizeof($cy) > 1) ? $this->serversHorizontalSpacing :
				$this->singleRowServersHorizontalSpacing;

			if (!$this->graph->getModel()->vsat)
			{
				$this->layoutServers($diagram, $x0, $cx, $top, $dy, $cy);
			}
			
			$this->routeElbows($elbows);
			$this->layoutBackground($parent, $diagram, $cx, $y0 - $this->verticalSpacing);
		}
	}

	/**
	 * Function: layoutServers
	 * 
	 * Layouts the given servers in the network.
	 */
	function layoutServers(&$diagram, $x0, &$cx, $y0, $dy, &$cy)
	{
		$servers = $diagram->servers;
		$top = $diagram->serversHeight;
		$lan = null;
		$bottom = 0;
		$x1 = 0;
				
		// Builds the server-stack
		for ($i = 0; $i < sizeof($servers); $i++)
		{
			$g =& $servers[$i]->geometry;
			$g->x = $x0 + $cx[$servers[$i]->col]->cx - $g->width / 2;
			$g->y = $y0;
			$y0 += $g->height + $dy;
			$x1 = max($x1, $g->x + $g->width);
			
			// Handles exception where there are two servers in the stack,
			// in which case they are placed in the middle of the row unless
			// there is only one row
			if (sizeof($servers) < 3 && sizeof($cy) > 1)
			{
				$g->y = $cy[$i] - $g->height / 2;
			}
			
			$top = min($top, $g->y);
			$bottom = max($bottom, $g->y + $g->height);
						
			$lan = $this->routeServerFanin($servers, $i, sizeof($cy));
		}
		
		// Sets the x-coordinate of the LAN device
		if ($lan != null)
		{
			$lan->geometry->x = $x1 + $this->lanHorizontalSpacing;
			$this->layoutLan($lan, $top, max($bottom - $top, $diagram->serversHeight));
		}
		
		return $lan;
	}
	
	/**
	 * Function: routeServerFanin
	 *
	 * Routes all incoming connections into the given server.
	 */
	function routeServerFanin(&$servers, $index, $rowCount)
	{
		// Defines the size for the horizontal segment of the
		// unbent edges between source and target server
		$seg = max(1, $this->serverConnectionSegment);

		$lan = null;
		$serverCount = sizeof($servers);
		$server =& $servers[$index];
		
		for ($i = 0; $i < $server->cell->getEdgeCount(); $i++)
		{
			$edge = $server->cell->getEdgeAt($i);
			
			// Filters out all outgoing connections
			if ($edge->target === $server->cell)
			{
				$e =& $this->lookup($server->cell->getEdgeAt($i));
				$g1 =& $e->cell->source->geometry;
				
				$dy = $g1->height / ($serverCount + $rowCount - 1);
				$dx = $e->firstLabelSize->width + $seg + 6;
				
				$x = $g1->x + $g1->width + $dx; 
				$y = $g1->y + ($index + 1) * $dy;
				
				// Shifts the control points for single row
				if ($rowCount == 1)
				{
					$y -= $dy / 2;
				}
				
				// Sets the source point on the edge
				$this->setPoint($e->cell, $x, $y, true);
	
				// Moves edge away from the source so that the label is visible
				$e->firstLabel->geometry->offset->y = $e->firstLabelSize->height / 3;
				$e->firstLabel->geometry->offset->x = -$dx + $seg - 2;
				$sps = $dx - $seg;
				
				// Sets the target point of the edge to distribute along the
				// left side of the server
				$g2 =& $e->cell->target->geometry;
				
				$dx = $e->secondLabelSize->width + $seg + 6;
				
				$x = $g2->x - $dx;
				$y = $g2->y + $g2->height / 2 * ($i + 0.5);
				
				// Sets the target point on the edge only if there is more than
				// one row and if not there is 2 servers and the edge is straight
				if ($rowCount > 1 && ($serverCount != 2 || $this->getRow($edge->source) - 1 != $index))
				{
					$this->setPoint($e->cell, $x, $y, false);
				}
				
				// Moves edge away from the target so that the label is visible
				// NOTE: Use height/2 to enter in the middle of two line labels on target
				$e->secondLabel->geometry->offset->y = -$e->secondLabelSize->height / 3;
				$e->secondLabel->geometry->offset->x = $dx - $seg;
				$tps = $dx - $seg;
				
				if (strlen($e->cell->style) > 0)
				{
					$e->cell->style .= ";sourcePerimeterSpacing=$sps;targetPerimeterSpacing=$tps;";
				}
				else
				{
					$e->cell->style = "sourcePerimeterSpacing=$sps;targetPerimeterSpacing=$tps;";
				}
			}
			else if ($lan == null)
			{
				$lan = $edge->target;
			}
		}
		
		return $lan;
	}
		
	/**
	 * Function: layoutLan
	 * 
	 * Layouts the lan and member host for the given lan cell.
	 */
	function layoutLan(&$lan, $top, $height)
	{
		$host = null;

		if ($lan != null)
		{
		 	$s = $this->lanOversize;
			$lan->geometry->y = $top - $s / 2;
			$lan->geometry->height = $height + $s;
			
			for ($i = 0; $i < $lan->getEdgeCount() && $host == null; $i++)
			{
				$edge = $lan->getEdgeAt($i);
				
				// Looks only at ougoing connections
				if ($edge->source === $lan)
				{
					$host = $edge->target;
					$lg = $lan->geometry;
					
					$host->geometry->x = $lg->x + $this->hostHorizontalSpacing;
					$host->geometry->y = $lg->y + ($lg->height - $host->geometry->height) / 2;
				}
			}
		}
		
		return $host;
	}

	/**
	 * Function: checkMpls
	 * 
	 * Checks if the diagram has the MPLS diagram format.
	 */
	function checkMpls($roots)
	{
		$model =& $this->graph->getModel();
		$result = array();
		$rows = array();
		$maxDx = 0;
		
		for ($i = 0; $i < sizeof($roots); $i++)
		{
			$row = $this->getRow($roots[$i]) - 1;
			$g =& $model->getGeometry($roots[$i]);
			
			if (!isset($rows[$row]))
			{
				$rows[$row] =& $roots[$i];
				$subroot = $this->getSubroot($roots[$i]);
				
				if ($subroot != null)
				{
					$this->mpls = true;
					
					$dx = $g->width;
	
					$dx += $subroot[0];
					array_push($result, $subroot[1]);
	
					$maxDx = max($maxDx, $dx + $this->mplsHorizontalSpacing);				
				}
				else
				{
					array_push($result, $roots[$i]);
					$this->commonRow = $this->mpls;
				}
			}
			else
			{
				// Handles pairs of tunnel routers
				$g2 =& $model->getGeometry($rows[$row]);
				$this->minRowHeights[$row] = $g->height + $g2->height + $this->tunnelRouterVerticalSpacing;
			}
		}

		if ($this->mpls)
		{
			$this->x0 += $maxDx;
			$this->verticalSpacing -= $this->mplsVerticalSpacingReduction;
		}

		return $result;
	}
	
	/**
	 * Function: getSubroot
	 * 
	 * Returns a tuple of the width and root for the subdiagram
	 * on the right hand side of the MPLS start block.
	 */
	function getSubroot($root)
	{
		$model =& $this->graph->getModel();
		$out =& $model->getEdges($root);
		
		// Checks if root has more than one outgoing edge
		// in which case the diagram is an MPLS format
		if (sizeof($out) > 1)
		{
			$row = $this->getRow($root);
			$adj = array();
		
			// Gets all adjacent devices for the first device
			for ($j = 0; $j < sizeof($out); $j++)
			{
				$term =& $model->getTerminal($out[$j], false);
				array_push($adj, $term);
			}
			
			// Finds the first device after the MPLS block on the
			// left hand side by checking all outgoing edges from
			// the adjacent devices that do not point backwards or
			// to other adjacent devices and stay in the same row
			for ($j = 0; $j < sizeof($adj); $j++)
			{
				$out2 =& $model->getEdges($adj[$j]);
				
				for ($k = 0; $k < sizeof($out2); $k++)
				{
					$source =& $model->getTerminal($out2[$k], true);
					
					if ($source === $adj[$j])
					{
						$term =& $model->getTerminal($out2[$k], false);
						
						if ($this->getRow($term) == $row &&
							mxUtils::indexOf($adj, $term) < 0)
						{
							$g =& $model->getGeometry($adj[$j]);
							
							return array($g->width, $term);
						}
					}
				}
			}
		}
		
		return null;
	}
	
	/**
	 * Function: layoutMpls
	 * 
	 * Layouts the first two columns of the diagram.
	 */
	function layoutMpls($roots, $diagram, $diagramRoots, $dx)
	{
		$model =& $this->graph->getModel();
		$rows = array();
		$out = array();
		$space = 0;
		
		// Checks the edge labels for additional space between routers
		for ($i = 0; $i < sizeof($roots); $i++)
		{
			// Gets the outgoing edges from the first router
			$out[$i] =& $model->getEdges($roots[$i]);
			
			// Adds spacing if there are additional labels on the connectors between routers
			// LATER: Shift rest of diagram to the right
			for ($j = 0; $j < sizeof($out[$i]); $j++)
			{
				$mainSize = mxUtils::getSizeForString($this->graph->getLabel($out[$i][$j]));
				$label1 = mxUtils::getSizeForString($this->graph->getLabel($out[$i][$j]->getChildAt(0)));
				$label2 = mxUtils::getSizeForString($this->graph->getLabel($out[$i][$j]->getChildAt(1)));
		
				$space = max($space, max($mainSize->width, $label1->width + $label2->width));
				
				// Resets offsets and sets vertical alignment
				// LATER: Remove existing offset by not adding it
				$out[$i][$j]->getChildAt(0)->geometry->offset = new mxPoint();
				$this->addToStyle($out[$i][$j]->getChildAt(0), "verticalAlign=bottom");
				$out[$i][$j]->getChildAt(1)->geometry->offset = new mxPoint();
				$this->addToStyle($out[$i][$j]->getChildAt(1), "verticalAlign=top");
			}
		}

		// Processes the root for each row
		for ($i = 0; $i < sizeof($roots); $i++)
		{
			$row = $this->getRow($roots[$i]) - 1;
			
			// Finds vertical row center
			$g1 =& $model->getGeometry($diagramRoots[$row]);
			$y = $g1->y + $g1->height / 2;

			// Shifts MPLS devices vertically for common row
			if ($this->commonRow && $row == 0)
			{
				$y = ($diagram->rowHeights[$row] + $this->verticalSpacing) / 2;

				if ($model->vsat)
				{
					$y += $this->vsatTopSpacing;
				}
			}
			
			// Places the first router in the row
			$g2 =& $model->getGeometry($roots[$i])->copy();
			$g2->x = 20;
			$g2->y = $y - $g2->height / 2;
			
			$model->setGeometry($roots[$i], $g2);
			
			// Specifies the horizontal starting point for the second row routers
			$x0 = $g2->x + $g2->width + $this->mplsHorizontalRouterSpacing + $dx + $space;
			
			$this->layoutMplsRouter($diagramRoots, $diagramRoots[$row], $x0, $y, $out[$i][0], $row, true);
			$this->layoutMplsRouter($diagramRoots, $diagramRoots[$row], $x0, $y, $out[$i][1], $row, false);
				
			// Handles tunnel router pairs
			if (!isset($rows[$row]))
			{
				$rows[$row] = $roots[$i];
			}
			else
			{
				$this->layoutTunnelRouterPair($rows[$row], $model->getEdges($rows[$row]), $roots[$i], $out[$i], $y);
			}
		}
	}
	
	/**
	* Function: layoutTunnelRouterPair
	*
	* Handles special case for pairs of tunnel routers in diagram. This places the
	* tunnel router and changes the terminal points of the connected edges.
	*/
	function layoutTunnelRouterPair($router1, $out1, $router2, $out2, $y)
	{
		$model =& $this->graph->getModel();
		$g1 =& $model->getGeometry($router1);
		$g2 =& $model->getGeometry($router2);
		
		// Computes total height and distributes routers
		$h = $g1->height + $g2->height + $this->tunnelRouterVerticalSpacing;
		$g1->y = $y - $h / 2;
		$g2->y = $g1->y + $g1->height + $this->tunnelRouterVerticalSpacing;
		
		// Moves terminal points for outgoing edges of router1
		$ge =& $model->getGeometry($out1[0]);
		$gt = $model->getGeometry($model->getTerminal($out1[0], false));
		$this->routeTunnelRouterEdge($ge, $g1, $gt, $g2);
		
		$ge =& $model->getGeometry($out1[1]);
		$gt = $model->getGeometry($model->getTerminal($out1[1], false));
		$this->routeTunnelRouterEdge($ge, $g1, $gt, $g2);
		
		// Moves terminal points for outgoing edges of router2
		$ge =& $model->getGeometry($out2[0]);
		$gt = $model->getGeometry($model->getTerminal($out2[0], false));
		$this->routeTunnelRouterEdge($ge, $g2, $gt, $g1);
		
		$ge =& $model->getGeometry($out2[1]);
		$gt = $model->getGeometry($model->getTerminal($out2[1], false));
		$this->routeTunnelRouterEdge($ge, $g2, $gt, $g1);
	}
	
	/**
	* Function: layoutMplsRouter
	*
	* Layouts the top or bottom router in the MPLS block.
	*/
	function routeTunnelRouterEdge($ge, $g1, $g2, $gOtherRouter)
	{
		$ge->points[0]->x = $g1->x + $g1->width;
		$ge->points[0]->y = $g1->y + $g1->height / 2;
		
		$top = max($g1->y, $g2->y);
		$bottom = min($g1->y + $g1->height, $g2->y + $g2->height);
		
		if ($top > $bottom)
		{
			array_push($ge->points, new mxPoint($g2->x, $gOtherRouter->y + $gOtherRouter->height / 2));
		}
	}
	
	/**
	 * Function: layoutMplsRouter
	 * 
	 * Layouts the top or bottom router in the MPLS block.
	 */
	function layoutMplsRouter($diagramRoots, $currentRoot, $x, $midY, $incoming, $row, $top)
	{
		$model =& $this->graph->getModel();
		
		// Places the top router in the second column
		$r =& $model->getTerminal($incoming, false);
		$g =& $model->getGeometry($r)->copy();
		
		$g->x = $x;
		
		if ($top)
		{
			$g->y = $midY - $this->mplsVerticalRouterSpacing / 2 - $g->height;
		}
		else
		{
			$g->y = $midY + $this->mplsVerticalRouterSpacing / 2;
		}
		
		$model->setGeometry($r, $g);

		// Places the edge between the first and top router
		$ge =& $model->getGeometry($incoming)->copy();
		$ge->points = array(new mxPoint($g->x, $midY - (($top) ? 35 : -35)));
		
		$model->setGeometry($incoming, $ge);
		
		// Places the edges between the top router and networks
		$out2 =& $model->getEdges($r);
		
		for ($j = 0; $j < sizeof($out2); $j++)
		{
			$source =& $model->getTerminal($out2[$j], true);
			
			if ($source === $r)
			{
				$ge =& $model->getGeometry($out2[$j])->copy();
				$term =& $model->getTerminal($out2[$j], false);
				
				if ($term === $diagramRoots[0] ||
					(sizeof($diagramRoots) > 1 &&
					$term === $diagramRoots[1]))
				{
					$tmpY = $g->y + $g->height / 2 + (($top) ? 10 : -10);
					
					if ($term !== $currentRoot)
					{
						if ($row == 0)
						{
							$tmpY += 20;
						}
						else
						{
							$tmpY -= 20;
						}
					}
					
					$gt = $model->getGeometry($term);
					$ge->points = array(new mxPoint($g->x + $g->width, $tmpY),
						new mxPoint($gt->x, $gt->y + $gt->height / 2));
				}
				else
				{
					$ge->points = array(new mxPoint($g->x + $g->width / 2,
						$g->y + $g->height));
				}
				
				$model->setGeometry($out2[$j], $ge);
			}
		}
	}

	/**
	 * Function: routeElbows
	 * 
	 * Routes the non-vertical crossover edges.
	 */
	function routeElbows(&$elbows)
	{
		// Counts the number of crossovers that cross the demarcation line
		$endpointElbows = 0;
		
		for ($i = 0; $i < sizeof($elbows); $i++)
		{
			$pts =& $elbows[$i]->geometry->points;
			
			if (sizeof($pts) > 1)
			{
				$p0 =& $pts[0];
				$p1 =& $pts[1];
				
				$midY = $p0->y + ($p1->y - $p0->y) / 2;
				
				if ($elbows[$i]->target->endpoint)
				{
					$p0->x = $elbows[$i]->target->geometry->x - ($endpointElbows + 1) * 5;
					
					if ($elbows[$i]->source->row < $elbows[$i]->target->row)
					{
						$p0->y = $elbows[$i]->source->geometry->y + $elbows[$i]->source->geometry->height - ($endpointElbows + 1) * 5;
						$p1->y = $elbows[$i]->target->geometry->y + ($endpointElbows + 1) * 5;
						$elbows[$i]->firstLabel->geometry->offset->y = 10 - $endpointElbows * 7;
					}
					else
					{
						$p0->y = $elbows[$i]->source->geometry->y + $endpointElbows * 5;
						$p1->y = $elbows[$i]->target->geometry->y + $elbows[$i]->target->geometry->height - ($endpointElbows + 1) * 5;
						$elbows[$i]->firstLabel->geometry->offset->y = - 26 + $endpointElbows * 7;
						
						// Switch the labels of the outgoing edges to be top aligned to make space
						// for the labels of the crossover edges which go out on the same side
						for ($j = 0; $j < sizeof($elbows[$i]->source->next); $j++)
						{
							$this->setVAlign(array($elbows[$i]->source->next[$j]->firstLabel),
								mxConstants::$ALIGN_TOP);
						}
					}
	
					$p1->x = $p0->x;
					$endpointElbows++;
				}
				else if ($elbows[$i]->source->row < $elbows[$i]->target->row)
				{
					$p0->y = $midY;
					$p1->y = $midY;
					
					$elbows[$i]->geometry->offset->y =
						- $this->verticalControlPointDistance;
				}
				else
				{
					$dy = $this->verticalControlPointDistance;
					$midX = $p0->x + ($p1->x - $p0->x) / 2;
	
					$p0->y = $midY + $dy;
					$p1->y = $midY - $dy;
	
					$elbows[$i]->geometry->points = array($p0,
						new mxPoint($midX, $p0->y), new mxPoint($midX, $p1->y), $p1);
					$elbows[$i]->geometry->offset->y = 2 * $dy;
				}
				
				// Aligns the labels
				if ($elbows[$i]->source->col < $elbows[$i]->target->col)
				{
					$this->setAlign(array($elbows[$i]->firstLabel),
						mxConstants::$ALIGN_LEFT);
					$this->setAlign(array($elbows[$i]->secondLabel),
						mxConstants::$ALIGN_RIGHT);
				}
				else
				{
					$this->setAlign(array($elbows[$i]->firstLabel),
						mxConstants::$ALIGN_RIGHT);
					$this->setAlign(array($elbows[$i]->secondLabel),
						mxConstants::$ALIGN_LEFT);				
				}
			}
		}
	}

	/**
	 * Function: layoutBackground
	 * 
	 * Places the demarcation line and notice label.
	 */
	function layoutBackground(&$parent, &$diagram, &$cx, $height)
	{
		$model =& $this->graph->getModel();

		// Finds the column where the demarcation line should be drawn
		$endpointCol = sizeof($cx) - 1;
		$endCount = sizeof($diagram->ends);
		
		for ($i = 0; $i < $endCount; $i++)
		{
			$endpointCol = min($endpointCol, $diagram->ends[$i]->col);
		}
		
		// Finds the cell that represents the demarcation line and notice
		$childCount = $model->getChildCount($parent);
		
		for ($i = 0; $i < $childCount; $i++)
		{
			$child =& $model->getChildAt($parent, $i);
			
			if ($model->isEdge($child) &&
				$model->getTerminal($child, true) == null &&
				$model->getTerminal($child, false) == null)
			{
				$this->placeDemarcationLine($child, $this->x0 +
					$cx[$endpointCol]->cx - $cx[$endpointCol]->width / 2, $height);
			}
			else if ($model->isVertex($child) && is_string($child->value))
			{
				$this->arrangeNotice($child, $cx, $height);
				
				// Keeps reference if required to move later for VSAT diagrams
				$this->notice = $child;
			}
		}
	}

	/**
	 * Function: placeDemarcationLine
	 * 
	 * Places the demarcation line on the diagram.
	 */
	function placeDemarcationLine(&$demarcationLine, $x, $height)
	{	
		if ($demarcationLine != null)
		{
			$g =& $demarcationLine->geometry->copy();
			$x += $this->demarcationShift;
			$g->setTerminalPoint(new mxPoint($x, $this->y0), true);
			$g->setTerminalPoint(new mxPoint($x, $height +
				$this->demarcationMargin) , false);
			$this->graph->model->setGeometry($demarcationLine, $g);
		}
	}

	/**
	 * Function: arrangeNotice
	 * 
	 * Automatically sizes and places the notice on the diagram.
	 */
	function arrangeNotice(&$notice, &$cx, $height)
	{	
		if ($notice != null)
		{
			$size = mxUtils::getSizeForString(
				$this->graph->getLabel($notice));

			$g = $notice->geometry->copy();
			$g->x = $cx[0]->cx;
			$g->y = $this->demarcationMargin +
				($height - $size->height - $this->noticePadding) / 2;
				
			if ($this->mpls)
			{
				$g->y += $height / 2 + 2 * $this->noticePadding;
			}
			
			$g->width = $size->width + $this->noticePadding;
			
			// Does not add the padding in the vertical direction to
			// get a smaller vertical gap between text and border
			$g->height = $size->height;
			
			$this->graph->model->setGeometry($notice, $g);
		}
	}
	
	/**
	 * Function: layoutEndpoints
	 * 
	 * Layouts the given endpoints in the network.
	 */
	function layoutEndpoints(&$ends, $x0, &$cx, $y0, &$rh)
	{
		$dy = 0;
		
		// Finds shared endpoint devices and puts them in the middle
		for ($i = 0; $i < sizeof($ends); $i++)
		{
			if (!$ends[$i]->server)
			{
				// Puts shared endpoint devices into the middle row and allocates
				// vertical space
				$g =& $ends[$i]->geometry;
				$g->x = $x0 + $cx[$ends[$i]->col]->cx - $g->width / 2;

				if (sizeof($ends[$i]->prev) > 1 ||
					!$ends[$i]->row)
				{
					$dy += $ends[$i]->height;
					$g->y = $y0 + $rh[0] + ($this->verticalSpacing - $g->height) / 2;
				}
				else
				{
					$y = $y0 + (($ends[$i]->row == 2) ?
						$this->verticalSpacing + $rh[0] - $this->verticalEndpointShift :
						$this->verticalEndpointShift);
					$g->y = $y + ($rh[$ends[$i]->row - 1] - $g->height) / 2;
				}
			}
		}
		
		// Alings the labels on crossover edges between endpoints
		for ($i = 0; $i < sizeof($ends); $i++)
		{
			for ($j = 0; $j < sizeof($ends[$i]->cross); $j++)
			{
				$this->alignCrossoverLabels($ends[$i]->cross[$j], $j == 0);
			}
		}

		return $dy;
	}

	/**
	 * Function: layoutRow
	 * 
	 * Layouts the given row and returns the height of the row. The given array
	 * contains the maximum column widths.
	 */
	function &layoutRow(&$node, $x0, $y0, &$cx, $height, &$diagram)
	{
		$elbows = array();

		// Sets the location of the given node
		$node->geometry->x = $x0 + $cx[$node->col]->cx - $node->geometry->width / 2;
		$node->geometry->y = $y0 + ($height - $node->geometry->height) / 2;

		// Moves details to where title is if there is no title
		// and we are not in the first row
		if ($node->row > 1 && $node->firstLabelSize->height == 0 && $node->secondLabelSize->height > 0)
		{
			$this->flipDetails($node);
		}
		
		// Moves the devices recursively and spreads parallel
		// devices over the height of the row
		$next =& $node->next;
		
		if (sizeof($next) > 0)
		{
			$dy = $height / sizeof($next);		
			$tmpY = $y0;
			
			for ($i = 0; $i < sizeof($next); $i++)
			{
				if ($next[$i]->target->row == $node->row)
				{
					$tmpDy = max($next[$i]->target->height, $dy);
					$elbows = array_merge($elbows, $this->layoutRow(
						$next[$i]->target, $x0, $tmpY, $cx, $tmpDy, $diagram));
					$this->alignEdgeLabel($next[$i]);
					$tmpY += $tmpDy;
				}
					
				// Routes the outgoing edge if there are multiple
				// outgoing edges to the next column or if it's a
				// connection to a shared endpoint
				if (sizeof($next) > 1 || $next[$i]->target->row != $node->row)
				{
					$this->routeEdge($next[$i], $i, sizeof($next));
				}
			}
		}
		
		$this->routeDetours($node);
		$elbows = array_merge($elbows, $this->routeCrossovers($node));
		
		return $elbows;
	}

	/**
	 * Function: flipDetails
	 * 
	 * Put the title at the bottom and the details at the top.
	 */
	function flipDetails(&$node)
	{
		$model =& $this->graph->getModel();

		$lab =& $node->firstLabel;
		$geo =& $lab->geometry->copy();

		$geo->y = 1;
		$model->setGeometry($lab, $geo);
		$this->setVAlign(array($lab),  mxConstants::$ALIGN_TOP);

		$lab =& $node->secondLabel;
		$geo =& $lab->geometry->copy();

		$geo->y = 0;
		$model->setGeometry($lab, $geo);
		$this->setVAlign(array($lab), mxConstants::$ALIGN_BOTTOM);
	}
		
	/**
	 * Function: isOversizeLabel
	 * 
	 * Returns true if the label size is greater than 20 pixels, that is,
	 * likey to contain more than one line of text.
	 */
	function isOversizeLabel(&$edge)
	{
		return $edge->labelSize->height > 20;
	}

	/**
	 * Function: alignEdgeLabel
	 * 
	 * Aligns oversize labels on outgoing horizontal edges.
	 */
	function alignEdgeLabel(&$edge)
	{
		if ($this->isOversizeLabel($edge))
		{
			$this->setVAlign(array($edge->cell), mxConstants::$ALIGN_TOP);
			$dy = $edge->secondLabelSize->height;
			$dx = 0;
			
			// Includes the height of the left and right devices
			// if the main label is wider than the edge is long
			$g1 =& $edge->source->geometry;
			$g2 =& $edge->target->geometry;
			$dist = $g2->x - $g1->x - $g1->width;
 			
			if ($edge->labelSize->width > $dist)
			{
				$h1 = $g1->height / 2;
				$h2 = $g2->height / 2;
								
				if ($edge->source->secondLabel->geometry->y == 1 &&
					$edge->source->secondLabelSize->height > 0)
				{
					$h1 += $edge->source->secondLabelSize->height +
						$this->detailEdgeLabelSpacing;
				}
				
				if ($edge->target->secondLabel->geometry->y == 1 &&
					$edge->target->secondLabelSize->height > 0)
				{
					$h2 += $edge->target->secondLabelSize->height +
						$this->detailEdgeLabelSpacing; 	
				}
				
				$dy = max($dy, max($h1, $h2));
							
				// Shifts label to the left or right to make some
				// space for the next edge label in the row
				$width = $dist + $g1->width / 2 + $g2->width / 2;

				if ($edge->labelSize->width > $width)
				{
					// Checks if there is an oversize label to the left/right
					$left = sizeof($edge->source->prev) == 1 &&
						$this->isOversizeLabel($edge->source->prev[0]);
					$right = sizeof($edge->target->next) == 1 &&
						$this->isOversizeLabel($edge->target->next[0]);
					
					// Shifts only if one side of the label is free
					if ($left != $right)
					{
						$dx = ($width - $edge->labelSize->width) / 2 *
							(($left) ? -1 : 1);
					}
				}
			}

			$edge->geometry->offset->y = max($edge->geometry->offset->y, $dy);
			$edge->geometry->offset->x = $dx;
		}
	}

	/**
	 * Function: routeEdge
	 * 
	 * Routes the horizontal edge between the source and the target.
	 */
	function routeEdge(&$edge, $index, $count)
	{
		$g1 =& $edge->source->geometry;
		$g2 =& $edge->target->geometry;
		
		// Handles routing for multiple outgoing edges for a device
		$x = $g2->x - $this->horizontalRouteSpacing;
		$y1 = $g1->y + ($g1->height * ($index + 1) / ($count + 1));
		$y2 = ($y1 > $g2->y && $y1 < $g2->y + $g2->height) ? $y1 :
			$g2->y + $g2->height / 2;
		
		// Handles routing for incoming edges of a shared endpoint device
		$prev =& $edge->target->prev;
		
		if (sizeof($prev) > 1)
		{
			// Only routes edges if the devices have no common y-coordinate
			$top = max($g1->y, $g2->y);
			$bottom = min($g1->y + $g1->height, $g2->y + $g2->height);
			
			if ($bottom - $top > 3)
			{
				$y1 = $top + ($bottom - $top) / 2;
				$y2 = $y1;
			}
			else
			{
				$i = mxUtils::indexOf($prev, $edge);
				$y2 = $g2->y + ($g1->height * ($i + 1) / (sizeof($prev) + 1));
			}
		}
		
		$this->setPoint($edge, $x, $y1, true);
		$this->setPoint($edge, $x, $y2, false);
	}

	/**
	 * Function: routeDetours
	 * 
	 * Layouts the given row and returns the height of the row. The given array
	 * contains the maximum column widths.
	 */
	function routeDetours(&$node)
	{
		$offsetY = $this->verticalLabelSpacing * (($node->row == 1) ? -1 : 1);
		$edges =& $node->detour;
	
		for ($i = 0; $i < sizeof($edges); $i++)
		{
			$source = $edges[$i]->source === $node;
			$dist = ($edges[$i]->target->col - $edges[$i]->source->col) *
				(($source) ? 1 : -1);

			// Finds x-coordinate of control point
			$x = $this->getPerimeterX($node, 2 / (3 * $dist));

			// Finds y-coordinate of control point
			$dy = $this->maxDetourDistance - $this->minDetourDistance; 
			$g1 = $edges[$i]->source->geometry;
			$g2 = $edges[$i]->target->geometry;
			$y0 = 0;
			
			if ($node->row == 1)
			{
				$y0 = min($g1->y, $g2->y);
				$dy = - $this->maxDetourDistance + $dy / abs($dist);
			}
			else
			{
				$y0 = max($g1->y + $g1->height, $g2->y + $g2->height);
				$dy = $this->maxDetourDistance - $dy / abs($dist);
			}

			$this->setPoint($edges[$i], $x, $y0 + $dy, $source);
			$this->alignNodeLabelsForDetour($node, $x);
			
			// Places labels once for each detour
			if ($source)
			{
				$this->alignDetourLabels($edges[$i]);
			}

			$offsetY = $this->shiftDetourLabel($edges[$i], $dy, $source);
		}
	}

	/**
	 * Function: shiftDetourLabel
	 * 
	 * Shifts all labels of incoming and outgoing detours so that they do not
	 * overlap.
	 */
	function shiftDetourLabel(&$detour, $y0, $source)
	{
		$size = ($source) ? $detour->firstLabelSize : $detour->secondLabelSize;
		$cell = ($source) ? $detour->firstLabel : $detour->secondLabel;
		$dy = (($detour->source->row == 1) ? -$size->height + 2 : $size->height - 1);
		
		$cell->geometry->offset->y = $y0 - $dy;

		return $y0 + $dy;
	}

	/**
	 * Function: alignNodeLabelsForDetour
	 * 
	 * Moves title or details on the given node for a detour that enters or leaves
	 * the cell at the given x-coordinate.
	 */
	function alignNodeLabelsForDetour(&$node, $x)
	{
		$top = $node->row == 1;
		$cell = ($top == ($node->firstLabel->geometry->y == 0)) ?
			$node->firstLabel : $node->secondLabel;

		// LATER: Support left alignment as well
		$this->setAlign(array($cell), mxConstants::$ALIGN_RIGHT);
		
		$cell->geometry->offset->x = $node->geometry->width / 2 -
			max($cell->geometry->offset->x,
			$node->geometry->x + $node->geometry->width - $x +
			$this->horizontalEdgeLabelSpacing);
	}

	/**
	 * Function: alignDetourLabels
	 * 
	 * Aligns the labels of the given detour edge->
	 */
	function alignDetourLabels(&$detour)
	{
		$first =& $detour->firstLabel;
		$second =& $detour->secondLabel;
		
		// Sets the horizontal alignment
		if ($detour->source->col < $detour->target->col)
		{
			$this->setAlign(array($first), mxConstants::$ALIGN_LEFT);
			$this->setAlign(array($second), mxConstants::$ALIGN_RIGHT);
		}
		else
		{
			$this->setAlign(array(first), mxConstants::$ALIGN_RIGHT);
			$this->setAlign(array(second), mxConstants::$ALIGN_LEFT);
		}
		
		// Sets the vertical alignment
		$valign = ($detour->source->row == 1) ?
			mxConstants::$ALIGN_BOTTOM :
			mxConstants::$ALIGN_TOP;
		$this->setVAlign(array($detour->cell, $first, $second), $valign);
	}
	
	/**
	 * Function: compareCrossovers
	 * 
	 * Compares two given edges wrt to their terminals.
	 */
	function compareCrossovers($a, $b)
	{
		$colA = min($a->source->col, $a->target->col);
		$colB = min($b->source->col, $b->target->col);
		
		if ($colA == $colB)
		{
			$colA = max($a->source->col, $a->target->col);
			$colB = max($b->source->col, $b->target->col);				
		}
		
		// Ensures a deterministic order for the edges
		if ($colA == $colB)
		{
			$colA = $a->cell->id;
			$colB = $b->cell->id;
		}

	    return ($colA == $colB) ? 0 : ($colA > $colB) ? 1 : -1;
	}
	
	/**
	 * Function: routeCrossovers
	 * 
	 * Layouts the given row and returns the height of the row. The given array
	 * contains the maximum column widths.
	 */
	function routeCrossovers(&$node)
	{
		$elbows = array();
		$edges =& $node->cross;

		// Sorts by the smallest column of the terminals using
		// the compareCrossovers function from above
		usort($edges, array($this, "compareCrossovers"));
		
		for ($i = 0; $i < sizeof($edges); $i++)
		{
			$e =& $edges[$i];

			// Ignores connections from/to servers as they are processed later
			// in the layoutServers function
			if (!$e->target->server && !$e->source->server)
			{
				// Finds x-coordinate of control point
				$x = $this->getPerimeterX($node, $i / (sizeof($edges) + 1));
							
				// Finds y-coordinate of control point			
				$source = $e->source === $node;
				$g1 =& $e->source->geometry;
				$g2 =& $e->target->geometry;
				$y = $node->geometry->y;
	
				if ($node->row > 1)
				{
					$y -= $this->verticalControlPointDistance;
				}
				else
				{
					$y += $node->geometry->height +	$this->verticalControlPointDistance;
				}
	
				$this->setPoint($e, $x, $y, $source);
	
				// Places labels once for each crossover
				if ($source)
				{
					$this->alignCrossoverLabels($e, $i == 0);
				}
				
				if ($source &&
					$edges[$i]->source->col != $e->target->col)
				{
					array_push($elbows, $e);
				}
			}
		}

		return $elbows;
	}

	/**
	 * Function: getPerimeterX
	 * 
	 * Returns the horizontal perimeter coordinate->
	 */
	function getPerimeterX(&$node, $f)
	{
		$geo =& $node->geometry;
		$value = mxUtils::getNumber($node->style, mxConstants::$STYLE_ROUTING_CENTER_X);
		$dx = $geo->width / 2 - abs($value) * $geo->width;
		
		return $geo->x + $geo->width / 2 + $geo->width * $value + $dx * $f;
	}

	/**
	 * Function: alignCrossoverLabels
	 * 
	 * Aligns the labels of a crossover edge depending on whether its the first
	 * crossover of a single device->
	 */
	function alignCrossoverLabels(&$node, $first)
	{
		$l1 =& $node->firstLabel;
		$l2 =& $node->secondLabel;
		
		// Sets the horizontal alignment of the child labels and the
		// vertical alignment of the main label
		if ($first)
		{
			$this->setVAlign(array($node->cell), mxConstants::$ALIGN_BOTTOM);
			$this->setAlign(array($l1, $l2), mxConstants::$ALIGN_RIGHT);
		}
		else
		{
			$this->setVAlign(array($node->cell), mxConstants::$ALIGN_TOP);
			$this->setAlign(array($l1, $l2), mxConstants::$ALIGN_LEFT);
		}
		
		// Sets the vertical alignment of the first and second label
		$sourceRow = $node->source->row;
		
		if ($sourceRow == null)
		{
			$sourceRow = 1.5;
		}
		
		$targetRow = $node->target->row;
		
		if ($targetRow == null)
		{
			$targetRow = 1.5;
		}
		if ($sourceRow < $targetRow)
		{
			$this->setVAlign(array($l1), mxConstants::$ALIGN_TOP);
			$this->setVAlign(array($l2), mxConstants::$ALIGN_BOTTOM);
		}
		else
		{
			$this->setVAlign(array($l1), mxConstants::$ALIGN_BOTTOM);
			$this->setVAlign(array($l2), mxConstants::$ALIGN_TOP);
		}
		
		// Switches to vertical label orientation for straight crossovers
		if ($node->source->col == $node->target->col)
		{
			$this->graph->setCellStyles(mxConstants::$STYLE_HORIZONTAL,
				"0", array($node->cell));
		}
	}

	/**
	 * Function: arrangeRow
	 * 
	 * Arranges the given row and returns the height of the row-> The given array
	 * contains the maximum column widths->
	 */
	function arrangeRow(&$node, &$cx)
	{
		// Finds height of row after $this node recursively
		// and the minimum column number of all successors
		$height = 0;
		$minCol = 0;
		$next =& $node->next;

		for ($i = 0; $i < sizeof($next); $i++)
		{
			$tmp = max($next[$i]->height, $this->arrangeRow($next[$i]->target, $cx) +
				(($i > 0) ? $this->minDeviceSpacing : 0));
			
			// Ignores height if row changes during traversal
			if ($next[$i]->target->row == $node->row)
			{
				$height += $tmp;
			}
			
			$minCol = ($minCol == 0) ? $next[$i]->target->col : min($next[$i]->target->col, $minCol);
		}
			
		$height = max($this->getDetourHeight($node), max($node->height, $height));
		$this->balance($node, $minCol);
		$this->updateColumn($node, $cx);
		
		return $height;
	}
		
	/**
	 * Function: updateColumn
	 * 
	 * Updates the maximum column width and width of incoming edges->
	 */
	function updateColumn(&$node, &$cx)
	{
		if (!isset($cx[$node->col]))
		{
			$cx[$node->col] = new vsNetworkLayoutColumn();
		}
		
		$width = $cx[$node->col]->width || 0;
		$prev = $cx[$node->col]->prev || 0;
		
		$cx[$node->col]->width = max($node->geometry->width, $width);
		$cx[$node->col]->prev = max($this->getPreviousWidth($node), $prev);
	}
	
	/**
	 * Function: balance
	 * 
	 * Balances out the free horizontal space in row by using the crossover
	 * edges or moving the cells to the rightmost location in the row
	 */
	function balance(&$node, $maxCol)
	{
		if ($node->col > 0 && $node->col < $maxCol - 1)
		{
			$edges =& $node->cross;
			
			if (sizeof($edges) == 0)
			{
				$node->col = $maxCol - 1;
			}
			else
			{
				for ($i = 0; $i < sizeof($edges); $i++)
				{
					$edge =& $edges[$i];
					$col = max($edge->source->col, $edge->target->col);
					$node->col = max($node->col, min($maxCol, $col));
				}
			}
		}
	}

	/**
	 * Function: getDetourHeight
	 * 
	 * Finds the height of any possible detours the node may have->
	 */
	function getDetourHeight(vsNetworkLayoutNode &$node)
	{
		// For tuning we use the source height plus the maximum vertical space
		// required by the detour if there is any
		return (sizeof($node->detour) > 0) ? $node->height + 50 : 0;
	}
	
	/**
	 * Function: getColumnWidth
	 * 
	 * Finds the maximum width of all incoming edges
	 */
	function getPreviousWidth(&$node)
	{
		$prev = $node->prev;
		$maxWidth = 0;

		for ($i = 0; $i < sizeof($prev); $i++)
		{
			$minWidth =
				($prev[$i]->source->endpoint != $prev[$i]->target->endpoint) ?
				$this->minEndpointDistance : 0;
			$maxWidth = max($minWidth, max($prev[$i]->width, $maxWidth));
		}
		return $maxWidth;
	}

	/**
	 * Function: normalize
	 * 
	 * Finds the row with the most entries and moves all endpoints to the
	 * rightmost column
	 */
	function normalize(&$diagram)
	{
		$ends =& $diagram->ends;
		$servers =& $diagram->servers;
		$maxCol = 0;
		
		// Finds the maximum column number (rightmost column)
		for ($i = 0; $i < sizeof($ends); $i++)
		{
			$maxCol = max($maxCol, $ends[$i]->col);	
		}
		
		for ($i = 0; $i < sizeof($ends); $i++)
		{
			// Checks if the endpoint is in the last row
			if (sizeof($ends[$i]->next) == 0)
			{
				$ends[$i]->col = $maxCol;
			}
			
			// Else the endpoint is in the second last row
			else
			{
				$ends[$i]->col = $maxCol - 1;
			}
			
		}
		
		// Finds the maximum column number (rightmost column)
		for ($i = 0; $i < sizeof($servers); $i++)
		{
			$maxCol = max($maxCol, $servers[$i]->col);	
		}
		
		for ($i = 0; $i < sizeof($servers); $i++)
		{
			$servers[$i]->col = $maxCol;
		}
		
		return $maxCol;
	}

	/**
	 * Function: build
	 * 
	 * Creates and returns the <vsNetworkLayoutDiagram> for the layout.
	 */
	function build(&$roots)
	{
		$rootNodes = array();
		$ends = array();
		$servers = array();
		$dict = array();
		
		// Builds the datastructure required for the layout
		for ($i = 0; $i < sizeof($roots); $i++)
		{
			$rootNode = $this->lookup($roots[$i], $dict, $ends, $servers);
			$rootNode->col = 0;
			array_push($rootNodes, $rootNode);
			$this->crawl($rootNode, $dict, $ends, $servers);
		}
		
		// Ignores the endpoints if any servers have been found
		if (sizeof($servers) > 0)
		{
			$ends = array();
		}

		// Computes the total height of the server stack
		$serversHeight = 0;
		
		if ($servers != null)
		{
			for ($i = 0; $i < sizeof($servers); $i++)
			{
				$serversHeight += $servers[$i]->geometry->height + $this->serverVerticalSpacing;
			}
			
			$serversHeight -= $this->serverVerticalSpacing;
		}
		
		return new vsNetworkLayoutDiagram($rootNodes, $ends, $servers, $serversHeight);
	}
	
	/**
	 * Function: lookup
	 * 
	 * Looks up and returns the node for the given cell in the given dictionary
	 * or creates, stores and returns a new node if no node exists.
	 */
	function &lookup(&$cell, &$dict = null, &$ends = null, &$servers = null)
	{
		$id = mxCellPath::create($cell);
		$node =& $dict[$id];
		
		if ($node == null && $dict != null)
		{
			// Creates the node and puts it into the lookup table
			$node = $this->createNode($cell);
			$dict[$id] = $node;
			
			// Identifies elements that are part of the server-stack
			// at the end of the network
			if ($this->isServer($cell))
			{
				// Gives each server a row in the server stack
				array_push($servers, $node);
				$node->row = sizeof($servers);
				$node->server = true;				
			}
			
			// Finds endpoints and puts them into an array
			if ($node->endpoint)
			{
				array_push($ends, $node);
			}
		}
		
		return $node;
	}

	/**
	 * Function: crawl
	 * 
	 * Builds the datastructure for the layout algorithm recursively.
	 */
	function crawl(&$node, &$dict, &$ends, &$servers)
	{
		$model =& $this->graph->getModel();
		$edges =& $model->getEdges($node->cell);

		for ($i = 0; $i < sizeof($edges); $i++)
		{
			$edge =& $edges[$i];
			$source = $model->getTerminal($edge, true) === $node->cell;
			$other =& $model->getTerminal($edge, !$source);
			
			// Ignores loops and incoming edges
			if ($other !== $node->cell && $source)
			{
				$otherNode =& $this->lookup($other, $dict, $ends, $servers);
				$edgeNode =& $this->lookup($edge, $dict, $ends, $servers);

				$edgeNode->source =& $node;
				$edgeNode->target =& $otherNode;
				
				// Crossover
				if ($otherNode->row != $node->row && $otherNode->endpoint == $node->endpoint)
				{
					if ($otherNode->row != null || $otherNode->endpoint)
					{
						array_push($node->cross, $edgeNode);
						array_push($otherNode->cross, $edgeNode);
					}
					// Handles dialback connections to unidentified rows
					else
					{
						$this->dialbackEdge = $edgeNode;
					}
				}
				
				// Connection inside row or to shared endpoint
				else
				{
					// Horizontal connection or to shared endpoint
					if ($otherNode->col < $node->col || ($otherNode->endpoint &&
						$otherNode->endpoint != $node->endpoint))
					{
						if ($otherNode->row == 0 || !$otherNode->endpoint ||
							$otherNode->row == $node->row)
						{
							$otherNode->col = max($otherNode->col, $node->col + 1);
							array_push($node->next, $edgeNode);
							array_push($otherNode->prev, $edgeNode);
	
							$this->crawl($otherNode, $dict, $ends, $servers); // recurse
						}
						
						// Crossover to endpoint in other row
						else
						{
							array_push($node->cross, $edgeNode);
							array_push($otherNode->cross, $edgeNode);
						}
					}
					
					// Detoured connection inside same row
					else
					{
						array_push($node->detour, $edgeNode);
						array_push($otherNode->detour, $edgeNode);
					}
				}
			}
		}		
	}
	
	/**
	 * Function: setPoint
	 * 
	 * Returns the horizontal perimeter coordinate->
	 */
	function setPoint(&$node, $x, $y, $source)
	{
		if ($node->geometry->points == null)
		{
			$node->geometry->points = array();
		}
		
		$index = ($source) ? 0 : 1;
		$node->geometry->points[$index] = new mxPoint($x, $y);
	}
	
	/**
	 * Function: setAlign
	 * 
	 * Sets the horizontal alignment for the cell in the given wrapper node->
	 */
	function setAlign($cells, $align)
	{
		$this->graph->setCellStyles(mxConstants::$STYLE_ALIGN, $align, $cells);
	}
	
	/**
	 * Function: setAlign
	 * 
	 * Sets the horizontal alignment for the cell in the given wrapper node->
	 */
	function setVAlign($cells, $align)
	{
		$this->graph->setCellStyles(mxConstants::$STYLE_VERTICAL_ALIGN, $align, $cells);
	}

	/**
	 * Function: createNode
	 * 
	 * Creates a new <vsNetworkNode> for the given <mxCell>->
	 */
	function &createNode(&$cell)
	{
		$mainLabelEdgeWidth = false;
		
		$graph = $this->graph;
		$model = $graph->getModel();
		
		$node = new vsNetworkLayoutNode($cell, $this->getRow($cell));

		// Sets geometry and style field for node			
		$node->geometry =& $model->getGeometry($cell)->copy();
		$node->style =& $graph->getCellStyle($cell);

		// Sets first label size
		$node->firstLabel =& $model->getChildAt($cell, 0);
		$node->firstLabelSize = mxUtils::getSizeForString($graph->getLabel($node->firstLabel));
		
		// Resets the offset and clones the geometry
		$g = $node->firstLabel->geometry->copy();
		$g->offset = new mxPoint();
		$model->setGeometry($node->firstLabel, $g);
		
		// Sets second label size
		$node->secondLabel =& $model->getChildAt($cell, 1);
		$node->secondLabelSize = mxUtils::getSizeForString($graph->getLabel($node->secondLabel));
		
		// Resets the offset and clones the geometry
		$g = $node->secondLabel->geometry->copy();
		$g->offset = new mxPoint();
		$model->setGeometry($node->secondLabel, $g);
		
		// Computes total width
		$node->width = max($node->firstLabelSize->width, $node->secondLabelSize->width);
		
		// Computes total height of the labels
		$node->height = $node->firstLabelSize->height + $node->secondLabelSize->height;

		// Resets the offset in the geometry
		$node->geometry->offset = new mxPoint();

		// Adds specifics for vertices and edges
		if ($model->isVertex($cell))
		{
			$node->height += $node->geometry->height;
			$node->width = max($node->geometry->width, $node->width);
			$node->endpoint = $this->isEndpoint($cell);
			$node->geometry->x = 0;
			$node->geometry->y = 0;
		}
		else if ($model->isEdge($cell))
		{
			$node->labelSize = mxUtils::getSizeForString(
				$graph->getLabel($cell));
			$node->height += $node->labelSize->height;
			
			// Resets the points in the geometry
			$node->geometry->points = null;
			
			// Taking into account the main label for the edge width
			// is optional as it can greatly affect the result
			if ($mainLabelEdgeWidth)
			{
				$node->width = max($node->width, $node->labelSize->width);
			}
		}
		
		// Sets the geometry on the model and works with the
		// geometry in-place
		$model->setGeometry($cell, $node->geometry);
			
		return $node;
	}

}

/**
 * Class: vsNetworkLayoutDiagram
 */
class vsNetworkLayoutDiagram
{
	
	/**
	 * Variable: rows
	 */
	var $rows = null;
	
	/**
	 * Variable: ends
	 */
	var $ends = null;
	
	/**
	 * Variable: servers
	 */
	var $servers = null;
	 
	/**
	 * Variable: serversHeight
	 */
	var $serversHeight = 0;
	
	/**
	 * Variable: rowHeight
	 * 
	 * Contains the rowHeights after the layout phase.
	 */
	var $rowHeights;
	
	/**
	 * Constructor: vsNetworkLayoutDiagram
	 */
	 function vsNetworkLayoutDiagram(&$rows, &$ends, &$servers, $serversHeight)
	 {
		$this->rows = $rows;
		$this->ends = $ends;
		$this->servers = $servers;
		$this->serversHeight = $serversHeight;
	 }

}

/**
 * Class: vsNetworkLayoutNode
 */
class vsNetworkLayoutNode
{
	
	/**
	 * Variable: cell
	 */
	var $cell;

	/**
	 * Variable: row
	 */
	var $row;
	
	/**
	 * Variable: col
	 */
	var $col;
		
	/**
	 * Variable: prev
	 */
	var $prev = array();
	
	/**
	 * Variable: next
	 */
	var $next = array();
	
	/**
	 * Variable: detour
	 */
	var $detour = array();
		
	/**
	 * Variable: cross
	 */
	var $cross = array();
	
	/**
	 * Variable: source
	 */
	var $source = null;
	
	/**
	 * Variable: target
	 */
	var $target = null;
	
	/**
	 * Variable: endpoint
	 */
	var $endpoint = false;
	
	/**
	 * Variable: servers
	 */
	var $server = false;

	/**
	 * Constructor: vsNetworkLayoutNode
	 */
	function vsNetworkLayoutNode(&$cell, $row = 0, $col = -1)
	{
		$this->cell = $cell;
		$this->row = $row;
		$this->col = $col;
	}

}

/**
 * Class: vsNetworkLayoutColumn
 */
class vsNetworkLayoutColumn
{
	
	/**
	 * Variable: width
	 */
	 var $width = 0;
	
	/**
	 * Variable: prev
	 */
	 var $prev = 0;
	
	/**
	 * Variable: cx
	 */
	 var $cx = 0;

}

?>
