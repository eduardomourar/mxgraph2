package com.mxgraph.export;

import com.mxgraph.util.mxConstants;
import com.mxgraph.util.mxRectangle;
import com.mxgraph.util.mxUtils;
import com.mxgraph.view.mxCellState;

public class mxBasicShape implements mxIShape2
{
	public static String DEFAULT_STROKECOLOR = "#000000";

	public void paint(mxICanvas2 c, mxCellState state)
	{
		c.setAlpha(getAlpha(state));
		//c.setShadowEnabled(getShadow(state));
		c.setStrokeWidth(getStrokeWidth(state));
		c.setStrokeColor(getStrokeColor(state));

		String gradient = getGradientColor(state);
		String fill = getFillColor(state);

		if (fill != null)
		{
			if (gradient != null)
			{
				mxRectangle bounds = getGradientBounds(state);
				c.setGradient(fill, gradient, bounds.getX(), bounds.getY(),
						bounds.getWidth(), bounds.getHeight(), null);
			}
			else
			{
				c.setFillColor(fill);
			}
		}
	}

	protected double getAlpha(mxCellState state)
	{
		return mxUtils.getDouble(state.getStyle(), mxConstants.STYLE_OPACITY,
				100) / 100;
	}

	protected boolean getShadow(mxCellState state)
	{
		return mxUtils
				.isTrue(state.getStyle(), mxConstants.STYLE_SHADOW, false);
	}

	protected double getStrokeWidth(mxCellState state)
	{
		return mxUtils.getDouble(state.getStyle(),
				mxConstants.STYLE_STROKEWIDTH, 1);
	}

	protected String getStrokeColor(mxCellState state)
	{
		return mxUtils.getString(state.getStyle(),
				mxConstants.STYLE_STROKECOLOR, DEFAULT_STROKECOLOR);
	}

	protected String getFillColor(mxCellState state)
	{
		return mxUtils.getString(state.getStyle(), mxConstants.STYLE_FILLCOLOR);
	}

	protected String getGradientColor(mxCellState state)
	{
		return mxUtils.getString(state.getStyle(),
				mxConstants.STYLE_GRADIENTCOLOR);
	}

	protected mxRectangle getGradientBounds(mxCellState state)
	{
		// Computes bounding box for swimlane gradients
		double h = state.getHeight();

		// FIXME: Add orientation
		// FIXME: Override in swimlane shape, do not use isSwimlane
		// LATER: Make this generic, use orientation
		if (state.getView().getGraph().isSwimlane(state.getCell()))
		{
			h = mxUtils.getDouble(state.getStyle(),
					mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE);
		}

		return new mxRectangle(state.getX(), state.getY(), state.getWidth(), h);
	}

}
