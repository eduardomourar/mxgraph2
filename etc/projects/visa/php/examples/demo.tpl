<!--
  Copyright (c) 2006, Gaudenz Alder
  
  Template HTML page for the VISA Network Editor - Demo.
-->
<html>
<head>
	<title>VISA Network Editor - Demo</title>
	<script type="text/javascript">
		mxBasePath = '../../../mxgraph/javascript/src';
	</script>
	<script type="text/javascript" src="../../../mxgraph/javascript/src/js/mxClient.js"></script>
	<script type="text/javascript" src="../../javascript/src/js/vsShapes.js"></script>
	<script type="text/javascript" src="../../javascript/src/js/vsGraphModel.js"></script>
	<script type="text/javascript" src="../../javascript/src/js/vsEdgeStyle.js"></script>
	<script type="text/javascript" src="../../javascript/src/js/vsPerimeter.js"></script>
	<script type="text/javascript" src="../../javascript/src/js/vsGraph.js"></script>
	<script type="text/javascript" src="../../javascript/src/js/vsEditor.js"></script>
	<script type="text/javascript" src="../../javascript/examples/js/Demo.js"></script>
	<script type="text/javascript">
		function main(container, xml)
		{
			if (mxClient.isBrowserSupported())
			{
				// Enables crisp rendering in SVG
				mxRectangleShape.prototype.crisp = true;
			
				mxEvent.disableContextMenu(container);
				container.style.background = '';
				
				var editor = new Demo(container, '../../javascript/examples');

				// Parses the XML and loads it into the graph			
				editor.graph.load(mxUtils.parseXml(xml).documentElement);
				
				if (mxClient.IS_IE)
				{
					new mxDivResizer(container);
		
					window.onunload = function(evt)
					{
						window.onunload = null;
						editor.destroy();
					}
				}
			}
			else
			{
				container.style.background = 'url(images/broken.gif) no-repeat';
				
				container.style.fontFamily = 'Helvetica,Arial';
				container.style.fontSize = '11px';
				
				mxUtils.br(container, 4);
				mxUtils.write(container, 'Browser is not supported');
			}
		}
	</script>
</head>
<body style="background:#F9F7ED;" onload="main(document.getElementById('graph'), '{$xml}');">
	<table>
	<tr>
	<td style="background:#EEEEEE;">
	<font size="5"><strong>VISA Network Editor - Demo</strong></font>
	</td>
	</tr>
	<tr>
	<td>
	<div id="graph" style="position:relative;overflow:hidden;border-color:#CDCDCD;border-style:solid;border-width:1px;height:200px;width:300px;background:url('../../../javascript/examples/images/loading.gif') no-repeat;cursor:default;">
	</div>
	<p>
		Use right click or shift click for popup menu or double click one of the cells. 
	</td>
	</tr>
	</table>
</body>
</html>
