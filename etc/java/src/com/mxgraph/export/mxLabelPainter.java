package com.mxgraph.export;

import com.mxgraph.util.mxConstants;
import com.mxgraph.util.mxRectangle;
import com.mxgraph.util.mxUtils;
import com.mxgraph.view.mxCellState;

public class mxLabelPainter implements mxIShape2
{
	public static String DEFAULT_FONTCOLOR = "#000000";

	public void paint(mxICanvas2 canvas, mxCellState state)
	{
		if (state != null)
		{
			paintLabel(canvas, state, state.getLabelBounds(),
					getLabelForCell(state));
		}
	}

	protected String getLabelForCell(mxCellState state)
	{
		return state.getView().getGraph().getLabel(state.getCell());
	}

	public void paintLabel(mxICanvas2 canvas, mxCellState state,
			mxRectangle bounds, String label)
	{
		if (bounds != null && label != null && label.length() > 0)
		{
			paintLabelBackground(canvas, state, bounds);
			paintLabelForeground(canvas, state, bounds, label);
		}
	}

	protected void paintLabelBackground(mxICanvas2 c, mxCellState state,
			mxRectangle bounds)
	{
		String stroke = getLabelBorderColor(state);
		String fill = getLabelBackgroundColor(state);

		if (stroke != null || fill != null)
		{
			if (fill != null)
			{
				c.setFillColor(fill);
			}

			if (stroke != null)
			{
				c.setStrokeWidth(getStrokeWidth(state));
				c.setStrokeColor(stroke);
			}

			c.rect(bounds.getX(), bounds.getY(), bounds.getWidth(),
					bounds.getHeight());

			if (fill != null && stroke != null)
			{
				c.fillAndStroke();
			}
			else if (fill != null)
			{
				c.fill();
			}
			else if (stroke != null)
			{
				c.stroke();
			}
		}
	}

	protected String getLabelBorderColor(mxCellState state)
	{
		return mxUtils.getString(state.getStyle(),
				mxConstants.STYLE_LABEL_BORDERCOLOR);
	}

	protected String getLabelBackgroundColor(mxCellState state)
	{
		return mxUtils.getString(state.getStyle(),
				mxConstants.STYLE_LABEL_BACKGROUNDCOLOR);
	}

	protected double getStrokeWidth(mxCellState state)
	{
		return mxUtils.getDouble(state.getStyle(),
				mxConstants.STYLE_STROKEWIDTH, 1);
	}

	protected void paintLabelForeground(mxICanvas2 c, mxCellState state,
			mxRectangle bounds, String label)
	{
		c.setFontColor(getFontColor(state));
		c.setFontFamily(getFontFamily(state));
		c.setFontStyle(getFontStyle(state));
		c.setFontSize(getFontSize(state));
		c.setAlpha(getFontAlpha(state));

		c.text(bounds.getX(), bounds.getY(), bounds.getWidth(),
				bounds.getHeight(), label, null, null, !getHorizontal(state));
	}

	protected double getFontAlpha(mxCellState state)
	{
		return mxUtils.getDouble(state.getStyle(),
				mxConstants.STYLE_TEXT_OPACITY, 100) / 100;
	}

	protected String getFontColor(mxCellState state)
	{
		return mxUtils.getString(state.getStyle(), mxConstants.STYLE_FONTCOLOR,
				DEFAULT_FONTCOLOR);
	}

	protected String getFontFamily(mxCellState state)
	{
		return mxUtils.getString(state.getStyle(),
				mxConstants.STYLE_FONTFAMILY, mxConstants.DEFAULT_FONTFAMILY);
	}

	protected int getFontStyle(mxCellState state)
	{
		return mxUtils.getInt(state.getStyle(), mxConstants.STYLE_FONTSTYLE, 0);
	}

	protected float getFontSize(mxCellState state)
	{
		return mxUtils.getFloat(state.getStyle(), mxConstants.STYLE_FONTSIZE,
				mxConstants.DEFAULT_FONTSIZE);
	}

	protected boolean getHorizontal(mxCellState state)
	{
		return mxUtils.isTrue(state.getStyle(), mxConstants.STYLE_HORIZONTAL,
				true);
	}

}
