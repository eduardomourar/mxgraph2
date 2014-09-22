<?php
/**
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: vsGdCanvas
 * 
 * Custom GD canvas for painting VISA network diagrams. This class implements
 * the custom shapes and font rendering required for VISA network diagrams.
 */

class vsGdCanvas extends mxGdCanvas
{
	
	/**
	 * Variable: curveDashLength
	 * 
	 * Defines the dash length for curves. Default is 3.
	 */
	var $curveDashLength = 3;

	/**
	 * Variable: graph
	 *
	 * Holds the enclosing <mxGraph>.
	 */
	var $graph;
	
	/**
	 * Constructor: vsGdCanvas
	 * 
	 * Constructs a new vsGdCanvas to render VISA network diagrams.
	 */
	function vsGdCanvas(&$graph, $width=null, $height=null, $scale=1, $background=null, $basePath = "")
	{
		parent::mxGdCanvas($width + 20, $height + 20, $scale, $background, $basePath);
		$this->enableTtf = true; // uses true-type fonts if possible
		$this->graph = $graph;
	}
	
	/**
	* Function: drawCell
	*
	* Draws the given cell state.
	*/
	function drawCell($state)
	{
		$style = $state->style;
		
		if (sizeof($state->absolutePoints) > 2 && mxUtils::getValue($style, mxConstants::$STYLE_SHAPE, "") == "curve")
		{
			$dashed = mxUtils::getNumber($style, mxConstants::$STYLE_DASHED);
			$stroke = mxUtils::getValue($style, mxConstants::$STYLE_STROKECOLOR);
			$strokeWidth = mxUtils::getNumber($style, mxConstants::$STYLE_STROKEWIDTH, 1) * $this->scale;
		
			if ($stroke == "none")
			{
				$stroke = null;
			}
								
			if (isset($this->image))
			{
				// KNOWN: Stroke widths are ignored by GD if antialias is on
				imagesetthickness($this->image, $strokeWidth);
			}
			
			// No markers needed for curved edges
			$pts = $state->absolutePoints;

			// Draws the actual curve
			$clr = $this->getColor($stroke);
			$im = $this->image;
			
			if ($dashed)
			{
				$this->quadDashed($im, $pts[1]->x, $pts[1]->y, $pts[2]->x, $pts[2]->y, $pts[3]->x, $pts[3]->y, $this->curveDashLength, $clr);
			}
			else
			{
				$this->quad($im, $pts[1]->x, $pts[1]->y, $pts[2]->x, $pts[2]->y, $pts[3]->x, $pts[3]->y, $clr);
			}
			
			if (isset($this->image))
			{
				imagesetthickness($this->image, 1);
			}
		}
		else
		{
			parent::drawCell($state);
		}
	}

	/**
	 * Function: drawLabel
	 * 
	 * Overrides <mxGdCanvas.drawLabel> to render VISA-specific labels.
	 */
	function drawLabel($label, $state, $html = false)
	{
		$x = $state->labelBounds->x;
		$y = $state->labelBounds->y;
		$w = $state->labelBounds->width;
		$h = $state->labelBounds->height;
		$style = $state->style;
		
		if (strpos($label, "<table") === 0)
		{
			if (strpos($state->cell->style, "defaultVertex") !== false)
			{
				$td1 = strpos($label, "<td");
				$td1 = strpos($label, ">", $td1) + 1;
				$td1end = strpos($label, "</td>", $td1);
				
				$td2 = strpos($label, "<td", $td1end);
				$td2 = strpos($label, ">", $td2) + 1;
				$td2end = strpos($label, "</td>", $td2);
				
				$td3 = strpos($label, "<td", $td2end);
				$td3 = strpos($label, ">", $td3) + 1;
				$td3end = strpos($label, "</td>", $td3);
				
				$bottomText = null;
				$bottomHeight = 0;
	
				$fontSize = mxUtils::getValue($style, mxConstants::$STYLE_FONTSIZE,
					mxConstants::$DEFAULT_FONTSIZE) * $this->scale;
				
				if ($td3 > $td2end)
				{
					$bottomText = substr($label, $td3, $td3end - $td3);
					$bottomLines = explode("\n", $bottomText);
					$bottomHeight = ($fontSize + mxConstants::$DEFAULT_LINESPACING - 2) * sizeof($bottomLines); 
				}
				
				$first = substr($label, $td1, $td1end - $td1);
				$second = substr($label, $td2, $td2end - $td2);
				
				$titleLines = explode("\n", $first);
				$titleHeight = ($fontSize + mxConstants::$DEFAULT_LINESPACING) * sizeof($titleLines) - 2;
				
				// Top part is top, left-aligned
				$tmpStyle = $style;
				$tmpStyle[mxConstants::$STYLE_VERTICAL_ALIGN] = mxConstants::$ALIGN_TOP;
				$tmpStyle[mxConstants::$STYLE_ALIGN] = mxConstants::$ALIGN_LEFT;
				
				$this->drawText($first, $x, $y, $w, $titleHeight, $tmpStyle);
				
				$tmp = $y + $titleHeight;
				$this->drawText($second, $x, $tmp + 2, $w / 2, $h - $titleHeight - $bottomHeight, $tmpStyle);
		 		$this->drawLine($x, $tmp + 2, $x + $w, $tmp + 2, "black");
		 		
		 		if ($bottomText != null)
		 		{
					// Bottom part is top, center-aligned
					$tmpStyle = $style;
					$tmpStyle[mxConstants::$STYLE_VERTICAL_ALIGN] = mxConstants::$ALIGN_TOP;
					$tmpStyle[mxConstants::$STYLE_ALIGN] = mxConstants::$ALIGN_CENTER;
	
		 			$tmp = $y + $h - $bottomHeight;

					$this->drawText($bottomText, $x, $tmp - 2, $w, $bottomHeight, $tmpStyle);
			 		$this->drawLine($x, $tmp, $x + $w, $tmp, "black");	 			
		 		}
			}
			else // default table is isr shape
			{
				// TODO: Support only horizontal line
				$td1start = strpos($label, "<td");
				$td1 = strpos($label, ">", $td1start) + 1;
				$td1end = strpos($label, "</td>", $td1);
				
				$td2 = strpos($label, "<td", $td1end);
				$td2color = strpos($label, "color:", $td2);
				$td2 = strpos($label, ">", $td2) + 1;
				
				// Handles color of first column
				$rightstyle = $style;
				
				if ($td2color < $td2)
				{
					$color = substr($label, $td2color + 6, 7);
					$rightstyle = array_slice($style, 0);
					$rightstyle[mxConstants::$STYLE_FONTCOLOR] = $color;
				}
				
				$td2end = strpos($label, "</td>", $td2);
				$td3 = strpos($label, "<td", $td2end);
				$td3color = strpos($label, "color:", $td3);
				$td3 = strpos($label, ">", $td3) + 1;
				
				// Handles color of second column
				$leftstyle = $style;
				
				if ($td3color < $td3)
				{
					$color = substr($label, $td3color + 6, 7);
					$leftstyle = array_slice($style, 0);
					$leftstyle[mxConstants::$STYLE_FONTCOLOR] = $color;
				}
				
				$td3end = strpos($label, "</td>", $td3);
					
				$td4 = strpos($label, "<td", $td3end);
				$td4 = strpos($label, ">", $td4) + 1;
				$td4end = strpos($label, "</td>", $td4);
				
				$left = substr($label, $td1, $td1end - $td1);
				$right = substr($label, $td2, $td2end - $td2);
				
				$w45 = strpos($label, "45%", $td1start);
				$w5 = strpos($label, "50%", $td1start);
				$half = !$w45 && ($td1start < $w5 && $w5 < $td1end);
				$bottomText = null;
				$bottomHeight = 0;
				
				// Handles special case where there is only an upper and lower half
				if ($w45)
				{
					$right2 = substr($label, $td3, $td3end - $td3);
					$bottomText = substr($label, $td4, $td4end - $td4);
				}
				else if (!$half)
				{
					$bottomText = $right;
				}
				else if ($td3 > $td2end)
				{
					$bottomText = substr($label, $td3, $td3end - $td3);
				}
				
				if ($bottomText != null)
				{
					$bottomLines = explode("\n", $bottomText);
					
					$fontSize = mxUtils::getValue($style, mxConstants::$STYLE_FONTSIZE,
						mxConstants::$DEFAULT_FONTSIZE) * $this->scale;
					$bottomHeight = ($fontSize + mxConstants::$DEFAULT_LINESPACING - 2) * sizeof($bottomLines);
				}
				
				if ($w45)
				{
					$this->drawText($left, $x, $y, $w * 0.45, $h - $bottomHeight, $style);
					$this->drawText($right, $x + $w * 0.45, $y, $w * 0.275, $h - $bottomHeight, $rightstyle);
					$this->drawText($right2, $x + $w * 0.725, $y, $w * 0.275, $h - $bottomHeight, $leftstyle);
					$this->drawLine($x + $w * 0.45, $y, $x + $w * 0.45, $y + $h - $bottomHeight - 1, "black", true);
				}
				else if ($half)
				{
					$this->drawText($left, $x, $y, $w / 2, $h - $bottomHeight, $style);
					$this->drawText($right, $x + $w / 2, $y, $w / 2, $h - $bottomHeight, $style);
			 		$this->drawLine($x + $w / 2, $y, $x + $w / 2, $y + $h - $bottomHeight - 1, "black", true);
				}
				else
				{
					$this->drawText($left, $x, $y, $w, $h - $bottomHeight, $style);
				}
		 		
		 		if ($bottomText != null)
		 		{
		 			$tmp = $y + $h - $bottomHeight;
	
					$this->drawText($bottomText, $x, $tmp, $w, $bottomHeight, $style);
			 		$this->drawLine($x, $tmp - 1, $x + $w, $tmp - 1, "black", true);	 			
		 		}
			}
		}
		else
		{
			$this->drawText($label, $x, $y, $w, $h, $style);
		}
	}

	/**
	 * Function: drawShape
	 *
	 * Overrides <mxGdCanvas.drawShape> to render VISA-specific shapes.
	 */
	function drawShape($x, $y, $w, $h, $style)
	{
		if ($w > 0 && $h > 0)
		{
			$shape = mxUtils::getValue($style, mxConstants::$STYLE_SHAPE);
			$shadow = mxUtils::getValue($style, mxConstants::$STYLE_SHADOW);
			$stroke = mxUtils::getValue($style, mxConstants::$STYLE_STROKECOLOR);
			$fill = mxUtils::getValue($style, mxConstants::$STYLE_FILLCOLOR);
			
	 		if ($shape == "ase")
	 		{
	 			$this->drawAse($x, $y, $w, $h, $fill, $stroke, $shadow);
	 		}
	 		else if ($shape == "lan")
	 		{
				$this->drawLan($x, $y, $w, $h, $stroke, $shadow); 		
	 		}
	 		else if ($shape == "wave")
	 		{
	 			$this->drawWave($x, $y, $w, $h, $fill, $stroke, $shadow);
	 		}
			else
	 		{
	 			parent::drawShape($x, $y, $w, $h, $style);
			}
		}
	}
	
	/**
	* Function: drawSat
	*
	* Draws a satellite dish.
	*/
	function drawWave($x, $y, $w, $h, $fill = null, $stroke = null, $shadow = false)
	{
		$stroke = $this->getColor($stroke);
		imageArc($this->image, $x + 0.5 * $w, $y + 0.25 * $h, 0.5 * $w, 0.5 * $h, -90, 90, $stroke);
		imageArc($this->image, $x + 0.5 * $w, $y + 0.75 * $h, 0.5 * $w, 0.5 * $h, 90, -90, $stroke);
	}

	/**
	* Function: drawCloud
	*
	* Replaces the cloud shape.
	*/
	function drawCloud($x, $y, $w, $h, $fill = null, $stroke = null, $shadow=false)
	{
		if (isset($fill))
		{
			if ($shadow)
			{
				$dx = mxConstants::$SHADOW_OFFSETX;
				$dy = mxConstants::$SHADOW_OFFSETY;
				
				imageFilledEllipse($this->image, $x + 0.15 * $w + $dx, $y + 0.5 * $h + $dy, 0.3 * $w, 0.6 * $h, $this->shadowColor);
				imageFilledEllipse($this->image, $x + 0.85 * $w + $dx, $y + 0.5 * $h + $dy, 0.3 * $w, 0.6 * $h, $this->shadowColor);
				imageFilledEllipse($this->image, $x + 0.375 * $w + $dx, $y + 0.5 * $h + $dy, 0.5 * $w, $h, $this->shadowColor);
				imageFilledEllipse($this->image, $x + 0.625 * $w + $dx, $y + 0.5 * $h + $dy, 0.5 * $w, $h, $this->shadowColor);
			}
		
			$fill = $this->getColor($fill);
			
			imageFilledEllipse($this->image, $x + 0.15 * $w, $y + 0.5 * $h, 0.3 * $w, 0.5 * $h, $fill);
			imageFilledEllipse($this->image, $x + 0.85 * $w, $y + 0.5 * $h, 0.3 * $w, 0.5 * $h, $fill);
			imageFilledEllipse($this->image, $x + 0.375 * $w, $y + 0.5 * $h, 0.5 * $w, $h, $fill);
			imageFilledEllipse($this->image, $x + 0.625 * $w, $y + 0.5 * $h, 0.5 * $w, $h, $fill);
		}
		
		if (isset($stroke))
		{
			$stroke = $this->getColor($stroke);
			
			imageArc($this->image, $x + 0.15 * $w, $y + 0.5 * $h, 0.3 * $w, 0.5 * $h, 85, -85, $stroke);
			imageArc($this->image, $x + 0.85 * $w, $y + 0.5 * $h, 0.3 * $w, 0.5 * $h, -95, 95, $stroke);
			imageArc($this->image, $x + 0.375 * $w, $y + 0.5 * $h, 0.5 * $w, $h, 210, 300, $stroke);
			imageArc($this->image, $x + 0.625 * $w, $y + 0.5 * $h, 0.5 * $w, $h, 240, 330, $stroke);
			imageArc($this->image, $x + 0.625 * $w, $y + 0.5 * $h, 0.5 * $w, $h, 30, 120, $stroke);
			imageArc($this->image, $x + 0.375 * $w, $y + 0.5 * $h, 0.5 * $w, $h, 60, 150, $stroke);
		}
	}
	
	/**
	 * Function: drawLan
	 *
	 * Draws the shape for an Ase device.
	 */
	function drawLan($x, $y, $w, $h, $stroke = null)
	{
		$this->drawLine($x, $y, $x + $w, $y, $stroke);
		$this->drawLine($x + $w / 2, $y, $x + $w / 2, $y + $h, $stroke);
		$this->drawLine($x, $y + $h, $x + $w, $y + $h, $stroke);
	}
	
	/**
	 * Function: drawAse
	 *
	 * Draws the shape for an Ase device.
	 */
	function drawAse($x, $y, $w, $h, $fill = null, $stroke = null, $shadow = false)
	{
		$points = array(
			$x + 0.1 * $w, $y + 0.33 * $h,
			$x, $y + 0.33 * $h,
			$x, $y + 0.5 * $h,
			$x + 0.1 * $w, $y + 0.5 * $h,
			$x + 0.1 * $w, $y + $h,
			$x + 0.8 * $w, $y + $h,
			$x + 0.8 * $w, $y + 0.66 * $h,
			$x + $w, $y + $h,
			$x + $w, $y,
			$x + 0.7 * $w, $y + 0.33 * $h);
			
		$this->drawPolygon($points, $fill, $stroke, $shadow);
	}
	
	/**
	* Function: quad
	* 
	* Draws a quadratic curve.
	*/
	function quad($im, $x1, $y1, $x2, $y2, $x3, $y3, $color)
	{
		$b = $pre1 = $pre2 = $pre3 = 0;
		$prevx = 0;
		$prevy = 0;
		$d = sqrt(($x1 - $x2) * ($x1 - $x2) + ($y1 - $y2) * ($y1 - $y2)) +
			sqrt(($x2 - $x3) * ($x2 - $x3) + ($y2 - $y3) * ($y2 - $y3));
		$resolution = (1 / $d) * 10;
		
		for ($a = 1; $a >0; $a -= $resolution)
		{
			$b= 1 - $a;
			$pre1 = ($a * $a);
			$pre2 = 2 * $a * $b;
			$pre3 = ($b * $b);
			$x = $pre1 * $x1 + $pre2 * $x2  + $pre3 * $x3;
			$y = $pre1 * $y1 + $pre2 * $y2 + $pre3 * $y3;
			
			if ($prevx != 0 && $prevy != 0)
			{
				imageline($im, $x, $y, $prevx, $prevy, $color);
			}
			
			$prevx = $x;
			$prevy = $y;
		}
		
		imageline($im, $prevx, $prevy, $x3, $y3, $color);
	}
	
	// Testing
	function quadDashed($im, $x1, $y1, $x2, $y2, $x3, $y3, $dashLen, $color)
	{
		$b = $pre1 = $pre2 = $pre3 = 0;
		$prevx = 0;
		$prevy = 0;
		$d = sqrt(($x1 - $x2) * ($x1 - $x2) + ($y1 - $y2) * ($y1 - $y2)) +
		sqrt(($x2 - $x3) * ($x2 - $x3) + ($y2 - $y3) * ($y2 - $y3));
	
		if ($d <= 0)
		{
		    return; // otherwise infinite loop below
		}
	
		// So only one change can occur per segment
		// resolve smaller segments than the dash length
		$resolution = (1 / $d) * $dashLen / 2;
	
		$curvePoints = array();
		$segmentLengths = array();
		// If you need the array sizes when creating, segmentLengths is (1/resolution-1) rounded up
		// curvePoints is ((segmentLengths + 1) * 2)
		$curveIndex = 0;
		$curveLength = 0;
	
		for ($a = 1; $a >= 0; $a -= $resolution)
		{
			$b= 1 - $a;
			$pre1 = ($a * $a);
			$pre2 = 2 * $a * $b;
			$pre3 = ($b * $b);
			$x = $pre1 * $x1 + $pre2 * $x2  + $pre3 * $x3;
			$y = $pre1 * $y1 + $pre2 * $y2 + $pre3 * $y3;
	
			$curvePoints[$curveIndex * 2] = $x;
			$curvePoints[$curveIndex * 2 + 1] = $y;
			
			if ($a != 1)
			{
				// Get the segment length
				$deltaX = $x - $prevx;
				$deltaY = $y - $prevy;
				$segLen = sqrt($deltaX * $deltaX + $deltaY * $deltaY);
				$curveLength += $segLen;
				$segmentLengths[$curveIndex-1] = $segLen;
			}
	
			$curveIndex++;
			$prevx = $x;
			$prevy = $y;
		}
	
		$arraySize = count($segmentLengths);
		$currentLength = 0;
		$isOn = true;
		$remainingDashSegLen = $dashLen;
		$currentX = $curvePoints[0];
		$currentY = $curvePoints[1];
		
		for ($a = 0; $a < $arraySize; $a++)
		{
			// Check if the dash changes on the current segment
			if ($segmentLengths[$a] > $remainingDashSegLen)
			{
				// Work out normal vector along current segment
				$normX = abs($curvePoints[$a*2] - $curvePoints[$a*2+2]) / $segmentLengths[$a];
				$normY = abs($curvePoints[$a*2+1] - $curvePoints[$a*2+3]) / $segmentLengths[$a];
				$nextX = $curvePoints[$a*2] + ($normX * $remainingDashSegLen);
				$nextY = $curvePoints[$a*2+1] + ($normY * $remainingDashSegLen);
	
				if ($isOn)
				{
					imageline($im, $currentX, $currentY, $nextX, $nextY, $color);
				}
				
				$currentX = $nextX;
				$currentY = $nextY;
				$isOn = !$isOn;
				$remainingDashSegLen = $dashLen - ($segmentLengths[$a] - $remainingDashSegLen);
			}
			else
			{
				$remainingDashSegLen -= $segmentLengths[$a];
			}
		}
		
		//
		// The partial last dash won't draw if it's on
		// If that's a problem draw from current x and y
		// to the end point if $isOn
	}
	
	/**
	 * Function: drawTtfText
	 */
	function drawTtfText($string, $x, $y, $w, $h, $style)
	{
		$lines = explode("\n", $string);
		$lineCount = sizeof($lines);
		
		$x0 = $x;
		
		if ($lineCount > 0)
		{
			// Gets the orientation and alignment
			$horizontal = mxUtils::getValue($style, mxConstants::$STYLE_HORIZONTAL, true);
			$align = mxUtils::getValue($style, mxConstants::$STYLE_ALIGN, mxConstants::$ALIGN_CENTER);

			if ($align == mxConstants::$ALIGN_LEFT)
			{
				if ($horizontal)
				{
					$x += mxConstants::$LABEL_INSET;
				}
				else
				{
					$y -= mxConstants::$LABEL_INSET;
				}
			}
			else if ($align == mxConstants::$ALIGN_RIGHT)
			{
				if ($horizontal)
				{
					$x -= mxConstants::$LABEL_INSET;
				}
				else
				{
					$y += mxConstants::$LABEL_INSET;
				}
			}

			// Gets the font
			$fontSize = $this->getTrueTypeFontSize($style);
			$font = $this->getTrueTypeFont($style);
			
			// Checks if the font should be bold
			if (mxUtils::getNumber($style, mxConstants::$STYLE_FONTSTYLE) && mxConstants::$FONT_BOLD ==
				mxConstants::$FONT_BOLD)
			{
				// FIXME: Must change mxUtils.getTextSize also to take this into account
				//$font = $this->getBoldFont($font);
			}
			
			// Gets the color
			$fontColor = mxUtils::getValue($style, mxConstants::$STYLE_FONTCOLOR);
	 		$color = $this->getColor($fontColor, "black");
	 		
	 		$dy = ($horizontal) ? round($fontSize * 2) : ($w - 2 * mxConstants::$LABEL_INSET) / $lineCount;
	 		
	 		// Linespacing or top shift correction
	 		if ($lineCount * $dy >= $h)
	 		{
	 			$dy -= 1;
	 		}
	 		else if (mxUtils::getValue($style, mxConstants::$STYLE_VERTICAL_ALIGN) == mxConstants::$ALIGN_MIDDLE)
	 		{
	 			$y += ($h - $lineCount * $dy) / 2 - 4;
	 		}

			if ($horizontal)
			{
	 			$y += 0.8 * $dy + mxConstants::$LABEL_INSET;				
			}
			else
			{
				$y += $h;
				$x += $dy;
			}

			// Draws the text line by line
			for ($i = 0; $i < $lineCount; $i++)
			{
				$hr = strpos($lines[$i], "<hr");
				$bold = strpos($lines[$i], "<b>");
				$tmpFont = $font;
				
				if ($hr !== false)
				{
					$this->drawLine($x0, $y - $dy / 2, $x0 + $w, $y - $dy / 2, $color);
					$lines[$i] = substr($lines[$i], strpos(
						$lines[$i], ">", $hr + 1) - $bold + 1); 
				
					if ($horizontal)
					{
						$y += $dy / 2;
					}
					else
					{
						$x += $dy / 2;
					}
				}
				
				
				if ($bold !== false)
				{
					$tmpFont = $this->getBoldFont($font);
					$lines[$i] = substr($lines[$i], $bold + 3,
						strpos($lines[$i], "</b>", $bold + 3) -
						$bold - 3);
				}
				
				// Currently only <font style='color:#XXXXXX'> supported
				$fnt = strpos($lines[$i], "<font");
				$fntColor = $color;
				
				if ($fnt !== false)
				{
					$close = strpos($lines[$i], ">", $fnt + 1);
					$fnt = substr($lines[$i], $fnt, $close + 1);
					$lines[$i] = substr($lines[$i], $close + 1,
						strpos($lines[$i], "</font>", $close) -
						$close - 1);
					$color = strpos($fnt, "color:");
					$colorValue = substr($fnt, $color + 6, 7);
					$fntColor = $this->getColor($colorValue, "black");
				}

				$left = $x;
				$top = $y;
				$tmp = imagettfbbox($fontSize, 0, $tmpFont, $lines[$i]);
				$lineWidth = $tmp[2] - $tmp[0];
	
				if ($align == mxConstants::$ALIGN_CENTER)
				{
					if ($horizontal)
					{
						$left += ($w - $lineWidth) / 2;
					}
					else
					{
						$top -= ($h - $lineWidth) / 2;
					}
				}
				else if ($align == mxConstants::$ALIGN_RIGHT)
				{
					if ($horizontal)
					{
						$left += $w - $lineWidth;
					}
					else
					{
						$top -= $h - $lineWidth;
					}
				}
				
				$this->drawTtfTextLine($lines[$i], $left, $top, $w, $h,
					$fntColor, $fontSize, $tmpFont, ($horizontal) ? 0 : 90);

				if ($horizontal)
				{
					$y += $dy;
				}
				else
				{
					$x += $dy;
				}
			}
		}
	}

	/**
	 * Function: drawFixedTextLine
	 *
	 * Draws the given fixed text line.
	 */
	function drawFixedTextLine($text, $font, $left, $top, $color, $horizontal = true)
	{
		if (strpos($text, "<b>") === 0)
		{
			$text = substr($text, 3, strpos($text, "<", 1) - 3);
			$this->drawFixedTextLine($text, $font, $left + 1, $top, $color, $horizontal);
		}
	
		if ($horizontal)
		{
			imageString($this->image, $font, $left, $top, $text, $color);
		}
		else
		{
			imageStringUp($this->image, $font, $left, $top, $text, $color);
		}
	}
	
	/**
	* Function: getTrueTypeFont
	* 
	* Overrides method to add support for bold fonts.
	*/
	function getTrueTypeFont($style)
	{
		$font = mxUtils::getTrueTypeFont($style);
		
		// Checks if the font should be bold
		if (mxUtils::getNumber($style, mxConstants::$STYLE_FONTSTYLE) && mxConstants::$FONT_BOLD ==
			mxConstants::$FONT_BOLD)
		{
			$font = $this->getBoldFont($font);
		}
		
		return $font;
	}
	
	/**
	 * Function: getBoldFont
	 * 
	 * Returns the font that represents the bold style of the given font.
	 * This implementation appends Bd to the given fontname.
	 */
	function getBoldFont($font)
	{
		return $font."Bd";
	}
	
	/**
	 * Function: drawGraph
	 * 
	 * Draws the given graph using this canvas.
	 */
	public static function drawGraph($graph, $clip = null, $background)
	{
	 	$graph->view->validate();
	 	$bounds = $graph->getGraphBounds();
	 	
	 	$width = $bounds->x + $bounds->width + 1 + mxConstants::$SHADOW_OFFSETX;
	 	$height = $bounds->y + $bounds->height + 1 + mxConstants::$SHADOW_OFFSETY;
	 		 	
	 	if ($clip == null)
	 	{
	 		$clip = new mxRectangle(0, 0, $width, $height);
	 	}
	 	
	 	$canvas = new vsGdCanvas($graph, $clip->width, $clip->height, $graph->view->scale, $background);
	 	
	 	$graph->drawGraph($canvas);
	 	$image = $canvas->getImage();
	 	//TODO: $canvas->destroy();
	 	
	 	return $image;
	}

}
?>
