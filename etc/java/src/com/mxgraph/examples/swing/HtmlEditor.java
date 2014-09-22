/**
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.examples.swing;

import java.awt.Color;
import java.util.Hashtable;
import java.util.Map;

import javax.swing.UIManager;

import com.mxgraph.examples.swing.editor.BasicGraphEditor;
import com.mxgraph.examples.swing.editor.EditorMenuBar;
import com.mxgraph.model.mxCell;
import com.mxgraph.model.mxGraphModel;
import com.mxgraph.swing.mxGraphComponent;
import com.mxgraph.swing.util.mxSwingConstants;
import com.mxgraph.util.mxConstants;
import com.mxgraph.view.mxCellState;
import com.mxgraph.view.mxEdgeStyle;
import com.mxgraph.view.mxGraph;
import com.mxgraph.view.mxStylesheet;

public class HtmlEditor extends BasicGraphEditor
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -4245198310550126119L;
	/**
	 * 
	 */
	public static boolean USE_HTML = true;

	/**
	 * 
	 */
	public HtmlEditor()
	{
		super("mxGraph for JFC/Swing", new mxGraphComponent(new mxGraph(
				new mxGraphModel()
				{
					public String getStyle(Object cell)
					{
						if (isEdge(cell)
								&& (isEdge(getTerminal(cell, true)) || isEdge(getTerminal(
										cell, true))))
						{
							return "annotation";
						}

						return super.getStyle(cell);
					}
				})
		{
			public boolean isCellVisible(Object cell)
			{
				if (model.isEdge(cell))
				{
					Object src = view.getVisibleTerminal(cell, true);
					Object trg = view.getVisibleTerminal(cell, false);

					if (!convertValueToString(src).contains("action")
							&& !model.isEdge(src) && !model.isEdge(trg))
					{
						// Uses cell states to compare positions so the dirty region
						// is computed correctly, that is, in the first invocation
						// the edge is still visible as the state of the terminals
						// has not yet been updated
						mxCellState srcState = view.getState(src);
						mxCellState trgState = view.getState(trg);

						if (srcState != null
								&& trgState != null
								&& (srcState.getX() + srcState.getWidth() <= trgState
										.getX() || srcState.getX() >= trgState
										.getX()
										+ trgState.getWidth()))
						{
							return false;
						}
					}
				}

				return super.isCellVisible(cell);
			}
		}));

		final mxGraph graph = graphComponent.getGraph();
		graph.setConnectableEdges(true);
		graphComponent.setToolTips(true);
		graph.setHtmlLabels(USE_HTML);
		graph.setDropEnabled(true);

		mxStylesheet stylesheet = graph.getStylesheet();

		Map<String, Object> style = stylesheet.getDefaultVertexStyle();
		style.put(mxConstants.STYLE_FILLCOLOR, "#C3D9FF");
		style.put(mxConstants.STYLE_GRADIENTCOLOR, "#FFFFFF");
		style.put(mxConstants.STYLE_STROKECOLOR, "#666666");
		style.put(mxConstants.STYLE_FONTCOLOR, "#000000");
		style.put(mxConstants.STYLE_OPACITY, 80);
		style.put(mxConstants.STYLE_SHADOW, true);
		style.put(mxConstants.STYLE_FONTSTYLE, 1);
		style.put(mxConstants.STYLE_FONTSIZE, 12);

		style = stylesheet.getDefaultEdgeStyle();
		style.put(mxConstants.STYLE_EDGE, mxEdgeStyle.ElbowConnector);

		style = new Hashtable<String, Object>(stylesheet.getDefaultEdgeStyle());
		style.put(mxConstants.STYLE_PERIMETER_SPACING, 4);
		style.put(mxConstants.STYLE_DASHED, true);
		style.remove(mxConstants.STYLE_ENDARROW);
		style.remove(mxConstants.STYLE_EDGE);
		stylesheet.putCellStyle("annotation", style);

		Object parent = graph.getDefaultParent();

		String htmlPrefix = "<html><head></head><body style=\"font-family:"
				+ mxConstants.DEFAULT_FONTFAMILIES + ";font-size:"
				+ mxConstants.DEFAULT_FONTSIZE + "pt;\">";

		graph.getModel().beginUpdate();
		try
		{
			mxCell v1 = (mxCell) graph.insertVertex(parent, null,
					(USE_HTML) ? htmlPrefix + "<b>Hello</b></body>" : "Hello",
					graph.snap(240), graph.snap(20), 100, 40);
			mxCell v2 = (mxCell) graph.insertVertex(parent, null,
					(USE_HTML) ? htmlPrefix + "Hello</body>" : "World!", graph
							.snap(240), graph.snap(150), 100, 40);
			mxCell v3 = (mxCell) graph.insertVertex(parent, null,
					(USE_HTML) ? htmlPrefix + "action</body>" : "action", graph
							.snap(80), graph.snap(20), 100, 40);
			graph.insertEdge(parent, null, "", v1, v2);
			graph.insertEdge(parent, null, "", v3, v1, "annotation");
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * 
	 * @param args
	 */
	public static void main(String[] args)
	{
		try
		{
			UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
		}
		catch (Exception e1)
		{
			e1.printStackTrace();
		}

		//mxGraphics2DCanvas.ANTIALIAS = false;
		mxSwingConstants.SHADOW_COLOR = Color.LIGHT_GRAY;

		HtmlEditor editor = new HtmlEditor();
		editor.createFrame(new EditorMenuBar(editor)).setVisible(true);
	}

}
