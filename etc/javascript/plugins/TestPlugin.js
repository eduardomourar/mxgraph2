/**
 * Sample plugin, see https://gist.github.com/4266731
 */
Draw.loadPlugin(function(ui)
{
	// Adds custom sidebar entry
	ui.sidebar.addPalette('helloWorldLibrary', 'Hello, World!', true, function(content)
	{
	    content.appendChild(ui.sidebar.createVertexTemplate(null, 120, 60));
	    content.appendChild(ui.sidebar.createVertexTemplate('rounded=1', 120, 60));
	    content.appendChild(ui.sidebar.createVertexTemplate('ellipse', 80, 80));
	    content.appendChild(ui.sidebar.createVertexTemplate('shape=hexagon', 120, 80));
	    
	    // Image URLs in styles must be public for export
	    content.appendChild(ui.sidebar.createVertexTemplate('shape=image;' +
	    		'aspect=0;image=http://www.jgraph.com/images/mxgraph.gif', 120, 80));

	    content.appendChild(ui.sidebar.createEdgeTemplate('edgeStyle=none;endArrow=none;', 100, 100));
	    content.appendChild(ui.sidebar.createEdgeTemplate('shape=link', 100, 100));
	    content.appendChild(ui.sidebar.createEdgeTemplate('arrow', 100, 100));
	});
	
	// Collapses default sidebar entry and inserts this before
	var c = ui.sidebar.container;
	c.firstChild.click();
	c.insertBefore(c.lastChild, c.firstChild);
	c.insertBefore(c.lastChild, c.firstChild);

	// Adds logo to footer
	ui.footerContainer.innerHTML = '<img align="right" style="margin-top:14px;margin-right:6px;" ' +
		'src="http://www.draw.io/images/logo-small.gif"/>';

	// Adds resource for action
	mxResources.parse('helloWorldAction=Hello, World!');
	
	// Adds action
	ui.actions.addAction('helloWorldAction', function()
	{
		mxUtils.alert('Hello, World');
	});

	// Adds menu
	ui.menubar.addMenu('Hello, World Menu', function(menu, parent)
	{
		ui.menus.addMenuItem(menu, 'helloWorldAction');
	});
	
	// Reorders menubar
	ui.menubar.container.insertBefore(ui.menubar.container.lastChild,
		ui.menubar.container.lastChild.previousSibling.previousSibling);
	
	// Adds toolbar button
	ui.toolbar.addSeparator();
	var elt = ui.toolbar.addItem('', 'helloWorldAction');
	
	// Cannot use built-in sprites
	elt.firstChild.style.backgroundImage = 'url(http://www.draw.io/images/logo-small.gif)';
	elt.firstChild.style.backgroundPosition = '2px 3px';
	
	// Displays status message
	ui.editor.setStatus('Hello, World!');
});
