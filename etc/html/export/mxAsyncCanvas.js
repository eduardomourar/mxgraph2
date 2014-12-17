/**
 * mxAsyncCanvas
 */

/**
 * Extends mxAbstractCanvas2D
 */
function mxAsyncCanvas(htmlCanvas)
{
	mxAbstractCanvas2D.call(this);
	this.htmlCanvas = htmlCanvas;
	htmlCanvas.images = [];
	htmlCanvas.subCanvas = [];
};

/**
 * Extends mxAbstractCanvas2D
 */
mxUtils.extend(mxAsyncCanvas, mxAbstractCanvas2D);

/**
 * Variable: htmlCanvas
 * 
 * The canvas instance this object is obtaining async resources for
 */
mxAsyncCanvas.prototype.htmlCanvas = null;

/**
 * Variable: canvasIndex
 * 
 * The current index into the canvas sub-canvas array being processed
 */
mxAsyncCanvas.prototype.canvasIndex = 0;

/**
 * Variable: ctx
 * 
 * Holds the current canvas context
 */
mxAsyncCanvas.prototype.waitCounter = 0;

/**
 * Variable: ctx
 * 
 * Holds the current canvas context
 */
mxAsyncCanvas.prototype.onComplete = null;

mxAsyncCanvas.prototype.incWaitCounter = function()
{
	this.waitCounter++;
};
	
mxAsyncCanvas.prototype.decWaitCounter = function()
{
	this.waitCounter--;
	
	if (this.waitCounter == 0 && this.onComplete != null)
	{
		this.onComplete();
		this.onComplete = null;
	}
};

mxAsyncCanvas.prototype.updateFont = function()
{
	var style = '';
	
	if ((this.state.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
	{
		style += 'bold ';
	}
	
	if ((this.state.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
	{
		style += 'italic ';
	}
	
	this.ctx.font = style + this.state.fontSize + 'px ' + this.state.fontFamily;
};

mxAsyncCanvas.prototype.rotate = function(theta, flipH, flipV, cx, cy)
{
};

mxAsyncCanvas.prototype.setAlpha = function(alpha)
{
	this.state.alpha = alpha;
};

mxAsyncCanvas.prototype.setFontColor = function(value)
{
	this.state.fontColor = value;
};

mxAsyncCanvas.prototype.setFontBackgroundColor = function(value)
{
	if (value == mxConstants.NONE)
	{
		value = null;
	}
	
	this.state.fontBackgroundColor = value;
};

mxAsyncCanvas.prototype.setFontBorderColor = function(value)
{
	if (value == mxConstants.NONE)
	{
		value = null;
	}
	
	this.state.fontBorderColor = value;
};

mxAsyncCanvas.prototype.setFontSize = function(value)
{
	this.state.fontSize = value;
};

mxAsyncCanvas.prototype.setFontFamily = function(value)
{
	this.state.fontFamily = value;
};

mxAsyncCanvas.prototype.setFontStyle = function(value)
{
	this.state.fontStyle = value;
};

mxAsyncCanvas.prototype.rect = function(x, y, w, h) {};

mxAsyncCanvas.prototype.roundrect = function(x, y, w, h, dx, dy) {};

mxAsyncCanvas.prototype.ellipse = function(x, y, w, h) {};

//Redirect can be implemented via a hook
mxAsyncCanvas.prototype.rewriteImageSource = function(src)
{
	if (src.substring(0, 7) == 'http://' || src.substring(0, 8) == 'https://')
	{
		src = '/redirect?url=' + encodeURIComponent(src);
	}
	
	return src;
};

mxAsyncCanvas.prototype.image = function(x, y, w, h, src, aspect, flipH, flipV)
{
	src = this.rewriteImageSource(src);
	var image = this.htmlCanvas.images[src];
	
	if (image == null)
	{
		var image = new Image();
		
		image.onload = mxUtils.bind(this, function()
		{
			this.decWaitCounter();
		});
		
		image.onerror = mxUtils.bind(this, function()
		{
			this.decWaitCounter();
			// TODO null the image out? this.htmlCanvas.images[src] = null;
		});

		this.incWaitCounter();
		this.htmlCanvas.images[src] = image;
		image.src = src;
	}
};

mxAsyncCanvas.prototype.fill = function() {};

mxAsyncCanvas.prototype.stroke = function() {};

mxAsyncCanvas.prototype.fillAndStroke = function() {};
	
mxAsyncCanvas.prototype.text = function(x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation)
{
	if (str == null || str.length == 0)
	{
		return;
	}

	var sc = this.state.scale;
	
	if (format == 'html')
	{
		var style = 'vertical-align:top;';
		
		if (clip)
		{
			style += 'overflow:hidden;max-height:' + Math.round(h) + 'px;max-width:' + Math.round(w) + 'px;';
		}
		else if (overflow == 'fill')
		{
			style += 'width:' + Math.round(w) + 'px;height:' + Math.round(h) + 'px;';
		}
		else if (overflow == 'width')
		{
			style += 'width:' + Math.round(w) + 'px;';
			
			if (h > 0)
			{
				style += 'max-height:' + Math.round(h) + 'px;';
			}
		}

		if (wrap && w > 0)
		{
			style += 'width:' + Math.round(w) + 'px;white-space:normal;';
		}
		else
		{
			//style += 'width:' + Math.round(w) + 'px;height:' + Math.round(h) + 'px;white-space:nowrap;';
			style += 'white-space:nowrap;';
		}
		
		var div = this.createDiv(str, align, valign, style, overflow);
		
		
//		
//		// Ignores invalid XHTML labels
//		if (div == null)
//		{
//			return;
//		}
//
//		div.style.cssText = div.getAttribute('style');
//		div.style.display = 'inline-block';
//		div.style.position = 'absolute';
//		div.style.top  = '-9999px';
//		div.style.left = '-9999px';
//		div.innerHTML = (mxUtils.isNode(str)) ? str.outerHTML : str;
		
		//var div = document.createElement('div');
		div.innerHTML = str;
		
		document.body.appendChild(div);
		
		this.incWaitCounter();
		var canvasIndex = this.canvasIndex++;
		//sc = sc < 1 ? 1 : sc;
		
	    html2canvas(div,
	    {
	        onrendered: mxUtils.bind(this, function(canvas)
	        {
	        	this.htmlCanvas.subCanvas[canvasIndex] = canvas;
	        	//document.body.removeChild(div);
	        	this.decWaitCounter();
	        }),
	        scale: sc
	    });
	}
};

/**
 * Function: createDiv
 * 
 * Private helper function to create SVG elements
 */
mxAsyncCanvas.prototype.createDiv = function(str, align, valign, style, overflow)
{
	var s = this.state;

	// Inline block for rendering HTML background over SVG in Safari
	var lh = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? Math.round(s.fontSize * mxConstants.LINE_HEIGHT) + 'px' :
		(mxConstants.LINE_HEIGHT * this.lineHeightCorrection);
	
	style = 'display:inline-block;font-size:' + Math.round(s.fontSize) + 'px;font-family:' + s.fontFamily +
		';color:' + s.fontColor + ';line-height:' + lh + ';' + style;

	if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
	{
		style += 'font-weight:bold;';
	}

	if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
	{
		style += 'font-style:italic;';
	}
	
	if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
	{
		style += 'text-decoration:underline;';
	}
	
	if (align == mxConstants.ALIGN_CENTER)
	{
		style += 'text-align:center;';
	}
	else if (align == mxConstants.ALIGN_RIGHT)
	{
		style += 'text-align:right;';
	}

	var css = '';
	
	if (s.fontBackgroundColor != null)
	{
		css += 'background-color:' + s.fontBackgroundColor + ';';
	}
	
	if (s.fontBorderColor != null)
	{
		css += 'border:1px solid ' + s.fontBorderColor + ';';
	}
	
	var val = str;
	
	if (!mxUtils.isNode(val))
	{
		// Converts HTML entities to unicode since HTML entities are not allowed in XHTML
		var ta = document.createElement('textarea');
		ta.innerHTML = val.replace(/&quot;/g, '&amp;quot;').replace(/&#34;/g, '&amp;#34;').
			replace(/&#60;/g, '&amp;#60;').replace(/&#62;/g, '&amp;#62;').
			replace(/&lt;/g, '&amp;lt;').replace(/&gt;/g, '&amp;gt;').
			replace(/</g, '&lt;').replace(/>/g, '&gt;');
		val = ta.value;

		if (overflow != 'fill' && overflow != 'width')
		{
			// Inner div always needed to measure wrapped text
			val = '<div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;' + css + '">' + val + '</div>';
		}
		else
		{
			style += css;
		}
	}

	// Uses DOM API where available. This cannot be used in IE9/10 to avoid
	// an opening and two (!) closing TBODY tags being added to tables.
	if (!mxClient.IS_IE && !mxClient.IS_IE11 && document.createElementNS)
	{
		var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
		div.setAttribute('style', style);
		
		if (mxUtils.isNode(val))
		{
			// Creates a copy for export
			if (this.root.ownerDocument != document)
			{
				div.appendChild(val.cloneNode(true));
			}
			else
			{
				div.appendChild(val);
			}
		}
		else
		{
			div.innerHTML = val;
		}
		
		return div;
	}
	else
	{
		// Serializes for export
		if (mxUtils.isNode(val) && this.root.ownerDocument != document)
		{
			val = val.outerHTML;
		}
		
		// Converts invalid tags to XHTML
		// LATER: Check for all unclosed tags
		val = val.replace(/<br>/g, '<br />').replace(/<hr>/g, '<hr />');

		// NOTE: FF 3.6 crashes if content CSS contains "height:100%"
		return mxUtils.parseXml('<div xmlns="http://www.w3.org/1999/xhtml" style="' + style + 
			'">' + val + '</div>').documentElement;
	}
};

mxAsyncCanvas.prototype.finish = function(handler)
{
	// TODO: Check if waitCounter updates need a monitor. Question is
	// if image load-handler can be executed in parallel leading to
	// race conditions when updating the "shared" waitCounter.
	if (this.waitCounter == 0)
	{
		handler();
	}
	else
	{
		this.onComplete = handler;
	}
};