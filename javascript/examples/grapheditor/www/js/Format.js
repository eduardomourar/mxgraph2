/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * ** DO NOT USE IN PRODUCTION! **
 */
Format = function(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
	this.init();
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Format.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	this.update = mxUtils.bind(this, function(sender, evt)
	{
		this.container.innerHTML = '';
		this.refresh();
	});
	
	graph.getSelectionModel().addListener(mxEvent.CHANGE, this.update);
	graph.getModel().addListener(mxEvent.CHANGE, this.update);
	
	// TODO: To draw.io
	ui.editor.addListener('fileLoaded', this.update);
	
	this.refresh();
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Format.prototype.refresh = function()
{
	// Destroy existing panels
	if (this.panels != null)
	{
		for (var i = 0; i < this.panels.length; i++)
		{
			this.panels[i].destroy();
		}
	}
	
	this.panels = [];
	
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	// TODO: To draw.io
	// TODO: Attention for updates during realtime, refresh needs to go
	//if (ui.getCurrentFile() != null)
	{
		if (graph.isSelectionEmpty())
		{
			var div = document.createElement('div');
			div.style.borderBottom = '1px solid #c0c0c0';
			div.style.height = '28px';
			div.style.fontSize = '12px';
			//div.style.width = '100%';
			div.style.color = 'rgb(112, 112, 112)';
			div.style.fontWeight = 'bold';
			div.style.textAlign = 'center';
			div.style.marginTop = '8px';
			mxUtils.write(div, mxResources.get('diagram'));
			this.container.appendChild(div);
			
			var div = div.cloneNode(false);
			div.style.textAlign = 'left';
			//div.style.fontWeight = 'normal';
			div.style.height = 'auto';
			//div.style.color = 'rgb(81, 81, 81)';
			this.container.appendChild(div);
			
			this.panels.push(new DiagramFormatPanel(ui, div));
			// TODO: Remove all listeners in destroy of panel
		}
		else
		{
			// TODO: Show style section only if width/height >= 2
			var div = document.createElement('div');
			div.style.borderBottom = '1px solid #c0c0c0';
			div.style.height = '28px';
			div.style.fontSIze = '12px';
			//div.style.width = '100%';
			div.style.color = 'rgb(112, 112, 112)';
			div.style.fontWeight = 'bold';
			div.style.textAlign = 'center';
			div.style.marginTop = '8px';
			mxUtils.write(div, mxResources.get('style'));
			this.container.appendChild(div);
			
			div = div.cloneNode(false);
			div.style.textAlign = 'left';
			//div.style.fontWeight = 'normal';
			div.style.height = 'auto';
			//div.style.color = 'rgb(81, 81, 81)';
			
			this.container.appendChild(div);
			
			this.panels.push(new StyleFormatPanel(ui, div));
		}
	}
};

/**
 * Base class for format panels.
 */
BaseFormatPanel = function(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
};

/**
 * Adds the given option.
 */
BaseFormatPanel.prototype.addOption = function addOption(parent, label, isCheckedFn, setCheckedFn)
{
	var cb = document.createElement('input');
	cb.setAttribute('type', 'checkbox');
	cb.style.margin = '0px';
	cb.style.marginRight = '6px';
	
	if (isCheckedFn())
	{
		cb.setAttribute('checked', 'checked');
		cb.defaultChecked = true;
	}

	var span = document.createElement('div');
	span.style.width = '210px';
	span.style.height = '24px';
	span.style.whiteSpace = 'nowrap';
	span.style.overflow = 'hidden';
	span.appendChild(cb);
	mxUtils.write(span, label);
	
	mxEvent.addListener(span, 'click', function(evt)
	{
		// Toggles checkbox state for click on label
		if (mxEvent.getSource(evt) != cb)
		{
			cb.checked = !cb.checked;
		}
		
		setCheckedFn(cb.checked);
	});
	
	parent.appendChild(span);
};

/**
 * Adds the given color option.
 */
BaseFormatPanel.prototype.addColorOption = function(parent, label, getColorFn, setColorFn, defaultColor)
{
	var cb = document.createElement('input');
	cb.setAttribute('type', 'checkbox');
	cb.style.margin = '0px';
	cb.style.marginRight = '6px';

	var span = document.createElement('div');
	span.style.display = 'inline-block';
	span.style.width = '210px';
	span.style.height = '22px';
	span.style.whiteSpace = 'nowrap';
	span.style.overflow = 'hidden';
	span.appendChild(cb);
	mxUtils.write(span, label);
	parent.appendChild(span);
	
	var value = getColorFn();
	
	var apply = function(color)
	{
		btn.innerHTML = '<div style="width:36px;height:12px;margin:3px;border:1px solid black;background-color:' +
			((color != null && color != mxConstants.NONE) ? color : defaultColor) + ';"></div>';
		
		if (color != null && color != mxConstants.NONE)
		{
			cb.setAttribute('checked', 'checked');
			cb.defaultChecked = true;
		}
		else
		{
			cb.removeAttribute('checked');
			cb.defaultChecked = false;
		}

		btn.style.display = (cb.checked) ? '' : 'none';
		
		if (value != color)
		{
			value = color;
			setColorFn(value);
		}
	};

	var btn = mxUtils.button('', mxUtils.bind(this, function(evt)
	{
		var cd = new ColorDialog(this.editorUi, value, apply);
		this.editorUi.showDialog(cd.container, 220, 400, true, false);
		cd.init();
		mxEvent.consume(evt);
	}));
	
	btn.style.position = 'absolute';
	btn.style.right = '20px';
	btn.style.height = '22px';
	btn.style.marginTop = '-5px';
	btn.className = 'geColorBtn';
	btn.style.display = (cb.checked) ? '' : 'none';
	
	span.appendChild(btn);
	
	mxEvent.addListener(span, 'click', function(evt)
	{
		// Toggles checkbox state for click on label
		if (mxEvent.getSource(evt) != cb)
		{
			cb.checked = !cb.checked;
		}
		
		apply((cb.checked) ? value : null);
	});
	
	apply(value);
};

/**
 * Adds the label menu items to the given menu and parent.
 */
BaseFormatPanel.prototype.destroy = function() { };

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel = function(editorUi, container)
{
	BaseFormatPanel.call(this, editorUi, container);
	this.init();
};

mxUtils.extend(StyleFormatPanel, BaseFormatPanel);

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var state = graph.view.getState(graph.getSelectionCell());
	var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
	
	var clone = this.container.cloneNode(true);
	clone.style.paddingTop = '4px';
	clone.style.paddingBottom = '12px';
	clone.style.paddingLeft = '10px';
	
	this.container.style.borderBottom = 'none';
	
	this.container.appendChild((function(div)
	{
		var stylenames = ['gray', 'blue', 'green', 'turquoise', 'yellow', 'red', 'purple', null];
		div.style.paddingBottom = '4px';
		
		function addButton(stylename)
		{
			var tmp = (stylename != null) ? graph.stylesheet.styles[stylename] : null;
			
			var btn = mxUtils.button(''/*mxResources.get(stylename)*/, function(evt)
			{
				graph.getModel().beginUpdate();
				var cells = graph.getSelectionCells();
				
				for (var i = 0; i < cells.length; i++)
				{
					var style = graph.getModel().getStyle(cells[i]);

					for (var j = 0; j < stylenames.length; j++)
					{
						style = mxUtils.removeStylename(style, stylenames[j]);
					}
					
					if (stylename != null)
					{
						// Removes styles that are defined in this style from the current
						// style so that they are added behind the stylename if changed
						for (var key in tmp)
						{
							style = mxUtils.setStyle(style, key, null);
						}
						
						style = mxUtils.addStylename(style, stylename);
					}
					
					graph.getModel().setStyle(cells[i], style);
				}
				
				graph.getModel().endUpdate();
			})

			btn.style.width = '45px';
			btn.style.height = '34px';
			btn.style.lineHeight = '24px';
			btn.style.margin = '1px 10px 10px 1px';
			btn.style.cursor = 'pointer';
			mxUtils.setPrefixedStyle(btn.style, 'box-shadow', '2px 2px 2px 0px #bbb');

			if (tmp != null)
			{
				if (mxClient.IS_IE && (mxClient.IS_QUIRKS || document.documentMode < 10))
				{
			    	btn.style.filter = 'progid:DXImageTransform.Microsoft.Gradient('+
	                	'StartColorStr=\'' + tmp[mxConstants.STYLE_FILLCOLOR] +
	                	'\', EndColorStr=\'' + tmp[mxConstants.STYLE_GRADIENTCOLOR] + '\', GradientType=0)';
				}
				else
				{
					btn.style.backgroundImage = 'linear-gradient(' + tmp[mxConstants.STYLE_FILLCOLOR] + ' 0px,' +
						tmp[mxConstants.STYLE_GRADIENTCOLOR] + ' 100%)';
				}

				btn.style.border = '1px solid ' + tmp[mxConstants.STYLE_STROKECOLOR];
			}
			else
			{
				btn.style.backgroundColor = 'whiteSmoke';
				btn.style.border = '1px solid #c0c0c0';
				// TODO: Fix vertical offset
				btn.innerHTML = 'X';
			}
			
			div.appendChild(btn);
		};
		
		for (var i = 0; i < stylenames.length; i++)
		{
			addButton(stylenames[i]);
		}
		
		return div;
	})(clone.cloneNode(true)));
	
	if (graph.getModel().isVertex(graph.getSelectionCell()) || shape == 'arrow')
	{
		this.container.appendChild((function(div)
		{
			var cb2 = document.createElement('input');
			cb2.setAttribute('type', 'checkbox');
	
			var value = mxUtils.getValue(state.style, mxConstants.STYLE_FILLCOLOR, null);
	
			if (value != null && value != mxConstants.NONE)
			{
				cb2.setAttribute('checked', 'checked');
				cb2.defaultChecked = true;
			}
	
			div.appendChild(cb2);
			
			var btn = mxUtils.button(''/*mxResources.get('color')*/, function(evt)
			{
				ui.actions.get('fillColor').funct();
			});
			btn.innerHTML = '<div style="width:36px;height:12px;margin:4px;border:1px solid black;background-color:' + ((value != null && value != mxConstants.NONE) ? value : '') + ';"></div>';
			btn.style.position = 'absolute';
			btn.style.right = '24px';
			btn.style.height = '24px';
			btn.style.marginTop = '-1px';
			btn.className = 'geColorBtn';
			btn.style.display = (cb2.checked) ? '' : 'none';
	
			mxEvent.addListener(cb2, 'change', function(evt)
			{
				graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, (cb2.checked) ? '#ffffff' : 'none');
				btn.style.display = (cb2.checked) ? '' : 'none';
				mxEvent.consume(evt);
			});
			
			var span = document.createElement('span');
			span.style.marginLeft = '4px';
			span.style.lineHeight = '22px';
			mxUtils.write(span, mxResources.get('fillColor'));
			
			mxEvent.addListener(span, 'click', function(evt)
			{
				cb2.checked = !cb2.checked;
				graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, (cb2.checked) ? '#ffffff' : 'none');
				btn.style.display = (cb2.checked) ? '' : 'none';
				mxEvent.consume(evt);
			});
			
			div.appendChild(span);
			div.appendChild(btn);
			
			return div;
		})(clone.cloneNode(true)));
		
		this.container.appendChild((function(div)
		{
			var cb2 = document.createElement('input');
			cb2.setAttribute('type', 'checkbox');
			
			var value = mxUtils.getValue(state.style, mxConstants.STYLE_GRADIENTCOLOR, null);
	
			if (value != null && value != mxConstants.NONE)
			{
				cb2.setAttribute('checked', 'checked');
				cb2.defaultChecked = true;
			}
			
			div.appendChild(cb2);
			
			var btn = mxUtils.button(''/*mxResources.get('color')*/, function(evt)
			{
				ui.actions.get('gradientColor').funct();
			})
			btn.innerHTML = '<div style="width:36px;height:12px;margin:4px;border:1px solid black;background-color:' + ((value != null && value != mxConstants.NONE) ? value : '') + ';"></div>';
			btn.style.position = 'absolute';
			btn.style.right = '24px';
			btn.style.height = '24px';
			btn.style.marginTop = '-1px';
			btn.className = 'geColorBtn';
			btn.style.display = (cb2.checked) ? '' : 'none';
			
			mxEvent.addListener(cb2, 'change', function(evt)
			{
				graph.setCellStyles(mxConstants.STYLE_GRADIENTCOLOR, (cb2.checked) ? '#ffffff' : null);
				btn.style.display = (cb2.checked) ? '' : 'none';
				mxEvent.consume(evt);
			});
			
			var span = document.createElement('span');
			span.style.marginLeft = '4px';
			span.style.lineHeight = '22px';
			mxUtils.write(span, mxResources.get('gradient'));
			
			mxEvent.addListener(span, 'click', function(evt)
			{
				cb2.checked = !cb2.checked;
				graph.setCellStyles(mxConstants.STYLE_GRADIENTCOLOR, (cb2.checked) ? '#ffffff' : null);
				btn.style.display = (cb2.checked) ? '' : 'none';
				mxEvent.consume(evt);
			});
			
			div.appendChild(span);
			div.appendChild(btn);
			
			return div;
		})(clone.cloneNode(true)));
	}
	
	this.container.appendChild((function(div)
	{
		var cb2 = document.createElement('input');
		cb2.setAttribute('type', 'checkbox');

		var value = mxUtils.getValue(state.style, mxConstants.STYLE_STROKECOLOR, null);

		if (value != null && value != mxConstants.NONE)
		{
			cb2.setAttribute('checked', 'checked');
			cb2.defaultChecked = true;
		}

		div.appendChild(cb2);
		
		var btn = mxUtils.button(''/*mxResources.get('color')*/, function(evt)
		{
			ui.actions.get('strokeColor').funct();
		})
		btn.innerHTML = '<div style="width:36px;height:12px;margin:4px;border:1px solid black;background-color:' + ((value != null && value != mxConstants.NONE) ? value : '') + ';"></div>';
		btn.style.position = 'absolute';
		btn.style.right = '24px';
		btn.style.height = '24px';
		btn.style.marginTop = '-1px';
		btn.className = 'geColorBtn';
		btn.style.display = (cb2.checked) ? '' : 'none';
		
		mxEvent.addListener(cb2, 'change', function(evt)
		{
			graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, (cb2.checked) ? '#000000' : 'none');
			btn.style.display = (cb2.checked) ? '' : 'none';
			mxEvent.consume(evt);
		});
		
		var span = document.createElement('span');
		span.style.marginLeft = '4px';
		span.style.lineHeight = '22px';
		mxUtils.write(span, mxResources.get('strokeColor'));
		
		mxEvent.addListener(span, 'click', function(evt)
		{
			cb2.checked = !cb2.checked;
			graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, (cb2.checked) ? '#000000' : 'none');
			btn.style.display = (cb2.checked) ? '' : 'none';
			mxEvent.consume(evt);
		});
		
		div.appendChild(span);
		div.appendChild(btn);
		
		return div;
	})(clone.cloneNode(true)));
	
	this.container.appendChild((function(div)
	{
		var valueInput = document.createElement('input');
//		valueInput.setAttribute('type', 'number');
//		valueInput.setAttribute('min', '0');
//		valueInput.setAttribute('max', '100');
		valueInput.style.textAlign = 'right';
		valueInput.style.width = '40px';
		valueInput.style.marginLeft = '8px';
		valueInput.value = mxUtils.getValue(state.style, mxConstants.STYLE_OPACITY, '100') + ' %';
		
		mxEvent.addListener(valueInput, 'change', function(evt)
		{
			graph.setCellStyles(mxConstants.STYLE_OPACITY, parseInt(valueInput.value));
			valueInput.value = parseInt(valueInput.value) + ' %';
			mxEvent.consume(evt);
		});

		var span = document.createElement('span');
		span.style.lineHeight = '22px';
		span.style.marginLeft = '20px';
		mxUtils.write(span, mxResources.get('opacity'));
		span.appendChild(valueInput);

		div.appendChild(span);
		
		return div;
	})(clone.cloneNode(true)));
	
	var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
	
	if (shape != 'ellipse' && shape != 'doubleEllipse')
	{
		this.container.appendChild((function(div)
		{
			var cb1 = document.createElement('input');
			cb1.setAttribute('type', 'checkbox');
			
			// FIXME: Add checked for quirks, update via event, get current shadow
			cb1.checked = mxUtils.getValue(state.style, mxConstants.STYLE_ROUNDED, '0') != '0';
			
			div.appendChild(cb1);

			mxEvent.addListener(cb1, 'change', function(evt)
			{
				graph.setCellStyles(mxConstants.STYLE_ROUNDED, (cb1.checked) ? '1' : '0');
				mxEvent.consume(evt);
			});
			
			var span = document.createElement('span');
			span.style.marginLeft = '4px';
			span.style.lineHeight = '22px';
			mxUtils.write(span, mxResources.get('rounded'));
			
			mxEvent.addListener(span, 'click', function(evt)
			{
				cb1.checked = !cb1.checked;
				graph.setCellStyles(mxConstants.STYLE_ROUNDED, (cb1.checked) ? '1' : '0');
				mxEvent.consume(evt);
			});
			
			div.appendChild(span);
			
			return div;
		})(clone.cloneNode(true)));
	}
	
	this.container.appendChild((function(div)
	{
		var cb1 = document.createElement('input');
		cb1.setAttribute('type', 'checkbox');
		
		// FIXME: Add checked for quirks, update via event, get current shadow
		cb1.checked = mxUtils.getValue(state.style, mxConstants.STYLE_SHADOW, '0') != '0';
		
		div.appendChild(cb1);

		mxEvent.addListener(cb1, 'change', function(evt)
		{
			graph.setCellStyles(mxConstants.STYLE_SHADOW, (cb1.checked) ? '1' : '0');
			mxEvent.consume(evt);
		});
		
		var span = document.createElement('span');
		span.style.marginLeft = '4px';
		span.style.lineHeight = '22px';
		mxUtils.write(span, mxResources.get('shadow'));
		
		mxEvent.addListener(span, 'click', function(evt)
		{
			cb1.checked = !cb1.checked;
			graph.setCellStyles(mxConstants.STYLE_SHADOW, (cb1.checked) ? '1' : '0');
			mxEvent.consume(evt);
		});
		
		div.appendChild(span);

		return div;
	})(clone.cloneNode(true)));

	// TODO: Add list of glass-compatible shapes
	if (shape == 'label' || shape == 'rectangle' || shape == 'internalStorage' || shape == 'ext')
	{
		this.container.appendChild((function(div)
		{
			var cb1 = document.createElement('input');
			cb1.setAttribute('type', 'checkbox');
			
			// FIXME: Add checked for quirks, update via event, get current shadow
			cb1.checked = mxUtils.getValue(state.style, mxConstants.STYLE_GLASS, '0') != '0';
			
			div.appendChild(cb1);

			mxEvent.addListener(cb1, 'change', function(evt)
			{
				graph.setCellStyles(mxConstants.STYLE_GLASS, (cb1.checked) ? '1' : '0');
				mxEvent.consume(evt);
			});
			
			var span = document.createElement('span');
			span.style.marginLeft = '4px';
			span.style.lineHeight = '22px';
			mxUtils.write(span, 'Glass'); //mxResources.get('glass'));
			
			mxEvent.addListener(span, 'click', function(evt)
			{
				cb1.checked = !cb1.checked;
				graph.setCellStyles(mxConstants.STYLE_GLASS, (cb1.checked) ? '1' : '0');
				mxEvent.consume(evt);
			});
			
			div.appendChild(span);

			return div;
		})(clone.cloneNode(true)));
	}
	
	this.container.appendChild((function(div)
	{
		var btn = mxUtils.button(mxResources.get('turn'), function(evt)
		{
			ui.actions.get('turn').funct();
		})
		
		btn.style.height = '24px';
		btn.style.backgroundRepeat = 'no-repeat';
		btn.style.backgroundPosition = '50% 50%';
		btn.style.marginRight = '8px';
		btn.className = 'geColorBtn';
		
		var valueInput = document.createElement('input');
		valueInput.setAttribute('type', 'number');
		valueInput.setAttribute('min', '0');
		valueInput.setAttribute('max', '360');
		valueInput.style.textAlign = 'right';
		valueInput.style.width = '30px';
		valueInput.style.marginLeft = '8px';
		valueInput.value = mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION, '0');
		
		mxEvent.addListener(valueInput, 'change', function(evt)
		{
			graph.setCellStyles(mxConstants.STYLE_ROTATION, parseInt(valueInput.value));
			mxEvent.consume(evt);
		});

		var span = document.createElement('span');
		span.style.lineHeight = '30px';
		span.style.marginLeft = '20px';
		span.appendChild(btn);
		mxUtils.write(span, mxResources.get('rotation'));
		span.appendChild(valueInput);
		div.appendChild(span);

		return div;
	})(clone.cloneNode(true)));
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel = function(editorUi, container)
{
	BaseFormatPanel.call(this, editorUi, container);
	this.init();
};

mxUtils.extend(DiagramFormatPanel, BaseFormatPanel);

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;

	var clone = this.container.cloneNode(true);
	clone.style.paddingTop = '4px';
	clone.style.paddingBottom = '12px';
	clone.style.paddingLeft = '14px';
	
	this.container.style.borderBottom = 'none';
	
	var options = clone.cloneNode(true);
	options.style.fontWeight = 'normal';
	
	var span = document.createElement('div');
	span.style.marginBottom = '10px';
	span.style.marginTop = '10px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, mxResources.get('options'));
	options.appendChild(span);

	this.container.appendChild((mxUtils.bind(this, function(div)
	{
		var cb = document.createElement('input');
		cb.setAttribute('type', 'checkbox');
		cb.style.margin = '0px';
		
		if (graph.isGridEnabled())
		{
			cb.setAttribute('checked', 'checked');
			cb.defaultChecked = true;	
		}
		
		this.gridEnabledListener = function()
		{
			cb.checked = graph.isGridEnabled();
			span2.style.display = (cb.checked) ? '' : 'none';
		};

		ui.addListener('gridEnabledChanged', this.gridEnabledListener);

		var span2 = document.createElement('span');
		span2.style.position = 'absolute';
		span2.style.right = '20px';
		span2.style.marginTop = '-4px';
		mxUtils.write(span2, mxResources.get('size') + ':');
		span2.style.display = (cb.checked) ? '' : 'none';
		
		var gridSizeInput = document.createElement('input');
		gridSizeInput.setAttribute('type', 'number');
		gridSizeInput.setAttribute('min', '0');
		gridSizeInput.style.width = '40px';
		gridSizeInput.style.marginLeft = '8px';
		gridSizeInput.value = graph.getGridSize();

		span2.appendChild(gridSizeInput);
		
		mxEvent.addListener(gridSizeInput, 'change', function(evt)
		{
			gridSizeInput.value = parseInt(gridSizeInput.value) || 0;
			graph.setGridSize(parseInt(gridSizeInput.value));
			mxEvent.consume(evt);
		});

		var span = document.createElement('div');
		span.style.height = '24px';
		cb.style.margin = '0px';
		cb.style.marginRight = '6px';
		span.appendChild(cb);
		mxUtils.write(span, mxResources.get('grid'));
		
		mxEvent.addListener(span, 'click', function(evt)
		{
			if (mxEvent.getSource(evt) != gridSizeInput)
			{
				ui.actions.get('grid').funct();
				mxEvent.consume(evt);
			}
		});
		
		span.appendChild(span2);
		div.appendChild(span);
		
		return div;
	}))(options));

	// Guides
	// TODO: Handle pageViewChanged event
	this.addOption(options, mxResources.get('guides'), function()
	{
		return graph.graphHandler.guidesEnabled;
	}, function(checked)
	{
		ui.actions.get('guides').funct();
	});

	// Connection points
	this.addOption(options, mxResources.get('connectionPoints'), function()
	{
		return graph.connectionHandler.isEnabled();
	}, function(checked)
	{
		graph.setConnectable(checked);
	});

	// Copy connect
	this.addOption(options, mxResources.get('copyConnect'), function()
	{
		return graph.connectionHandler.isCreateTarget();
	}, function(checked)
	{
		graph.connectionHandler.setCreateTarget(checked);
	});
	
	// Navigation
	this.addOption(options, mxResources.get('navigation'), function()
	{
		return graph.foldingEnabled;
	}, function(checked)
	{
		graph.foldingEnabled = checked;
		graph.view.revalidate();
	});
	
	var options = clone.cloneNode(true);
	options.style.fontWeight = 'normal';
	
	var span = document.createElement('div');
	span.style.marginBottom = '10px';
	span.style.marginTop = '10px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, mxResources.get('documentProperties'));
	options.appendChild(span);
	
	this.container.appendChild(options);

	// Page view
	// TODO: Handle pageViewChanged event
	this.addOption(options, mxResources.get('pageView'), function()
	{
		return graph.pageVisible;
	}, function(checked)
	{
		ui.actions.get('pageView').funct();
	});
	
	this.addColorOption(options, mxResources.get('background'), function()
	{
		return graph.background;
	}, function(color)
	{
		ui.setBackgroundColor(color);
	}, '#ffffff');
	
	if (typeof(MathJax) !== 'undefined')
	{
		this.addOption(options, mxResources.get('mathematicalTypesetting'), function()
		{
			return graph.mathEnabled;
		}, function(checked)
		{
			ui.setMathEnabled(checked);
		});
	}

	//if (file != null && file.isAutosaveOptional())
	this.addOption(options, mxResources.get('autosave'), function()
	{
		return ui.editor.autosave;
	}, function(checked)
	{
		ui.editor.autosave = checked;
	});
	
	var options = clone.cloneNode(true);
	options.style.fontWeight = 'normal';
	
	var span = document.createElement('div');
	span.style.marginBottom = '10px';
	span.style.marginTop = '10px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, mxResources.get('paperSize'));
	options.appendChild(span);
	
	this.container.appendChild(options);
	
	var portraitCheckBox = document.createElement('input');
	portraitCheckBox.setAttribute('name', 'format');
	portraitCheckBox.setAttribute('type', 'radio');
	portraitCheckBox.setAttribute('value', 'portrait');
	
	var landscapeCheckBox = document.createElement('input');
	landscapeCheckBox.setAttribute('name', 'format');
	landscapeCheckBox.setAttribute('type', 'radio');
	landscapeCheckBox.setAttribute('value', 'landscape');
	
	var paperSizeSelect = document.createElement('select');
	paperSizeSelect.style.marginBottom = '6px';
	paperSizeSelect.style.width = '206px';

	var formatDiv = document.createElement('div');
	formatDiv.style.marginLeft = '4px';
	formatDiv.style.width = '210px';
	formatDiv.style.height = '24px';

	portraitCheckBox.style.marginRight = '6px';
	formatDiv.appendChild(portraitCheckBox);
	
	var span = document.createElement('span');
	mxUtils.write(span, mxResources.get('portrait'));
	formatDiv.appendChild(span);
	
	mxEvent.addListener(span, 'click', function(evt)
	{
		portraitCheckBox.checked = true;
		mxEvent.consume(evt);
	});
	
	landscapeCheckBox.style.marginLeft = '10px';
	landscapeCheckBox.style.marginRight = '6px';
	formatDiv.appendChild(landscapeCheckBox);
	
	var span = document.createElement('span');
	mxUtils.write(span, mxResources.get('landscape'));
	formatDiv.appendChild(span)
	
	mxEvent.addListener(span, 'click', function(evt)
	{
		landscapeCheckBox.checked = true;
		mxEvent.consume(evt);
	});
	
	var customDiv = document.createElement('div');
	customDiv.style.marginLeft = '4px';
	customDiv.style.width = '210px';
	customDiv.style.height = '24px';
	
	var widthInput = document.createElement('input');
	widthInput.setAttribute('size', '6');
	widthInput.setAttribute('value', graph.pageFormat.width);
	customDiv.appendChild(widthInput);
	mxUtils.write(customDiv, ' x ');
	
	var heightInput = document.createElement('input');
	heightInput.setAttribute('size', '6');
	heightInput.setAttribute('value', graph.pageFormat.height);
	customDiv.appendChild(heightInput);
	mxUtils.write(customDiv, ' Pixel');

	formatDiv.style.display = 'none';
	customDiv.style.display = 'none';
	
	var detected = false;
	var pf = new Object();
	var formats = PageSetupDialog.getFormats();

	for (var i = 0; i < formats.length; i++)
	{
		var f = formats[i];
		pf[f.key] = f;

		var paperSizeOption = document.createElement('option');
		paperSizeOption.setAttribute('value', f.key);
		mxUtils.write(paperSizeOption, f.title);
		paperSizeSelect.appendChild(paperSizeOption);
		
		if (f.format != null)
		{
			if (graph.pageFormat.width == f.format.width && graph.pageFormat.height == f.format.height)
			{
				paperSizeOption.setAttribute('selected', 'selected');
				portraitCheckBox.setAttribute('checked', 'checked');
				portraitCheckBox.defaultChecked = true;
				formatDiv.style.display = '';
				detected = true;
			}
			else if (graph.pageFormat.width == f.format.height && graph.pageFormat.height == f.format.width)
			{
				paperSizeOption.setAttribute('selected', 'selected');
				landscapeCheckBox.setAttribute('checked', 'checked');
				portraitCheckBox.defaultChecked = true;
				formatDiv.style.display = '';
				detected = true;
			}
		}
		// Selects custom format which is last in list
		else if (!detected)
		{
			paperSizeOption.setAttribute('selected', 'selected');
			customDiv.style.display = '';
		}
	}

	options.appendChild(paperSizeSelect);
	mxUtils.br(options);

	options.appendChild(formatDiv);
	options.appendChild(customDiv);
	
	var updateInputs = function()
	{
		var f = pf[paperSizeSelect.value];
		
		if (f.format != null)
		{
			widthInput.value = f.format.width;
			heightInput.value = f.format.height;
			customDiv.style.display = 'none';
			formatDiv.style.display = '';
		}
		else
		{
			formatDiv.style.display = 'none';
			customDiv.style.display = '';
		}
	};
	
	mxEvent.addListener(paperSizeSelect, 'change', updateInputs);
	updateInputs();
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.destroy = function()
{
	if (this.gridEnabledListener)
	{
		this.editorUi.removeListener(this.gridEnabledListener);
		this.gridEnabledListener = null;
	}
};
