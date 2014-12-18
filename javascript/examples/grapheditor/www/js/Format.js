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
		this.refresh();
	});
	
	graph.getSelectionModel().addListener(mxEvent.CHANGE, this.update);
	this.refresh();
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Format.prototype.clear = function()
{
	this.container.innerHTML = '';
	
	// Destroy existing panels
	if (this.panels != null)
	{
		for (var i = 0; i < this.panels.length; i++)
		{
			this.panels[i].destroy();
		}
	}
	
	this.panels = [];
};

/**
 * Returns information about the current selection.
 */
Format.prototype.clearSelectionState = function()
{
	if (this.selectionState == null)
	{
		this.selectionState = this.createSelectionState();
	}
	
	return this.selectionState;
};

/**
 * Returns information about the current selection.
 */
Format.prototype.getSelectionState = function()
{
	if (this.selectionState == null)
	{
		this.selectionState = this.createSelectionState();
	}
	
	return this.selectionState;
};

/**
 * Returns information about the current selection.
 */
Format.prototype.createSelectionState = function()
{
	var graph = this.editorUi.editor.graph;
	var cells = graph.getSelectionCells();
	var result = new Object();

	// TODO: Compute information about the current selection
	for (var i = 0; i < cells.length; i++)
	{
		var state = graph.view.getState(cells[i]);
		
		if (state != null)
		{
			var tmp = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
			
			if (tmp != null)
			{
				if (result.shape == null)
				{
					shape = tmp;
				}
				else if (result.shape != tmp)
				{
					result.shape = null;
				}
			}
			
		}
	}
	
	return result;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Format.prototype.refresh = function()
{
	this.clear();
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	
	var div = document.createElement('div');
	div.style.whiteSpace = 'nowrap';
	div.style.fontSize = '12px';
	div.style.height = '35px';
	div.style.color = 'rgb(112, 112, 112)';
	div.style.fontWeight = 'bold';
	div.style.textAlign = 'center';
	div.style.cursor = 'default';
	
	if (graph.isSelectionEmpty())
	{
		var label = document.createElement('div');
		label.style.border = '1px solid #c0c0c0';
		label.style.borderBottomWidth = '1px';
		label.style.borderRightWidth = '0px';
		label.style.borderLeftWidth = '0px';
		label.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
		label.style.paddingTop = '8px';
		label.style.height = (mxClient.IS_QUIRKS) ? '100%' : '26px';
		label.style.width = '100%';
		mxUtils.write(label, mxResources.get('diagram'));
		div.appendChild(label);

		this.container.appendChild(div);
		
		div = div.cloneNode(false);
		div.style.borderBottom = '1px solid #c0c0c0';
		div.style.textAlign = 'left';
		div.style.marginTop = '8px';
		div.style.fontWeight = 'normal';
		div.style.height = 'auto';
		this.container.appendChild(div);
		
		this.panels.push(new DiagramFormatPanel(ui, div));
	}
	else
	{
		// TODO: Show style section only if width/height >= 2
		var label = document.createElement('div');
		label.style.border = '1px solid #c0c0c0';
		label.style.borderTopWidth = '0px';
		label.style.borderBottomWidth = '0px';
		label.style.borderRightWidth = '0px';
		label.style.borderLeftWidth = '0px';
		label.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
		label.style.paddingTop = '8px';
		label.style.height = (mxClient.IS_QUIRKS) ? '100%' : '26px';
		label.style.width = '33.3%';
		mxUtils.write(label, mxResources.get('style'));
		div.appendChild(label);
		
		var stylePanel = div.cloneNode(false);
		stylePanel.style.borderBottom = '1px solid #c0c0c0';
		stylePanel.style.textAlign = 'left';
		stylePanel.style.marginTop = '8px';
		stylePanel.style.fontWeight = 'normal';
		stylePanel.style.height = 'auto';
		
		var textPanel = stylePanel.cloneNode(false);
		var arrangePanel = textPanel.cloneNode(false);
		
		var currentLabel = label;
		var currentPanel = stylePanel;
		
		var addClickHandler = mxUtils.bind(this, function(elt, panel, index)
		{
			mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt)
			{
				if (currentLabel != elt)
				{
					this.currentIndex = index;
					currentLabel.style.backgroundColor = '#d7d7d7';
					currentLabel.style.borderBottomWidth = '1px';
	
					currentLabel = elt;
					currentLabel.style.backgroundColor = '';
					currentLabel.style.borderBottomWidth = '0px';
					
					if (currentPanel != panel)
					{
						currentPanel.style.display = 'none';
						currentPanel = panel;
						currentPanel.style.display = '';
					}
				}
			}));
			
			if (index == this.currentIndex)
			{
				elt.click();
			}
		});
		
		this.panels.push(new StyleFormatPanel(ui, stylePanel));
		
		var label2 = label.cloneNode(false);
		label2.style.backgroundColor = '#d7d7d7';
		label2.style.borderBottomWidth = '1px';
		label2.style.borderLeftWidth = '1px';
		mxUtils.write(label2, mxResources.get('text'));
		div.appendChild(label2);
		
		this.panels.push(new TextFormatPanel(ui, textPanel));
		textPanel.style.display = 'none';
		
		var label3 = label2.cloneNode(false);
		mxUtils.write(label3, mxResources.get('arrange'));
		div.appendChild(label3);
		
		this.panels.push(new ArrangePanel(ui, arrangePanel));
		arrangePanel.style.display = 'none';

		addClickHandler(label, stylePanel, 0);
		addClickHandler(label2, textPanel, 1);
		addClickHandler(label3, arrangePanel, 2);
		
		this.container.appendChild(div);
		this.container.appendChild(stylePanel);
		this.container.appendChild(textPanel);
		this.container.appendChild(arrangePanel);
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
 * Adds the given color option.
 */
BaseFormatPanel.prototype.getCurrentShape = function()
{
	var graph = this.editorUi.editor.graph;
	var cells = graph.getSelectionCells();
	var shape = null;

	for (var i = 0; i < cells.length; i++)
	{
		var state = graph.view.getState(cells[i]);
		
		if (state != null)
		{
			var tmp = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
			
			if (tmp != null)
			{
				if (shape == null)
				{
					shape = tmp;
				}
				else if (shape != tmp)
				{
					return null;
				}
			}
			
		}
	}
	
	return shape;
};

/**
 * Adds the given color option.
 */
BaseFormatPanel.prototype.getSelectionState = function()
{
	var graph = this.editorUi.editor.graph;
	var cells = graph.getSelectionCells();
	var shape = null;

	for (var i = 0; i < cells.length; i++)
	{
		var state = graph.view.getState(cells[i]);
		
		if (state != null)
		{
			var tmp = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
			
			if (tmp != null)
			{
				if (shape == null)
				{
					shape = tmp;
				}
				else if (shape != tmp)
				{
					return null;
				}
			}
			
		}
	}
	
	return shape;
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
	span.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
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
BaseFormatPanel.prototype.addArrow = function(elt, height)
{
	height = (height != null) ? height : 10;
	
	var arrow = document.createElement('div');
	arrow.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
	arrow.style.padding = '6px';
	arrow.style.paddingRight = '4px';
	
	var m = (10 - height);
	
	if (m > 0)
	{
		arrow.style.paddingTop = (6 - m) + 'px';
	}
	else
	{
		arrow.style.marginTop = '-2px';
	}
	
	arrow.style.height = height + 'px';
	arrow.style.borderLeft = '1px solid #a0a0a0';
	arrow.innerHTML = '<img border="0" src="' + IMAGE_PATH + '/dropdown.png" style="margin-bottom:4px;">';
	mxUtils.setOpacity(arrow, 70);
	
	var symbol = elt.getElementsByTagName('div')[0];
	
	if (symbol != null)
	{
		symbol.style.paddingRight = '6px';
		symbol.style.marginLeft = '4px';
		symbol.style.marginTop = '-1px';
		symbol.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
		mxUtils.setOpacity(symbol, 60);
	}

	mxUtils.setOpacity(elt, 100);
	elt.style.border = '1px solid #a0a0a0';
	elt.style.backgroundColor = 'white';
	elt.style.backgroundImage = 'none';
	elt.style.width = 'auto';
	elt.className += ' geColorBtn';
	mxUtils.setPrefixedStyle(elt.style, 'borderRadius', '3px');
	
	elt.appendChild(arrow);
	
	return symbol;
};

/**
 * The string 'null' means use null in values.
 */
BaseFormatPanel.prototype.addCellOption = function(parent, label, key, defaultValue, enabledValue, disabledValue)
{
	enabledValue = (enabledValue != null) ? ((enabledValue == 'null') ? null : enabledValue) : '1';
	disabledValue = (disabledValue != null) ? ((disabledValue == 'null') ? null : disabledValue) : '0';
	
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	return this.addOption(parent, label, function()
	{
		return mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, key, defaultValue) != disabledValue;
	}, function(checked)
	{
		graph.getModel().beginUpdate();
		try
		{
			var value = (checked) ? enabledValue : disabledValue;
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
				apply(mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, key, defaultValue) != disabledValue);
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
	//span.style.right = (right + 4) + 'px';
	span.style.right = (right + ((mxClient.IS_SF) ? 11 : 0) + 4) + 'px';
	mxUtils.write(span, unit);
	
	container.appendChild(span);
	
	return input;
};

/**
 * 
 */
BaseFormatPanel.prototype.addRelativeOption = function(container, label, key)
{
	var graph = this.editorUi.editor.graph;

	container.style.paddingLeft = '18px';
	container.style.paddingBottom = '12px';
	container.style.fontWeight = 'bold';
	
	mxUtils.write(container, label);
	
	var input = this.addUnitInput(container, '%', 20, 40);
	
	if (!mxClient.IS_QUIRKS && (document.documentMode == null || document.documentMode > 8))
	{
		input.setAttribute('type', 'number');
		input.setAttribute('min', '0');
		input.setAttribute('max', '100');
		input.setAttribute('step', '10');
	}

	var listener = function()
	{
		input.value = mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, key, 100);
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
		
		if (value != mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, key, 100))
		{
			graph.setCellStyles(key, value, graph.getSelectionCells());
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
BaseFormatPanel.prototype.destroy = function()
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
ArrangePanel = function(editorUi, container)
{
	BaseFormatPanel.call(this, editorUi, container);
	this.init();
};

mxUtils.extend(ArrangePanel, BaseFormatPanel);

/**
 * Adds the label menu items to the given menu and parent.
 */
ArrangePanel.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var state = graph.view.getState(graph.getSelectionCell());
	var shape = this.getCurrentShape();
	
	var clone = this.container.cloneNode(true);
	clone.style.display = 'block';
	clone.style.paddingTop = '4px';
	clone.style.paddingBottom = '10px';
	clone.style.paddingLeft = '18px';
	clone.style.fontWeight = 'normal';
	
	this.container.style.borderBottom = 'none';

	// TODO: Move to arrange
	this.container.appendChild((function(div)
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
	})(clone));
	
};

/**
 * Adds the label menu items to the given menu and parent.
 */
TextFormatPanel = function(editorUi, container)
{
	BaseFormatPanel.call(this, editorUi, container);
	this.init();
};

mxUtils.extend(TextFormatPanel, BaseFormatPanel);

/**
 * Adds the label menu items to the given menu and parent.
 */
TextFormatPanel.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var state = graph.view.getState(graph.getSelectionCell());
	var shape = this.getCurrentShape();
	
	var clone = this.container.cloneNode(true);
	clone.style.display = 'block';
	clone.style.whiteSpace = 'normal';
	clone.style.paddingTop = '4px';
	clone.style.paddingBottom = '10px';
	clone.style.fontWeight = 'normal';
	
	this.container.style.borderBottom = 'none';
	this.container.appendChild(this.addFont(clone));
};

/**
 * Adds the label menu items to the given menu and parent.
 */
TextFormatPanel.prototype.addFont = function(container)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var state = graph.view.getState(graph.getSelectionCell());
	
	var div = document.createElement('div');
	div.style.marginBottom = '8px';
	div.style.marginTop = '4px';
	div.style.paddingLeft = '18px';
	
	var stylePanel = div.cloneNode(false);
	stylePanel.style.borderBottom = '1px solid #c0c0c0';
	
	div.style.fontWeight = 'bold';
	mxUtils.write(div, 'Schrift'/*TODO*/);
	container.appendChild(div);

	var colorPanel = stylePanel.cloneNode(false);
	colorPanel.style.marginTop = '12px';
	colorPanel.style.marginBottom = '0px';
	
	stylePanel.style.position = 'relative';
	stylePanel.style.marginLeft = '-1px';
	stylePanel.style.marginTop = '4px';
	stylePanel.style.marginBottom = '8px';
	stylePanel.style.borderWidth = '0px';
	stylePanel.className = 'geToolbarContainer';
	
	if (mxClient.IS_QUIRKS)
	{
		stylePanel.style.display = 'block';
	}
	
	container.appendChild(stylePanel);
	
	var fontMenu = this.editorUi.toolbar.addMenu('Helvetica', mxResources.get('fontFamily'), true, 'fontFamily', stylePanel);
	fontMenu.style.color = 'rgb(112, 112, 112)';
	fontMenu.style.whiteSpace = 'nowrap';
	fontMenu.style.overflow = 'hidden';
	fontMenu.style.margin = '0px';
	
	this.addArrow(fontMenu);
	fontMenu.style.width = '191px';
	fontMenu.style.height = '15px';
	
	var stylePanel2 = stylePanel.cloneNode(false);
	stylePanel2.style.marginLeft = '-3px';
	var fontStyleItems = this.editorUi.toolbar.addItems(['bold', 'italic', 'underline'], stylePanel2, true);
	container.appendChild(stylePanel2);
	
	function style(elts)
	{
		for (var i = 0; i < elts.length; i++)
		{
			// FIXME: Style changes after container was made visible
			mxUtils.setPrefixedStyle(elts[i].style, 'borderRadius', '3px');
			mxUtils.setOpacity(elts[i], 100);
			elts[i].style.border = '1px solid #a0a0a0';
			elts[i].style.padding = '2px';
			elts[i].style.paddingLeft = '3px';
			elts[i].style.paddingRight = '1px';
			elts[i].style.width = '23px';
			elts[i].style.height = '21px';
			elts[i].className += ' geColorBtn';
		}
	};
	
	style(fontStyleItems);
	
	var stylePanel3 = stylePanel.cloneNode(false);
	stylePanel3.style.marginLeft = '-3px';
	
	var left = this.editorUi.toolbar.addButton('geSprite-left', mxResources.get('left'),
		this.editorUi.menus.createStyleChangeFunction([mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_LEFT]), stylePanel3);
	var center = this.editorUi.toolbar.addButton('geSprite-center', mxResources.get('center'),
		this.editorUi.menus.createStyleChangeFunction([mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_CENTER]), stylePanel3);
	var right = this.editorUi.toolbar.addButton('geSprite-right', mxResources.get('right'),
		this.editorUi.menus.createStyleChangeFunction([mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_RIGHT]), stylePanel3);
	right.style.marginRight = '8px';

	style([left, center, right]);
	container.appendChild(stylePanel3);
	
	var stylePanel4 = stylePanel.cloneNode(false);
	stylePanel4.style.marginLeft = '-3px';
	
	var top = this.editorUi.toolbar.addButton('geSprite-top', mxResources.get('top'),
		this.editorUi.menus.createStyleChangeFunction([mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_TOP]), stylePanel3);
	var middle = this.editorUi.toolbar.addButton('geSprite-middle', mxResources.get('middle'),
		this.editorUi.menus.createStyleChangeFunction([mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_MIDDLE]), stylePanel3);
	var bottom = this.editorUi.toolbar.addButton('geSprite-bottom', mxResources.get('bottom'),
		this.editorUi.menus.createStyleChangeFunction([mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_BOTTOM]), stylePanel3);
	
	style([top, middle, bottom]);
	container.appendChild(stylePanel4);
	
	// Stroke width
	var input = document.createElement('input');
	input.setAttribute('type', 'number');
	input.setAttribute('min', '1');
	input.style.position = 'absolute';
	input.style.textAlign = 'right';
	input.style.paddingRight = '12px';
	input.style.marginTop = '2px';
	input.style.right = '22px';
	input.style.width = '41px';
	input.style.height = '15px';

	stylePanel2.appendChild(input);
	
	var unit = document.createElement('span');
	unit.style.position = 'absolute';
	unit.style.fontWeight = 'normal';
	unit.style.fontSize = '11px';
	unit.style.fontColor = '#000';
	unit.style.right = (mxClient.IS_SF) ? '37px': '26px';
	unit.style.marginTop = '7px';
	mxUtils.write(unit, 'pt');
	stylePanel2.appendChild(unit);

	if (mxClient.IS_MT)
	{
		mxUtils.setPrefixedStyle(input.style, 'boxSizing', 'padding-box');
		input.style.width = '52px';
		unit.style.marginTop = '5px';
	}
	else
	{
		unit.style.marginTop = '7px';		
	}

	function update(evt)
	{
		// Maximum stroke width is 999
		var value = parseInt(input.value);
		value = Math.min(999, Math.max(1, (isNaN(value)) ? 1 : value));
		
		if (value != mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style,
			mxConstants.STYLE_FONTSIZE, 1))
		{
			graph.setCellStyles(mxConstants.STYLE_FONTSIZE, value, graph.getSelectionCells());
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_FONTSIZE],
					'values', [value], 'cells', graph.getSelectionCells()));
			input.value = value;
		}
		
		mxEvent.consume(evt);
	};

	mxEvent.addListener(input, 'blur', update);
	mxEvent.addListener(input, 'click', update);
	
	var arrow = fontMenu.getElementsByTagName('div')[0];
	arrow.style.cssFloat = 'right';

	this.addCellColorOption(colorPanel, mxResources.get('fontColor'),
			mxConstants.STYLE_FONTCOLOR, '#000000');
	
	this.addCellColorOption(colorPanel, mxResources.get('backgroundColor'),
			mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, '#ffffff');
	
	this.addCellColorOption(colorPanel, mxResources.get('borderColor'),
			mxConstants.STYLE_LABEL_BORDERCOLOR, '#000000');

	container.appendChild(colorPanel);
	container.appendChild(this.addRelativeOption(colorPanel.cloneNode(false), mxResources.get('opacity'), mxConstants.STYLE_TEXT_OPACITY));
	
	var extraPanel = colorPanel.cloneNode(false);
	
	// TODO: Fix toggle using '' instead of 'null'
	this.addCellOption(extraPanel, mxResources.get('wordWrap'), mxConstants.STYLE_WHITE_SPACE, 'wrap', 'wrap', 'null');
	this.addCellOption(extraPanel, mxResources.get('formattedText'), 'html', '1');
	this.addCellOption(extraPanel, mxResources.get('hide'), mxConstants.STYLE_NOLABEL, '1');
	
	container.appendChild(extraPanel);

	function setSelected(elt, selected)
	{
		if (mxClient.IS_IE && (mxClient.IS_QUIRKS || document.documentMode < 10))
		{
			elt.style.filter = (selected) ? 'progid:DXImageTransform.Microsoft.Gradient('+
            	'StartColorStr=\'#c5ecff\', EndColorStr=\'#87d4fb\', GradientType=0)' : '';
		}
		else
		{
			elt.style.backgroundImage = (selected) ? 'linear-gradient(#c5ecff 0px,#87d4fb 100%)' : '';
		}
	};
	
	var listener = mxUtils.bind(this, function()
	{
		state = graph.view.getState(graph.getSelectionCell());
		
		if (state != null)
		{
			input.value = mxUtils.getValue(state.style, mxConstants.STYLE_FONTSIZE, 1);
			var fontStyle = mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0);
			setSelected(fontStyleItems[0], (fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD);
			setSelected(fontStyleItems[1], (fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC);
			setSelected(fontStyleItems[2], (fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE);
			fontMenu.firstChild.nodeValue = mxUtils.htmlEntities(mxUtils.getValue(state.style, mxConstants.STYLE_FONTFAMILY, Menus.prototype.defaultFont));
			input.value = parseInt(mxUtils.getValue(state.style, mxConstants.STYLE_FONTSIZE, Menus.prototype.defaultFontSize));
			
			var align = mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
			setSelected(left, align == mxConstants.ALIGN_LEFT);
			setSelected(center, align == mxConstants.ALIGN_CENTER);
			setSelected(right, align == mxConstants.ALIGN_RIGHT);
			
			var valign = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
			setSelected(top, valign == mxConstants.ALIGN_TOP);
			setSelected(middle, valign == mxConstants.ALIGN_MIDDLE);
			setSelected(bottom, valign == mxConstants.ALIGN_BOTTOM);
		}
	});

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

	return container;
}

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
	var shape = this.getCurrentShape();
	
	var clone = this.container.cloneNode(true);
	clone.style.paddingTop = '4px';
	clone.style.paddingBottom = '10px';
	clone.style.paddingLeft = '18px';
	clone.style.fontWeight = 'normal';
	
	this.container.style.borderBottom = 'none';
	
	if (shape != 'image')
	{
		this.container.appendChild(this.addStyles(clone.cloneNode(true)));
	}
	
	if (shape == 'image' || shape == 'label')
	{
		var btn = mxUtils.button(mxResources.get('editImage'), function(evt)
		{
			ui.actions.get('image').funct();
		})
		
		btn.style.width = '202px';
		
		var panel = clone.cloneNode(true);
		panel.appendChild(btn);
		this.container.appendChild(panel);
	}

	var panel = clone.cloneNode(true);
	panel.style.paddingBottom = '2px';
	
	if (graph.getModel().isVertex(graph.getSelectionCell()) || shape == 'arrow')
	{
		this.container.appendChild(this.addFill(panel.cloneNode(true)));
	}
	
	var strokePanel = this.addStroke(panel.cloneNode(true));
	this.container.appendChild(strokePanel);
	strokePanel.style.paddingBottom = '8px';
	this.container.appendChild(this.addRelativeOption(panel.cloneNode(true), mxResources.get('opacity'), mxConstants.STYLE_OPACITY));
	this.container.appendChild(this.addEffects(clone.cloneNode(true)));

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
		btn.style.marginRight = '2px';
		
		div.appendChild(btn);
		
		var btn = mxUtils.button(mxResources.get('pasteStyle'), function(evt)
		{
			ui.actions.get('pasteStyle').funct();
		})
		
		btn.setAttribute('title', 'Ctrl+Shift+V');
		btn.style.width = '100px';
		
		div.appendChild(btn);
		mxUtils.br(div);

		var btn = mxUtils.button(mxResources.get('setAsDefaultStyle'), function(evt)
		{
			ui.actions.get('setAsDefaultStyle').funct();
		})
		
		btn.setAttribute('title', 'Ctrl+Shift+D');
		btn.style.marginTop = '8px';
		btn.style.width = '202px';
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
	var shape = this.getCurrentShape();
	
	var colorPanel = document.createElement('div');
	colorPanel.style.fontWeight = 'bold';
	var gradientPanel = colorPanel.cloneNode(true);
	gradientPanel.style.fontWeight = 'normal';
	
	// Adds gradient direction option
	var gradientSelect = document.createElement('select');
	gradientSelect.style.position = 'absolute';
	gradientSelect.style.marginTop = '-2px';
	gradientSelect.style.right = '72px';
	gradientSelect.style.width = '70px';
	
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
	
	var fillKey = (shape == 'image') ? mxConstants.STYLE_IMAGE_BACKGROUND : mxConstants.STYLE_FILLCOLOR;
	
	this.addCellColorOption(colorPanel, 'Füllen'/*TODO*/,
			fillKey, '#ffffff', function(color)
		{
			if (shape == 'image' || color == null || color == mxConstants.NONE)
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
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	
	var colorPanel = document.createElement('div');
	colorPanel.style.fontWeight = 'bold';
	
	// Adds gradient direction option
	var styleSelect = document.createElement('select');
	styleSelect.style.position = 'absolute';
	styleSelect.style.marginTop = '-2px';
	styleSelect.style.right = '72px';
	styleSelect.style.width = '80px';
	
	var state = graph.view.getState(graph.getSelectionCell());
	var shape = this.getCurrentShape();
	var strokeKey = (shape == 'image') ? mxConstants.STYLE_IMAGE_BORDER : mxConstants.STYLE_STROKECOLOR;
	
	var styles = ['straight', 'rounded', 'curved'];

	for (var i = 0; i < styles.length; i++)
	{
		var styleOption = document.createElement('option');
		styleOption.setAttribute('value', styles[i]);
		mxUtils.write(styleOption, mxResources.get(styles[i]));
		styleSelect.appendChild(styleOption);
	}
	
	mxEvent.addListener(styleSelect, 'change', function(evt)
	{
		graph.getModel().beginUpdate();
		try
		{
			var keys = [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED];
			// Default for rounded is 1
			var values = ['0', null];
			
			if (styleSelect.value == 'rounded')
			{
				values = ['1', null];
			}
			else if (styleSelect.value == 'curved')
			{
				values = [null, '1'];
			}
			
			for (var i = 0; i < keys.length; i++)
			{
				graph.setCellStyles(keys[i], values[i], graph.getSelectionCells());
			}
			
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', keys,
				'values', values, 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
		
		mxEvent.consume(evt);
	});
	
	colorPanel.appendChild(styleSelect);

	var stylePanel = colorPanel.cloneNode(false);
	stylePanel.style.fontWeight = 'normal';
	stylePanel.style.position = 'relative';
	stylePanel.style.paddingLeft = '16px'
	stylePanel.style.marginBottom = '2px';
	stylePanel.style.marginTop = '2px';
	stylePanel.className = 'geToolbarContainer';
	stylePanel.style.borderWidth = '0px';
	
	if (mxClient.IS_QUIRKS)
	{
		stylePanel.style.display = 'block';
	}

	var stylePanel2 = stylePanel.cloneNode(false);

	// Stroke width
	var input = document.createElement('input');
	input.setAttribute('type', 'number');
	input.setAttribute('min', '1');
	input.style.position = 'absolute';
	input.style.textAlign = 'right';
	input.style.paddingRight = '12px';
	input.style.marginTop = '2px';
	input.style.right = '22px';
	input.style.width = '41px';
	input.style.height = '15px';

	stylePanel.appendChild(input);
	
	var unit = document.createElement('span');
	unit.style.position = 'absolute';
	unit.style.fontWeight = 'normal';
	unit.style.fontSize = '11px';
	unit.style.fontColor = '#000';
	unit.style.right = (mxClient.IS_SF) ? '37px': '26px';
	unit.style.marginTop = '7px';
	mxUtils.write(unit, 'pt');
	stylePanel.appendChild(unit);
	
	if (mxClient.IS_MT)
	{
		mxUtils.setPrefixedStyle(input.style, 'boxSizing', 'padding-box');
		input.style.width = '52px';
		unit.style.marginTop = '5px';
	}
	else
	{
		unit.style.marginTop = '7px';		
	}

	this.addCellColorOption(colorPanel, mxResources.get('line'), strokeKey, '#000000').style.height = '18px';

	function update(evt)
	{
		// Maximum stroke width is 999
		var value = parseInt(input.value);
		value = Math.min(999, Math.max(1, (isNaN(value)) ? 1 : value));
		
		if (value != mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style,
			mxConstants.STYLE_STROKEWIDTH, 1))
		{
			graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, value, graph.getSelectionCells());
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_STROKEWIDTH],
					'values', [value], 'cells', graph.getSelectionCells()));
			input.value = value;
		}
		
		mxEvent.consume(evt);
	};

	mxEvent.addListener(input, 'blur', update);
	mxEvent.addListener(input, 'click', update);
	
	var pattern = this.editorUi.toolbar.addMenuFunctionInContainer(stylePanel, 'geSprite-orthogonal', mxResources.get('line'), false, mxUtils.bind(this, function(menu)
	{
		var addItem = mxUtils.bind(this, function(cssName, keys, values)
		{
			var item = this.editorUi.menus.styleChange(menu, '', keys, values, 'geIcon', null);
		
			var pat = document.createElement('div');
			pat.style.width = '70px';
			pat.style.height = '1px';
			pat.style.borderBottom = '1px ' + cssName + ' black';
			pat.style.paddingTop = '6px';
	
			item.firstChild.firstChild.style.padding = '0px 4px 0px 4px';
			item.firstChild.firstChild.style.width = '70px';
			item.firstChild.firstChild.appendChild(pat);
		});

		addItem('solid', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], [null, null]);
		addItem('dashed', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], ['1', null]);
		addItem('dotted', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], ['1', '1 4']);
	}));
	var edgeStyle = this.editorUi.toolbar.addMenuFunctionInContainer(stylePanel2, 'geSprite-orthogonal', mxResources.get('line'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], [null, null, null, null], 'geIcon geSprite geSprite-straight', null, true).setAttribute('title', mxResources.get('straight'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], [null, 'orthogonalEdgeStyle', null, null], 'geIcon geSprite geSprite-orthogonal', null, true).setAttribute('title', mxResources.get('orthogonal'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], [null, 'orthogonalEdgeStyle', '1', null], 'geIcon geSprite geSprite-curved', null, true).setAttribute('title', mxResources.get('curved'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], [null, 'entityRelationEdgeStyle', null, null], 'geIcon geSprite geSprite-entity', null, true).setAttribute('title', mxResources.get('entityRelation'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], ['arrow', null, null, null], 'geIcon geSprite geSprite-arrow', null, true).setAttribute('title', mxResources.get('arrow'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], ['link', null, null, null], 'geIcon geSprite geSprite-linkedge', null, true).setAttribute('title', mxResources.get('link'));
	}));
	var lineStart = this.editorUi.toolbar.addMenuFunctionInContainer(stylePanel2, 'geSprite-startclassic', mxResources.get('lineend'), false, mxUtils.bind(this, function(menu)
	{
		if (shape != 'arrow' && shape != 'link')
		{
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.NONE, 0], 'geIcon geSprite geSprite-noarrow', null, false).setAttribute('title', mxResources.get('none'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_CLASSIC, 1], 'geIcon geSprite geSprite-startclassic', null, false).setAttribute('title', mxResources.get('classic'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_OPEN, 1], 'geIcon geSprite geSprite-startopen', null, false).setAttribute('title', mxResources.get('openArrow'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_BLOCK, 1], 'geIcon geSprite geSprite-startblock', null, false).setAttribute('title', mxResources.get('block'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_OVAL, 1], 'geIcon geSprite geSprite-startoval', null, false).setAttribute('title', mxResources.get('oval'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_DIAMOND, 1], 'geIcon geSprite geSprite-startdiamond', null, false).setAttribute('title', mxResources.get('diamond'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_DIAMOND_THIN, 1], 'geIcon geSprite geSprite-startthindiamond', null, false).setAttribute('title', mxResources.get('diamondThin'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_CLASSIC, 0], 'geIcon geSprite geSprite-startclassictrans', null, false).setAttribute('title', mxResources.get('classic'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_BLOCK, 0], 'geIcon geSprite geSprite-startblocktrans', null, false).setAttribute('title', mxResources.get('block'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_OVAL, 0], 'geIcon geSprite geSprite-startovaltrans', null, false).setAttribute('title', mxResources.get('oval'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_DIAMOND, 0], 'geIcon geSprite geSprite-startdiamondtrans', null, false).setAttribute('title', mxResources.get('diamond'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_DIAMOND_THIN, 0], 'geIcon geSprite geSprite-startthindiamondtrans', null, false).setAttribute('title', mxResources.get('diamondThin'));
			this.editorUi.menus.promptChange(menu, '', '(px)', mxConstants.DEFAULT_MARKERSIZE, mxConstants.STYLE_STARTSIZE, null, true, null, 'geIcon geSprite geSprite-dots').setAttribute('title', mxResources.get('size'));
		}

		this.editorUi.menus.promptChange(menu, '', '(px)', '0', mxConstants.STYLE_SOURCE_PERIMETER_SPACING, null, true, null, 'geIcon geSprite geSprite-top').setAttribute('title', mxResources.get('sourceSpacing'));
	}));
	var lineEnd = this.editorUi.toolbar.addMenuFunctionInContainer(stylePanel2, 'geSprite-endclassic', mxResources.get('lineend'), false, mxUtils.bind(this, function(menu)
	{
		if (shape != 'arrow' && shape != 'link')
		{
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.NONE, 0], 'geIcon geSprite geSprite-noarrow', null, false).setAttribute('title', mxResources.get('none'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_CLASSIC, 1], 'geIcon geSprite geSprite-endclassic', null, false).setAttribute('title', mxResources.get('classic'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_OPEN, 1], 'geIcon geSprite geSprite-endopen', null, false).setAttribute('title', mxResources.get('openArrow'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_BLOCK, 1], 'geIcon geSprite geSprite-endblock', null, false).setAttribute('title', mxResources.get('block'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_OVAL, 1], 'geIcon geSprite geSprite-endoval', null, false).setAttribute('title', mxResources.get('oval'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_DIAMOND, 1], 'geIcon geSprite geSprite-enddiamond', null, false).setAttribute('title', mxResources.get('diamond'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_DIAMOND_THIN, 1], 'geIcon geSprite geSprite-endthindiamond', null, false).setAttribute('title', mxResources.get('diamondThin'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_CLASSIC, 0], 'geIcon geSprite geSprite-endclassictrans', null, false).setAttribute('title', mxResources.get('classic'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_BLOCK, 0], 'geIcon geSprite geSprite-endblocktrans', null, false).setAttribute('title', mxResources.get('block'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_OVAL, 0], 'geIcon geSprite geSprite-endovaltrans', null, false).setAttribute('title', mxResources.get('oval'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_DIAMOND, 0], 'geIcon geSprite geSprite-enddiamondtrans', null, false).setAttribute('title', mxResources.get('diamond'));
			this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_DIAMOND_THIN, 0], 'geIcon geSprite geSprite-endthindiamondtrans', null, false).setAttribute('title', mxResources.get('diamondThin'));
			this.editorUi.menus.promptChange(menu, '', '(px)', mxConstants.DEFAULT_MARKERSIZE, mxConstants.STYLE_ENDSIZE, null, true, null, 'geIcon geSprite geSprite-dots').setAttribute('title', mxResources.get('size'));
		}
		
		this.editorUi.menus.promptChange(menu, '', '(px)', '0', mxConstants.STYLE_TARGET_PERIMETER_SPACING, null, true, null, 'geIcon geSprite geSprite-bottom').setAttribute('title', mxResources.get('targetSpacing'));
	}));

	this.addArrow(edgeStyle);
	this.addArrow(lineStart);
	this.addArrow(lineEnd);
	
	var symbol = this.addArrow(pattern, 9);
	symbol.className = 'geIcon';
	symbol.style.width = '83px';
	
	var solid = document.createElement('div');
	solid.style.width = '80px';
	solid.style.height = '1px';
	solid.style.borderBottom = '1px solid black';
	solid.style.marginBottom = '9px';
	symbol.appendChild(solid);
	
	pattern.style.height = '15px';
	edgeStyle.style.height = '17px';
	lineStart.style.height = '17px';
	lineEnd.style.height = '17px';

	container.appendChild(colorPanel);
	container.appendChild(stylePanel);

	if (graph.getModel().isEdge(state.cell))
	{
		container.appendChild(stylePanel2);
	}
	
	var listener = mxUtils.bind(this, function()
	{
		state = graph.view.getState(graph.getSelectionCell());
		
		if (state != null)
		{
			shape = this.getCurrentShape();
			var color = mxUtils.getValue(state.style, strokeKey, null);
			
			if (shape != 'arrow' && (color == null || color == mxConstants.NONE))
			{
				stylePanel.style.display = 'none';
			}
			else
			{
				stylePanel.style.display = '';
			}
			
			stylePanel2.style.display = stylePanel.style.display;
			styleSelect.style.display = stylePanel.style.display;
			
			input.value = mxUtils.getValue(state.style, mxConstants.STYLE_STROKEWIDTH, 1);
			styleSelect.style.visibility = (shape == 'connector') ? '' : 'hidden';
			
			if (mxUtils.getValue(state.style, mxConstants.STYLE_CURVED, null) == '1')
			{
				styleSelect.value = 'curved';
			}
			else if (mxUtils.getValue(state.style, mxConstants.STYLE_ROUNDED, null) == '1')
			{
				styleSelect.value = 'rounded';
			}
			
			if (mxUtils.getValue(state.style, mxConstants.STYLE_DASHED, null) == '1')
			{
				if (mxUtils.getValue(state.style, mxConstants.STYLE_DASH_PATTERN, null) == null)
				{
					solid.style.borderBottom = '1px dashed black';
				}
				else
				{
					solid.style.borderBottom = '1px dotted black';
				}
			}
			else
			{
				solid.style.borderBottom = '1px solid black';
			}
			
			// Updates toolbar icon for edge style
			var edgeStyleDiv = edgeStyle.getElementsByTagName('div')[0];
			var es = mxUtils.getValue(state.style, mxConstants.STYLE_EDGE, null);

			if (shape == 'arrow')
			{
				edgeStyleDiv.className = 'geSprite geSprite-arrow';
			}
			else if (shape == 'link')
			{
				edgeStyleDiv.className = 'geSprite geSprite-linkedge';
			}
			else if (es == 'orthogonalEdgeStyle' && mxUtils.getValue(state.style, mxConstants.STYLE_CURVED, null) == '1')
			{
				edgeStyleDiv.className = 'geSprite geSprite-curved';
			}
			else if (es == 'straight' || es == 'none' || es == null)
			{
				edgeStyleDiv.className = 'geSprite geSprite-straight';
			}
			else if (es == 'entityRelationEdgeStyle')
			{
				edgeStyleDiv.className = 'geSprite geSprite-entity';
			}
			else
			{
				edgeStyleDiv.className = 'geSprite geSprite-orthogonal';
			}
		}
	});
	
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
	
	container.style.paddingBottom = '6px';
	container.style.marginTop = '2px';
	
	var span = document.createElement('div');
	span.style.marginBottom = '12px';
	span.style.marginTop = '4px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, 'Effekte'/*TODO*/);
	container.appendChild(span);
	
	var table = document.createElement('table');
	table.style.width = '100%';
	table.style.paddingRight = '20px';
	var tbody = document.createElement('tbody');
	var row = document.createElement('tr');
	var left = document.createElement('td');
	left.style.width = '50%';
	left.setAttribute('valign', 'top');
	
	var right = left.cloneNode(true);
	right.style.paddingLeft = '8px';
	row.appendChild(left);
	row.appendChild(right);
	tbody.appendChild(row);
	table.appendChild(tbody);
	container.appendChild(table);

	var current = left;
	var shape = this.getCurrentShape();
	
	if (shape == 'label' || shape == 'rectangle' || shape == 'internalStorage' || shape == 'corner' ||
		shape == 'parallelogram' || shape == 'swimlane' || shape == 'step' || shape == 'trapezoid' ||
		shape == 'ext' || shape == 'triangle' || shape == 'hexagon' || shape == 'process' ||
		shape == 'rhombus' || shape == 'offPageConnector' || shape == 'loopLimit' || shape == 'tee' ||
		shape == 'manualInput' || shape == 'card' || shape == 'curlyBracket')
	{
		this.addCellOption(current, mxResources.get('rounded'), mxConstants.STYLE_ROUNDED, 0).style.width = '100%';
		current = (current == left) ? right : left;
	}

	if (shape == 'swimlane')
	{
		this.addCellOption(current, 'Trennstrich'/*TODO*/, 'swimlaneLine', 1).style.width = '100%';
		current = (current == left) ? right : left;
	}
	
	if (graph.getModel().isVertex(graph.getSelectionCell()))
	{
		this.addCellOption(current, 'Proportional'/*TODO*/, mxConstants.STYLE_ASPECT, null, 'fixed', 'null').style.width = '100%';
		current = (current == left) ? right : left;
	}
	
	this.addCellOption(current, mxResources.get('shadow'), mxConstants.STYLE_SHADOW, 0).style.width = '100%';
	current = (current == left) ? right : left;

	// TODO: Add list of glass-compatible shapes
	if (shape == 'label' || shape == 'rectangle' || shape == 'internalStorage' ||
		shape == 'ext' || shape == 'swimlane')
	{
		this.addCellOption(current, 'Glas'/*TODO*/, mxConstants.STYLE_GLASS, 0).style.width = '100%';
		current = (current == left) ? right : left;
	}

	return container;
}

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
	unit.style.marginTop = (mxClient.IS_MT) ? '1px' : '2px';
	unit.style.right = (mxClient.IS_SF) ? '35px': '24px';
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
	
	var bg = document.createElement('div');
	
	container.appendChild(this.addColorOption(bg, mxResources.get('background'), function()
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
	}));
	
	var btn = mxUtils.button(mxResources.get('image'), function(evt)
	{
		var dlg = new BackgroundImageDialog(ui, function(image)
		{
			ui.setBackgroundImage(image);
		});
		ui.showDialog(dlg.container, 360, 200, true, true);
		dlg.init();
		
		mxEvent.consume(evt);
	})

	btn.style.position = 'absolute';
	btn.style.marginTop = '-1px';
	btn.style.right = '72px';
	btn.style.width = '62px';

	container.appendChild(btn);
	
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
	BaseFormatPanel.prototype.destroy.apply(this, arguments);
	
	if (this.gridEnabledListener)
	{
		this.editorUi.removeListener(this.gridEnabledListener);
		this.gridEnabledListener = null;
	}
};
