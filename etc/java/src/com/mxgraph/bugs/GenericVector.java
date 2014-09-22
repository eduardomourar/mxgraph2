/**
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.bugs;

import org.w3c.dom.Document;

import com.mxgraph.io.mxCodec;
import com.mxgraph.util.mxXmlUtils;
import com.mxgraph.view.mxGraph;

public class GenericVector
{

	// See http://forum.jgraph.com/questions/59/possible-bug-in-loadsave

	void runMe()
	{
		mxGraph g = new mxGraph();
		GenericUserObject f = new GenericUserObject();
		f.set();

		g.insertVertex(g.getDefaultParent(), "jango fett", f, 3, 3, 30, 30);

		String te;
		// save 
		mxCodec codec = new mxCodec();
		te = mxXmlUtils.getXml(codec.encode(g.getModel()));

		// load
		Document document;
		document = mxXmlUtils.parseXml(te);

		mxCodec codec2 = new mxCodec(document);
		mxGraph newG = new mxGraph();
		codec2.decode(document.getDocumentElement(), newG.getModel());

		// here the StupidVInt values have turned into strings .....
		System.out.println("newG");
	}

	public static void main(String[] args)
	{
		new GenericVector().runMe();
	}
}
