/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */
/**
 * Class: mxArrow
 *
 * Extends <mxShape> to implement an arrow shape. (The shape
 * is used to represent edges, not vertices.)
 * This shape is registered under <mxConstants.SHAPE_ARROW>
 * in <mxCellRenderer>.
 * 
 * Constructor: mxArrow
 *
 * Constructs a new arrow shape.
 * 
 * Parameters:
 * 
 * points - Array of <mxPoints> that define the points. This is stored in
 * <mxShape.points>.
 * fill - String that defines the fill color. This is stored in <fill>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 * arrowWidth - Optional integer that defines the arrow width. Default is
 * <mxConstants.ARROW_WIDTH>. This is stored in <arrowWidth>.
 * spacing - Optional integer that defines the spacing between the arrow shape
 * and its endpoints. Default is <mxConstants.ARROW_SPACING>. This is stored in
 * <spacing>.
 * endSize - Optional integer that defines the size of the arrowhead. Default
 * is <mxConstants.ARROW_SIZE>. This is stored in <endSize>.
 */
function mxArrow(points, fill, stroke, strokewidth, arrowWidth, spacing, endSize)
{
	mxShape.call(this);
	this.points = points;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.arrowWidth = (arrowWidth != null) ? arrowWidth : mxConstants.ARROW_WIDTH;
	this.spacing = (spacing != null) ? spacing : mxConstants.ARROW_SPACING;
	this.endSize = (endSize != null) ? endSize : mxConstants.ARROW_SIZE;
};

/**
 * Extends mxShape.
 */
mxUtils.extend(mxArrow, mxShape);

/**
 * Function: paintEdgeShape
 * 
 * Paints the line shape.
 */
mxArrow.prototype.paintEdgeShape = function(c, pts)
{
	// Geometry of arrow
	var width = mxConstants.ARROW_WIDTH;

	var edgeWidth = this.getEdgeWidth();
	var openEnded = this.isOpenEnded();
	var markerStart = this.isMarkerStart();
	var markerEnd = this.isMarkerEnd();
	this.widthArrowRatio = edgeWidth / width;

	// Base vector (between first points)
	var pe = pts[pts.length - 1];
	var dx = pts[1].x - pts[0].x;
	var dy = pts[1].y - pts[0].y;
	var dist = Math.sqrt(dx * dx + dy * dy);
	
	// Computes the norm and the inverse norm
	var nx = dx / dist;
	var nx2, nx1 = nx;
	var ny = dy / dist;
	var ny2, ny1 = ny;
	var orthx = edgeWidth * ny;
	var orthy = -edgeWidth * nx;
	
	// Stores the inbound points in reverse order in a 
	var inPts = '';
	c.setMiterLimit(1.42);
	c.begin();

	var startNx = nx;
	var startNy = ny;

	if (markerStart && !openEnded)
	{
		this.paintMarker(c, pts[0].x, pts[0].y, nx, ny, this.startSize, true);
	}
	else
	{
		var outStartX = pts[0].x + orthx / 2 + this.spacing * nx;
		var outStartY = pts[0].y + orthy / 2 + this.spacing * ny;
		var inEndX = pts[0].x - orthx / 2 + this.spacing * nx;
		var inEndY = pts[0].y - orthy / 2 + this.spacing * ny;
		
		if (openEnded)
		{
			c.moveTo(outStartX, outStartY);
			inPts += inEndY + ',' + inEndX + ',' + 'L,' + ',';
		}
		else
		{
			c.moveTo(inEndX, inEndY);
			c.lineTo(outStartX, outStartY);
		}
	}
	
	var dx1 = 0;
	var dy1 = 0;
	var dist1 = 0;
	var outX = 0;
	var outY = 0;
	for (var i = 0; i < pts.length - 2; i++)
	{
		// Work out in which direction the line is bending
		var pos = mxUtils.relativeCcw(pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y, pts[i+2].x, pts[i+2].y);

		dx1 = pts[i+2].x - pts[i+1].x;
		dy1 = pts[i+2].y - pts[i+1].y;
		
		dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
		nx1 = dx1 / dist1;
		ny1 = dy1 / dist1;
		
		var tmp1 = nx * nx1 + ny * ny1;
		tmp = Math.sqrt((tmp1 + 1) / 2);
		
		// Work out the normal orthogonal to the line through the control point and the edge sides intersection
		nx2 = (nx + nx1) / 2;
		ny2 = (ny + ny1) / 2;
		var dist2 = Math.sqrt(nx2 * nx2 + ny2 * ny2);
		nx2 = nx2 / dist2;
		ny2 = ny2 / dist2;
		
		outX = pts[i+1].x + ny2 * edgeWidth / 2 / tmp;
		outY = pts[i+1].y - nx2 * edgeWidth / 2 / tmp
		var inX = pts[i+1].x - ny2 * edgeWidth / 2 / tmp
		var inY = pts[i+1].y + nx2 * edgeWidth / 2 / tmp
		
		// Round every bend > 90 degrees
		var rounded = tmp1 < 0 ? true : this.isRounded;
		
		if (pos == 0 || !this.isRounded)
		{
			// If the two segments are aligned, or if we're not drawing curved sections between segments
			// just draw straight to the intersection point
			c.lineTo(outX, outY);
			inPts += inY + ',' + inX + ',' + 'L,' + ',';
		}
		else if (pos == -1)
		{
			var c1x = inX + ny * edgeWidth;
			var c1y = inY - nx * edgeWidth;
			var c2x = inX + ny1 * edgeWidth;
			var c2y = inY - nx1 * edgeWidth;
			c.lineTo(c1x, c1y);
			c.quadTo(outX, outY, c2x, c2y);
			inPts += inY + ',' + inX + ',' + 'L,' + ',';
		}
		else
		{
			c.lineTo(outX, outY);
			var c1x = outX - ny * edgeWidth;
			var c1y = outY + nx * edgeWidth;
			var c2x = outX - ny1 * edgeWidth;
			var c2y = outY + nx1 * edgeWidth;
			inPts += c1y + ',' + c1x + ',' + inY + ',' + inX + ',' + 'Q,' + ',';
			inPts += c2y + ',' + c2x + ',' + 'L,' + ',';
		}
		
		nx = nx1;
		ny = ny1;
	}
	
	orthx = edgeWidth * ny1;
	orthy = - edgeWidth * nx1;

	if (markerEnd && !openEnded)
	{
		this.paintMarker(c, pe.x, pe.y, -nx, -ny, this.endSize, false);
	}
	else
	{
		c.lineTo(pe.x - this.spacing * nx1 + orthx / 2, pe.y - this.spacing * ny1 + orthy / 2);
		
		var inStartX = pe.x - this.spacing * nx1 - orthx / 2;
		var inStartY = pe.y - this.spacing * ny1 - orthy / 2;

		if (!openEnded)
		{
			c.lineTo(inStartX, inStartY);
		}
		else
		{
			c.moveTo(inStartX, inStartY);
			inPts = inStartY + ',' + inStartX + ',' + 'M,' + ',' + inPts;
		}
	}
	
	var path = inPts.split(',');

	for (var i = path.length - 2; i >= 0; i--)
	{
		if (path[i] == 'L')
		{
			c.lineTo(parseFloat(path[i-1]), parseFloat(path[i-2]));
			i -= 3;
		}
		else if (path[i] == 'M')
		{
			c.moveTo(parseFloat(path[i-1]), parseFloat(path[i-2]));
			i -= 3;
		}
		else if (path[i] == 'Q')
		{
			c.quadTo(parseFloat(path[i-1]), parseFloat(path[i-2]), parseFloat(path[i-3]), parseFloat(path[i-4]));
			i -= 5;
		}
	}

	if (openEnded)
	{
		c.end();
		c.stroke();
	}
	else
	{
		c.close();
		c.fillAndStroke();
	}
	
	// Need to redraw the markers without the low miter limit
	c.setMiterLimit(4);

	if (markerStart && !openEnded)
	{
		c.begin();
		this.paintMarker(c, pts[0].x, pts[0].y, startNx, startNy, this.startSize, true);
		c.stroke();
		c.end();
	}
	
	if (markerEnd && !openEnded)
	{
		c.begin();
		this.paintMarker(c, pe.x, pe.y, -nx, -ny, this.endSize, true);
		c.stroke();
		c.end();
	}
};

/**
 * Function: paintEdgeShape
 * 
 * Paints the line shape.
 */
mxArrow.prototype.paintMarker = function(c, ptX, ptY, nx, ny, size, initialMove)
{
	
	var edgeWidth = this.getEdgeWidth();
	var orthx = edgeWidth * ny;
	var orthy = -edgeWidth * nx;

	var spaceX = (this.spacing + this.endSize) * nx;
	var spaceY = (this.spacing + this.endSize) * ny;

	if (initialMove)
	{
		c.moveTo(ptX - orthx / 2 + spaceX, ptY - orthy / 2 + spaceY);
	}
	else
	{
		c.lineTo(ptX - orthx / 2 + spaceX, ptY - orthy / 2 + spaceY);
	}

	c.lineTo(ptX - orthx / 2 / this.widthArrowRatio + spaceX, ptY - orthy / 2 / this.widthArrowRatio + spaceY);
	c.lineTo(ptX + this.spacing * nx, ptY + this.spacing * ny);
	c.lineTo(ptX + orthx / 2 / this.widthArrowRatio + spaceX, ptY + orthy / 2 / this.widthArrowRatio + spaceY);
	c.lineTo(ptX + orthx / 2 + spaceX, ptY + orthy / 2 + spaceY);
}

/**
 * Function: getEdgeWidth
 * 
 * Returns the width of the body of the edge
 */
mxArrow.prototype.getEdgeWidth = function()
{
	return mxConstants.ARROW_WIDTH * 1/3;
};

/**
 * Function: isOpenEnded
 * 
 * Returns whether the ends of the shape are drawn
 */
mxArrow.prototype.isOpenEnded = function()
{
	return false;
};

/**
 * Function: isMarkerStart
 * 
 * Returns whether the start marker is drawn
 */
mxArrow.prototype.isMarkerStart = function()
{
	return true;
};

/**
 * Function: isMarkerEnd
 * 
 * Returns whether the end marker is drawn
 */
mxArrow.prototype.isMarkerEnd = function()
{
	return true;
};