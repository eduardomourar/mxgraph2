import org.mortbay.jetty.Handler;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.handler.HandlerList;
import org.mortbay.jetty.handler.ResourceHandler;
import org.mortbay.jetty.servlet.Context;

/**
 * Simple webserver for ../../.. (workspace root in etc/build)
 */
public class Webserver
{

	public static int DEFAULT_PORT = 8080;

	/**
	 * Maps the workspace to / on the given port.
	 */
	public static void main(String[] args) throws Exception
	{
		int port = DEFAULT_PORT;

		if (args.length > 0)
		{
			port = Integer.parseInt(args[0]);
		}

		Server server = new Server(port);

		Context context = new Context(server, "/");

		ResourceHandler fileHandler = new ResourceHandler();
		fileHandler.setResourceBase("../../../");

		HandlerList handlers = new HandlerList();
		handlers.setHandlers(new Handler[] { fileHandler, context });
		server.setHandler(handlers);

		System.out.println("Server running on port " + port);

		server.start();
		server.join();
	}

}
