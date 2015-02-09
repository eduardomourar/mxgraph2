/*
 * Copyright (c) 2005-2009, David Benson
 *
 * All rights reserved.
 *
 * This file is licensed under the JGraph software license, a copy of which
 * will have been provided to you in the file LICENSE at the root of your
 * installation directory. If you are unable to locate this file please
 * contact JGraph sales for another copy.
 */
package com.mxgraph.examples.swing.creator;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Frame;
import java.awt.GridLayout;
import java.awt.Toolkit;
import java.awt.Window;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Stack;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JDialog;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.border.EmptyBorder;

import com.mxgraph.analysis.mxDistanceCostFunction;
import com.mxgraph.analysis.mxGraphAnalysis;
import com.mxgraph.analysis.mxICostFunction;
import com.mxgraph.layout.mxCircleLayout;
import com.mxgraph.layout.mxCompactTreeLayout;
import com.mxgraph.layout.mxOrganicLayout;
import com.mxgraph.model.mxCell;
import com.mxgraph.model.mxGraphModel;
import com.mxgraph.model.mxIGraphModel;
import com.mxgraph.view.mxGraph;
import com.mxgraph.view.mxGraph.mxICellVisitor;

/**
 * A helper class that creates graphs. Currently supports:
 * 
 * Graph generation:
 * 	1. Null
 * 	2. Complete
 *  3. N-regular (n-valent)
 *  4. Grid
 *  5. Bipartite
 *  6. Complete Bipartite
 *  7. Knight's graph
 *  8. King's graph
 *  9. Input from adj. matrix
 *  10. Petersen
 *  11. Path
 *  12. Star
 *  13. Wheel
 *  14. Friendship Windmill
 *  15. Full Windmill
 *  16. Simple Random - a configurable basic graph generator
 *  17. Simple Random Tree
 *  
 *  
 * Analysis:
 *  1. Is connected
 *  2. Is simple
 *  3. Is directed cyclic
 *  4. Is undirected cyclic
 *  5. BFS (Breadth-first Search)
 *  6. DFS (Depth-first Search)
 *  7. Find complementary
 *  8. Find regularity
 *  9. Find shortest path (Dijsktra's)
 *  10. Bellman-Ford
 *  11. Find components
 *  12. Make connected
 *  13. Make simple
 *  14. Is tree
 *  15. One spanning tree
 *  16. Make tree directed
 *  17. Knight's Tour
 *  18. Get adjacency matrix
 *  19. Is directed
 *  20. Indegree
 *  21. Outdegree
 *  22. Is cut vertex
 *  23. Get cut vertexes
 *  24. Is cut edge
 *  25. Get cut edges
 *  26. Get sources
 *  27. Get sinks
 *  28. Planarity (WIP)
 *  29. Is biconnected
 *  30. Get bicomponents
 *  31. Floyd-Roy-Warshall
 * 
 */
public class GraphCreator
{

	/**
	 * If true, various messages are sent to the console
	 */
	private boolean developmentMode = true;

	public enum GraphType
	{
		FULLY_CONNECTED, RANDOM_CONNECTED, TREE, FLOW, NULL, COMPLETE, NREGULAR, GRID, BIPARTITE, COMPLETE_BIPARTITE, BASIC_TREE, SIMPLE_RANDOM, BFS, DFS, DIJKSTRA, MAKE_TREE_DIRECTED, SIMPLE_RANDOM_TREE, KNIGHT_TOUR, KNIGHT, GET_ADJ_MATRIX, FROM_ADJ_MATRIX, PETERSEN, WHEEL, STAR, PATH, FRIENDSHIP_WINDMILL, FULL_WINDMILL, INDEGREE, OUTDEGREE, IS_CUT_VERTEX, IS_CUT_EDGE, RESET_STYLE, KING, BELLMAN_FORD
	}

	/**
	 * The default style for vertexes
	 */
	private String basicVertexStyleString = "ellipse;strokeColor=black;fillColor=orange;gradientColor=none";

	/**
	 * The default style for edges 
	 */
	private String basicEdgeStyleString = "strokeColor=red;noEdgeStyle=1;";

	private String basicArrowStyleString = "endArrow=block;";

	/**
	 * Whether or not insert at performed directly on the model
	 */
	private boolean insertIntoModel = false;

	/**
	 * Number of nodes
	 */
	protected int numNodes = 6;

	/**
	 * Number of edges
	 */
	protected int numEdges = 6;

	/**
	 * Valence
	 */
	protected int valence = 2;

	/**
	 * Number of rows for a grid graph
	 */
	protected int numRows = 8;

	protected int numVertexesInBranch = 3;

	public int getNumVertexesInBranch()
	{
		return numVertexesInBranch;
	}

	public void setNumVertexesInBranch(int numVertexesInBranch)
	{
		this.numVertexesInBranch = numVertexesInBranch;
	}

	/**
	 * Number of columns for a grid graph
	 */
	protected int numColumns = 8;

	protected int minWeight = 1;

	public int getMinWeight()
	{
		return minWeight;
	}

	public void setMinWeight(int minWeight)
	{
		this.minWeight = minWeight;
	}

	public int getMaxWeight()
	{
		return maxWeight;
	}

	public void setMaxWeight(int maxWeight)
	{
		this.maxWeight = maxWeight;
	}

	protected int maxWeight = 10;

	/**
	 * Number of vertexes for the left group in a bipartite graph
	 */
	protected int numVertexesLeft = 5;

	/**
	 * Number of vertexes for the right group in a bipartite graph
	 */
	protected int numVertexesRight = 5;

	/**
	 * The start vertex (by value) for various algorithms
	 */
	protected int startVertexValue = 0;

	/**
	 * The end vertex (by value) for various algorithms (mostly pathfinding)
	 */
	protected int endVertexValue = 0;

	protected int numBranches = 4;

	public int getNumBranches()
	{
		return numBranches;
	}

	public void setNumBranches(int numBranches)
	{
		this.numBranches = numBranches;
	}

	/**
	 * If set, arrowheads are drawn
	 */
	protected boolean arrows = false;

	protected boolean weighted = false;

	/**
	 * If set, self-loops are allowed during graph generation
	 */
	protected boolean allowSelfLoops = false;

	/**
	 * If set, parallel edges are allowed during graph generation
	 */
	protected boolean allowMultipleEdges = false;

	/**
	 * If set, the generated graph will be always connected
	 */
	protected boolean forceConnected = false;

	/**
	 * Spacing for groups in a bipartite graph
	 */
	protected float groupSpacing = 200;

	/**
	 * Grid spacing for a grid graph
	 */
	protected float gridSpacing = 80;

	protected GraphConfigDialog dialog;

	/**
	 * Entry method for inserting a sample graph
	 * 
	 * @param graph
	 *            the JGraph to perform the insert on
	 * @param graphType
	 *            which sample graph type is to be inserted
	 */
	public void insertGraph(mxGraph graph, GraphType graphType)
	{
		// dialog = new FactoryConfigDialog();
		String dialogText = "";
		if (graphType == GraphType.NULL)
			dialogText = "Configure null graph";
		else if (graphType == GraphType.COMPLETE)
			dialogText = "Configure complete graph";
		else if (graphType == GraphType.NREGULAR)
			dialogText = "Configure n-regular graph";
		else if (graphType == GraphType.GRID)
			dialogText = "Configure grid graph";
		else if (graphType == GraphType.BIPARTITE)
			dialogText = "Configure bipartite graph";
		else if (graphType == GraphType.COMPLETE_BIPARTITE)
			dialogText = "Configure complete bipartite graph";
		else if (graphType == GraphType.BFS)
			dialogText = "Configure BFS algorithm";
		else if (graphType == GraphType.BFS)
			dialogText = "Configure DFS algorithm";
		else if (graphType == GraphType.DIJKSTRA)
			dialogText = "Configure Dijkstra's algorithm";
		else if (graphType == GraphType.BELLMAN_FORD)
			dialogText = "Configure Bellman-Ford algorithm";
		else if (graphType == GraphType.MAKE_TREE_DIRECTED)
			dialogText = "Configure make tree directed algorithm";
		else if (graphType == GraphType.KNIGHT_TOUR)
			dialogText = "Configure knight's tour";
		else if (graphType == GraphType.GET_ADJ_MATRIX)
			dialogText = "Configure adjacency matrix";
		else if (graphType == GraphType.FROM_ADJ_MATRIX)
			dialogText = "Input adjacency matrix";
		else if (graphType == GraphType.PETERSEN)
			dialogText = "Configure Petersen graph";
		else if (graphType == GraphType.WHEEL)
			dialogText = "Configure Wheel graph";
		else if (graphType == GraphType.STAR)
			dialogText = "Configure Star graph";
		else if (graphType == GraphType.PATH)
			dialogText = "Configure Path graph";
		else if (graphType == GraphType.FRIENDSHIP_WINDMILL)
			dialogText = "Configure Friendship Windmill graph";
		else if (graphType == GraphType.INDEGREE)
			dialogText = "Configure indegree analysis";
		else if (graphType == GraphType.OUTDEGREE)
			dialogText = "Configure outdegree analysis";
		dialog = new GraphConfigDialog(graphType, dialogText);
		dialog.configureLayout(graph, graphType);
		dialog.setModal(true);
		center(dialog);
		dialog.setVisible(true);
	}

	/**
	 * A Dialog that configures various aspects of either graph or algorithms. The same dialog is used for all methods configuration, but with different entries
	 */
	public class GraphConfigDialog extends JDialog
	{
		private static final long serialVersionUID = 1535851135077957959L;

		protected boolean insertGraph = false;

		protected mxGraph graph;

		protected GraphType graphType;

		protected JTextField maxTreeNodeChildren = new JTextField();

		protected JTextField numNodes = new JTextField();

		protected JTextField numEdges = new JTextField();

		protected JTextField valence = new JTextField();

		protected JTextField numRows = new JTextField();

		protected JTextField numColumns = new JTextField();

		protected JTextField gridSpacing = new JTextField();

		protected JTextField numVertexesLeft = new JTextField();

		protected JTextField numVertexesRight = new JTextField();

		protected JTextField groupSpacing = new JTextField();

		protected JCheckBox arrowsBox = new JCheckBox();

		protected JTextField startVertexValue = new JTextField();

		protected JTextField endVertexValue = new JTextField();

		protected JCheckBox selfLoopBox = new JCheckBox();

		protected JCheckBox multipleEdgeBox = new JCheckBox();

		protected JCheckBox forceConnectedBox = new JCheckBox();

		protected JCheckBox weightedBox = new JCheckBox();

		protected JTextField maxWeight = new JTextField();

		protected JTextField minWeight = new JTextField();

		protected JTextField numBranches = new JTextField();

		protected JTextField numVertexesInBranch = new JTextField();

		public GraphConfigDialog(final GraphType graphType2, String dialogText)
		{
			super((Frame) null, dialogText, true);
			if ((graphType2 == GraphType.NULL)
					|| (graphType2 == GraphType.SIMPLE_RANDOM_TREE))
			{
				JPanel panel = new JPanel(new GridLayout(1, 2, 4, 4));
				panel.add(new JLabel("Number of nodes"));
				panel.add(numNodes);

				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int nodeCount = Integer.parseInt(numNodes.getText());
						if (graphType2 == GraphType.NULL)
							insertNullGraph(graph, nodeCount);
						if (graphType2 == GraphType.SIMPLE_RANDOM_TREE)
							insertSimpleRandomTree(graph, nodeCount);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if (graphType2 == GraphType.COMPLETE)
			{
				JPanel panel = new JPanel(new GridLayout(5, 1, 4, 4));
				panel.add(new JLabel("Number of nodes"));
				panel.add(numNodes);
				panel.add(arrowsBox = new JCheckBox("Directed", false));
				panel.add(weightedBox = new JCheckBox("Weighted", false));
				panel.add(new JLabel("Min. weight"));
				panel.add(minWeight);
				panel.add(new JLabel("Max. weight"));
				panel.add(maxWeight);

				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int vertexNumParam = Integer.parseInt(numNodes
								.getText());
						int minWeightParam = Integer.parseInt(minWeight
								.getText());
						int maxWeightParam = Integer.parseInt(maxWeight
								.getText());
						insertCompleteGraph(graph, vertexNumParam, arrows,
								weighted, minWeightParam, maxWeightParam);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if (graphType2 == GraphType.FRIENDSHIP_WINDMILL)
			{
				JPanel panel = new JPanel(new GridLayout(6, 1, 4, 4));
				panel.add(new JLabel("Number of branches"));
				panel.add(numBranches);
				panel.add(arrowsBox = new JCheckBox("Directed", false));
				panel.add(weightedBox = new JCheckBox("Weighted", false));
				panel.add(new JLabel("Min. weight"));
				panel.add(minWeight);
				panel.add(new JLabel("Max. weight"));
				panel.add(maxWeight);

				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int minWeightParam = Integer.parseInt(minWeight
								.getText());
						int maxWeightParam = Integer.parseInt(maxWeight
								.getText());
						int numBranchesParam = Integer.parseInt(numBranches
								.getText());
						insertFriendshipWindmillGraph(graph, numBranchesParam,
								arrows, weighted, minWeightParam,
								maxWeightParam);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if (graphType2 == GraphType.FULL_WINDMILL)
			{
				JPanel panel = new JPanel(new GridLayout(6, 1, 4, 4));
				panel.add(new JLabel("Number of branches"));
				panel.add(numBranches);
				panel.add(new JLabel("Number of vertexes per branch"));
				panel.add(numVertexesInBranch);
				panel.add(arrowsBox = new JCheckBox("Directed", false));
				panel.add(weightedBox = new JCheckBox("Weighted", false));
				panel.add(new JLabel("Min. weight"));
				panel.add(minWeight);
				panel.add(new JLabel("Max. weight"));
				panel.add(maxWeight);

				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int minWeightParam = Integer.parseInt(minWeight
								.getText());
						int maxWeightParam = Integer.parseInt(maxWeight
								.getText());
						int numBranchesParam = Integer.parseInt(numBranches
								.getText());
						int numVertexesInBranchParam = Integer
								.parseInt(numVertexesInBranch.getText());
						insertFullWindmillGraph(graph, numBranchesParam,
								numVertexesInBranchParam, arrows, weighted,
								minWeightParam, maxWeightParam);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if ((graphType2 == GraphType.WHEEL)
					|| (graphType2 == GraphType.STAR)
					|| (graphType2 == GraphType.PATH))
			{
				JPanel panel = new JPanel(new GridLayout(5, 1, 4, 4));
				panel.add(new JLabel("Number of nodes"));
				panel.add(numNodes);
				panel.add(arrowsBox = new JCheckBox("Directed", false));
				panel.add(weightedBox = new JCheckBox("Weighted", false));
				panel.add(new JLabel("Min. weight"));
				panel.add(minWeight);
				panel.add(new JLabel("Max. weight"));
				panel.add(maxWeight);

				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int numNodesParam = Integer.parseInt(numNodes.getText());
						int minWeightParam = Integer.parseInt(minWeight
								.getText());
						int maxWeightParam = Integer.parseInt(maxWeight
								.getText());
						if (graphType2 == GraphType.WHEEL)
							insertWheelGraph(graph, numNodesParam, arrows,
									weighted, minWeightParam, maxWeightParam);
						else if (graphType2 == GraphType.STAR)
							insertStarGraph(graph, numNodesParam, arrows,
									weighted, minWeightParam, maxWeightParam);
						else if (graphType2 == GraphType.PATH)
							insertPathGraph(graph, numNodesParam, arrows,
									weighted, minWeightParam, maxWeightParam);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if (graphType2 == GraphType.PETERSEN)
			{
				JPanel panel = new JPanel(new GridLayout(4, 1, 4, 4));
				panel.add(arrowsBox = new JCheckBox("Directed", false));
				panel.add(weightedBox = new JCheckBox("Weighted", false));
				panel.add(new JLabel("Min. weight"));
				panel.add(minWeight);
				panel.add(new JLabel("Max. weight"));
				panel.add(maxWeight);

				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int minWeightParam = Integer.parseInt(minWeight
								.getText());
						int maxWeightParam = Integer.parseInt(maxWeight
								.getText());
						insertPetersenGraph(graph, arrows, weighted,
								minWeightParam, maxWeightParam);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if (graphType2 == GraphType.FROM_ADJ_MATRIX)
			{
				JPanel panel = new JPanel(new GridLayout(2, 1, 4, 4));
				panel.add(arrowsBox = new JCheckBox("Directed", false));
				panel.add(weightedBox = new JCheckBox("Weighted", false));

				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int[][] adjMatrix = { { 0 } };
						getGraph(graph, adjMatrix, arrows, weighted);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if (graphType2 == GraphType.NREGULAR)
			{
				JPanel panel = new JPanel(new GridLayout(6, 2, 4, 4));
				panel.add(new JLabel("Number of nodes"));
				panel.add(numNodes);
				panel.add(new JLabel("Valence"));
				panel.add(valence);
				panel.add(arrowsBox = new JCheckBox("Directed", false));
				panel.add(weightedBox = new JCheckBox("Weighted", false));
				panel.add(new JLabel("Min. weight"));
				panel.add(minWeight);
				panel.add(new JLabel("Max. weight"));
				panel.add(maxWeight);

				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int nodeCount = Integer.parseInt(numNodes.getText());
						int minWeightParam = Integer.parseInt(minWeight
								.getText());
						int maxWeightParam = Integer.parseInt(maxWeight
								.getText());
						insertNRegularGraph(graph, nodeCount, arrows, weighted,
								minWeightParam, maxWeightParam);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if (graphType2 == GraphType.GRID)
			{
				JPanel panel = new JPanel(new GridLayout(3, 2, 4, 4));
				panel.add(new JLabel("Number of rows"));
				panel.add(numRows);
				panel.add(new JLabel("Number of columns"));
				panel.add(numColumns);
				panel.add(new JLabel("Grid spacing"));
				panel.add(gridSpacing);
				panel.add(arrowsBox = new JCheckBox("Directed", false));
				panel.add(weightedBox = new JCheckBox("Weighted", false));
				panel.add(new JLabel("Min. weight"));
				panel.add(minWeight);
				panel.add(new JLabel("Max. weight"));
				panel.add(maxWeight);

				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int xDim = Integer.parseInt(numRows.getText());
						int yDim = Integer.parseInt(numColumns.getText());
						int minWeightParam = Integer.parseInt(minWeight
								.getText());
						int maxWeightParam = Integer.parseInt(maxWeight
								.getText());
						float spacing = Float.parseFloat(gridSpacing.getText());
						insertGridGraph(graph, xDim, yDim, spacing, arrows,
								weighted, minWeightParam, maxWeightParam);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if ((graphType2 == GraphType.KNIGHT)
					|| (graphType2 == GraphType.KING))
			{
				JPanel panel = new JPanel(new GridLayout(5, 2, 4, 4));
				panel.add(new JLabel("Number of rows"));
				panel.add(numRows);
				panel.add(new JLabel("Number of columns"));
				panel.add(numColumns);
				panel.add(new JLabel("Grid spacing"));
				panel.add(gridSpacing);

				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int xDim = Integer.parseInt(numRows.getText());
						int yDim = Integer.parseInt(numColumns.getText());
						float spacing = Float.parseFloat(gridSpacing.getText());
						if (graphType2 == GraphType.KNIGHT)
							insertKnightGraph(graph, xDim, yDim, spacing);
						else if (graphType2 == GraphType.KING)
							insertKingGraph(graph, xDim, yDim, spacing);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if (graphType2 == GraphType.KNIGHT_TOUR)
			{
				JPanel panel = new JPanel(new GridLayout(4, 2, 4, 4));
				panel.add(new JLabel("Starting node"));
				panel.add(startVertexValue);
				panel.add(new JLabel("X dimension of chessboard"));
				panel.add(numRows);
				panel.add(new JLabel("Y dimension of chessboard"));
				panel.add(numColumns);
				panel.add(new JLabel("Grid spacing"));
				panel.add(gridSpacing);

				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int xDim = Integer.parseInt(numRows.getText());
						int yDim = Integer.parseInt(numColumns.getText());
						int value = Integer.parseInt(startVertexValue.getText());
						float spacing = Float.parseFloat(gridSpacing.getText());
						insertKnightTour(graph, xDim, yDim, value, spacing);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if ((graphType2 == GraphType.BIPARTITE)
					|| (graphType2 == GraphType.COMPLETE_BIPARTITE))
			{
				JPanel panel = new JPanel(new GridLayout(3, 2, 4, 4));
				panel.add(new JLabel("Number of vertexes in group 1"));
				panel.add(numVertexesLeft);
				panel.add(new JLabel("Number of vertexes in group 2"));
				panel.add(numVertexesRight);
				panel.add(new JLabel("Group spacing"));
				panel.add(groupSpacing);
				panel.add(arrowsBox = new JCheckBox("Directed", false));
				panel.add(weightedBox = new JCheckBox("Weighted", false));
				panel.add(new JLabel("Min. weight"));
				panel.add(minWeight);
				panel.add(new JLabel("Max. weight"));
				panel.add(maxWeight);

				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int leftNodeCount = Integer.parseInt(numVertexesLeft
								.getText());
						int rightNodeCount = Integer.parseInt(numVertexesRight
								.getText());
						float spacing = Float.parseFloat(groupSpacing.getText());
						int minWeightParam = Integer.parseInt(minWeight
								.getText());
						int maxWeightParam = Integer.parseInt(maxWeight
								.getText());
						if (graphType2 == GraphType.BIPARTITE)
							insertBipartiteGraph(graph, leftNodeCount,
									rightNodeCount, spacing, arrows, weighted,
									minWeightParam, maxWeightParam);
						else if (graphType2 == GraphType.COMPLETE_BIPARTITE)
							insertCompleteBipartiteGraph(graph, leftNodeCount,
									rightNodeCount, spacing, arrows, weighted,
									minWeightParam, maxWeightParam);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if (graphType2 == GraphType.SIMPLE_RANDOM)
			{
				JPanel panel = new JPanel(new GridLayout(15, 2, 4, 4));
				panel.add(new JLabel("Number of nodes"));
				panel.add(numNodes);
				panel.add(new JLabel("Number of edges"));
				panel.add(numEdges);
				panel.add(arrowsBox = new JCheckBox("Directed", false));
				panel.add(weightedBox = new JCheckBox("Weighted", false));
				panel.add(new JLabel("Min. weight"));
				panel.add(minWeight);
				panel.add(new JLabel("Max. weight"));
				panel.add(maxWeight);
				panel.add(selfLoopBox = new JCheckBox("Allow self-loops", false));
				panel.add(multipleEdgeBox = new JCheckBox(
						"Allow multiple edges", false));
				panel.add(forceConnectedBox = new JCheckBox(
						"Always connected (edge count may be inaccurate)",
						false));
				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int nodeCount = Integer.parseInt(numNodes.getText());
						int edgeCount = Integer.parseInt(numEdges.getText());
						int minWeightParam = Integer.parseInt(minWeight
								.getText());
						int maxWeightParam = Integer.parseInt(maxWeight
								.getText());
						insertSimpleRandomGraph(graph, nodeCount, edgeCount,
								arrows, allowSelfLoops, allowMultipleEdges,
								forceConnected, weighted, minWeightParam,
								maxWeightParam);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if (graphType2 == GraphType.RESET_STYLE)
			{
				JPanel panel = new JPanel(new GridLayout(4, 2, 4, 4));
				panel.add(arrowsBox = new JCheckBox("Directed", false));
				panel.add(weightedBox = new JCheckBox("Weighted", false));
				panel.add(new JLabel("Min. weight"));
				panel.add(minWeight);
				panel.add(new JLabel("Max. weight"));
				panel.add(maxWeight);
				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int minWeightParam = Integer.parseInt(minWeight
								.getText());
						int maxWeightParam = Integer.parseInt(maxWeight
								.getText());
						resetGraphStyle(graph, arrows, weighted,
								minWeightParam, maxWeightParam);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if (graphType2 == GraphType.GET_ADJ_MATRIX)
			{
				JPanel panel = new JPanel(new GridLayout(1, 2, 4, 4));
				panel.add(arrowsBox = new JCheckBox("Directed", false));
				panel.add(weightedBox = new JCheckBox("Weighted", false));
				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Generate");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						getAdjMatrix(graph, arrows, weighted);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if ((graphType2 == GraphType.BFS)
					|| (graphType2 == GraphType.DFS)
					|| (graphType2 == GraphType.MAKE_TREE_DIRECTED)
					|| (graphType2 == GraphType.INDEGREE)
					|| (graphType2 == GraphType.OUTDEGREE)
					|| (graphType2 == GraphType.IS_CUT_VERTEX))
			{
				JPanel panel = new JPanel(new GridLayout(1, 2, 4, 4));
				panel.add(new JLabel("Starting vertex"));
				panel.add(startVertexValue);
				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Start");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int value = Integer.parseInt(startVertexValue.getText());
						mxCell startVertex = getVertexWithValue(graph, value);
						if (graphType2 == GraphType.BFS)
						{
							breadthFirstSearch(graph, startVertex);
						}
						else if (graphType2 == GraphType.DFS)
						{
							depthFirstSearch(graph, startVertex);
						}
						else if (graphType2 == GraphType.MAKE_TREE_DIRECTED)
						{
							makeTreeDirected(graph, startVertex);
						}
						else if (graphType2 == GraphType.INDEGREE)
						{
							indegree(startVertex);
						}
						else if (graphType2 == GraphType.OUTDEGREE)
						{
							outdegree(startVertex);
						}
						else if (graphType2 == GraphType.IS_CUT_VERTEX)
						{
							isCutVertex(graph, startVertex);
						}
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if (graphType2 == GraphType.IS_CUT_EDGE)
			{
				JPanel panel = new JPanel(new GridLayout(1, 2, 4, 4));
				panel.add(new JLabel("Edge weight"));
				panel.add(startVertexValue);
				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Start");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int value = Integer.parseInt(startVertexValue.getText());
						// get edge with needed value
						mxCell startEdge = getEdgeWithValue(graph, value);
						isCutEdge(graph, startEdge, true);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
			else if ((graphType2 == GraphType.DIJKSTRA)
					|| (graphType2 == GraphType.BELLMAN_FORD))
			{
				JPanel panel = new JPanel(new GridLayout(2, 2, 4, 4));
				panel.add(new JLabel("Starting vertex"));
				panel.add(startVertexValue);
				panel.add(new JLabel("End vertex"));
				panel.add(endVertexValue);
				JPanel panelBorder = new JPanel();
				panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
				panelBorder.add(panel);

				JPanel buttonPanel = new JPanel(
						new FlowLayout(FlowLayout.RIGHT));
				panel.setBorder(BorderFactory.createCompoundBorder(
						BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
						BorderFactory.createEmptyBorder(16, 8, 8, 8)));

				JButton applyButton = new JButton("Start");
				JButton closeButton = new JButton("Cancel");
				buttonPanel.add(closeButton);
				buttonPanel.add(applyButton);
				getRootPane().setDefaultButton(applyButton);

				applyButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						applyValues();
						int startValue = Integer.parseInt(startVertexValue
								.getText());
						mxCell startVertex = getVertexWithValue(graph,
								startValue);
						int endValue = Integer.parseInt(endVertexValue
								.getText());
						mxCell endVertex = getVertexWithValue(graph, endValue);
						if (graphType2 == GraphType.DIJKSTRA)
							dijkstra(graph, startVertex, endVertex);
						if (graphType2 == GraphType.BELLMAN_FORD)
							bellmanFord(graph, startVertex);
						setVisible(false);
					}
				});
				closeButton.addActionListener(new ActionListener()
				{
					public void actionPerformed(ActionEvent e)
					{
						insertGraph = false;
						setVisible(false);
					}
				});

				getContentPane().add(panelBorder, BorderLayout.CENTER);
				getContentPane().add(buttonPanel, BorderLayout.SOUTH);
				pack();
				setResizable(false);
				// setLocationRelativeTo(parent);
			}
		}

		/**
		 * 
		 */
		protected void applyValues()
		{
			setNumNodes(Integer.parseInt(this.numNodes.getText()));
			setNumEdges(Integer.parseInt(this.numEdges.getText()));
			setValence(Integer.parseInt(this.valence.getText()));
			setNumRows(Integer.parseInt(this.numRows.getText()));
			setNumColumns(Integer.parseInt(this.numColumns.getText()));
			setGridSpacing(Float.parseFloat(this.gridSpacing.getText()));
			setNumVertexesLeft(Integer.parseInt(this.numVertexesLeft.getText()));
			setNumVertexesRight(Integer.parseInt(this.numVertexesRight
					.getText()));
			setGroupSpacing(Float.parseFloat(this.groupSpacing.getText()));
			setArrows(this.arrowsBox.isSelected());
			setWeighted(this.weightedBox.isSelected());
			setStartVertexValue(Integer.parseInt(this.startVertexValue
					.getText()));
			setEndVertexValue(Integer.parseInt(this.endVertexValue.getText()));
			setAllowSelfLoops(this.selfLoopBox.isSelected());
			setAllowMultipleEdges(this.multipleEdgeBox.isSelected());
			setForceConnected(this.forceConnectedBox.isSelected());
			setMaxWeight(Integer.parseInt(this.maxWeight.getText()));
			setMinWeight(Integer.parseInt(this.minWeight.getText()));
			setNumBranches(Integer.parseInt(this.numBranches.getText()));
			setNumVertexesInBranch(Integer.parseInt(this.numVertexesInBranch
					.getText()));
		}

		public void configureLayout(mxGraph graph, GraphType graphType)
		{
			this.graph = graph;
			this.graphType = graphType;

			this.numNodes.setText(String.valueOf(getNumNodes()));
			this.numEdges.setText(String.valueOf(getNumEdges()));
			this.valence.setText(String.valueOf(getValence()));
			this.numRows.setText(String.valueOf(getNumRows()));
			this.numColumns.setText(String.valueOf(getNumColumns()));
			this.gridSpacing.setText(String.valueOf(getGridSpacing()));
			this.numVertexesLeft.setText(String.valueOf(getNumVertexesLeft()));
			this.numVertexesRight
					.setText(String.valueOf(getNumVertexesRight()));
			this.groupSpacing.setText(String.valueOf(getGroupSpacing()));
			this.arrowsBox.setSelected(arrows);
			this.startVertexValue
					.setText(String.valueOf(getStartVertexValue()));
			this.endVertexValue.setText(String.valueOf(getEndVertexValue()));
			this.selfLoopBox.setSelected(allowSelfLoops);
			this.multipleEdgeBox.setSelected(allowMultipleEdges);
			this.forceConnectedBox.setSelected(forceConnected);
			this.weightedBox.setSelected(weighted);
			this.maxWeight.setText(String.valueOf(getMaxWeight()));
			this.minWeight.setText(String.valueOf(getMinWeight()));
			this.numBranches.setText(String.valueOf(getNumBranches()));
			this.numVertexesInBranch.setText(String
					.valueOf(getNumVertexesInBranch()));
		}
	}

	public static void center(Window wnd)
	{
		Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
		Dimension frameSize = wnd.getSize();
		wnd.setLocation(screenSize.width / 2 - (frameSize.width / 2),
				screenSize.height / 2 - (frameSize.height / 2));
	}

	/**
	 * Default constructor
	 */
	public GraphCreator()
	{
	}

	/**
	 * @param vertexOne
	 * @param vertexTwo
	 * @return true if vertexOne and vertexTwo are directly connected
	 */
	private boolean areConnected(mxCell vertexOne, mxCell vertexTwo)
	{
		int numEdges = vertexOne.getEdgeCount();
		for (int i = 0; i < numEdges; i++)
		{
			mxCell currEdge = (mxCell) vertexOne.getEdgeAt(i);
			if (currEdge.getSource().getId().equals(vertexTwo.getId()))
				return true;
			if (currEdge.getTarget().getId().equals(vertexTwo.getId()))
				return true;
		}
		return false;
	}

	/**
	 * A variation of shortest path algorithms that allows negative edge weights
	 * @param graph - handle
	 * @return - shortest path
	 */
	@SuppressWarnings("rawtypes")
	public Map[] bellmanFord(mxGraph graph, mxCell startVertex)
	{

		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		Object[] edges = graph.getChildEdges(graph.getDefaultParent());
		int vertexNum = vertexes.length;
		int edgeNum = vertexes.length;
		Map<mxCell, Integer> distanceMap = new HashMap<mxCell, Integer>();
		Map<mxCell, mxCell> parentMap = new HashMap<mxCell, mxCell>();

		for (int i = 0; i < vertexNum; i++)
		{
			mxCell currVertex = (mxCell) vertexes[i];
			if (currVertex.equals(startVertex))
				distanceMap.put(currVertex, 0);
			else
				distanceMap.put(currVertex, 2000000000);
		}

		for (int i = 0; i < vertexNum - 1; i++)
		{
			for (int j = 0; j < edgeNum; j++)
			{
				mxCell currEdge = (mxCell) edges[j];
				mxCell source = (mxCell) currEdge.getSource();
				mxCell target = (mxCell) currEdge.getTarget();
				if (distanceMap.get(source)
						+ Integer.parseInt((String) currEdge.getValue()) < distanceMap
						.get(target))
				{
					distanceMap.put(
							target,
							distanceMap.get(source)
									+ Integer.parseInt((String) currEdge
											.getValue()));
					parentMap.put(target, source);
				}
			}
		}

		for (int i = 0; i < edgeNum; i++)
		{
			mxCell currEdge = (mxCell) edges[i];
			mxCell source = (mxCell) currEdge.getSource();
			mxCell target = (mxCell) currEdge.getTarget();
			if (distanceMap.get(source)
					+ Integer.parseInt((String) currEdge.getValue()) < distanceMap
					.get(target))
			{
				if (developmentMode)
					System.out
							.println("Bellman-Ford error: graph contains a negative cycle.");
				return null;
			}
		}

		Map[] result = new Map[2];
		result[0] = distanceMap;
		result[1] = parentMap;
		return result;
	}

	// Floyd-Roy-Warhsall start ************************************

	public ArrayList<Object[][]> floydRoyWarshall(mxGraph graph) //mxCell[] nodes, mxCell[] edges 
	{
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());

		Object[][] dist = new Integer[vertexes.length][vertexes.length];
		Object[][] paths;

		Map<Object, Integer> indexMap = new HashMap<Object, Integer>();
		for (int i = 0; i < vertexes.length; i++)
			indexMap.put(vertexes[i], i);
		Object[] edges = graph.getChildEdges(graph.getDefaultParent());
		dist = initializeWeight(vertexes, edges, indexMap);
		paths = new mxCell[vertexes.length][vertexes.length];

		for (int k = 0; k < vertexes.length; k++)
		{
			for (int i = 0; i < vertexes.length; i++)
			{
				for (int j = 0; j < vertexes.length; j++)
				{
					if ((Integer) dist[i][k] != Integer.MAX_VALUE
							&& (Integer) dist[k][j] != Integer.MAX_VALUE
							&& (Integer) dist[i][k] + (Integer) dist[k][j] < (Integer) dist[i][j])
					{
						dist[i][j] = (Integer) dist[i][k]
								+ (Integer) dist[k][j];
						paths[i][j] = (mxCell) vertexes[k];
					}
				}
			}
		}
		ArrayList<Object[][]> result = new ArrayList<Object[][]>();
		result.add(dist);
		result.add(paths);
		return result;
	}

	@SuppressWarnings("unused")
	private int getShortestDistance(mxCell source, mxCell target,
			Map<mxCell, Integer> indexMap, int[][] D)
	{
		return D[indexMap.get(source)][indexMap.get(target)];
	}

	@SuppressWarnings("unused")
	private ArrayList<mxCell> getShortestPath(mxCell source, mxCell target,
			Map<mxCell, Integer> indexMap, int[][] D)
	{
		if (D[indexMap.get(source)][indexMap.get(target)] == Integer.MAX_VALUE)
		{
			return new ArrayList<mxCell>();
		}
		ArrayList<mxCell> path = getIntermediatePath(source, target, indexMap,
				D, null);
		path.add(0, source);
		path.add(target);
		return path;
	}

	private ArrayList<mxCell> getIntermediatePath(mxCell source, mxCell target,
			Map<mxCell, Integer> indexMap, int[][] D, mxCell[][] P)
	{
		if (D == null)
		{
			throw new IllegalArgumentException(
					"Must call calcShortestPaths(...) before attempting to obtain a path.");
		}
		if (P[indexMap.get(source)][indexMap.get(target)] == null)
		{
			return new ArrayList<mxCell>();
		}
		ArrayList<mxCell> path = new ArrayList<mxCell>();
		path.addAll(getIntermediatePath(source,
				P[indexMap.get(source)][indexMap.get(target)], indexMap, D, P));
		path.add(P[indexMap.get(source)][indexMap.get(target)]);
		path.addAll(getIntermediatePath(
				P[indexMap.get(source)][indexMap.get(target)], target,
				indexMap, D, P));
		return path;
	}

	private Object[][] initializeWeight(Object[] nodes, Object[] edges,
			Map<Object, Integer> indexMap)
	{
		Object[][] Weight = new Integer[nodes.length][nodes.length];
		for (int i = 0; i < nodes.length; i++)
			Arrays.fill(Weight[i], Integer.MAX_VALUE);

		for (Object e : edges)
		{
			mxCell current = (mxCell) e;
			Object source = current.getSource();
			Object target = current.getTarget();
			String style = current.getStyle();

			if (current.getValue().equals(""))
			{
				Weight[indexMap.get(source)][indexMap.get(target)] = 1;
				if (style.contains("endArrow=none"))
					Weight[indexMap.get(target)][indexMap.get(source)] = 1;
			}
			else
			{
				Weight[indexMap.get(source)][indexMap.get(target)] = Integer
						.parseInt((String) current.getValue());
				if (style.contains("endArrow=none"))
					Weight[indexMap.get(target)][indexMap.get(source)] = Integer
							.parseInt((String) current.getValue());
			}
		}

		for (int i = 0; i < nodes.length; i++)
			Weight[i][i] = 0;

		return Weight;
	}

	// Floyd-Warhsall end ************************************

	/**
	 * @param graph - handle
	 * @return - true if the graph is at least 2 connected (it doesn't have cut vertexes and cut edges)
	 */
	public boolean isBiconnected(mxGraph graph)
	{
		if (getCutVertexes(graph).size() == 0)
		{
			if (developmentMode)
				System.out.println("Graph is biconnected.");
			return true;
		}
		else
		{
			if (developmentMode)
				System.out.println("Graph is not biconnected.");
			return false;
		}
	}

	/**
	 * @param graph - handle
	 * @return list of biconnected components, which are in turn, lists of their vertexes
	 */
	public ArrayList<ArrayList<mxCell>> getBiconnectedComponents(mxGraph graph)
	{
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		// make a copy of the graph
		mxIGraphModel model = graph.getModel();
		Object[] cells = model.cloneCells(
				graph.getChildCells(graph.getDefaultParent()), true);
		mxGraphModel modelCopy = new mxGraphModel();
		mxGraph graphCopy = new mxGraph(modelCopy);
		graphCopy.addCells(cells);
		Object[] vertexesCopy = graphCopy.getChildVertices(graphCopy
				.getDefaultParent());
		Map<mxCell, mxCell> vertexMap = new HashMap<mxCell, mxCell>();

		for (int i = 0; i < vertexes.length; i++)
			vertexMap.put((mxCell) vertexesCopy[i], (mxCell) vertexes[i]);

		// remove the cut vertexes
		ArrayList<mxCell> cutVertexes = getCutVertexes(graphCopy);

		ArrayList<ArrayList<mxCell>> componentList = new ArrayList<ArrayList<mxCell>>();
		if (cutVertexes.size() == 0)
		{
			// the graph itself is the only component
			componentList.add(getVertexList(graph));
			return componentList;
		}

		graphCopy.removeCells(cutVertexes.toArray(), true);
		// get components
		componentList = getGraphComponents(graphCopy);
		// add each cut vertex to the all neighboring components (if one of its ex-neighbors is part of the component)

		int componentNum = componentList.size();
		for (int i = 0; i < componentNum; i++)
		{
			// for each component, check each cutvertex
			ArrayList<mxCell> currComponent = componentList.get(i);
			int cutVertexNum = cutVertexes.size();
			for (int j = 0; j < cutVertexNum; j++)
			{
				mxCell currCutVertex = cutVertexes.get(j);
				boolean isInComponent = false;
				mxCell origVertex = vertexMap.get(currCutVertex);
				// for each vertex in the component, check if in the old graph it wasn't connected to origVertex
				int currComponentNum = currComponent.size();
				for (int k = 0; k < currComponentNum; k++)
				{
					mxCell currVertex = currComponent.get(k);
					mxCell origCurrVertex = vertexMap.get(currVertex);
					if (areConnected(origVertex, origCurrVertex)
							&& !cutVertexes.contains(currVertex))
						isInComponent = true;
				}

				if (isInComponent)
				{
					if (developmentMode)
						System.out.println("Cut vertex "
								+ currCutVertex.getValue()
								+ " is added to component " + (i + 1));
					componentList.get(i).add(currCutVertex);
				}
			}
		}

		//we still need to check the possibility of cut vertexes forming a new component (bridges)

		int cutVertexNum = cutVertexes.size();
		for (int i = 0; i < cutVertexNum; i++)
		{
			mxCell startVertex = (mxCell) cutVertexes.get(i);
			mxCell origStartVertex = vertexMap.get(startVertex);
			for (int j = 0; j < cutVertexNum; j++)
			{
				if (i != j)
				{
					mxCell endVertex = (mxCell) cutVertexes.get(j);
					mxCell origEndVertex = vertexMap.get(endVertex);
					boolean isBridge = false;
					if (areConnected(origStartVertex, origEndVertex))
					{
						mxCell edge = getConnectingEdge(origStartVertex,
								origEndVertex);
						if (isCutEdge(graph, edge, false))
							isBridge = true;
					}
					if (isBridge)
					{
						// it's a bridge, and we should add a new component, but need to check if it isn't already created
						boolean compExists = false;
						for (int k = 0; k < componentList.size(); k++)
						{
							ArrayList<mxCell> currComponent = componentList
									.get(k);
							if (currComponent.size() == 2)
							{
								if (currComponent.size() == 2
										&& currComponent.contains(startVertex)
										&& currComponent.contains(endVertex))
									compExists = true;
							}
						}

						// this bridge isn't among the components, so we add it
						if (!compExists)
						{
							ArrayList<mxCell> newComponent = new ArrayList<mxCell>();
							newComponent.add(startVertex);
							newComponent.add(endVertex);
							componentList.add(newComponent);
						}
					}
				}
			}
		}

		// return the new extended components
		ArrayList<ArrayList<mxCell>> origComponentList = new ArrayList<ArrayList<mxCell>>();
		for (int i = 0; i < componentList.size(); i++)
		{
			ArrayList<mxCell> currComponent = new ArrayList<mxCell>();
			for (int j = 0; j < componentList.get(i).size(); j++)
			{
				currComponent.add(vertexMap.get(componentList.get(i).get(j)));
			}
			origComponentList.add(currComponent);
		}

		if (developmentMode)
		{
			for (int i = 0; i < origComponentList.size(); i++)
			{
				System.out.print("Bicomponent " + i + " :");
				for (int j = 0; j < origComponentList.get(i).size(); j++)
					System.out.print(" "
							+ origComponentList.get(i).get(j).getValue());
				System.out.println(".");
			}
			System.out.println("Number of bicomponents: "
					+ origComponentList.size());
		}

		return origComponentList;
	}

	/**
	 * @param graph - handle
	 * @return - the st-numbering of the graph, needed for the planarity test
	 * (* W I P *)
	 */
	public Map<mxCell, Integer> getSTNumbering(mxGraph graph)
	{
		// TODO implement
		Map<mxCell, Integer> dfis = new HashMap<mxCell, Integer>();
		Map<mxCell, mxCell> parents = new HashMap<mxCell, mxCell>();
		@SuppressWarnings("unused")
		Map<mxCell, mxCell> lowpoints = new HashMap<mxCell, mxCell>();

		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexNum = vertexes.length;
		ArrayList<mxCell[]> dfsList = depthFirstSearch2(graph,
				(mxCell) vertexes[0]);

		for (int i = 0; i < vertexNum; i++)
		{
			dfis.put(dfsList.get(i)[0], i);
			parents.put(dfsList.get(i)[0], dfsList.get(i)[1]);

		}

		return null;
	}

	/**
	 * A test method for answering a forum question
	 * @param graph
	 */
	public Object[] getSpanningTree(mxGraph graph)
	{
		mxICostFunction cf = new mxDistanceCostFunction();

		Object[] v = graph.getChildVertices(graph.getDefaultParent());
		@SuppressWarnings("unused")
		Object[] e = graph.getChildEdges(graph.getDefaultParent());
		mxGraphAnalysis mga = mxGraphAnalysis.getInstance();
		Object[] edges = mga.getMinimumSpanningTree(graph, v, cf, false);
		return edges;
	}

	/**
	 * @param graph - handle
	 * @param startVertex - the search will be starting from this vertex
	 * @return - list of visited vertexes, ordered by visiting sequence. For connected graphs, all vertexes are returned  
	 */
	public ArrayList<mxCell> breadthFirstSearch(mxGraph graph,
			mxCell startVertex)
	{
		if ((graph == null) || (startVertex == null))
			return null;
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexCount = vertexes.length;
		Map<mxCell, Integer> visitedNodesMap = new HashMap<mxCell, Integer>();
		
		for (int i = 0; i < vertexCount; i++)
		{
			visitedNodesMap.put((mxCell) vertexes[i], 0);
		}

		ArrayList<mxCell> cells = new ArrayList<mxCell>();
		ArrayList<mxCell> queue = new ArrayList<mxCell>();
		
		queue.add(startVertex);
		while (!queue.isEmpty())
		{
			mxCell currVertex = queue.remove(0);
			cells.add(currVertex);
			visitedNodesMap.remove(currVertex);
			visitedNodesMap.put(currVertex, 1);
			int edgeCount = currVertex.getEdgeCount();
			mxCell[] edges = new mxCell[edgeCount];
			
			for (int i = 0; i < edgeCount; i++)
			{
				edges[i] = (mxCell) currVertex.getEdgeAt(i);
			}

			ArrayList<mxCell> neighbors = new ArrayList<mxCell>();
			
			for (int i = 0; i < edgeCount; i++)
			{
				mxCell source = (mxCell) edges[i].getSource();
				mxCell destination = (mxCell) edges[i].getTarget();
				mxCell neighbor;
				
				if (!source.equals(currVertex))
				{
					neighbor = source;
				}
				else
				{
					neighbor = destination;
				}
				
				if (!neighbors.contains(neighbor))
				{
					neighbors.add(neighbor);
				}
			}
			int neighborCount = neighbors.size();
			for (int i = 0; i < neighborCount; i++)
			{
				mxCell currNeighbor = neighbors.get(i);
				if (visitedNodesMap.get(currNeighbor) == 0)
				{
					queue.add(currNeighbor);
					visitedNodesMap.remove(currNeighbor);
					visitedNodesMap.put(currNeighbor, 1);
				}
			}
		}

		if (developmentMode)
		{
			int[] niceArray = new int[cells.size()];
			System.out.print("The BFS from " + startVertex.getValue()
					+ " is: [");
			for (int i = 0; i < cells.size(); i++)
			{
				niceArray[i] = Integer.parseInt((String) cells.get(i)
						.getValue());
				System.out.print(" " + niceArray[i]);
			}
			System.out.println("]");
			System.out.println("BFS: In all, " + cells.size()
					+ " nodes were visited");
			System.out.println("*BFS end*");
		}

		return cells;
	}

	/**
	 * Performs a breadth first search on the internal hierarchy model
	 * 
	 * @param parent
	 *            the parent internal node of the current internal node
	 * @param root
	 *            the current internal node
	 * @param connectingEdge
	 *            the internal edge connecting the internal node and the parent
	 *            internal node, if any
	 * @param visitor
	 *            the visitor pattern to be called for each node
	 * @param seen
	 *            a set of all nodes seen by this bfs a set of all of the
	 *            ancestor node of the current node
	 * @param layer
	 *            the layer on the bfs tree ( not the same as the model ranks )
	 */
//	public void dfs(mxGraphHierarchyNode parent, mxGraphHierarchyNode root,
//			mxGraphHierarchyEdge connectingEdge, CellVisitor visitor,
//			Set<mxGraphHierarchyNode> seen, int layer)
	public ArrayList<mxCell> bfs(mxGraph graph, mxCell startVertex, mxICellVisitor visitor)
	{
		if ((graph == null) || (startVertex == null))
		{
			return null;
		}
		
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexCount = vertexes.length;
		Map<mxCell, Integer> visitedNodesMap = new HashMap<mxCell, Integer>();
		
		for (int i = 0; i < vertexCount; i++)
		{
			visitedNodesMap.put((mxCell) vertexes[i], 0);
		}

		ArrayList<mxCell> cells = new ArrayList<mxCell>();
		ArrayList<mxCell> queue = new ArrayList<mxCell>();
		
		queue.add(startVertex);
		
		while (!queue.isEmpty())
		{
			mxCell currVertex = queue.remove(0);
			cells.add(currVertex);
			visitedNodesMap.remove(currVertex);
			visitedNodesMap.put(currVertex, 1);
			int edgeCount = currVertex.getEdgeCount();
			mxCell[] edges = new mxCell[edgeCount];
			
			for (int i = 0; i < edgeCount; i++)
			{
				edges[i] = (mxCell) currVertex.getEdgeAt(i);
			}

			ArrayList<mxCell> neighbors = new ArrayList<mxCell>();
			
			for (int i = 0; i < edgeCount; i++)
			{
				mxCell source = (mxCell) edges[i].getSource();
				mxCell destination = (mxCell) edges[i].getTarget();
				mxCell neighbor;
				
				if (!source.equals(currVertex))
				{
					neighbor = source;
				}
				else
				{
					neighbor = destination;
				}
				
				if (!neighbors.contains(neighbor))
				{
					neighbors.add(neighbor);
				}
			}
			
			int neighborCount = neighbors.size();
			
			for (int i = 0; i < neighborCount; i++)
			{
				mxCell currNeighbor = neighbors.get(i);
				if (visitedNodesMap.get(currNeighbor) == 0)
				{
					queue.add(currNeighbor);
					visitedNodesMap.remove(currNeighbor);
					visitedNodesMap.put(currNeighbor, 1);
				}
			}
		}

		if (developmentMode)
		{
			int[] niceArray = new int[cells.size()];
			System.out.print("The BFS from " + startVertex.getValue() + " is: [");
			
			for (int i = 0; i < cells.size(); i++)
			{
				niceArray[i] = Integer.parseInt((String) cells.get(i)
						.getValue());
				System.out.print(" " + niceArray[i]);
			}
			
			System.out.println("]");
			System.out.println("BFS: In all, " + cells.size() + " nodes were visited");
			System.out.println("*BFS end*");
		}

		return cells;
	}

	/**
	 * @param graph
	 * Generates the complementary of the supplied graph
	 */
	public void complementaryGraph(mxGraph graph)
	{
		ArrayList<ArrayList<mxCell>> oldConnections = new ArrayList<ArrayList<mxCell>>();
		//replicate the edge connections in oldConnections
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexCount = vertexes.length;
		for (int i = 0; i < vertexCount; i++)
		{
			mxCell currVertex = (mxCell) vertexes[i];
			int edgeCount = currVertex.getEdgeCount();
			mxCell currEdge = new mxCell();
			ArrayList<mxCell> neighborVertexes = new ArrayList<mxCell>();
			for (int j = 0; j < edgeCount; j++)
			{
				currEdge = (mxCell) currVertex.getEdgeAt(j);

				mxCell source = (mxCell) currEdge.getSource();
				mxCell destination = (mxCell) currEdge.getTarget();

				if (!source.equals(currVertex))
					neighborVertexes.add(j, source);
				else
					neighborVertexes.add(j, destination);

			}
			oldConnections.add(i, neighborVertexes);
		}

		//delete all edges and make a complementary model
		mxCell root = (mxCell) graph.getDefaultParent();
		Object[] edges = graph.getChildEdges(root);
		graph.removeCells(edges);

		for (int i = 0; i < vertexCount; i++)
		{
			ArrayList<mxCell> oldNeighbors = new ArrayList<mxCell>();
			oldNeighbors = oldConnections.get(i);
			mxCell currVertex = (mxCell) vertexes[i];
			for (int j = 0; j < vertexCount; j++)
			{
				mxCell targetVertex = (mxCell) vertexes[j];
				boolean shouldConnect = true; // the decision if the two current vertexes should be connected

				if (oldNeighbors.contains(targetVertex))
					shouldConnect = false;
				if (targetVertex.equals(currVertex))
					shouldConnect = false;
				if (areConnected(currVertex, targetVertex))
					shouldConnect = false;

				if (shouldConnect)
				{
					graph.insertEdge(root, null, null, currVertex,
							targetVertex, getEdgeStyle(false));
				}
			}

		}
	}

	/**
	 * @param graph - handle
	 * @param startVertex - the search will be starting from this vertex
	 * @return - list of visited vertexes, ordered by visiting sequence. For connected graphs, all vertexes are returned  
	 */
	public ArrayList<mxCell> depthFirstSearch(mxGraph graph, mxCell startVertex)
	{
		if ((graph == null) || (startVertex == null))
			return null;
		Stack<mxCell> vertexStack = new Stack<mxCell>();
		vertexStack.push(startVertex);
		if ((graph == null) || (startVertex == null))
			return null;
		int vertexCount = graph.getChildVertices(graph.getDefaultParent()).length;
		int[] visitedNodes = new int[vertexCount];
		ArrayList<mxCell> cells = new ArrayList<mxCell>();
		while (!vertexStack.isEmpty())
		{
			mxCell currVertex = vertexStack.pop();
			cells.add(currVertex);
			int vertexValue = Integer.parseInt((String) currVertex.getValue());
			visitedNodes[vertexValue] = 1;
			int edgeCount = currVertex.getEdgeCount();
			mxCell[] edges = new mxCell[edgeCount];
			for (int i = 0; i < edgeCount; i++)
			{
				edges[i] = (mxCell) currVertex.getEdgeAt(i);
			}

			ArrayList<mxCell> neighbors = new ArrayList<mxCell>();
			for (int i = 0; i < edgeCount; i++)
			{
				mxCell source = (mxCell) edges[i].getSource();
				mxCell destination = (mxCell) edges[i].getTarget();
				mxCell neighbor;
				if (!source.equals(currVertex))
					neighbor = source;
				else
					neighbor = destination;
				if (!neighbors.contains(neighbor))
				{
					neighbors.add(neighbor);
				}
			}
			int neighborCount = neighbors.size();
			for (int i = 0; i < neighborCount; i++)
			{
				mxCell currNeighbor = neighbors.get(i);
				int neighborValue = Integer.parseInt((String) currNeighbor
						.getValue());
				if (visitedNodes[neighborValue] == 0)
				{
					vertexStack.push(currNeighbor);
					visitedNodes[neighborValue] = 1;
				}

			}
		}
		if (developmentMode)
		{
			int[] niceArray = new int[cells.size()];
			System.out.print("The DFS from " + startVertex.getValue()
					+ " is: [");
			for (int i = 0; i < cells.size(); i++)
			{
				niceArray[i] = Integer.parseInt((String) cells.get(i)
						.getValue());
				System.out.print(" " + niceArray[i]);
			}
			System.out.println("]");
			System.out.println("DFS: In all, " + cells.size()
					+ " nodes were visited");
			System.out.println("*DFS end*");
		}

		return cells;
	}

	/**
	 * @param graph - handle
	 * @param startVertex - the search will be starting from this vertex
	 * @return - list of visited vertexes, ordered by visiting sequence. For connected graphs, all vertexes are returned
	 * This version also returns the parent of each vertex. mxCell[0] is the vertex and mxCell[1] is it's parent  
	 */
	public ArrayList<mxCell[]> depthFirstSearch2(mxGraph graph,
			mxCell startVertex)
	{
		if ((graph == null) || (startVertex == null))
			return null;
		Stack<mxCell[]> vertexStack = new Stack<mxCell[]>();
		mxCell[] stackInfo = new mxCell[2];
		stackInfo[0] = startVertex;
		stackInfo[1] = null;
		vertexStack.push(stackInfo);
		if ((graph == null) || (startVertex == null))
			return null;
		Map<mxCell, mxCell> parentMap = new HashMap<mxCell, mxCell>();
		int vertexCount = graph.getChildVertices(graph.getDefaultParent()).length;
		int[] visitedNodes = new int[vertexCount];
		ArrayList<mxCell[]> cells = new ArrayList<mxCell[]>();
		while (!vertexStack.isEmpty())
		{
			mxCell[] currInfo = vertexStack.pop();
			mxCell currVertex = currInfo[0];
			cells.add(currInfo);
			int vertexValue = Integer.parseInt((String) currVertex.getValue());
			visitedNodes[vertexValue] = 1;
			int edgeCount = currVertex.getEdgeCount();
			mxCell[] edges = new mxCell[edgeCount];
			for (int i = 0; i < edgeCount; i++)
			{
				edges[i] = (mxCell) currVertex.getEdgeAt(i);
			}

			ArrayList<mxCell> neighbors = new ArrayList<mxCell>();
			for (int i = 0; i < edgeCount; i++)
			{
				mxCell source = (mxCell) edges[i].getSource();
				mxCell destination = (mxCell) edges[i].getTarget();
				mxCell neighbor;
				if (!source.equals(currVertex))
					neighbor = source;
				else
					neighbor = destination;
				if (!neighbors.contains(neighbor))
				{
					neighbors.add(neighbor);
				}
			}
			int neighborCount = neighbors.size();
			for (int i = 0; i < neighborCount; i++)
			{
				mxCell currNeighbor = neighbors.get(i);
				int neighborValue = Integer.parseInt((String) currNeighbor
						.getValue());
				if (visitedNodes[neighborValue] == 0)
				{
					parentMap.put(currNeighbor, currNeighbor);
					stackInfo[0] = currNeighbor;
					stackInfo[1] = currVertex;
					vertexStack.push(stackInfo);
					visitedNodes[neighborValue] = 1;
				}

			}
		}
		if (developmentMode)
		{
			int[] niceArray = new int[cells.size()];
			System.out.print("The DFS from " + startVertex.getValue()
					+ " is: [");
			for (int i = 0; i < cells.size(); i++)
			{
				niceArray[i] = Integer.parseInt((String) cells.get(i)[0]
						.getValue());
				System.out.print(" " + niceArray[i]);
			}
			System.out.println("]");
			System.out.println("DFS: In all, " + cells.size()
					+ " nodes were visited");
			System.out.println("*DFS end*");
		}

		return cells;
	}

	/**
	 * @param graph
	 * @param startVertex - source point of the shortest path algorithm
	 * @param endVertex - end point of the shortest path algorithm
	 * @return - list of visited vertexes, ordered by visiting sequence.
	 * If the graph isn't connected, or for some other reason the shortest path cannot be computed between startVertex and endVertex, null is returned. 
	 */
	public ArrayList<mxCell> dijkstra(mxGraph graph, mxCell startVertex,
			mxCell endVertex)
	{
		if (!isConnected(graph))
		{
			System.out
					.println("The current Dijksra algorithm only works for connected graphs!");
			return null;
		}
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexCount = vertexes.length;
		int[] distances = new int[vertexCount];
		mxCell[] parents = new mxCell[vertexCount];
		ArrayList<mxCell> vertexList = new ArrayList<mxCell>();
		ArrayList<mxCell> vertexListStatic = new ArrayList<mxCell>();

		for (int i = 0; i < vertexCount; i++)
		{
			distances[i] = -1; // -1 means infinite in this case
			vertexList.add((mxCell) vertexes[i]);
			vertexListStatic.add((mxCell) vertexes[i]);
		}

		// updating the starting vertex distance to 0
		int startIndex = vertexListStatic.indexOf(startVertex);
		distances[startIndex] = 0;

		while (vertexList.size() > 0)
		{
			//find closest vertex
			int minDistance;
			mxCell currVertex;
			mxCell closestVertex;
			currVertex = vertexList.get(0);
			int currIndex = vertexListStatic.indexOf(currVertex);
			int currDistance = distances[currIndex];
			minDistance = currDistance;
			closestVertex = currVertex;
			if (vertexList.size() > 1)
			{
				for (int i = 1; i < vertexList.size(); i++)
				{
					currVertex = vertexList.get(i);
					currIndex = vertexListStatic.indexOf(currVertex);
					currDistance = distances[currIndex];
					if ((currDistance >= 0) && (currDistance < minDistance)
							|| (minDistance < 0))
					{
						minDistance = currDistance;
						closestVertex = currVertex;
					}
				}
			}

			// we found the closest vertex
			vertexList.remove(closestVertex);

			int edgeCount = closestVertex.getEdgeCount();
			mxCell currEdge = new mxCell();
			ArrayList<mxCell> neighborVertexes = new ArrayList<mxCell>();
			for (int j = 0; j < edgeCount; j++)
			{
				currEdge = (mxCell) closestVertex.getEdgeAt(j);

				mxCell source = (mxCell) currEdge.getSource();
				mxCell destination = (mxCell) currEdge.getTarget();

				if (!source.equals(destination))
				{
					if (!source.equals(closestVertex))
						neighborVertexes.add(j, source);
					else
						neighborVertexes.add(j, destination);
				}
			}
			for (int j = 0; j < neighborVertexes.size(); j++)
			{
				mxCell currNeighbor = neighborVertexes.get(j);
				if (vertexList.contains(currNeighbor))
				{
					//find edge that connects to the current vertex
					int neighborEdgeCount = currNeighbor.getEdgeCount();
					mxCell connectingEdge = null;
					for (int k = 0; k < neighborEdgeCount; k++)
					{
						currEdge = (mxCell) currNeighbor.getEdgeAt(k);

						mxCell source = (mxCell) currEdge.getSource();
						mxCell destination = (mxCell) currEdge.getTarget();
						if (source.equals(closestVertex)
								|| destination.equals(closestVertex))
						{
							connectingEdge = currEdge;
						}
					}

					// check for new distance
					int neighborIndex = vertexListStatic.indexOf(currNeighbor);
					int oldDistance = distances[neighborIndex];
					int currEdgeWeight;

					// all unweighted edges are calculated as weight 1
					if (connectingEdge.getValue() == null
							|| connectingEdge.getValue().equals(""))
						currEdgeWeight = 1;
					else
						currEdgeWeight = Integer
								.parseInt((String) connectingEdge.getValue());

					int newDistance = minDistance + currEdgeWeight;

					//final part - updating the structure
					if ((oldDistance == -1) || (newDistance < oldDistance))
					{
						distances[neighborIndex] = newDistance;
						parents[neighborIndex] = closestVertex;
					}
				}
			}
		}
		if (developmentMode)
		{
			for (int i = 0; i < parents.length; i++)
			{
				System.out.println("Distance from " + startVertex.getValue()
						+ " to " + vertexListStatic.get(i).getValue() + " is: "
						+ distances[i]);
			}
		}

		ArrayList<mxCell> resultList = new ArrayList<mxCell>();
		mxCell currVertex = endVertex;
		while (currVertex != startVertex)
		{
			int currIndex = vertexListStatic.indexOf(currVertex);
			currVertex = parents[currIndex];
			resultList.add(0, currVertex);
		}
		resultList.add(resultList.size(), endVertex);

		if (developmentMode)
		{
			int[] niceArray = new int[resultList.size()];
			System.out.print("The shortest path from " + startVertex.getValue()
					+ " to " + endVertex.getValue() + " is: [");
			for (int i = 0; i < resultList.size(); i++)
			{
				niceArray[i] = Integer.parseInt((String) resultList.get(i)
						.getValue());
				System.out.print(" " + niceArray[i]);
			}
			System.out.println("]");
			System.out.println("*Dijkstra end*");
		}

		return resultList;
	}

	/**
	 * @param graph - handle
	 * @return - a leaf vertex, or null if there are no leaves in the graph
	 * edge direction taken into account
	 */
	public mxCell getDirectedLeaf(mxGraph graph)
	{
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexCount = vertexes.length;
		mxCell currVertex;
		for (int i = 0; i < vertexCount; i++)
		{
			currVertex = (mxCell) vertexes[i];
			int edgeCount = currVertex.getEdgeCount();
			if (edgeCount > 0)
			{
				boolean hasOutgoingEdge = false;
				for (int j = 0; j < edgeCount; j++)
				{
					mxCell currEdge = (mxCell) currVertex.getEdgeAt(j);
					if (!currEdge.getTarget().equals(currVertex))
					{
						hasOutgoingEdge = true;
						j = edgeCount; // break the loop
					}
				}
				if (!hasOutgoingEdge)
				{
					return currVertex;
				}
			}
			else
			{
				return currVertex;
			}
		}
		return null;
	}

	/**
	 * @param arrows - if true, a style with an arrowhead will be returned
	 * @return needed style for edges depending on the predefined style and if arrowheads should be used
	 * this should be used instead of explicit edge style entries
	 */
	private String getEdgeStyle(boolean arrows)
	{
		String edgeStyle = basicEdgeStyleString;
		if (arrows)
			edgeStyle += basicArrowStyleString;
		else
			edgeStyle += "endArrow=none;";
		return edgeStyle;
	}

	/**
	 * Calculates the number of components in a graph, and returns a list containing vertexes in various components
	 * @param graph
	 * @return a list of components, which in itself is a lift (of vertexes)
	 */
	public ArrayList<ArrayList<mxCell>> getGraphComponents(mxGraph graph)
	{
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexCount = vertexes.length;

		if (vertexCount == 0)
		{
			System.out
					.println("The graph is trivial, so there are 0 components.");
			return null;
		}

		ArrayList<ArrayList<mxCell>> componentList = new ArrayList<ArrayList<mxCell>>();
		ArrayList<mxCell> unvisitedVertexList = new ArrayList<mxCell>();
		// populate unvisited vertexes list
		for (int i = 0; i < vertexes.length; i++)
			unvisitedVertexList.add((mxCell) vertexes[i]);
		while (unvisitedVertexList.size() > 0)
		{
			//check if the current vertex isn't already in a component

			//if yes, just remove it from the unvisited list
			mxCell currVertex = unvisitedVertexList.remove(0);
			int componentCount = componentList.size();
			boolean isInComponent = false;
			for (int i = 0; i < componentCount; i++)
			{
				if (componentList.get(i).contains(currVertex))
					isInComponent = true;
			}

			//if not, create a new component and run a BFS populating the component and reducing the unvisited list
			if (!isInComponent)
			{
				ArrayList<mxCell> currVertexList = new ArrayList<mxCell>();
				currVertexList = breadthFirstSearch(graph, currVertex);
				for (int i = 0; i < currVertexList.size(); i++)
				{
					unvisitedVertexList.remove(currVertexList.get(i));
				}
				componentList.add(currVertexList);
			}
		}

		if (developmentMode)
		{
			for (int i = 0; i < componentList.size(); i++)
			{
				System.out.print("Component " + i + " :");
				for (int j = 0; j < componentList.get(i).size(); j++)
					System.out.print(" "
							+ componentList.get(i).get(j).getValue());
				System.out.println(".");
			}
			System.out.println("Number of components: " + componentList.size());
		}

		return componentList;
	}

	/**
	 * @param graph - the graph that is checked
	 * @param currentVertex - this Vertex is omitted in the calculation
	 * @return returns a vertex that has the lowest degree, but isn't equal to currentVertex
	 *  
	 *  This function is used for connecting the current vertex to another, which has lowest degree in the graph. 
	 *  If there is more than one vertex with lowest degree, the first one found will be returned
	 */
	private mxCell getLowestDegreeVertex(mxGraph graph, mxCell currentVertex)
	{
		int lowestDegree = -1;
		mxCell vertex = new mxCell();
		Object parent = graph.getDefaultParent();
		mxIGraphModel model = graph.getModel();

		// Gets all vertices inside the parent and finds
		// the vertex with minimum edge count
		int childCount = model.getChildCount(parent);

		for (int i = 0; i < childCount; i++)
		{
			mxCell cell = (mxCell) model.getChildAt(parent, i);
			if (((lowestDegree == -1) || (cell.getEdgeCount() < lowestDegree))
					&& (!cell.equals(currentVertex) && cell.isVertex()))
			{
				boolean isConnected = false;
				if (currentVertex != null)
				{
					for (int j = 0; j < cell.getEdgeCount(); j++)
					{
						mxCell currEdge = (mxCell) cell.getEdgeAt(j);
						if (currEdge.getSource().getId()
								.equals(currentVertex.getId()))
							isConnected = true;
						if (currEdge.getParent().getId()
								.equals(currentVertex.getId()))
							isConnected = true;
					}
				}
				if (!isConnected)
				{
					lowestDegree = cell.getEdgeCount();
					vertex = cell;
				}
			}
		}
		return vertex;
	}

	/**
	 * @param graph - handle
	 * @return - a leaf vertex, or null if there are no leaves in the graph
	 * edge direction isn't taken into account
	 */
	public mxCell getUndirectedLeaf(mxGraph graph)
	{
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexCount = vertexes.length;
		mxCell currVertex;
		for (int i = 0; i < vertexCount; i++)
		{
			currVertex = (mxCell) vertexes[i];
			if (currVertex.getEdgeCount() <= 1)
			{
				return currVertex;
			}
		}
		return null;
	}

	/**
	 * @param graph
	 * @return returns list of vertexes in an ArrayList <mxCell> structure instead of Object[]
	 */
	public ArrayList<mxCell> getVertexList(mxGraph graph)
	{
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		ArrayList<mxCell> vertexList = new ArrayList<mxCell>();
		for (int i = 0; i < vertexes.length; i++)
			vertexList.add((mxCell) vertexes[i]);
		return vertexList;
	}

	/**
	 * Returns the first vertex with the wanted value. If none are found, null is returned
	 * @param graph - the graph to search
	 * @param value - the needed value
	 * @return
	 */
	private mxCell getVertexWithValue(mxGraph graph, int value)
	{
		mxIGraphModel model = graph.getModel();
		mxCell rootCell = (mxCell) graph.getDefaultParent();
		int childCount = model.getChildCount(rootCell);
		int vertexValue = 0;
		for (int i = 0; i < childCount; i++)
		{
			mxCell currChild = (mxCell) model.getChildAt(rootCell, i);
			if (currChild.isVertex())
			{
				vertexValue = Integer.parseInt((String) currChild.getValue());
				if (vertexValue == value)
				{
					return currChild;
				}
			}
		}
		return null;
	}

	/**
	 * @param graph - handle
	 * @param value - value to look for
	 * @return - vertex with the desired value
	 * Searches for a vertex with the desired value. Returns the first found with the desired value. If none is found, null is returned.
	 */
	private mxCell getEdgeWithValue(mxGraph graph, int value)
	{
		mxIGraphModel model = graph.getModel();
		mxCell rootCell = (mxCell) graph.getDefaultParent();
		int childCount = model.getChildCount(rootCell);
		int edgeValue = 0;
		for (int i = 0; i < childCount; i++)
		{
			mxCell currChild = (mxCell) model.getChildAt(rootCell, i);
			if (currChild.isEdge())
			{
				if (currChild.getValue() != null
						&& !currChild.getValue().equals(""))
				{
					edgeValue = Integer.parseInt((String) currChild.getValue());
					if (edgeValue == value)
					{
						return currChild;
					}
				}
			}
		}
		return null;
	}

	/**
	 * @param graph - handle
	 * @param numVertexesRight - the number of vertexes in the right side group
	 * @param numVertexesLeft - the number of vertexes in the left side group
	 * @param groupSpacing - the distance between the two groups
	 * @param directed - if true the edges will be directed
	 * @param weighted - if true a random weight will be assigned to each edge
	 * @param minWeight - minimum weight value
	 * @param maxWeight - maximum weight value
	 * Creates a new graph that is bipartite.
	 */
	public void insertBipartiteGraph(mxGraph graph, int numVertexesRight,
			int numVertexesLeft, float groupSpacing, boolean directed,
			boolean weighted, int minWeight, int maxWeight)
	{
		graph.selectAll();
		graph.removeCells();
		int verticalSpacing = 80;
		try
		{
			Object rootCell = graph.getDefaultParent();
			graph.getModel().beginUpdate();
			float group1StartY = 0;
			float group2StartY = 0;

			if (numVertexesLeft < numVertexesRight)
			{
				float centerYtimes2 = (numVertexesRight * verticalSpacing);
				group1StartY = (centerYtimes2 - (numVertexesLeft * verticalSpacing)) / 2;
			}
			if (numVertexesLeft > numVertexesRight)
			{
				float centerYtimes2 = (numVertexesLeft * verticalSpacing);
				group2StartY = (centerYtimes2 - (numVertexesRight * verticalSpacing)) / 2;
			}
			int vertexCount = 0;
			// create vertexes for group 1
			for (int i = 0; i < numVertexesLeft; i++)
			{
				graph.insertVertex(rootCell, null,
						new Integer(vertexCount).toString(), 0,
						(group1StartY + i * verticalSpacing), 25, 25,
						basicVertexStyleString);
				vertexCount++;
			}
			// create vertexes for group 2
			for (int i = 0; i < numVertexesRight; i++)
			{
				graph.insertVertex(rootCell, null,
						new Integer(vertexCount).toString(), groupSpacing,
						(group2StartY + i * verticalSpacing), 25, 25,
						basicVertexStyleString);
				vertexCount++;
			}

			// create edges for group 1
			for (int i = 0; i < numVertexesLeft; i++)
			{
				mxCell sourceVertex = getVertexWithValue(graph, i);
				int destValue = (int) Math.round(Math.random()
						* (numVertexesRight - 1));
				destValue += numVertexesLeft;
				mxCell destVertex = getVertexWithValue(graph, destValue);
				if (!areConnected(sourceVertex, destVertex))
				{
					if (weighted)
						graph.insertEdge(graph.getDefaultParent(), null,
								new Integer(getRandom(minWeight, maxWeight))
										.toString(), sourceVertex, destVertex,
								getEdgeStyle(arrows));
					else
						graph.insertEdge(graph.getDefaultParent(), null, null,
								sourceVertex, destVertex,
								getEdgeStyle(directed));
				}
			}

			// create edges for group 2
			for (int i = 0; i < numVertexesRight; i++)
			{
				mxCell sourceVertex = getVertexWithValue(graph, i
						+ numVertexesLeft);
				mxCell destVertex = null;
				boolean areConnected = false;
				int j = 0;
				do
				{
					int destValue = (int) Math.round(Math.random()
							* (numVertexesLeft - 1));
					destVertex = getVertexWithValue(graph, destValue);
					j++;
					areConnected = areConnected(sourceVertex, destVertex);
				}
				while (areConnected && (j < numVertexesLeft));
				if (!areConnected)
					if (weighted)
						graph.insertEdge(graph.getDefaultParent(), null,
								new Integer(getRandom(minWeight, maxWeight))
										.toString(), sourceVertex, destVertex,
								getEdgeStyle(arrows));
					else
						graph.insertEdge(graph.getDefaultParent(), null, null,
								sourceVertex, destVertex,
								getEdgeStyle(directed));
			}
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph
	 * Generates a bivalent graph (every vertex has 2 edges)
	 */
	public void insertBivalentGraph(mxGraph graph, boolean directed)
	{
		graph.selectAll();
		graph.removeCells();
		// Calculate the number of edges
		int numEdges = numNodes;
		// Create array for vertices
		Object[] vertices = new mxCell[numNodes];
		Object[] edges = new mxCell[numEdges];

		try
		{
			Object rootCell = graph.getDefaultParent();
			graph.getModel().beginUpdate();
			for (int i = 0; i < numNodes; i++)
			{
				Object cell = graph.insertVertex(rootCell, null,
						new Integer(i).toString(), 0, 0, 25, 25,
						basicVertexStyleString);
				vertices[i] = cell;
			}

			int cellCount = 0;
			// Connect cells (bivalent algo)
			for (int i = 0; i < numNodes; i++)
			{
				if (i + 1 < numNodes)
				{
					if (!areConnected((mxCell) vertices[i],
							(mxCell) vertices[i + 1]))
					{
						Object edge = graph.insertEdge(
								graph.getDefaultParent(), null, null,
								vertices[i], vertices[i + 1],
								getEdgeStyle(directed));
						edges[cellCount++] = edge;
					}
				}
				else
				{
					if (!areConnected((mxCell) vertices[i],
							(mxCell) vertices[0]))
					{
						Object edge = graph.insertEdge(
								graph.getDefaultParent(), null, null,
								vertices[i], vertices[0],
								getEdgeStyle(directed));
						edges[cellCount++] = edge;
					}
				}
			}

			mxCircleLayout layout = new mxCircleLayout(graph);
			layout.execute(rootCell);
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph - handle
	 * @param numVertexesLeft - number of vertexes in the left side group
	 * @param numVertexesRight - number of vertexes in the right side group
	 * @param groupSpacing - distance between the two groups
	 * @param directed - if true, the edges will be directed
	 * @param weighted - if true, all edges will be assigned a random value
	 * @param minWeight - minimum weight value for edges
	 * @param maxWeight - maximum weight value for edges
	 * Generates a complete bipartite graph - a graph that is divided in two groups and a vertex from one group is connected to all the vertexes from the other group
	 */
	public void insertCompleteBipartiteGraph(mxGraph graph,
			int numVertexesLeft, int numVertexesRight, float groupSpacing,
			boolean directed, boolean weighted, int minWeight, int maxWeight)
	{
		graph.selectAll();
		graph.removeCells();
		int verticalSpacing = 80;
		try
		{
			Object rootCell = graph.getDefaultParent();
			graph.getModel().beginUpdate();
			float group1StartY = 0;
			float group2StartY = 0;

			if (numVertexesLeft < numVertexesRight)
			{
				float centerYtimes2 = (numVertexesRight * verticalSpacing);
				group1StartY = (centerYtimes2 - (numVertexesLeft * verticalSpacing)) / 2;
			}
			if (numVertexesLeft > numVertexesRight)
			{
				float centerYtimes2 = (numVertexesLeft * verticalSpacing);
				group2StartY = (centerYtimes2 - (numVertexesRight * verticalSpacing)) / 2;
			}
			int vertexCount = 0;
			// create vertexes for group 1
			for (int i = 0; i < numVertexesLeft; i++)
			{
				graph.insertVertex(rootCell, null,
						new Integer(vertexCount).toString(), 0,
						(group1StartY + i * verticalSpacing), 25, 25,
						basicVertexStyleString);
				vertexCount++;
			}
			// create vertexes for group 2
			for (int i = 0; i < numVertexesRight; i++)
			{
				graph.insertVertex(rootCell, null,
						new Integer(vertexCount).toString(), groupSpacing,
						(group2StartY + i * verticalSpacing), 25, 25,
						basicVertexStyleString);
				vertexCount++;
			}

			// create edges
			for (int i = 0; i < numVertexesLeft; i++)
			{
				mxCell sourceVertex = getVertexWithValue(graph, i);
				for (int j = 0; j < numVertexesRight; j++)
				{
					int destValue = numVertexesLeft + j;
					mxCell destVertex = getVertexWithValue(graph, destValue);
					if (!areConnected(sourceVertex, destVertex))
					{
						if (weighted)
							graph.insertEdge(
									graph.getDefaultParent(),
									null,
									new Integer(getRandom(minWeight, maxWeight))
											.toString(), sourceVertex,
									destVertex, getEdgeStyle(directed));
						else
							graph.insertEdge(graph.getDefaultParent(), null,
									null, sourceVertex, destVertex,
									getEdgeStyle(directed));
					}
				}
			}

		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param minValue
	 * @param maxValue
	 * @return a random number from the interval [minValue, maxValue]
	 */
	private int getRandom(int minValue, int maxValue)
	{
		if (minValue == maxValue)
			return minValue;
		if (minValue > maxValue)
		{
			int tmp = maxValue;
			maxValue = minValue;
			minValue = tmp;
		}

		int currValue = 0;
		currValue = minValue
				+ (int) Math.round((Math.random() * (maxValue - minValue)));
		return currValue;
	}

	/**
	 * @param graph - handle
	 * @param arrows - if true, the graph will be directed
	 * @param maxWeight 
	 * @param minWeight 
	 * @param weighted 
	 * Generates a complete graph
	 */
	public void insertCompleteGraph(mxGraph graph, int vertexNum,
			boolean directed, boolean weighted, int minWeight, int maxWeight)
	{
		graph.selectAll();
		graph.removeCells();
		// Create array for vertices
		Object[] vertices = new mxCell[vertexNum];

		try
		{
			Object rootCell = graph.getDefaultParent();
			graph.getModel().beginUpdate();
			for (int i = 0; i < vertexNum; i++)
			{
				Object cell = graph.insertVertex(rootCell, null,
						new Integer(i).toString(), 0, 0, 25, 25,
						basicVertexStyleString);
				vertices[i] = cell;
			}

			// Connect every cell to each other
			for (int i = 0; i < vertexNum; i++)
			{
				for (int j = i + 1; j < vertexNum; j++)
				{
					if (!areConnected((mxCell) vertices[i],
							(mxCell) vertices[j]))
					{
						if (weighted)
							graph.insertEdge(
									graph.getDefaultParent(),
									null,
									new Integer(getRandom(minWeight, maxWeight))
											.toString(), vertices[i],
									vertices[j], getEdgeStyle(directed));
						else
							graph.insertEdge(graph.getDefaultParent(), null,
									null, vertices[i], vertices[j],
									getEdgeStyle(directed));
					}
				}
			}

			mxCircleLayout layout = new mxCircleLayout(graph);
			layout.execute(rootCell);
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph - handle
	 * @param branchNum - number of branches in the windmill graph
	 * @param directed - if true, the edges will be directed
	 * @param weighted - if true, all edges will be assigned random weights
	 * @param minWeight - minimum weight for edges
	 * @param maxWeight - maximum weight for edges
	 * Generates a windmill graph. The size is calculated automatically.
	 */
	public void insertFriendshipWindmillGraph(mxGraph graph, int branchNum,
			boolean directed, boolean weighted, int minWeight, int maxWeight)
	{
		try
		{
			graph.selectAll();
			graph.removeCells();
			Object rootCell = graph.getDefaultParent();

			graph.getModel().beginUpdate();

			if (branchNum < 2)
				branchNum = 2;
			int vertexNum = branchNum * 2 + 1;
			int perimeterNum = vertexNum - 1;
			float wheelSize = vertexNum * 20;
			if (wheelSize < 120)
				wheelSize = 120;

			mxCell[] vertexes = new mxCell[vertexNum];
			float centerX = wheelSize / 2f;
			float centerY = centerX;

			//create the circle
			for (int i = 0; i < perimeterNum; i++)
			{
				//calc the position
				int x = 0;
				int y = 0;
				float currRatio = ((float) i / (float) perimeterNum);
				currRatio = currRatio * 2;
				currRatio = currRatio * (float) Math.PI;
				x = (Integer) Math.round(centerX
						+ Math.round(wheelSize * Math.sin(currRatio) / 2));
				y = (Integer) Math.round(centerY
						- Math.round(wheelSize * Math.cos(currRatio) / 2));
				//shoot
				mxCell vertex = (mxCell) graph.insertVertex(rootCell, null,
						new Integer(i).toString(), x, y, 25, 25,
						basicVertexStyleString);
				vertexes[i] = vertex;
			}
			//the center vertex is the last one
			mxCell vertex = (mxCell) graph.insertVertex(rootCell, null,
					new Integer(perimeterNum).toString(), centerX, centerY, 25,
					25, basicVertexStyleString);
			vertexes[perimeterNum] = vertex;

			//create the edges
			String value = new String();
			for (int i = 0; i < branchNum; i++)
			{
				if (weighted)
					value = new Integer(getRandom(minWeight, maxWeight))
							.toString();
				graph.insertEdge(rootCell, null, value, vertexes[perimeterNum],
						vertexes[i * 2], getEdgeStyle(directed));
				if (weighted)
					value = new Integer(getRandom(minWeight, maxWeight))
							.toString();
				graph.insertEdge(rootCell, null, value, vertexes[i * 2],
						vertexes[i * 2 + 1], getEdgeStyle(directed));
				if (weighted)
					value = new Integer(getRandom(minWeight, maxWeight))
							.toString();
				graph.insertEdge(rootCell, null, value, vertexes[i * 2 + 1],
						vertexes[perimeterNum], getEdgeStyle(directed));
			}
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph - handle
	 * @param branchNum - number of branches in the windmill graph
	 * @param numVertexesInBranch - number of vertexes in each branch not including the center vertex
	 * @param directed - if true, the edges will be directed
	 * @param weighted - if true, all edges will be assigned random weights
	 * @param minWeight - minimum weight for edges
	 * @param maxWeight - maximum weight for edges
	 * Generates a full windmill graph. The size is calculated automatically.	 */
	public void insertFullWindmillGraph(mxGraph graph, int branchNum,
			int numVertexesInBranch, boolean directed, boolean weighted,
			int minWeight, int maxWeight)
	{
		try
		{
			graph.selectAll();
			graph.removeCells();
			Object rootCell = graph.getDefaultParent();

			graph.getModel().beginUpdate();

			if (branchNum < 2)
				branchNum = 2;
			if (numVertexesInBranch < 2)
				numVertexesInBranch = 2;
			int vertexNum = branchNum * numVertexesInBranch + 1;
			int perimeterNum = vertexNum - 1;
			float wheelSize = vertexNum * 20;
			float branchSize = numVertexesInBranch * 40;
			if (wheelSize < 120)
				wheelSize = 120;

			mxCell[] vertexes = new mxCell[vertexNum];
			float centerX = (wheelSize + branchSize) / 2f;
			float centerY = centerX;

			//create the circle
			for (int i = 0; i < branchNum; i++)
			{
				//calc the position
				int branchX = 0;
				int branchY = 0;
				float branchRatio = ((float) i / (float) branchNum);
				branchRatio = branchRatio * 2;
				branchRatio = branchRatio * (float) Math.PI;
				branchX = (Integer) Math.round(centerX
						+ Math.round(wheelSize * Math.sin(branchRatio) / 2));
				branchY = (Integer) Math.round(centerY
						- Math.round(wheelSize * Math.cos(branchRatio) / 2));
				//shoot

				for (int j = 0; j < numVertexesInBranch; j++)
				{
					int x = 0;
					int y = 0;
					//					float currRatio = branchRatio - (float) Math.PI; 
					float currRatio = ((float) (j + 0.5) / (2 * (float) numVertexesInBranch));
					currRatio = currRatio * 2;
					currRatio = currRatio * (float) Math.PI;
					currRatio = currRatio + branchRatio
							- ((float) Math.PI / 2f);
					x = (Integer) Math.round(x
							+ Math.round(branchSize * Math.sin(currRatio) / 2));
					y = (Integer) Math.round(y
							- Math.round(branchSize * Math.cos(currRatio) / 2));
					mxCell vertex = (mxCell) graph
							.insertVertex(rootCell, null, new Integer(i
									* numVertexesInBranch + j).toString(),
									branchX + x, branchY + y, 25, 25,
									basicVertexStyleString);
					vertexes[i * numVertexesInBranch + j] = vertex;
				}
			}

			//the center vertex is the last one
			mxCell vertex = (mxCell) graph.insertVertex(rootCell, null,
					new Integer(perimeterNum).toString(), centerX, centerY, 25,
					25, basicVertexStyleString);
			vertexes[perimeterNum] = vertex;

			//create the edges
			String value = new String();
			for (int i = 0; i < branchNum; i++)
			{
				//from center to all in branch
				//determine branch start and branch end
				int branchStartIndex = i * numVertexesInBranch;

				for (int j = 0; j < numVertexesInBranch; j++)
				{
					if (weighted)
						value = new Integer(getRandom(minWeight, maxWeight))
								.toString();
					graph.insertEdge(rootCell, null, value,
							vertexes[perimeterNum], vertexes[branchStartIndex
									+ j], getEdgeStyle(directed));
				}
				for (int j = 0; j < numVertexesInBranch; j++)
				{
					for (int k = 0; k < numVertexesInBranch; k++)
					{
						if (weighted)
							value = new Integer(getRandom(minWeight, maxWeight))
									.toString();
						if (!areConnected(vertexes[branchStartIndex + j],
								vertexes[branchStartIndex + k]))
							graph.insertEdge(rootCell, null, value,
									vertexes[branchStartIndex + j],
									vertexes[branchStartIndex + k],
									getEdgeStyle(directed));
					}
				}
			}
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph
	 * Generates a grid graph
	 * @param maxWeight 
	 * @param minWeight 
	 * @param weighted 
	 * @param arrows 
	 */
	public void insertGridGraph(mxGraph graph, int numRows, int numColumns,
			float gridSpacing, boolean arrows, boolean weighted, int minWeight,
			int maxWeight)
	{
		graph.selectAll();
		graph.removeCells();

		try
		{
			Object rootCell = graph.getDefaultParent();
			graph.getModel().beginUpdate();
			mxIGraphModel model = graph.getModel();

			// Gets all vertices inside the parent and finds
			// the vertex with minimum edge count
			int vertexCount = 0;
			for (int i = 0; i < numColumns; i++)
			{
				for (int j = 0; j < numRows; j++)
				{
					mxCell currVertex = (mxCell) graph.insertVertex(rootCell,
							null, new Integer(vertexCount).toString(), j
									* gridSpacing, i * gridSpacing, 25, 25,
							basicVertexStyleString);
					// connect with the vertex in the previous row
					if (i != 0)
					{
						mxCell oldVertex = currVertex;
						int vertexValue = Integer.parseInt((String) currVertex
								.getValue());
						int k = 0;
						while (vertexValue != (vertexCount - numRows))
						{
							oldVertex = (mxCell) model.getChildAt(rootCell, k);
							if (oldVertex.isVertex())
								vertexValue = Integer
										.parseInt((String) oldVertex.getValue());
							else
								vertexValue = -1;
							k++;
						}
						if (!areConnected(currVertex, oldVertex))
						{
							if (weighted)
								graph.insertEdge(
										graph.getDefaultParent(),
										null,
										new Integer(getRandom(minWeight,
												maxWeight)).toString(),
										currVertex, oldVertex,
										getEdgeStyle(arrows));
							else
								graph.insertEdge(graph.getDefaultParent(),
										null, null, currVertex, oldVertex,
										getEdgeStyle(arrows));
						}
					}
					// connect with the vertex in the previous column
					if (j != 0)
					{
						mxCell oldVertex = currVertex;
						int vertexValue = Integer.parseInt((String) currVertex
								.getValue());
						int k = 0;
						while (vertexValue != (vertexCount - 1))
						{
							oldVertex = (mxCell) model.getChildAt(rootCell, k);
							if (oldVertex.isVertex())
								vertexValue = Integer
										.parseInt((String) oldVertex.getValue());
							else
								vertexValue = -1;
							k++;
						}
						if (!areConnected(currVertex, oldVertex))
						{
							if (weighted)
								graph.insertEdge(
										graph.getDefaultParent(),
										null,
										new Integer(getRandom(minWeight,
												maxWeight)).toString(),
										currVertex, oldVertex,
										getEdgeStyle(arrows));
							else
								graph.insertEdge(graph.getDefaultParent(),
										null, null, currVertex, oldVertex,
										getEdgeStyle(arrows));
						}
					}
					vertexCount++;
				}
			}

		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * Common insert functionality
	 */
	protected void insertIntoGraph(mxGraph graph, Object[] vertices,
			Object[] edges)
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.addCells(vertices);
			graph.addCells(edges);
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph - handle
	 * @param xDim - x dimension of the "chessboard"
	 * @param yDim - y dimension of the "chessboard"
	 * @param startVertexValue - the value of the vertex from which the tour should start
	 * @param spacing - spacing between the fields of the chessboard
	 * @return
	 * Implementation of a variation of Warnsdorff's rule to generate a knight's tour. Note that on smaller board sizes the algorithm may not find a solution, even when there is one. 
	 */
	public ArrayList<mxCell> insertKnightTour(mxGraph graph, int xDim,
			int yDim, int startVertexValue, float spacing)
	{
		if (xDim < 5)
			xDim = 5;
		if (yDim < 5)
			yDim = 5;

		graph.selectAll();
		graph.removeCells();
		ArrayList<mxCell> resultPath = new ArrayList<mxCell>();

		try
		{
			graph.getModel().beginUpdate();
			mxCell rootCell = (mxCell) graph.getDefaultParent();
			for (int j = 0; j < yDim; j++)
			{
				for (int i = 0; i < xDim; i++)
				{
					int currValue = j * xDim + i;
					graph.insertVertex(rootCell, null,
							new Integer(currValue).toString(), i * gridSpacing,
							j * gridSpacing, 25, 25, basicVertexStyleString);
				}
			}
			// we have the board set up

			//now we set up the starting conditions
			int currValue = startVertexValue;
			int[] currCoords = new int[2];
			mxCell oldMove = getVertexWithValue(graph, startVertexValue);
			currCoords = getVertexGridCoords(xDim, yDim, startVertexValue);
			resultPath.add(oldMove);
			mxCell nextMove = getNextKnightMove(graph, xDim, yDim,
					currCoords[0], currCoords[1]);

			//the main loop
			while (nextMove != null)
			{
				// connect current with the possible move that has minimum number of its (possible moves)
				graph.insertEdge(rootCell, null, null, oldMove, nextMove,
						getEdgeStyle(true));
				resultPath.add(nextMove);
				// that vertex becomes the current vertex and we repeat until no possible moves
				currValue = Integer.parseInt((String) nextMove.getValue());
				currCoords = getVertexGridCoords(xDim, yDim, currValue);
				oldMove = nextMove;
				nextMove = getNextKnightMove(graph, xDim, yDim, currCoords[0],
						currCoords[1]);
			}
		}
		finally
		{
			graph.getModel().endUpdate();
		}
		return resultPath;
	}

	/**
	 * @param graph - handle
	 * @param directed - true if the graph is directed
	 * @param weighted - true if the graph is weighted
	 * @return adjacency matrix based on the input parameters, if weighted is set to true, edges with null weight will be counted as 1
	 */
	public int[][] getAdjMatrix(mxGraph graph, boolean directed,
			boolean weighted)
	{
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexCount = vertexes.length;
		int[][] adjMatrix = new int[vertexCount][vertexCount];
		for (int i = 0; i < vertexCount; i++)
		{
			mxCell currVertex = (mxCell) vertexes[i];
			for (int j = 0; j < vertexCount; j++)
			{
				mxCell destVertex = (mxCell) vertexes[j];
				Object[] edges = graph.getEdgesBetween(currVertex, destVertex);
				if (directed)
				{
					int edgeCount = 0;
					for (int k = 0; k < edges.length; k++)
					{
						mxCell currEdge = (mxCell) edges[k];
						if (currEdge.getTarget().equals(destVertex))
						{
							if (weighted)
							{
								// need to avoid null edges
								int currValue = 0;
								if (currEdge.getValue() == null)
									currValue = 1;
								else
									currValue = Integer
											.parseInt((String) currEdge
													.getValue());
								edgeCount += currValue;
							}
							else
								edgeCount++;
						}
					}
					adjMatrix[i][j] = edgeCount;
				}
				else
				{
					if (weighted)
					{
						int edgeCount = 0;
						for (int k = 0; k < edges.length; k++)
						{
							mxCell currEdge = (mxCell) edges[k];
							int currValue = 0;
							if (currEdge.getValue() == null)
								currValue = 1;
							else
								currValue = Integer.parseInt((String) currEdge
										.getValue());
							edgeCount += currValue;
						}
						adjMatrix[i][j] = edgeCount;
					}
					else
						adjMatrix[i][j] = edges.length;
				}
			}
		}
		if (developmentMode)
			System.out.println("The adjacency matrix is: "
					+ Arrays.deepToString(adjMatrix));
		return adjMatrix;
	}

	/**
	 * @param graph - handle
	 * @param adjMatrix - the adjacency matrix that defines the graph structure
	 * @param directed - if true, the resulting graph will be directed
	 * @param weighted - if true, the edges will be weighted
	 */
	public void getGraph(mxGraph graph, int[][] adjMatrix, boolean directed,
			boolean weighted)
	{
		graph.selectAll();
		graph.removeCells();
		Object rootCell = graph.getDefaultParent();
		ArrayList<mxCell> vertexes = new ArrayList<mxCell>();
		//for testing only
		// NOTE: comment out the next 2 lines to make the method fully functional
		int[][] adjMatrix1 = { { 0, 0, 0, 3, 1 }, { 0, 0, 1, 0, 1 },
				{ 0, 0, 0, 1, 1 }, { 1, 0, 1, 0, 1 }, { 0, 0, 0, 0, 0 } };
		adjMatrix = adjMatrix1;
		//testing part end

		int numVertexes = adjMatrix[0].length;
		int vertexCount = 0;
		//making the vertexes
		for (int i = 0; i < numVertexes; i++)
		{
			mxCell currVertex = (mxCell) graph.insertVertex(rootCell, null,
					new Integer(vertexCount).toString(), 0, 0, 25, 25,
					basicVertexStyleString);
			vertexes.add(currVertex);
			vertexCount++;
		}
		//making the edges
		for (int i = 0; i < numVertexes; i++)
		{
			mxCell source = vertexes.get(i);
			for (int j = 0; j < numVertexes; j++)
			{
				int currWeight = adjMatrix[i][j];
				if (currWeight > 0)
				{
					mxCell target = vertexes.get(j);
					String value = new String();
					if (weighted && !directed)
						value = new Integer(adjMatrix[i][j]).toString();
					if (directed || (weighted && !areConnected(source, target)))
					{
						graph.insertEdge(graph.getDefaultParent(), null, value,
								source, target, getEdgeStyle(directed));
					}
					else if (!directed && !areConnected(source, target))
					{
						for (int k = 0; k < currWeight; k++)
						{
							graph.insertEdge(graph.getDefaultParent(), null,
									value, source, target,
									getEdgeStyle(directed));
						}
					}
				}
			}
		}

		mxOrganicLayout layout = new mxOrganicLayout(graph);
		layout.execute(rootCell);

	}

	/**
	 * @param graph - handle
	 * @param xDim - x dimension of the chessboard
	 * @param yDim - y dimension of the chessboard
	 * @param spacing - spacing between fields of the chessboard
	 * Generates a graph which represents all possible king moves on a chessboard of specified size
	 */
	public void insertKingGraph(mxGraph graph, int xDim, int yDim, float spacing)
	{
		if (xDim < 2)
			xDim = 2;
		if (yDim < 2)
			yDim = 2;
		graph.selectAll();
		graph.removeCells();

		try
		{
			graph.getModel().beginUpdate();
			mxCell rootCell = (mxCell) graph.getDefaultParent();
			for (int j = 0; j < yDim; j++)
			{
				for (int i = 0; i < xDim; i++)
				{
					int currValue = j * xDim + i;
					graph.insertVertex(rootCell, null,
							new Integer(currValue).toString(), i * gridSpacing,
							j * gridSpacing, 25, 25, basicVertexStyleString);
				}
			}
			// we have the board set up

			//now we set up the starting conditions
			int[] currCoords = new int[2];

			//the main loop
			for (int i = 0; i < (xDim * yDim); i++)
			{
				currCoords = getVertexGridCoords(xDim, yDim, i);
				ArrayList<mxCell> neighborMoves = getKingMoveVertexes(graph,
						xDim, yDim, currCoords[0], currCoords[1]);
				for (int j = 0; j < neighborMoves.size(); j++)
				{
					// connect current with the possible move that has minimum number of its (possible moves)
					graph.insertEdge(rootCell, null, null,
							getVertexWithValue(graph, i), neighborMoves.get(j),
							getEdgeStyle(false));
					// that vertex becomes the current vertex and we repeat until no possible moves
				}
			}
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph - handle
	 * @param xDim - x dimension of the chessboard
	 * @param yDim - y dimension of the chessboard
	 * @param spacing - spacing between fields of the chessboard
	 * Generates a graph which represents all possible knight moves on a chessboard of specified size
	 */
	public void insertKnightGraph(mxGraph graph, int xDim, int yDim,
			float spacing)
	{
		if (xDim < 4)
			xDim = 4;
		if (yDim < 4)
			yDim = 4;

		graph.selectAll();
		graph.removeCells();

		try
		{
			graph.getModel().beginUpdate();
			mxCell rootCell = (mxCell) graph.getDefaultParent();
			for (int j = 0; j < yDim; j++)
			{
				for (int i = 0; i < xDim; i++)
				{
					int currValue = j * xDim + i;
					graph.insertVertex(rootCell, null,
							new Integer(currValue).toString(), i * gridSpacing,
							j * gridSpacing, 25, 25, basicVertexStyleString);
				}
			}
			// we have the board set up

			//now we set up the starting conditions
			int[] currCoords = new int[2];

			//the main loop
			for (int i = 0; i < (xDim * yDim); i++)
			{
				currCoords = getVertexGridCoords(xDim, yDim, i);
				ArrayList<mxCell> neighborMoves = getKnightMoveVertexes(graph,
						xDim, yDim, currCoords[0], currCoords[1]);
				for (int j = 0; j < neighborMoves.size(); j++)
				{
					// connect current with the possible move that has minimum number of its (possible moves)
					graph.insertEdge(rootCell, null, null,
							getVertexWithValue(graph, i), neighborMoves.get(j),
							getEdgeStyle(false));
					// that vertex becomes the current vertex and we repeat until no possible moves
				}
			}
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph - handle
	 * @param vertexCount - number of vertexes
	 * @param directed - if true, the edges will be directed
	 * @param weighted - if true, the edges will have random weights
	 * @param minWeight - minimum possible value for an edge
	 * @param maxWeight - maximum possible value for an edge
	 * Generates a simple graph that consists of one path only with the specified number of vertexes
	 */
	public void insertPathGraph(mxGraph graph, int vertexCount,
			boolean directed, boolean weighted, int minWeight, int maxWeight)
	{
		try
		{
			graph.selectAll();
			graph.removeCells();
			Object rootCell = graph.getDefaultParent();
			graph.getModel().beginUpdate();
			mxCell[] vertexes = new mxCell[vertexCount];

			for (int i = 0; i < vertexCount; i++)
			{
				mxCell vertex = (mxCell) graph.insertVertex(rootCell, null,
						new Integer(i).toString(), 0, i * 80, 25, 25,
						basicVertexStyleString);
				vertexes[i] = vertex;
			}

			String value = new String();
			for (int i = 0; i < vertexCount - 1; i++)
			{
				if (weighted)
					value = new Integer(getRandom(minWeight, maxWeight))
							.toString();
				graph.insertEdge(rootCell, null, value, vertexes[i],
						vertexes[i + 1], getEdgeStyle(directed));
			}
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph - handle
	 * @param directed - if true, the edges will be directed
	 * @param weighted - is true, the edges will have random weights
	 * @param minWeight - minimum possible weight for an edge
	 * @param maxWeight - maximum possible weight for an edge
	 * Generates a Petersen graph
	 */
	public void insertPetersenGraph(mxGraph graph, boolean directed,
			boolean weighted, int minWeight, int maxWeight)
	{
		try
		{
			graph.selectAll();
			graph.removeCells();
			Object rootCell = graph.getDefaultParent();
			graph.getModel().beginUpdate();
			mxCell[] vertexes = new mxCell[10];
			for (int i = 0; i < 10; i++)
			{
				mxCell vertex = (mxCell) graph.insertVertex(rootCell, null,
						new Integer(i).toString(), 0, 0, 25, 25,
						basicVertexStyleString);
				vertexes[i] = vertex;
			}
			String value = new String();
			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[0], vertexes[2],
					getEdgeStyle(directed));
			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[0], vertexes[8],
					getEdgeStyle(directed));
			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[0], vertexes[9],
					getEdgeStyle(directed));

			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[1], vertexes[2],
					getEdgeStyle(directed));
			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[1], vertexes[5],
					getEdgeStyle(directed));
			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[1], vertexes[7],
					getEdgeStyle(directed));

			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[2], vertexes[4],
					getEdgeStyle(directed));

			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[3], vertexes[4],
					getEdgeStyle(directed));
			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[3], vertexes[7],
					getEdgeStyle(directed));
			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[3], vertexes[9],
					getEdgeStyle(directed));

			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[4], vertexes[6],
					getEdgeStyle(directed));

			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[5], vertexes[6],
					getEdgeStyle(directed));
			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[5], vertexes[9],
					getEdgeStyle(directed));

			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[6], vertexes[8],
					getEdgeStyle(directed));

			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(rootCell, null, value, vertexes[7], vertexes[8],
					getEdgeStyle(directed));

			mxCircleLayout layout = new mxCircleLayout(graph);
			layout.execute(rootCell);
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph - handle
	 * @param vertexCount - number of vertexes to be in the wheel graph
	 * @param directed - if true, the edges will be directed
	 * @param weighted - if true, the edges will have random weights
	 * @param minWeight - minimum possible weight of an edge
	 * @param maxWeight - maximum possible weight of an edge
	 * Generates a wheel graph. Note that vertexCount should be at least 4. 1 vertex for the center and 3 for the perimeter. The graph size is calculated.
	 */
	public void insertWheelGraph(mxGraph graph, int vertexCount,
			boolean directed, boolean weighted, int minWeight, int maxWeight)
	{
		try
		{
			graph.selectAll();
			graph.removeCells();
			Object rootCell = graph.getDefaultParent();

			graph.getModel().beginUpdate();

			if (vertexCount < 4)
				vertexCount = 4;
			float wheelSize = vertexCount * 20;
			if (wheelSize < 120)
				wheelSize = 120;

			mxCell[] vertexes = new mxCell[vertexCount];
			float centerX = wheelSize / 2f;
			float centerY = centerX;

			int numVertexesInPerimeter = vertexCount - 1;

			//create the circle
			for (int i = 0; i < numVertexesInPerimeter; i++)
			{
				//calc the position
				int x = 0;
				int y = 0;
				float currRatio = ((float) i / (float) numVertexesInPerimeter);
				currRatio = currRatio * 2;
				currRatio = currRatio * (float) Math.PI;
				x = (Integer) Math.round(centerX
						+ Math.round(wheelSize * Math.sin(currRatio) / 2));
				y = (Integer) Math.round(centerY
						- Math.round(wheelSize * Math.cos(currRatio) / 2));
				//shoot
				mxCell vertex = (mxCell) graph.insertVertex(rootCell, null,
						new Integer(i).toString(), x, y, 25, 25,
						basicVertexStyleString);
				vertexes[i] = vertex;
			}
			//the center vertex is the last one
			mxCell vertex = (mxCell) graph.insertVertex(rootCell, null,
					new Integer(numVertexesInPerimeter).toString(), centerX,
					centerY, 25, 25, basicVertexStyleString);
			vertexes[numVertexesInPerimeter] = vertex;

			//create the edges
			String value = new String();
			for (int i = 0; i < numVertexesInPerimeter; i++)
			{
				if (weighted)
					value = new Integer(getRandom(minWeight, maxWeight))
							.toString();
				graph.insertEdge(rootCell, null, value,
						vertexes[numVertexesInPerimeter], vertexes[i],
						getEdgeStyle(directed));
				if (i < numVertexesInPerimeter - 1)
					graph.insertEdge(rootCell, null, value, vertexes[i],
							vertexes[i + 1], getEdgeStyle(directed));
				else if (i == numVertexesInPerimeter - 1)
					graph.insertEdge(rootCell, null, value, vertexes[i],
							vertexes[0], getEdgeStyle(directed));
			}

		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph - handle
	 * @param vertexCount - number of vertexes in the graph
	 * @param directed - if true, the edges will be directed
	 * @param weighted - if true, the edges will have random weights
	 * @param minWeight - minimum possible weight for edges
	 * @param maxWeight - maximum possible weight for edges
	 * Generates a star graph. Number of vertexes should be at least 4, otherwise it wouldn't be a star. Size is calculated.
	 */
	public void insertStarGraph(mxGraph graph, int vertexCount,
			boolean directed, boolean weighted, int minWeight, int maxWeight)
	{
		try
		{
			graph.selectAll();
			graph.removeCells();
			Object rootCell = graph.getDefaultParent();
			graph.getModel().beginUpdate();
			if (vertexCount < 4)
				vertexCount = 4;
			mxCell[] vertexes = new mxCell[vertexCount];
			float starSize = vertexCount * 20;
			float centerX = starSize / 2f;
			float centerY = centerX;

			int numVertexesInPerimeter = vertexCount - 1;

			//create the circle
			for (int i = 0; i < numVertexesInPerimeter; i++)
			{
				//calc the position
				int x = 0;
				int y = 0;
				float currRatio = ((float) i / (float) numVertexesInPerimeter);
				currRatio = currRatio * 2;
				currRatio = currRatio * (float) Math.PI;
				x = (Integer) Math.round(centerX
						+ Math.round(starSize * Math.sin(currRatio) / 2));
				y = (Integer) Math.round(centerY
						- Math.round(starSize * Math.cos(currRatio) / 2));
				//shoot
				mxCell vertex = (mxCell) graph.insertVertex(rootCell, null,
						new Integer(i).toString(), x, y, 25, 25,
						basicVertexStyleString);
				vertexes[i] = vertex;
			}
			//the center vertex is the last one
			mxCell vertex = (mxCell) graph.insertVertex(rootCell, null,
					new Integer(numVertexesInPerimeter).toString(), centerX,
					centerY, 25, 25, basicVertexStyleString);
			vertexes[numVertexesInPerimeter] = vertex;

			//create the edges
			String value = new String();
			for (int i = 0; i < numVertexesInPerimeter; i++)
			{
				if (weighted)
					value = new Integer(getRandom(minWeight, maxWeight))
							.toString();
				graph.insertEdge(rootCell, null, value,
						vertexes[numVertexesInPerimeter], vertexes[i],
						getEdgeStyle(directed));

			}

		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph - handle
	 * @param xDim - x size of the chessboard
	 * @param yDim - y size of the chessboard
	 * @param xCoord - x coord of the knight
	 * @param yCoord - y coord of the knight
	 * @return - the next move of the knight
	 * This method makes the decision as to where the knight should move next. It should be used only in the knight's tour algorithm, that's why it's private.
	 */
	private mxCell getNextKnightMove(mxGraph graph, int xDim, int yDim,
			int xCoord, int yCoord)
	{
		ArrayList<mxCell> possibleMoves = getPossibleKnightMoveVertexes(graph,
				xDim, yDim, xCoord, yCoord);
		//get the position with minimum possible moves
		int minMoveNum = 9;
		float biggestDistance = 0;
		mxCell currVertex = null;
		for (int i = 0; i < possibleMoves.size(); i++)
		{
			int currValue = Integer.parseInt((String) possibleMoves.get(i)
					.getValue());
			int[] currCoords = getVertexGridCoords(xDim, yDim, currValue);
			int currMoveNum = getPossibleKnightMoveCount(graph, xDim, yDim,
					currCoords[0], currCoords[1]);
			float currDistance = getDistanceFromGridCenter(xDim, yDim,
					currValue);
			if (currMoveNum < minMoveNum
					|| (currMoveNum == minMoveNum && currDistance > biggestDistance))
			{
				biggestDistance = currDistance;
				minMoveNum = currMoveNum;
				currVertex = possibleMoves.get(i);
			}
		}
		return currVertex;
	}

	/**
	 * @param xDim - x dimension of the chessboard
	 * @param yDim - y dimension of the chessboard
	 * @param currValue - the vertex value for we need the distance calculation
	 * @return the distance from the center of the chessboard
	 * This is used exclusively by Warnsdorff's algorithm for the knight's tour and it shouldn't be used for other purposes. Marked private.  
	 */
	private float getDistanceFromGridCenter(int xDim, int yDim, int currValue)
	{
		float centerX = (xDim + 1) / 2f;
		float centerY = (yDim + 1) / 2f;
		int[] currCoords = getVertexGridCoords(xDim, yDim, currValue);
		float x = Math.abs(centerX - currCoords[0]);
		float y = Math.abs(centerY - currCoords[1]);

		return (float) Math.sqrt(x * x + y * y);
	}

	/**
	 * @param graph - handle
	 * @param xDim - x dimension of chess-board, size starts from 1
	 * @param yDim - y dimension of chess-board, size starts from 1
	 * @param xCoord - x coordinate on the chess-board, coordinate starts from 1
	 * @param yCoord - y coordinate on the chess-board, coordinate starts from 1
	 * @return number of all valid knight moves from the given position
	 */
	private int getPossibleKnightMoveCount(mxGraph graph, int xDim, int yDim,
			int xCoord, int yCoord)
	{
		//check all possible 8 locations

		//location 1
		int currX = xCoord + 1;
		int currY = yCoord - 2;
		int possibleMoveCount = 0;
		// check if in bounds
		mxCell currVertex;
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoveCount++;
		}

		//location 2
		currX = xCoord + 2;
		currY = yCoord - 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoveCount++;
		}

		//location 3
		currX = xCoord + 2;
		currY = yCoord + 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoveCount++;
		}

		//location 4
		currX = xCoord + 1;
		currY = yCoord + 2;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoveCount++;
		}

		//location 5
		currX = xCoord - 1;
		currY = yCoord + 2;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoveCount++;
		}

		//location 6
		currX = xCoord - 2;
		currY = yCoord + 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoveCount++;
		}

		//location 7
		currX = xCoord - 2;
		currY = yCoord - 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoveCount++;
		}

		//location 8
		currX = xCoord - 1;
		currY = yCoord - 2;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoveCount++;
		}

		return possibleMoveCount;
	}

	/**
	 * @param graph - handle
	 * @param xDim - x dimension of chess-board, size starts from 1
	 * @param yDim - y dimension of chess-board, size starts from 1
	 * @param xCoord - x coordinate on the chess-board, coordinate starts from 1
	 * @param yCoord - y coordinate on the chess-board, coordinate starts from 1
	 * @return a list of vertexes which would be valid knight moves from the current position
	 */
	private ArrayList<mxCell> getPossibleKnightMoveVertexes(mxGraph graph,
			int xDim, int yDim, int xCoord, int yCoord)
	{
		//check all possible 8 locations

		//location 1
		int currX = xCoord + 1;
		int currY = yCoord - 2;
		ArrayList<mxCell> possibleMoves = new ArrayList<mxCell>();
		// check if in bounds
		mxCell currVertex;
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoves.add(currVertex);
		}

		//location 2
		currX = xCoord + 2;
		currY = yCoord - 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoves.add(currVertex);
		}

		//location 3
		currX = xCoord + 2;
		currY = yCoord + 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoves.add(currVertex);
		}

		//location 4
		currX = xCoord + 1;
		currY = yCoord + 2;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoves.add(currVertex);
		}

		//location 5
		currX = xCoord - 1;
		currY = yCoord + 2;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoves.add(currVertex);
		}

		//location 6
		currX = xCoord - 2;
		currY = yCoord + 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoves.add(currVertex);
		}

		//location 7
		currX = xCoord - 2;
		currY = yCoord - 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoves.add(currVertex);
		}

		//location 8
		currX = xCoord - 1;
		currY = yCoord - 2;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			if (currVertex.getEdgeCount() == 0)
				possibleMoves.add(currVertex);
		}

		return possibleMoves;
	}

	/**
	 * @param graph - handle
	 * @param xDim - x dimension of chess-board, size starts from 1
	 * @param yDim - y dimension of chess-board, size starts from 1
	 * @param xCoord - x coordinate on the chess-board, coordinate starts from 1
	 * @param yCoord - y coordinate on the chess-board, coordinate starts from 1
	 * @return a list of ALL vertexes which would be valid moves from the current position, regardless if they were visited or not
	 */
	private ArrayList<mxCell> getKnightMoveVertexes(mxGraph graph, int xDim,
			int yDim, int xCoord, int yCoord)
	{
		//check all possible 8 locations

		//location 1
		int currX = xCoord + 1;
		int currY = yCoord - 2;
		ArrayList<mxCell> possibleMoves = new ArrayList<mxCell>();
		// check if in bounds
		mxCell currVertex;
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 2
		currX = xCoord + 2;
		currY = yCoord - 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 3
		currX = xCoord + 2;
		currY = yCoord + 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 4
		currX = xCoord + 1;
		currY = yCoord + 2;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 5
		currX = xCoord - 1;
		currY = yCoord + 2;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 6
		currX = xCoord - 2;
		currY = yCoord + 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 7
		currX = xCoord - 2;
		currY = yCoord - 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 8
		currX = xCoord - 1;
		currY = yCoord - 2;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		return possibleMoves;
	}

	/**
	 * @param graph - handle
	 * @param xDim - x dimension of the chessboard
	 * @param yDim - y dimension of the chessboard
	 * @param xCoord - the current x position of the king
	 * @param yCoord - the current y position of the king
	 * @return list of all possible moves of a king from the specified position
	 */
	private ArrayList<mxCell> getKingMoveVertexes(mxGraph graph, int xDim,
			int yDim, int xCoord, int yCoord)
	{
		//check all possible 8 locations

		//location 1
		int currX = xCoord + 1;
		int currY = yCoord - 1;
		ArrayList<mxCell> possibleMoves = new ArrayList<mxCell>();
		// check if in bounds
		mxCell currVertex;
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 2
		currX = xCoord + 1;
		currY = yCoord;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 3
		currX = xCoord + 1;
		currY = yCoord + 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 4
		currX = xCoord;
		currY = yCoord + 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 5
		currX = xCoord - 1;
		currY = yCoord + 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 6
		currX = xCoord - 1;
		currY = yCoord;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 7
		currX = xCoord - 1;
		currY = yCoord + 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		//location 8
		currX = xCoord;
		currY = yCoord - 1;
		// check if in bounds
		if (currX > 0 && currX <= xDim && currY > 0 && currY <= yDim)
		{
			currVertex = getVertexFromGrid(graph, xDim, yDim, currX, currY);
			possibleMoves.add(currVertex);
		}

		return possibleMoves;
	}

	/**
	 * use this only with the grid graph, and various chess-board graphs, because of vertex ordering
	 * @param graph - handle
	 * @param xDim - x dimension of chess-board, size starts from 1
	 * @param yDim - y dimension of chess-board, size starts from 1
	 * @param xCoord - x coordinate on the chess-board, coordinate starts from 1
	 * @param yCoord - y coordinate on the chess-board, coordinate starts from 1
	 * @return vertex on the desired coordinates
	 */
	private mxCell getVertexFromGrid(mxGraph graph, int xDim, int yDim,
			int xCoord, int yCoord)
	{
		if (xCoord > xDim || yCoord > yDim)
		{
			System.out
					.println("Cannot return vertex, because requested location is out of bounds.");
			return null;
		}
		int value = (yCoord - 1) * xDim + xCoord - 1;
		return getVertexWithValue(graph, value);
	}

	/**
	 * use this only with the grid graph, and various chess-board graphs, because of vertex ordering
	 * @param graph - handle
	 * @param xDim - x dimension of chess-board, size starts from 1
	 * @param yDim - y dimension of chess-board, size starts from 1
	 * @param value - value of the vertex that needs coordinates returned
	 * @return int[x,y] where x and y are the coordinates in the grid or chess-board
	 */
	private int[] getVertexGridCoords(int xDim, int yDim, int value)
	{
		if (value > ((yDim * xDim) - 1))
		{
			System.out
					.println("Cannot return indexes, because requested value is out of bounds.");
			return null;
		}

		int yCoord = (int) Math.floor(value / xDim);
		int xCoord = (value - yCoord * xDim) + 1;
		yCoord += 1;

		int[] coords = new int[2];
		coords[0] = xCoord;
		coords[1] = yCoord;
		return coords;
	}

	/**
	 * Generates an n-regular (n-valent) graph
	 * @param graph - handle
	 * @param numNodes - number of vertexes
	 * @param directed - if true, the edges will be directed
	 * @param weighted - if true, the edges will have random weight
	 * @param minWeight - minimum possible value for edges
	 * @param maxWeight - maximum possible value for edges
	 */
	public void insertNRegularGraph(mxGraph graph, int numNodes,
			boolean directed, boolean weighted, int minWeight, int maxWeight)
	{
		graph.selectAll();
		graph.removeCells();

		if (numNodes % 4 == 0)
			insertBivalentGraph(graph, directed);
		// Create array for vertices

		try
		{
			Object rootCell = graph.getDefaultParent();
			graph.getModel().beginUpdate();
			if (numNodes % 4 != 0)
				for (int i = 0; i < numNodes; i++)
				{
					graph.insertVertex(rootCell, null,
							new Integer(i).toString(), 0, 0, 25, 25,
							basicVertexStyleString);
				}

			while (getLowestDegreeVertex(graph, null).getEdgeCount() < valence)
			{
				mxCell firstCell = getLowestDegreeVertex(graph, null);
				mxCell secondCell = getLowestDegreeVertex(graph, firstCell);
				if (!areConnected(firstCell, secondCell))
				{
					if (weighted)
					{
						graph.insertEdge(graph.getDefaultParent(), null,
								new Integer(getRandom(minWeight, maxWeight))
										.toString(), firstCell, secondCell,
								getEdgeStyle(directed));
					}
					else
					{
						graph.insertEdge(graph.getDefaultParent(), null, null,
								firstCell, secondCell, getEdgeStyle(directed));
					}
				}
			}

			mxOrganicLayout layout = new mxOrganicLayout(graph);
			layout.execute(rootCell);

		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * @param graph
	 * Generate a null graph
	 * @param numNodes 
	 */
	public void insertNullGraph(mxGraph graph, int numNodes)
	{
		// Create array for vertices
		Object[] vertices = new mxCell[numNodes];

		try
		{
			graph.selectAll();
			graph.removeCells();
			Object rootCell = graph.getDefaultParent();
			graph.getModel().beginUpdate();
			for (int i = 0; i < numNodes; i++)
			{
				Object cell = graph.insertVertex(rootCell, null,
						new Integer(i).toString(), 0, 0, 25, 25,
						basicVertexStyleString);
				vertices[i] = cell;
			}
			mxCircleLayout layout = new mxCircleLayout(graph);
			layout.execute(rootCell);
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	/**
	 * Generates a random graph based on these parameters:
	 * @param graph - the graph handle
	 * @param arrows - should the edges have arrowheads on the target ends
	 * @param allowSelfLoops - should self loops be generated
	 * @param allowMultipleEdges - should multiple edges be generated
	 * @param forceConnected - should the result graph be always connected
	 */
	public void insertSimpleRandomGraph(mxGraph graph, int numNodes,
			int numEdges, boolean directed, boolean allowSelfLoops,
			boolean allowMultipleEdges, boolean forceConnected,
			boolean weighted, int minWeight, int maxWeight)
	{
		graph.selectAll();
		graph.removeCells();
		if (numEdges > numNodes * (numNodes - 1) / 2)
		{
			numEdges = numNodes * (numNodes - 1) / 2;
		}

		for (int i = 0; i < numNodes; i++)
		{
			graph.insertVertex(graph.getDefaultParent(), null,
					new Integer(i).toString(), 0, 0, 25, 25,
					basicVertexStyleString);
		}
		ArrayList<mxCell> vertexList = getVertexList(graph);
		for (int i = 0; i < numEdges; i++)
		{
			boolean goodPair = false;
			mxCell startVertex;
			mxCell endVertex;
			do
			{
				startVertex = vertexList.get((int) Math.round(Math.random()
						* (vertexList.size() - 1)));
				endVertex = vertexList.get((int) Math.round(Math.random()
						* (vertexList.size() - 1)));
				if (!startVertex.equals(endVertex)
						&& !areConnected(startVertex, endVertex))
					goodPair = true;
			}
			while (!goodPair);
			String value = new String();
			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(graph.getDefaultParent(), null, value,
					startVertex, endVertex, getEdgeStyle(directed));
		}

		if (forceConnected)
			makeConnected(graph, directed, weighted, minWeight, maxWeight);
		mxOrganicLayout layout = new mxOrganicLayout(graph);
		layout.execute(graph.getDefaultParent());
	}

	/**
	 * @param graph
	 * @return - true if the graph is connected
	 */
	public boolean isConnected(mxGraph graph)
	{
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexCount = vertexes.length;
		if (vertexCount > 0)
		{
			//data preparation
			int connectedVertexes = 1;
			int[] visited = new int[vertexCount];
			visited[0] = 1;
			for (int i = 1; i < vertexCount; i++)
			{
				visited[i] = 0;
			}
			ArrayList<mxCell> queue = new ArrayList<mxCell>();
			queue.add((mxCell) vertexes[0]);

			//repeat the algo until the queue is empty
			while (queue.size() > 0)
			{
				//cut out the first vertex
				mxCell currVertex = queue.get(0);
				queue.remove(0);

				//fill the queue with neighboring but unvisited vertexes
				int edgeCount = currVertex.getEdgeCount();
				mxCell[] edges = new mxCell[edgeCount];
				mxCell[] neighborVertexes = new mxCell[edgeCount];
				for (int j = 0; j < edgeCount; j++)
				{
					edges[j] = (mxCell) currVertex.getEdgeAt(j);
				}
				for (int j = 0; j < edgeCount; j++)
				{
					mxCell source = (mxCell) edges[j].getSource();
					mxCell destination = (mxCell) edges[j].getTarget();
					if (!source.equals(currVertex))
					{
						neighborVertexes[j] = source;
					}
					else
					{
						neighborVertexes[j] = destination;
					}
				}
				for (int j = 0; j < edgeCount; j++)
				{
					//get the index of the neighbor vertex
					int index = 0;
					for (int k = 0; k < vertexCount; k++)
					{
						if (vertexes[k].equals(neighborVertexes[j]))
							index = k;
					}
					if (visited[index] == 0)
					{
						queue.add((mxCell) vertexes[index]);
						visited[index] = 1;
						connectedVertexes++;
					}
				}
			}
			// end of the while loop

			// if we visited every vertex, the graph is connected
			if (connectedVertexes == vertexCount)
			{
				if (developmentMode)
					System.out.println("Graph is connected");
				return true;
			}
			else
			{
				if (developmentMode)
					System.out.println("Graph is not connected");
				return false;
			}
		}
		if (developmentMode)
			System.out.println("Connectivity isn't defined for empty graphs.");
		return false;
	}

	/**
	 * @param graph
	 * @return - true if the graph is cyclic (with taken account of edge direction)
	 */
	public boolean isCyclicDirected(mxGraph graph)
	{
		mxIGraphModel model = graph.getModel();
		Object[] cells = model.cloneCells(
				graph.getChildCells(graph.getDefaultParent()), true);
		mxGraphModel modelCopy = new mxGraphModel();
		mxGraph graphCopy = new mxGraph(modelCopy);
		graphCopy.addCells(cells);

		// changes are made to the original, since the algo doesn't work on graphCopy
		//		graphCopy = graph;
		Object[] leaf = new Object[1];
		do
		{
			leaf[0] = getDirectedLeaf(graphCopy);
			if (leaf[0] != null)
			{
				graphCopy.removeCells(leaf);
				if (developmentMode)
					System.out.println("One leaf is"
							+ ((mxCell) leaf[0]).getValue());
			}
			else if (developmentMode)
				System.out.println("Leaf is null");

		}
		while (leaf[0] != null);
		int vertexCount = graphCopy.getChildVertices(graph.getDefaultParent()).length;
		if (developmentMode)
			System.out.println("Vertexes left: " + vertexCount);
		if (vertexCount > 0)
		{
			if (developmentMode)
				System.out.println("Graph is directed cyclic");
			return true;
		}
		else
		{
			if (developmentMode)
				System.out.println("Graph is directed acyclic");
			return false;
		}
	}

	/**
	 * @param graph - handle
	 * @return true if graph is a tree (regardless of edge direction)
	 */
	public boolean isTree(mxGraph graph)
	{
		if (isConnected(graph) && !isCyclicUndirected(graph) && isSimple(graph))
		{
			System.out.println("The graph is a tree.");
			return true;
		}
		System.out.println("The graph isn't a tree.");
		return false;
	}

	/**
	 * @param graph - handle
	 * @param forceConnected - if true, an unconnected graph is made connected
	 * @param forceSimple - if true, a non-simple graph is made simple
	 * Calculates one spanning tree of graph, which doesn't have to be but can be minimal
	 * (this is faster than minimal spanning tree, so if you need any spanning tree, use this one)
	 * Self loops and multiple edges are automatically removed!
	 * Also, unconnected graphs are made connected!
	 */
	public void oneSpanningTree(mxGraph graph, boolean forceConnected,
			boolean forceSimple, boolean directed, boolean weighted,
			int minWeight, int maxWeight)
	{
		// maybe add correcting options in the config dialogue, like: "make connected if needed"
		if (!isSimple(graph))
			makeSimple(graph);

		if (!isConnected(graph))
			makeConnected(graph, directed, weighted, minWeight, maxWeight);

		Object[] edges = graph.getChildEdges(graph.getDefaultParent());
		int edgeCount = edges.length;
		for (int i = 0; i < edgeCount; i++)
		{
			mxCell currEdge = (mxCell) edges[i];
			Object[] dummy = new Object[1];
			dummy[0] = currEdge;
			graph.removeCells(dummy);
			if (!isConnected(graph))
				graph.addCell(currEdge);
		}
	}

	/**
	 * @param graph - handle (undirected tree for now)
	 * @param root - the vertex that will be the root of the tree
	 * 
	 * Alters the edges of the graph, so the graph "flows" from the root to the leafs
	 */
	public void makeTreeDirected(mxGraph graph, mxCell root)
	{
		graph.getModel().beginUpdate();
		ArrayList<mxCell> bFSList = breadthFirstSearch(graph, root);
		for (int i = 0; i < bFSList.size(); i++)
		{
			mxCell parentVertex = bFSList.get(i);
			ArrayList<mxCell> neighbors = neighbors(graph, parentVertex);
			for (int j = 0; j < neighbors.size(); j++)
			{
				mxCell currVertex = neighbors.get(j);
				int childIndex = bFSList.indexOf(currVertex);
				if (childIndex > i)
				{
					//parentVertex is parent of currVertex, so the edge must be directed from parentVertex to currVertex
					// but we need to find the connecting edge first
					mxCell currEdge = getConnectingEdge(parentVertex,
							currVertex);
					currEdge.setSource(parentVertex);
					currEdge.setTarget(currVertex);
					currEdge.setStyle(basicEdgeStyleString
							+ basicArrowStyleString);
				}
			}
		}
		mxCompactTreeLayout layout = new mxCompactTreeLayout(graph);
		layout.setHorizontal(false);
		layout.execute(graph.getDefaultParent());
		graph.getModel().endUpdate();
	}

	public void insertSimpleRandomTree(mxGraph graph, int vertexCount)
	{
		graph.getModel().beginUpdate();
		int edgeCount = (int) Math.round(vertexCount * 4);
		insertSimpleRandomGraph(graph, vertexCount, edgeCount, false, false,
				false, true, false, 0, 0);
		//still need to remove surplus edges
		Object[] dummy = graph.getChildVertices(graph.getDefaultParent());

		oneSpanningTree(graph, true, true, true, false, 0, 0);

		makeTreeDirected(
				graph,
				(mxCell) dummy[(int) Math.round(Math.random()
						* (dummy.length - 1))]);
		graph.getModel().endUpdate();
	}

	public mxCell getConnectingEdge(mxCell vertexOne, mxCell vertexTwo)
	{
		int edgeCount = vertexOne.getEdgeCount();
		for (int i = 0; i < edgeCount; i++)
		{
			mxCell currEdge = (mxCell) vertexOne.getEdgeAt(i);
			Object source = (mxCell) currEdge.getSource();
			Object target = (mxCell) currEdge.getTarget();
			if (source.equals(vertexOne) && target.equals(vertexTwo))
				return currEdge;
			if (source.equals(vertexTwo) && target.equals(vertexOne))
				return currEdge;
		}
		return null;
	}

	/**
	 * @param graph
	 * @return - true if the graph is cyclic (regardless of edge direction)
	 */
	public boolean isCyclicUndirected(mxGraph graph)
	{
		mxIGraphModel model = graph.getModel();
		Object[] cells = model.cloneCells(
				graph.getChildCells(graph.getDefaultParent()), true);
		mxGraphModel modelCopy = new mxGraphModel();
		mxGraph graphCopy = new mxGraph(modelCopy);
		graphCopy.addCells(cells);

		// changes are made to the original, since the algo doesn't work on graphCopy
		//		graphCopy = graph;
		Object[] leaf = new Object[1];
		do
		{
			leaf[0] = getUndirectedLeaf(graphCopy);
			if (leaf[0] != null)
			{
				graphCopy.removeCells(leaf);
				if (developmentMode)
					System.out.println("One leaf is"
							+ ((mxCell) leaf[0]).getValue());
			}
			else if (developmentMode)
				System.out.println("Leaf is null");

		}
		while (leaf[0] != null);
		int vertexCount = graphCopy.getChildVertices(graphCopy
				.getDefaultParent()).length;
		System.out.println("Vertexes left: " + vertexCount);
		if (vertexCount > 0)
		{
			if (developmentMode)
				System.out.println("Graph is undirected cyclic");
			return true;
		}
		else
		{
			if (developmentMode)
				System.out.println("Graph is undirected acyclic");
			return false;
		}
	}

	public boolean isPlanar(mxGraph graph)
	{
		// TODO implement
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexNum = vertexes.length;
		Object[] edges = graph.getChildEdges(graph.getDefaultParent());
		int edgeNum = edges.length;
		if (edgeNum > (3 * vertexNum - 5))
		{
			if (developmentMode)
				System.out
						.println("The graph is not planar. It has too many edges compared to the number of vertexes.");
			return false;
		}

		ArrayList<ArrayList<mxCell>> bicomponentList = getBiconnectedComponents(graph);
		int bicomponentNum = bicomponentList.size();
		boolean isPlanar = true;
		// check the planarity for each bicomponent
		for (int i = 0; i < bicomponentNum; i++)
		{
			// first we need to get the st numbering
		}
		System.out.println("Planarity test under construction.");
		return isPlanar;
	}

	/**
	 * @param graph
	 * @return - true if the graph is simple (no self loops and no parallel edges)
	 */
	public boolean isSimple(mxGraph graph)
	{
		// if anything below is found, the graph isn't simple (self loops and double edges)

		// check self loops
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexCount = vertexes.length;
		for (int i = 0; i < vertexCount; i++)
		{
			mxCell currVertex = (mxCell) vertexes[i];

			int edgeCount = currVertex.getEdgeCount();
			mxCell[] edges = new mxCell[edgeCount];
			for (int j = 0; j < edgeCount; j++)
			{
				edges[j] = (mxCell) currVertex.getEdgeAt(j);
			}
			for (int j = 0; j < edgeCount; j++)
			{
				mxCell source = (mxCell) edges[j].getSource();
				mxCell destination = (mxCell) edges[j].getTarget();
				if (source.equals(destination))
				{
					if (developmentMode)
						System.out.println("Graph is not simple");
					return false;
				}
			}

		}

		// check for double edges;
		for (int i = 0; i < vertexCount; i++)
		{
			mxCell currVertex = (mxCell) vertexes[i];
			int edgeCount = currVertex.getEdgeCount();
			mxCell[] edges = new mxCell[edgeCount];
			for (int j = 0; j < edgeCount; j++)
			{
				edges[j] = (mxCell) currVertex.getEdgeAt(j);
			}

			ArrayList<mxCell> neighbors = new ArrayList<mxCell>();
			for (int j = 0; j < edgeCount; j++)
			{
				mxCell source = (mxCell) edges[j].getSource();
				mxCell destination = (mxCell) edges[j].getTarget();
				mxCell neighbor;
				if (!source.equals(currVertex))
					neighbor = source;
				else
					neighbor = destination;
				if (neighbors.contains(neighbor))
				{
					if (developmentMode)
						System.out.println("Graph is not simple");
					return false;
				}
				else
				{
					neighbors.add(neighbor);
				}
			}
		}
		if (developmentMode)
			System.out.println("Graph is simple");
		return true;
	}

	/**
	 * @param graph
	 * Make an unconnected graph connected
	 */
	public void makeConnected(mxGraph graph, boolean directed,
			boolean weighted, int minWeight, int maxWeight)
	{
		// an early check, to avoid running getGraphComponents() needlessly, which is CPU intensive
		if (isConnected(graph))
		{
			if (developmentMode)
				System.out.println("The graph is already connected!");
			return;
		}
		ArrayList<ArrayList<mxCell>> componentList = getGraphComponents(graph);
		mxCell root = (mxCell) graph.getDefaultParent();
		int componentCount = componentList.size();
		if (componentCount < 2)
		{
			if (developmentMode)
				System.out.println("The graph is already connected!");
			return;
		}

		// find a random vertex in each group and connect them.
		String value = new String();
		for (int i = 1; i < componentCount; i++)
		{
			mxCell sourceVertex = componentList.get(i - 1).get(
					(int) Math.round(Math.random()
							* (componentList.get(i - 1).size() - 1)));
			mxCell targetVertex = componentList.get(i).get(
					(int) Math.round(Math.random()
							* (componentList.get(i).size() - 1)));
			if (weighted)
				value = new Integer(getRandom(minWeight, maxWeight)).toString();
			graph.insertEdge(root, null, value, sourceVertex, targetVertex,
					getEdgeStyle(directed));
		}

	}

	/**
	 * @param graph
	 * Make a graph simple (remove parallel edges and self loops)
	 */
	public void makeSimple(mxGraph graph)
	{
		// remove all self-loops
		// reduce all valences >1 to 1
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());

		for (int i = 0; i < vertexes.length; i++)
		{
			mxCell currVertex = (mxCell) vertexes[i];
			int edgeCount = currVertex.getEdgeCount();
			ArrayList<mxCell> neighbors = new ArrayList<mxCell>();
			Object[] edges = new Object[edgeCount];
			for (int j = 0; j < edgeCount; j++)
				edges[j] = currVertex.getEdgeAt(j);
			for (int j = 0; j < edgeCount; j++)
			{
				mxCell currEdge = (mxCell) edges[j];
				mxCell source = (mxCell) currEdge.getSource();
				mxCell target = (mxCell) currEdge.getTarget();
				Object[] temp = new Object[1];
				temp[0] = currEdge;

				//removing self-loops
				if (source.equals(target))
				{
					graph.removeCells(temp);
				}
				else
				{
					//check for duplicate neighbors
					if (neighbors.contains(source)
							|| neighbors.contains(target))
						graph.removeCells(temp);
					else if (!source.equals(currVertex))
						neighbors.add(source);
					else if (!target.equals(currVertex))
						neighbors.add(target);
				}
			}
		}
	}

	/**
	 * @param graph - handle
	 * @param vertex - handle
	 * @return - all cells that are adjacent to vertex
	 */
	public ArrayList<mxCell> neighbors(mxGraph graph, mxCell vertex)
	{
		ArrayList<mxCell> neighborList = new ArrayList<mxCell>();
		int edgeCount = vertex.getEdgeCount();
		for (int i = 0; i < edgeCount; i++)
		{
			mxCell currEdge = (mxCell) vertex.getEdgeAt(i);
			mxCell source = (mxCell) currEdge.getSource();
			mxCell target = (mxCell) currEdge.getTarget();
			Object[] temp = new Object[1];
			temp[0] = currEdge;

			if (!source.equals(vertex) && !neighborList.contains(source))
				neighborList.add(source);
			if (!target.equals(vertex) && !neighborList.contains(target))
				neighborList.add(target);
		}
		return neighborList;
	}

	/**
	 * @param graph - graph handle
	 * @return the regularity of the graph. -1 is returned if the graph is irregular.
	 */
	public int regularity(mxGraph graph)
	{
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexCount = vertexes.length;
		mxCell currVertex = (mxCell) vertexes[0];
		int regularity = currVertex.getEdgeCount();
		for (int i = 1; i < vertexCount; i++)
		{
			currVertex = (mxCell) vertexes[i];
			if (regularity != currVertex.getEdgeCount())
			{
				if (developmentMode)
					System.out.println("Graph is irregular");
				return -1;
			}
		}
		if (developmentMode)
			System.out.println("Graph is " + regularity + "-regular");
		return regularity;
	}

	/**
	 * @param graph
	 * Many methods in this package require that vertex values are 0...vertexCount
	 * This method makes sure this condition is fulfilled
	 */
	public void refreshVertexValues(mxGraph graph)
	{
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		for (int i = 0; i < vertexes.length; i++)
		{
			mxCell currVertex = (mxCell) vertexes[i];
			currVertex.setValue(i);
		}
	}

	/**
	 * @param graph
	 * Many methods in this package require that all edges are connected on both ends.
	 * This method makes sure this condition is fulfilled, by removing edges that are unconnected at least on one side
	 */
	public void removeUnconnectedEdges(mxGraph graph)
	{
		Object[] edges = graph.getChildEdges(graph.getDefaultParent());
		Object[] dummy = new Object[1];
		for (int i = 0; i < edges.length; i++)
		{
			mxCell currEdge = (mxCell) edges[i];
			if (currEdge.getSource() == null || currEdge.getTarget() == null)
			{
				dummy[0] = (Object) currEdge;
				graph.removeCells(dummy);
			}
		}
	}

	public boolean isDirected(mxGraph graph)
	{
		Object[] edges = graph.getChildEdges(graph.getDefaultParent());
		int edgeNum = edges.length;
		boolean directed = true;
		for (int i = 0; i < edgeNum; i++)
		{
			mxCell currEdge = (mxCell) edges[i];
			String style = currEdge.getStyle();
			if (style.contains("endArrow=none"))
				directed = false;
		}

		if (developmentMode)
		{
			if (directed)
				System.out.println("Graph is directed.");
			else
				System.out.println("Graph is undirected.");
		}

		return directed;
	}

	public int indegree(mxCell vertex)
	{
		int indegree = 0;
		int value = 0;
		for (int i = 0; i < vertex.getEdgeCount(); i++)
		{
			mxCell currEdge = (mxCell) vertex.getEdgeAt(i);
			if (currEdge.getTarget().equals(vertex))
			{
				if (currEdge.getValue() == null)
					value = 1;
				else
					value = Integer.parseInt((String) currEdge.getValue());
				indegree += value;
			}
		}

		if (developmentMode)
		{
			System.out.println("Indegree of " + vertex.getValue() + " is "
					+ indegree);
		}
		return indegree;
	}

	public ArrayList<mxCell> getCutEdges(mxGraph graph)
	{
		ArrayList<mxCell> cutEdgeList = new ArrayList<mxCell>();
		Object[] edges = graph.getChildEdges(graph.getDefaultParent());
		int edgeNum = edges.length;
		for (int i = 0; i < edgeNum; i++)
		{
			if (isCutEdge(graph, (mxCell) edges[i], true))
				cutEdgeList.add((mxCell) edges[i]);
		}
		if (developmentMode)
		{
			System.out.print("Cut edges of the graph are: [");
			for (int i = 0; i < cutEdgeList.size(); i++)
			{
				System.out.print(" " + cutEdgeList.get(i).getId());
				cutEdgeList.get(i).setStyle(
						"strokeColor=blue;noEdgeStyle=1;endArrow=none;");
			}
			System.out.println(" ]");
		}
		return cutEdgeList;
	}

	public ArrayList<mxCell> getCutVertexes(mxGraph graph)
	{
		ArrayList<mxCell> cutVertexList = new ArrayList<mxCell>();
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		int vertexNum = vertexes.length;
		for (int i = 0; i < vertexNum; i++)
		{
			if (isCutVertex(graph, (mxCell) vertexes[i]))
				cutVertexList.add((mxCell) vertexes[i]);
		}
		if (developmentMode)
		{
			System.out.print("Cut vertexes of the graph are: [");
			for (int i = 0; i < cutVertexList.size(); i++)
			{
				System.out.print(" " + cutVertexList.get(i).getValue());
			}
			System.out.println(" ]");
		}
		return cutVertexList;
	}

	public boolean isCutVertex(mxGraph graph, mxCell vertex)
	{
		mxIGraphModel model = graph.getModel();
		Object[] cells = model.cloneCells(
				graph.getChildCells(graph.getDefaultParent()), true);
		mxGraphModel modelCopy = new mxGraphModel();
		mxGraph graphCopy = new mxGraph(modelCopy);
		graphCopy.addCells(cells);
		int value = Integer.parseInt((String) vertex.getValue());
		mxCell newVertex = getVertexWithValue(graphCopy, value);

		Object[] tmp = new Object[1];
		tmp[0] = newVertex;
		graphCopy.removeCells(tmp, true);
		ArrayList<ArrayList<mxCell>> oldComponents = getGraphComponents(graph);
		ArrayList<ArrayList<mxCell>> newComponents = getGraphComponents(graphCopy);
		boolean isCutVertex = false;
		if (newComponents.size() > oldComponents.size())
			isCutVertex = true;
		if (developmentMode && isCutVertex)
			System.out.println("Vertex " + vertex.getValue()
					+ " is a cut vertex.");
		else if (developmentMode && !isCutVertex)
			System.out.println("Vertex " + vertex.getValue()
					+ " is not a cut vertex.");
		return isCutVertex;
	}

	public boolean isCutEdge(mxGraph graph, mxCell edge, boolean useOriginal)
	{
		if (!useOriginal)
		{
			mxIGraphModel model = graph.getModel();
			Object[] cells = model.cloneCells(
					graph.getChildCells(graph.getDefaultParent()), true);
			mxGraphModel modelCopy = new mxGraphModel();
			mxGraph graphCopy = new mxGraph(modelCopy);
			graphCopy.addCells(cells);
			String edgeId = edge.getId();
			mxCell newEdge = (mxCell) modelCopy.getCell(edgeId);

			Object[] tmp = new Object[1];
			tmp[0] = newEdge;
			graphCopy.removeCells(tmp, true);
			ArrayList<ArrayList<mxCell>> oldComponents = getGraphComponents(graph);
			ArrayList<ArrayList<mxCell>> newComponents = getGraphComponents(graphCopy);
			boolean isCutEdge = false;
			if (newComponents.size() > oldComponents.size())
				isCutEdge = true;
			if (developmentMode && isCutEdge)
				System.out
						.println("Edge with Id " + edgeId + " is a cut edge.");
			else if (developmentMode && !isCutEdge)
				System.out.println("Edge with Id " + edgeId
						+ " is not a cut edge.");
			return isCutEdge;
		}
		else
		{
			Object[] tmp = new Object[1];
			tmp[0] = edge;
			String edgeId = edge.getId();
			mxCell source = (mxCell) edge.getSource();
			mxCell target = (mxCell) edge.getTarget();

			ArrayList<ArrayList<mxCell>> oldComponents = getGraphComponents(graph);
			graph.removeCells(tmp, true);
			ArrayList<ArrayList<mxCell>> newComponents = getGraphComponents(graph);
			boolean isCutEdge = false;
			if (newComponents.size() > oldComponents.size())
				isCutEdge = true;
			if (isCutEdge)
			{
				graph.insertEdge(graph.getDefaultParent(), null, null, source,
						target, "strokeColor=blue;noEdgeStyle=1;endArrow=none");
				if (developmentMode)
					System.out.println("Edge with Id " + edgeId
							+ " is a cut edge.");
			}
			else
			{
				graph.insertEdge(graph.getDefaultParent(), null, null, source,
						target, "strokeColor=red;noEdgeStyle=1;endArrow=none");
				if (developmentMode)
					System.out.println("Edge with Id " + edgeId
							+ " is not a cut edge.");
			}
			return isCutEdge;
		}
	}

	public ArrayList<mxCell> getSourceVertexes(mxGraph graph)
	{
		if (!isDirected(graph))
			return null;
		ArrayList<mxCell> sourceList = new ArrayList<mxCell>();
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		for (int i = 0; i < vertexes.length; i++)
		{
			mxCell currVertex = (mxCell) vertexes[i];
			if (graph.getIncomingEdges(currVertex).length == 0
					&& graph.getOutgoingEdges(currVertex).length > 0)
				sourceList.add(currVertex);
		}
		if (developmentMode)
		{
			System.out.print("Source vertexes of the graph are: [");
			for (int i = 0; i < sourceList.size(); i++)
			{
				System.out.print(" " + sourceList.get(i).getValue());
			}
			System.out.println(" ]");
		}
		return sourceList;
	}

	public ArrayList<mxCell> getSinkVertexes(mxGraph graph)
	{
		if (!isDirected(graph))
			return null;
		ArrayList<mxCell> sinkList = new ArrayList<mxCell>();
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		for (int i = 0; i < vertexes.length; i++)
		{
			mxCell currVertex = (mxCell) vertexes[i];
			if (graph.getOutgoingEdges(currVertex).length == 0
					&& graph.getIncomingEdges(currVertex).length > 0)
				sinkList.add(currVertex);
		}
		if (developmentMode)
		{
			System.out.print("Sink vertexes of the graph are: [");
			for (int i = 0; i < sinkList.size(); i++)
			{
				System.out.print(" " + sinkList.get(i).getValue());
			}
			System.out.println(" ]");
		}
		return sinkList;
	}

	private void resetGraphStyle(mxGraph graph, boolean directed,
			boolean weighted, int minWeight, int maxWeight)
	{
		graph.getModel().beginUpdate();
		Object[] vertexes = graph.getChildVertices(graph.getDefaultParent());
		Object[] edges = graph.getChildEdges(graph.getDefaultParent());

		int vertexNum = vertexes.length;
		int edgeNum = edges.length;

		for (int i = 0; i < vertexNum; i++)
		{
			mxCell currVertex = (mxCell) vertexes[i];
			currVertex.setStyle(basicVertexStyleString);
			currVertex.getGeometry().setHeight(25);
			currVertex.getGeometry().setWidth(25);
		}

		for (int i = 0; i < edgeNum; i++)
		{
			mxCell currEdge = (mxCell) edges[i];
			currEdge.setStyle(getEdgeStyle(directed));
			if (weighted
					&& (currEdge.getValue() == null || currEdge.getValue()
							.equals("")))
			{
				currEdge.setValue(getRandom(minWeight, maxWeight));
			}
		}
		graph.getModel().endUpdate();
	}

	public int outdegree(mxCell vertex)
	{
		int outdegree = 0;
		int value = 0;
		for (int i = 0; i < vertex.getEdgeCount(); i++)
		{
			mxCell currEdge = (mxCell) vertex.getEdgeAt(i);
			if (currEdge.getSource().equals(vertex))
			{
				if (currEdge.getValue() == null)
					value = 1;
				else
					value = Integer.parseInt((String) currEdge.getValue());
				outdegree += value;
			}
		}

		if (developmentMode)
		{
			System.out.println("Indegree of " + vertex.getValue() + " is "
					+ outdegree);
		}
		return outdegree;
	}

	public void setAllowMultipleEdges(boolean allowMultipleEdges)
	{
		this.allowMultipleEdges = allowMultipleEdges;
	}

	public void setAllowSelfLoops(boolean allowSelfLoops)
	{
		this.allowSelfLoops = allowSelfLoops;
	}

	public void setArrows(boolean arrows)
	{
		this.arrows = arrows;
	}

	public void setEndVertexValue(int endVertexValue)
	{
		this.endVertexValue = endVertexValue;
	}

	public void setForceConnected(boolean forceConnected)
	{
		this.forceConnected = forceConnected;
	}

	public void setGridSpacing(float gridSpacing)
	{
		if (gridSpacing < 1)
		{
			gridSpacing = 1;
		}
		this.gridSpacing = gridSpacing;
	}

	public void setGroupSpacing(float groupSpacing)
	{
		this.groupSpacing = groupSpacing;
	}

	/**
	 * @param insertIntoModel
	 *            The insertIntoModel to set.
	 */
	public void setInsertIntoModel(boolean insertIntoModel)
	{
		this.insertIntoModel = insertIntoModel;
	}

	public void setNumColumns(int numColumns)
	{
		this.numColumns = numColumns;
	}

	/**
	 * @param numEdges
	 *            The numEdges to set.
	 */
	public void setNumEdges(int numEdges)
	{
		if (numEdges < 1)
		{
			numEdges = 1;
		}
		else if (numEdges > 2000000)
		{
			numEdges = 2000000;
		}
		this.numEdges = numEdges;
	}

	/**
	 * @param numNodes
	 *            The numNodes to set.
	 */
	public void setNumNodes(int numNodes)
	{
		if (numNodes < 1)
		{
			numNodes = 1;
		}
		else if (numNodes > 2000000)
		{
			numNodes = 2000000;
		}
		this.numNodes = numNodes;
	}

	public void setNumRows(int numRows)
	{
		this.numRows = numRows;
	}

	public void setNumVertexesLeft(int numVertexesLeft)
	{
		if (numVertexesLeft < 1)
		{
			numVertexesLeft = 1;
		}
		else if (numVertexesLeft > 300)
		{
			numVertexesLeft = 300;
		}
		this.numVertexesLeft = numVertexesLeft;
	}

	public void setNumVertexesRight(int numVertexesRight)
	{
		if (numVertexesRight < 1)
		{
			numVertexesRight = 1;
		}
		else if (numVertexesRight > 300)
		{
			numVertexesRight = 300;
		}
		this.numVertexesRight = numVertexesRight;
	}

	public void setStartVertexValue(int startVertexValue)
	{
		this.startVertexValue = startVertexValue;
	}

	public void setValence(int valence)
	{
		if (valence < 0)
		{
			valence = 0;
		}
		else if (valence > 100)
		{
			valence = 100;
		}
		this.valence = valence;
	}

	public int getEndVertexValue()
	{
		return endVertexValue;
	}

	public float getGridSpacing()
	{
		return gridSpacing;
	}

	public float getGroupSpacing()
	{
		return groupSpacing;
	}

	public int getNumColumns()
	{
		return numColumns;
	}

	public int getNumEdges()
	{
		return numEdges;
	}

	public int getNumNodes()
	{
		return numNodes;
	}

	public int getNumRows()
	{
		return numRows;
	}

	public int getNumVertexesLeft()
	{
		return numVertexesLeft;
	}

	public int getNumVertexesRight()
	{
		return numVertexesRight;
	}

	public int getStartVertexValue()
	{
		return startVertexValue;
	}

	public int getValence()
	{
		return valence;
	}

	public boolean isAllowMultipleEdges()
	{
		return allowMultipleEdges;
	}

	public boolean isAllowSelfLoops()
	{
		return allowSelfLoops;
	}

	public boolean isArrows()
	{
		return arrows;
	}

	public boolean isForceConnected()
	{
		return forceConnected;
	}

	public boolean isInsertIntoModel()
	{
		return insertIntoModel;
	}

	public boolean isWeighted()
	{
		return weighted;
	}

	public void setWeighted(boolean weighted)
	{
		this.weighted = weighted;
	}

}
