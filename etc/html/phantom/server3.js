var page = require('webpage').create();
var server = require('webserver').create();
var system = require('system');
var host, port;

if (system.args.length !== 2) {
    console.log('Usage: server.js <some port>');
    phantom.exit(1);
} else {
    port = system.args[1];
    var listening = server.listen(port, function (request, response)
    {
        console.log("GOT HTTP REQUEST");
       	console.log(JSON.stringify(request, null, 4));
       	
       	if (request.method == 'POST')
        {
        	var params = request.post.split("&");
        	var pst = {};
        	
        	for (var i = 0; i < params.length; i++)
        	{
        		var vals = params[i].split("=");
        		pst[vals[0]] = vals[1];
        	}
        
			var svg = decodeURIComponent(pst['svg']);
			var w = pst['w'];
			var h = pst['h'];
			
			console.log("w=" + w + "h=" + h +"svg=" + svg);

        	page.viewportSize = { width: w, height : h };
			page.content = svg;

       	 	// we set the headers here
        	response.statusCode = 200;
        	
        	response.headers = {"Cache": "no-cache", "Content-Type": "text/plain"};
        	response.write(page.renderBase64('PNG'));
        	
        	/*var data = page.renderBase64('PNG');
        	
        	//"Content-Disposition": "attachment; filename=test.png"
        	//response.headers = {"Cache": "no-cache", "Content-Type": "application/force-download", "Content-Transfer-Encoding": "base64", "Content-Length": data.length, , "Content-Disposition": "attachment; filename=test.png"};
        	response.headers = {"Cache": "no-cache", "Content-Type": "image/png"};
        	response.write(Base64.decode(data, true));*/
        	response.close();
      }
      else
      {
      	response.write("<html><body>No data</body></html>");
        response.close();
       }
    });
    if (!listening) {
        console.log("could not create web server listening on port " + port);
        phantom.exit();
    }
}
