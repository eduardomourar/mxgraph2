/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * ** DO NOT USE IN PRODUCTION! **
 */

// TODO: Test UI with long labels
/*mxResources.get = function()
{
	return '01234567890123456789012345678901234567890123456789';
};*/

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
	var graph = ui.editor.graph;

	// TODO: To draw.io
	// TODO: Attention for updates during realtime, refresh needs to go
	//if (ui.getCurrentFile() != null)
	{
		if (graph.isSelectionEmpty())
		{
			var div = document.createElement('div');
			div.style.borderBottom = '1px solid #c0c0c0';
			div.style.whiteSpace = 'nowrap';
			div.style.height = '28px';
			div.style.fontSize = '12px';
			div.style.color = 'rgb(112, 112, 112)';
			div.style.fontWeight = 'bold';
			div.style.textAlign = 'center';
			div.style.marginTop = '8px';
			mxUtils.write(div, mxResources.get('diagram'));
			this.container.appendChild(div);
			
			var div = div.cloneNode(false);
			div.style.textAlign = 'left';
			div.style.fontWeight = 'normal';
			div.style.height = 'auto';
			this.container.appendChild(div);
			
			this.panels.push(new DiagramFormatPanel(ui, div));
			// TODO: Remove all listeners in destroy of panel
		}
		else
		{
			// TODO: Show style section only if width/height >= 2
			var div = document.createElement('div');
			div.style.borderBottom = '1px solid #c0c0c0';
			div.style.whiteSpace = 'nowrap';
			div.style.height = '28px';
			div.style.fontSize = '12px';
			div.style.color = 'rgb(112, 112, 112)';
			div.style.fontWeight = 'bold';
			div.style.textAlign = 'center';
			div.style.marginTop = '8px';
			mxUtils.write(div, mxResources.get('style'));
			this.container.appendChild(div);
			
			div = div.cloneNode(false);
			div.style.textAlign = 'left';
			div.style.fontWeight = 'normal';
			div.style.height = 'auto';
			
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
	this.listeners = [];
};

/**
 * Adds the given option.
 */
BaseFormatPanel.prototype.addOption = function addOption(parent, label, isCheckedFn, setCheckedFn, listener)
{
	var cb = document.createElement('input');
	cb.setAttribute('type', 'checkbox');
	cb.style.margin = '0px';
	cb.style.marginRight = '6px';
	
	var applying = false;
	var value = isCheckedFn();
	
	var apply = function(newValue)
	{
		if (!applying)
		{
			applying = true;
			
			if (newValue)
			{
				cb.setAttribute('checked', 'checked');
				cb.defaultChecked = true;
				cb.checked = true;
			}
			else
			{
				cb.removeAttribute('checked');
				cb.defaultChecked = false;
				cb.checked = false;
			}
			
			if (value != newValue)
			{
				value = newValue;
				
				// Checks if the color value needs to be updated in the model
				if (isCheckedFn() != value)
				{
					setCheckedFn(value);
				}
			}
			
			applying = false;
		}
	};

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
		
		apply(cb.checked);
	});
	
	parent.appendChild(span);
	apply(value);
	
	if (listener != null)
	{
		listener.install(apply);
		this.listeners.push(listener);
	}
	
	return span;
};

/**
 * Adds the given color option.
 */
BaseFormatPanel.prototype.addColorOption = function(parent, label, getColorFn, setColorFn, defaultColor, listener, callbackFn)
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
	
	var applying = false;
	var value = getColorFn();

	var apply = function(color)
	{
		if (!applying)
		{
			applying = true;
			btn.innerHTML = '<div style="width:36px;height:12px;margin:3px;border:1px solid black;background-color:' +
				((color != null && color != mxConstants.NONE) ? color : defaultColor) + ';"></div>';
			
			// Fine-tuning in Firefox, quirks mode and IE8 standards
			if (mxClient.IS_MT || mxClient.IS_QUIRKS || document.documentMode == 8)
			{
				btn.firstChild.style.margin = '0px';
			}
			
			if (color != null && color != mxConstants.NONE)
			{
				cb.setAttribute('checked', 'checked');
				cb.defaultChecked = true;
				cb.checked = true;
			}
			else
			{
				cb.removeAttribute('checked');
				cb.defaultChecked = false;
				cb.checked = false;
			}
	
			btn.style.display = (cb.checked) ? '' : 'none';

			if (callbackFn != null)
			{
				callbackFn(color);
			}
			
			if (value != color)
			{
				value = color;
				
				// Checks if the color value needs to be updated in the model
				if (getColorFn() != value)
				{
					setColorFn(value);
				}
			}
			
			applying = false;
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
	btn.style.marginTop = '-4px';
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

		// Overrides default value with current value to make it easier
		// to restore previous value if the checkbox is clicked twice
		if (!cb.checked && value != null && value != mxConstants.NONE &&
			defaultColor != mxConstants.NONE)
		{
			defaultColor = value;
		}
		
		apply((cb.checked) ? defaultColor : mxConstants.NONE);
	});
	
	apply(value);
	
	if (listener != null)
	{
		listener.install(apply);
		this.listeners.push(listener);
	}
	
	return span;
};

/**
 * 
 */
BaseFormatPanel.prototype.addCellColorOption = function(parent, label, colorKey, defaultColor, callbackFn)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	return this.addColorOption(parent, label, function()
	{
		return mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, colorKey, null);
	}, function(color)
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(colorKey, color, graph.getSelectionCells());
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [colorKey],
				'values', [color], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}, defaultColor || mxConstants.NONE,
	{
		install: function(apply)
		{
			this.listener = function()
			{
				apply(mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, colorKey, null));
			};
			
			graph.getModel().addListener(mxEvent.CHANGE, this.listener);
		},
		destroy: function()
		{
			graph.getModel().removeListener(this.listener);
		}
	}, callbackFn);
};

/**
 * 
 */
BaseFormatPanel.prototype.addCellOption = function(parent, label, key, defaultValue)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	return this.addOption(parent, label, function()
	{
		return mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, key, defaultValue) != '0';
	}, function(checked)
	{
		graph.getModel().beginUpdate();
		try
		{
			var value = (checked) ? '1' : '0';
			graph.setCellStyles(key, value, graph.getSelectionCells());
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [key],
				'values', [value], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	},
	{
		install: function(apply)
		{
			this.listener = function()
			{
				apply(mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, key, defaultValue) != '0');
			};
			
			graph.getModel().addListener(mxEvent.CHANGE, this.listener);
		},
		destroy: function()
		{
			graph.getModel().removeListener(this.listener);
		}
	});
};

/**
 * 
 */
BaseFormatPanel.prototype.addUnitInput = function(container, unit, right, width)
{
	var input = document.createElement('input');
	input.style.position = 'absolute';
	input.style.textAlign = 'right';
	input.style.paddingRight = '12px';
	input.style.marginTop = '-2px';
	input.style.right = right + 'px';
	input.style.width = width + 'px';

	container.appendChild(input);
	
	var span = document.createElement('span');
	span.style.position = 'absolute';
	span.style.fontWeight = 'normal';
	span.style.fontSize = '11px';
	span.style.fontColor = '#000';
	span.style.marginTop = '2px';
	span.style.right = (right + 4) + 'px';
	mxUtils.write(span, unit);
	
	container.appendChild(span);
	
	return input;
}

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
	clone.style.paddingBottom = '10px';
	clone.style.paddingLeft = '18px';
	clone.style.fontWeight = 'normal';
	
	this.container.style.borderBottom = 'none';
	
	this.container.appendChild(this.addStyles(clone.cloneNode(true)));

	var panel = clone.cloneNode(true);
	panel.style.paddingBottom = '2px';
	
	if (graph.getModel().isVertex(graph.getSelectionCell()) || shape == 'arrow')
	{
		this.container.appendChild(this.addFill(panel.cloneNode(true)));
	}
	
	this.container.appendChild(this.addStroke(panel.cloneNode(true)));
	this.container.appendChild(this.addOpacity(panel.cloneNode(true)));
	this.container.appendChild(this.addEffects(clone.cloneNode(true)));

	// TODO: Move to arrange
	/*this.container.appendChild((function(div)
	{
		var btn = mxUtils.button(mxResources.get('turn'), function(evt)
		{
			ui.actions.get('turn').funct();
		})
		
		btn.setAttribute('title', 'Ctrl+R');
		btn.style.marginRight = '8px';
		
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
		span.appendChild(btn);
		mxUtils.write(span, mxResources.get('rotation'));
		span.appendChild(valueInput);
		div.appendChild(span);

		return div;
	})(clone.cloneNode(true)));*/
	
	// TODO: To draw.io
	this.container.appendChild((function(div)
	{
		div.style.paddingBottom = '12px';
		
		var btn = mxUtils.button(mxResources.get('copyStyle'), function(evt)
		{
			ui.actions.get('copyStyle').funct();
		})
		
		btn.setAttribute('title', 'Ctrl+Shift+C');
		btn.style.width = '100px';
		btn.style.marginRight = '6px';
		
		div.appendChild(btn);
		
		var btn = mxUtils.button(mxResources.get('pasteStyle'), function(evt)
		{
			ui.actions.get('pasteStyle').funct();
		})
		
		btn.setAttribute('title', 'Ctrl+Shift+V');
		btn.style.width = '100px';
		
		div.appendChild(btn);

		return div;
	})(clone.cloneNode(true)));
	
	// TODO: To draw.io
	this.container.appendChild((function(div)
	{
		div.style.paddingBottom = '12px';

		var btn = mxUtils.button(mxResources.get('setAsDefaultStyle'), function(evt)
		{
			ui.actions.get('setAsDefaultStyle').funct();
		})
		
		btn.setAttribute('title', 'Ctrl+Shift+D');
		btn.style.width = '206px';
		div.appendChild(btn);

		return div;
	})(clone.cloneNode(true)));
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.addStyles = function(div)
{
	var graph = this.editorUi.editor.graph;
	
	var stylenames = ['gray', 'blue', 'green', 'turquoise', 'yellow', 'red', 'purple', null];
	div.style.paddingBottom = '4px';
	
	function addButton(stylename)
	{
		var tmp = (stylename != null) ? graph.stylesheet.styles[stylename] : null;
		
		var btn = mxUtils.button('', function(evt)
		{
			graph.getModel().beginUpdate();
			try
			{
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
						// style so that they are added behind the stylename if changed.
						// This is required so that the style does not override keys that
						// appear earlier in the style since they are modified in-place.
						for (var key in tmp)
						{
							style = mxUtils.setStyle(style, key, null);
						}
						
						style = mxUtils.addStylename(style, stylename);
					}
					else
					{
						style = mxUtils.setStyle(style, mxConstants.STYLE_FILLCOLOR, '#ffffff');
						style = mxUtils.setStyle(style, mxConstants.STYLE_STROKECOLOR, '#000000');
						style = mxUtils.setStyle(style, mxConstants.STYLE_GRADIENTCOLOR, null);
					}
					
					graph.getModel().setStyle(cells[i], style);
				}
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		})

		btn.style.width = '42px';
		btn.style.height = '30px';
		btn.style.margin = '1px 10px 10px 0px';
		
		mxUtils.setPrefixedStyle(btn.style, 'boxShadow', '2px 2px 2px 0px #bbb');

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
			btn.style.border = '1px solid gray';
		}
		
		div.appendChild(btn);
	};
	
	for (var i = 0; i < stylenames.length; i++)
	{
		if (i > 0 && mxUtils.mod(i, 4) == 0)
		{
			mxUtils.br(div);
		}
		
		addButton(stylenames[i]);
	}
	
	return div;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.addFill = function(container)
{
	var graph = this.editorUi.editor.graph;
	var state = graph.view.getState(graph.getSelectionCell());
	
	var colorPanel = document.createElement('div');
	colorPanel.style.fontWeight = 'bold';
	var gradientPanel = colorPanel.cloneNode(true);
	gradientPanel.style.fontWeight = 'normal';
	
	// Adds gradient direction option
	var gradientSelect = document.createElement('select');
	gradientSelect.style.position = 'absolute';
	gradientSelect.style.marginTop = '-2px';
	gradientSelect.style.right = '78px';
	gradientSelect.style.width = '62px';
	
	this.addCellColorOption(gradientPanel, 'Verlauf'/*TODO*/,
		mxConstants.STYLE_GRADIENTCOLOR, '#ffffff', function(color)
		{
			if (color == null || color == mxConstants.NONE)
			{
				gradientSelect.style.display = 'none';
			}
			else
			{
				gradientSelect.style.display = '';
			}
		});
	
	this.addCellColorOption(colorPanel, 'Füllen'/*TODO*/,
		mxConstants.STYLE_FILLCOLOR, '#ffffff', function(color)
		{
			if (color == null || color == mxConstants.NONE)
			{
				gradientPanel.style.display = 'none';
			}
			else
			{
				gradientPanel.style.display = '';
			}
		});

	var directions = [mxConstants.DIRECTION_NORTH, mxConstants.DIRECTION_EAST,
	                  mxConstants.DIRECTION_SOUTH, mxConstants.DIRECTION_WEST];
	var current = mxUtils.getValue(state.style, mxConstants.STYLE_GRADIENT_DIRECTION, mxConstants.DIRECTION_SOUTH);

	for (var i = 0; i < directions.length; i++)
	{
		var gradientOption = document.createElement('option');
		gradientOption.setAttribute('value', directions[i]);
		mxUtils.write(gradientOption, mxResources.get(directions[i]));
		gradientSelect.appendChild(gradientOption);
		
		if (directions[i] == current)
		{
			gradientOption.setAttribute('selected', 'selected');
		}
	}
	
	gradientPanel.appendChild(gradientSelect);
	
	var listener = function()
	{
		gradientSelect.value = mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style,
			mxConstants.STYLE_GRADIENT_DIRECTION, mxConstants.DIRECTION_SOUTH)
	};
	
	graph.getModel().addListener(mxEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});

	mxEvent.addListener(gradientSelect, 'change', function(evt)
	{
		graph.setCellStyles(mxConstants.STYLE_GRADIENT_DIRECTION, gradientSelect.value, graph.getSelectionCells());
		mxEvent.consume(evt);
	});
	
	container.appendChild(colorPanel);
	container.appendChild(gradientPanel);
	
	var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
	
	if (shape == 'swimlane')
	{
		var swimlanePanel = colorPanel.cloneNode(true);
		swimlanePanel.style.fontWeight = 'bold';
		
		container.appendChild(this.addCellColorOption(swimlanePanel, 'Innenfarbe'/*TODO*/,
			'swimlaneFillColor', '#ffffff'));
	}

	return container;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.addStroke = function(container)
{
	var graph = this.editorUi.editor.graph;
	
	var colorPanel = document.createElement('div');
	colorPanel.style.fontWeight = 'bold';

	// TODO: Add dashed, edge style, markers etc
	var stylePanel = colorPanel.cloneNode(true);
	stylePanel.style.fontWeight = 'normal';

	var input = document.createElement('input');
	input.setAttribute('type', 'number');
	input.setAttribute('min', '1');
	input.style.position = 'absolute';
	input.style.textAlign = 'right';
	input.style.paddingRight = '12px';
	input.style.marginTop = '-2px';
	input.style.right = '78px';
	input.style.width = '46px';

	colorPanel.appendChild(input);
	
	var unit = document.createElement('span');
	unit.style.position = 'absolute';
	unit.style.fontWeight = 'normal';
	unit.style.fontSize = '11px';
	unit.style.fontColor = '#000';
	unit.style.marginTop = '2px';
	unit.style.right = '82px';
	mxUtils.write(unit, 'pt');
	colorPanel.appendChild(unit);

	this.addCellColorOption(colorPanel, 'Linie'/*TODO*/,
		mxConstants.STYLE_STROKECOLOR, '#000000', function(color)
		{
			if (color == null || color == mxConstants.NONE)
			{
				stylePanel.style.display = 'none';
			}
			else
			{
				stylePanel.style.display = '';
			}
			
			input.style.display = stylePanel.style.display;
			unit.style.display = stylePanel.style.display;
		});

	var listener = function()
	{
		input.value = mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style,
			mxConstants.STYLE_STROKEWIDTH, 1);
	};
	
	graph.getModel().addListener(mxEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();

	mxEvent.addListener(input, 'keydown', function(e)
	{
		if (e.keyCode == 13)
		{
			graph.container.focus();
			mxEvent.consume(e);
		}
		else if (e.keyCode == 27)
		{
			listener();
			graph.container.focus();
			mxEvent.consume(e);
		}
	});

	function update(evt)
	{
		var value = parseInt(input.value);
		value = Math.max(1, (isNaN(value)) ? 1 : value);
		
		if (value != mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style,
			mxConstants.STYLE_STROKEWIDTH, 1))
		{
			graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, value, graph.getSelectionCells());
			input.value = value;
		}
		
		mxEvent.consume(evt);
	};

	mxEvent.addListener(input, 'blur', update);
	mxEvent.addListener(input, 'click', update);
	
	container.appendChild(colorPanel);
	container.appendChild(stylePanel);

	return container;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.addOpacity = function(container)
{
	var graph = this.editorUi.editor.graph;

	container.style.paddingLeft = '18px';
	container.style.paddingBottom = '12px';
	container.style.fontWeight = 'bold';
	
	mxUtils.write(container, mxResources.get('opacity'));
	
	var input = this.addUnitInput(container, '%', 20, 40);
	
	input.setAttribute('type', 'number');
	input.setAttribute('min', '0');
	input.setAttribute('max', '100');
	input.setAttribute('step', '10');

	var listener = function()
	{
		input.value = mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style,
				mxConstants.STYLE_OPACITY, 100);
	};
	
	mxEvent.addListener(input, 'keydown', function(e)
	{
		if (e.keyCode == 13)
		{
			graph.container.focus();
			mxEvent.consume(e);
		}
		else if (e.keyCode == 27)
		{
			listener();
			graph.container.focus();
			mxEvent.consume(e);
		}
	});
	
	graph.getModel().addListener(mxEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();
	
	function update(evt)
	{
		var value = parseInt(input.value);
		value = Math.min(100, Math.max(0, (isNaN(value)) ? 100 : value));
		
		if (value != mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style,
			mxConstants.STYLE_OPACITY, 100))
		{
			graph.setCellStyles(mxConstants.STYLE_OPACITY, value, graph.getSelectionCells());
			input.value = value;
		}
		
		mxEvent.consume(evt);
	};

	mxEvent.addListener(input, 'blur', update);
	mxEvent.addListener(input, 'click', update);

	return container;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.addEffects = function(container)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var state = graph.view.getState(graph.getSelectionCell());
	
	container.style.paddingBottom = '8px';
	
	var span = document.createElement('div');
	span.style.marginBottom = '12px';
	span.style.marginTop = '4px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, 'Effekte'/*TODO*/);
	container.appendChild(span);

	var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
	
	if (shape == 'connector' || shape == 'label' || shape == 'rectangle' || shape == 'internalStorage' ||
		shape == 'parallelogram' || shape == 'swimlane' || shape == 'step' || shape == 'trapezoid' ||
		shape == 'ext' || shape == 'triangle' || shape == 'hexagon' || shape == 'process' ||
		shape == 'rhombus' || shape == 'offPageConnector' || shape == 'loopLimit' ||
		shape == 'manualInput')
	{
		this.addCellOption(container, mxResources.get('rounded'), mxConstants.STYLE_ROUNDED, 0);
	}

	if (shape == 'swimlane')
	{
		this.addCellOption(container, 'Trennstrich'/*TODO*/, 'swimlaneLine', 1);
	}
	
	this.addCellOption(container, mxResources.get('shadow'), mxConstants.STYLE_SHADOW, 0);

	// TODO: Add list of glass-compatible shapes
	if (shape == 'label' || shape == 'rectangle' || shape == 'internalStorage' ||
		shape == 'ext' || shape == 'swimlane')
	{
		this.addCellOption(container, 'Glas'/*TODO*/, mxConstants.STYLE_GLASS, 0);
	}

	return container;
}

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.destroy = function()
{
	if (this.listeners != null)
	{
		for (var i = 0; i < this.listeners.length; i++)
		{
			this.listeners[i].destroy();
		}
		
		this.listeners = null;
	}
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
	clone.style.paddingBottom = '10px';
	clone.style.paddingLeft = '14px';
	clone.style.fontWeight = 'normal';
	this.container.style.borderBottom = 'none';
	
	this.container.appendChild(this.addOptions(clone.cloneNode(true)));
	this.container.appendChild(this.addDocumentProperties(clone.cloneNode(true)));
	this.container.appendChild(this.addPaperSize(clone.cloneNode(true)));
	
	// TODO: To draw.io
	this.container.appendChild((function(div)
	{
		div.style.paddingBottom = '12px';

		var btn = mxUtils.button(mxResources.get('clearDefaultStyle'), function(evt)
		{
			ui.actions.get('clearDefaultStyle').funct();
		})
		
		btn.setAttribute('title', 'Ctrl+Shift+R');
		btn.style.width = '206px';
		div.appendChild(btn);

		return div;
	})(clone.cloneNode(true)));
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.addOptions = function(container)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	var span = document.createElement('div');
	span.style.marginBottom = '12px';
	span.style.marginTop = '4px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, mxResources.get('options'));
	container.appendChild(span);
	
	this.addGridOption(container);

	/*mxUtils.bind(this, function(div)
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
		span2.style.marginTop = '-3px';
		mxUtils.write(span2, mxResources.get('size'));
		span2.style.display = (cb.checked) ? '' : 'none';
		
		var gridSizeInput = document.createElement('input');
		gridSizeInput.setAttribute('type', 'number');
		gridSizeInput.setAttribute('min', '0');
		gridSizeInput.style.width = '40px';
		gridSizeInput.style.marginLeft = '6px';
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
	})(container);*/

	// Guides
	this.addOption(container, mxResources.get('guides'), function()
	{
		return graph.graphHandler.guidesEnabled;
	}, function(checked)
	{
		ui.actions.get('guides').funct();
	},
	{
		install: function(apply)
		{
			this.listener = function()
			{
				apply(graph.graphHandler.guidesEnabled);
			};
			
			ui.addListener('guidesEnabledChanged', this.listener);
		},
		destroy: function()
		{
			ui.removeListener(this.listener);
		}
	});

	// Connection points
	this.addOption(container, mxResources.get('connectionPoints'), function()
	{
		return graph.connectionHandler.isEnabled();
	}, function(checked)
	{
		graph.setConnectable(checked);
	});

	// Copy connect
	this.addOption(container, mxResources.get('copyConnect'), function()
	{
		return graph.connectionHandler.isCreateTarget();
	}, function(checked)
	{
		graph.connectionHandler.setCreateTarget(checked);
	});
	
	// Navigation
	this.addOption(container, mxResources.get('navigation'), function()
	{
		return graph.foldingEnabled;
	}, function(checked)
	{
		graph.foldingEnabled = checked;
		graph.view.revalidate();
	});
	
	// Scrollbars
	this.addOption(container, mxResources.get('scrollbars'), function()
	{
		return ui.hasScrollbars();
	}, function(checked)
	{
		ui.setScrollbars(checked);
	},
	{
		install: function(apply)
		{
			this.listener = function()
			{
				apply(ui.hasScrollbars());
			};
			
			ui.addListener('scrollbarsChanged', this.listener);
		},
		destroy: function()
		{
			ui.removeListener(this.listener);
		}
	});
	
	return container;
};

/**
 * 
 */
DiagramFormatPanel.prototype.addGridOption = function(container)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;

	var input = document.createElement('input');
	input.setAttribute('type', 'number');
	input.setAttribute('min', '0');
	input.setAttribute('step', '5');
	input.style.position = 'absolute';
	input.style.textAlign = 'right';
	input.style.paddingRight = '12px';
	input.style.marginTop = '-2px';
	input.style.right = '20px';
	input.style.width = '46px';
	input.value = graph.getGridSize();
	
	mxEvent.addListener(input, 'keydown', function(e)
	{
		if (e.keyCode == 13)
		{
			graph.container.focus();
			mxEvent.consume(e);
		}
		else if (e.keyCode == 27)
		{
			input.value = graph.getGridSize();
			graph.container.focus();
			mxEvent.consume(e);
		}
	});
	
	container.appendChild(input);
	
	var unit = document.createElement('span');
	unit.style.position = 'absolute';
	unit.style.fontWeight = 'normal';
	unit.style.fontSize = '11px';
	unit.style.fontColor = '#000';
	unit.style.marginTop = '2px';
	unit.style.right = '24px';
	mxUtils.write(unit, 'pt');

	function update(evt)
	{
		var value = parseInt(input.value);
		value = Math.max(0, (isNaN(value)) ? 10 : value);
		
		if (value != graph.getGridSize())
		{
			graph.setGridSize(value)
			input.value = value;
		}
		
		mxEvent.consume(evt);
	};

	mxEvent.addListener(input, 'blur', update);
	mxEvent.addListener(input, 'click', update);
	
	container.appendChild(unit);
	
	this.addOption(container, mxResources.get('grid'), function()
	{
		return graph.isGridEnabled();
	}, function(checked)
	{
		graph.setGridEnabled(checked);
		ui.editor.updateGraphComponents();
		ui.fireEvent(new mxEventObject('gridEnabledChanged'));
	},
	{
		install: function(apply)
		{
			this.listener = function()
			{
				input.style.display = (graph.isGridEnabled()) ? '' : 'none';
				unit.style.display = input.style.display;
				
				apply(graph.isGridEnabled());
			};
			
			ui.addListener('gridEnabledChanged', this.listener);
		},
		destroy: function()
		{
			ui.removeListener(this.listener);
		}
	});
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.addDocumentProperties = function(container)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	var span = document.createElement('div');
	span.style.marginBottom = '12px';
	span.style.marginTop = '4px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, mxResources.get('documentProperties'));
	container.appendChild(span);

	// Page view
	// TODO: Handle pageViewChanged event
	this.addOption(container, mxResources.get('pageView'), function()
	{
		return graph.pageVisible;
	}, function(checked)
	{
		ui.actions.get('pageView').funct();
	});
	
	this.addColorOption(container, mxResources.get('background'), function()
	{
		return graph.background;
	}, function(color)
	{
		ui.setBackgroundColor(color);
	}, '#ffffff',
	{
		install: function(apply)
		{
			this.listener = function()
			{
				apply(graph.background);
			};
			
			ui.addListener('backgroundColorChanged', this.listener);
		},
		destroy: function()
		{
			ui.removeListener(this.listener);
		}
	});
	
	// Background image
	(function()
	{
		var changeImageLink = document.createElement('a');
		changeImageLink.style.textDecoration = 'underline';
		changeImageLink.style.cursor = 'pointer';
		changeImageLink.style.color = '#a0a0a0';
		changeImageLink.innerHTML = mxResources.get('backgroundImage') + '...';
		
		var defaultBgImage = graph.backgroundImage;
		
		var span = document.createElement('div');
		span.style.width = '210px';
		span.style.height = '24px';
		span.style.paddingLeft = '18px';
		span.style.whiteSpace = 'nowrap';
		span.style.overflow = 'hidden';
		span.appendChild(changeImageLink);
		
		container.appendChild(span);
	
		mxEvent.addListener(changeImageLink, 'click', function(evt)
		{
			var dlg = new BackgroundImageDialog(ui, function(image)
			{
				ui.setBackgroundImage(image);
			});
			ui.showDialog(dlg.container, 360, 200, true, true);
			dlg.init();
			
			mxEvent.consume(evt);
		});
	})();
	
	if (typeof(MathJax) !== 'undefined')
	{
		this.addOption(container, mxResources.get('mathematicalTypesetting'), function()
		{
			return graph.mathEnabled;
		}, function(checked)
		{
			ui.setMathEnabled(checked);
		},
		{
			install: function(apply)
			{
				this.listener = function()
				{
					apply(graph.mathEnabled);
				};
				
				ui.addListener('mathEnabledChanged', this.listener);
			},
			destroy: function()
			{
				ui.removeListener(this.listener);
			}
		});
	}

	// TODO: To draw.io if (file != null && file.isAutosaveOptional())
	this.addOption(container, mxResources.get('autosave'), function()
	{
		return ui.editor.autosave;
	}, function(checked)
	{
		ui.editor.autosave = checked;
	});
	
	return container;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.addPaperSize = function(container)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	var span = document.createElement('div');
	span.style.marginBottom = '12px';
	span.style.marginTop = '4px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, mxResources.get('paperSize'));
	container.appendChild(span);
	
	var portraitCheckBox = document.createElement('input');
	portraitCheckBox.setAttribute('name', 'format');
	portraitCheckBox.setAttribute('type', 'radio');
	portraitCheckBox.setAttribute('value', 'portrait');
	
	var landscapeCheckBox = document.createElement('input');
	landscapeCheckBox.setAttribute('name', 'format');
	landscapeCheckBox.setAttribute('type', 'radio');
	landscapeCheckBox.setAttribute('value', 'landscape');
	
	var paperSizeSelect = document.createElement('select');
	paperSizeSelect.style.marginBottom = '8px';
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

	container.appendChild(paperSizeSelect);
	mxUtils.br(container);

	container.appendChild(formatDiv);
	container.appendChild(customDiv);
	
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
	
	return container;
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
	
	if (this.listeners != null)
	{
		for (var i = 0; i < this.listeners.length; i++)
		{
			this.listeners[i].destroy();
		}
		
		this.listeners = null;
	}
};
