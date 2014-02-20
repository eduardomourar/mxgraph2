/**
 * $Id: vsGraph.js,v 1.1 2012/11/15 13:26:49 gaudenz Exp $
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: vsGraph
 * 
 * Custom graph for the VISA Network Editor.
 */
{

	/**
	 * Constructor: vsGraph
	 *
	 * Constructs a new empty graph inside the given container.
	 * 
	 * Parameters:
	 * 
	 * container - DOM node to hold the HTML markup that represents the graph.
	 */
	function vsGraph(container)
	{
		mxGraph.call(this, container, new vsGraphModel());

		if (container != null)
		{
			this.setBorder(20);
			this.setTooltips(true);
			this.getSelectionModel().setSingleSelection(true);
			this.setReadOnly(true);
			
			// Enables panning if scrollbars are likely to appear
			var hasScrollbars = mxUtils.hasScrollbars(container);

			this.setResizeContainer(!hasScrollbars);
			this.setPanning(hasScrollbars);
		}
	};
		
	/**
	 * Extends <mxGraph>.
	 */
	vsGraph.prototype = new mxGraph();
	vsGraph.prototype.constructor = vsGraph;
	
	/**
	 * Registers class for I/O.
	 */
	var codec = mxCodecRegistry.getCodec(mxGraph);
	codec.template = new vsGraph();
	mxCodecRegistry.register(codec);

	/**
	 * Group: New functions
	 */
	
	/**
	 * Function: loadFile
	 * 
	 * Loads the given URL using <load> for the root DOM node of the URL.
	 * 
	 * Parameters:
	 * 
	 * url - URL of the XML file to be loaded.
	 */
	vsGraph.prototype.loadFile = function(filename, async)
	{
		if (filename != null)
		{
			if (async == null || async == true)
			{
				mxUtils.get(filename, mxUtils.bind(this, function(req)
				{
					this.load(req.getDocumentElement());
				}));
			}
			else
			{
				var req = mxUtils.load(filename);
				this.read(req.getDocumentElement());
			}
		}
	};

	/**
	 * Function: load
	 * 
	 * Loads the given XML node into the model.
	 * 
	 * Parameters:
	 * 
	 * node - XML node that represents an encoded graph model.
	 */
	vsGraph.prototype.load = function(node)
	{
		if (node != null)
		{
			var dec = new mxCodec(node.ownerDocument);
			var model = this.getModel();
					
			model.beginUpdate();
			try
			{
				dec.decode(node, model);
			}
			finally
			{
				model.endUpdate();
			}
		}
	};
	
	/**
	 * Function: loadStyle
	 * 
	 * Loads the given URL as a stylesheet.
	 * 
	 * Parameters:
	 * 
	 * url - URL of the XML file to be loaded.
	 */
	vsGraph.prototype.loadStyle = function(url)
	{
		if (url != null)
		{
			var req = mxUtils.load(url);
			var root = req.getDocumentElement();
			var dec = new mxCodec(root.ownerDocument);
			dec.decode(root, this.stylesheet);
		}
	};
	
	/**
	 * Function: setReadOnly
	 * 
	 * Sets the connectable, disconnectable, bendable, movable, resizable and
	 * cloneable state to given boolean value.
	 * 
	 * Parameters:
	 * 
	 * readOnly - Boolean indicating if the graph should be read-only.
	 */
	vsGraph.prototype.setReadOnly = function(readOnly)
	{
		this.setConnectable(!readOnly);
		this.setCellsDisconnectable(!readOnly);
		this.setCellsBendable(!readOnly);
		this.setCellsMovable(!readOnly);
		this.setCellsResizable(!readOnly);
		this.setCellsCloneable(!readOnly);
		
		// Enables/disables panning using the left mouse button
		this.panningHandler.useLeftButtonForPanning = readOnly;	
	};
	
	/**
	 * Group: Overridden functions
	 */
		
	/**
	 * Function: getTooltipForCell
	 *
	 * Overrides <mxGraph.getTooltipForCell> to disable tooltips.
	 */
	vsGraph.prototype.getTooltipForCell = function(cell)
	{
		return null;
	};
			
	/**
	 * Function: isOrthogonal
	 * 
	 * Overrides <mxGraph.isOrthogonal> to always use orthogonal perimeters.
	 */
	vsGraph.prototype.isOrthogonal = function(edge, vertex)
	{
		return true;
	};
	
	/**
	 * Function: selectCellForEvent
	 *
	 * Overrides <mxGraph.selectCellForEvent> to select the parent for children
	 * of vertices and edges, as such children are labels and do not represent
	 * a network entity.
	 */
	vsGraph.prototype.selectCellForEvent = function(cell, evt)
	{
		if (cell != null)
		{
			var model = this.getModel();
			var parent = model.getParent(cell);
			
			if (model.isVertex(parent) || model.isEdge(parent))
			{
				cell = parent;
			}
		}

		return mxGraph.prototype.selectCellForEvent.apply(this, arguments);
	};

	/**
	 * Function: getLabel
	 *
	 * Overrides <mxGraph.getLabel> to return the label attribute of the XML
	 * node that represents the user object associated with the given cell.
	 */
	vsGraph.prototype.getLabel = function(cell)
	{
		if (cell == null)
		{
			return '';
		}
		else
		{
			var model = this.getModel();
			var parent = model.getParent(cell);
			
			// Gets the attribute from the parents user object
			var value = cell.getValue();
			
			if (value != null && value.length > 0 &&
				(model.isVertex(parent) || model.isEdge(parent)))
			{
				return parent.getAttribute(value, '');
			}
			else
			{
				var lab = cell.getAttribute('label');
				
				if (lab == null && cell.value != null && typeof(cell.value.indexOf) == "function")
				{
					lab = cell.value;
				}
				
				return lab || '';
			}
		}
	};

	/**
	 * Function: isCellFoldable
	 *
	 * Overrides <mxGraph.isCellFoldable> to return false for all cells. This
	 * disables folding (collapse/expand) for all cells.
	 */
	vsGraph.prototype.isCellFoldable = function(cell, collapse)
	{
		return false;
	};
	
	/**
	 * Function: isHtmlLabel
	 *
	 * Overrides <mxGraph.isHtmlLabel> to return true if the label of a cell is
	 * likely to contain HTML markup.
	 */
	vsGraph.prototype.isHtmlLabel = function(cell)
	{
		var style = this.getCellStyle(cell);
		var lab = this.getLabel(cell);
		
		// HTML labels in FF are expensive so try and keep
		// the number of HTML labels as small as possible
		return style[mxConstants.STYLE_HORIZONTAL] == null &&
			lab.indexOf('<') >= 0;
	};
	
	/**
	 * Function: isCellSelectable
	 * 
	 * Overrides <mxGraph.isCellSelectable> to return false for relative
	 * children, as such children are labels and do not represent a network
	 * entity.
	 */
	vsGraph.prototype.isCellSelectable = function(cell)
	{
		var geo = this.model.getGeometry(cell);
		
		return mxGraph.prototype.isCellSelectable.apply(this, arguments) &&
			(geo == null || this.model.isEdge(cell) || !geo.relative) &&
			(cell.style == null || cell.style.indexOf('shape=curve') < 0);
	};
	
	/**
	 * Function: isCellLocked
	 *
	 * Overrides <mxGraph.isCellLocked> to return false for edges that are not
	 * connected. This makes sure that the demarcation line, which does not
	 * represent a network entity, cannot be selected or modified.
	 */
	vsGraph.prototype.isCellLocked = function(cell)
	{
		return cell != null && cell.value != null && !mxUtils.isNode(cell.value) ||
			(cell.style != null && cell.style.indexOf('shape=curve') >= 0);
	};

}
