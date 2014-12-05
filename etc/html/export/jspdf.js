
/**
 * jsPDF
 * 
 * Open Issues:
 * 
 * - HTML rendering
 * - Add rotation
 * - Add support for dash patterns
 * - Add clipped/vertical (PDF) labels
 * - Add image aspect (PDF)
 * - Add compression (PDF)
 * - PNG/GIF in PDF:
 *    - PNG mask via canvas or direct IDAT change
 *      See https://github.com/devongovett/pdfkit/blob/master/lib/image/png.coffee
 *     - GIF via canvas and PNG as Data URL
 * - Fonts in PDF:
 *    - Embedded fonts and font mapping
 *    - MeasureString via canvas/HTML
 *    
 * See http://www.adobe.com/content/dam/Adobe/en/devnet/pdf/pdfs/PDF32000_2008.pdf
 * for PDF specification.
 */

var jsPDF = function()
{
	// TODO: Cannot compress using zip_deflate (see rawdeflate.js)?
	var compress = false;
	var buffer = '';
	
	var pdfVersion = '1.4'; // PDF Version
	var defaultPageFormat = 'a4';
	var pageFormats = { // Size in mm of various paper formats
		'a3': [841.89, 1190.55],
		'a4': [595.28, 841.89],
		'a5': [420.94, 595.28],
		'letter': [612, 792],
		'legal': [612, 1008]
	};
	
	var textColor = '0 g';
	var page = 0;
	var objectNumber = 2; // 'n' Current object number
	var state = 0; // Current document state
	var scale = 1;
	var tx = 0;
	var ty = 0;
	var pages = new Array();
	var colorCache = new Object();
	var images = new Object();
	var imageCount = 0;
	var gstates = new Object();
	var gstateCount = 0;
	var patterns = new Object();
	var patternCount = 0;
	var offsets = new Array(); // List of offsets
	var lineWidth = 0.200025; // 2mm
	var pageHeight;
	var M_SQRT2 = Math.sqrt(2);
	var M_RAD_PER_DEG = Math.PI / 180;
	var k; // Scale factor
	var unit = 'pt'; //'mm'; // Default to mm for units
	var fontNumber; // TODO: This is temp, replace with real font handling
	var documentProperties = {};
	var fontSize = mxConstants.DEFAULT_FONTSIZE; // Default font size
	var pageFontSize = mxConstants.DEFAULT_FONTSIZE;
	var waitCounter = 0;
	var onComplete = null;
	var canvas = null;
	var lastMoveX = 0;
	var lastMoveY = 0;
	
	try
	{
		canvas = document.createElement('canvas');
	}
	catch (e)
	{
		// ignore
	}
	
	// Initilisation 
	if (unit == 'pt')
	{
		k = 1;
	}
	else if(unit == 'mm')
	{
		k = 72/25.4;
	}
	else if(unit == 'cm')
	{
		k = 72/2.54;
	}
	else if(unit == 'in')
	{
		k = 72;
	}
	
	var ks = k * scale;
	var ps = 1;
	
	// Private functions
	var newObject = function()
	{
		//Begin a new object
		objectNumber ++;
		offsets[objectNumber] = buffer.length;
		out(objectNumber + ' 0 obj');		
	};
	
	var putHeader = function()
	{
		out('%PDF-' + pdfVersion);
	};
	
	var putPages = function()
	{
		
		// TODO: Fix, hardcoded to a4 portrait
		var wPt = pageWidth * k;
		var hPt = pageHeight * k;
		var filter = (compress) ? '/Filter /FlateDecode ' : '';

		for(n=1; n <= page; n++)
		{
			newObject();
			out('<</Type /Page');
			out('/Parent 1 0 R');	
			out('/Resources 2 0 R');
			out('/Contents ' + (objectNumber + 1) + ' 0 R>>');
			out('endobj');
			
			//Page content
			p = pages[n]; //(compress) ? zip_deflate(pages[n]) : pages[n];
			newObject();
			out('<<'+filter+'/Length ' + p.length  + '>>');
			putStream(p);
			out('endobj');
		}
		
		offsets[1] = buffer.length;
		out('1 0 obj');
		out('<</Type /Pages');
		var kids='/Kids [';
		
		for (i = 0; i < page; i++) {
			kids += (3 + 2 * i) + ' 0 R ';
		}
		
		out(kids + ']');
		out('/Count ' + page);
		out('/MediaBox [0 0 ' + f2(wPt) + ' ' + f2(hPt) + ']');
		out('>>');
		out('endobj');		
	};
	
	var putStream = function(str)
	{
		out('stream');
		out(str);
		out('endstream');
	};
	
	var putResources = function()
	{
		putFonts();
		putPatterns();
		putGStates();
		putImages();
		
		//Resource dictionary
		offsets[2] = buffer.length;
		out('2 0 obj');
		out('<<');
		putResourceDictionary();
		out('>>');
		out('endobj');
	};
	
	var putFonts = function()
	{
		// TODO: Only supports core font hardcoded to Helvetica
		newObject();
		fontNumber = objectNumber;
		name = 'Helvetica';
		out('<</Type /Font');
		out('/BaseFont /' + name);
		out('/Subtype /Type1');
		out('/Encoding /WinAnsiEncoding');
		out('>>');
		out('endobj');
	};
	
	var incWaitCounter = function()
	{
		waitCounter++;
	};
	
	var decWaitCounter = function()
	{
		waitCounter--;
		
		if (waitCounter == 0 && onComplete != null)
		{
			onComplete();
			onComplete = null;
		}
	};
	
	var putPatterns = function()
	{
		for (var key in patterns)
		{
			var pattern = patterns[key];
			
			newObject();
			pattern.n = objectNumber;
			
			out('<</Matrix[1 0 0 1 0 0]/Shading '+(pattern.n + 1)+' 0 R/PatternType 2>>');
			out('endobj');
			
			newObject();
			out('<</Coords['+f2(pattern.x)+' '+f2(pattern.y)+' '+f2(pattern.w)+' '+f2(pattern.h)+']' +
				'/ColorSpace/DeviceRGB/ShadingType 2/Extend[true true]/Function '+(pattern.n + 2)+' 0 R>>');
			out('endobj');
			
			newObject();
			out('<</C0['+f2(pattern.c1.red)+' '+f2(pattern.c1.green)+' '+f2(pattern.c1.blue)+']/FunctionType 2'+
				'/C1['+f2(pattern.c2.red)+' '+f2(pattern.c2.green)+' '+f2(pattern.c2.blue)+']/Domain[0 1]/N 1>>');
			out('endobj');
		}
	};
	
	var putGStates = function()
	{
		for (var key in gstates)
		{
			var gstate = gstates[key];
			
			newObject();
			gstate.n = objectNumber;
			out('<</ca '+gstate.alpha+'>>');
			out('endobj');
			
			newObject();
			//gstate.n = objectNumber;
			out('<</CA '+gstate.alpha+'>>');
			out('endobj');
		}
	};
	
	var putImages = function()
	{
		for (var key in images)
        {
			var info = images[key];
			
			if (info.data != null)
			{
				newObject();
				images[key].n = objectNumber;
				
				var filter = (compress) ? '/Filter /FlateDecode ' : '';
				out('<</Type /XObject');
                out('/Subtype /Image');
                out('/Width '+info.w);
                out('/Height '+info.h);
                if(info.cs=='Indexed')
                        out('/ColorSpace [/Indexed /DeviceRGB '+(info.pal.length/3-1)+' '+(objectNumber+1)+' 0 R]');
                else
                {
                        out('/ColorSpace /'+info.cs);
                        if(info.cs=='DeviceCMYK')
                                out('/Decode [1 0 1 0 1 0 1 0]');
                }
                
                out('/BitsPerComponent '+info.bpc);
                out('/Filter /'+info.f);
                
                if (info.parms != null && info.parms.length > 0)
                {
                	out(info.parms);
                }
                
                if(info.trns instanceof Array)
                {
                    var trns = '';
                    
                    for(var i = 0; i < info.trns.length; i++)
                    {
                    	trns += info.trns[i] + ' ' + info.trns[i] + ' '; 
                    }
                    
                    out('/Mask ['+trns+']');
                }
                
                out('/Length '+info.data.length+'>>');
                
                putStream(info.data);
        		delete info.data;
                out('endobj');
                
                //Palette
                if(info.cs == 'Indexed')
                {
                    newObject();
                    var pal= info.pal; //(compress) ? zip_deflate(info.pal) : info.pal;
                    out('<<'+filter+'/Length '+pal.length+'>>');
                    putStream(pal);
                    out('endobj');
                }
			}
        }
	};
	
	var putResourceDictionary = function()
	{
		out('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
		out('/Font <<');
		// Do this for each font, the '1' bit is the index of the font
        // fontNumber is currently the object number related to 'putFonts'
		out('/F1 ' + fontNumber + ' 0 R');
		out('>>');
		out('/Pattern <<');
		putPatternDict();
		out('>>');
		out('/ExtGState <<');
		putExtGStateDict();
		out('>>');
		out('/XObject <<');
		putXobjectDict();
		out('>>');
	};
	
	var putPatternDict = function()
	{
		// Loop through images
		for (var key in patterns)
		{
			var pattern = patterns[key];
			
			if (pattern.n != null)
			{
				out('/P'+pattern.i+' '+pattern.n+' 0 R');
			}
		}
	};
	
	var putExtGStateDict = function()
	{
		// Loop through images
		for (var key in gstates)
		{
			var gstate = gstates[key];
			
			if (gstate.n != null)
			{
				out('/GS'+gstate.i+' '+gstate.n+' 0 R');
				out('/GS'+(gstate.i + 1)+' '+(gstate.n + 1)+' 0 R');
			}
		}
	};
	
	var putXobjectDict = function()
	{
		// Loop through images
		for (var key in images)
		{
			var image = images[key];
			
			if (image.n != null)
			{
				out('/I'+image.i+' '+image.n+' 0 R');
			}
		}
	};
	
	var putInfo = function()
	{
		out('/Producer (mxGraph ' + mxClient.VERSION + ')');
		if(documentProperties.title != undefined)
		{
			out('/Title (' + pdfEscape(documentProperties.title) + ')');
		}
		
		if(documentProperties.subject != undefined)
		{
			out('/Subject (' + pdfEscape(documentProperties.subject) + ')');
		}
		
		if(documentProperties.author != undefined)
		{
			out('/Author (' + pdfEscape(documentProperties.author) + ')');
		}
		
		if(documentProperties.keywords != undefined)
		{
			out('/Keywords (' + pdfEscape(documentProperties.keywords) + ')');
		}
		
		if(documentProperties.creator != undefined)
		{
			out('/Creator (' + pdfEscape(documentProperties.creator) + ')');
		}
		
		var created = new Date();
		var year = created.getFullYear();
		var month = (created.getMonth() + 1);
		var day = created.getDate();
		var hour = created.getHours();
		var minute = created.getMinutes();
		var second = created.getSeconds();
		var dat = d(year, 4) + d(month, 2) + d(day, 2) + d(hour, 2) + d(minute, 2) + d(second, 2);
		out('/CreationDate (D:' + dat + ')');
	};
	
	var putCatalog = function()
	{
		out('/Type /Catalog');
		out('/Pages 1 0 R');
		// TODO: Add zoom and layout modes
		//out('/OpenAction [3 0 R /FitH null]');
		//out('/PageLayout /OneColumn');
	};
	
	function putTrailer()
	{
		out('/Size ' + (objectNumber + 1));
		out('/Root ' + objectNumber + ' 0 R');
		out('/Info ' + (objectNumber - 1) + ' 0 R');
	};
	
	var endDocument = function()
	{
		state = 1;
		putHeader();
		putPages();
		
		putResources();
		//Info
		newObject();
		out('<<');
		putInfo();
		out('>>');
		out('endobj');
		
		//Catalog
		newObject();
		out('<<');
		putCatalog();
		out('>>');
		out('endobj');
		
		//Cross-ref
		var o = buffer.length;
		out('xref');
		out('0 ' + (objectNumber + 1));
		out('0000000000 65535 f ');
		for (var i=1; i <= objectNumber; i++)
		{
			out(d(offsets[i], 10) + ' 00000 n ');
		}
		//Trailer
		out('trailer');
		out('<<');
		putTrailer();
		out('>>');
		out('startxref');
		out(o);
		out('%%EOF');
		state = 3;		
	};
	
	var beginPage = function()
	{
		page ++;
		// Do dimension stuff
		state = 2;
		pages[page] = '';
		
		// TODO: Hardcoded at A4 and portrait
		pageHeight = pageFormats['a4'][1] / k;
		pageWidth = pageFormats['a4'][0] / k;
	};
	
	var out = function(string)
	{
		if(state == 2)
		{
			pages[page] += string + '\n';
		}
		else
		{
			buffer += string + '\n';
		}
	};
	
	var f2 = function(x)
	{
		return Math.round(parseFloat(x) * 100) / 100;
	};

	var d = function(x, n)
	{
		var s = String(parseInt(x));
		
		// Left-padding with zeros
		while (s.length < n)
		{
			s = '0' + s;				
		}
		
		return s.substring(s.length - n, s.length);
	};

	var _addPage = function()
	{
		beginPage();
		
		// Set background color (TODO: Should be transparent)
		out('255 255 255 rg');
		
		// Set line width
		out(f2(lineWidth * k) + ' w');
		
		// Set font - TODO
		// 11 is the font size
		pageFontSize = fontSize;
		out('BT /F1 ' + parseInt(fontSize) + '.00 Tf ET'); 		
	};
	
	// Add the first page automatically
	_addPage();	

	// Escape text
	var pdfEscape = function(text)
	{
		return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
	};

	// Required to put a GIF into a PDF
	/*function _parsegif($file)
	{
		//Extract info from a GIF file (via PNG conversion)
		if(!function_exists('imagepng'))
			$this->Error('GD extension is required for GIF support');
		if(!function_exists('imagecreatefromgif'))
			$this->Error('GD has no GIF read support');
		$im=imagecreatefromgif($file);
		if(!$im)
			$this->Error('Missing or incorrect image file: '.$file);
		imageinterlace($im,0);
		$tmp=tempnam('.','gif');
		if(!$tmp)
			$this->Error('Unable to create a temporary file');
		if(!imagepng($im,$tmp))
			$this->Error('Error while saving to temporary file');
		imagedestroy($im);
		$info=$this->_parsepng($tmp);
		unlink($tmp);
		return $info;
	}*/
	
	function _parsejpg(f, info)
	{
		var pos = 0;
		
		// Reads the specified number of bytes
		function fread(count)
		{
			var start = pos;
			pos += count;
			
			return f.substring(start, pos);
		};

		// Reads a 32 bit unsigned long (big endian)
		function freadint()
		{
			var bytes = fread(4);

			return bytes.charCodeAt(3) + (bytes.charCodeAt(2) + (bytes.charCodeAt(1) +
					(bytes.charCodeAt(0) << 8) << 8) << 8);
		};
		
		// Checks supported JPG header
		if (fread(4) == String.fromCharCode(0xff, 0xd8, 0xff, 0xe0))
		{
			// Parses JPG data for file size
			// TODO: Extract size, channels info from JPG
			//Extract info from a JPEG file
			/*$a=GetImageSize($file);
			if($a[2]!=2)
				$this->Error('Not a JPEG file: '.$file);
			if(!isset($a['channels']) || $a['channels']==3)
				$colspace='DeviceRGB';
			elseif($a['channels']==4)
				$colspace='DeviceCMYK';
			else
				$colspace='DeviceGray';
			$bpc=isset($a['bits']) ? $a['bits'] : 8;*/
			var blockStart = pos;
			var buf = fread(2);
			var blockLength = ((buf.charCodeAt(0) << 8) + buf.charCodeAt(1));
			buf = fread(4);
			
			// Checks for JPEG/JFIF file format
			// TODO: Support for other JPG formats required?
			if (buf == 'JFIF' && fread(1).charCodeAt(0) == 0x00)
			{
				blockStart += blockLength;
				
				while (blockStart < f.length)
				{
					pos = blockStart;
					buf = fread(4);
					blockLength = ((buf.charCodeAt(2) << 8) + buf.charCodeAt(3));

					if (blockLength >= 7 && buf.charCodeAt(0) == 0xff && buf.charCodeAt(1) == 0xc0)
					{
						pos += 1;
						buf = fread(4);
						
						var colspace = 'DeviceRGB';
						var bpc = 8;
						
						info.w = (buf.charCodeAt(2) << 8) + buf.charCodeAt(3);
						info.h = (buf.charCodeAt(0) << 8) + buf.charCodeAt(1);

						info.cs = colspace;
						info.bpc = bpc;
						info.f = 'DCTDecode';
						info.data = f;
					}

					blockStart += blockLength + 2;
				}
			}
		}
	}
	
	function _parsepng(f, info)
	{
		var pos = 0;
	
		function fread(d, count)
		{
			var start = pos;
			pos += count;
			
			return d.substring(start, pos);
		};

		function _freadint(d)
		{
			var bytes = fread(d, 4);

			return bytes.charCodeAt(3) + (bytes.charCodeAt(2) << 8) +
				(bytes.charCodeAt(1) << 16) + (bytes.charCodeAt(0) << 24);
		};
		
      //Check signature
      // Original code has chr(137) as first character (magic byte)
      if (fread(f,8)!=String.fromCharCode(137)+'PNG'+String.fromCharCode(13, 10, 26, 10))
      {
        mxLog.debug('Not a PNG file');
      }

      //Read header chunk
      fread(f,4);
      
      if (fread(f,4)!='IHDR')
      {
    	  mxLog.debug('Incorrect PNG file');
      }

      // freadint: read a unsigned long 32 bit big endian
      var w = _freadint(f);
      var h = _freadint(f);
      var bpc=fread(f,1).charCodeAt(0);

      if (bpc>8)
      {
    	mxLog.debug('16-bit depth not supported');
      }

      var ct=fread(f,1).charCodeAt(0);
      var colspace = '';
      
      if (ct == 0)
      {
        colspace='DeviceGray';
      }
      else if (ct == 2)
      {
        colspace='DeviceRGB';
      }
      else if (ct == 3)
      {
        colspace='Indexed';
      }
      else
      {
    	  mxLog.show();
    	  mxLog.debug('Alpha channel not supported: ' + info.src);
      }

      if (fread(f,1).charCodeAt(0) != 0)
      {
    	  mxLog.debug('Unknown compression method');
      }

      if (fread(f,1).charCodeAt(0) != 0)
      {
    	  mxLog.debug('Unknown filter method');
      }

      if (fread(f,1).charCodeAt(0) != 0)
      {
    	  mxLog.debug('Interlacing not supported');
      }

      fread(f,4);
      var parms='/DecodeParms <</Predictor 15 /Colors '+(ct==2 ? 3 : 1)+
      	' /BitsPerComponent '+bpc+' /Columns '+w+'>>';

      //Scan chunks looking for palette, transparency and image data
      var pal='';
      var trns='';
      var data='';
      
      do
        {
          var n= _freadint(f);
          var type=fread(f,4);
          //mxLog.debug(type, n);
          
          if(type=='PLTE')
          {
              //Read palette
              pal=fread(f,n);
              fread(f,4);
          }
          else if(type=='tRNS')
          {
              //Read transparency info
              var t=fread(f,n);
              if(ct==0)
                trns=[t.charCodeAt(1)];
              else if(ct==2)
                trns=[t.charCodeAt(1), t.charCodeAt(3), t.charCodeAt(5)];
              else
                {
                  var pos2=t.indexOf(String.fromCharCode(0));
                  if(pos2 >= 0)
                    trns = [pos2];
                }
              fread(f,4);
          }
          else if (type=='IDAT')
          {
              //Read image data block
        	  data += fread(f,n);
              fread(f,4);
          }
          else if (type=='IEND')
            break;
          else
            fread(f,n+4);
        }
      while(n);
      
      if(colspace=='Indexed' && pal == '')
      {
    	  mxLog.debug('Missing palette');
      }
      
      // Ideas to handle alpha channels:
      // Create JPG image as a replacement
      // Separate color image and alpha mask from IDAT/canvas image data
      // If possible remove alpha channel from IDAT in-place
      if (ct == 6)
      {
		  /*var image = new Image();
		  
		  image.onload = function()
		  {
			  try
			  {
	    		  canvas.setAttribute('width', image.width);
	    		  canvas.setAttribute('height', image.height);
	    		  var ctx = canvas.getContext('2d');
	    		  ctx.drawImage(image, 0, 0);
	    		  
	    		  // Creates a high-quality JPG instead
	    		  var imgData = ctx.getImageData(0, 0, image.width, image.height);
	    		  mxLog.show();
	   
	    		  var tmpData = RawDeflate.inflate(data);
	    		  mxLog.debug(imgData.data.length+'/'+data.length+'/'+tmpData.length);
			  }
			  catch (e)
			  {
				  mxLog.show();
				  mxLog.debug('error: '+e);
			  }
		  };
		  
		  image.onerror = function()
			{
				mxLog.show();
				mxLog.debug('error loading '+src);
			};
		  
		  image.src = info.src;*/
      }
      
      info.w = w;
      info.h = h;
      info.cs = colspace;
      info.bpc = bpc;
      info.f = 'FlateDecode';
      info.parms = parms;
      info.pal = pal;
      info.trns = trns;
      info.data = data;
    };
	
	var hex2rgb = function(hex)
	{
		if (hex == null || hex == 'none')
		{
			return null;
		}
		
		if (hex.charAt(0) == '#')
		{
			hex = hex.substring(1);
		}
		
		hex = hex.toLowerCase();
		var result = colorCache[hex];
		
		if (result == null)
		{
			if (hex.length == 3)
			{
				var temp=hex; hex='';
				temp = /^([a-f0-9])([a-f0-9])([a-f0-9])$/i.exec(temp).slice(1);
				for (var i=0;i<3;i++) hex+=temp[i]+temp[i];
			}
			
			// FIXME: Compare performance of this and next line
			try
			{
				var triplets = /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex).slice(1);
				//var triplets = [hex.substring(0,2), hex.substring(2, 4), hex.substring(4, 6)]; 
		
				var result =
				{
					red:   parseInt(triplets[0],16) / 255,
					green: parseInt(triplets[1],16) / 255,
					blue:  parseInt(triplets[2],16) / 255
				};
				
				colorCache[hex] = result;
			}
			catch (e)
			{
				// ignore
				mxLog.show();
				mxLog.debug('jspdf.hex2rgb: illegal hex value', hex);
			}
		}
		
		return result;
	};

	return {
		addPage: function()
		{
			_addPage();
		},
		scale: function(s)
		{
			scale *= s;
			ks = k * scale;
			ph = pageHeight / scale;
		},
		translate: function(dx, dy)
		{
			tx += dx;
			ty += dy;
		},
		rotate: function(theta, flipH, flipV, cx, cy)
		{
			// TODO: Requires GState
			//theta = Number(theta * M_RAD_PER_DEG);
			//var cos = Math.cos(theta);
			//var sin = Math.sin(theta);
			//out('1 0 0 1 ' + (-cx) * ks + ' ' + (cy - ph) * ks + ' cm');
			//out(cos + ' ' + sin + ' ' + (-sin) + ' ' + cos + ' 0 0 cm');
			//out('1 0 0 1 ' + cx * ks + ' ' + (ph - cy) * ks + ' cm');
			// See also: text function below
			mxLog.show();
			mxLog.debug('Rotate is not yet implemented');
		},
		save: function(s)
		{
			out('q');
		},
		restore: function(s)
		{
			out('Q');
		},
		setDrawingHint: function(key, value)
		{
			// TODO
		},
		setDashed: function(value)
		{
			if (value)
			{
				out('[3] 0 d');
			}
			else
			{
				out('[] 0 d');
			}
		},
		setDashPattern: function(value)
		{
			// TODO: Update dash pattern (see above)
		},
		setLineCap: function(value)
		{
			var val = 0; // butt
			
			if (value == 'round')
			{
				val = 1;
			}
			else if (value == 'square')
			{
				val = 2;
			}
			
			out(val + ' J');
		},
		setLineJoin: function(value)
		{
			var val = 0; // miter
			
			if (value == 'round')
			{
				val = 1;
			}
			else if (value == 'bevel')
			{
				val = 2;
			}
			
			out(val + ' j');
		},
		setMiterLimit: function(value)
		{
			out(val + ' M');
		},
		setFontSize: function(value)
		{
			// Font size in points! needs conversion from px
			fontSize = (value * scale); //ks);
		},
		setFontFamily: function(value)
		{
			// TODO
		},
		setFontStyle: function(value)
		{
			// TODO
		},
		setStrokeWidth: function(value)
		{
			if (value != null)
			{
				out(f2(value * ks) + ' w');
			}
		},
		setStrokeColor: function(value)
		{
			value = hex2rgb(value);
			
			if (value != null)
			{
				out(f2(value.red) + ' ' + f2(value.green) + ' ' + f2(value.blue) + ' RG');
			}
		},
		setFontColor: function(value)
		{
			value = hex2rgb(value);
			
			if (value != null)
			{
				out(f2(value.red) + ' ' + f2(value.green) + ' ' + f2(value.blue) + ' rg');
			}
		},
		setFillColor: function(value)
		{
			value = hex2rgb(value);
			
			if (value != null)
			{
				out(f2(value.red) + ' ' + f2(value.green) + ' ' + f2(value.blue) + ' rg');
			}
		},
		setGradient: function(color1, color2, x, y, w, h, direction)
		{
			var c1 = hex2rgb(color1);
			var c2 = hex2rgb(color2);
			
			if (c1 != null && c2 != null)
			{
				// LATER: Add caching?
				var pattern = null;
				
				if (pattern == null)
				{
					patternCount++;
					// FIXME: Add directions
					pattern = {i: patternCount, c1: c1, c2: c2,
						x: 0/*x * ks*/, y: (ph - y) * ks, w: 0/*w * ks*/, h: (ph - h - y) * ks/*h * ks*/,
						direction: direction};
					patterns[pattern.i] = pattern;
				}
				
				out('/Pattern cs /P' + pattern.i + ' scn');
			}
		},
		setGlassGradient: function(x, y, w, h)
		{
			 // TODO: Multiply with current alpha and/or add alpha gradient
			this.setAlpha(0.3);
			this.setGradient('#ffffff', '#ffffff', x, y, w, h, null);
		},
		setAlpha: function(alpha)
		{
			var gstate = gstates[alpha];
			
			if (gstate == null)
			{
				gstateCount++;
				gstate = {i: gstateCount, alpha: alpha};
				gstates[alpha] = gstate;
				gstateCount++;
			}
			
			out('/GS' + gstate.i + ' gs');
			out('/GS' + (gstate.i + 1) + ' gs');
		},
		image: function(x, y, w, h, src, aspect, flipH, flipV)
		{
			// TODO: Add support for Data URLs, image aspect, image flipping, GIF/PNG alpha channels
			var info = images[src];
			
	        //Put an image on the page
			if (info == null)
			{
				incWaitCounter();
				imageCount++;
				info = {i: imageCount, src: src };
				images[src] = info;
				
				var xhr = new mxXmlRequest(src, null, 'GET');
				xhr.setBinary(true);
				xhr.send(function(req)
				{
					var data = null;
					
					if (mxClient.IS_IE)
					{
						// NOTE: This requires a VB script in the page
						var bin = BinaryToArray(req.request.responseBody).toArray();
						var tmp = new Array(bin.length);
						
						for (var i = 0; i < bin.length; i++)
						{
							tmp[i] = String.fromCharCode(bin[i]);
						}
						
						data = tmp.join('');
					}
					else
					{
						var bin = req.getText();
						var tmp = new Array(bin.length);
						
						for (var i = 0; i < bin.length; i++)
						{
							tmp[i] = String.fromCharCode(bin.charCodeAt(i) & 0xFF);
						}
						
						data = tmp.join('');
					}
					
					if (data != null && data.length > 0)
					{
						var dot = src.lastIndexOf('.');
						var ext = src.substring(dot + 1).toLowerCase();
						
						// TODO: Handle GIF, PNG handle alpha channels
						if (ext == 'png')
						{
							_parsepng(data, info);
						}
						else if (ext == 'jpg')
						{
							_parsejpg(data, info);
						}
					}
					else
					{
						mxLog.debug('Missing or incorrect image file: ' + src);
					}

					decWaitCounter();
				},
				function(req)
				{
					decWaitCounter();
					mxLog.debug('Error loading '+src);
				});
	        }

			// TODO: Add support for preserved image aspect
			
			// Adds vertical/horizontal image flipping
			var sx = (flipH) ? -1 : 1;
			var dx = (flipH) ? w : 0;
			var sy = (flipV) ? -1 : 1;
			var dy = (flipV) ? h : 0;
			
	        out('q '+f2(w * ks * sx)+' 0 0 '+f2(h * ks * sy)+' '+f2((x + dx) * ks)+' '+f2((ph - y + dy - h) * ks)+' cm /I'+info.i+' Do Q');
		},
		moveTo: function(x, y)
		{
			x += tx;
			y += ty;
			out(f2(x * ks) + ' ' + f2((ph - y) * ks) +' m');
			lastMoveX = x;
			lastMoveY = y;
		},
		lineTo: function(x, y)
		{
			x += tx;
			y += ty;
			out(f2(x * ks) + ' ' + f2((ph - y) * ks) +' l');
			lastMoveX = x;
			lastMoveY = y;
		},
		quadTo: function(x1, y1, x2, y2)
		{
			x1 += tx;
			y1 += ty;
			x2 += tx;
			y2 += ty;
			out(f2(x1 * ks) + ' ' + f2((ph - y1) * ks) +' ' +
				f2(x2 * ks) + ' ' + f2((ph - y2) * ks) +' v');
			lastMoveX = x2;
			lastMoveY = y2;
		},
		arcTo: function(value)
		{
			// TODO
		},
		setFontBackgroundColor: function(value)
		{
			// TODO
		},
		setFontBorderColor: function(value)
		{
			// TODO
		},
		curveTo: function(x1, y1, x2, y2, x3, y3)
		{
			x1 += tx;
			y1 += ty;
			x2 += tx;
			y2 += ty;
			x3 += tx;
			y3 += ty;
			out(f2(x1 * ks) + ' ' + f2((ph - y1) * ks) +' ' +
				f2(x2 * ks) + ' ' + f2((ph - y2) * ks) +' ' +
				f2(x3 * ks) + ' ' + f2((ph - y3) * ks) +' c');
			lastMoveX = x3;
			lastMoveY = y3;
		},
		rect: function(x, y, w, h)
		{
			x += tx;
			y += ty;
			out(f2(x * ks) + ' ' + f2((ph - h - y) * ks) + ' ' + f2(w * ks) + ' ' + f2(h * ks) + ' re');
		},
		roundrect: function(x, y, w, h, dx, dy)
		{
			this.begin();
			this.moveTo(x + dx, y);
			this.lineTo(x + w - dx, y);
			this.quadTo(x + w, y, x + w, y + dy);
			this.lineTo(x + w, y + h - dy);
			this.quadTo(x + w, y + h, x + w - dx, y + h);
			this.lineTo(x + dx, y + h);
			this.quadTo(x, y + h, x, y + h - dy);
			this.lineTo(x, y + dy);
			this.quadTo(x, y, x + dx, y);
		},
		ellipse: function(x, y, w, h)
		{
			x += w / 2 + tx;
			y += h / 2 + ty;
			var rx = w / 2;
			var ry = h / 2;
			var lx = 4/3 * (M_SQRT2 - 1) * rx;
			var ly = 4/3 * (M_SQRT2 - 1) * ry;
			this.begin();
			this.moveTo(x + rx, y);
			this.curveTo(x + rx, y + ly, x + lx, y + ry, x, y + ry);
			this.curveTo(x - lx, y + ry, x - rx, y + ly, x - rx, y);
			this.curveTo(x - rx, y - ly, x - lx, y - ry, x, y - ry);
			this.curveTo(x + lx, y - ry, x + rx, y - ly, x + rx, y);
		},
		begin: function()
		{
			// not required
		},
		close: function()
		{
			out('h');
		},
		fill: function()
		{
			out('f');
		},
		stroke: function()
		{
			out('S');
		},
		fillAndStroke: function()
		{
			out('B');
		},
		clip: function()
		{
			out('W n');
		},
		setShadow: function(value)
		{
			// TODO: mxConstants.SHADOW_COLOR must be hex value for parsing instead of 'gray'
			/*this.save();
			this.setStrokeColor(value);
			
			if (filled)
			{
				this.setFillColor(value);
				this.fillAndStroke();
			}
			else
			{
				this.stroke();
			}
			
			this.restore();*/
		},
		text: function(x, y, w, h, str, align, valign, vertical)
		{
			// FIXME: pageFontSize is different probably due to scale.
			// Should apply scale when setting font size for comparison?
			//if(pageFontSize != fontSize)
			{
				out('BT /F1 ' + parseInt(fontSize) + '.00 Tf ET');
				pageFontSize = fontSize;
			}
			
			x += tx;
			y += ty;
			
			// Fix for top-aligned stencil labels, needs more work for
			// different alignments and horizontal alignment handling
			if (h == 0)
			{
				y -= fontSize / 2;
			}
			
			// TODO: Not sure how rotation works for vertical labels
			/*out('q');
			var cx = 20;// * ks; //(x + w / 2) * ks;
			var cy = 0; //((ph - y) + 6) * ks; //((ph - y) + h / 2) * ks;
			
			// TODO: Use constants for cos and sin
			var theta = 0.2; //Math.PI / 10;
			var cos = Math.cos(theta);
			var sin = Math.sin(theta);
			var trm = f2(cos)+' '+f2(sin)+' '+f2(-sin)+' '+f2(cos);
			out(trm+' '+f2(cx)+' '+f2(cy)+' cm');
			//out(f2(cos)+' '+f2(-sin)+' '+f2(sin)+' '+f2(cos)+' '+f2(-dx)+' '+f2(-dy)+' cm');
			out('1 0 0 1 '+f2(-cx)+' '+f2(-cy)+' cm');
			
			mxLog.show();
			mxLog.debug('ks='+ks+' cx='+cx+' cy='+cy);
			
			//out('BT '+trm+' '+f2(0 * ks)+' '+f2(/*(ph - 100) * ks*///20)+' Tm (' + pdfEscape('HELLO') + ') Tj ET');
			//out('BT '+trm+' '+f2(40 * ks)+' '+f2(/*(ph - 100) * ks*/20)+' Tm (' + pdfEscape('HELLO') + ') Tj ET');
			//out('BT '+f2(0 * ks)+' '+f2(/*(ph - 100) * ks*/20)+' Td (' + pdfEscape('HELLO') + ') Tj ET');
			//out('Q');*/
			
			// FIXME: Vertical shift needs tuning (3)
			y += fontSize / ks + 3;
			x += 3;

			// FIXME: No anchor in PDF where we can define the
			// point of the center/left/right of a line
			var lines = str.split('\n');
			
			for (var i = 0; i < lines.length; i++)
			{
				out('BT '+f2(x * ks)+' '+f2((ph - y) * ks)+' Td (' + pdfEscape(lines[i]) + ') Tj ET');
				y += fontSize / ks * 1.3;
			}
		},
		setProperties: function(properties)
		{
			documentProperties = properties;
		},
		output: function(type, options)
		{
			endDocument();
			
			return buffer;
		},
		finish: function(handler)
		{
			// TODO: Check if waitCounter updates need a monitor. Question is
			// if image load-handler can be executed in parallel leading to
			// race conditions when updating the "shared" waitCounter.
			if (waitCounter == 0)
			{
				handler();
			}
			else
			{
				onComplete = handler;
			}
		}
	};
};