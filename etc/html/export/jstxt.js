/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */
/**
 *
 * Class: mxXmlCanvas2D
 * 
 * Implements a canvas to be used with <mxImageExport>. This canvas writes all
 * calls as child nodes to the given root XML node.
 * 
 * (code)
scale           scale       sl
translate       translate   tr
rotate			rotate		rt
save            save        sv
restore         restore     rs
setDashed       dashed      ds
setDashPattern  dashpattern dp
setFontSize     fontsize    sz
setFontFamily   fontfamily  fm
setFontStyle    fontstyle   st
setFontColor    fontcolor   cl
setFillColor    fillcolor   fc
setStrokeColor  strokecolor sc
setStrokeWidth  strokewidth sw
setGradient     gradient    gr
setGlassGradient glass		gl
setAlpha        alpha       al
image           image       i
moveTo          move        m
lineTo          line        l
quadTo          quad        q
curveTo         curve       c
arcTo			arc			ar
rect            rect        r
roundrect       roundrect   rr
ellipse         ellipse     e
begin           begin       bg
end             end         en
close           close       cs
fill            fill        f
stroke          stroke      s
clip            clip        cp
fillAndStroke   fillstroke  fs
shadow          shadow      sh
text            text        t
 * (end)
 * 
 * Constructor: mxXmlCanvas2D
 * 
 * Constructs a XML canvas.
 * 
 * Parameters:
 * 
 * root - XML node for adding child nodes.
 */
var jsTxt = function(string)
{
	/**
	 * Variable: compressed
	 * 
	 * Specifies if the output should be compressed by removing redundant calls.
	 * Default is true.
	 */
	var compressed = true;
	
	/**
	 * Variable: textEnabled
	 * 
	 * Specifies if text output should be enabled. Default is true.
	 */
	var textEnabled = true;

	// Implements stack for save/restore
	var stack = [];
	
	// Implements state for redundancy checks
	var state =
	{
		alpha: 1,
		dashed: false,
		strokewidth: 1,
		fontsize: mxConstants.DEFAULT_FONTSIZE,
		fontfamily: mxConstants.DEFAULT_FONTFAMILY,
		fontcolor: '#000000'
	};
	
	// Private helper function set set precision to 2
	// TODO: Add option for short nodenames
	// TODO: Remove trailing zero in output
	var f2 = function(x)
	{
		return Math.round(parseFloat(x) * 100) / 100;
	};
	
	var bool = function(x)
	{
		return (x) ? '1' : '0';
	};
	
	var str = function(x)
	{
		return encodeURIComponent(x);
	};
	
	var out = function(value)
	{
		string += value + ' ';
	};
	
	// Returns public interface
	return {

		/**
		 * Function: isCompressed
		 * 
		 * Returns <compressed>.
		 */
		isCompressed: function()
		{
			return compressed;
		},

		/**
		 * Function: setCompressed
		 * 
		 * Sets <compressed>.
		 */
		setCompressed: function(value)
		{
			compressed = value;
		},

		/**
		 * Function: isTextEnabled
		 * 
		 * Returns <textEnabled>.
		 */
		isTextEnabled: function()
		{
			return textEnabled;
		},

		/**
		 * Function: setTextEnabled
		 * 
		 * Sets <textEnabled>.
		 */
		setTextEnabled: function(value)
		{
			textEnabled = value;
		},
		
		/**
		 * Function: getString
		 * 
		 * Returns the current string.
		 */
		getString: function()
		{
			return string;
		},
		
		/**
		 * Function: save
		 * 
		 * Saves the state of the graphics object.
		 */
		save: function()
		{
			if (compressed)
			{
				stack.push(state);
				state = mxUtils.clone(state);
			}
			
			out('sv');
		},
		
		/**
		 * Function: restore
		 * 
		 * Restores the state of the graphics object.
		 */
		restore: function()
		{
			if (compressed)
			{
				state = stack.pop();
			}
			
			out('rs');
		},
		
		/**
		 * Function: scale
		 * 
		 * Scales the current graphics object.
		 */
		scale: function(value)
		{
			out('sl ' + value);
		},
		
		/**
		 * Function: translate
		 * 
		 * Translates the current graphics object.
		 */
		translate: function(dx, dy)
		{
			out('tr '+f2(dx)+' '+f2(dy));
		},
		
		/**
		 * Function: rotate
		 * 
		 * Rotates and/or flips the current graphics object.
		 */
		rotate: function(theta, flipH, flipV, cx, cy)
		{
			out('rt '+f2(theta)+' '+bool(flipH)+' '+bool(flipV)+' '+f2(cx)+' '+f2(cy));
		},
		
		/**
		 * Function: setStrokeWidth
		 * 
		 * Sets the stroke width.
		 */
		setStrokeWidth: function(value)
		{
			if (compressed)
			{
				if (state.strokewidth == value)
				{
					return;
				}
				
				state.strokewidth = value;
			}
			
			out('sw '+value);
		},
		
		/**
		 * Function: setStrokeColor
		 * 
		 * Sets the stroke color.
		 */
		setStrokeColor: function(value)
		{
			out('sc '+value);
		},
		
		/**
		 * Function: setDashed
		 * 
		 * Sets the dashed state to true or false.
		 */
		setDashed: function(value)
		{
			if (compressed)
			{
				if (state.dashed == value)
				{
					return;
				}
				
				state.dashed = value;
			}
			
			out('ds '+bool(value));
		},
		
		/**
		 * Function: setDashPattern
		 * 
		 * Sets the dashed pattern to the given space separate list of numbers.
		 */
		setDashPattern: function(value)
		{
			out('dp '+value);
		},
		
		/**
		 * Function: setLineCap
		 * 
		 * Sets the linecap.
		 */
		setLineCap: function(value)
		{
			out('lc '+value);
		},
		
		/**
		 * Function: setLineJoin
		 * 
		 * Sets the linejoin.
		 */
		setLineJoin: function(value)
		{
			out('lj '+value);
		},
		
		/**
		 * Function: setMiterLimit
		 * 
		 * Sets the miterlimit.
		 */
		setMiterLimit: function(value)
		{
			out('ml '+value);
		},
		
		/**
		 * Function: setFontSize
		 * 
		 * Sets the fontsize.
		 */
		setFontSize: function(value)
		{
			if (textEnabled)
			{
				if (compressed)
				{
					if (state.fontsize == value)
					{
						return;
					}
					
					state.fontsize = value;
				}
				
				out('sz '+value);
			}
		},
		
		/**
		 * Function: setFontColor
		 * 
		 * Sets the fontcolor.
		 */
		setFontColor: function(value)
		{
			if (textEnabled)
			{
				if (compressed)
				{
					if (state.fontcolor == value)
					{
						return;
					}
					
					state.fontcolor = value;
				}
				
				out('cl '+value);
			}
		},
		
		/**
		 * Function: setFontFamily
		 * 
		 * Sets the fontfamily.
		 */
		setFontFamily: function(value)
		{
			if (textEnabled)
			{
				if (compressed)
				{
					if (state.fontfamily == value)
					{
						return;
					}
					
					state.fontfamily = value;
				}
				
				out('fm '+value);
			}
		},
		
		/**
		 * Function: setFontStyle
		 * 
		 * Sets the fontstyle.
		 */
		setFontStyle: function(value)
		{
			if (textEnabled)
			{
				out('st '+value);
			}
		},
		
		/**
		 * Function: setAlpha
		 * 
		 * Sets the current alpha.
		 */
		setAlpha: function(alpha)
		{
			if (compressed)
			{
				if (state.alpha == alpha)
				{
					return;
				}
				
				state.alpha = alpha;
			}
			
			out('al '+alpha);
		},
		
		/**
		 * Function: setFillColor
		 * 
		 * Sets the fillcolor.
		 */
		setFillColor: function(value)
		{
			out('fc '+value);
		},
		
		/**
		 * Function: setGradient
		 * 
		 * Sets the gradient color.
		 */
		setGradient: function(color1, color2, x, y, w, h, direction)
		{
			out('gr '+color1+' '+color2+' '+f2(x)+' '+f2(y)+
					' '+f2(w)+' '+f2(h)+' '+direction);
		},
		
		/**
		 * Function: setGlassGradient
		 * 
		 * Sets the glass gradient.
		 */
		setGlassGradient: function(x, y, w, h)
		{
			out('gl '+f2(x)+' '+f2(y)+' '+f2(w)+' '+f2(h));
		},
		
		/**
		 * Function: rect
		 * 
		 * Sets the current path to a rectangle.
		 */
		rect: function(x, y, w, h)
		{
			out('r '+f2(x)+' '+f2(y)+' '+f2(w)+' '+f2(h));
		},
		
		/**
		 * Function: roundrect
		 * 
		 * Sets the current path to a rounded rectangle.
		 */
		roundrect: function(x, y, w, h, dx, dy)
		{
			out('rr '+f2(x)+' '+f2(y)+' '+f2(w)+' '+f2(h)+' '+f2(dx)+' '+f2(dy));
		},
		
		/**
		 * Function: ellipse
		 * 
		 * Sets the current path to an ellipse.
		 */
		ellipse: function(x, y, w, h)
		{
			out('e '+f2(x)+' '+f2(y)+' '+f2(w)+' '+f2(h));
		},
		
		/**
		 * Function: image
		 * 
		 * Paints an image.
		 */
		image: function(x, y, w, h, src, aspect, flipH, flipV)
		{
			// TODO: Add option for embedding images as base64
			out('i '+f2(x)+' '+f2(y)+' '+f2(w)+' '+f2(h)+' '+str(src)+' '+
				bool(aspect)+' '+bool(flipH)+' '+bool(flipV));
		},
		
		/**
		 * Function: text
		 * 
		 * Paints the given text.
		 */
		text: function(x, y, w, h, txt, align, valign, vertical)
		{
			out('t '+f2(x)+' '+f2(y)+' '+f2(w)+' '+f2(h)+' '+str(txt)+
					' '+align+' '+valign+' '+bool(vertical));
		},
		
		/**
		 * Function: begin
		 * 
		 * Starts a new path.
		 */
		begin: function()
		{
			out('bg');
		},
		
		/**
		 * Function: moveTo
		 * 
		 * Moves the current path the given coordinates.
		 */
		moveTo: function(x, y)
		{
			out('m '+f2(x)+' '+f2(y));
		},
		
		/**
		 * Function: lineTo
		 * 
		 * Adds a line to the current path.
		 */
		lineTo: function(x, y)
		{
			out('l '+f2(x)+' '+f2(y));
		},
		
		/**
		 * Function: quadTo
		 * 
		 * Adds a quadratic curve to the current path.
		 */
		quadTo: function(x1, y1, x2, y2)
		{
			out('q '+f2(x1)+' '+f2(y1)+' '+f2(x2)+' '+f2(y2));
		},
		
		/**
		 * Function: curveTo
		 * 
		 * Adds a bezier curve to the current path.
		 */
		curveTo: function(x1, y1, x2, y2, x3, y3)
		{
			out('c '+f2(x1)+' '+f2(y1)+' '+f2(x2)+' '+f2(y2)+' '+f2(x3)+' '+f2(y3));
		},

		/**
		 * Function: end
		 * 
		 * Ends the current path.
		 */
		end: function()
		{
			out('en');
		},
		
		/**
		 * Function: close
		 * 
		 * Closes the current path.
		 */
		close: function()
		{
			out('cs');
		},
		
		/**
		 * Function: stroke
		 * 
		 * Paints the outline of the current path.
		 */
		stroke: function()
		{
			out('s');
		},
		
		/**
		 * Function: fill
		 * 
		 * Fills the current path.
		 */
		fill: function()
		{
			out('f');
		},
		
		/**
		 * Function: fillstroke
		 * 
		 * Fills and paints the outline of the current path.
		 */
		fillAndStroke: function()
		{
			out('fs');
		},
		
		/**
		 * Function: shadow
		 * 
		 * Paints the current path as a shadow of the given color.
		 */
		shadow: function(value)
		{
			out('sh '+value);
		},
		
		/**
		 * Function: clip
		 * 
		 * Uses the current path for clipping.
		 */
		clip: function()
		{
			out('cp');
		}
	};

};
