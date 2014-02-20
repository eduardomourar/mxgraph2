package com.mxgraph.shapes;

import java.awt.geom.GeneralPath;

public class ActorShape extends BasicShape
{

	/**
	 * 
	 */
	protected static final GeneralPath actorPath;

	/**
	 * 
	 */
	static
	{
		int x = 0;
		int y = 0;
		int w = 100;
		int h = 100;
		float width = w * 2 / 6;

		actorPath = new GeneralPath();
		actorPath.moveTo(x, y + h);
		actorPath.curveTo(x, y + 3 * h / 5, x, y + 2 * h / 5, x + w / 2, y + 2
				* h / 5);
		actorPath.curveTo(x + w / 2 - width, y + 2 * h / 5, x + w / 2 - width,
				y, x + w / 2, y);
		actorPath.curveTo(x + w / 2 + width, y, x + w / 2 + width, y + 2 * h
				/ 5, x + w / 2, y + 2 * h / 5);
		actorPath.curveTo(x + w, y + 2 * h / 5, x + w, y + 3 * h / 5, x + w, y
				+ h);
		actorPath.closePath();
	}

	/**
	 *
	 */
	public ActorShape()
	{
		super(actorPath);
	}

}
