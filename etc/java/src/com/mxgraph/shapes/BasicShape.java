/**
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.shapes;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.GradientPaint;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.awt.Shape;
import java.awt.Stroke;
import java.awt.geom.AffineTransform;
import java.awt.geom.Area;
import java.awt.geom.GeneralPath;

public class BasicShape
{

	/**
	 * 
	 */
	protected GeneralPath path;

	/**
	 * 
	 */
	protected Shape shape;

	/**
	 * 
	 */
	protected Color shadowColor = Color.lightGray;

	/**
	 * 
	 */
	protected Color fillColor = new Color(173, 197, 255);

	/**
	 * 
	 */
	protected Color gradientColor = new Color(125, 133, 223);

	/**
	 * 
	 */
	protected GradientPaint paint;

	/**
	 * 
	 */
	protected Stroke stroke;

	/**
	 * 
	 */
	protected Color strokeColor;

	/**
	 * 
	 */
	protected Area dropShadow;

	/**
	 * 
	 */
	protected GradientPaint glassPaint;

	/**
	 * 
	 */
	protected Area glassEffect;

	/**
	 *
	 */
	public BasicShape(GeneralPath path)
	{
		Rectangle bounds = new Rectangle(0, 0, 100, 100);
		int x = 0;
		int y = 0;
		int h = bounds.height;
		double scale = 2;

		float sw = (float) (2.0 * scale);
		stroke = new BasicStroke(sw);
		strokeColor = new Color(92, 101, 223);
		paint = new GradientPaint((float) (x * scale), (float) (y * scale),
				fillColor, (float) (x * scale), (float) ((y + h) * scale),
				gradientColor);
		double glassSize = 0.4;
		glassPaint = new GradientPaint((float) (x * scale),
				(float) (y * scale), new Color(1, 1, 1, 0.7f),
				(float) (x * scale), (float) ((y + h * glassSize) * scale),
				new Color(1, 1, 1, 0.15f));

		AffineTransform scaleTransform = new AffineTransform();
		scaleTransform.scale(scale, scale);
		shape = path.createTransformedShape(scaleTransform);

		Area shapeArea = new Area(shape);
		Area strokedShapeArea = (Area) shapeArea.clone();
		strokedShapeArea.add(new Area(stroke.createStrokedShape(shape)));

		// Creates a drop shadow
		AffineTransform shadowTransform = new AffineTransform();
		shadowTransform.translate(3 * scale, 2 * scale);

		dropShadow = (Area) strokedShapeArea.clone();
		dropShadow.transform(shadowTransform);
		dropShadow.subtract(shapeArea);

		// Creates a glass effect
		Rectangle bb = strokedShapeArea.getBounds();
		GeneralPath glassPath = new GeneralPath();
		glassPath.moveTo(bb.x, bb.y);
		glassPath.lineTo(bb.x, (float) (bb.y + bb.height * glassSize));
		glassPath.quadTo((float) (bb.x + bb.width * 0.5),
				(float) (bb.y + bb.height * 0.7), bb.x + bb.width,
				(float) (bb.y + bb.height * glassSize));
		glassPath.lineTo(bb.x + bb.width, bb.y);
		glassPath.closePath();

		glassEffect = (Area) strokedShapeArea.clone();
		glassEffect.intersect(new Area(glassPath));
	}

	/**
	 * 
	 */
	public void paint(Graphics g, double x, double y, double w, double h)
	{
		// Cache all shapes for a certain aspect and use built-in scaling
		// for drawing shapes for a certain size in this specific aspect.
		// Position can be ignored and implemented using g.translate.
		//
		// This approach has the same disadvantage like the one used for
		// shapes in XML: The complete shape is scaled, there are no
		// absolute distances, everything is relative. This is a problem
		// for shapes such as process or note, where part of the shape
		// should not be scaled (if that should be allowed in general) in
		// all parts to match a specific aspect. Scaling for zoom can be
		// implemented by scaling all parts uniformely though.
		Graphics2D g2 = (Graphics2D) g;

		boolean antiAlias = true;
		boolean textAntiAlias = true;

		g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
				(antiAlias) ? RenderingHints.VALUE_ANTIALIAS_ON
						: RenderingHints.VALUE_ANTIALIAS_OFF);
		g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,
				(textAntiAlias) ? RenderingHints.VALUE_TEXT_ANTIALIAS_ON
						: RenderingHints.VALUE_TEXT_ANTIALIAS_OFF);

		g2.translate(x, y);

		// Shadow
		g2.setColor(shadowColor);
		g2.fill(dropShadow);
		
		// Background
		g2.setPaint(paint);
		g2.fill(shape);

		// Foreground
		g2.setColor(strokeColor);
		g2.setStroke(stroke);
		g2.draw(shape);
		
		// Glass effect
		g2.setPaint(glassPaint);
		g2.fill(glassEffect);
	}

}
