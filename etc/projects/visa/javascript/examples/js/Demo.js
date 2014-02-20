/**
 * Class: Demo
 * 
 * Demo for subclassing <vsEditor> and implementing the <doubleClick> and
 * <popupMenu> hooks.
 */
{
	/**
	 * Constructor: vsEditor
	 *
	 * Constructs a new read-only VISA Network Editor with a custom double
	 * click and popup menu.
	 */
	function Demo(container, path)
	{
		vsEditor.call(this, container);
		this.path = path;
		this.graph.loadStyle(path+'/../../xml/src/defaultstyle.xml');
	};

	/**
	 * Extends <vsEditor>.
	 */
	Demo.prototype = new vsEditor();
	Demo.prototype.constructor = Demo;

	/**
	 * See <vsEditor.doubleClick>.
	 */
	Demo.prototype.doubleClick = function(graph, evt, cell)
	{
		window.open('http://www.visa.com');
	};

	/**
	 * See <vsEditor.popupMenu>.
	 */
	Demo.prototype.popupMenu = function(graph, menu, cell, evt)
	{
		var image = this.path+'/images/image.png';
		
		if (cell != null)
		{
			menu.addItem('Status', image, mxUtils.bind(this, function()
			{
				alert('Sample item for '+cell.getAttribute('label')+
					' ('+cell.getId()+')' +  
					' style='+cell.style);
			}));
		}
		else
		{
			var readOnly = !graph.isConnectable();
						
			menu.addItem((readOnly) ? 'Read/Write' : 'Read Only',
				image, mxUtils.bind(this, function()
			{
				graph.setReadOnly(!readOnly);
				this.rubberband.setEnabled(readOnly);
			}));
					
			var isVisible = mxLog.isVisible();
			
			menu.addItem((isVisible) ? 'Hide Console' : 'Show Console',
				image, mxUtils.bind(this, function()
			{
				mxLog.setVisible(!isVisible);
			}));
		}

		menu.addSeparator();

		var examples = menu.addItem('Examples', image);
		
		for (var i = 1; i <= 22; i++)
		{
			menu.addItem('Example'+i, image, this.createExampleFunction(graph, i), examples);
		}
		
		var styles = menu.addItem('Styles', image); 

		menu.addItem('Style1', image, mxUtils.bind(this, function()
		{
			graph.loadStyle(this.path+'/../../xml/src/defaultstyle.xml');
			
			if (graph.getModel().getChildCount(graph.getDefaultParent()) > 0)
			{
				graph.refresh();
			}
		}), styles);
			
		menu.addItem('Style2', image, mxUtils.bind(this, function()
		{
			graph.loadStyle(this.path+'/../../xml/examples/alternatestyle.xml');
			
			if (graph.getModel().getChildCount(graph.getDefaultParent()) > 0)
			{
				graph.refresh();
			}
		}), styles);
			
		menu.addSeparator();

		menu.addItem('Refresh', image, mxUtils.bind(this, function()
		{
			var t0 = new Date().getTime();
			graph.refresh();
			alert('Refresh took '+(new Date().getTime() - t0)+' ms');
		}));
	};

	/**
	 * See <vsEditor.popupMenu>.
	 */
	Demo.prototype.createExampleFunction = function(graph, index)
	{
		return mxUtils.bind(this, function()
		{
			graph.loadFile(this.path+'/../../xml/examples/example'+index+'.xml');
		});
	};

}
