/**
 * Copyright (c) 2009, Gaudenz Alder
 */
package com.mxgraph.flex
{

	import com.mxgraph.util.mxConstants;
	import com.mxgraph.util.mxRectangle;
	import com.mxgraph.view.mxGraph;
	
	import mx.containers.Canvas;

	public class mxGraphComponent extends Canvas
	{
		
		protected var graph: mxGraph;
		
		protected var escapeEnabled: Boolean = false;
		
		protected var pageVisible: Boolean = false;
		
		protected var pageBreakVisible: Boolean = true;
		
		protected var pageScale: Number = 1;
		
		protected var pageFormat: mxRectangle = mxConstants.PAGEFORMAT_A4;
		
		protected var pageBackgroundColor: uint = 0x9099AE; // not used, see mxGraphControl
		
		protected var pageShadowColor: uint = 0x6E788C;
		
		protected var pageBorderColor: uint = 0x000000;
		
		protected var pageColor: uint = 0xFFFFFF;

		protected var horizontalPageCount: int = 1;
		
		protected var verticalPageCount: int = 1;
		
		protected var gridVisible: Boolean = false;
		
		protected var gridColor: uint = 0xC0C0C0;
		
		protected var graphControl: mxGraphControl;

		public function mxGraphComponent(graph: mxGraph = null)
		{
			this.graph = (graph != null) ? graph : new mxGraph();
			
			graphControl = createGraphControl();
			addChild(graphControl);
		}
		
		public function createGraphControl(): mxGraphControl
		{
			return new mxGraphControl(this);
		}
		
		public function get Graph(): mxGraph
		{
			return graph;
		}
		
		public function get GraphControl(): mxGraphControl
		{
			return graphControl;
		}
				
		public function get EscapeEnabled(): Boolean
		{
			return escapeEnabled;
		}
		
		public function set EscapeEnabled(value: Boolean): void
		{
			escapeEnabled = value;
		}
		
		public function get PageVisible(): Boolean
		{
			return pageVisible;
		}
		
		public function set PageVisible(value: Boolean): void
		{
			pageVisible = value;
		}
						
		public function get PageBackgroundColor(): uint
		{
			return pageBackgroundColor;
		}
		
		public function set PageBackgroundColor(value: uint): void
		{
			pageBackgroundColor = value;
		}

		public function get PageShadowColor(): uint
		{
			return pageShadowColor;
		}
		
		public function set PageShadowColor(value: uint): void
		{
			pageShadowColor = value;
		}
		
		public function get PageBorderColor(): uint
		{
			return pageBorderColor;
		}
		
		public function set PageBorderColor(value: uint): void
		{
			pageBorderColor = value;
		}
								
		public function get PageColor(): uint
		{
			return pageColor;
		}
		
		public function set PageColor(value: uint): void
		{
			pageColor = value;
		}

		public function getPreferredSizeForPage(): mxRectangle
		{
			return new mxRectangle(0, 0,
				pageFormat.Width * pageScale * horizontalPageCount,
				pageFormat.Height * pageScale * verticalPageCount);
		}

	}

}
