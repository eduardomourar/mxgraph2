/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */
/**
 * Class: mxMovePreview
 * 
 * Implements a live preview for moving cells.
 * 
 * Open Issues:
 * 
 * Detecting cell at mouse location without using getCellAt. Problem is that
 * the preview is on top of existing cells so hit detection does no longer work
 * in the DOM.
 * 
 * Constructor: mxMovePreview
 * 
 * Constructs a move preview for the given graph.
 * 
 * Parameters:
 * 
 * graph - Reference to the enclosing <mxGraph>.
 */
function mxMovePreview(graph)
{
	this.graph = graph;
};

/**
 * Variable: graph
 * 
 * Reference to the enclosing <mxGraph>.
 */
mxMovePreview.prototype.graph = null;

/**
 * Variable: layout
 * 
 * Reference to the interactive layout. Not yet implemented.
 */
mxMovePreview.prototype.layout = null;

/**
 * Variable: startState
 * 
 * Reference to the initial <mxCellState>.
 */
mxMovePreview.prototype.startState = null;

/**
 * Variable: previewStates
 * 
 * Holds the array of <mxCellStates> that make up the preview.
 */
mxMovePreview.prototype.previewStates = null;

/**
 * Variable: threshold
 * 
 * Defines the maximum number of cells to preview. Default is 200.
 */
mxMovePreview.prototype.threshold = 20;

/**
 * Variable: placeholder
 * 
 * Holds the <mxShape> that acts as a visual placeholder for previews.
 */
mxMovePreview.prototype.placeholder = null;

/**
 * Function: isActive
 * 
 * Returns true if the preview is active.
 */
mxMovePreview.prototype.isActive = function()
{
	return this.startState != null;
};

/**
 * Function: getPreviewStates
 * 
 * Returns the states that are affected by the move operation.
 */
mxMovePreview.prototype.getPreviewStates = function(initialState)
{
	var result = [];
	var model = this.graph.getModel();
	var cells = this.graph.getSelectionCells();
	
	if (cells.length < this.threshold)
	{
		for (var i = 0; i < cells.length; i++)
		{
			var state = this.graph.view.getState(cells[i]);
			
			if (state != null)
			{
				result.push(state);
				
				var edgeCount = model.getEdgeCount(cells[i]);
				
				for (var j = 0; j < edgeCount; j++)
				{
					var state2 = this.graph.view.getState(model.getEdgeAt(cells[i], j));
				
					if (state2 != null)
					{
						result.push(state2);
					}
					
					if (result.length > this.threshold)
					{
						return null;
					}
				}
			}
		}
	}
	
	return result;
};

/**
 * Function: isStateOpaque
 * 
 * Returns true if the given state preview should be opaque.
 */
mxMovePreview.prototype.isStateOpaque = function(state)
{
	return state == this.startState;
};

/**
 * Function: start
 * 
 * Starts the preview.
 */
mxMovePreview.prototype.start = function(e, state)
{
	this.startState = state;
	this.previewStates = this.getPreviewStates(state);
	
	if (this.previewStates == null ||
		this.previewStates.length >= this.threshold)
	{
		this.placeholder = null; // TODO: Create placeholder
	}
	
	if (this.layout != null)
	{
		this.layout.start(e, startState);
	}
};

/**
 * Function: update
 * 
 * Updates the preview.
 */
mxMovePreview.prototype.update = function(e, dx, dy)
{
	var alpha = 1;
	
	// Temporary transparency
	if (dx != 0 ||
		dy != 0)
	{
		//alpha = this.graph.PreviewAlpha;
	}

	if (this.placeholder != null)
	{
		// TODO: Move placeholder
	}
	else if (this.previewStates != null)
	{
		var step = null; 
		
		if (this.layout != null)
		{
			step = this.layout.update(e, this.startState, dx, dy);
		}
		
		if (step == null)
		{
			step = new mxCellStatePreview(this.graph);
		}
		
		// Combines the layout result with the move preview
		for (var i = 0; i < this.previewStates.length; i++)
		{
			step.moveState(this.previewStates[i], dx, dy, false, false);
		}

		step.show(mxUtils.bind(this, function(state)
		{
			// Sets the transparency on all cells which are not under the mouse
			if (!this.isStateOpaque(state))
			{
				//state.Alpha = alpha;
			}
		}));
	}

	// TODO: Hide all cell handlers
	//graph.selectionCellsHandler.visible = false;
};

/**
 * Function: stop
 * 
 * Stops the preview.
 */
mxMovePreview.prototype.stop = function(commit, e, dx, dy)
{
	if (this.placeholder != null)
	{
		this.placeholder = null; // TODO: Remove placeholder
	}
	
	this.update(e, 0, 0);
	
	// TODO: Show all cell handlers
	//graph.selectionCellsHandler.visible = true;
		
	this.graph.getModel().beginUpdate();
	try
	{			
		if (commit &&
			(dx != 0 ||
			dy != 0))
		{
			var scale = this.graph.view.scale;
			var cells = this.graph.getSelectionCells();

			this.graph.moveCells(cells, dx / scale, dy / scale, false, null, e.Event);
		}

		if (this.layout != null)
		{
			this.layout.stop(commit, e, startState, dx, dy);
		}
	}
	finally
	{
		this.graph.getModel().endUpdate();
	}	

	this.previewStates = null;
	this.startState = null;
};
