/*
 * $Id: DriveRealTime3.js,v 1.1 2013/02/12 13:25:48 gaudenz Exp $
 * Copyright (c) 2006-2011, JGraph Ltd
 */
/**
 * NOTE: This was an alternative implementation of RT with not using a collaborative
 * list and only the map. Turns out that the list is still simpler despite its bugs.
 * 
 * Creates an instance that synchronizes the graph model and given realtime model.
 * The session ID is used as a prefix in the model to produce unique IDs for new
 * cells. Note that the event information is processed after all changes have
 * been applied to the model, which means some care must be taken to work out
 * the state of the cell as the change was applied. To restore the cell hierarchy
 * the new cells are collected and the references (ie parent, source and target)
 * are restored after all new cells have arrived. pn is a workaround for the shaky
 * collaborative list implementation. It represents the ID of the parent followed
 * by the ID of the next cell in the list of child cells within a parent. Note that
 * changes to pn will trigger changes to the pn of the previous sibling and the new
 * previous sibling.
 * 
 * See https://developers.google.com/drive/eap/realtime/reference/gapi.drive.realtime
 */
function Sharing(model, doc)
{
	this.model = model;
	this.doc = doc;
	this.rt = doc.getModel();
	this.codec = new mxCodec();
	this.init();

	this.log('Sharing started');
};

/**
 * Specifies if logging should be enabled. Default is false.
 */
Sharing.prototype.logging = false;

/**
 * Specifies if warnings should be printed to the console. Default is false.
 */
Sharing.prototype.warnings = false;

/**
 * Specifies the key of the root element in the model. Default is 0.
 */
Sharing.prototype.rootKey = '0';

/**
 * Contains all keys for cells that were added since the last compound edit.
 * Maps from cell ID to {cell: call, map: map}.
 */
Sharing.prototype.arrivals = null;

/**
 * True if a undoableEdit has been scheduled in <executeChange>.
 */
Sharing.prototype.scheduled = false;

/**
 * Synchronizes the collaboration model and the graph model and installs
 * the required listeners to keep them in sync.
 */
Sharing.prototype.init = function()
{
	this.log('Sharing initializing...');

	if (urlParams['reset'] == '1' || this.rt.getRoot().isEmpty())
	{
		this.initializeDocument();
	}
	else
	{
		this.initializeGraphModel(true);
	}

	// Adds a prefix for cell IDs
	var prefix = this.createPrefix();
	this.model.prefix = prefix + '-';

	// Installs the top-level listeners for syncing
	this.installDocumentListener();
	this.installGraphModelListener();
};

/**
 * Syncs initial state from graph model to collab model.
 */
Sharing.prototype.initializeDocument = function()
{
	// Creates an empty map from IDs to cells
	// and recursively adds cells to collab
	this.rt.beginCompoundOperation();
	this.rt.getRoot().clear();
	var map = this.addCell(this.model.root);
	map.put('pn', '-,-');
	this.rt.getRoot().put('timestamp', new Date().getTime());
	this.rt.endCompoundOperation();

	this.log('Document initialized');
};

/**
 * Syncs initial state from collab model to graph model.
 */
Sharing.prototype.initializeGraphModel = function(immediate)
{
	// Adds all cells to the arrivals
	var ids = this.rt.getRoot().getKeys();
	
	for (var i = 0; i < ids.length; i++)
	{
		if (ids[i] != 'timestamp' && ids[i] != this.rootKey)
		{
			this.cellAdded(ids[i], this.rt.getRoot().get(ids[i]), true);
		}
	}
	
	this.rootChanged(true);
	this.log('Graph model initialized');
};

/**
 * Syncs initial state from collab model to graph model.
 */
Sharing.prototype.rootChanged = function(immediate)
{
	// Clears existing changes and resets the lookup table
	this.changes = null;
	
	var root = this.cellAdded(this.rootKey, this.rt.getRoot().get(this.rootKey), true);
	this.executeChange(new mxRootChange(this.model, root), immediate);
};

/**
 * Returns true if the given event is local.
 */
Sharing.prototype.isLocalEvent = function(evt)
{
	return evt.isLocal;
};

/**
 * Looks up the given cell ID first in the arrivals map and if that does not
 * exist or not contain an entry it optionally searched the cell in the model.
 */
Sharing.prototype.lookup = function(id, allowModel)
{
	if (this.arrivals != null)
	{
		var entry = this.arrivals[id];
		
		if (entry != null)
		{
			return entry.cell;
		}
	}
	
	if (allowModel)
	{
		return this.model.getCell(id);
	}
	
	return null;
};

/**
 * Adds the listener for added and removed cells in the collab model and maps
 * them to the graph model.
 */
Sharing.prototype.installDocumentListener = function()
{
	this.rt.getRoot().addValueChangedListener(mxUtils.bind(this, function(evt)
	{
		if (!this.isLocalEvent(evt))
		{
			var key = evt.property;
			this.log('Value changed: key=' + key + ' oldValue=' + evt.oldValue + ' newValue=' + evt.newValue, evt.isLocal == 'true', evt.isLocal);
			
			if (key != 'timestamp')
			{
				if (evt.newValue != null)
				{
					if (key == this.rootKey)
					{
						this.rootChanged(false);
					}
					else
					{
						var map = this.rt.getRoot().get(key);
						var cell = this.cellAdded(key, map, false);
		    			var parnext = map.get('pn');
		    			var idx = parnext.indexOf(',');
		    			var parentId = parnext.substring(0, idx);
		    			var nextId = parnext.substring(idx + 1, parnext.length);
		    			
		    			//if (!this.rt.getRoot().containsKey(parent))
		    			{
		    				// Returns change for after cells have been restored
							this.executeChange(mxUtils.bind(this, function()
							{
								if (this.model.getCell(cell.id) != null || this.arrivals == null || this.arrivals[cell.id] == null)
								{
									var parent = this.lookup(parentId, true);
									
									if (parent != null)
									{
										var next = this.lookup(nextId, true);
										var index = this.model.getChildCount(parent);
										
										if (next != null)
										{
											// Search index of next child for insert
											for (var i = 0; i < index; i++)
											{
												if (this.model.getChildAt(parent, i) == next)
												{
													index = Math.max(0, i - 1);
													break;
												}
											}
										}
										else if (nextId != '-')
										{
											this.warn('*** Next ignored2: cell=' + cell.id + ' next=' + nextId);
										}

										return new mxChildChange(this.model, parent, cell, index);
									}
									else if (parentId != '-')
									{
										this.warn('*** Parent ignored2: cell=' + cell.id + ' parent=' + parentId);
									}
								}
								else
								{
									this.log('*** skipped child change');
								}
								
								return null;
							}));
		    			}
					}
				}
				else if (evt.newValue == null)
				{
					this.cellRemoved(key);
				}
			}
		}
	}));
};

/**
 * Adds the listener for changes on the graph model and maps them to the collab
 * model as a single transaction.
 */
Sharing.prototype.installGraphModelListener = function()
{
	this.model.addListener('startEdit', mxUtils.bind(this, function()
	{
		this.log('startEdit');
		this.rt.beginCompoundOperation();
	}));
	this.model.addListener('executed', mxUtils.bind(this, function(sender, evt)
	{
		this.log('executed', this.dump(evt.getProperty('change')));
		this.processChange(evt.getProperty('change'));
	}));
	this.model.addListener('endEdit', mxUtils.bind(this, function()
	{
		// Updates timestamp
		this.rt.getRoot().put('timestamp', new Date().getTime());
		this.rt.endCompoundOperation();
		this.log('endEdit');
	}));
};

/**
 * Creates and returns a prefix for cell IDs.
 */
Sharing.prototype.createPrefix = function()
{
	var collabs = this.doc.getCollaborators();
	
	for (var i = 0; i < collabs.length; i++)
	{
		if (collabs[i]['isMe'])
		{
			return collabs[i]['sessionId'];
		}
	}
	
	return '';
};

/**
 * Maps the given change to the RT model.
 */
Sharing.prototype.processChange = function(change)
{
	if (change instanceof mxRootChange)
	{
		this.initializeDocument();
	}
	else if (change instanceof mxChildChange)
	{
		var childMap = null;

		if (change.previous == null && change.parent != null)
		{
			childMap = this.addCell(change.child);
		}
		else if (change.previous != null && change.parent == null)
		{
			childMap = this.removeCell(change.child);
		}
		else if (change.previous != null && change.parent != null)
		{
			childMap = this.rt.getRoot().get(change.child.id);
		}
		
		if (childMap != null)
		{
			var oldPrev = null;
			var newPrev = null;
			var newNext = null;
			
			if (change.previous != null && change.previousIndex > 0)
			{
				oldPrev = this.rt.getRoot().get(this.model.getChildAt(change.previous, change.previousIndex - 1).id);
			}
			
			if (change.parent != null && change.index > 0)
			{
				newPrev = this.rt.getRoot().get(this.model.getChildAt(change.parent, change.index - 1).id);
			}
			
			if (change.parent != null && change.index < this.model.getChildCount(change.parent) - 1)
			{
				newNext = this.model.getChildAt(change.parent, change.index + 1);
			}
	
			// Updates pointers
			if (change.parent != null)
			{
				childMap.put('pn', change.parent.id + ',' + ((newNext != null) ? newNext.id : '-'));
			}
	
			if (oldPrev != null)
			{
				oldPrev.put('pn', change.previous.id + ',' + childMap.get('next'));
			}
			
			if (newPrev != null)
			{
				newPrev.put('pn', change.parent.id + ',' + change.child.id);
			}
		}
	}
	else
	{
		var map = this.rt.getRoot().get(change.cell.id);
		
		if (map != null)
		{
			//mxLog.debug(i, mxUtils.getFunctionName(change.constructor));
			if (change instanceof mxTerminalChange)
			{
				var term = change.terminal;
				var key = (change.source) ? 'source' : 'target';
				var id = (term != null) ? term.id : '';
				map.put(key, id);
			}
			else if (change instanceof mxGeometryChange)
			{
				var xml = mxUtils.getXml(this.codec.encode(change.geometry));
				map.put('geometry', xml);
				this.log('updating map ' + change.cell.id + ' xml=' + xml);
			}
			else if (change instanceof mxStyleChange)
			{
				map.put('style', change.style);
			}
			else if (change instanceof mxValueChange)
			{
				map.put('value', change.value);
			}
			else if (change instanceof mxCollapseChange)
			{
				map.put('collapsed', (change.collapsed) ? '1' : '0');
			}
			else if (change instanceof mxVisibleChange)
			{
				map.put('visible', (change.visible) ? '1' : '0');
			}
		}
	}
};

/**
 * Removes the given cell from the document recursively.
 */
Sharing.prototype.removeCell = function(cell)
{
	var childCount = this.model.getChildCount(cell);
	
	for (var i = 0; i < childCount; i++)
	{
		this.removeCell(this.model.getChildAt(cell, i));
	}

	var map = this.rt.getRoot().remove(cell.id);
	this.log('Remove cell: cell=' + cell.id);
	
	return map;
};

/**
 * Invoked if a cell was removed remotely to remove cell from local lookup
 * table and graph model.
 */
Sharing.prototype.cellRemoved = function(id)
{
	var cell = this.cells[id];
	
	if (cell != null)
	{
		this.log('Cell removed: cell=' + id);
		this.executeChange(new mxChildChange(this.model, null, cell));
	}
};

/**
 * Adds existing cells from graph model into collab model recursively
 * and installs the required listeners to keep stuff in sync
 */
Sharing.prototype.addCell = function(cell)
{
	// The change events for these can be ignored as the information
	// is collected in getCell when the cell is initially created.
	var childCount = this.model.getChildCount(cell);
	var last = null;
	
	for (var i = childCount - 1; i >= 0; i--)
	{
		var child = this.model.getChildAt(cell, i);
		var childMap = this.addCell(child);
		
		if (childMap != null)
		{
			childMap.put('pn', cell.id + ',' + ((last != null) ? last.id : '-'));
		}
		
		last = child;
	}

	var map = null;
	
	if (!this.rt.getRoot().containsKey(cell.id))
	{
		map = this.writeCell(cell, this.rt.createMap());
		this.rt.getRoot().put(cell.id, map);
		this.installListeners(cell, map);
		this.log('Add cell: cell=' + cell.id);
	}
	
	return map;
};

/**
 * Creates cell instance from information in collab model and
 * installs the required listeners to keep the instance in sync
 */
Sharing.prototype.cellAdded = function(id, map, immediate)
{
	var cell = this.lookup(id, !immediate);
	
	if (cell == null && map != null)
	{
		cell = this.readCell(map, new mxCell());
		cell.id = id;
		this.installListeners(cell, map);
		
		if (this.arrivals == null)
		{
			this.arrivals = new Object();
		}
		
		this.arrivals[cell.id] = {cell: cell, map: map};
		this.log('Cell added: cell=' + id);
	}
	
	return cell;
};

/**
 * Writes all persistent properties from the cell to the object.
 */
Sharing.prototype.writeCell = function(cell, map)
{
	if (cell.vertex)
	{
		map.put('vertex', 1);
	}
	else if (cell.edge)
	{
		map.put('edge', 1);
	}
	
	if (cell.value != null)
	{
		map.put('value', cell.value);
	}
	
	if (cell.style != null)
	{
		map.put('style', cell.style);
	}
	
	if (cell.geometry != null)
	{
		map.put('geometry', mxUtils.getXml(this.codec.encode(cell.geometry)));
	}

	// True (default) is ignored
	if (!cell.visible)
	{
		map.put('visible', (cell.visible) ? '1' : '0');
	}
	
	// False (default) is ignored
	if (cell.collapsed)
	{
		map.put('collapsed', (cell.collapsed) ? '1' : '0');
	}

	// True (default) is ignored
	if (!cell.connectable)
	{
		map.put('connectable', (cell.connectable) ? '1' : '0');
	}

	if (cell.source != null)
	{
		map.put('source', cell.source.id);
	}
	
	if (cell.target != null)
	{
		map.put('target', cell.target.id);
	}
	
	return map;
};

/**
 * Reads all persistent properties from the object into the cell.
 */
Sharing.prototype.readCell = function(map, cell)
{
	if (map.containsKey('vertex'))
	{
		cell.vertex = true;
	}
	else if (map.containsKey('edge'))
	{
		cell.edge = true;
	}

	if (map.containsKey('value'))
	{
		cell.value = map.get('value');
	}
	
	if (map.containsKey('style'))
	{
		cell.style = map.get('style');
	}
	
	if (map.containsKey('geometry'))
	{
		cell.geometry = this.codec.decode(mxUtils.parseXml(map.get('geometry')).documentElement);
	}
	
	if (map.containsKey('visible'))
	{
		cell.visible = map.get('visible') == '1';
	}
	
	if (map.containsKey('collapsed'))
	{
		cell.collapsed = map.get('collapsed') == '1';
	}
	
	if (map.containsKey('connectable'))
	{
		cell.connectable = map.get('connectable') == '1';
	}

	return cell;
};

/**
 * Creates cell instance from information in collab model and
 * installs the required listeners to keep the instance in sync
 */
Sharing.prototype.restoreCells = function()
{
	for (var key in this.arrivals)
	{
		var entry = this.arrivals[key];
		this.restoreCell(entry.cell, entry.map);
	}
};

/**
 * Establishes connections between new cells and existing cells in the model.
 * If the referenced cell is not in the model we assume that there is a change
 * event that restores the reference later on.
 * 
 * The lookup is an object that maps from cell.id to {cell:cell, map:map}.
 */
Sharing.prototype.restoreCell = function(cell, map)
{
	this.log('Restore cell: cell=' + cell.id);

	// Parses the parnext value
	var parnext = map.get('pn');
	var idx = parnext.indexOf(',');
	var parentId = parnext.substring(0, idx);
	var nextId = parnext.substring(idx + 1, parnext.length);
	
	var parent = this.lookup(parentId);
	
	if (parent != null)
	{
		var next = this.lookup(nextId);
		var index = this.model.getChildCount(parent);
		
		if (next != null)
		{
			// Search index of next child for insert
			for (var i = 0; i < index; i++)
			{
				if (this.model.getChildAt(parent, i) == next)
				{
					index = Math.max(0, i - 1);
					break;
				}
			}
		}
		else if (nextId != '-')
		{
			this.warn('*** Next ignored: cell=' + cell.id + ' next=' + nextId);
		}
		
		this.log('inserted child ' + cell.id + ' into parent ' + parent.id + ' at index ' + index);
		
		parent.insert(cell, index);
	}
	else if (parentId != '-')
	{
		this.warn('*** Parent ignored: cell=' + cell.id + ' parent=' + parentId);
	}

	var id = map.get('source');
	var terminal = this.lookup(id); // this.model.getCell(id);

	if (terminal != null)
	{
		
		this.log('source id for ' + cell.id + ' is ' + id + ' term=' + terminal);
		
		terminal.insertEdge(cell, true);
	}
	else if (id != null && id.length > 0)
	{
		this.warn('*** Terminal ignored: edge=' + cell.id + ' source=' + id);
	}
	
	id = map.get('target');
	terminal = this.lookup(id); //this.model.getCell(id);

	if (terminal != null)
	{
		this.log('target id for ' + cell.id + ' is ' + id + ' term=' + terminal);
		
		terminal.insertEdge(cell, false);
	}
	else if (id != null && id.length > 0)
	{
		this.warn('*** Terminal ignored: edge=' + cell.id + ' target=' + id);
	}
};

Sharing.prototype.installListeners = function(cell, map)
{
	this.log('installListeners ' + cell.id);
	
	// Listen to property changes
	map.addValueChangedListener(mxUtils.bind(this, function(evt)
	{
		if (!this.isLocalEvent(evt))
		{
			var key = evt.property;
			var value = evt.newValue;
	
			if (value != null)
			{
				//this.log('Value changed: cell=' + cell.id + ', key=' + key + ', value=' + value);
				
	    		if (key == 'vertex')
	    		{
	    			cell.vertex = true;
	    		}
	    		else if (key == 'edge')
	    		{
	    			cell.edge = true;
	    		}
	    		else if (key == 'connectable')
	    		{
	    			cell.connectable = (value == '1');
	    		}
	    		else if (key == 'source' || key == 'target')
	    		{
	    			var terminal = (value.length > 0) ? this.lookup(value, true) : null;
	    			this.executeChange(new mxTerminalChange(this.model, cell, terminal, (key == 'source')));
	    		}
	    		else if (key == 'value')
	    		{
	    			this.executeChange(new mxValueChange(this.model, cell, value));
	    		}
	    		else if (key == 'style')
	    		{
	    			this.executeChange(new mxStyleChange(this.model, cell, value));
	    		}
	    		else if (key == 'geometry')
	    		{
	    			var geometry = this.codec.decode(mxUtils.parseXml(value).documentElement);
	    			this.executeChange(new mxGeometryChange(this.model, cell, geometry));
	    		}
	    		else if (key == 'collapsed')
	    		{
	    			this.executeChange(new mxCollapseChange(this.model, cell, value == '1'));
	    		}
	    		else if (key == 'visible')
	    		{
	    			this.executeChange(new mxVisibleChange(this.model, cell, value == '1'));
	    		}
	    		else if (key == 'pn')
	    		{
	    			var parnext = map.get('pn');
	    			var idx = parnext.indexOf(',');
	    			var parentId = parnext.substring(0, idx);
	    			var nextId = parnext.substring(idx + 1, parnext.length);

    				this.executeChange(mxUtils.bind(this, function()
    				{
    	    			var parent = this.lookup(parentId, true);
    	    			
    	    			if (parent != null)
    	    			{
    	    				var next = this.lookup(nextId, true);
    	    				var index = this.model.getChildCount(parent);
    	    				
    	    				if (next != null)
    	    				{
    	    					// Search index of next child for insert
    	    					for (var i = 0; i < index; i++)
    	    					{
    	    						if (this.model.getChildAt(parent, i) == next)
    	    						{
    	    							index = i;
    	    							break;
    	    						}
    	    					}
    	    				}

							if (this.model.getChildAt(parent, index) != cell)
							{
								return new mxChildChange(this.model, parent, cell, index);
							}
						}
    	    			
    	    			return null;
    				}));
	    		}
			}
		}
	}));
};

Sharing.prototype.executeChange = function(change, immediate)
{
	// Immediate clears existing changes
	if (immediate || this.changes == null)
	{
		this.changes = [change];
		this.scheduled = false;
	}
	else
	{
		this.changes.push(change);
	}

	if (!this.scheduled)
	{
		this.scheduled = true;
		
		var exec = mxUtils.bind(this, function()
		{
			if (this.changes != null)
			{
				// Restores new arrivals
				if (this.arrivals != null)
				{
					this.restoreCells(this.arrivals);
					this.arrivals = null;
				}
				
				var tmp = [];
				
				for (var i = 0; i < this.changes.length; i++)
				{
					var change = this.changes[i];
					
					if (typeof(change) == 'function')
					{
						change = change();
						
					}

					if (change != null)
					{
						this.log('Execute change: change=' + this.dump(change));
						tmp.push(change);
						// Do not fire global executed event here
						change.execute();
					}
				}
				
				this.changes = tmp;
				
	    		var edit = new mxUndoableEdit(this.model, true);
	    		edit.changes = this.changes;
	    		this.changes = null;
	    		this.scheduled = false;

	    		edit.notify = function()
	    		{
	    			edit.source.fireEvent(new mxEventObject(mxEvent.CHANGE,
	    				'edit', edit, 'changes', edit.changes));
	    			edit.source.fireEvent(new mxEventObject(mxEvent.NOTIFY,
	    				'edit', edit, 'changes', edit.changes));
	    		};
	    		
	    		this.log('Execute change: changes=' + edit.changes.length);
	    		
	    		this.model.fireEvent(new mxEventObject(mxEvent.CHANGE,
					'edit', edit, 'changes', edit.changes));
	    		this.model.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
			}
		});
		
		if (immediate)
		{
			exec();
		}
		else
		{
			window.setTimeout(exec, 0);
		}
	}
};

/**
 * Writes out a string representing the current state of the document.
 */
Sharing.prototype.dumpRoot = function()
{
	return this.dump(this.rt.getRoot());
};

/**
 * Creates a dump of the given map.
 */
Sharing.prototype.dump = function(obj)
{
	var result = '';
	
	if (obj != null)
	{
		if (obj.constructor == mxCell)
		{
			return obj.id;
		}
		else if (obj.constructor == mxRootChange)
		{
			result += 'mxRootChange[root=' + this.dump(obj.root) + ']';
		}
		else if (obj.constructor == mxChildChange)
		{
			result += 'mxChildChange[parent=' + this.dump(obj.parent) +
				', child=' + this.dump(obj.child.id) +
				', index=' + obj.index + ']';
		}
		else if (obj.constructor == mxTerminalChange)
		{
			result += 'mxTerminalChange[cell=' + this.dump(obj.cell) +
				', terminal=' + this.dump(obj.terminal) +
				', source=' + obj.source + ']';
		}
		else if (obj.constructor == mxValueChange)
		{
			result += 'mxValueChange[cell=' + this.dump(obj.cell) + ', value=' + obj.value + ']';
		}
		else if (obj.constructor == mxGeometryChange)
		{
			result += 'mxGeometryChange[cell=' + this.dump(obj.cell) +
				', geometry=' + mxUtils.getXml(this.codec.encode(obj.cell.geometry)) + ']';
		}
		else if (obj.constructor == mxStyleChange)
		{
			result += 'mxStyleChange[cell=' + this.dump(obj.cell) + ', style=' + obj.style + ']';
		}
		else if (obj.constructor == mxVisibleChange)
		{
			result += 'mxVisibleChange[cell=' + this.dump(obj.cell) + ', visible=' + obj.visible + ']';
		}
		else if (obj.constructor == mxCollapseChange)
		{
			result += 'mxCollapseChange[cell=' + this.dump(obj.cell) + ', collapsed=' + obj.collapsed + ']';
		}
		else if (obj.getKeys != null)
		{
			var keys = obj.getKeys();
			result += '{\n';
			
			for (var i = 0; i < keys.length; i++)
			{
				result += keys[i] + '=' + this.dump(obj.get(keys[i])) + ';\n';
			}
			
			result += '}';
		}
		else if (obj.asArray != null)
		{
			var arr = obj.asArray();
			result += '[';
			
			for (var i = 0; i < arr.length; i++)
			{
				result += arr[i] + ';';
			}
			
			result += ']';
		}
		else
		{
			result = obj;
		}
	}
	else
	{
		result = 'null';
	}
	
	return result;
};

/**
 * Writes the given text to the log if <logging> is enabled.
 */
Sharing.prototype.log = function()
{
	if (this.logging)
	{
		mxLog.debug.apply(mxLog, arguments);
	}
};

/**
 * Writes the given text to the log if <logging> is enabled.
 */
Sharing.prototype.warn = function()
{
	if (this.warnings)
	{
		mxLog.debug.apply(mxLog, arguments);
	}
};

/**
 * Destroys the instance and removes all listeners.
 */
Sharing.prototype.destroy = function()
{
	// TODO: Remove listeners from model
	this.model = null;
	this.doc = null;
	this.rt = null;
	this.codec = null;
};
