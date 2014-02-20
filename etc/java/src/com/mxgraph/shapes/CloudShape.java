package com.mxgraph.shapes;

import java.awt.geom.GeneralPath;

public class CloudShape extends BasicShape
{

	/**
	 * 
	 */
	static final GeneralPath cloudPath;

	/**
	 * 
	 */
	static
	{
		int x = 0;
		int y = 0;
		int w = 100;
		int h = 100;

		cloudPath = new GeneralPath();
		cloudPath.moveTo((float) (x + 0.25 * w), (float) (y + 0.25 * h));
		cloudPath.curveTo((float) (x + 0.05 * w), (float) (y + 0.25 * h), x,
				(float) (y + 0.5 * h), (float) (x + 0.16 * w),
				(float) (y + 0.55 * h));
		cloudPath.curveTo(x, (float) (y + 0.66 * h), (float) (x + 0.18 * w),
				(float) (y + 0.9 * h), (float) (x + 0.31 * w),
				(float) (y + 0.8 * h));
		cloudPath.curveTo((float) (x + 0.4 * w), (y + h),
				(float) (x + 0.7 * w), (y + h), (float) (x + 0.8 * w),
				(float) (y + 0.8 * h));
		cloudPath.curveTo((x + w), (float) (y + 0.8 * h), (x + w),
				(float) (y + 0.6 * h), (float) (x + 0.875 * w),
				(float) (y + 0.5 * h));
		cloudPath.curveTo((x + w), (float) (y + 0.3 * h),
				(float) (x + 0.8 * w), (float) (y + 0.1 * h),
				(float) (x + 0.625 * w), (float) (y + 0.2 * h));
		cloudPath.curveTo((float) (x + 0.5 * w), (float) (y + 0.05 * h),
				(float) (x + 0.3 * w), (float) (y + 0.05 * h),
				(float) (x + 0.25 * w), (float) (y + 0.25 * h));
		cloudPath.closePath();
	}

	/**
	 *
	 */
	public CloudShape()
	{
		super(cloudPath);
	}

}
