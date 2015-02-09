package com.mxgraph.examples.swing.creator;

import java.awt.Color;

import javax.swing.UIManager;

import com.mxgraph.examples.swing.GraphEditor;
import com.mxgraph.swing.mxGraphComponent;
import com.mxgraph.swing.util.mxSwingConstants;

public class GraphEditorCreator extends GraphEditor
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 7752858088309553197L;

	public GraphEditorCreator()
	{
		this("mxGraph Editor extended", new CreatorGraphComponent(new CustomGraph()));
	}

	/**
	 * 
	 */
	public GraphEditorCreator(String appTitle, mxGraphComponent component)
	{
		super(appTitle, component);
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

		mxSwingConstants.SHADOW_COLOR = Color.LIGHT_GRAY;
		GraphEditor editor = new GraphEditorCreator();
		editor.createFrame(new CreatorMenuBar(editor)).setVisible(true);
	}

	/**
	* 
	*/
	public static class CreatorGraphComponent extends CustomGraphComponent
	{

		/**
		 * 
		 */
		private static final long serialVersionUID = -6833603133512882012L;

		/**
		 * 
		 * @param graph
		 */
		public CreatorGraphComponent(CustomGraph graph)
		{
			super(graph);

			setGridVisible(false);
			getViewport().setBackground(Color.BLACK);
		}
	}
}
