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
Format.prototype.defaultFonts = ['Helvetica', 'Verdana', 'Times New Roman', 'Garamond', 'Comic Sans MS',
           		             'Courier New', 'Georgia', 'Lucida Console', 'Tahoma'];

/**
 * Adds the label menu items to the given menu and parent.
 */
Format.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;

	this.customFonts = [];
	this.customFontSizes = [];
	
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
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	// TODO: To draw.io
	//if (ui.getCurrentFile() != null)
	{
		if (graph.isSelectionEmpty())
		{
			var div = document.createElement('div');
			div.style.borderBottom = '1px solid #c0c0c0';
			div.style.height = '28px';
			div.style.fontSize = '12px';
			div.style.width = '100%';
			div.style.color = 'rgb(112, 112, 112)';
			div.style.fontWeight = 'bold';
			div.style.textAlign = 'center';
			div.style.marginTop = '8px';
			mxUtils.write(div, mxResources.get('diagram'));
			this.container.appendChild(div);
			
			div = div.cloneNode(false);
			div.style.textAlign = 'left';
			div.style.fontWeight = 'normal';
			div.style.color = 'rgb(81, 81, 81)';
			this.container.appendChild(div);
			
			//var diagramFormatPanel = new DiagramFormatPanel(ui, div);
			// TODO: Remove all listeners in destroy of panel
		}
		else
		{
			var div = document.createElement('div');
			div.style.borderBottom = '1px solid #c0c0c0';
			div.style.height = '28px';
			div.style.fontSIze = '12px';
			div.style.width = '100%';
			div.style.color = 'rgb(112, 112, 112)';
			div.style.fontWeight = 'bold';
			div.style.textAlign = 'center';
			div.style.marginTop = '8px';
			mxUtils.write(div, mxResources.get('style'));
			this.container.appendChild(div);
			
			div = div.cloneNode(false);
			div.style.textAlign = 'left';
			div.style.fontWeight = 'normal';
			div.style.color = 'rgb(81, 81, 81)';

			var state = graph.view.getState(graph.getSelectionCell());
			var cont = this.container;

			(function(div)
			{
				cont.appendChild(div);
				
				var cb2 = document.createElement('input');
				cb2.style.marginLeft = '10px';
				cb2.setAttribute('type', 'checkbox');

				if (mxUtils.getValue(state.style, mxConstants.STYLE_FILLCOLOR, '') != '')
				{
					cb2.setAttribute('checked', 'checked');
					cb2.defaultChecked = true;
				}

				div.appendChild(cb2);
				
				var btn = mxUtils.button(mxResources.get('color'), function(evt)
				{
					ui.actions.get('fillColor').funct();
				})
				btn.style.position = 'absolute';
				btn.style.marginTop = '2px';
				btn.style.right = '20px';
				btn.style.display = (cb2.checked) ? '' : 'none';
				
				mxEvent.addListener(cb2, 'change', function(evt)
				{
					graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, (cb2.checked) ? '#ffffff' : 'none');
					btn.style.display = (cb2.checked) ? '' : 'none';
					mxEvent.consume(evt);
				});
				
				var span = document.createElement('span');
				span.style.marginLeft = '2px';
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
			})(div.cloneNode(false));
			
			(function(div)
			{
				cont.appendChild(div);
				
				var cb2 = document.createElement('input');
				cb2.style.marginLeft = '10px';
				cb2.setAttribute('type', 'checkbox');

				if (mxUtils.getValue(state.style, mxConstants.STYLE_GRADIENTCOLOR, '') != '')
				{
					cb2.setAttribute('checked', 'checked');
					cb2.defaultChecked = true;
				}
				
				div.appendChild(cb2);
				
				var btn = mxUtils.button(mxResources.get('color'), function(evt)
				{
					ui.actions.get('gradientColor').funct();
				})
				btn.style.position = 'absolute';
				btn.style.marginTop = '2px';
				btn.style.right = '20px';
				btn.style.display = (cb2.checked) ? '' : 'none';
				
				mxEvent.addListener(cb2, 'change', function(evt)
				{
					graph.setCellStyles(mxConstants.STYLE_GRADIENTCOLOR, (cb2.checked) ? '#ffffff' : null);
					btn.style.display = (cb2.checked) ? '' : 'none';
					mxEvent.consume(evt);
				});
				
				var span = document.createElement('span');
				span.style.marginLeft = '2px';
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
			})(div.cloneNode(false));

			(function(div)
			{
				cont.appendChild(div);
				
				var cb2 = document.createElement('input');
				cb2.style.marginLeft = '10px';
				cb2.setAttribute('type', 'checkbox');

				if (mxUtils.getValue(state.style, mxConstants.STYLE_STROKECOLOR, '') != '')
				{
					cb2.setAttribute('checked', 'checked');
					cb2.defaultChecked = true;
				}

				div.appendChild(cb2);
				
				var btn = mxUtils.button(mxResources.get('color'), function(evt)
				{
					ui.actions.get('strokeColor').funct();
				})
				btn.style.position = 'absolute';
				btn.style.marginTop = '2px';
				btn.style.right = '20px';
				btn.style.display = (cb2.checked) ? '' : 'none';
				
				mxEvent.addListener(cb2, 'change', function(evt)
				{
					graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, (cb2.checked) ? '#000000' : 'none');
					btn.style.display = (cb2.checked) ? '' : 'none';
					mxEvent.consume(evt);
				});
				
				var span = document.createElement('span');
				span.style.marginLeft = '2px';
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
			})(div.cloneNode(false));
			
			(function(div)
			{
				cont.appendChild(div);
				
				var cb1 = document.createElement('input');
				cb1.style.marginLeft = '10px';
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
				span.style.marginLeft = '2px';
				span.style.lineHeight = '22px';
				mxUtils.write(span, mxResources.get('shadow'));
				
				mxEvent.addListener(span, 'click', function(evt)
				{
					cb1.checked = !cb1.checked;
					graph.setCellStyles(mxConstants.STYLE_SHADOW, (cb1.checked) ? '1' : '0');
					mxEvent.consume(evt);
				});
				
				div.appendChild(span);
			})(div.cloneNode(false));
		}
	}
};

DiagramFormatPanel = function(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
	this.init();
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	this.container.appendChild((function(div)
	{
		var cb = document.createElement('input');
		cb.style.marginLeft = '10px';
		cb.setAttribute('type', 'checkbox');
		
		if (graph.isGridEnabled())
		{
			cb.setAttribute('checked', 'checked');
			cb.defaultChecked = true;	
		}

		ui.addListener('gridEnabledChanged', function()
		{
			console.log('gridEnabledChanged', graph.isGridEnabled(), cb.checked);
			cb.checked = graph.isGridEnabled();
			span2.style.display = (cb.checked) ? '' : 'none';
		});
		
		/*mxEvent.addListener(cb, 'change', function(evt)
		{
			if (!updating)
			{
				updating = true;
				console.log('entering change', graph.isGridEnabled(), cb.checked);
				ui.actions.get('grid').funct();
				mxEvent.consume(evt);
				console.log('leaving change', graph.isGridEnabled(), cb.checked);
				updating = false;
			}
		});*/
		
		var span2 = document.createElement('span');
		span2.style.position = 'absolute';
		span2.style.right = '20px';
		span2.style.lineHeight = '22px';
		mxUtils.write(span2, mxResources.get('size') + ':');
		span2.style.display = (cb.checked) ? '' : 'none';
		
		var gridSizeInput = document.createElement('input');
		gridSizeInput.setAttribute('type', 'number');
		gridSizeInput.setAttribute('min', '0');
		gridSizeInput.style.width = '40px';
		gridSizeInput.style.marginLeft = '4px';
		gridSizeInput.value = graph.getGridSize();

		span2.appendChild(gridSizeInput);
		
		mxEvent.addListener(gridSizeInput, 'change', function(evt)
		{
			graph.setGridSize(parseInt(gridSizeInput.value));
			mxEvent.consume(evt);
		});

		var span = document.createElement('span');
		span.style.lineHeight = '22px';
		span.style.marginLeft = '2px';
		span.appendChild(cb);
		mxUtils.write(span, mxResources.get('grid'));
		
		mxEvent.addListener(span, 'click', function(evt)
		{
			console.log('entering click', graph.isGridEnabled(), cb.checked);					
			ui.actions.get('grid').funct();
			mxEvent.consume(evt);
			console.log('leaving click', graph.isGridEnabled(), cb.checked);
		});
		
		div.appendChild(span);			
		div.appendChild(span2);
		
		return div;
	})(div.cloneNode(true)));
	
	// Guides
	div = div.cloneNode(false);
	this.container.appendChild(div);
	
	var cb2 = document.createElement('input');
	cb2.style.marginLeft = '10px';
	cb2.setAttribute('type', 'checkbox');
	
	if (graph.graphHandler.guidesEnabled)
	{
		cb2.setAttribute('checked', 'checked');
		cb2.defaultChecked = true;
	}
	
	ui.addListener('guidesEnabledChanged', function()
	{
		cb2.checked = graph.graphHandler.guidesEnabled;
	});
	
	div.appendChild(cb2);
	
	mxEvent.addListener(cb2, 'change', function(evt)
	{
		graph.graphHandler.guidesEnabled = !cb2.checked;
		ui.actions.get('guides').funct();
		mxEvent.consume(evt);
	});
	
	var span = document.createElement('span');
	span.style.marginLeft = '2px';
	span.style.lineHeight = '22px';
	mxUtils.write(span, mxResources.get('guides'));
	
	mxEvent.addListener(span, 'click', function(evt)
	{
		cb2.checked = !cb2.checked;
		graph.graphHandler.guidesEnabled = !cb2.checked;
		ui.actions.get('guides').funct();
		mxEvent.consume(evt);
	});
	
	div.appendChild(span);
	
	// Page view
	div = div.cloneNode(false);
	this.container.appendChild(div);
	
	var cb3 = document.createElement('input');
	cb3.style.marginLeft = '10px';
	cb3.setAttribute('type', 'checkbox');
	
	cb3.checked = graph.pageVisible;
	
	ui.addListener('pageViewChanged', function()
	{
		cb3.checked = graph.pageVisible;
	});
	
	div.appendChild(cb3);
	
	mxEvent.addListener(cb3, 'change', function(evt)
	{
		graph.pageVisible = !cb3.checked;
		ui.actions.get('pageView').funct();
		mxEvent.consume(evt);
	});
	
	var span = document.createElement('span');
	span.style.marginLeft = '2px';
	span.style.lineHeight = '22px';
	mxUtils.write(span, mxResources.get('pageView'));
	
	mxEvent.addListener(span, 'click', function(evt)
	{
		cb3.checked = !cb3.checked;
		graph.pageVisible = !cb3.checked;
		ui.actions.get('pageView').funct();
		mxEvent.consume(evt);
	});
	
	div.appendChild(span);
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.destroy = function()
{
	
};
