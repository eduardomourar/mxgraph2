/**
 * Class: vsCurveShape
 * 
 * Implementation of the ASE shape.
 */
{

	/**
	 * Constructor: vsCurveShape
	 *
	 * Constructs a new curve shape for drawing curved connections.
	 */
	function vsCurveShape() { }
	
	/**
	 * Extends <mxActor>.
	 */
	vsCurveShape.prototype = new mxConnector();
	vsCurveShape.prototype.constructor = vsCurveShape;

	/**
	 * Registers the custom shape in the cell renderer
	 */
	mxCellRenderer.registerShape('curve', vsCurveShape);

	/**
	 * Function: createPoints
	 *
	 * Creates a path expression using the specified commands for this.points.
	 * If <isRounded> is true, then the path contains curves for the corners.
	 */
	vsCurveShape.prototype.createPoints = function(moveCmd, lineCmd, curveCmd, isRelative)
	{
		var p0 = this.points[1];
		var p1 = this.points[2];
		var p2 = this.points[3];
		
		if (mxClient.IS_VML)
		{
			var x0 = -this.bounds.x;
			var y0 = -this.bounds.y;
			
			var cpx0 = x0 + p0.x;
			var cpy0 = y0 + p0.y;
			var qpx1 = x0 + Number(p1.x);
			var qpy1 = y0 + Number(p1.y);
			var cpx3 = x0 + Number(p2.x);
			var cpy3 = y0 + Number(p2.y);
			
			var cpx1 = cpx0 + 2/3 * (qpx1 - cpx0);
			var cpy1 = cpy0 + 2/3 * (qpy1 - cpy0);
			
			var cpx2 = cpx3 + 2/3 * (qpx1 - cpx3);
			var cpy2 = cpy3 + 2/3 * (qpy1 - cpy3);
			
			return 'M ' + Math.round(cpx0) + ' ' + Math.round(cpy0) +
				'c ' + Math.round(cpx1) + ' ' + Math.round(cpy1) + ' ' +
				Math.round(cpx2) + ' ' + Math.round(cpy2) + ' ' +
				Math.round(cpx3) + ' ' + Math.round(cpy3);
		}
		else
		{
			return 'M ' + Math.round(p0.x) + ' ' + Math.round(p0.y) +
				'Q ' + Math.round(p1.x) + ' ' + Math.round(p1.y) +
				' ' + Math.round(p2.x) + ' ' + Math.round(p2.y);
		}
	};
}

/**
 * Class: vsAseShape
 * 
 * Implementation of the ASE shape.
 */
{

	/**
	 * Constructor: vsAseShape
	 *
	 * Constructs a new ASE shape.
	 */
	function vsAseShape() { }
	
	/**
	 * Extends <mxActor>.
	 */
	vsAseShape.prototype = new mxActor();
	vsAseShape.prototype.constructor = vsAseShape;

	/**
	 * Registers the custom shape in the cell renderer
	 */
	mxCellRenderer.registerShape('ase', vsAseShape);

	/**
	 * Function: redrawPath
	 *
	 * Draws the path for this shape. This method uses the <mxPath>
	 * abstraction to paint the shape for VML and SVG.
	 */
	vsAseShape.prototype.redrawPath = function(path, x, y, w, h)
	{
		path.moveTo(0.1 * w, 0.33 * h);
		path.lineTo(0, 0.33 * h);
		path.lineTo(0, 0.5 * h);;
		path.lineTo(0.1 * w, 0.5 * h);
		path.lineTo(0.1 * w, h);
		path.lineTo(0.8 * w, h);
		path.lineTo(0.8 * w, 0.66 * h);
		path.lineTo(w, h);
		path.lineTo(w, 0);
		path.lineTo(0.7 * w, 0.33 * h);
		path.close();
	};

}

/**
 * Class: vsCloudShape
 * 
 * Implementation of the LAN shape.
 */
{

	/**
	 * Constructor: vsCloudShape
	 *
	 * Constructs a new cloud shape.
	 */
	function vsCloudShape() { };
	
	/**
	 * Extends <mxActor>.
	 */
	vsCloudShape.prototype = new mxCloud();
	vsCloudShape.prototype.constructor = vsCloudShape;

	/**
	 * Registers the custom shape in the cell renderer
	 */
	mxCellRenderer.registerShape('cloud', vsCloudShape);

	/**
	 * Function: redrawPath
	 *
	 * Draws the path for this shape. This method uses the <mxPath>
	 * abstraction to paint the shape for VML and SVG.
	 */
	vsCloudShape.prototype.redrawPath = function(path, x, y, w, h)
	{
		// Upper half
		path.moveTo(0, 0.5 * h);
		path.curveTo(0, 0.3625 * h, 0.0675 * w, 0.25 * h, 0.15 * w, 0.25 * h);
		path.curveTo(0.15 * w, 0.1125 * h, 0.24 * w, 0, 0.35 * w, 0);
		path.curveTo(0.4325 * w, 0, 0.5 * w, 0.045 * h, 0.5 * w, 0.1 * h);
		path.curveTo(0.5 * w, 0.045 * h, 0.5825 * w, 0, 0.65 * w, 0);
		path.curveTo(0.76 * w, 0, 0.85 * w, 0.1125 * h, 0.85 * w, 0.25 * h);
		path.curveTo(0.9325 * w, 0.25 * h, w, 0.3625 * h, w, 0.5 * h);

		// Lower half		
		path.curveTo(w, 0.6375 * h, 0.9325 * w, 0.75 * h, 0.85 * w, 0.75 * h);
		path.curveTo(0.85 * w, 0.8875 * h, 0.76 * w, h, 0.65 * w, h);
		path.curveTo(0.5675 * w, h, 0.5 * w, 0.945 * h, 0.5 * w, 0.9 * h);
		path.curveTo(0.5 * w, 0.945 * h, 0.4175 * w, h, 0.35 * w, h);
		path.curveTo(0.24 * w, h, 0.15 * w, 0.8875 * h, 0.15 * w, 0.75 * h);
		path.curveTo(0.0675 * w, 0.75 * h, 0, 0.6375 * h, 0, 0.5 * h);
		path.close();
	};

}

/**
 * Class: vsLanShape
 * 
 * Implementation of the LAN shape.
 */
{

	/**
	 * Constructor: vsLanShape
	 *
	 * Constructs a new LAN shape.
	 */
	function vsLanShape() { };
	
	/**
	 * Extends <mxActor>.
	 */
	vsLanShape.prototype = new mxActor();
	vsLanShape.prototype.constructor = vsLanShape;

	/**
	 * Registers the custom shape in the cell renderer
	 */
	mxCellRenderer.registerShape('lan', vsLanShape);

	/**
	 * Function: redrawPath
	 *
	 * Draws the path for this shape. This method uses the <mxPath>
	 * abstraction to paint the shape for VML and SVG.
	 */
	vsLanShape.prototype.redrawPath = function(path, x, y, w, h)
	{
		path.moveTo(0, 0);
		path.lineTo(w, 0);
		path.moveTo(w / 2, 0);
		path.lineTo(w / 2, h);
		path.lineTo(0, h);
		path.moveTo(w / 2, h);
		path.lineTo(w, h);
		path.end();
	};

}

/**
 * Class: vsWaveShape
 * 
 * Implementation of the ASE shape.
 */
{

	/**
	 * Constructor: vsWaveShape
	 *
	 * Constructs a new Vsat shape.
	 */
	function vsWaveShape() { }
	
	/**
	 * Extends <mxActor>.
	 */
	vsWaveShape.prototype = new mxActor();
	vsWaveShape.prototype.constructor = vsWaveShape;

	/**
	 * Registers the custom shape in the cell renderer
	 */
	mxCellRenderer.registerShape('wave', vsWaveShape);

	/**
	 * Function: redrawPath
	 *
	 * Draws the path for this shape. This method uses the <mxPath>
	 * abstraction to paint the shape for VML and SVG.
	 */
	vsWaveShape.prototype.redrawPath = function(path, x, y, w, h)
	{
		path.moveTo(w / 2, 0);
		path.quadTo(w, h / 4, w / 2, h / 2);
		path.quadTo(0, 3 * h / 4, w / 2, h);
		path.end();
	};

}
