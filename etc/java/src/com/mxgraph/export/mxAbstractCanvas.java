/**
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.export;

import java.awt.Image;
import java.io.IOException;
import java.io.InputStream;
import java.util.Hashtable;
import java.util.Map;

import javax.imageio.ImageIO;

import com.mxgraph.util.mxConstants;

public class mxAbstractCanvas implements mxICanvas2
{
	private static double M_SQRT2 = Math.sqrt(2);

	protected double tx, ty;

	protected double scale = 1.0;

	protected double k = 1;

	protected double ks = k * scale;

	protected Map<Object, Object> hints;

	protected float fontSize = mxConstants.DEFAULT_FONTSIZE;

	protected Object fontFamily = mxConstants.DEFAULT_FONTFAMILY;

	protected int fontStyle = 0;

	protected Object fontColor;

	protected double strokeWidth;

	protected Object strokeColor;

	protected Object fillColor;

	protected double alpha;

	protected Hashtable<String, Image> images;

	protected InputStream createStreamForResource(String name)
	{
		return getClass().getResourceAsStream(name);
	}
	
	protected Image loadImage(String src)
	{
		Image result = null;
		
		try
		{
			result = ImageIO.read(createStreamForResource(src));
		}
		catch (IOException e)
		{
			// ignore
		}
		
		return result;
	}
	
	protected Image getImage(String src)
	{
		Image img = null;
		
		if (src != null)
		{
			img = (images != null) ? images.get(src) : null;
	
			if (img == null)
			{
				img = loadImage(src);
	
				if (img != null)
				{
					if (images == null)
					{
						images = new Hashtable<String, Image>();
					}
					
					images.put(src, img);
				}
			}
		}

		return img;
	}

	public void scale(double value)
	{
		scale *= value;
		ks = k * scale;
	}

	public void translate(double dx, double dy)
	{
		tx += dx;
		ty += dy;
	}

	public void save()
	{

	}

	public void restore()
	{

	}

	public Object setDrawingHint(Object key, Object value)
	{
		Object result = null;

		if (key != null)
		{
			if (hints == null)
			{
				hints = new Hashtable<Object, Object>();
			}

			if (value != null)
			{
				result = hints.put(key, value);
			}
			else
			{
				result = hints.remove(key);
			}
		}

		return result;
	}

	public void setDashed(boolean value)
	{

	}

	public void setFontSize(float value)
	{
		fontSize = value;
	}

	public void setFontFamily(Object value)
	{
		fontFamily = value;
	}

	public void setFontStyle(int value)
	{
		fontStyle = value;
	}

	public void setFontColor(Object value)
	{
		fontColor = value;
	}

	public void setStrokeWidth(double value)
	{
		strokeWidth = value;
	}

	public void setStrokeColor(Object value)
	{
		strokeColor = value;
	}

	public void setFillColor(Object value)
	{
		fillColor = value;
	}

	public void setGradient(Object color1, Object color2, double x, double y,
			double w, double h, Object direction)
	{
		
	}

	public void setGlassGradient(double x, double y, double w, double h)
	{

	}

	public void setAlpha(double value)
	{
		alpha = value;
	}

	public void rect(double x, double y, double w, double h)
	{
		begin();
		moveTo(x, y);
		lineTo(x + w, y);
		lineTo(x + w, y + h);
		lineTo(x, y + h);
		close();
	}

	public void roundrect(double x, double y, double w, double h, double dx,
			double dy)
	{
		begin();
		moveTo(x + dx, y);
		lineTo(x + w - dx, y);
		quadTo(x + w, y, x + w, y + dy);
		lineTo(x + w, y + h - dy);
		quadTo(x + w, y + h, x + w - dx, y + h);
		lineTo(x + dx, y + h);
		quadTo(x, y + h, x, y + h - dy);
		lineTo(x, y + dy);
		quadTo(x, y, x + dx, y);
	}

	public void ellipse(double x, double y, double w, double h)
	{
		x += w / 2 + tx;
		y += h / 2 + ty;

		double rx = w / 2;
		double ry = h / 2;
		double lx = 4 / 3 * (M_SQRT2 - 1) * rx;
		double ly = 4 / 3 * (M_SQRT2 - 1) * ry;

		begin();
		moveTo(x + rx, y);
		curveTo(x + rx, y + ly, x + lx, y + ry, x, y + ry);
		curveTo(x - lx, y + ry, x - rx, y + ly, x - rx, y);
		curveTo(x - rx, y - ly, x - lx, y - ry, x, y - ry);
		curveTo(x + lx, y - ry, x + rx, y - ly, x + rx, y);
	}

	public void image(double x, double y, double w, double h, String src,
			boolean aspect, boolean flipH, boolean flipV)
	{

	}

	public void text(double x, double y, double w, double h, String str,
			Object align, Object valign, boolean vertical)
	{

	}

	public void begin()
	{

	}

	public void moveTo(double x, double y)
	{

	}

	public void lineTo(double x, double y)
	{

	}

	public void quadTo(double x1, double y1, double x2, double y2)
	{

	}

	public void curveTo(double x1, double y1, double x2, double y2, double x3,
			double y3)
	{

	}

	public void end()
	{

	}

	public void close()
	{

	}

	public void fill()
	{

	}

	public void stroke()
	{

	}
	
	public void clip()
	{
		
	}

	public void fillAndStroke()
	{
		fill();
		stroke();
	}
	
	public void shadow(Object value)
	{
		
	}

}
