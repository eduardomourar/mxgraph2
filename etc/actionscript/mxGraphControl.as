/**
 * Copyright (c) 2009, Gaudenz Alder
 */
package com.mxgraph.flex
{

	import com.mxgraph.shape.mxShape;
	import com.mxgraph.util.mxPoint;
	import com.mxgraph.util.mxRectangle;
	
	import flash.display.Graphics;
	
	import mx.containers.Canvas;
	import mx.events.FlexEvent;

	public class mxGraphControl extends Canvas
	{

		protected var graphComponent: mxGraphComponent;

		public function mxGraphControl(graphComponent: mxGraphComponent)
		{
			this.graphComponent = graphComponent;
			
			percentWidth = 100;
			percentHeight = 100;
			
			// Calls updatePreferredSize and repaints after the control
			// was completely created
			addEventListener(FlexEvent.CREATION_COMPLETE, creationComplete);
			
			// Testing
			// Uses rawChildren because mxShape is a (has a) sprite
			var rect: mxRectangle = new mxRectangle(50, 50, 140, 60);
			//var shape: mxShape = new mxShape(rect);
			//rawChildren.addChild(shape);
		}

		protected function creationComplete(event: FlexEvent): void
		{
			updatePreferredSize();
			repaint();
		}

		public function updatePreferredSize(): void
		{
			var s: mxRectangle = null;
			
			if (graphComponent.PageVisible)
			{
				s = graphComponent.getPreferredSizeForPage();
				s.Width += 10;
				s.Height += 10;
			}
			else
			{
				s = new mxRectangle();				
			}

			if (minWidth != s.Width || minHeight != s.Height)
			{
				minWidth = s.Width;
				minHeight = s.Height;
			}
		}
		
		public function repaint(): void
		{
			graphics.clear();
			paintBackground(graphics);
		}
		
		public function paintBackground(g: Graphics): void
		{
			paintBackgroundPage(g);
		}
		
		public function paintBackgroundPage(g: Graphics): mxRectangle
		{
			var translate: mxPoint = new mxPoint(1, 1); // graph.View.Translate
			var scale: Number = 1; // graph.View.Scale
			
			var x0: Number = translate.X * scale - 1;
			var y0: Number = translate.Y * scale - 1;

			var s: mxRectangle = graphComponent.getPreferredSizeForPage();
			var w: Number = s.Width * scale + 2;
			var h: Number = s.Height * scale + 2;

            if (graphComponent.PageVisible)
            {
            	// When using the built-in background we don't need
            	// to draw this and therefore there is no need to
            	// repaint after a resize
            	//g.beginFill(graphComponent.PageBackgroundColor);
            	//g.drawRect(0, 0, width, height);
            	
                // Draws the page drop shadow
                g.beginFill(graphComponent.PageShadowColor);
                g.drawRect(x0 + w, y0 + 6, 6, h - 6);
                g.drawRect(x0 + 8, y0 + h, w - 2, 6);

                // Draws the page
                g.beginFill(uint(graphComponent.PageColor));
                g.drawRect(x0 + 1, y0 + 1, w, h);
                g.endFill();

                // Draws the page border
                g.lineStyle(1, graphComponent.PageBorderColor);
                g.drawRect(x0, y0, w, h);
            }

			/*
            if (PageBreakVisible
                    && (horizontalPageCount > 1 || verticalPageCount > 1))
            {
                // Draws the pagebreaks
                // TODO: Use clipping
                Pen pen = new Pen(Color.DarkGray);
                pen.DashPattern = new float[] { 1, 2 };

                for (int i = 1; i <= horizontalPageCount - 1; i++)
                {
                    int dx = i * w / horizontalPageCount;
                    g.DrawLine(pen, x0 + dx, y0 + 1, x0 + dx, y0 + h);
                }

                for (int i = 1; i <= verticalPageCount - 1; i++)
                {
                    int dy = i * h / verticalPageCount;
                    g.DrawLine(pen, x0 + 1, y0 + dy, x0 + w, y0 + dy);
                }
            }
			*/

            return new mxRectangle(x0, y0, w, h);
		}

	}

}
