/**
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: mxFastOrganicLayout
 * 
 * Fast organic layout algorithm. Use execute to execute this layout.
 */
{

	/**
	 * Constructor: mxCompactTreeLayout
	 * 
	 * Constructs a new fast organic layout for the specified graph.
	 */
	function mxEdgeLabelLayout(graph)
	{
		this.graph = graph;
	}

	/**
	 * Function: execute
	 * 
	 * Executes the fast organic layout.
	 */
	mxEdgeLabelLayout.prototype.execute = function(parent)
	{
		var edges = [];
		var model = this.graph.getModel();
		
		var childCount = model.getChildCount(parent);
		
		for (var i=0; i<childCount; i++)
		{
			var cell = model.getChildAt(parent, i);
			
			if (model.isEdge(cell) &&
				!this.isEdgeIgnored(cell))
			{
				var state = this.graph.view.getState(cell);
				
				if (state != null &&
					state.text != null)
				{
					edges.push(state);
				}
			}
		}
		
		// Sorts the array of edges by the y-coordinate of their label
		var comparator = function(a, b)
		{
			var ay = a.text.boundingBox.y;
			var ax = a.text.boundingBox.x;
			var ah = a.text.boundingBox.height;
			
			var by = b.text.boundingBox.y;
			var bh = b.text.boundingBox.height;
			var bx = b.text.boundingBox.x;
			
			if ((by > ay && by < ay + ah) ||
				(ay > by && ay < by + bh))
			{
				return (ax == bx) ? 0 : (ax > bx) ? 1 : -1;
			}
			
			return (ay == by) ? 0 : (ay > by) ? 1 : -1;
		}
		
		edges.sort(comparator);
		
		// Moved cell location back to top-left from center locations used in
		// algorithm
		model.beginUpdate();
		try
		{
			var last = null;

			for (var i = 0; i < edges.length; i++)
			{
				var state = edges[i];
				
				if (last != null)
				{
					var y = last.text.boundingBox.y;
					var h = last.text.boundingBox.height;
					var x = last.text.boundingBox.x;
					var w = last.text.boundingBox.width;
					
					var l = state.text.boundingBox.x;
					var r = l + state.text.boundingBox.width;
					
					if (y + h > state.text.boundingBox.y &&
						((l > x && l < x + w) ||
						(r > x && r < x + w)))
					{
						this.resolve(last, state);
					}
				}
				
				last = state;
			}
		}
		finally
		{
			model.endUpdate();
		}
	}

	/**
	 * Function: resolve
	 * 
	 * Returns a boolean indicating if the given <mxCell> is movable by the
	 * algorithm. This implementation returns true if the given cell is
	 * movable in the <graph>.
	 */
	mxEdgeLabelLayout.prototype.resolve = function(a, b)
	{
		var model = this.graph.getModel();
		var gb = model.getGeometry(b.cell).clone();
		
		var y = a.text.boundingBox.y;
		var h = a.text.boundingBox.height;
		
		var offset = gb.offset || new mxPoint();
		offset.y += y + h - b.text.boundingBox.y;
		
		gb.offset = offset; 
		model.setGeometry(b.cell, gb);
	}
	
	/**
	 * TODO: Super does no longer exist.
	 */
	mxEdgeLabelLayout.prototype.isVertexMovable = function(cell)
	{
		return this.graph.isLabelMovable(cell);
	}
	
	/**
	 * Function: isCellIgnored
	 * 
	 * Returns a boolean indicating if the given <mxCell> should be ignored by
	 * the algorithm. The default implementation returns false for all
	 * vertices.
	 */
	mxEdgeLabelLayout.prototype.isEdgeIgnored = function(cell)
	{
		return !this.graph.model.isEdge(cell);
	}

}
