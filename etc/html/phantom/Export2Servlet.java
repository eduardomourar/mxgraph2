/**
 * Copyright (c) 2011-2012, JGraph Ltd
 */
package com.mxgraph.examples.web;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;

import org.xml.sax.SAXException;

import com.lowagie.text.DocumentException;
import com.lowagie.text.pdf.codec.Base64;

/**
 * Servlet implementation class ImageServlet.
 */
public class Export2Servlet extends HttpServlet
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -5040708166131034515L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public Export2Servlet()
	{
		super();
	}

	/**
	 * Handles exceptions and the output stream buffer.
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		try
		{
			if (request.getContentLength() < Constants.MAX_REQUEST_SIZE)
			{
				long t0 = System.currentTimeMillis();

				handleRequest(request, response);

				long mem = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
				long dt = System.currentTimeMillis() - t0;

				System.out.println("export: ip=" + request.getRemoteAddr() + " ref=\"" + request.getHeader("Referer") + "\" length="
						+ request.getContentLength() + " mem=" + mem + " dt=" + dt);
			}
			else
			{
				response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
			}
		}
		catch (OutOfMemoryError e)
		{
			e.printStackTrace();
			final Runtime r = Runtime.getRuntime();
			System.out.println("r.freeMemory() = " + r.freeMemory() / 1024.0 / 1024);
			System.out.println("r.totalMemory() = " + r.totalMemory() / 1024.0 / 1024);
			System.out.println("r.maxMemory() = " + r.maxMemory() / 1024.0 / 1024);
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}
		catch (Exception e)
		{
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}
		finally
		{
			response.getOutputStream().flush();
			response.getOutputStream().close();
		}
	}

	/**
	 * Gets the parameters and logs the request.
	 * 
	 * @throws ParserConfigurationException 
	 * @throws SAXException 
	 * @throws DocumentException 
	 */
	protected void handleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception
	{
		// Parses parameters
		String fname = request.getParameter("filename");
		int w = Integer.parseInt(request.getParameter("w"));
		int h = Integer.parseInt(request.getParameter("h"));
		String svg = getRequestXml(request);

		// Checks parameters
		if (w > 0 && w <= Constants.MAX_WIDTH && h > 0 && h <= Constants.MAX_HEIGHT && svg != null && svg.length() > 0)
		{
			writeImage(fname, w, h, svg, response);
			response.setStatus(HttpServletResponse.SC_OK);
		}
		else
		{
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		}
	}

	/**
	 * Gets the XML request parameter.
	 */
	protected String getRequestXml(HttpServletRequest request) throws IOException, UnsupportedEncodingException
	{
		return request.getParameter("svg"); //URLDecoder.decode(request.getParameter("svg"), "UTF-8");
	}

	/**
	 * @throws ParserConfigurationException
	 * @throws SAXException
	 * @throws IOException
	 * 
	 */
	protected void writeImage(String fname, int w, int h, String svg, HttpServletResponse response) throws IOException, SAXException,
			ParserConfigurationException
	{
		String urlParams = "w=" + w + "&h=" + h + "&svg=" + svg;

		// Sends the request to the phantom webserver (see server3.js)
		URL url = new URL("http://192.168.0.22:8080/");
		URLConnection conn = url.openConnection();
		conn.setDoOutput(true);
		OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());

		writer.write(urlParams);
		writer.flush();

		// Gets the response
		StringBuffer answer = new StringBuffer();
		BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
		String line;
		while ((line = reader.readLine()) != null)
		{
			answer.append(line);
		}
		writer.close();
		reader.close();

		System.out.println(answer.toString());
		response.setContentType("application/x-unknown");
		response.setHeader("Content-Disposition", "attachment; filename=\"" + fname + "\"");

		byte[] data = Base64.decode(answer.toString());
		ServletOutputStream sos = response.getOutputStream();
		sos.write(data, 0, data.length);
		sos.flush();
		sos.close();
	}

}
