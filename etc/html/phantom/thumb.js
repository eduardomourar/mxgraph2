// Create thumbnails for all XML files in a directory (recursively):
//
// for FILE in `find ~/git/drawio/war/templates -name "*.xml"`; do FILENAME=`echo ${FILE} | sed 's/\.xml/\.png/g'`; echo "Converting ${FILE}..."; cat ${FILE} | /usr/local/phantomjs-1.9.6-macosx/bin/phantomjs thumb.js `echo ${FILENAME}`; done;
//
var system = require('system');
var page = require('webpage').create();
var xml = system.stdin.readLine();

page.open('http://devhost.jgraph.com:8888/thumb.html', function(status)
{
	var output = system.args[1];
	
	if (status !== 'success')
	{
		console.log('Unable to load the page');
	}
	else
	{
		page.clipRect = {top: 0, left: 0, width: 176, height: 176};
		
    	page.evaluate(function(xml)
		{
			render(xml, 176, 176);
		}, xml);
    	
        page.render(output);
        phantom.exit();
	}
});
