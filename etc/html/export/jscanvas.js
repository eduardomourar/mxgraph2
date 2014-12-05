
/**
 * jsPDF
 * 
 * Open Issues:
 * 
 * - Canvas has no built-in dash-pattern for strokes
 *   - Use AS code for straight lines
 * - Must use proxy for cross domain images
 * - Use html2canvas for HTML rendering (Replaces complete page with
 *   canvas currently, needs API call to render elt to canvas)
 */

var jsCanvas = function(canvas){
	var ctx = canvas.getContext('2d');
	ctx.textBaseline = 'top';
	ctx.fillStyle = 'rgba(255,255,255,0)';
	
	// Private properties
	var version = '20110101';
	var scale = 1;
	var tx = 0;
	var ty = 0;
	
	var M_SQRT2 = Math.sqrt(2);
	var M_RAD_PER_DEG = Math.PI / 180;
	var k = 1;
	var ks = k * scale;
	
	var images = [];
	
	var waitCounter = 0;
	var onComplete = null;
	var fontSize = mxConstants.DEFAULT_FONTSIZE;
	var fontFamily = mxConstants.DEFAULT_FONTFAMILY;
	var fontStyle = 0;
	
	var incWaitCounter = function()
	{
		waitCounter++;
	};
	
	var decWaitCounter = function()
	{
		waitCounter--;
		
		if (waitCounter == 0 && onComplete != null)
		{
			onComplete();
			onComplete = null;
		}
	};
	
	var updateFont = function()
	{
		var style = '';
		
		if ((fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
		{
			style += 'bold ';
		}
		
		if ((fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
		{
			style += 'italic ';
		}
		
		ctx.font = style + fontSize + 'px ' + fontFamily;
	};

	return {
		scale: function(s)
		{
			scale *= s;
			ks = k * scale;
		},
		translate: function(dx, dy)
		{
			tx += dx;
			ty += dy;
		},
		rotate: function(theta, flipH, flipV, cx, cy)
		{
            cx *= scale;
            cy *= scale;

            // This is a special case where the rotation center is scaled so dx/dy,
            // which are also scaled, must be applied after scaling the center.
            cx -= tx;
            cy -= ty;
			
			if (flipH ^ flipV)
			{
				var tx = (flipH) ? cx : 0;
				var sx = (flipH) ? -1 : 1;

				var ty = (flipV) ? cy : 0;
				var sy = (flipV) ? -1 : 1;

				ctx.translate(tx, ty);
				ctx.scale(sx, sy);
				ctx.translate(-tx, -ty);
			}
			
			ctx.translate(-cx, -cy);
			ctx.rotate(theta * M_RAD_PER_DEG);
			ctx.translate(cx, cy);
		},
		save: function()
		{
			ctx.save();
		},
		restore: function()
		{
			ctx.restore();
		},
		setDashed: function(value)
		{
			// TODO: Canvas has no built-in dash pattern
		},
		setDashPattern: function(value)
		{
			// TODO: Canvas has no built-in dash pattern
		},
		setLineCap: function(value)
		{
			ctx.lineCap = value;
		},
		setLineJoin: function(value)
		{
			ctx.lineJoin = value;
		},
		setMiterLimit: function(value)
		{
			ctx.lineJoin = value;
		},
		setFontSize: function(value) {
			fontSize = value * ks;
		},
		setFontFamily: function(value) {
			fontFamily = value;
		},
		setFontStyle: function(value) {
			fontStyle = value;
		},
		setStrokeWidth: function(value) {
			ctx.lineWidth = value * ks;
		},
		setStrokeColor: function(value) {
			ctx.strokeStyle = value;
		},
		setFontColor: function(value) {
			ctx.fillStyle = value;
		},
		setFillColor: function(value) {
			ctx.fillStyle = value;
		},
		setGradient: function(color1, color2, x, y, w, h, direction) {
			var gradient = ctx.createLinearGradient(0, y * ks, 0, (y + h) * ks);
			gradient.addColorStop(0, color1);
			gradient.addColorStop(1, color2);
			ctx.fillStyle = gradient;
		},
		setGlassGradient: function(x, y, w, h) {
			var gradient = ctx.createLinearGradient(0, y * ks, 0, (y + h * 0.4) * ks);
			gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
			gradient.addColorStop(1, 'rgba(255,255,255,0.3)');
			ctx.fillStyle = gradient;
		},
		setAlpha: function(alpha) {
			ctx.globalAlpha = alpha;
		},
		// Redirect can be implemented via a hook
		rewriteImageSource: function(src) {
			if (src.substring(0, 7) == 'http://' || src.substring(0, 8) == 'https://')
			{
				src = '/redirect?url=' + encodeURIComponent(src);
			}
			
			return src;
		},
		image: function(x, y, w, h, src, aspect, flipH, flipV)
		{
			src = this.rewriteImageSource(src);
			
			var image = images[src];
			x = tx + x * scale;
			y = ty + y * scale;
			w *= scale;
			h *= scale;
			
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
				drawImage.call(this, ctx, image, x, y, w, h);
			}
			else
			{
				// TODO: Use XHR to make this synchronous
				var image = new Image();
				
				image.onload = function()
				{
					images[src] = image;
					
					// Async may affect painting order
					drawImage.call(this, ctx, image, x, y, w, h);
					decWaitCounter();
				};
				
				image.onerror = function()
				{
					decWaitCounter();
				};

				incWaitCounter();
				image.src = src;
			}
		},
		moveTo: function(x, y) {
			x += tx;
			y += ty;
			ctx.moveTo(x * ks, y * ks);
			lastMoveX = x;
			lastMoveY = y;
		},
		lineTo: function(x, y) {
			x += tx;
			y += ty;
			ctx.lineTo(x * ks, y * ks);
			lastMoveX = x;
			lastMoveY = y;
		},
		quadTo: function(x1, y1, x2, y2) {
			x1 += tx;
			y1 += ty;
			x2 += tx;
			y2 += ty;
			ctx.quadraticCurveTo(x1 * ks, y1 * ks, x2 * ks, y2 * ks);
			lastMoveX = x2;
			lastMoveY = y2;
		},
		arcTo: function(value)
		{
			// TODO
		},
		setFontBackgroundColor: function(value)
		{
			// TODO
		},
		setFontBorderColor: function(value)
		{
			// TODO
		},
		curveTo: function(x1, y1, x2, y2, x3, y3) {
			x1 += tx;
			y1 += ty;
			x2 += tx;
			y2 += ty;
			x3 += tx;
			y3 += ty;
			ctx.bezierCurveTo(x1 * ks, y1 * ks,
					x2 * ks, y2 * ks,
					x3 * ks, y3 * ks);
			lastMoveX = x3;
			lastMoveY = y3;
		},
		rect: function(x, y, w, h) {
			// TODO: Check if fillRect/strokeRect is faster
			this.begin();
			this.moveTo(x, y);
			this.lineTo(x + w, y);
			this.lineTo(x + w, y + h);
			this.lineTo(x, y + h);
			this.close();
		},
		roundrect: function(x, y, w, h, dx, dy) {
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
		},
		ellipse: function(x, y, w, h)
		{
			x += tx;
			y += ty;
			ctx.save();
			ctx.translate((x + w / 2) * ks, (y + h / 2) * ks);
			ctx.scale(w / 2 * ks, h / 2 * ks);
			ctx.beginPath();
			ctx.arc(0, 0, 1, 0, 2 * Math.PI, false);
			ctx.restore();
		},
		begin: function()
		{
			ctx.beginPath();
		},
		close: function()
		{
			ctx.closePath();
		},
		fill: function()
		{
			ctx.fill();
		},
		stroke: function()
		{
			ctx.stroke();
		},
		clip: function()
		{
			ctx.clip();
		},
		fillAndStroke: function()
		{
			ctx.fill();
			ctx.stroke();
		},
		setShadow: function(value)
		{
			/*ctx.save();
			ctx.strokeStyle = value;
			
			if (filled == null || filled)
			{
				ctx.fillStyle = value;
				ctx.fill();
			}
			
			ctx.stroke();
			ctx.restore();*/
		},
		text: function(x, y, w, h, str, align, valign, vertical, wrap, format)
		{
			// Create SVG with foreignObject and render as image for HTML text
			// see http://robert.ocallahan.org/2011/11/drawing-dom-content-to-canvas.html
			
			x = tx + x * scale;
			y = ty + y * scale;
			w *= scale;
			h *= scale;
			
			ctx.save();
			updateFont();
			
			if (vertical)
			{
				var dx = x + w / 2;
				var dy = y + h / 2;
				ctx.translate(dx, dy);
				ctx.rotate(270 * Math.PI / 180);
				ctx.translate(-dx, -dy);
			}
			
			var lines = str.split('\n');
			
			for (var i = 0; i < lines.length; i++)
			{
				var dx = 0;
				
				if (align != null && align != mxConstants.ALIGN_LEFT)
				{
					dx = (w - ctx.measureText(lines[i]).width);
					
					if (align == mxConstants.ALIGN_CENTER)
					{
						dx /= 2;
					}
				}
				
				ctx.fillText(lines[i], x + dx, y, w);
				y += fontSize * 1.3;
			}
			
			ctx.restore();
		},
		getCanvas: function()
		{
			return canvas;
		},
		finish: function(handler)
		{
			// TODO: Check if waitCounter updates need a monitor. Question is
			// if image load-handler can be executed in parallel leading to
			// race conditions when updating the "shared" waitCounter.
			if (waitCounter == 0)
			{
				handler();
			}
			else
			{
				onComplete = handler;
			}
		}
	};

};