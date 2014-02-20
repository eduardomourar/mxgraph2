package com.mxgraph.examples.swing.creator;

import java.awt.event.ActionEvent;

import javax.swing.AbstractAction;
import javax.swing.JMenu;

import com.mxgraph.examples.swing.creator.GraphCreator.GraphType;
import com.mxgraph.examples.swing.editor.BasicGraphEditor;
import com.mxgraph.examples.swing.editor.EditorMenuBar;
import com.mxgraph.swing.mxGraphComponent;
import com.mxgraph.view.mxGraph;

public class CreatorMenuBar extends EditorMenuBar
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 8254903278936485293L;

	public enum AnalyzeType { IS_CONNECTED, IS_SIMPLE, IS_CYCLIC_DIRECTED, IS_CYCLIC_UNDIRECTED, COMPLEMENTARY, REGULARITY, COMPONENTS, MAKE_CONNECTED, MAKE_SIMPLE, IS_TREE, ONE_SPANNING_TREE, IS_DIRECTED, GET_CUT_VERTEXES, GET_CUT_EDGES, GET_SOURCES, GET_SINKS, PLANARITY, IS_BICONNECTED, GET_BICONNECTED, SPANNING_TREE, FLOYD_ROY_WARSHALL }

	/**
	 * The graph creator factory
	 */
	protected static GraphCreator graphCreator = new GraphCreator();;

	public CreatorMenuBar(BasicGraphEditor editor)
	{
		super(editor);
		JMenu menu = null;
		// Creates a developer menu
		menu = add(new JMenu("Generate"));
		menu.add(editor.bind("Null Graph", new InsertGraph(GraphType.NULL)));
		menu.add(editor.bind("Complete Graph", new InsertGraph(GraphType.COMPLETE)));
		menu.add(editor.bind("N-regular Graph", new InsertGraph(GraphType.NREGULAR)));
		menu.add(editor.bind("Grid", new InsertGraph(GraphType.GRID)));
		menu.add(editor.bind("Bipartite", new InsertGraph(GraphType.BIPARTITE)));
		menu.add(editor.bind("Complete Bipartite", new InsertGraph(GraphType.COMPLETE_BIPARTITE)));
		menu.add(editor.bind("Knight's Graph", new InsertGraph(GraphType.KNIGHT)));
		menu.add(editor.bind("King's Graph", new InsertGraph(GraphType.KING)));
		menu.add(editor.bind("Input from adj. matrix", new InsertGraph(GraphType.FROM_ADJ_MATRIX)));
		menu.add(editor.bind("Petersen", new InsertGraph(GraphType.PETERSEN)));
		menu.add(editor.bind("Path", new InsertGraph(GraphType.PATH)));
		menu.add(editor.bind("Star", new InsertGraph(GraphType.STAR)));
		menu.add(editor.bind("Wheel", new InsertGraph(GraphType.WHEEL)));
		menu.add(editor.bind("Friendship Windmill", new InsertGraph(GraphType.FRIENDSHIP_WINDMILL)));
		menu.add(editor.bind("Full Windmill", new InsertGraph(GraphType.FULL_WINDMILL)));
		menu.addSeparator();
		menu.add(editor.bind("Simple Random", new InsertGraph(GraphType.SIMPLE_RANDOM)));
		menu.add(editor.bind("Simple Random Tree", new InsertGraph(GraphType.SIMPLE_RANDOM_TREE)));
		menu.addSeparator();
		menu.add(editor.bind("Reset Style", new InsertGraph(GraphType.RESET_STYLE)));

		menu = add(new JMenu("Analyze"));
		menu.add(editor.bind("Is Connected", new AnalyzeGraph(AnalyzeType.IS_CONNECTED)));
		menu.add(editor.bind("Is Simple", new AnalyzeGraph(AnalyzeType.IS_SIMPLE)));
		menu.add(editor.bind("Is Directed Cyclic", new AnalyzeGraph(AnalyzeType.IS_CYCLIC_DIRECTED)));
		menu.add(editor.bind("Is Undirected Cyclic", new AnalyzeGraph(AnalyzeType.IS_CYCLIC_UNDIRECTED)));
		menu.add(editor.bind("BFS (Breadth-First Seach)", new InsertGraph(GraphType.BFS)));
		menu.add(editor.bind("DFS (Depth-First Seach)", new InsertGraph(GraphType.DFS)));
		menu.add(editor.bind("Complementary", new AnalyzeGraph(AnalyzeType.COMPLEMENTARY)));
		menu.add(editor.bind("Regularity", new AnalyzeGraph(AnalyzeType.REGULARITY)));
		menu.add(editor.bind("Dijkstra", new InsertGraph(GraphType.DIJKSTRA)));
		menu.add(editor.bind("Bellman-Ford", new InsertGraph(GraphType.BELLMAN_FORD)));
		menu.add(editor.bind("Flory-Roy-Warshall", new AnalyzeGraph(AnalyzeType.FLOYD_ROY_WARSHALL)));
		menu.add(editor.bind("Get Components", new AnalyzeGraph(AnalyzeType.COMPONENTS)));
		menu.add(editor.bind("Make Connected", new AnalyzeGraph(AnalyzeType.MAKE_CONNECTED)));
		menu.add(editor.bind("Make Simple", new AnalyzeGraph(AnalyzeType.MAKE_SIMPLE)));
		menu.add(editor.bind("Is Tree", new AnalyzeGraph(AnalyzeType.IS_TREE)));
		menu.add(editor.bind("One Spanning Tree", new AnalyzeGraph(AnalyzeType.ONE_SPANNING_TREE)));
		menu.add(editor.bind("Make tree directed", new InsertGraph(GraphType.MAKE_TREE_DIRECTED)));
		menu.add(editor.bind("Knight's Tour", new InsertGraph(GraphType.KNIGHT_TOUR)));
		menu.add(editor.bind("Get adjacency matrix", new InsertGraph(GraphType.GET_ADJ_MATRIX)));
		menu.add(editor.bind("Is directed", new AnalyzeGraph(AnalyzeType.IS_DIRECTED)));
		menu.add(editor.bind("Indegree", new InsertGraph(GraphType.INDEGREE)));
		menu.add(editor.bind("Outdegree", new InsertGraph(GraphType.OUTDEGREE)));
		menu.add(editor.bind("Is cut vertex", new InsertGraph(GraphType.IS_CUT_VERTEX)));
		menu.add(editor.bind("Get cut vertexes", new AnalyzeGraph(AnalyzeType.GET_CUT_VERTEXES)));
		menu.add(editor.bind("Is cut edge", new InsertGraph(GraphType.IS_CUT_EDGE)));
		menu.add(editor.bind("Get cut edges", new AnalyzeGraph(AnalyzeType.GET_CUT_EDGES)));
		menu.add(editor.bind("Get sources", new AnalyzeGraph(AnalyzeType.GET_SOURCES)));
		menu.add(editor.bind("Get sinks", new AnalyzeGraph(AnalyzeType.GET_SINKS)));
		menu.add(editor.bind("Planarity", new AnalyzeGraph(AnalyzeType.PLANARITY)));
		menu.add(editor.bind("Is biconnected", new AnalyzeGraph(AnalyzeType.IS_BICONNECTED)));
		menu.add(editor.bind("Get biconnected components", new AnalyzeGraph(AnalyzeType.GET_BICONNECTED)));
//		menu.add(editor.bind("Get spanning tree", new AnalyzeGraph(AnalyzeType.SPANNING_TREE)));
	}

	/**
	 *
	 */
	@SuppressWarnings("serial")
	public static class InsertGraph extends AbstractAction
	{

		/**
		 * 
		 */
		protected GraphType graphType;

		/**
		 * 
		 */
		public InsertGraph(GraphType tree)
		{
			this.graphType = tree;
		}

		/**
		 * 
		 */
		public void actionPerformed(ActionEvent e)
		{
			if (e.getSource() instanceof mxGraphComponent)
			{
				mxGraphComponent graphComponent = (mxGraphComponent) e
						.getSource();
				mxGraph graph = graphComponent.getGraph();
				graphCreator.insertGraph(graph, graphType);
			}
		}
	}


	/**
	 *
	 */
	@SuppressWarnings("serial")
	public static class AnalyzeGraph extends AbstractAction
	{

		/**
		 * 
		 */
		protected AnalyzeType analyzeType;

		/**
		 * 
		 */
		public AnalyzeGraph(AnalyzeType analyzeType)
		{
			this.analyzeType = analyzeType;
		}
		public void actionPerformed(ActionEvent e)
		{
			if (e.getSource() instanceof mxGraphComponent)
			{
				mxGraphComponent graphComponent = (mxGraphComponent) e
						.getSource();
				mxGraph graph = graphComponent.getGraph();
				if (analyzeType == AnalyzeType.IS_CONNECTED)
					graphCreator.isConnected(graph);
				else if (analyzeType == AnalyzeType.IS_SIMPLE)
					graphCreator.isSimple(graph);
				else if (analyzeType == AnalyzeType.IS_CYCLIC_DIRECTED)
					graphCreator.isCyclicDirected(graph);
				else if (analyzeType == AnalyzeType.IS_CYCLIC_UNDIRECTED)
					graphCreator.isCyclicUndirected(graph);
				else if (analyzeType == AnalyzeType.COMPLEMENTARY)
					graphCreator.complementaryGraph(graph);
				else if (analyzeType == AnalyzeType.REGULARITY)
					graphCreator.regularity(graph);
				else if (analyzeType == AnalyzeType.COMPONENTS)
					graphCreator.getGraphComponents(graph);
				else if (analyzeType == AnalyzeType.MAKE_CONNECTED)
					graphCreator.makeConnected(graph, false, false, 0, 0);
				else if (analyzeType == AnalyzeType.MAKE_SIMPLE)
					graphCreator.makeSimple(graph);
				else if (analyzeType == AnalyzeType.IS_TREE)
					graphCreator.isTree(graph);
				else if (analyzeType == AnalyzeType.ONE_SPANNING_TREE)
					graphCreator.oneSpanningTree(graph,true,true, false, false, 0, 0);
				else if (analyzeType == AnalyzeType.IS_DIRECTED)
					graphCreator.isDirected(graph);
				else if (analyzeType == AnalyzeType.GET_CUT_VERTEXES)
					graphCreator.getCutVertexes(graph);
				else if (analyzeType == AnalyzeType.GET_CUT_EDGES)
					graphCreator.getCutEdges(graph);
				else if (analyzeType == AnalyzeType.GET_SOURCES)
					graphCreator.getSourceVertexes(graph);
				else if (analyzeType == AnalyzeType.GET_SINKS)
					graphCreator.getSinkVertexes(graph);
				else if (analyzeType == AnalyzeType.PLANARITY)
					graphCreator.isPlanar(graph);
				else if (analyzeType == AnalyzeType.IS_BICONNECTED)
					graphCreator.isBiconnected(graph);
				else if (analyzeType == AnalyzeType.GET_BICONNECTED)
					graphCreator.getBiconnectedComponents(graph);
				else if (analyzeType == AnalyzeType.SPANNING_TREE)
					graphCreator.getSpanningTree(graph);
				else if (analyzeType == AnalyzeType.FLOYD_ROY_WARSHALL)
					graphCreator.floydRoyWarshall(graph);
			}
		}
	}
}
