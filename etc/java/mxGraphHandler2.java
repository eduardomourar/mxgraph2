/**
 * Copyright (c) 2008, Gaudenz Alder
 * 
 * Known issue: Drag image size depends on the initial position and may sometimes
 * not align with the grid when dragging. This is because the rounding of the width
 * and height at the initial position may be different than that at the current
 * position as the left and bottom side of the shape must align to the grid lines.
 */
package com.mxgraph.swing.handler;

import java.awt.Color;
import java.awt.Cursor;
import java.awt.Graphics;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.datatransfer.Transferable;
import java.awt.dnd.DnDConstants;
import java.awt.dnd.DragGestureEvent;
import java.awt.dnd.DragGestureListener;
import java.awt.dnd.DragSource;
import java.awt.dnd.DragSourceAdapter;
import java.awt.dnd.DragSourceDropEvent;
import java.awt.dnd.DropTarget;
import java.awt.dnd.DropTargetDragEvent;
import java.awt.dnd.DropTargetDropEvent;
import java.awt.dnd.DropTargetEvent;
import java.awt.dnd.DropTargetListener;
import java.awt.event.InputEvent;
import java.awt.event.MouseEvent;
import java.util.TooManyListenersException;

import javax.swing.JComponent;
import javax.swing.SwingUtilities;
import javax.swing.TransferHandler;

import com.mxgraph.swing.mxGraphComponent;
import com.mxgraph.swing.util.mxGraphTransferable;
import com.mxgraph.swing.util.mxMouseAdapter;
import com.mxgraph.util.mxConstants;
import com.mxgraph.util.mxEvent;
import com.mxgraph.util.mxEventObject;
import com.mxgraph.util.mxPoint;
import com.mxgraph.util.mxRectangle;
import com.mxgraph.util.mxEventSource.mxIEventListener;
import com.mxgraph.view.mxCellState;
import com.mxgraph.view.mxGraph;

public class mxGraphHandler2 extends mxMouseAdapter implements
		DropTargetListener
{
    // TODO: Fix move preview: image preview (for DnD), grid alignment,
	// alignment for oversize labels, relative child preview (cropped).

	/**
	 * 
	 */
	private static final long serialVersionUID = 3241109976696510225L;

	/**
	 * Default is Cursor.DEFAULT_CURSOR.
	 */
	public static Cursor DEFAULT_CURSOR = new Cursor(Cursor.DEFAULT_CURSOR);

	/**
	 * Default is Cursor.MOVE_CURSOR.
	 */
	public static Cursor MOVE_CURSOR = new Cursor(Cursor.MOVE_CURSOR);

	/**
	 * Default is Cursor.HAND_CURSOR.
	 */
	public static Cursor FOLD_CURSOR = new Cursor(Cursor.HAND_CURSOR);

	/**
	 * Reference to the enclosing graph component.
	 */
	protected mxGraphComponent graphComponent;

	/**
	 * Specifies if the handler is enabled. Default is true.
	 */
	protected boolean enabled = true;

	/**
	 * Specifies if cloning by control-drag is enabled. Default is true.
	 */
	protected boolean cloneEnabled = true;

	/**
	 * Specifies if moving is enabled. Default is true.
	 */
	protected boolean moveEnabled = true;

	/**
	 * Specifies if moving is enabled. Default is true.
	 */
	protected boolean selectEnabled = true;

	/**
	 * Specifies if the cell marker should be called (for splitting edges and
	 * dropping cells into groups). Default is true.
	 */
	protected boolean markerEnabled = true;

	/**
	 * Specifies if cells may be moved out of their parents. Default is true.
	 */
	protected boolean removeCellsFromParent = true;

	/**
	 * Specifies if a placeholder should be used to preview the move operation.
	 * Default is false. 
	 */
	protected boolean placeholderPreview = false;

	/**
	 * Holds the cell states for the live preview.
	 */
	protected mxMovePreview movePreview;

	/**
	 * Specifies if the preview should be centered around the mouse cursor if there
	 * was no mouse click to define the offset within the shape (eg. drag from
	 * external source). Default is true.
	 */
	protected boolean centerPreview = true;

	/**
	 * Specifies if this handler should be painted on top of all other components.
	 * Default is true.
	 */
	protected boolean keepOnTop = true;

	/**
	 * Holds the start location of the mouse gesture.
	 */
	protected transient Point first;

	/**
	 * 
	 */
	protected transient Object cell;

	/**
	 * 
	 */
	protected transient Object[] cells;

	/**
	 * 
	 */
	protected transient mxCellMarker marker;

	/**
	 * 
	 */
	protected transient boolean canImport;

	/**
	 * 
	 */
	protected transient Rectangle previewBounds = null;

	/**
	 * Workaround for alt-key-state not correct in mouseReleased. Note: State
	 * of the alt-key is not available during drag-and-drop.
	 */
	private transient boolean gridEnabledEvent = false;

	/**
	 * Workaround for shift-key-state not correct in mouseReleased.
	 */
	protected transient boolean constrainedEvent = false;

	/**
	 * 
	 * @param graphComponent
	 */
	public mxGraphHandler2(final mxGraphComponent graphComponent)
	{
		this.graphComponent = graphComponent;
		marker = createMarker();
		movePreview = createMovePreview();

		// Installs the paint handler
		graphComponent.addListener(mxEvent.AFTER_PAINT, new mxIEventListener()
		{
			public void invoke(Object sender, mxEventObject evt)
			{
				Graphics g = (Graphics) evt.getProperty("g");
				paint(g);
			}
		});

		// Listens to all mouse events on the rendering control
		graphComponent.getGraphControl().addMouseListener(this);
		graphComponent.getGraphControl().addMouseMotionListener(this);

		// Drag target creates preview image
		DragGestureListener dragGestureListener = new DragGestureListener()
		{
			public void dragGestureRecognized(DragGestureEvent e)
			{
				if (graphComponent.isDragEnabled() && first != null)
				{
					final TransferHandler th = graphComponent
							.getTransferHandler();

					if (th instanceof mxGraphTransferHandler)
					{
						final mxGraphTransferable t = (mxGraphTransferable) ((mxGraphTransferHandler) th)
								.createTransferable(graphComponent);

						if (t != null)
						{
							e.startDrag(null, mxConstants.EMPTY_IMAGE,
									new Point(), t, new DragSourceAdapter()
									{

										/**
										 * 
										 */
										public void dragDropEnd(
												DragSourceDropEvent dsde)
										{
											((mxGraphTransferHandler) th)
													.exportDone(
															graphComponent,
															t,
															TransferHandler.NONE);
											first = null;
										}
									});
						}
					}
				}
			}
		};

		DragSource dragSource = new DragSource();
		dragSource.createDefaultDragGestureRecognizer(graphComponent
				.getGraphControl(), DnDConstants.ACTION_COPY_OR_MOVE,
				dragGestureListener);

		// Listens to dropped graph cells
		DropTarget dropTarget = graphComponent.getDropTarget();

		try
		{
			if (dropTarget != null)
			{
				dropTarget.addDropTargetListener(this);
			}
		}
		catch (TooManyListenersException tmle)
		{
			// should not happen... swing drop target is multicast
		}
	}

	/**
	 * 
	 */
	public void setPreviewBounds(Rectangle bounds)
	{
		if ((bounds == null && previewBounds != null)
				|| (bounds != null && previewBounds == null)
				|| (bounds != null && previewBounds != null && !bounds
						.equals(previewBounds)))
		{
			Rectangle dirty = previewBounds;

			if (bounds != null)
			{
				if (dirty != null)
				{
					dirty.add(bounds);
				}
				else
				{
					dirty = bounds;
				}
			}

			previewBounds = bounds;

			if (dirty != null)
			{
				graphComponent.getGraphControl().repaint(dirty.x - 1,
						dirty.y - 1, dirty.width + 2, dirty.height + 2);
			}
		}
	}

	/**
	 * 
	 */
	protected mxMovePreview createMovePreview()
	{
		return new mxMovePreview(graphComponent);
	}

	/**
	 * 
	 */
	protected mxCellMarker createMarker()
	{
		mxCellMarker marker = new mxCellMarker(graphComponent, Color.BLUE)
		{
			/**
			 * 
			 */
			private static final long serialVersionUID = -8451338653189373347L;

			/**
			 * 
			 */
			public boolean isEnabled()
			{
				return graphComponent.getGraph().isDropEnabled();
			}

			/**
			 * 
			 */
			public Object getCell(MouseEvent e)
			{
				mxGraph graph = graphComponent.getGraph();
				Object result = super.getCell(e);
				result = graph.getDropTarget(cells, e.getPoint(), result);
				boolean clone = graphComponent.isCloneEvent(e) && cloneEnabled;

				if (isLocal() && result != null && cells.length > 0 && !clone
						&& graph.getModel().getParent(cells[0]) == result)
				{
					result = null;
				}

				return result;
			}

		};

		// Swimlane content area will not be transparent drop targets
		marker.setSwimlaneContentEnabled(true);

		return marker;
	}

	/**
	 * 
	 */
	public mxGraphComponent getGraphComponent()
	{
		return graphComponent;
	}

	/**
	 * 
	 */
	public boolean isEnabled()
	{
		return enabled;
	}

	/**
	 * 
	 */
	public void setEnabled(boolean value)
	{
		enabled = value;
	}

	/**
	 * 
	 */
	public boolean isCloneEnabled()
	{
		return cloneEnabled;
	}

	/**
	 * 
	 */
	public void setCloneEnabled(boolean value)
	{
		cloneEnabled = value;
	}

	/**
	 * 
	 */
	public boolean isMoveEnabled()
	{
		return moveEnabled;
	}

	/**
	 * 
	 */
	public void setMoveEnabled(boolean value)
	{
		moveEnabled = value;
	}

	/**
	 * 
	 */
	public boolean isMarkerEnabled()
	{
		return markerEnabled;
	}

	/**
	 * 
	 */
	public void setMarkerEnabled(boolean value)
	{
		markerEnabled = value;
	}

	/**
	 * 
	 */
	public boolean isSelectEnabled()
	{
		return selectEnabled;
	}

	/**
	 * 
	 */
	public void setSelectEnabled(boolean value)
	{
		selectEnabled = value;
	}

	/**
	 * 
	 */
	public boolean isRemoveCellsFromParent()
	{
		return removeCellsFromParent;
	}

	/**
	 * 
	 */
	public void setRemoveCellsFromParent(boolean value)
	{
		removeCellsFromParent = value;
	}

	/**
	 * 
	 */
	public boolean isPlaceholderPreview()
	{
		return placeholderPreview;
	}

	/**
	 * 
	 */
	public void setPlaceholderPreview(boolean value)
	{
		placeholderPreview = value;
	}

	/**
	 * 
	 */
	public boolean isCenterPreview()
	{
		return centerPreview;
	}

	/**
	 * 
	 */
	public void setCenterPreview(boolean value)
	{
		centerPreview = value;
	}

	/**
	 * 
	 */
	public void mousePressed(MouseEvent e)
	{
		if (graphComponent.isEnabled() && isEnabled() && !e.isConsumed()
				&& !graphComponent.isForceMarqueeEvent(e))
		{
			cell = graphComponent.getCellAt(e.getX(), e.getY(), false);

			if (cell != null)
			{
				if (isSelectEnabled()
						&& !graphComponent.getGraph().isCellSelected(cell))
				{
					graphComponent.selectCellForEvent(cell, e);
				}

				// Starts move if the cell under the mouse is movable and/or any
				// cells of the selection are movable
				if (isMoveEnabled() && !e.isPopupTrigger())
				{
					start(e, cell);
					e.consume();
				}
			}
			else if (e.isPopupTrigger())
			{
				graphComponent.getGraph().clearSelection();
			}
		}
	}

	/**
	 * 
	 */
	protected boolean isLocal()
	{
		TransferHandler th = graphComponent.getTransferHandler();

		return th instanceof mxGraphTransferHandler
				&& ((mxGraphTransferHandler) th).isLocalDrag();
	}

	/**
	 * 
	 */
	public void dragEnter(DropTargetDragEvent e)
	{
		JComponent component = getDropTarget(e);
		TransferHandler th = component.getTransferHandler();

		if (isLocal())
		{
			// FIXME: Restart local drag if mouse comes back
			if (first == null)
			{
				//start(createEvent(e), cell);
			}
			
			e.acceptDrag(TransferHandler.COPY_OR_MOVE);
			canImport = true;
		}
		else
		{
			if (graphComponent.isImportEnabled()
					&& th.canImport(component, e.getCurrentDataFlavors()))
			{
				try
				{
					Transferable t = e.getTransferable();

					if (t.isDataFlavorSupported(mxGraphTransferable.dataFlavor))
					{
						mxGraphTransferable gt = (mxGraphTransferable) t
								.getTransferData(mxGraphTransferable.dataFlavor);
						cells = gt.getCells();

						// FIXME: bounds can be null for edges
						mxRectangle bounds = graphComponent.getGraph()
								.getBoundingBoxFromGeometry(cells);
						double scale = graphComponent.getGraph().getView()
								.getScale();
						bounds.setWidth(bounds.getWidth() * scale);
						bounds.setHeight(bounds.getHeight() * scale);
						setPreviewBounds(bounds.getRectangle());
					}

					e.acceptDrag(TransferHandler.COPY_OR_MOVE);
					canImport = true;
				}
				catch (Exception ex)
				{
					ex.printStackTrace();
				}
			}
			else
			{
				e.rejectDrag();
			}
		}
	}

	/**
	 * 
	 */
	public void mouseMoved(MouseEvent e)
	{
		if (graphComponent.isEnabled() && isEnabled() && !e.isConsumed())
		{
			Cursor cursor = getCursor(e);

			if (cursor != null)
			{
				graphComponent.getGraphControl().setCursor(cursor);
				e.consume();
			}
			else
			{
				graphComponent.getGraphControl().setCursor(DEFAULT_CURSOR);
			}
		}
	}

	/**
	 * 
	 */
	protected Cursor getCursor(MouseEvent e)
	{
		Cursor cursor = null;

		if (isMoveEnabled())
		{
			Object cell = graphComponent.getCellAt(e.getX(), e.getY(), false);

			if (cell != null)
			{
				if (graphComponent.isFoldingEnabled()
						&& graphComponent.hitFoldingIcon(cell, e.getX(), e
								.getY()))
				{
					cursor = FOLD_CURSOR;
				}
				else if (graphComponent.getGraph().isCellMovable(cell))
				{
					cursor = MOVE_CURSOR;
				}
			}
		}

		return cursor;
	}

	/**
	 * 
	 */
	public Object[] getCells(Object initialCell)
	{
		mxGraph graph = graphComponent.getGraph();

		return graph.getMovableCells(graph.getSelectionCells());
	}

	/**
	 * 
	 */
	public void start(MouseEvent e, Object cell)
	{
		first = e.getPoint();

		if (isPlaceholderPreview())
		{
			cells = getCells(cell);

			if (cells != null && cells.length > 0)
			{
				setPreviewBounds(graphComponent.getGraph().getView().getBounds(
						cells).getRectangle());
			}
		}
		else
		{
			movePreview.start(e, graphComponent.getGraph().getView().getState(
					cell));
			cells = movePreview.getMovingCells();
		}
	}

	/**
	 * 
	 */
	public void dropActionChanged(DropTargetDragEvent e)
	{
		// do nothing
	}

	/**
	 * 
	 * @param e
	 */
	public void dragOver(DropTargetDragEvent e)
	{
		if (canImport)
		{
			mouseDragged(createEvent(e));
			mxGraphTransferHandler handler = getGraphTransferHandler(e);

			if (!isLocal() && handler != null)
			{
				mxPoint pt = graphComponent.snapScaledPoint(new mxPoint(
						SwingUtilities.convertPoint(graphComponent, e
								.getLocation(), graphComponent
								.getGraphControl())));
				handler.setLocation(pt.getPoint());

				if (previewBounds != null)
				{
					if (isCenterPreview())
					{
						pt.setX(pt.getX() - previewBounds.getWidth() / 2);
						pt.setY(pt.getY() - previewBounds.getHeight() / 2);
					}

					// TODO: Account for center offset in final drop location
					// Sets the drop offset so that the location in the transfer
					// handler reflects the actual mouse position
					//handler.setOffset(new Point((int) graph.snap(dx / scale),
					//		(int) graph.snap(dy / scale)));
					setPreviewBounds(new Rectangle(pt.getPoint(), previewBounds
							.getSize()));
				}
				else
				{

				}
			}
		}
		else
		{
			e.rejectDrag();
		}
	}

	/**
	 * 
	 */
	public MouseEvent convertEvent(MouseEvent e)
	{
		gridEnabledEvent = graphComponent.isGridEnabledEvent(e);
		constrainedEvent = graphComponent.isConstrainedEvent(e);

		int x = e.getX();
		int y = e.getY();

		// Snaps event coordinates to grid if grid is enabled
		if (gridEnabledEvent)
		{
			mxGraph graph = graphComponent.getGraph();

			x = (int) graph.snap(x);
			y = (int) graph.snap(y);
		}

		// Uses only one direction for moving if event is constrained
		if (constrainedEvent && first != null)
		{
			if (Math.abs(e.getX() - first.x) > Math.abs(e.getY() - first.y))
			{
				y = first.y;
			}
			else
			{
				x = first.x;
			}
		}

		// Replaces the coordinates in the event
		return new MouseEvent(e.getComponent(), e.getID(), e.getWhen(), e
				.getModifiers(), x, y, e.getClickCount(), e.isPopupTrigger(), e
				.getButton());
	}

	/**
	 * 
	 */
	public void mouseDragged(MouseEvent e)
	{
		// LATER: Check scrollborder, use scroll-increments, do not
		// scroll when over ruler dragging from library
		graphComponent.getGraphControl().scrollRectToVisible(
				new Rectangle(e.getPoint()));

		if (!e.isConsumed())
		{
			e = convertEvent(e);

			// Processes the event to highlight drop targets if enabled
			if (isMarkerEnabled())
			{
				marker.process(e);
			}

			// Moves the placeholder or the live preview
			if (first != null)
			{
				if (previewBounds != null)
				{
					setPreviewBounds(new Rectangle(e.getPoint(), previewBounds
							.getSize()));
				}
				else if (movePreview.isActive())
				{
					double dx = e.getX() - first.x;
					double dy = e.getY() - first.y;
					boolean clone = isCloneEnabled()
							&& graphComponent.isCloneEvent(e);
					movePreview.update(e, dx, dy, clone);
					e.consume();
				}
			}
		}
	}

	/**
	 * Invokes if the mouse leaves the component but also if escape is pressed.
	 */
	public void dragExit(DropTargetEvent e)
	{
		mxGraphTransferHandler handler = getGraphTransferHandler(e);

		if (handler != null)
		{
			handler.setLocation(null);
		}

		marker.reset();
		cells = null;
		reset();
	}

	/**
	 * 
	 * @param e
	 */
	public void drop(DropTargetDropEvent e)
	{
		if (canImport)
		{
			mxGraphTransferHandler handler = getGraphTransferHandler(e);
			MouseEvent evt = createEvent(e);

			// Ignores the event in mouseReleased if it is
			// handled by the transfer handler as a drop
			if (handler != null && !handler.isLocalDrag())
			{
				evt.consume();
			}

			mouseReleased(evt);
		}
	}

	/**
	 * 
	 */
	protected Object getDropTarget(MouseEvent e)
	{
		mxGraph graph = graphComponent.getGraph();
		mxCellState markedState = marker.getMarkedState();
		Object target = (markedState != null) ? markedState.getCell() : null;

		if (target == null
				&& isRemoveCellsFromParent()
				&& shouldRemoveCellFromParent(graph.getModel().getParent(cell),
						cells, e))
		{
			target = graph.getDefaultParent();
		}

		return target;
	}

	/**
	 * 
	 */
	public void mouseReleased(MouseEvent e)
	{
		if (graphComponent.isEnabled() && isEnabled() && !e.isConsumed())
		{
			mxGraph graph = graphComponent.getGraph();
			boolean significant = (first != null) ? graphComponent
					.isSignificant(e.getX() - first.x, e.getY() - first.y)
					: false;

			// Handles moving of cells
			if (significant)
			{
				boolean clone = isCloneEnabled()
						&& graphComponent.isCloneEvent(e);
				Object target = getDropTarget(e);
				e = convertEvent(e);

				double dx = e.getX() - first.x;
				double dy = e.getY() - first.y;
				Object[] result = null;

				// Handles splitting edges under the mouse
				if (graph.isSplitEnabled()
						&& graph.isSplitTarget(target, cells))
				{
					graph.splitEdge(target, cells, dx, dy);
				}
				else if (movePreview.isActive())
				{
					result = movePreview.stop(true, e, dx, dy, clone, target);
				}
				else
				{
					double scale = graph.getView().getScale();
					result = moveCells(cells, dx / scale, dy / scale, clone,
							target, e);
				}

				if (isSelectEnabled() && result != cells)
				{
					graph.setSelectionCells(result);
				}

				e.consume();
			}
			else
			{
				if (cell != null)
				{
					// Handles delayed deselection for toggle events
					if (!e.isPopupTrigger() && isSelectEnabled()
							&& graph.isCellSelected(cell)
							&& graphComponent.isToggleEvent(e))
					{
						graphComponent.selectCellForEvent(cell, e);
					}

					// Handles folding icon clicks
					if (graphComponent.isFoldingEnabled()
							&& graphComponent.hitFoldingIcon(cell, e.getX(), e
									.getY()))
					{
						fold(cell);
						e.consume();
					}
				}
				else
				{
					graph.clearSelection();
				}
			}
		}

		reset();
	}

	/**
	 * 
	 */
	protected void fold(Object cell)
	{
		boolean collapse = !graphComponent.getGraph().isCellCollapsed(cell);
		graphComponent.getGraph().foldCells(collapse, false,
				new Object[] { cell });
	}

	/**
	 * 
	 */
	public void reset()
	{
		if (movePreview.isActive())
		{
			movePreview.stop(false, null, 0, 0, false, null);
		}

		setPreviewBounds(null);
		marker.reset();
		cells = null;
		first = null;
		cell = null;
	}

	/**
	 * Returns true if the given cells should be removed from the parent for the specified
	 * mousereleased event.
	 */
	protected boolean shouldRemoveCellFromParent(Object parent, Object[] cells,
			MouseEvent e)
	{
		if (graphComponent.getGraph().getModel().isVertex(parent))
		{
			mxCellState pState = graphComponent.getGraph().getView().getState(
					parent);

			return pState != null && !pState.contains(e.getX(), e.getY());
		}

		return false;
	}

	/**
	 * 
	 */
	protected Object[] moveCells(Object[] cells, double dx, double dy,
			boolean clone, Object target, MouseEvent e)
	{
		mxGraph graph = graphComponent.getGraph();

		if (clone)
		{
			// FIXME: Add to move preview as well
			cells = graph.getCloneableCells(cells);
		}

		return graph.moveCells(cells, dx, dy, clone, target, e.getPoint());
	}

	/**
	 * Paints the placeholder preview using mxConstants.PREVIEW_BORDER.
	 */
	public void paint(Graphics g)
	{
		if (first != null && previewBounds != null)
		{
			mxConstants.PREVIEW_BORDER.paintBorder(graphComponent, g,
					previewBounds.x, previewBounds.y, previewBounds.width,
					previewBounds.height);
		}
	}

	/**
	 * 
	 */
	protected MouseEvent createEvent(DropTargetEvent e)
	{
		JComponent component = getDropTarget(e);
		Point location = null;
		int action = 0;

		if (e instanceof DropTargetDropEvent)
		{
			location = ((DropTargetDropEvent) e).getLocation();
			action = ((DropTargetDropEvent) e).getDropAction();
		}
		else if (e instanceof DropTargetDragEvent)
		{
			location = ((DropTargetDragEvent) e).getLocation();
			action = ((DropTargetDragEvent) e).getDropAction();
		}

		if (location != null)
		{
			location = convertPoint(location);
			Rectangle r = graphComponent.getViewport().getViewRect();
			location.translate(r.x, r.y);
		}

		// LATER: Fetch state of modifier keys from event or via global
		// key listener using Toolkit.getDefaultToolkit().addAWTEventListener(
		// new AWTEventListener() {...}, AWTEvent.KEY_EVENT_MASK). Problem
		// is the event does not contain the modifier keys and the global
		// handler is not called during drag and drop.
		int mod = (action == TransferHandler.COPY) ? InputEvent.CTRL_MASK : 0;

		return new MouseEvent(component, 0, System.currentTimeMillis(), mod,
				location.x, location.y, 1, false, MouseEvent.BUTTON1);
	}

	/**
	 * 
	 */
	public Point convertPoint(Point pt)
	{
		pt = SwingUtilities.convertPoint(graphComponent, pt, graphComponent
				.getGraphControl());

		pt.x -= graphComponent.getHorizontalScrollBar().getValue();
		pt.y -= graphComponent.getVerticalScrollBar().getValue();

		return pt;
	}

	/**
	 * Helper method to return the component for a drop target event.
	 */
	protected static final mxGraphTransferHandler getGraphTransferHandler(
			DropTargetEvent e)
	{
		JComponent component = getDropTarget(e);
		TransferHandler transferHandler = component.getTransferHandler();

		if (transferHandler instanceof mxGraphTransferHandler)
		{
			return (mxGraphTransferHandler) transferHandler;
		}

		return null;
	}

	/**
	 * Helper method to return the component for a drop target event.
	 */
	protected static final JComponent getDropTarget(DropTargetEvent e)
	{
		return (JComponent) e.getDropTargetContext().getComponent();
	}

}
