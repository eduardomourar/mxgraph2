/**
 * $Id: vsEdgeStyle.js,v 1.1 2012/11/15 13:26:49 gaudenz Exp $
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: vsEdgeStyle
 * 
 * Custom edge styles for the VISA Network Editor.
 */
var vsEdgeStyle = {

	/**
	 * Function: CarrierNetwork
	 * 
	 * Adds a new style for the carrier network, that is, edges to or
	 * from a cloud shape.
	 */
	CarrierNetwork: function (state, source, target, points, result)
	{
		var view = state.view;
		var pt = result[0];
	
		if (source == null)
		{
			var tmp = state.absolutePoints[0];
			source = new mxCellState();
			source.x = tmp.x;
			source.y = tmp.y;
		}
		
		if (target == null)
		{
			var pts = state.absolutePoints;
			var tmp = pts[pts.length-1];
			target = new mxCellState();
			target.x = tmp.x;
			target.y = tmp.y;
		}
		
		var l = Math.max(source.x, target.x);
		var r = Math.min(source.x + source.width,
						 target.x + target.width);
	
		var t = Math.max(source.y, target.y);
		var b = Math.min(source.y + source.height,
						 target.y + target.height);
	
		var dx = (target.x == l) ? 10 : -10;
		var dy = (target.y == t) ? 10 : -10;
	
		if (r < l)
		{
			var x = Math.floor(r + (l - r) / 2);
			
			var y1 = Math.floor(view.getRoutingCenterY(source));
			var y2 = Math.floor(view.getRoutingCenterY(target));
			
			var midY = (y1 + y2) / 2;
			
			result.push({x: x-dx, y: y1, isRouted: true});
			result.push({x: x-dx, y: midY+dy, isRouted: true});
			result.push({x: x, y: midY+dy, isRouted: true});
			result.push({x: x, y: midY-dy, isRouted: true});
			result.push({x: x+dx, y: midY-dy, isRouted: true});
			result.push({x: x+dx, y: y2, isRouted: true});
		}
	}

}

mxStyleRegistry.putValue("carrierNetwork", vsEdgeStyle.CarrierNetwork);
