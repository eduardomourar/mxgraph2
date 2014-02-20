package com.mxgraph.examples.fastgraph;

import java.io.IOException;

import com.mxgraph.fastgraph.FastGraphModel;

public class InsertPerformance {

	public static long testStartTime = 0;
	
	public static void main(String[] args)
	{
		testStartTime = System.currentTimeMillis();
		System.out.println("================");

		// Creates graph with model
		FastGraphModel graph = new FastGraphModel();

		int nodeCount = 100000;
		int edgesPerNode = 2000;
		
		System.out.println("Start time " + resourceStamp());
		
		long[][] nodes = new long[nodeCount][edgesPerNode];
		long[] edges = new long[edgesPerNode * nodeCount];

		for (int i = 0; i < nodeCount; i++)
		{
			nodes[i] = new long[edgesPerNode];
			for (int j = 0; j < edgesPerNode; j++)
			{
				nodes[i][j] = j;
				edges[j] = i;
				edges[j] = (i+1) << 32;
			}
		}

		FastGraphModel.addCells(graph, nodes, edges);
		
//		try
//		{
//			Object[] nodes = new Object[nodeCount];
//			Object[] edges = new Object[edgeCount];
//
//			for (int i = 0; i < nodeCount; i++)
//			{
//				nodes[i] = graph.insertVertex(parent, null, "N" + i, 0, 0, 30,
//						30);
//			}
//
//			for (int i = 0; i < edgeCount; i++)
//			{
//				int r1 = (int) (Math.random() * nodeCount);
//				int r2 = (int) (Math.random() * nodeCount);
//				edges[i] = graph.insertEdge(parent, null, r1 + "-" + r2,
//						nodes[r1], nodes[r2]);
//			}
//		}
//		finally
//		{
//			graph.getModel().endUpdate();
//		}

		System.out.println("End update finished " + resourceStamp());
		System.out.println("Number of vertices = " + nodeCount);
		System.out.println("Number of edges = " + (nodeCount * edgesPerNode));

        System.out.print("Paused, press any key to complete");

        try {
            System.in.read();
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("Finished");
	}
	
    private static String resourceStamp()
    {
        double time = (System.currentTimeMillis() - testStartTime) / 1000.0;
        double mem = (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory())
            / (1024.0 * 1024.0);
        mem = Math.round(mem * 100) / 100.0;
        return new String(time + " sec, " + mem + "MB");
    }
}
