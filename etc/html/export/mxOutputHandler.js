var mxOutputHandler = function(canvas)
{
	var handlers = [];
	
	handlers['save'] = function(node)
	{
		canvas.save();
	};
	
	handlers['restore'] = function(node)
	{
		canvas.restore();
	};
	
	handlers['scale'] = function(node)
	{
		canvas.scale(Number(node.getAttribute('scale')));
	};
	
	handlers['translate'] = function(node)
	{
		canvas.translate(Nnumber(node.getAttribute('dx')), Number(node.getAttribute('dy')));
	};

	handlers['rotate'] = function(node)
	{
		canvas.rotate(Number(node.getAttribute('theta')), node.getAttribute('flipH') == '1',
				node.getAttribute('flipV') == '1', Number(node.getAttribute('cx')),
				Number(node.getAttribute('cy')));
	};
	
	handlers['strokewidth'] = function(node)
	{
		canvas.setStrokeWidth(Number(node.getAttribute('width')));
	};
	
	handlers['strokecolor'] = function(node)
	{
		canvas.setStrokeColor(node.getAttribute('color'));
	};
	
	handlers['dashed'] = function(node)
	{
		canvas.setDashed(node.getAttribute('dashed') == '1');
	};

	handlers['dashpattern'] = function(node)
	{
		canvas.setDashPattern(node.getAttribute('pattern'));
	};

	handlers['linecap'] = function(node)
	{
		canvas.setLineCap(node.getAttribute('cap'));
	};

	handlers['linejoin'] = function(node)
	{
		canvas.setLineJoin(node.getAttribute('join'));
	};

	handlers['miterlimit'] = function(node)
	{
		canvas.setMiterLimit(Number(node.getAttribute('limit')));
	};

	handlers['fontsize'] = function(node)
	{
		canvas.setFontSize(Number(node.getAttribute('size')));
	};

	handlers['fontcolor'] = function(node)
	{
		canvas.setFontColor(node.getAttribute('color'));
	};

	handlers['fontfamily'] = function(node)
	{
		canvas.setFontFamily(node.getAttribute('family'));
	};

	handlers['fontstyle'] = function(node)
	{
		canvas.setFontStyle(Number(node.getAttribute('style')));
	};

	handlers['alpha'] = function(node)
	{
		canvas.setAlpha(Number(node.getAttribute('alpha')));
	};

	handlers['fillcolor'] = function(node)
	{
		canvas.setFillColor(node.getAttribute('color'));
	};

	handlers['gradient'] = function(node)
	{
		canvas.setGradient(node.getAttribute('c1'), node.getAttribute('c2'),
				Number(node.getAttribute('x')), Number(node.getAttribute('y')),
				Number(node.getAttribute('w')), Number(node.getAttribute('h')),
				node.getAttribute('direction'));
	};

	handlers['glass'] = function(node)
	{
		canvas.setGlassGradient(Number(node.getAttribute('x')), Number(node.getAttribute('y')),
				Number(node.getAttribute('w')), Number(node.getAttribute('h')));
	};

	handlers['rect'] = function(node)
	{
		canvas.rect(Number(node.getAttribute('x')), Number(node.getAttribute('y')),
				Number(node.getAttribute('w')), Number(node.getAttribute('h')));
	};

	handlers['roundrect'] = function(node)
	{
		canvas.roundrect(Number(node.getAttribute('x')), Number(node.getAttribute('y')),
				Number(node.getAttribute('w')), Number(node.getAttribute('h')),
				Number(node.getAttribute('dx')), Number(node.getAttribute('dy')));
	};

	handlers['ellipse'] = function(node)
	{
		canvas.ellipse(Number(node.getAttribute('x')), Number(node.getAttribute('y')),
				Number(node.getAttribute('w')), Number(node.getAttribute('h')));
	};

	handlers['image'] = function(node)
	{
		canvas.image(Number(node.getAttribute('x')), Number(node.getAttribute('y')),
				Number(node.getAttribute('w')), Number(node.getAttribute('h')),
				node.getAttribute('src'),
				node.getAttribute('aspect') == '1',
				node.getAttribute('flipH') == '1',
				node.getAttribute('flipV') == '1');
	};

	handlers['text'] = function(node)
	{
		canvas.text(Number(node.getAttribute('x')), Number(node.getAttribute('y')),
				Number(node.getAttribute('w')), Number(node.getAttribute('h')),
				node.getAttribute('str'),
				node.getAttribute('align'),
				node.getAttribute('valign'),
				node.getAttribute('vertical') == '1');
	};

	handlers['begin'] = function(node)
	{
		canvas.begin();
	};

	handlers['move'] = function(node)
	{
		canvas.moveTo(Number(node.getAttribute('x')), Number(node.getAttribute('y')));
	};

	handlers['line'] = function(node)
	{
		canvas.lineTo(Number(node.getAttribute('x')), Number(node.getAttribute('y')));
	};

	handlers['quad'] = function(node)
	{
		canvas.quadTo(Number(node.getAttribute('x1')), Number(node.getAttribute('y1')),
				Number(node.getAttribute('x2')), Number(node.getAttribute('y2')));
	};

	handlers['curve'] = function(node)
	{
		canvas.curveTo(Number(node.getAttribute('x1')), Number(node.getAttribute('y1')),
				Number(node.getAttribute('x2')), Number(node.getAttribute('y2')),
				Number(node.getAttribute('x3')), Number(node.getAttribute('y3')));
	};

	handlers['close'] = function(node)
	{
		canvas.close();
	};

	handlers['stroke'] = function(node)
	{
		canvas.stroke();
	};

	handlers['fill'] = function(node)
	{
		canvas.fill();
	};

	handlers['fillstroke'] = function(node)
	{
		canvas.fillAndStroke();
	};

	handlers['shadow'] = function(node)
	{
		canvas.shadow(node.getAttribute('value'));
	};

	handlers['clip'] = function(node)
	{
		canvas.clip();
	};
	
	return {
		parse: function(root)
		{
			mxLog.show();
			var child = root.firstChild;
			
			while (child != null)
			{
				var handler = handlers[child.nodeName];
				
				if (handler != null)
				{
					handler(child);
				}
				
				child = child.nextSibling;
			}
		}
	};
};