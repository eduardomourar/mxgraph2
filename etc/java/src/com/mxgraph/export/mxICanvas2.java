package com.mxgraph.export;

public interface mxICanvas2
{
	void scale(double value);

	void translate(double dx, double dy);

	void save();

	void restore();

	Object setDrawingHint(Object key, Object hint);

	void setDashed(boolean value);

	void setFontSize(float value);

	void setFontFamily(Object value);

	void setFontStyle(int value);

	void setStrokeWidth(double value);

	void setStrokeColor(Object value);

	void setFontColor(Object value);

	void setFillColor(Object value);

	void setGradient(Object color1, Object color2, double x, double y,
			double w, double h, Object direction);
	
	void setGlassGradient(double x, double y, double w, double h);

	void setAlpha(double value);

	void image(double x, double y, double w, double h, String src,
			boolean aspect, boolean flipH, boolean flipV);

	void text(double x, double y, double w, double h, String str, Object align,
			Object valign, boolean vertical);

	void rect(double x, double y, double w, double h);

	void roundrect(double x, double y, double w, double h, double dx, double dy);

	void ellipse(double x, double y, double w, double h);

	void begin();

	void moveTo(double x, double y);

	void lineTo(double x, double y);

	void quadTo(double x1, double y1, double x2, double y2);

	void curveTo(double x1, double y1, double x2, double y2, double x3,
			double y3);

	void end();

	void close();

	void fillAndStroke();

	void fill();

	void stroke();

	void shadow(Object value);
	
	void clip();

}
