package com.mxgraph.online;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class SaveServlet
 */
public class RedirectServlet extends HttpServlet
{
	private static final long serialVersionUID = 1L;

	/**
	 * 
	 */
	private static final Logger log = Logger.getLogger(HttpServlet.class
			.getName());

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public RedirectServlet()
	{
		super();
	}

	private static final int IO_BUFFER_SIZE = 4 * 1024;

	private static void copy(InputStream in, OutputStream out)
			throws IOException
	{
		byte[] b = new byte[IO_BUFFER_SIZE];
		int read;
		while ((read = in.read(b)) != -1)
		{
			out.write(b, 0, read);
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		String urlParam = request.getParameter("url");

		if (urlParam != null)
		{
			long t0 = System.currentTimeMillis();

			try
			{
				URL url = new URL(urlParam);
				copy(url.openStream(), response.getOutputStream());

				response.getOutputStream().flush();
				response.getOutputStream().close();
			}
			catch (MalformedURLException e)
			{
				// ...
			}
			catch (IOException e)
			{
				// ...
			}

			long mem = Runtime.getRuntime().totalMemory()
					- Runtime.getRuntime().freeMemory();

			log.info("redirect: ip=" + request.getRemoteAddr() + " ref=\""
					+ request.getHeader("Referer") + "\" in="
					+ request.getContentLength() + " url=" + urlParam + " xml="
					+ " dt=" + request.getContentLength() + " mem=" + mem
					+ " dt=" + (System.currentTimeMillis() - t0));
		}
		else
		{
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		}
	}

}
