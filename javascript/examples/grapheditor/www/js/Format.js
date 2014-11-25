/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new graph editor
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
	
	graph.getSelectionModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function(sender, evt)
	{
		this.container.innerHTML = '';
		this.refresh();
	}));
	
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
	if (ui.getCurrentFile() == null)
	{
		
	}
	else if (graph.isSelectionEmpty())
	{
		mxUtils.write(this.container, 'Document Title');
		
		mxUtils.br(this.container);
		
		this.container.appendChild(mxUtils.button(mxResources.get('grid'), function(evt)
		{
			ui.actions.get('grid').funct();
		}));
	}
	else
	{
		this.container.appendChild(mxUtils.button(mxResources.get('strokeColor'), function(evt)
		{
			ui.actions.get('strokeColor').funct();
		}));
		
		var hr = document.createElement('hr');
		this.container.appendChild(hr);
		
		var cb = document.createElement('input');
		cb.setAttribute('type', 'checkbox');
		
		this.container.appendChild(cb);
		
		var span = document.createElement('span');
		mxUtils.write(span, mxResources.get('fillColor'));
		
		this.container.appendChild(span);

		this.container.appendChild(mxUtils.button(mxResources.get('fillColor'), function(evt)
		{
			ui.actions.get('fillColor').funct();
		}));
		
		var hr = document.createElement('hr');
		this.container.appendChild(hr);
		
		var cb = document.createElement('input');
		cb.setAttribute('type', 'checkbox');
		
		this.container.appendChild(cb);
		
		var span = document.createElement('span');
		mxUtils.write(span, mxResources.get('gradient'));
		
		this.container.appendChild(span);

		this.container.appendChild(mxUtils.button(mxResources.get('gradientColor'), function(evt)
		{
			ui.actions.get('gradientColor').funct();
		}));
		
		var hr = document.createElement('hr');
		this.container.appendChild(hr);
		
		this.container.appendChild(mxUtils.button(mxResources.get('duplicate'), function(evt)
		{
			ui.actions.get('duplicate').funct();
		}));
	}
};
