/**
 * Class: vsEditor
 * 
 * Read-only implementation of the VISA Network Editor. This class provides two
 * empty hooks for subclassers:
 * 
 *   <doubleClick> - Handles double clicking on cells.
 *   <popupMenu> - Creates popup menus for right or shift clicks on cells.
 */
{

	/**
	 * Variable: HIGHLIGHT_COLOR
	 * 
	 * Specifies the color to be used for highlighting cells. Value is #00FF00.
	 */
	mxConstants.HIGHLIGHT_COLOR = '#00FF00';

	/**
	 * Variable: VERTEX_SELECTION_COLOR
	 * 
	 * Specifies the color of the selection border. Value is #0000FF.
	 */
	mxConstants.VERTEX_SELECTION_COLOR = '#0000FF';

	/**
	 * Variable: EDGE_SELECTION_COLOR
	 * 
	 * Specifies the color of the selection border. Value is #0000FF.
	 */
	mxConstants.EDGE_SELECTION_COLOR = '#0000FF';

	/**
	 * Variable: VERTEX_SELECTION_STROKEWIDTH
	 * 
	 * Specifies the width of the selection border. Value is 3.
	 */
	mxConstants.VERTEX_SELECTION_STROKEWIDTH = 3;

	/**
	 * Variable: EDGE_SELECTION_STROKEWIDTH
	 * 
	 * Specifies the width of the selection border. Value is 3.
	 */
	mxConstants.EDGE_SELECTION_STROKEWIDTH = 3;

	/**
	 * Variable: VERTEX_SELECTION_DASHED
	 * 
	 * Specifies if the selection border should be dashed. Value is false.
	 */
	mxConstants.VERTEX_SELECTION_DASHED = false;

	/**
	 * Variable: EDGE_SELECTION_DASHED
	 * 
	 * Specifies if the selection border should be dashed. Value is false.
	 */
	mxConstants.EDGE_SELECTION_DASHED = false;

	/**
	 * Constructor: vsEditor
	 *
	 * Constructs a new read-only VISA Network Editor.
	 * 
	 * Parameters:
	 * 
	 * container - DOM node to hold the HTML markup that represents the graph.
	 */
	function vsEditor(container)
	{
		if (container != null)
		{
			this.graph = new vsGraph(container);
							
			// Highlighting and rubberband selection
			this.rubberband = new mxRubberband(this.graph);
			this.rubberband.setEnabled(false);

			// Highlights cells on mouse moves
			this.highlight = this.createHighlight();
	
			// Redirects popup menu creation to the popupMenu function
			var self = this; // closure
			this.graph.popupMenuHandler.factoryMethod = function(menu, cell, evt)
			{
				// Redirects to parent cell for labels
				if (cell != null)
				{
					var model = self.graph.getModel();
					var parent = model.getParent(cell);
					
					if (model.isVertex(parent) ||
						model.isEdge(parent))
					{
						cell = parent;
						self.graph.selectCellForEvent(cell, evt);
					}
				}
				else
				{
					self.graph.clearSelection();
				}

				self.popupMenu(self.graph, menu, cell, evt);
			};
			
			// Redirects double clicks on cells to the doubleClick function
			this.graph.dblClick = function(trigger, cell)
			{
				var evt = new mxEventObject(mxEvent.DOUBLE_CLICK, 'trigger', trigger, 'cell', cell);
				this.fireEvent(evt);
				
				// Redirects to parent cell for labels
				var model = self.graph.getModel();
				var parent = model.getParent(cell);
				
				if (parent != null &&
					(model.isVertex(parent) ||
					model.isEdge(parent)))
				{
					cell = parent;
				}
	
				if (this.isEnabled() &&
					!mxEvent.isConsumed(trigger) &&
					!evt.isConsumed() &&
					cell != null)
				{
					self.doubleClick(this, trigger, cell);
				}
			};
		}
	};

	/**
	 * Function: createHighlight
	 * 
	 * Creates a new <mxHighlight> for highlighting cells.
	 */
	vsEditor.prototype.createHighlight = function()
	{
		return new mxCellTracker(this.graph, null, mxUtils.bind(this, function(me)
		{
			var cell = me.getCell();
			
			if (this.graph.connectionHandler.isEnabled())
			{
				cell = null;
			}
			
			// Highlights the parent cell for labels
			if (cell != null)
			{
				var model = this.graph.getModel();
				var parent = model.getParent(cell);
				
				if (model.isVertex(parent) || model.isEdge(parent))
				{
					cell = parent;
				}

				// Disables highlight of locked cells and curves (highlight is not curved)
				if (this.graph.isCellLocked(cell))
				{
					cell =  null;
				}
			}
			
			return cell;
		}));
	};

	/**
	 * Function: doubleClick
	 * 
	 * Hook for implementing a double click on the given cell in the given
	 * graph. The double click is represented by the given mouse event. This
	 * implementation is empty.
	 * 
	 * Parameters:
	 * 
	 * graph - <mxGraph> where the double click took place.
	 * evt - Mouse event that represents the double click.
	 * cell - <mxCell> that was double clicked or null, if the mouse event was
	 * over the background.
	 */
	vsEditor.prototype.doubleClick = function(graph, evt, cell)
	{
		// Do nothing
	};

	/**
	 * Function: popupMenu
	 * 
	 * Hook for adding items to the given popupmenu in the given graph. The
	 * given cell points to the cell under the mouse pointer or is null, if the
	 * mouse event appeared on the background.
	 * 
	 * Parameters:
	 * 
	 * graph - <mxGraph> where the mouse event took place.
	 * menu - Menu object where the items can be added.
	 * cell - Optional <mxCell> under the mouse pointer.
	 * evt - Mouse event that triggered the invocation.
	 */
	vsEditor.prototype.popupMenu = function(graph, menu, cell, evt)
	{
		// Do nothing
	};

	/**
	 * Function: destroy
	 * 
	 * Destroys all associated resources.
	 */
	vsEditor.prototype.destroy = function()
	{
		this.graph.destroy();
		this.highlight.destroy();
		this.rubberband.destroy();
	};

}
