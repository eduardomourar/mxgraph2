package com.mxgraph.export;

import java.util.Hashtable;
import java.util.Map;

import com.mxgraph.model.mxIGraphModel;
import com.mxgraph.util.mxConstants;
import com.mxgraph.util.mxUtils;
import com.mxgraph.view.mxCellState;

public class mxCellPainter
{
	protected Map<String, mxIShape2> shapes = new Hashtable<String, mxIShape2>();

	protected mxIShape2 labelPainter = new mxLabelPainter();

	public mxCellPainter()
	{
		this(new mxLabelPainter());
	}

	public mxCellPainter(mxIShape2 labelPainter)
	{
		this.labelPainter = labelPainter;
	}

	public Map<String, mxIShape2> getShapes()
	{
		return shapes;
	}

	public void setShapes(Map<String, mxIShape2> value)
	{
		shapes = value;
	}
	
	public mxIShape2 getLabelPainter()
	{
		return labelPainter;
	}
	
	public void setLabelPainter(mxIShape2 value)
	{
		labelPainter = value;
	}

	public void paint(mxICanvas2 canvas, mxCellState state)
	{
		if (state != null)
		{
			paintCell(canvas, state);
			paintDescendants(canvas, state);
		}
	}

	protected void paintCell(mxICanvas2 canvas, mxCellState state)
	{
		paintBackground(canvas, state);
		paintForeground(canvas, state);
	}

	protected void paintDescendants(mxICanvas2 canvas, mxCellState state)
	{
		mxIGraphModel model = state.getView().getGraph().getModel();
		int childCount = model.getChildCount(state.getCell());

		for (int i = 0; i < childCount; i++)
		{
			mxCellState childState = state.getView().getState(
					model.getChildAt(state.getCell(), i));
			paint(canvas, childState);
		}
	}

	protected void paintBackground(mxICanvas2 canvas, mxCellState state)
	{
		mxIShape2 shape = getShapeForCell(state);

		if (shape != null)
		{
			shape.paint(canvas, state);
		}
	}

	protected void paintForeground(mxICanvas2 canvas, mxCellState state)
	{
		labelPainter.paint(canvas, state);
	}

	protected mxIShape2 getShapeForCell(mxCellState state)
	{
		mxIShape2 result = null;
		String key = mxUtils.getString(state.getStyle(),
				mxConstants.STYLE_SHAPE);

		if (key != null)
		{
			result = shapes.get(key);
		}

		return result;
	}

}
