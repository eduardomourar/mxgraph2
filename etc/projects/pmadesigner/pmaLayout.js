/**
 * Copyright (c) 2009, JGraph Ltd
 *
 * Class: pmaLayout
 * 
 * Extends <mxGraphLayout> to implement a grid style layout with
 * orthogonal edge routing.
 * 
 * Example:
 * 
 * (code)
 * var layout = new pmaLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * (end)
 */
{

	/**
	 * Constructor: pmaLayout
	 * 
	 * Constructs a new fast pma layout for the specified graph.
	 */
	function pmaLayout(graph)
	{
		mxGraphLayout.call(this, graph);
	};
	
	/**
	 * Extends mxGraphLayout.
	 */
	mxFastOrganicLayout.prototype = new mxGraphLayout();
	pmaLayout.prototype.constructor = pmaLayout;
	
	/**
	 * Variable: useInputOrigin
	 * 
	 * Specifies if the top left corner of the input cells should be the origin
	 * of the layout result. Default is false.
	 */
	pmaLayout.prototype.useInputOrigin = false;

	/**
	 * Variable: resetEdges
	 * 
	 * Specifies if all edge points of traversed edges should be removed.
	 * Default is true.
	 */
	pmaLayout.prototype.resetEdges = true;

	/**
	 * Variable: disableEdgeStyle
	 * 
	 * Specifies if the STYLE_NOEDGESTYLE flag should be set on edges that are
	 * modified by the result. Default is true.
	 */
	pmaLayout.prototype.disableEdgeStyle = true;
	
	/**
	 * Variable: indices
	 * 
	 * Hashtable from cells to local indices.
	 */
	mxFastOrganicLayout.prototype.indices;

	/**
	 * Variable: minDistanceLimitSquared
	 * 
	 * Cached version of <minDistanceLimit> squared.
	 */
	pmaLayout.prototype.minDistanceLimitSquared = 4;

	/**
	 * Variable: initialTemp
	 * 
	 * Start value of temperature. Default is 200.
	 */
	pmaLayout.prototype.initialTemp = 200;

	/**
	 * Variable: vertexArray
	 * 
	 * An array of all vertices to be laid out.
	 */
	pmaLayout.prototype.vertexArray;

	/**
	 * Variable: cellLocation
	 * 
	 * An array of locally stored co-ordinate positions for the vertices.
	 */
	pmaLayout.prototype.cellLocation;

	/**
	 * Variable: isMoveable
	 * 
	 * Array of booleans representing the movable states of the vertices.
	 */
	pmaLayout.prototype.isMoveable;

	/**
	 * Variable: neighbours
	 * 
	 * Local copy of cell neighbours.
	 */
	pmaLayout.prototype.neighbours;

	/**
	 * Function: execute
	 * 
	 * Implements <mxGraphLayout.execute>. This operates on all children of the
	 * given parent.
	 */
	pmaLayout.prototype.execute = function(parent)
	{
		var model = this.graph.getModel();
		this.vertexArray = this.graph.getChildVertices(parent);
		
		var initialBounds = (this.useInputOrigin) ?
				this.graph.view.getBounds(this.vertexArray) :
					null;
		var n = this.vertexArray.length;

		this.indices =[];
		this.dispX = [];
		this.dispY = [];
		this.cellLocation = [];
		this.isMoveable = [];
		this.neighbours = [];
		this.radius = [];
		this.radiusSquared = [];

		// Create a map of vertices first. This is required for the array of
		// arrays called neighbours which holds, for each vertex, a list of
		// ints which represents the neighbours cells to that vertex as
		// the indices into vertexArray
		for (var i = 0; i < this.vertexArray.length; i++)
		{
			var vertex = this.vertexArray[i];
			this.cellLocation[i] = [];
			
			// Set up the mapping from array indices to cells
			var id = mxCellPath.create(vertex);
			this.indices[id] = i;
			var bounds = this.getVertexBounds(vertex);
		}

		// Moves cell location back to top-left from center locations used in
		// algorithm, resetting the edge points is part of the transaction
		model.beginUpdate();
		try
		{
			for (var i = 0; i < n; i++)
			{
				this.dispX[i] = 0;
				this.dispY[i] = 0;
				this.isMoveable[i] = this.isVertexMovable(this.vertexArray[i]);
	
				// Get lists of neighbours to all vertices, translate the cells
				// obtained in indices into vertexArray and store as an array
				// against the orginal cell index
				var edges = this.graph.getConnections(this.vertexArray[i], parent);
				var cells = this.graph.getOpposites(edges, this.vertexArray[i]);
				this.neighbours[i] = [];
	
				for (var j = 0; j < cells.length; j++)
				{
					// Resets the points on the traversed edge
					if (this.resetEdges)
					{
						this.graph.resetEdge(edges[j]);
					}
	
				    if (this.disableEdgeStyle)
				    {
				    	this.setEdgeStyleEnabled(edges[j], false);
				    }

					// Looks the cell up in the indices dictionary
					var id = mxCellPath.create(cells[j]);
					var index = this.indices[id];
	
					// Check the connected cell in part of the vertex list to be
					// acted on by this layout
					if (index != null)
					{
						this.neighbours[i][j] = index;
					}
	
					// Else if index of the other cell doesn't correspond to
					// any cell listed to be acted upon in this layout. Set
					// the index to the value of this vertex (a dummy self-loop)
					// so the attraction force of the edge is not calculated
					else
					{
						this.neighbours[i][j] = i;
					}
				}
			}
			this.temperature = this.initialTemp;
	
			// If max number of iterations has not been set, guess it
			if (this.maxIterations == 0)
			{
				this.maxIterations = 20 * Math.sqrt(n);
			}
			
			// Main iteration loop
			for (this.iteration = 0; this.iteration < this.maxIterations; this.iteration++)
			{
				if (!this.allowedToRun)
				{
					return;
				}
				
				// Calculate repulsive forces on all vertices
				this.calcRepulsion();
	
				// Calculate attractive forces through edges
				this.calcAttraction();
	
				this.calcPositions();
				this.reduceTemperature();
			}

			var minx = null;
			var miny = null;
			
			for (var i = 0; i < this.vertexArray.length; i++)
			{
				var vertex = this.vertexArray[i];
				
				if (this.isVertexMovable(vertex))
				{
					var bounds = this.getVertexBounds(vertex);
					
					if (bounds != null)
					{
						this.cellLocation[i][0] -= bounds.width / 2.0;
						this.cellLocation[i][1] -= bounds.height / 2.0;
						
						var x = this.graph.snap(this.cellLocation[i][0]);
						var y = this.graph.snap(this.cellLocation[i][1]);
						
						this.setVertexLocation(vertex, x, y);
						
						if (minx == null)
						{
							minx = x;
						}
						else
						{
							minx = Math.min(minx, x);
						}
						
						if (miny == null)
						{
							miny = y;
						}
						else
						{
							miny = Math.min(miny, y);
						}
					}
				}
			}
			
			// Modifies the cloned geometries in-place. Not needed
			// to clone the geometries again as we're in the same
			// undoable change.
			var dx = -(minx || 0) + 1;
			var dy = -(miny || 0) + 1;
			
			if (initialBounds != null)
			{
				dx += initialBounds.x;
				dy += initialBounds.y;
			}
			
			this.graph.moveCells(this.vertexArray, dx, dy);
		}
		finally
		{
			model.endUpdate();
		}
	};

	/**
	 * Function: calcPositions
	 * 
	 * Takes the displacements calculated for each cell and applies them to the
	 * local cache of cell positions. Limits the displacement to the current
	 * temperature.
	 */
	pmaLayout.prototype.calcPositions = function()
	{
		for (var index = 0; index < this.vertexArray.length; index++)
		{
			if (this.isMoveable[index])
			{
				// Get the distance of displacement for this node for this
				// iteration
				var deltaLength = Math.sqrt(this.dispX[index] * this.dispX[index] +
					this.dispY[index] * this.dispY[index]);

				if (deltaLength < 0.001)
				{
					deltaLength = 0.001;
				}

				// Scale down by the current temperature if less than the
				// displacement distance
				var newXDisp = this.dispX[index] / deltaLength
					* Math.min(deltaLength, this.temperature);

				var newYDisp = this.dispY[index] / deltaLength
					* Math.min(deltaLength, this.temperature);

				// reset displacements
				this.dispX[index] = 0;
				this.dispY[index] = 0;

				// Update the cached cell locations
				this.cellLocation[index][0] += newXDisp;
				this.cellLocation[index][1] += newYDisp;
			}
		}
	};

	/**
	 * Function: calcAttraction
	 * 
	 * Calculates the attractive forces between all laid out nodes linked by
	 * edges
	 */
	pmaLayout.prototype.calcAttraction = function()
	{
		// Check the neighbours of each vertex and calculate the attractive
		// force of the edge connecting them
		for (var i = 0; i < this.vertexArray.length; i++)
		{
			for (var k = 0; k < this.neighbours[i].length; k++)
			{
				// Get the index of the othe cell in the vertex array
				var j = this.neighbours[i][k];
				
				// Do not proceed self-loops
				if (i != j &&
					this.isMoveable[i] &&
					this.isMoveable[j])
				{
					var xDelta = this.cellLocation[i][0] - this.cellLocation[j][0];
					var yDelta = this.cellLocation[i][1] - this.cellLocation[j][1];

					// The distance between the nodes
					var deltaLengthSquared = xDelta * xDelta + yDelta
							* yDelta - this.radiusSquared[i] - this.radiusSquared[j];

					if (deltaLengthSquared < this.minDistanceLimitSquared)
					{
						deltaLengthSquared = this.minDistanceLimitSquared;
					}
					
					var deltaLength = Math.sqrt(deltaLengthSquared);
					var force = (deltaLengthSquared) / this.forceConstant;

					var displacementX = (xDelta / deltaLength) * force;
					var displacementY = (yDelta / deltaLength) * force;
					
					this.dispX[i] -= displacementX;
					this.dispY[i] -= displacementY;
					
					this.dispX[j] += displacementX;
					this.dispY[j] += displacementY;
				}
			}
		}
	};

	/**
	 * Function: calcRepulsion
	 * 
	 * Calculates the repulsive forces between all laid out nodes
	 */
	pmaLayout.prototype.calcRepulsion = function()
	{
		var vertexCount = this.vertexArray.length;

		for (var i = 0; i < vertexCount; i++)
		{
			for (var j = i; j < vertexCount; j++)
			{
				// Exits if the layout is no longer allowed to run
				if (!this.allowedToRun)
				{
					return;
				}

				if (j != i &&
					this.isMoveable[i] &&
					this.isMoveable[j])
				{
					var xDelta = this.cellLocation[i][0] - this.cellLocation[j][0];
					var yDelta = this.cellLocation[i][1] - this.cellLocation[j][1];

					if (xDelta == 0)
					{
						xDelta = 0.01 + Math.random();
					}
					
					if (yDelta == 0)
					{
						yDelta = 0.01 + Math.random();
					}
					
					// Distance between nodes
					var deltaLength = Math.sqrt((xDelta * xDelta)
							+ (yDelta * yDelta));
					var deltaLengthWithRadius = deltaLength - this.radius[i]
							- this.radius[j];
	
					if (deltaLengthWithRadius < this.minDistanceLimit)
					{
						deltaLengthWithRadius = this.minDistanceLimit;
					}

					var force = this.forceConstantSquared / deltaLengthWithRadius;

					var displacementX = (xDelta / deltaLength) * force;
					var displacementY = (yDelta / deltaLength) * force;
					
					this.dispX[i] += displacementX;
					this.dispY[i] += displacementY;

					this.dispX[j] -= displacementX;
					this.dispY[j] -= displacementY;
				}
			}
		}
	};

	/**
	 * Function: reduceTemperature
	 * 
	 * Reduces the temperature of the layout from an initial setting in a linear
	 * fashion to zero.
	 */
	pmaLayout.prototype.reduceTemperature = function()
	{
		this.temperature = this.initialTemp * (1.0 - this.iteration / this.maxIterations);
	};

}
