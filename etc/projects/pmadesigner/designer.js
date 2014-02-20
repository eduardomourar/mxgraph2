// Program starts here. Creates a sample graph in the
// DOM node with the specified ID. This function is invoked
// from the onLoad event handler of the document (see below).
var getRowNumber = function(cell, fieldname)
{
	if (cell.value.childNodes != null)
	{
		for (var i = 0; i < cell.value.childNodes.length; i++)
		{
			var child = cell.value.childNodes[i];
			
			if (child.nodeName == 'ColumnInfo' &&
				child.getAttribute('name') == fieldname)
			{
				return i + 1;
			}
		}
	}

	return 1;
};

var showEdgeLabels = true;
var showFieldTypes = true;

function main(sql)
{
	// TODO:
	// - Code cleanup
	// - Handle doubleclicks
	// - In-place editing
	// - Form editing of cells
	// - Allow new connections
	// - Store diagrams in gears / server-side
	// - Update height of cell for number of columns
	// - Fix parser to not require newlines
	// - Switch ERD vs. Fancy style (add ERD arrows)
	// - Strip down the source for GPL distro
	// - Edge routing and automatic layout
	// - PMA integration
	//
	// Questions from Marc:
	// - how do you delete a relation?
	// - is there validation about which field is valid to be chosen in a relation?
	// - the "import/export coordinates for PDF schema" is not there
	// - are the positionning and the changes automatically saved?
	// - can the "display field" be specified?
	// - does this support only storage engines with FOREIGN KEY features, or also the "internal" phpMyAdmin foreign keys? 
	
	// Checks if the browser is supported
	if (!mxClient.isBrowserSupported())
	{
		// Displays an error message if the browser is not supported.
		mxUtils.error('Browser is not supported!', 200, false);
	}
	else
	{
		// Creates the div for the graph
		container = document.createElement('div');
		container.style.position = 'absolute';
		container.style.overflow = 'auto';
		container.style.left = '0px';
		container.style.top = '30px';
		container.style.right = '0px';
		container.style.bottom = '0px';
		container.style.borderColor = '#C3D9FF';
		container.style.borderWidth = '1 0 0 0px';
		container.style.borderStyle = 'solid';

		document.body.appendChild(container);
		
		// Workaround for Internet Explorer ignoring certain styles
		if (mxClient.IS_IE)
		{
			new mxDivResizer(container);
		}
		
		// Defines an icon for creating new connections in the connection handler.
		// This will automatically disable the highlighting of the source vertex.
		mxConnectionHandler.prototype.connectImage = new mxImage('relation.png', 16, 16);
		
		// Creates the graph inside the given container
		var graph = new mxGraph(container);

		// Replaces collapse/expand icons
		graph.collapsedImage = new mxImage('expand.gif', 9, 9);
		graph.expandedImage = new mxImage('collapse.gif', 9, 9);

		// Uses the entity perimeter (below) as default
		graph.stylesheet.getDefaultVertexStyle()[mxConstants.STYLE_PERIMETER] =
			mxPerimeter.EntityPerimeter;
		graph.stylesheet.getDefaultVertexStyle()[mxConstants.STYLE_FILLCOLOR] = '#EEEEEE';
		graph.stylesheet.getDefaultVertexStyle()[mxConstants.STYLE_GRADIENTCOLOR] = '#C3D9FF';
		graph.stylesheet.getDefaultVertexStyle()[mxConstants.STYLE_STROKECOLOR] = '#C3D9FF';
		graph.stylesheet.getDefaultVertexStyle()[mxConstants.STYLE_STROKEWIDTH] = 2;
		graph.stylesheet.getDefaultVertexStyle()[mxConstants.STYLE_SHADOW] = true;
		graph.stylesheet.getDefaultVertexStyle()[mxConstants.STYLE_PERIMETER_SPACING] = 2;
		graph.stylesheet.getDefaultVertexStyle()[mxConstants.STYLE_ROUNDED] = true;
		graph.stylesheet.getDefaultVertexStyle()[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
		
		//delete graph.stylesheet.getDefaultVertexStyle()[mxConstants.STYLE_STROKECOLOR];
		// Note: Could set background in stylesheet for table.erd td (#C3D9FF) but
		// the shadow is only shown if the fillcolor is set to a non-null value
		// Uncomment the following for old-school ERD style
		//delete graph.stylesheet.getDefaultVertexStyle()[mxConstants.STYLE_FILLCOLOR];

		// Uses the entity edge style as default
		graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_EDGE] =
			mxEdgeStyle.EntityRelation;
		graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_FONTCOLOR] = '#636363';
		graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';
		//graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_STARTSIZE] = 8;
		graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_DIAMOND;
		//graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_ENDSIZE] = 4;
		graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
		graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_SOURCE_PERIMETER_SPACING] = 4;
		graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_STROKECOLOR] = '#91A7CD';
		graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_STROKEWIDTH] = 2;
		graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_DASHED] = true;
		graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_ROUNDED] = true;
		graph.stylesheet.getDefaultEdgeStyle()[mxConstants.STYLE_SHADOW] = true;

		// Allows new connections to be made but do not allow existing
		// connections to be changed for the sake of simplicity of this
		// example
		graph.setCellsDisconnectable(false);
		graph.setAllowDanglingEdges(false);
		graph.setCellsEditable(false);
		graph.setTooltips(true);
		graph.setPanning(true);
		graph.setConnectable(true);

		// Override folding to allow for tables
		graph.isCellFoldable = function(cell, collapse)
		{
			return this.getModel().isVertex(cell);
		};
		
		// Enables HTML markup in all labels
		graph.setHtmlLabels(true);

		// Scroll events should not start moving the vertex
		graph.cellRenderer.isLabelEvent = function(state, evt)
		{
			var target = mxEvent.getSource(evt);

			return state.text != null &&
				target != state.text.node;
		};

		graph.cellRenderer.getControlBounds = function(state)
		{
			var result = mxCellRenderer.prototype.getControlBounds(state);
			
			if (result != null)
			{
				result.x += 2;
				result.y += 4;
			}
			
			return result;
		};
		
		// Adds scrollbars to the outermost div and keeps the
		// DIV position and size the same as the vertex
		var oldRedrawLabel = graph.cellRenderer.redrawLabel;
		graph.cellRenderer.redrawLabel = function(state)
		{
			oldRedrawLabel.apply(this, arguments); // "supercall"
			var graph = state.view.graph;

			if (graph.getModel().isVertex(state.cell) &&
				state.text != null)
			{
				state.text.node.style.overflow = 'auto';
				state.text.node.style.marginLeft = '0px';
				state.text.node.style.marginTop = '0px';

				// Removes the padding on the TD that contains the
				// inner table (could go into createLabel)
				state.text.node.getElementsByTagName('td')[0].
					style.padding = '0px';
			}
		};

		// Adds mouse listener for updating the perimeter points
		// while and after scrolling - this is only required if the
		// perimeter point depends on the scroll position
		var oldCreateLabel = graph.cellRenderer.createLabel;
		graph.cellRenderer.createLabel = function(state)
		{
			oldCreateLabel.apply(this, arguments); // "supercall"
			var graph = state.view.graph;
			
			if (graph.getModel().isVertex(state.cell) &&
				state.text != null)
			{
				mxEvent.addListener(state.text.node, 'scroll',
					mxUtils.bind(this, function(evt)
					{
						graph.view.invalidate(state.cell, false, true);
						graph.view.validate();
					})
				);
				
				mxEvent.addListener(state.text.node, 'mouseup',
					mxUtils.bind(this, function(evt)
					{
						if (!this.isLabelEvent(state, evt))
						{
							graph.view.invalidate(state.cell, false, true);
							graph.view.validate();
						}
					})
				);
			}
		};

		// Adds a new function to update the currentRow based on the given event
		// and return the DOM node for that row
		graph.connectionHandler.updateRow = function(target)
		{
			while (target != null &&
				target.nodeName != 'TR')
			{
				target = target.parentNode;
			}
			
			if (target != null)
			{
				// Stores the current row number in a property so that it can
				// be retrieved to create the preview and final edge
				var rowNumber = 0;
				var current = target.parentNode.firstChild;

				while (target != current &&
					current != null)
				{
					current = current.nextSibling;
					rowNumber++;
				}

				if (rowNumber > 0)
				{
					this.currentRow = rowNumber;
				}
				else
				{
					this.currentRow = null;
					this.error = '';
				}
			}

			return target;
		};
		
		// Adds placement of the connect icon based on the mouse event target (row)
		graph.connectionHandler.updateIcons = function(state, icons, me)
		{
			var target = me.getSource();
			target = this.updateRow(target);
			
			if (target != null &&
				this.currentRow > 0)
			{
				var div = state.text.node;
				
				icons[0].node.style.visibility = 'visible';
				icons[0].bounds.x = state.x + target.offsetLeft + Math.min(state.width,
					target.offsetWidth) - this.icons[0].bounds.width - 2;
				icons[0].bounds.y = state.y + target.offsetTop + target.offsetHeight / 2 -
					this.icons[0].bounds.height / 2 - div.scrollTop;
				icons[0].redraw();
			}
			else
			{
				icons[0].node.style.visibility = 'hidden';
			}
		};

		// Updates the targetRow in the preview edge State
		var oldMouseMove = graph.connectionHandler.mouseMove;
		graph.connectionHandler.mouseMove = function(sender, me)
		{
			if (this.edgeState != null)
			{
				this.updateRow(me.getSource());
				this.edgeState.cell.value.setAttribute('targetRow', this.currentRow);
			}
			
			oldMouseMove.apply(this, arguments);
		};

		// Creates the edge state that may be used for preview
		graph.connectionHandler.createEdgeState = function(me)
		{
			var relation = doc.createElement('Relation');
			relation.setAttribute('sourceRow', this.currentRow || '0');
			relation.setAttribute('targetRow', '0');

			var edge = this.createEdge(relation);
			var style = this.graph.getCellStyle(edge);
			var state = new mxCellState(this.graph.view, edge, style);
			
			return state;
		};

		// Returns mx tooltips if no label is available
		graph.getTooltipForCell = function(cell)
		{
			if (this.model.isEdge(cell) &&
				!showEdgeLabels)
			{
				return cell.value.getAttribute('tooltip');
			}
			
			return null;
		};
		
		// Overrides getLabel to return empty labels for edges and
		// short markup for collapsed cells (TODO: To keep the DOM
		// simple we are adding a scrollbar for the complete table
		// including the header. In the real world the markup would
		// be created from an XML node in cell.value that contains the
		// table description and the rows.)
		graph.getLabel = function(cell)
		{
			if (this.getModel().isVertex(cell))
			{
				if (this.isCellCollapsed(cell))
				{
					return '<table width="100%" height="100%" cellpadding="1" class="erd" ' +
						'title="'+cell.value.getAttribute('tooltip')+'">' +
						'<tr><th colspan="2" align="left" valign="top" style="border-style: none;"><b style="color:#434343">' +
						cell.value.getAttribute('name') + '</b></td></tr></table>';
				}
				else
				{
					var html = '<table width="100%" cellpadding="1" class="erd" ' +
						'title="'+cell.value.getAttribute('tooltip')+'">' +
						'<tr><th colspan="2" align="left"><b style="color:#434343">' +
						cell.value.getAttribute('name') + '</b></th></tr>';
					var child = cell.value.firstChild;
					
					while (child != null)
					{
						var pk = (child.getAttribute('primaryKey') == '1');
						var img = "Field_small.png";

						if (pk)
						{
							img = "Field_small_key.png";
						}
						else if (child.getAttribute('type').indexOf('timestamp') >= 0)
						{
							img = "Field_small_date.png";
						}
						else if (child.getAttribute('type').indexOf('char') >= 0)
						{
							img = "Field_small_char.png";
						}
						else if (child.getAttribute('type').indexOf('int') >= 0)
						{
							img = "Field_small_int.png";
						}
						
						html += '<tr title="'+child.getAttribute('tooltip')+'">'+
							'<td width="10px" style="padding-left:8px;">' +
							'<img align="center" src="' + img + '"/>' +
							//'<img align="center" src="images/plus.png"/>' +
							'</td><td>' +
							//'<b><u>customerId</u></b></td></tr>';
							((pk) ?
							'<b><u>'+child.getAttribute('name')+'</u></b>' :
							child.getAttribute('name'))+
							((showFieldTypes) ?
							': ' + child.getAttribute('type') : '') + 
							'</td></tr>';
						child = child.nextSibling;
					}
					
					return html + '</table>';
				}
			}
			else if (this.getModel().isEdge(cell) &&
					showEdgeLabels)
			{
				return '<span title="'+cell.value.getAttribute('tooltip')+'">'+
					cell.value.getAttribute('sourcetable')+'.'+
					cell.value.getAttribute('sourcefield')+'=\n'+
					cell.value.getAttribute('targettable')+'.'+
					cell.value.getAttribute('targetfield')
					'</span>';
			}
			else
			{
				return '';
			}
		};

		// User objects (data) for the individual cells
		var doc = mxUtils.createXmlDocument();

		// Enables rubberband selection
		new mxRubberband(graph);

		// Enables key handling (eg. escape)
		new mxKeyHandler(graph);

		// Shows something if the template is being displayed
		if (sql == "%sql%")
		{
			sql = 'CREATE TABLE `city` (\n' +
				'  `city_id` smallint(5) unsigned NOT NULL auto_increment,\n' +
				'  `city` varchar(50) NOT NULL,\n' +
				'  `country_id` smallint(5) unsigned NOT NULL,\n' +
				'  `last_update` timestamp NOT NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,\n' +
				'  PRIMARY KEY  (`city_id`),\n' +
				'  KEY `idx_fk_country_id` (`country_id`),\n' +
				'  CONSTRAINT `fk_city_country` FOREIGN KEY (`country_id`) REFERENCES `country` (`country_id`) ON UPDATE CASCADE\n' +
				') ENGINE=InnoDB DEFAULT CHARSET=utf8\n' +
				'CREATE TABLE `country` (\n' +
				'  `country_id` smallint(5) unsigned NOT NULL auto_increment,\n' +
				'  `country` varchar(50) NOT NULL,\n' +
				'  `last_update` timestamp NOT NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,\n' +
				'  PRIMARY KEY  (`country_id`)\n' +
				') ENGINE=InnoDB DEFAULT CHARSET=utf8\n' +
				'CREATE TABLE `address` (\n' +
				'  `address_id` smallint(5) unsigned NOT NULL auto_increment,\n' +
				'  `address` varchar(50) NOT NULL,\n' +
				'  `address2` varchar(50) default NULL,\n' +
				'  `district` varchar(20) NOT NULL,\n' +
				'  `city_id` smallint(5) unsigned NOT NULL,\n' +
				'  `postal_code` varchar(10) default NULL,\n' +
				'  `phone` varchar(20) NOT NULL,\n' +
				'  `last_update` timestamp NOT NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,\n' +
				'  PRIMARY KEY  (`address_id`),\n' +
				'  KEY `idx_fk_city_id` (`city_id`),\n' +
				'  CONSTRAINT `fk_address_city` FOREIGN KEY (`city_id`) REFERENCES `city` (`city_id`) ON UPDATE CASCADE\n' +
				') ENGINE=InnoDB DEFAULT CHARSET=utf8\n';
		}
		else
		{
			sql = sql.replace(/\\n/g, '\n');
		}
		
		parseSqlTables(sql, graph);
		
		// Creates the toolbar and its container (div)
		var tbContainer = document.createElement('div');
		tbContainer.style.position = 'absolute';
		tbContainer.style.overflow = 'hidden';
		tbContainer.style.padding = '4px';
		tbContainer.style.paddingLeft = '8px';
		tbContainer.style.left = '0px';
		tbContainer.style.top = '0px';
		tbContainer.style.right = '0px';
		tbContainer.style.height = (mxClient.IS_IE) ? '30px' : '22px';
		tbContainer.style.background = 'url("toolbar-bg.png")';
		
		document.body.appendChild(tbContainer);
		
		// Workaround for Internet Explorer ignoring certain styles
		if (mxClient.IS_IE)
		{
			new mxDivResizer(tbContainer);
		}
		
		// Undo/redo
		var history = new mxUndoManager();
		
		var listener = function(sender, evt)
		{
			history.undoableEditHappened(evt.getProperty('edit'));
		};
		
		graph.getModel().addListener(mxEvent.UNDO, listener);
		graph.getView().addListener(mxEvent.UNDO, listener);
						
		// Creates new toolbar without event processing
		var toolbar = new mxToolbar(tbContainer);
		toolbar.addItem('Refresh', 'refresh.png', function()
		{
			if (!mxClient.IS_LOCAL)
			{
				var url = window.location.href+'&action=refresh';
				
				mxUtils.get(url, function(req)
				{
					var sql = req.getText();
					parseSqlTables(sql, graph);
				});
			}
			else
			{
				alert('Not connected to a database');
			}
		});
		toolbar.addItem('Undo', 'undo.png', function()
		{
			history.undo();
		});
		toolbar.addItem('Redo', 'redo.png', function()
		{
			history.redo();
		});
		toolbar.addItem('Collapse All', 'navigate_open.png', function()
		{
			graph.foldCells(true, false, graph.getChildVertices());
		});
		toolbar.addItem('Expand All', 'navigate_close.png', function()
		{
			graph.foldCells(false, false, graph.getChildVertices());
		});
		
		// Creates global layout instance to be used in the arrange button
		var layout = new mxFastOrganicLayout(graph);
		layout.disableEdgeStyle = false;
		layout.resetEdges = false;
		layout.forceConstant = 260;		
		
		toolbar.addItem('Arrange', 'branch.png', function()
		{
			layout.execute(graph.getDefaultParent());
		});
		toolbar.addItem('Print', 'printer.png', function()
		{
			var preview = new mxPrintPreview(graph);

			// Passes additional CSS styles for the markup in the vertex labels
			var style = document.getElementsByTagName('style')[0];
			var css = (mxClient.IS_IE) ?
				mxUtils.getInnerHtml(style) :
				mxUtils.getTextContent(style);
			preview.open(css);
		});
		toolbar.addItem('Show/Hide Tables', 'preferences.png', function()
		{
			// Creates a form for the user object inside
			// the cell
			var form = new mxForm('tables');
			
			// Adds a field for each table
			var checkBoxes = [];
			var tables = [];
			
			var parent = graph.getDefaultParent();
			var childCount = graph.getModel().getChildCount(parent);
			
			for (var i = 0; i < childCount; i++)
			{
				var child = graph.getModel().getChildAt(parent, i);
				
				if (graph.getModel().isVertex(child))
				{	
					tables.push(child);
					checkBoxes.push(form.addCheckbox(child.value.getAttribute('name'),
						graph.isCellVisible(child)));
				}
			}

			// Defines the function to be executed when the
			// OK button is pressed in the dialog
			var okFunction = function()
			{
				graph.getModel().beginUpdate();
				try
				{
					for (var i = 0; i < checkBoxes.length; i++)
					{
						var visible = checkBoxes[i].checked;
						
						if (visible != graph.isCellVisible(tables[i]))
						{
							graph.toggleCells(visible, [tables[i]], true);
						}
					}
				}
				catch (e)
				{
					throw e;
				}
				finally
				{
					graph.getModel().endUpdate();
					
					// Hides the dialog
					wnd.setVisible(false);
				}
			};
			
			// Defines the function to be executed when the
			// Cancel button is pressed in the dialog
			var cancelFunction = function()
			{
				// Hides the dialog
				wnd.setVisible(false);
			};
			
			form.addButtons(okFunction, cancelFunction);
			
			wnd = new mxWindow('Show/Hide Tables', form.table, 300, 300, 180, 150, true, true);
			wnd.setScrollable(true);
			wnd.setResizable(true);
			wnd.setVisible(true);
		});
		toolbar.addItem('Options', 'gear.png', function()
		{
			// Creates a form for the user object inside
			// the cell
			var form = new mxForm('properties');
			
			// Adds a readonly field for the cell id
			var edgeLabels = form.addCheckbox('Edge Labels', showEdgeLabels);
			var fieldTypes = form.addCheckbox('Field Types', showFieldTypes);

			// Defines the function to be executed when the
			// OK button is pressed in the dialog
			var okFunction = function()
			{
				var needsRefresh = false;
				
				// Hides the dialog
				wnd.setVisible(false);
				
				// Supports undo for the changes on the underlying
				// XML structure / XML node attribute changes.
				if (edgeLabels.checked != showEdgeLabels)
				{
					showEdgeLabels = edgeLabels.checked;
					needsRefresh = true;
				}
				
				if (fieldTypes.checked != showFieldTypes)
				{
					showFieldTypes = fieldTypes.checked;
					needsRefresh = true;
				}
				
				if (needsRefresh)
				{
					graph.refresh();
				}
			};
			
			
			// Defines the function to be executed when the
			// Cancel button is pressed in the dialog
			var cancelFunction = function()
			{
				// Hides the dialog
				wnd.setVisible(false);
			};
			
			form.addButtons(okFunction, cancelFunction);
			
			wnd = new mxWindow('Options', form.table, 300, 300, 180, null, true, true);
			wnd.setScrollable(true);
			wnd.setResizable(true);
			wnd.setVisible(true);
		});
		toolbar.addItem('About', 'about.png', function()
		{
			alert('Created with mxGraph. Visit http://www.mxgraph.com for more information.')
		});
		var input = document.createElement('input');
		input.setAttribute('type', 'text');
		input.setAttribute('value', 'Search table');
		input.setAttribute('size', '12');
		input.style.position = 'absolute';
		input.style.right = '10px';
		input.style.top = '2px';
		
		// Searches table
		mxEvent.addListener(input, 'keydown', function(e)
		{
			if (e.keyCode == 13)
			{
				if (input.value.length > 0)
				{
					var parent = graph.getDefaultParent();
					var childCount = graph.getModel().getChildCount(parent);
					
					for (var i = 0; i < childCount; i++)
					{
						var table = graph.getModel().getChildAt(parent, i);
						
						if (graph.getModel().isVertex(table))
						{
							var label = table.value.getAttribute('name');

							if (label.indexOf(input.value) == 0)
							{	
								graph.setSelectionCell(table);
								graph.scrollCellToVisible(table, true);
							}
						}
					}
				}
			}
		});
		
		toolbar.container.appendChild(input);
		
		// Execute initial graph layout (TODO: And clear history)
		layout.execute(graph.getDefaultParent());
	}
};

function parseSqlTables(sql, graph)
{
	// Keeps the old cells in an array for later removal of unused cells
	var oldCells = new Object();
	
	for (var id in graph.model.cells)
	{
		var cell = graph.model.cells[id];
		
		if (!graph.model.isRoot(cell) &&
			!graph.model.isLayer(cell))
		{
			oldCells[id] = graph.model.cells[id];
		}
	}
	
	// Gets the default parent for inserting new cells. This
	// is normally the first child of the root (ie. layer 0).
	var parent = graph.getDefaultParent();
	
	graph.getModel().beginUpdate();
	try
	{
		var lines = sql.split('\n');
		var doc = mxUtils.createXmlDocument();

		// Maps from tablename.fieldname to xml nodes
		var fields = new Object();
		var table = null;
		var cell = null;
		var width = 160;
		var x = 40;

		for (var i = 0; i < lines.length; i++)
		{
			lines[i] = mxUtils.ltrim(lines[i]);
			
			if (lines[i].substring(0, 12) == 'CREATE TABLE')
			{
				var tablename = lines[i].substring(14, lines[i].indexOf('`', 14));
				table = doc.createElement('TableInfo');
				table.setAttribute('name', tablename);
				table.setAttribute('tooltip', lines[i]);

				// Tmp is only used if there is no dummy vertex for the given tablename
				var tmp = graph.createVertex(parent, tablename, table, x, 40, width, 160);
				cell = graph.model.getCell(tablename);

				if (cell != null)
				{
					// Replaces the geometry only on forward-references, that is,
					// on cells which have no user object
					if (cell.value == null)
					{
						graph.model.setGeometry(cell, tmp.geometry);
					}
					
					graph.model.setValue(cell, table);
				}
				else
				{
					cell = graph.addCell(tmp, parent);
				}
				
				delete oldCells[tablename];
				fields = new Object();
				x += width + 100;
			}
			else if (table != null)
			{
				if (lines[i].substring(0, 11) == 'PRIMARY KEY')
				{
					var first = lines[i].indexOf('`') + 1;
					var fieldname = lines[i].substring(first, lines[i].indexOf('`', first));
					var field = fields[fieldname];

					if (field != null)
					{
						field.setAttribute('primaryKey', '1');
					}
				}
				else if (lines[i].substring(0, 3) == 'KEY')
				{
					var first = lines[i].indexOf('`') + 1;
					var fieldname = lines[i].substring(first, lines[i].indexOf('`', first));
					var field = fields[fieldname];

					if (field != null)
					{
						field.setAttribute('tooltip',
							field.getAttribute('tooltip')+' '+lines[i]);
					}
				}
				else if (lines[i].indexOf('FOREIGN KEY') >= 0)
				{
					var first = lines[i].indexOf('FOREIGN KEY (`') + 14;
					var fieldname = lines[i].substring(first, lines[i].indexOf('`', first));
					var field = fields[fieldname];

					if (field != null)
					{
						field.setAttribute('tooltip',
								field.getAttribute('tooltip')+' '+lines[i]);
						field.setAttribute('foreignKey', '1');

						first = lines[i].indexOf('REFERENCES `') + 12;
						var tablename = lines[i].substring(first, lines[i].indexOf('`', first));
						first = lines[i].indexOf('(`', first) + 2;
						var targetfield = lines[i].substring(first, lines[i].indexOf('`)', first));
						var target = graph.model.getCell(tablename);

						// Foward references create dummy vertices to hold tables later
						if (target == null)
						{
							target = graph.insertVertex(parent, tablename, null, 0, 0, 0, 0);
							
							// Makes sure the cell is removed later if there
							// is no corresponding table in the database
							oldCells[tablename] = target;
						}

						var relation = doc.createElement('ReferenceInfo');
						relation.setAttribute('sourcetable', table.getAttribute('name'));
						relation.setAttribute('sourcefield', fieldname);
						relation.setAttribute('targettable', tablename);
						relation.setAttribute('targetfield', targetfield);
						relation.setAttribute('tooltip', lines[i]);
						relation.setAttribute('sourceRow', getRowNumber(cell, fieldname));
						// FIXME: Cannot resolve row number if target is forward reference
						relation.setAttribute('targetRow', '1'); //getRowNumber(target, targetfield));

						var id = table.getAttribute('name')+'.'+fieldname+'-'+tablename+'.'+targetfield;
						var edge = graph.model.getCell(id);
						
						if (edge != null)
						{
							graph.model.setValue(edge, relation);
						}
						else
						{
							graph.insertEdge(parent, id, relation, cell, target);
						}
						
						delete oldCells[id];
					}
					else
					{
						mxLog.show();
						mxLog.debug('Foreign key field '+fieldname+' not found');
					}
				}
				else if (lines[i].substring(0, 1) == '`')
				{
					var index = lines[i].indexOf('`', 1);
					var fieldname = lines[i].substring(1, index);
					var field = doc.createElement('ColumnInfo');
					field.setAttribute('name', fieldname);
					index = lines[i].indexOf(' ', index) + 1;
					var type = lines[i].substring(index, lines[i].indexOf(' ', index));
					field.setAttribute('type', type);
					field.setAttribute('tooltip', lines[i]);
					table.appendChild(field);
					fields[fieldname] = field;
				}
				else if (lines[i].substring(0, 1) == ')')
				{
					table.setAttribute('tooltip', table.getAttribute('tooltip') + ' ... ' + lines[i]);
					// FIXME: IE has different size for table so we make an estimate
					//graph.updateCellSize(cell);
					cell.geometry.height = table.childNodes.length * 16 + 30;
					cell.geometry.width = width;
					cell.geometry.alternateBounds = new mxRectangle(0, 0, width, 24);
					table = null;
					cell = null;
				}
			}
		}
		
		// Removes all cells which are no longer in the model
		for (var id in oldCells)
		{
			graph.removeCells([oldCells[id]]);
		}
	}
	catch(e)
	{
		mxLog.show();
		mxLog.debug('e='+e.message);

		throw e;
	}
	finally
	{
		// Updates the display
		graph.getModel().endUpdate();
	}
}

// Implements a special perimeter for table rows inside the table markup
mxPerimeter.EntityPerimeter = function (bounds, terminalState, next, orthogonal)
{
	var div = terminalState.text.node;
	var x = bounds.x;

	// Checks on which side of the terminal to leave
	if (next.x > x + bounds.width / 2)
	{
		x += bounds.width;
	}

	var y = bounds.getCenterY() - div.scrollTop * scale;
	
	if (edgeState != null &&
		//mxUtils.isNode(edgeState.cell.value) &&
		!terminalState.view.graph.isCellCollapsed(terminalState.cell))
	{
		var attr = (isSource) ? "sourceRow" : "targetRow";
		var row = parseInt(edgeState.cell.value.getAttribute(attr));

		// HTML labels contain an outer table which is built-in
		var table = div.getElementsByTagName('table')[1];
		var trs = table.getElementsByTagName('tr');
		var tr = trs[Math.min(trs.length - 1, row)];
		
		// Gets vertical center of source or target row
		y = bounds.y + (tr.offsetTop + tr.offsetHeight / 2 - div.scrollTop + ((isSource) ? 7 : 3)) * scale;
	}

	// Keeps vertical coordinate inside vertex bounds
	y = Math.min(bounds.y + bounds.height, Math.max(bounds.y, y));
	
	// Updates the vertical position of the nearest point if we're not
	// dealing with a connection preview, in which case either the
	// edgeState or the absolutePoints are null
	if (edgeState != null &&
		edgeState.absolutePoints != null)
	{
		next.y = y;
	}

	return new mxPoint(x, y);
};
