<?php
/**
 * $Id: vsGraph.php,v 1.1 2012/11/15 13:26:47 gaudenz Exp $
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: vsGraph
 * 
 * Custom graph for creating images using <vsGdCanvas>.
 */

class vsGraph extends mxGraph
{

	/**
	 * Constructor: vsGraph
	 * 
	 * Constructs a new vsGraph that uses <vsGdCanvas> for creating images.
	 */
	function vsGraph(&$model=null)
	{
		parent::mxGraph($model);
	}

	/**
	 * Function: isOrthogonal
	 * 
	 * Returns true if perimeter points should be computed such that the
	 * resulting edge has only horizontal or vertical segments.
	 * 
	 * Parameters:
	 * 
	 * edge - <mxCellState> that represents the edge.
	 */
	function isOrthogonal($edge)
	{
		return true;
	}

	/**
	 * Function: getLabel
	 * 
	 * Overrides <mxGraph.getLabel> to return a string representation of the
	 * complete label.
	 */
	function getLabel(&$cell)
	{
		$label = "";
		
		if ($cell != null)
		{
			$model = $this->getModel();
			$parent = $model->getParent($cell);

			// Gets the attribute from the parents user object
			if ($model->isVertex($parent) || $model->isEdge($parent))
			{
				$label = $parent->getAttribute($cell->getValue(), "");
			}
			else
			{
				$label = $cell->getAttribute("label");
				
				if ($label == null && is_string($cell->value))
				{
					$label = $cell->value;
				}
			}
		}
		
		return $label;
	}
	
	/**
	 * Function: createImage
	 * 
	 * Overrides <mxGraph.createImage> to use <vsGdCanvas>.
	 */
	function createImage($clip=null, $background=null)
	{
		return vsGdCanvas::drawGraph($this, $clip, $background);
	}
	
	/**
	 * Function: loadStyle
	 * 
	 * Loads the given URL as a stylesheet.
	 * 
	 * Parameters:
	 * 
	 * url - URL of the XML file to be loaded.
	 */
	function loadStyle($url)
	{
		if ($url != null)
		{
			$doc = mxUtils::loadXmlDocument($url);
			$dec = new mxCodec($doc);
			$dec->decode($doc->documentElement, $this->stylesheet);
		}
	}

}
?>
