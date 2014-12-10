
/**
 * mxJsCanvas
 * 
 * Open Issues:
 * 
 * - Canvas has no built-in dash-pattern for strokes
 *   - Use AS code for straight lines
 * - Must use proxy for cross domain images
 * - Use html2canvas for HTML rendering (Replaces complete page with
 *   canvas currently, needs API call to render elt to canvas)
 */

/**
 * Extends mxAbstractCanvas2D
 */
function mxJsCanvas(canvas)
{
	this.reset();
	this.ctx = canvas.getContext('2d');
	this.ctx.textBaseline = 'top';
	this.ctx.fillStyle = 'rgba(255,255,255,0)';
	
	//this.ctx.translate(0.5, 0.5);
	
	this.M_RAD_PER_DEG = Math.PI / 180;
	this.images = [];
};

/**
 * Variable: ctx
 * 
 * Holds the current canvas context
 */
mxJsCanvas.prototype.ctx = null;

/**
 * Variable: ctx
 * 
 * Holds the current canvas context
 */
mxJsCanvas.prototype.waitCounter = 0;

/**
 * Variable: ctx
 * 
 * Holds the current canvas context
 */
mxJsCanvas.prototype.onComplete = null;

/**
 * Variable: state
 * 
 * Holds the current state.
 */
mxJsCanvas.prototype.state = null;

/**
 * Variable: states
 * 
 * Stack of states.
 */
mxJsCanvas.prototype.states = null;

/**
 * Variable: ctx
 * 
 * Holds the current canvas context
 */
mxJsCanvas.prototype.images = null;

/**
 * Function: reset
 * 
 * Resets the state of this canvas.
 */
mxJsCanvas.prototype.reset = function()
{
	this.state = this.createState();
	this.states = [];
};

/**
 * Function: createState
 * 
 * Creates the state of the this canvas.
 */
mxJsCanvas.prototype.createState = function()
{
	return {
		dx: 0,
		dy: 0,
		scale: 1,
		alpha: 1,
		fillColor: null,
		fillAlpha: 1,
		gradientColor: null,
		gradientAlpha: 1,
		gradientDirection: null,
		strokeColor: null,
		strokeWidth: 1,
		dashed: false,
		dashPattern: '3 3',
		lineCap: 'flat',
		lineJoin: 'miter',
		miterLimit: 10,
		fontColor: '#000000',
		fontBackgroundColor: null,
		fontBorderColor: null,
		fontSize: mxConstants.DEFAULT_FONTSIZE,
		fontFamily: mxConstants.DEFAULT_FONTFAMILY,
		fontStyle: 0,
		shadow: false,
		shadowColor: mxConstants.SHADOWCOLOR,
		shadowAlpha: mxConstants.SHADOW_OPACITY,
		shadowDx: mxConstants.SHADOW_OFFSET_X,
		shadowDy: mxConstants.SHADOW_OFFSET_Y,
		rotation: 0,
		rotationCx: 0,
		rotationCy: 0
	};
};

mxJsCanvas.prototype.hexToRgb = function(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

mxJsCanvas.prototype.incWaitCounter = function()
{
	this.waitCounter++;
};
	
mxJsCanvas.prototype.decWaitCounter = function()
{
	this.waitCounter--;
	
	if (this.waitCounter == 0 && this.onComplete != null)
	{
		this.onComplete();
		this.onComplete = null;
	}
};
	
mxJsCanvas.prototype.updateFont = function()
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

mxJsCanvas.prototype.rotate = function(theta, flipH, flipV, cx, cy)
{
    cx *= this.state.scale;
    cy *= this.state.scale;

    // This is a special case where the rotation center is scaled so dx/dy,
    // which are also scaled, must be applied after scaling the center.
    cx -= this.state.dx;
    cy -= this.state.dy;
	
	this.ctx.translate(cx, cy);
	
	if (flipH || flipV)
	{
		var sx = (flipH) ? -1 : 1;
		var sy = (flipV) ? -1 : 1;

		this.ctx.scale(sx, sy);
	}

	this.ctx.rotate(theta * this.M_RAD_PER_DEG);
	this.ctx.translate(-cx, -cy);
};

mxJsCanvas.prototype.save = function()
{
	this.states.push(this.state);
	this.state = mxUtils.clone(this.state);
	this.ctx.save();
};

mxJsCanvas.prototype.restore = function()
{
	this.state = this.states.pop();
	this.ctx.restore();
};

mxJsCanvas.prototype.scale = function(s)
{
	this.state.scale *= s;
	this.state.strokeWidth *= s;
	this.ctx.scale(s, s);
};

mxJsCanvas.prototype.translate = function(dx, dy)
{
	this.state.dx += dx;
	this.state.dy += dy;
	this.ctx.translate(dx, dy);
};


mxJsCanvas.prototype.setDashed = function(value)
{
	this.state.dashed = value;
	
	if (value)
	{
		var dashArray = this.state.dashPattern.split(" ");

		for (var i = 0; i < dashArray.length; i++)
		{
			dashArray[i] = parseInt(dashArray[i], 10);
		}
		
		this.ctx.setLineDash(dashArray);
	}
	else
	{
		this.ctx.setLineDash([0]);
	}
};

mxJsCanvas.prototype.setDashPattern = function(value)
{
	this.state.dashPattern = value;
	
	if (this.state.dashed)
	{
		var dashArray = value.split(" ");

		for (var i = 0; i < dashArray.length; i++)
		{
			dashArray[i] = parseInt(dashArray[i], 10);
		}
		
		this.ctx.setLineDash(dashArray);
	}
};

mxJsCanvas.prototype.setLineCap = function(value)
{
	this.ctx.lineCap = value;
};

mxJsCanvas.prototype.setLineJoin = function(value)
{
	this.ctx.lineJoin = value;
};

mxJsCanvas.prototype.setMiterLimit = function(value)
{
	this.ctx.lineJoin = value;
};

mxJsCanvas.prototype.setFontSize = function(value)
{
	this.state.fontSize = value;
};

mxJsCanvas.prototype.setFontFamily = function(value)
{
	this.state.fontFamily = value;
};

mxJsCanvas.prototype.setFontStyle = function(value)
{
	this.state.fontStyle = value;
};

mxJsCanvas.prototype.setStrokeWidth = function(value)
{
	this.ctx.lineWidth = value;
};

mxJsCanvas.prototype.setStrokeColor = function(value)
{
	this.ctx.strokeStyle = value;
};

mxJsCanvas.prototype.setFontColor = function(value)
{
	this.ctx.fillStyle = value;
};

mxJsCanvas.prototype.setFillColor = function(value)
{
	this.ctx.fillStyle = value;
};

mxJsCanvas.prototype.setGradient = function(color1, color2, x, y, w, h, direction, alpha1, alpha2)
{
	var gradient = this.ctx.createLinearGradient(0, y, 0, y + h);
	
	var s = this.state;
	s.fillColor = color1;
	s.fillAlpha = (alpha1 != null) ? alpha1 : 1;
	s.gradientColor = color2;
	s.gradientAlpha = (alpha2 != null) ? alpha2 : 1;
	s.gradientDirection = direction;

	var rgb1 = this.hexToRgb(color1);
	var rgb2 = this.hexToRgb(color2);
	
	if (rgb1 != null)
	{
		gradient.addColorStop(0, 'rgba(' + rgb1.r + ',' + rgb1.g + ',' + rgb1.b + ',' + s.fillAlpha + ')');
	}	
	
	if (rgb2 != null)
	{
		gradient.addColorStop(1, 'rgba(' + rgb2.r + ',' + rgb2.g + ',' + rgb2.b + ',' + s.gradientAlpha + ')');
	}
	
	this.ctx.fillStyle = gradient;
};

mxJsCanvas.prototype.setAlpha = function(alpha)
{
	this.ctx.globalAlpha = alpha;
};

// Redirect can be implemented via a hook
mxJsCanvas.prototype.rewriteImageSource = function(src)
{
	if (src.substring(0, 7) == 'http://' || src.substring(0, 8) == 'https://')
	{
		src = '/redirect?url=' + encodeURIComponent(src);
	}
	
	return src;
};

mxJsCanvas.prototype.image = function(x, y, w, h, src, aspect, flipH, flipV)
{
	src = this.rewriteImageSource(src);
	var image = this.images[src];
	
	function drawImage(ctx, image, x, y, w, h)
	{
		ctx.save();
		
		if (aspect)
		{
			var iw = image.width;
			var ih = image.height;
			
			var s = Math.min(w / iw, h / ih);
			var x0 = (w - iw * s) / 2;
			var y0 = (h - ih * s) / 2;
			
			x += x0;
			y += y0;
			w = iw * s;
			h = ih * s;
		}
		
		if (flipH)
		{
			ctx.translate(2 * x + w, 0);
			ctx.scale(-1, 1);
		}
		
		if (flipV)
		{
			ctx.translate(0, 2 * y + h);
			ctx.scale(1, -1);
		}

		ctx.drawImage(image, x, y, w, h);
		ctx.restore();
	};
	
	if (image != null)
	{
		drawImage.call(this, this.ctx, image, x, y, w, h);
	}
	else
	{
		// TODO: Use XHR to make this synchronous
		var image = new Image();
		
		image.onload = mxUtils.bind(this, function()
		{
			// Async may affect painting order
			drawImage.call(this, this.ctx, image, x, y, w, h);
			this.decWaitCounter();
		});
		
		image.onerror = mxUtils.bind(this, function()
		{
			this.decWaitCounter();
		});

		this.incWaitCounter();
		this.images[src] = image;
		image.src = src;
	}
};

mxJsCanvas.prototype.moveTo = function(x, y)
{
	this.ctx.moveTo(x, y);
	this.lastMoveX = x;
	this.lastMoveY = y;
};

mxJsCanvas.prototype.lineTo = function(x, y)
{
	this.ctx.lineTo(x, y);
	this.lastMoveX = x;
	this.lastMoveY = y;
};

mxJsCanvas.prototype.quadTo = function(x1, y1, x2, y2)
{
	this.ctx.quadraticCurveTo(x1, y1, x2, y2);
	this.lastMoveX = x2;
	this.lastMoveY = y2;
};

mxJsCanvas.prototype.arcTo = function(rx, ry, angle, largeArcFlag, sweepFlag, x, y)
{
	var curves = mxUtils.arcToCurves(this.lastMoveX, this.lastMoveY, rx, ry, angle, largeArcFlag, sweepFlag, x, y);
	
	if (curves != null)
	{
		for (var i = 0; i < curves.length; i += 6) 
		{
			this.curveTo(curves[i], curves[i + 1], curves[i + 2],
				curves[i + 3], curves[i + 4], curves[i + 5]);
		}
	}
};

mxJsCanvas.prototype.setFontBackgroundColor = function(value)
{
	if (value == mxConstants.NONE)
	{
		value = null;
	}
	
	this.state.fontBackgroundColor = value;
};

mxJsCanvas.prototype.setFontBorderColor = function(value)
{
	if (value == mxConstants.NONE)
	{
		value = null;
	}
	
	this.state.fontBorderColor = value;
};

mxJsCanvas.prototype.curveTo = function(x1, y1, x2, y2, x3, y3)
{
	this.ctx.bezierCurveTo(x1, y1, x2, y2 , x3, y3);
	this.lastMoveX = x3;
	this.lastMoveY = y3;
};

mxJsCanvas.prototype.rect = function(x, y, w, h)
{
	// TODO: Check if fillRect/strokeRect is faster
	this.begin();
	this.moveTo(x, y);
	this.lineTo(x + w, y);
	this.lineTo(x + w, y + h);
	this.lineTo(x, y + h);
	this.close();
};

mxJsCanvas.prototype.roundrect = function(x, y, w, h, dx, dy)
{
	this.begin();
	this.moveTo(x + dx, y);
	this.lineTo(x + w - dx, y);
	this.quadTo(x + w, y, x + w, y + dy);
	this.lineTo(x + w, y + h - dy);
	this.quadTo(x + w, y + h, x + w - dx, y + h);
	this.lineTo(x + dx, y + h);
	this.quadTo(x, y + h, x, y + h - dy);
	this.lineTo(x, y + dy);
	this.quadTo(x, y, x + dx, y);
};

mxJsCanvas.prototype.ellipse = function(x, y, w, h)
{
	this.ctx.save();
	this.ctx.translate((x + w / 2), (y + h / 2));
	this.ctx.scale(w / 2, h / 2);
	this.ctx.beginPath();
	this.ctx.arc(0, 0, 1, 0, 2 * Math.PI, false);
	this.ctx.restore();
};

mxJsCanvas.prototype.begin = function()
{
	this.ctx.beginPath();
};

mxJsCanvas.prototype.close = function()
{
	this.ctx.closePath();
};

mxJsCanvas.prototype.fill = function()
{
	this.ctx.fill();
};

mxJsCanvas.prototype.stroke = function()
{
	this.ctx.stroke();
};

mxJsCanvas.prototype.clip = function()
{
	this.ctx.clip();
};

mxJsCanvas.prototype.fillAndStroke = function()
{
	// If you fill then stroke, the shadow of the stroke appears over the fill
	// So stroke, fill, disable shadow, stroke, restore previous shadow
	if (!this.state.shadow)
	{
		this.ctx.fill();
		this.ctx.stroke();
	}
	else
	{
		this.ctx.stroke();
		this.ctx.fill();
		
		var shadowColor = this.ctx.shadowColor;
		var shadowOffsetX = this.ctx.shadowOffsetX;
		var shadowOffsetY = this.ctx.shadowOffsetY;
		
		this.ctx.shadowColor = 'transparent';
		this.ctx.shadowOffsetX = 0; 
		this.ctx.shadowOffsetY = 0;
		
		this.ctx.stroke();
		
		this.ctx.shadowColor = shadowColor;
		this.ctx.shadowOffsetX = shadowOffsetX;
		this.ctx.shadowOffsetY = shadowOffsetY;
	}
};

/**
* Function: setShadow
* 
* Enables or disables and configures the current shadow.
*/
mxJsCanvas.prototype.setShadow = function(enabled)
{
	this.state.shadow = enabled;

	if (enabled)
	{
		this.setShadowOffset(this.state.shadowDx, this.state.shadowDy);
		this.setShadowAlpha(this.state.shadowAlpha);
	}
	else
	{
		this.ctx.shadowColor = 'transparent';
		this.ctx.shadowBlur = 0;
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0;
	}
};

/**
* Function: setShadowColor
* 
* Enables or disables and configures the current shadow.
*/
mxJsCanvas.prototype.setShadowColor = function(value)
{
	mxLog.show();
	mxLog.debug('setShadowColor = ', value);
	
	if (value == null || value == mxConstants.NONE)
	{
		value = null;
		this.ctx.shadowColor = 'transparent';
	}
	
	this.state.shadowColor = value;
	
	if (this.state.shadow && value != null)
	{
		var alpha = (this.state.shadowAlpha != null) ? this.state.shadowAlpha : 1;
		var rgb = this.hexToRgb(value);
		
		this.ctx.shadowColor = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')';
		mxLog.show();
		mxLog.debug('rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')');
	}
};

/**
* Function: setShadowAlpha
* 
* Enables or disables and configures the current shadow.
*/
mxJsCanvas.prototype.setShadowAlpha = function(value)
{
	this.state.shadowAlpha = value;
	this.setShadowColor(this.state.shadowColor);
};

/**
* Function: setShadowOffset
* 
* Enables or disables and configures the current shadow.
*/
mxJsCanvas.prototype.setShadowOffset = function(dx, dy)
{
	this.state.shadowDx = dx;
	this.state.shadowDy = dy;
	
	if (this.state.shadow)
	{
		this.ctx.shadowOffsetX = dx;
		this.ctx.shadowOffsetY = dy;
	}
};

mxJsCanvas.prototype.text = function(x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation)
{
	if (str == null || str.length == 0)
	{
		return;
	}

	// Create SVG with foreignObject and render as image for HTML text
	// see http://robert.ocallahan.org/2011/11/drawing-dom-content-to-canvas.html
	
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
		
	    html2canvas(div,
	    {
	        onrendered: mxUtils.bind(this, function(canvas)
	        {
	        	//document.body.appendChild(canvas);
	    		switch (valign)
	    		{
	    		 case mxConstants.ALIGN_MIDDLE:
	    			 y -= canvas.height / 2;
	    			 break;
	    		 case mxConstants.ALIGN_BOTTOM:
	    			 y -= canvas.height;
	    			 break;
	    		}
	    		
	    		switch (align)
	    		{
	    		 case mxConstants.ALIGN_CENTER:
	    			 x -= canvas.width / 2;
	    			 break;
	    		 case mxConstants.ALIGN_RIGHT:
	    			 x -= canvas.width;
	    			 break;
	    		}
	    		
	        	this.ctx.drawImage(canvas, x ,y);
	        	document.body.removeChild(div);
	        	this.decWaitCounter();
	        })
	    });
	}
	else
	{
		w *= this.state.scale;
		h *= this.state.scale;
		
		this.ctx.save();
		this.updateFont();
		
		if (rotation != 0)
		{
			this.ctx.translate(x, y);
			this.ctx.rotate(rotation * Math.PI / 180);
			this.ctx.translate(-x, -y);
		}
			
		var div = document.createElement("div");
	    div.innerHTML = str;
	    div.style.position = 'absolute';
	    div.style.top  = '-9999px';
	    div.style.left = '-9999px';
	    div.style.fontFamily = this.state.fontFamily;
	    div.style.fontWeight = 'bold';
	    div.style.fontSize = this.state.fontSize + 'pt';
	    document.body.appendChild(div);
	    var measuredFont = [div.offsetWidth, div.offsetHeight];
	    document.body.removeChild(div);
	
	    var lines = str.split('\n');
		var lineHeight = measuredFont[1];
		
		this.ctx.textBaseline = 'top';
		var backgroundY = y;
		
		switch (valign)
		{
		 case mxConstants.ALIGN_MIDDLE:
			 this.ctx.textBaseline = 'middle';
			 y -= (lines.length-1) * lineHeight / 2;
			 backgroundY = y - this.state.fontSize / 2;
			 break;
		 case mxConstants.ALIGN_BOTTOM:
			 this.ctx.textBaseline = 'alphabetic';
			 y -= lineHeight * (lines.length-1);
			 backgroundY = y - this.state.fontSize;
			 break;
		}
	
	    var lineWidth = [];
	    var lineX = [];
	    
		for (var i = 0; i < lines.length; i++)
		{
			lineX[i] = x;
			lineWidth[i] = this.ctx.measureText(lines[i]).width;
	  
			if (align != null && align != mxConstants.ALIGN_LEFT)
			{
				lineX[i] -= lineWidth[i];
	
				if (align == mxConstants.ALIGN_CENTER)
				{
					lineX[i] += lineWidth[i] / 2;
				}
			}
		}
	
		if (this.state.fontBackgroundColor != null || this.state.fontBorderColor != null)
		{
			var startMostX = lineX[0];
			var maxWidth = lineWidth[0];
	 
			for (var i = 1; i < lines.length; i++)
			{
				startMostX = Math.min(startMostX, lineX[i]);
				maxWidth = Math.max(maxWidth, lineWidth[i]);
			}
	
			this.ctx.save();
			
			if (this.state.fontBackgroundColor != null)
			{
				this.ctx.fillStyle = this.state.fontBackgroundColor;
				this.ctx.fillRect(startMostX, backgroundY, maxWidth, this.state.fontSize * mxConstants.LINE_HEIGHT * lines.length);
			}
			if (this.state.fontBorderColor != null)
			{
				this.ctx.strokeStyle = this.state.fontBorderColor;
				this.ctx.lineWidth = 1;
				this.ctx.strokeRect(startMostX, backgroundY, maxWidth, this.state.fontSize * mxConstants.LINE_HEIGHT * lines.length);
			}
			
			this.ctx.restore();
		}
		
		for (var i = 0; i < lines.length; i++)
		{
			this.ctx.fillText(lines[i], lineX[i], y);
			y += this.state.fontSize * mxConstants.LINE_HEIGHT;
		}
		
		this.ctx.restore();
	}
};

/**
 * Function: createDiv
 * 
 * Private helper function to create SVG elements
 */
mxJsCanvas.prototype.createDiv = function(str, align, valign, style, overflow)
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

mxJsCanvas.prototype.getCanvas = function()
{
	return canvas;
};

mxJsCanvas.prototype.finish = function(handler)
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