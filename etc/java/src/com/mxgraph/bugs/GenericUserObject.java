package com.mxgraph.bugs;

import java.io.Serializable;
import java.util.Vector;

public class GenericUserObject implements Serializable
{
	Vector<Integer> val;

	public GenericUserObject()
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