/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */
/**
 * Class: mxBpmnShape
 *
 * Extends <mxShape> to implement an cylinder shape. If a
 * custom shape with one filled area and an overlay path is
 * needed, then this shape's <redrawPath> should be overridden.
 * This shape is registered under <mxConstants.SHAPE_CYLINDER>
 * in <mxCellRenderer>.
 * 
 * Constructor: mxBpmnShape
 *
 * Constructs a new cylinder shape.
 * 
 * Parameters:
 * 
 * bounds - <mxRectangle> that defines the bounds. This is stored in
 * <mxShape.bounds>.
 * fill - String that defines the fill color. This is stored in <fill>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
function mxBpmnShape(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxUtils.extend(mxBpmnShape, mxShape);

/**
 * Function: paintVertexShape
 * 
 * Paints the vertex shape.
 */
mxBpmnShape.prototype.paintVertexShape = function(c, x, y, w, h)
{
	this.redrawPath(c, x, y, w, h, 'background');
	c.setShadow(false);
	this.redrawPath(c, x, y, w, h, 'outline');
	this.redrawPath(c, x, y, w, h, 'symbol');
};

/**
 * Function: redrawPath
 *
 * Draws the path for this shape.
 */
mxBpmnShape.prototype.redrawPath = function(c, x, y, w, h, layer)
{
	if (layer == 'background')
	{
		c.translate(x, y);
		var f = this.backgrounds['rhombus'];
		
		if (f != null)
		{
			f.call(this, c, x, y, w, h, layer);
		}
	}
	else if (layer == 'outline')
	{
		c.translate(w / 4, h / 4);
		h /= 2;
		w /= 2;
		
		var o = mxUtils.getValue(this.style, 'outline', 'standard');
		
		if (o != null)
		{
			var f = this.outlines[o];
			
			if (f != null)
			{
				f.call(this, c, x, y, w, h, layer);
			}
		}
	}
	else if (layer == 'symbol')
	{
		c.translate(w * 1 / 8, h * 1 / 8);
		h /= 4;
		w /= 4;
		
		var s = mxUtils.getValue(this.style, 'symbol', null);
		
		if (s != null)
		{
			var f = this.symbols[s];
			
			if (f != null)
			{
				f.call(this, c, x, y, w, h, layer);
			}
		}
	}
};

// Contains all possible backgrounds
mxBpmnShape.prototype.backgrounds = {
	'rhombus': function(c, x, y, w, h)
	{
		c.begin();
		c.moveTo(w / 2, 0);
		c.lineTo(w, h / 2);
		c.lineTo(w / 2, h);
		c.lineTo(0, h / 2);
		c.close();
		c.fillAndStroke();
	}
};

//Contains all possible outlines
mxBpmnShape.prototype.outlines = {
	'standard': function(c, x, y, w, h)
	{
		c.begin();
		c.moveTo(0, 0);
		c.lineTo(w, 0);
		c.lineTo(w, h);
		c.lineTo(0, h);
		c.close();
		c.fillAndStroke();
	},
	'throwing': function(c, x, y, w, h)
	{
		c.begin();
		c.moveTo(0, 0);
		c.lineTo(w, 0);
		c.lineTo(w, h);
		c.lineTo(0, h);
		c.close();
		c.fillAndStroke();
		
		var inset = 2;
		c.begin();
		c.moveTo(inset, inset);
		c.lineTo(w - inset, inset);
		c.lineTo(w - inset, h - inset);
		c.lineTo(inset, h - inset);
		c.close();
		c.stroke();
	}
};

//Contains all possible symbols
mxBpmnShape.prototype.symbols = {
	'message': function(c, x, y, w, h)
	{
		c.begin();
		c.moveTo(0, 0);
		c.lineTo(w, 0);
		c.lineTo(w, h);
		c.lineTo(0, h);
		c.close();
		c.fillAndStroke();
		
		c.begin();
		c.moveTo(0, 0);
		c.lineTo(w / 2, h / 2);
		c.lineTo(w, 0);
		c.stroke();
	}
};

mxCellRenderer.registerShape('bpmnShape', mxBpmnShape);
