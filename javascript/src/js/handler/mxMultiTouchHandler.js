/**
 * $Id: mxPanningHandler.js,v 1.9 2013/10/28 08:45:07 gaudenz Exp $
 * Copyright (c) 2006-2013, JGraph Ltd
 */
/**
 * Class: mxMultiTouchHandler
 * 
 * Event handlers for multi touch gestures such as pinch to zoom.
 * 
 * Constructor: mxMultiTouchHandler
 * 
 * Constructs an event handler that handles multi touch events.
 */
function mxMultiTouchHandler(graph)
{
	if (graph != null)
	{
		this.graph = graph;
		this.graph.addMouseListener(this);
	}
};

/**
 * Extends mxEventSource.
 */
mxMultiTouchHandler.prototype = new mxEventSource();
mxMultiTouchHandler.prototype.constructor = mxMultiTouchHandler;

/**
 * Variable: graph
 * 
 * Reference to the enclosing <mxGraph>.
 */
mxMultiTouchHandler.prototype.graph = null;

/**
 * Variable: enabled
 * 
 * Specifies if this event handler is enabled. Default is true.
 */
mxMultiTouchHandler.prototype.enabled = true;

/**
 * Function: isEnabled
 * 
 * Returns <enabled>.
 */
mxMultiTouchHandler.prototype.isEnabled = function()
{
	return this.enabled;
};

/**
 * Function: setEnabled
 * 
 * Sets <enabled>.
 */
mxMultiTouchHandler.prototype.setEnabled = function(value)
{
	this.enabled = value;
};

/**
 * Function: isMultiTouchTrigger
 * 
 * Returns true if the given event is a multi touch trigger.
 */
mxMultiTouchHandler.prototype.isMultiTouchTrigger = function(me)
{
	return mxEvent.isMultiTouchEvent(me.getEvent());
};

/**
 * Function: mouseDown
 * 
 * Handles the event by initiating the panning. By consuming the event all
 * subsequent events of the gesture are redirected to this handler.
 */
mxMultiTouchHandler.prototype.mouseDown = function(sender, me)
{
	if (!me.isConsumed() && this.isEnabled() && this.initialScale == null && this.isMultiTouchTrigger(me))
	{
		this.initialScale = this.graph.view.scale;
		me.consume();
	}
};

/**
 * Function: mouseMove
 * 
 * Handles the event by updating the panning on the graph.
 */
mxMultiTouchHandler.prototype.mouseMove = function(sender, me)
{
	if (this.initialScale != null)
	{
		this.graph.zoomTo(this.initialScale * me.getEvent().scale);
		me.consume();
	}
};

/**
 * Function: mouseUp
 * 
 * Handles the event by setting the translation on the view or showing the
 * popupmenu.
 */
mxMultiTouchHandler.prototype.mouseUp = function(sender, me)
{
	this.mouseMove(sender, me);
	this.initialScale = null;
};
