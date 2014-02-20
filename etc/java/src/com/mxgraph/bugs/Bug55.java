package com.mxgraph.bugs;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.w3c.dom.Document;

import com.mxgraph.io.mxCodec;
import com.mxgraph.io.mxCodecRegistry;
import com.mxgraph.io.mxObjectCodec;
import com.mxgraph.util.mxUtils;
import com.mxgraph.util.mxXmlUtils;

/**
 * Deserialization doesn't work for an Object template muted to an Array
 * (allocation is not performed).
 */
public class Bug55
{

	Object data;

	public Bug55()
	{
		data = new Object();
	}

	public Object getData()
	{
		return data;
	}

	public void setData(Object data)
	{
		this.data = data;
	}

	/**
	 * Main test
	 * 
	 * @param args
	 *            not used
	 * @throws Exception on error
	 */
	public static void main(String[] args) throws Exception
	{
		mxCodecRegistry.addPackage("com.mxgraph.bugs");

		mxCodecRegistry.register(new mxObjectCodec(new Bug55()));

		Bug55 myDataToSave = new Bug55();
		List<Double> list = new ArrayList<Double>();
		list.add(new Double(1));
		myDataToSave.data = list;

		saveData(myDataToSave);

		Bug55 readData = readData();
		
		// FIXME: mxObject codec uses the default field value as the template
		// for new field instances. This means the data of declared type
		// Object with the default value of an Object instance is decoded
		// as an Object but it should be an ArrayList for the actual data.
		if (readData.data instanceof Object)
		{
			throw new Exception("Wrongly decoded data");
		}
	}

	private static void saveData(Bug55 myDataToSave) throws IOException
	{
		mxCodec codec = new mxCodec();
		String xml = mxUtils.getPrettyXml(codec.encode(myDataToSave));

		mxUtils.writeFile(xml, "Serialization.xml");
	}

	private static Bug55 readData() throws IOException
	{
		String xml = mxUtils.readFile("Serialization.xml");

		Document document = mxXmlUtils.parseXml(xml);
		return (Bug55) new mxCodec(document).decode(document
				.getDocumentElement());
	}
}
