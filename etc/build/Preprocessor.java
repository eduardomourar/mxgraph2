import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashSet;
import java.util.Set;

public class Preprocessor
{
	public static StringBuffer processIncludes(String filename, StringBuffer buffer, boolean resolve, String path, Set<String> excludes)
			throws IOException
	{
		BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(filename)));
		String tmp = reader.readLine();
		boolean ignoreLine = false;

		while (tmp != null)
		{
			if (resolve && tmp.trim().startsWith("mxClient.include(mxClient.basePath+"))
			{
				int index = tmp.indexOf("'");
				int end = tmp.indexOf("'", index + 1);
				String fname = tmp.substring(index + 1, end);

				if (excludes == null || !excludes.contains(fname))
				{
					processIncludes(path + fname, buffer, false, path, excludes);
				}
				else
				{
					System.out.println(fname + " ignored");
				}
			}
			else if (tmp.trim().startsWith("// PREPROCESSOR-REMOVE-START"))
			{
				ignoreLine = true;
			}
			else if (tmp.trim().startsWith("// PREPROCESSOR-REMOVE-END"))
			{
				ignoreLine = false;
			}
			else if (!ignoreLine)
			{
				buffer.append(tmp + "\n");
			}

			tmp = reader.readLine();
		}

		reader.close();

		return buffer;
	}

	public static Set<String> parseExcludes(String filename) throws IOException
	{
		HashSet<String> result = new HashSet<String>();

		BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(filename)));
		String tmp = reader.readLine();

		while (tmp != null)
		{
			result.add(tmp);
			tmp = reader.readLine();
		}

		reader.close();

		return result;
	}

	public static void main(String[] args)
	{
		if (args.length >= 2)
		{
			String inputFile = args[0];
			String outputFile = args[1];
			String excludeFile = null;

			if (args.length >= 3)
			{
				excludeFile = args[2];
			}

			String path = new File(inputFile).getParentFile().getParent();

			try
			{
				Set<String> excludes = (excludeFile != null) ? parseExcludes(excludeFile) : null;
				FileWriter fw = new FileWriter(outputFile);
				fw.write(processIncludes(inputFile, new StringBuffer(), true, path, excludes).toString());
				fw.flush();
				fw.close();
				System.out.println(outputFile + " written");
			}
			catch (IOException e)
			{
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			System.exit(0);
		}
		else
		{
			System.out.println("Usage: java Preprocessor inputfile outputfile excludefile");

			System.exit(1);
		}
	}

}
