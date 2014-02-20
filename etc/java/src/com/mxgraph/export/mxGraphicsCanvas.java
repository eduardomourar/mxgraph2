package com.mxgraph.export;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.geom.AffineTransform;
import java.awt.geom.GeneralPath;

public class mxGraphicsCanvas extends mxAbstractCanvas
{

	public static int DEFAULT_IMAGE_SCALING = Image.SCALE_SMOOTH;

	protected Graphics2D g;

	protected int imageScaling = DEFAULT_IMAGE_SCALING;

	protected GeneralPath path;

	public mxGraphicsCanvas(Graphics2D g)
	{
		this.g = g;
	}

	public Graphics2D getGraphics()
	{
		return g;
	}

	public void setGraphics(Graphics2D value)
	{
		this.g = value;
	}

	public int getImageScaling()
	{
		return imageScaling;
	}

	public void setImageScaling(int value)
	{
		imageScaling = value;
	}

	public void save()
	{
		super.save();
	}

	public void restore()
	{
		super.restore();
	}

	public void image(double x, double y, double w, double h, String src,
			boolean aspect, boolean flipH, boolean flipV)
	{
		if (src != null && w > 0 && h > 0)
		{
			Image img = getImage(src);

			if (img != null)
			{
				x = (x + tx) * ks;
				y = (y + ty) * ks;
				w *= ks;
				h *= ks;

				if (aspect)
				{
					double iw = img.getWidth(null);
					double ih = img.getHeight(null);
					double s = Math.min(w / iw, h / ih);
					double ow = w;
					double oh = h;
					w = (int) Math.round(iw * s);
					h = (int) Math.round(ih * s);
					x += (ow - w) / 2;
					y += (oh - h) / 2;
				}

				Image scaledImage = img.getScaledInstance((int) w, (int) h,
						imageScaling);

				if (scaledImage != null)
				{
					AffineTransform af = null;

					if (flipH || flipV)
					{
						af = g.getTransform();
						int sx = 1;
						int sy = 1;
						int dx = 0;
						int dy = 0;

						if (flipH)
						{
							sx = -1;
							dx = (int) Math.round(-w - 2 * x);
						}

						if (flipV)
						{
							sy = -1;
							dy = (int) Math.round(-h - 2 * y);
						}

						g.scale(sx, sy);
						g.translate(dx, dy);
					}

					g.drawImage(scaledImage, (int) Math.round(x),
							(int) Math.round(y), null);

					// Restores the previous transform
					if (af != null)
					{
						g.setTransform(af);
					}
				}
			}
		}
	}

	public void text(double x, double y, double w, double h, String str,
			int align, int valign, boolean vertical)
	{

	}

	public void begin()
	{
		path = new GeneralPath();
	}

	public void moveTo(double x, double y)
	{
		x += tx;
		y += ty;
		path.moveTo((float) (x * ks), (float) (y * ks));
	}

	public void lineTo(double x, double y)
	{
		x += tx;
		y += ty;
		path.lineTo((float) (x * ks), (float) (y * ks));
	}

	public void quadTo(double x1, double y1, double x2, double y2)
	{
		x1 += tx;
		y1 += ty;
		x2 += tx;
		y2 += ty;
		path.quadTo((float) (x1 * ks), (float) (y1 * ks), (float) (x2 * ks),
				(float) (y2 * ks));
	}

	public void curveTo(double x1, double y1, double x2, double y2, double x3,
			double y3)
	{
		x1 += tx;
		y1 += ty;
		x2 += tx;
		y2 += ty;
		x3 += tx;
		y3 += ty;
		path.curveTo((float) (x1 * ks), (float) (y1 * ks), (float) (x2 * ks),
				(float) (y2 * ks), (float) (x3 * ks), (float) (y3 * ks));
	}

	public void close()
	{
		path.closePath();
	}

	public void fill()
	{
		g.fill(path);
	}

	public void stroke()
	{
		g.draw(path);
	}

	public void glass()
	{

	}

}
