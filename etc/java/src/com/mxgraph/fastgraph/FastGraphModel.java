package com.mxgraph.fastgraph;

import com.mxgraph.model.mxGeometry;
import com.mxgraph.model.mxIGraphModel;
import com.mxgraph.util.mxEventSource.mxIEventListener;

public class FastGraphModel implements mxIGraphModel {

	public long[][] connectedEdges;
	
	// Source/target IDs as 32-bits packed in 64-bits
	public long[] terminals;
	
	// Edge Weights
	
	public Object add(Object parent, Object child, int index) {
		// TODO Auto-generated method stub
		return null;
	}

	public void addListener(String eventName, mxIEventListener listener) {
		// Not implemented
		
	}

	public void beginUpdate() {
		// Not implemented
		
	}

	public Object[] cloneCells(Object[] cells, boolean includeChildren) {
		// Not implemented
		return null;
	}

	public boolean contains(Object cell) {
		// TODO Auto-generated method stub
		return false;
	}

	public void endUpdate() {
		// Not implemented
	}

	public Object getChildAt(Object parent, int index) {
		// Not implemented
		return null;
	}

	public int getChildCount(Object cell) {
		// Not implemented
		return 0;
	}

	public Object getEdgeAt(Object cell, int index) {
		// TODO Auto-generated method stub
		return null;
	}

	public int getEdgeCount(Object cell) {
		// TODO Auto-generated method stub
		return 0;
	}

	public mxGeometry getGeometry(Object cell) {
		// Not implemented
		return null;
	}

	public Object getParent(Object child) {
		// Not implemented
		return null;
	}

	public Object getRoot() {
		// Not implemented
		return null;
	}

	public String getStyle(Object cell) {
		// Not implemented
		return null;
	}

	public Object getTerminal(Object edge, boolean isSource) {
		// Not implemented
		return null;
	}

	public Object getValue(Object cell) {
		// TODO Auto-generated method stub
		return null;
	}

	public boolean isAncestor(Object parent, Object child) {
		// Not implemented
		return false;
	}

	public boolean isCollapsed(Object cell) {
		// Not implemented
		return false;
	}

	public boolean isConnectable(Object cell) {
		// Not implemented
		return false;
	}

	public boolean isEdge(Object cell) {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean isVertex(Object cell) {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean isVisible(Object cell) {
		// Not implemented
		return false;
	}

	public Object remove(Object cell) {
		// TODO Auto-generated method stub
		return null;
	}

	public void removeListener(mxIEventListener listener) {
		// TODO Auto-generated method stub
		
	}

	public void removeListener(mxIEventListener listener, String eventName) {
		// TODO Auto-generated method stub
		
	}

	public boolean setCollapsed(Object cell, boolean collapsed) {
		// Not implemented
		return false;
	}

	public mxGeometry setGeometry(Object cell, mxGeometry geometry) {
		// Not implemented
		return null;
	}

	public Object setRoot(Object root) {
		// Not implemented
		return null;
	}

	public String setStyle(Object cell, String style) {
		// Not implemented
		return null;
	}

	public Object setTerminal(Object edge, Object terminal, boolean isSource) {
		// Not implemented
		return null;
	}

	public Object setValue(Object cell, Object value) {
		// TODO Auto-generated method stub
		return null;
	}

	public boolean setVisible(Object cell, boolean visible) {
		// Not implemented
		return false;
	}
	
	public static void addCells(FastGraphModel model, long[][] vertices, long[] edgeTerminals)
	{
		model.connectedEdges = vertices;
		model.terminals = edgeTerminals;
	}
}
