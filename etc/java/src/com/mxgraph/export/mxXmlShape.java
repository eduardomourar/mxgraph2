package com.mxgraph.export;

import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.mxgraph.view.mxCellState;

public class mxXmlShape extends mxBasicShape
{
	protected Element root;

	protected double aspect = 0;

	protected double w = 100;

	protected double h = 100;

	protected NodeList nodes;

	public mxXmlShape(Element root)
	{
		this.root = root;
		Node display = root.getElementsByTagName("display").item(0);

		if (display != null)
		{
			nodes = display.getChildNodes();
			String tmp;

			tmp = root.getAttribute("aspect");

			if (tmp != null && !tmp.equalsIgnoreCase("auto"))
			{
				aspect = Double.parseDouble(tmp);
			}

			tmp = root.getAttribute("w");

			if (tmp != null)
			{
				w = Double.parseDouble(tmp);
			}

			tmp = root.getAttribute("h");

			if (tmp != null)
			{
				h = Double.parseDouble(tmp);
			}
		}
	}

	public void paint(mxICanvas2 canvas, mxCellState state)
	{
		super.paint(canvas, state);

		if (nodes != null)
		{
			double x0 = state.getX();
			double y0 = state.getY();
			double sx = state.getWidth() / w;
			double sy = state.getHeight() / h;

			if (aspect != 0)
			{
				if (sy > sx / aspect)
				{
					sy = sx / aspect;
				}
				else
				{
					sx = sy * aspect;
				}

				// Centers the shape inside the available space
				x0 += (state.getWidth() - w * sx) / 2;
				y0 += (state.getHeight() - h * sy) / 2;
			}

			for (int i = 0; i < nodes.getLength(); i++)
			{
				paintNode(canvas, (Element) nodes.item(i), x0, y0, sx, sy);
			}
		}
	}

	protected void paintNode(mxICanvas2 c, Element node, double x0, double y0,
			double sx, double sy)
	{
		String name = node.getNodeName();

		if (name.equalsIgnoreCase("sv"))
		{
			c.save();
		}
		else if (name.equalsIgnoreCase("rs"))
		{
			c.restore();
		}
		else if (name.equalsIgnoreCase("bg"))
		{
			c.begin();
		}
		else if (name.equalsIgnoreCase("cl"))
		{
			c.close();
		}
		// TODO: End should not be required
		else if (name.equalsIgnoreCase("end"))
		{
			c.end();
		}
		else if (name.equalsIgnoreCase("m"))
		{
			c.moveTo(x0 + Double.parseDouble(node.getAttribute("x")) * sx, y0
					+ Double.parseDouble(node.getAttribute("y")) * sy);
		}
		else if (name.equalsIgnoreCase("l"))
		{
			c.lineTo(x0 + Double.parseDouble(node.getAttribute("x")) * sx, y0
					+ Double.parseDouble(node.getAttribute("y")) * sy);
		}
		else if (name.equalsIgnoreCase("q"))
		{
			c.quadTo(x0 + Double.parseDouble(node.getAttribute("x1")) * sx, y0
					+ Double.parseDouble(node.getAttribute("y1")) * sy, x0
					+ Double.parseDouble(node.getAttribute("x2")) * sx, y0
					+ Double.parseDouble(node.getAttribute("y2")) * sy);
		}

		else if (name.equalsIgnoreCase("c"))
		{
			c.curveTo(x0 + Double.parseDouble(node.getAttribute("x1")) * sx, y0
					+ Double.parseDouble(node.getAttribute("y1")) * sy, x0
					+ Double.parseDouble(node.getAttribute("x2")) * sx, y0
					+ Double.parseDouble(node.getAttribute("y2")) * sy, x0
					+ Double.parseDouble(node.getAttribute("x3")) * sx, y0
					+ Double.parseDouble(node.getAttribute("y3")) * sy);
		}
		else if (name.equalsIgnoreCase("r"))
		{
			c.rect(x0 + Double.parseDouble(node.getAttribute("x")) * sx, y0
					+ Double.parseDouble(node.getAttribute("y")) * sy,
					Double.parseDouble(node.getAttribute("w")) * sx,
					Double.parseDouble(node.getAttribute("h")) * sy);
		}
		else if (name.equalsIgnoreCase("rr"))
		{
			c.roundrect(x0 + Double.parseDouble(node.getAttribute("x")) * sx,
					y0 + Double.parseDouble(node.getAttribute("y")) * sy,
					Double.parseDouble(node.getAttribute("w")) * sx,
					Double.parseDouble(node.getAttribute("h")) * sy,
					Double.parseDouble(node.getAttribute("dx")) * sx,
					Double.parseDouble(node.getAttribute("dy")) * sy);
		}
		else if (name.equalsIgnoreCase("e"))
		{
			c.ellipse(x0 + Double.parseDouble(node.getAttribute("x")) * sx, y0
					+ Double.parseDouble(node.getAttribute("y")) * sy,
					Double.parseDouble(node.getAttribute("w")) * sx,
					Double.parseDouble(node.getAttribute("h")) * sy);
		}
		else if (name.equalsIgnoreCase("i"))
		{
			c.image(x0 + Double.parseDouble(node.getAttribute("x")) * sx, y0
					+ Double.parseDouble(node.getAttribute("y")) * sy,
					Double.parseDouble(node.getAttribute("w")) * sx,
					Double.parseDouble(node.getAttribute("h")) * sy,
					node.getAttribute("src"), true, false, false);
		}
		else if (name.equalsIgnoreCase("t"))
		{
			c.text(x0 + Double.parseDouble(node.getAttribute("x")) * sx, y0
					+ Double.parseDouble(node.getAttribute("y")) * sy,
					Double.parseDouble(node.getAttribute("w")) * sx,
					Double.parseDouble(node.getAttribute("h")) * sy,
					node.getAttribute("str"), null, null, false);
		}
		else if (name.equalsIgnoreCase("fs"))
		{
			c.fillAndStroke();
		}
		else if (name.equalsIgnoreCase("f"))
		{
			c.fill();
		}
		else if (name.equalsIgnoreCase("s"))
		{
			c.stroke();
		}
		else if (name.equalsIgnoreCase("sh"))
		{
			c.shadow(node.getAttribute("sh"));
		}
		else if (name.equalsIgnoreCase("sw"))
		{
			c.setStrokeWidth(Double.parseDouble(node.getAttribute("sw")));
		}
		else if (name.equalsIgnoreCase("sc"))
		{
			c.setStrokeColor(node.getAttribute("sc"));
		}
		else if (name.equalsIgnoreCase("fc"))
		{
			// TODO: Add gradients etc
			c.setFillColor(node.getAttribute("c1")); //, node.getAttribute("c2"));
		}
		else if (name.equalsIgnoreCase("al"))
		{
			c.setAlpha(Double.parseDouble(node.getAttribute("al")));
		}
		else if (name.equalsIgnoreCase("fo"))
		{
			c.setFontColor(node.getAttribute("fo"));
		}
		else if (name.equalsIgnoreCase("fs"))
		{
			c.setFontSize(Float.parseFloat(node.getAttribute("fs")));
		}
	}
}
