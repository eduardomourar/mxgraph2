package com.mxgraph.properties;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.Hashtable;
import java.util.LinkedHashMap;
import java.util.Map.Entry;
import java.util.TreeMap;

import javax.swing.JFileChooser;
import javax.swing.filechooser.FileNameExtensionFilter;

/**
 * NOTE: This is a modification of PropGen2.java which was used to convert
 * from the old mxGraph Translations to the new Diagramly Resources sheet.
 */
public class PropGenConverter
{
	/**
	 * @param args
	 */
	public static void main(String[] args)
	{
		File tsvFile = selectFile("Select TSV file", "tsv");

		if (tsvFile != null)
		{
			try
			{
				execute(tsvFile,
						selectFile("Select Properties file", "properties"));
			}
			catch (IOException e)
			{
				e.printStackTrace();
			}
		}
	}

	/**
	 * Creates the translations for the given files.
	 */
	public static void execute(File tsvFile, File propFile) throws IOException
	{
		if (tsvFile != null && propFile != null)
		{
			// Parses the input files
			Hashtable<String, String[]> resources = parseResources(tsvFile);
			LinkedHashMap<String, String> properties = parseProperties(propFile);

			// Reads language codes from empty key
			String[] codes = resources.get("");
			StringBuilder[] props = new StringBuilder[codes.length];

			// Prepares output files in memory
			for (int i = 0; i < props.length; i++)
			{
				props[i] = new StringBuilder();
			}

			// Creates result in memory
			for (Entry<String, String> entry : properties.entrySet())
			{
				insertEntry(props, entry, resources);
			}

			String basepath = propFile.getAbsolutePath();
			int index = basepath.indexOf(".properties");

			if (index > 0)
			{
				basepath = basepath.substring(0, index);
			}

			// Writes output files
			/*for (int i = 0; i < props.length; i++)
			{
				if (!codes[i].equals("en"))
				{
					try
					{
						File file = new File(basepath + "_" + codes[i]
								+ ".properties");
						BufferedWriter writer = new BufferedWriter(new FileWriter(
								file));
						writer.write("# *DO NOT DIRECTLY EDIT THIS FILE, IT IS AUTOMATICALLY GENERATED AND IT IS BASED ON:*\n");
						writer.write("# https://docs.google.com/spreadsheet/ccc?key=0AsWNmkSxRc5EdEVCdGdSeklEZjRqYWo4Tl9KTjFfWEE&hl\n");
						writer.write(props[i].toString());
						writer.close();
			
						System.out.println(file.getAbsolutePath() + " created");
					}
					catch (Exception ex)
					{
						ex.printStackTrace();
					}
				}
			}*/

			// Writes output files
			File file = new File(basepath + ".tsv");
			//BufferedWriter writer = new BufferedWriter(new FileWriter(file));
			BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
					new FileOutputStream(file), "ISO-8859-1"));

			writer.write("\t");

			for (int i = 0; i < props.length; i++)
			{
				writer.write(codes[i]);
				writer.write("\t");
			}

			writer.write("\n");

			TreeMap<String, String> sortedProperties = new TreeMap<String, String>();

			// Creates result in memory
			for (Entry<String, String> entry : properties.entrySet())
			{
				sortedProperties.put(entry.getKey(), entry.getValue());
			}

			// Creates result in memory
			for (Entry<String, String> entry : sortedProperties.entrySet())
			{
				if (!entry.getValue().equals(""))
				{
					String[] translations = resources.get(entry.getValue());

					if (translations != null)
					{
						writer.write(entry.getKey());
						writer.write("\t");

						for (int i = 0; i < props.length; i++)
						{
							String trans = (translations.length > i) ? translations[i]
									.trim() : "";

							if (trans.equals("-") || trans.equals("+"))
							{
								trans = "";
							}

							writer.write(trans);
							writer.write("\t");
						}

						writer.write("\n");
					}
				}
			}

			// Creates result in memory
			for (Entry<String, String> entry : properties.entrySet())
			{
				if (!entry.getValue().equals(""))
				{
					String[] translations = resources.get(entry.getValue());

					if (translations != null)
					{
						writer.write(entry.getKey());
						writer.write("\t");

						for (int i = 0; i < props.length; i++)
						{
							String trans = (translations.length > i) ? translations[i]
									.trim() : entry.getValue();

							if (trans.equals("") || trans.equals("-")
									|| trans.equals("+"))
							{
								trans = "";
							}

							writer.write(trans);
							writer.write("\t");
						}

						writer.write("\n");
					}
				}
			}

			// Creates result in memory
			for (Entry<String, String> entry : properties.entrySet())
			{
				if (!entry.getValue().equals(""))
				{
					String[] translations = resources.get(entry.getValue());

					if (translations != null)
					{
						writer.write(entry.getKey());
						writer.write("\t");

						for (int i = 0; i < props.length; i++)
						{
							String trans = (translations.length > i) ? translations[i]
									.trim() : entry.getValue();

							if (trans.equals("") || trans.equals("-")
									|| trans.equals("+"))
							{
								trans = "";
							}

							writer.write(trans);
							writer.write("\t");
						}

						writer.write("\n");
					}
				}
			}

			writer.close();

			System.out.println(file.getAbsolutePath() + " created");
			System.out.println("Done");
		}
		else
		{
			System.out.println("No file specified");
		}
	}

	/**
	 * Encodes the given string.
	 */
	public static void insertEntry(StringBuilder[] props,
			Entry<String, String> entry, Hashtable<String, String[]> resources)
	{
		if (entry.getValue().equals(""))
		{
			for (int i = 0; i < props.length; i++)
			{
				props[i].append(entry.getKey() + '\n');
			}
		}
		else
		{
			String[] translations = resources.get(entry.getValue());

			if (translations != null)
			{
				for (int i = 0; i < props.length; i++)
				{
					String trans = (translations.length > i) ? translations[i]
							.trim() : entry.getValue();

					if (trans.equals("") || trans.equals("-")
							|| trans.equals("+"))
					{
						trans = entry.getValue();
					}

					props[i].append(entry.getKey() + "=" + encodeString(trans)
							+ '\n');
				}
			}
			else
			{
				System.out.println("Missing translations for: "
						+ entry.getValue());

				String tmp = entry.getKey() + "="
						+ encodeString(entry.getValue()) + '\n';

				for (int i = 0; i < props.length; i++)
				{
					props[i].append(tmp);
				}
			}
		}
	}

	/**
	 * Encodes the given string.
	 */
	public static String encodeString(String value)
	{
		StringBuilder result = new StringBuilder();
		value = value.trim();

		for (int j = 0; j < value.length(); j++)
		{
			char character = value.charAt(j);

			String hexString = Integer.toHexString(character);

			// +255 value must have 4 digits, 3 doesn't work
			if (hexString.length() == 3)
			{
				hexString = "0" + hexString;
			}

			// Have to convert '%' too
			if (character == 37 || (character > 127 && character < 256))
			{
				result.append("%" + hexString);
			}
			else if (character > 255)
			{
				result.append("%u" + hexString);
			}
			else
			{
				result.append(value.substring(j, j + 1));
			}
		}

		return result.toString();
	}

	/**
	 * Parses the given properties file.
	 */
	public static LinkedHashMap<String, String> parseProperties(File propFile)
			throws IOException
	{
		LinkedHashMap<String, String> result = new LinkedHashMap<String, String>();
		BufferedReader in = new BufferedReader(new InputStreamReader(
				new FileInputStream(propFile), "UTF-8"));
		String line;

		while ((line = in.readLine()) != null)
		{
			int index = line.indexOf("=");

			if (index > 0)
			{
				String key = line.substring(0, index);
				String value = line.substring(index + 1);

				result.put(key, value);
			}
			else
			{
				result.put(line, "");
			}
		}

		return result;
	}

	/**
	 * Parses the given tsv file.
	 */
	public static Hashtable<String, String[]> parseResources(File tsvFile)
			throws IOException
	{
		Hashtable<String, String[]> resources = new Hashtable<String, String[]>();
		BufferedReader in = new BufferedReader(new InputStreamReader(
				new FileInputStream(tsvFile), "ISO-8859-1"));
		String line = in.readLine();
		line = in.readLine();

		if (line != null)
		{
			String[] codes = line.split("\t");

			if (codes.length > 0)
			{
				// Stores language codes under empty key
				resources.put("", codes);

				while ((line = in.readLine()) != null)
				{
					String[] entries = line.split("\t");

					if (entries.length > 0 && entries[0].length() > 0)
					{
						resources.put(entries[0], entries);
					}
				}
			}
		}

		return resources;
	}

	/**
	 * Shows a file dialog.
	 */
	public static File selectFile(String title, String extension)
	{
		JFileChooser chooser = new JFileChooser();
		chooser.addChoosableFileFilter(new FileNameExtensionFilter(extension
				.toUpperCase() + " File", extension));
		chooser.setFileSelectionMode(JFileChooser.FILES_ONLY);
		chooser.setDialogTitle(title);

		if (chooser.showOpenDialog(chooser) == JFileChooser.APPROVE_OPTION)
		{
			return chooser.getSelectedFile();
		}

		return null;
	}

}
