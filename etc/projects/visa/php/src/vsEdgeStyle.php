<?php
/**
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: vsNetworkLayout
 * 
 * Implements a custom layout for the VISA Network Editor.
 */

/**
 * Class: vsCarrierNetwork
 * 
 * Implements a the edge style for carrier networks.
 */
class vsCarrierNetwork implements mxEdgeStyleFunction
{

	/**
	 * 
	 */
	public function apply($state, $source, $target, $points, &$result)
	{
		$view = $state->view;
		$pt = $result[0];
	
		if (!isset($source))
		{
			$tmp = $state->absolutePoints[0];
			$source = new mxCellState();
			$source->x = $tmp->x;
			$source->y = $tmp->y;
		}
		
		if (!isset($target))
		{
			$pts =& $state->absolutePoints;
			$tmp = $pts[sizeof($pts)-1];
			$target = new mxCellState();
			$target->x = $tmp->x;
			$target->y = $tmp->y;
		}
		
		$l = max($source->x, $target->x);
		$r = min($source->x + $source->width,
						 $target->x + $target->width);
	
		$t = max($source->y, $target->y);
		$b = min($source->y + $source->height,
						 $target->y + $target->height);
	
		$dx = ($target->x == $l) ? 10 : -10;
		$dy = ($target->y == $t) ? 10 : -10;
	
		if ($r < $l)
		{
			$x = floor($r + ($l - $r) / 2);
			
			$y1 = floor($view->getRoutingCenterY($source));
			$y2 = floor($view->getRoutingCenterY($target));
			
			$midY = ($y1 + $y2) / 2;
			
			array_push($result, new mxPoint($x - $dx, $y1)); // isRouted: true
			array_push($result, new mxPoint($x - $dx, $midY + $dy)); // isRouted: true
			array_push($result, new mxPoint($x, $midY + $dy)); // isRouted: true
			array_push($result, new mxPoint($x, $midY - $dy)); // isRouted: true
			array_push($result, new mxPoint($x + $dx, $midY - $dy)); // isRouted: true
			array_push($result, new mxPoint($x + $dx, $y2)); // isRouted: true
		}
	}
}

class vsEdgeStyle
{

	/**
	 * Variable: CarrierNetwork
	 *
	 * Provides a carrier network style for edges.
	 */
	public static $CarrierNetwork;

}


// Instanciates the declared static members of the above class
vsEdgeStyle::$CarrierNetwork = new vsCarrierNetwork();

mxStyleRegistry::putValue("carrierNetwork", vsEdgeStyle::$CarrierNetwork);
?>
