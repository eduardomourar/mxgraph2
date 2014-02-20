//
// Usage: cat phantom.xml | phantomjs phantom.js > output.svg
//
var system = require('system');
var page = require('webpage').create();
var xml = system.stdin.readLine();

page.open('http://devhost.jgraph.com:8888/draw.html', function(status)
{
	if (status !== 'success')
	{
		console.log('Unable to load the page');
	}
	else
	{
		system.stdout.writeLine(page.evaluate(function(xml)
		{
			return render(xml);
		}, xml));
		
		phantom.exit();
	}
});
