/**
 * $Id: vsPerimeter.js,v 1.1 2012/11/15 13:26:49 gaudenz Exp $
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: vsPerimeter
 * 
 * Custom perimeter for the VISA Network Editor.
 */
var vsPerimeter = {

	/**
	 * Function: LanPerimeter
	 * 
	 * Adds a new style for the carrier network, that is, edges to or
	 * from a cloud shape.
	 */
	LanPerimeter: function (bounds, terminalState, next, orthogonal)
	{
		var p = mxPerimeter.RectanglePerimeter(bounds, terminalState, next, orthogonal);

		// Moves the x-coordinate to the center of the lan
		p.x = bounds.x + bounds.width / 2;
		
		return p;
	}

}

mxStyleRegistry.putValue("lanPerimeter", vsPerimeter.LanPerimeter);
