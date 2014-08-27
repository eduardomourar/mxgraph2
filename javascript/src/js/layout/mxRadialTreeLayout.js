/**
 * $Id: mxRadialTreeLayout.js$
 * Copyright (c) 2006-2014, JGraph Ltd
 */
/**
 * Class: mxRadialTreeLayout
 * 
 * Extends <mxGraphLayout> to implement a radial tree algorithm. This
 * layout is suitable for graphs that have no cycles (trees). Vertices that are
 * not connected to the tree will be ignored by this layout.
 * 
 * Example:
 * 
 * (code)
 * var layout = new mxRadialTreeLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * (end)
 * 
 * Constructor: mxRadialTreeLayout
 * 
 * Constructs a new radial tree layout for the specified graph
 */
function mxRadialTreeLayout(graph)
{
	mxCompactTreeLayout.call(this, graph , false);
};

/**
 * Extends mxGraphLayout.
 */
mxUtils.extend(mxRadialTreeLayout, mxCompactTreeLayout);

/**
 * Variable: angleOffset
 *
 * The initial offset to compute the angle position.
 */
mxRadialTreeLayout.prototype.angleOffset = 0.5;

/**
 * Variable: rootx
 *
 * The X co-ordinate of the root cell
 */
mxRadialTreeLayout.prototype.rootx = 0;

/**
 * Variable: rooty
 *
 * The Y co-ordinate of the root cell
 */
mxRadialTreeLayout.prototype.rooty = 0;

/**
 * Variable: levelDistance
 *
 * Holds the levelDistance. Default is 10.
 */
mxRadialTreeLayout.prototype.levelDistance = 10;

/**
 * Variable: nodeDistance
 *
 * Holds the nodeDistance. Default is 20.
 */
mxRadialTreeLayout.prototype.nodeDistance = 20;

/**
 * Variable: autoRadius
 * 
 * Specifies if the radios should be computed automatically
 */
mxRadialTreeLayout.prototype.autoRadius = false;

/**
 * Variable: minradiusx
 * 
 * The minimum radius of each level in x axis
 */
mxRadialTreeLayout.prototype.minradiusx = 80;

/**
 * Variable: minradiusy
 * 
 * The minimum radius of each level in y axis
 */
mxRadialTreeLayout.prototype.minradiusy = 80;

/**
 * Variable: maxradiusy
 * 
 * The maximum radius of each level in x axis
 */
mxRadialTreeLayout.prototype.maxradiusx = 1000;

/**
 * Variable: maxradiusy
 * 
 * The maximum radius of each level in y axis
 */
mxRadialTreeLayout.prototype.maxradiusy = 1000;

/**
 * Variable: radiusx
 * 
 * x-axis radius of each circle
 */
mxRadialTreeLayout.prototype.radiusx = 150;

/**
 * Variable: radiusy
 * 
 * y-axis radius of each circle
 */
mxRadialTreeLayout.prototype.radiusy = 150;

/**
 * Variable: sortEdges
 * 
 * Specifies if edges should be sorted according to the order of their
 * opposite terminal cell in the model.
 */
mxRadialTreeLayout.prototype.sortEdges = false;

/**
 * Function: isVertexIgnored
 * 
 * Returns a boolean indicating if the given <mxCell> should be ignored as a
 * vertex. This returns true if the cell has no connections.
 * 
 * Parameters:
 * 
 * vertex - <mxCell> whose ignored state should be returned.
 */
mxRadialTreeLayout.prototype.isVertexIgnored = function(vertex)
{
	return mxGraphLayout.prototype.isVertexIgnored.apply(this, arguments) ||
		this.graph.getConnections(vertex).length == 0;
};

/**
 * Function: execute
 * 
 * Implements <mxGraphLayout.execute>.
 * 
 * If the parent has any connected edges, then it is used as the root of
 * the tree. Else, <mxGraph.findTreeRoots> will be used to find a suitable
 * root node within the set of children of the given parent.
 * 
 * Parameters:
 * 
 * parent - <mxCell> whose children should be laid out.
 * root - Optional <mxCell> that will be used as the root of the tree.
 */
mxRadialTreeLayout.prototype.execute = function(parent, root)
{
	this.parent = parent;
	
	this.useBoundingBox = false;
	this.edgeRouting = false;
	this.levelDistance = 120;
	this.nodeDistance = 10;

	mxCompactTreeLayout.prototype.execute.apply(this, arguments);
	
	var bounds = null;
	var rootBounds = this.getVertexBounds(this.root);
	this.centerX = rootBounds.x + rootBounds.width / 2;
	this.centerY = rootBounds.y + rootBounds.height / 2;

	// Calculate the bounds of the involved vertices directly from the values set in the compact tree
	for (var vertex in this.visited)
	{
		var vertexBounds = this.getVertexBounds(this.visited[vertex]);
		bounds = (bounds != null) ? bounds : vertexBounds.clone();
		bounds.add(vertexBounds);
	}
	
	// Place root's children proportionally around the first level
	var child = this.node.child;
	
	this.firstRowMinX = child != null ? this.getVertexBounds(child.cell).x : 0;
	this.firstRowMaxX = child != null ? this.getVertexBounds(child.cell).x + this.getVertexBounds(child.cell).width : 0;
	var row = [];

	while (child != null)
	{
		var cell = child.cell;
		var vertexBounds = this.getVertexBounds(cell);
		
		this.firstRowMinX = Math.min(vertexBounds.x, this.firstRowMinX);
		this.firstRowMaxX = Math.max(vertexBounds.x + vertexBounds.width, this.firstRowMaxX);
		
		this.firstRadius = vertexBounds.y - bounds.y;
		var xProportion = (vertexBounds.x - bounds.x) / bounds.width;
		var theta =  2 * Math.PI * xProportion;
		this.setVertexLocation(cell, this.centerX - vertexBounds.width / 2 + this.firstRadius * Math.cos(theta), this.centerY + this.firstRadius * Math.sin(theta));
		row.push(child);
		child = child.next;
	}

	this.layerN([this.node], this.firstRowMinX, this.firstRowMaxX);
};

mxRadialTreeLayout.prototype.layerN = function(prevRow, prevRowMinX, prevRowMaxX)
{
	var nextRowMinX = null;
	var nextRowMaxX = null;
	var thisRow = [];
	var radius = 0;
	
	if (prevRow != null && prevRow.length > 0 && prevRow[0] != null && prevRow[0].child != null)
	{
		radius = prevRow[0].child.y;

		for (var i = 0; i < prevRow.length; i++)
		{
			if (prevRow[i].child != null)
			{
				child = prevRow[i].child;
				
				while (child != null)
				{
					var cell = child.cell;
					var vertexBounds = this.getVertexBounds(cell);
					
					if (nextRowMinX == null)
					{
						nextRowMinX = vertexBounds.x;
						nextRowMaxX = vertexBounds.x + vertexBounds.width;
					}
					else
					{
						nextRowMinX = Math.min(vertexBounds.x, nextRowMinX);
						nextRowMaxX = Math.max(vertexBounds.x + vertexBounds.width, nextRowMaxX);
					}
	
					thisRow.push(child);
					child = child.next;
				}
			}
		}
	}
	else
	{
		return;
	}
	
//		radius = vertexBounds.y - bounds.y;
//		var xProportion = (vertexBounds.x - bounds.x) / bounds.width;
//		var theta =  2 * Math.PI * xProportion;
//		this.setVertexLocation(cell, centerX - vertexBounds.width / 2 + radius * Math.cos(theta), centerY + radius * Math.sin(theta));
//		prevRow.push(child);
//		child = child.next;
	
	var radiusProp = radius / this.firstRadius;
	var firstRowCenterX = (this.firstRowMinX + this.firstRowMaxX)  / 2;
	var firstRowNormalVector = (this.firstRowMaxX - this.firstRowMinX) / 2;
	var newRowMinX = firstRowCenterX - firstRowNormalVector * radiusProp;
	var newRowMaxX = firstRowCenterX + firstRowNormalVector * radiusProp;
	
	var prevRowWidth = prevRowMaxX - prevRowMinX;
	var prevRowCenter = prevRowMinX + prevRowWidth / 2;
	
	for (var i = 0; i < prevRow.length; i++)
	{
		var parent = prevRow[i];
		var nodeCen = parent.x + parent.width / 2;
		var prevRowRadius = parent.y;
		var nodeOffset = nodeCen - prevRowCenter;
		var childrenOffset  = nodeOffset * radiusProp;
		var rowOffset = nodeOffset - childrenOffset;
		
		if (prevRow[i].child != null)
		{
			child = prevRow[i].child;
			
			while (child != null)
			{
				var cell = child.cell;
				var vertexBounds = this.getVertexBounds(cell);
				this.setVertexLocation(cell, vertexBounds.x - rowOffset, vertexBounds.y);

				thisRow.push(child);
				child = child.next;
			}	
		}
	}
	
	for (var i = 0; i < thisRow.length; i++)
	{
		var cell = thisRow[i].cell;
		var vertexBounds = this.getVertexBounds(cell);
		
		var xProportion = (vertexBounds.x - newRowMinX) / newRowMaxX - newRowMinX;
		var theta =  2 * Math.PI * xProportion;
		this.setVertexLocation(cell, this.centerX - vertexBounds.width / 2 + this.firstRadius * Math.cos(theta), this.centerY + this.firstRadius * Math.sin(theta));
	}

	this.layerN(thisRow, newRowMinX, newRowMaxX);
};