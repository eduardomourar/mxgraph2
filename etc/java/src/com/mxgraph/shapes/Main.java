package com.mxgraph.shapes;

import java.awt.Graphics;

import javax.swing.JFrame;
import javax.swing.JPanel;

public class Main extends JPanel
{
	/**
	 * 
	 */
	private static final long serialVersionUID = -2707712944901661771L;

	/**
	 * 
	 */
	protected CloudShape cloud = new CloudShape();
	
	/**
	 * 
	 */
	protected ActorShape actor = new ActorShape();

	public Main()
	{
		/*mxGraph graph = new mxGraph();
		Object parent = graph.getDefaultParent();

		graph.getModel().beginUpdate();
		try
		{
			Object v1 = graph.insertVertex(parent, null, "Hello", 20, 20, 80,
					30);
			Object v2 = graph.insertVertex(parent, null, "World!", 240, 150,
					80, 30);
			graph.insertEdge(parent, null, "Edge", v1, v2);
		}
		finally
		{
			graph.getModel().endUpdate();
		}

		mxGraphComponent graphComponent = new mxGraphComponent(graph);
		setLayout(new BorderLayout());
		add(graphComponent, BorderLayout.CENTER);
		setBorder(null);*/
	}

	public void paint(Graphics g)
	{
		super.paint(g);
		cloud.paint(g, 10, 10, 100, 100);
		actor.paint(g, 140, 10, 50, 100);
	}

	public static void main(String[] args)
	{
		JFrame frame = new JFrame("Shapes");
		frame.getContentPane().add(new Main());
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setSize(400, 320);
		frame.setVisible(true);
	}
}
