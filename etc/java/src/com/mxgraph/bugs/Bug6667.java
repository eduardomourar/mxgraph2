package com.mxgraph.bugs;

import java.io.Serializable;
import java.util.Vector;

import org.w3c.dom.Document;

import com.mxgraph.io.mxCodec;
import com.mxgraph.util.mxXmlUtils;
import com.mxgraph.view.mxGraph;

public class Bug6667
{

	void runMe()
	{
		mxGraph g = new mxGraph();
		InnerGenericUserObject f = new InnerGenericUserObject();
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
		new Bug6667().runMe();
	}

	public static class InnerGenericUserObject implements Serializable
	{
		Vector<Integer> val;

		public InnerGenericUserObject()
		{
			val = new Vector<Integer>();
		}

		void set()
		{
			val.add(new Integer(12));
		}

		public Vector<Integer> getVal()
		{
			return val;
		}

		public void setVal(Vector<Integer> val)
		{
			this.val = val;
		}

	}
}