<?php
/**
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: vsGraphModel
 * 
 * Custom graph model for creating VISA network diagrams. This class provides
 * an API for mapping network entities to cell hierarchies for use with the
 * VISA Network Editor read-only client.
 */

class vsGraphModel extends mxGraphModel
{

	/**
	 * Variable: doc
	 *
	 * Holds the XML document that is used for creating elements in <createEntity>.
	 */
	var $doc;
	
	/**
	 * Variable: endpointLocationLabel
	 * 
	 * Holds the label for the endpoint location in VSAT networks. Default is
	 * "Endpoint Location".
	 */
	var $endpointLocationLabel = "Endpoint Location";
	
	/**
	* Variable: endpointLocationStyle
	*
	* Holds the style for the endpoint location rectangle. Default is
	* "endpointLocation".
	*/
	var $endpointLocationStyle = "endpointLocation";

	/**
	 * Variable: remoteLocationLabel
	 *
	 * Holds the label for the remote location in VSAT networks. Default is
	 * "Remote Location".
	 */
	var $remoteLocationLabel = "Remote Location";
	
	/**
	* Variable: remoteLocationStyle
	*
	* Holds the style for the remote location rectangle. Default is
	* "remoteLocation".
	*/
	var $remoteLocationStyle = "remoteLocation";
	
	/**
	* Variable: vsat
	*
	* True if a vsat node was inserted.
	*/
	var $vsat = false;

	/**
	 * Constructor: vsGraphModel
	 * 
	 * Constructs a new vsGraphModel. The model initially contains the cells for
	 * the root and first layer, as well as the demarcation line that separates
	 * the graph horizontally.
	 */
	function vsGraphModel($demarcationTitle = null, $note = null, $noteStyle = null)
	{
		parent::mxGraphModel();

		// Creates an XML document for creating DOM nodes
		$this->doc = mxUtils::createXmlDocument();
		
		// Adds the demarcation line with its title
		if ($demarcationTitle != null)
		{
			$parent = $this->getChildAt($this->root, 0);
			$edge = $this->addEdge($parent, null, $demarcationTitle,
				null, null, "demarcation");
				
			// Places the label at the start of the edge
			$edge->geometry->offset = new mxPoint(4, -4);
			$edge->geometry->x = -1;
			
			// Adds dummy terminal points which will be updated later
			$edge->geometry->setTerminalPoint(new mxPoint(1, 1), true);
			$edge->geometry->setTerminalPoint(new mxPoint(1, 1), false);
		}
		
		// Adds note
		if ($note != null)
		{
			$parent = $this->getChildAt($this->root, 0);
			$this->addVertex($parent, null, $note, 0, 0, 0, 0, $noteStyle);
		}
	}

	/**
	 * Function: createEntity
	 * 
	 * Creates and returns an XML node that serves as the user object (aka
	 * value) of a vertex.
	 * 
	 * Parameters:
	 * 
	 * id - Optional string that defines the unique ID of the entity.
	 * row - Optional integer (1 or 2) that defines the row in which the entity
	 * should appear. null means the element appears in the middle row or is
	 * stacked with all other endpoints.
	 * type - String that defines the type of the entity (ROUTER, NETWORK,
	 * SWITCH, ASE, IMA, ISR or SERVER).
	 * label - Optional string that defines the main label of the entity.
	 * title - Optional string that defines the label to appear above the
	 * entity.
	 * details - Optional string that defines the label to appear below the
	 * entity.
	 * endpoint - Optional boolean that specifies if the given entity is an
	 * endpoint in the network.
	 */
	function createEntity($id, $row = null, $type, $label = null, $title = null, $details = null, $endpoint = false)
	{
		$node = $this->doc->createElement($type);
		
		$node->setAttribute("id", $id);
		$node->setAttribute("label", $label);

		if ($row != null)
		{
			$node->setAttribute("row", $row);
		}
		
		if ($endpoint != false)
		{
			$node->setAttribute("endpoint", "1");
		}
		
		if ($title != null)
		{
			$node->setAttribute("title", $title);
		}
		
		if ($details != null)
		{
			$node->setAttribute("details", $details);
		}

		return $node;
	}

	/**
	 * Function: createLink
	 * 
	 * Creates and returns an XML node that serves as the user object (aka
	 * value) of an edge. The node name of the resulting DOM node is LINK.
	 * 
	 * Parameters:
	 * 
	 * id - Optional string that defines the unique ID of the link.
	 * label - Optional string that defines the main label of the link.
	 * sourceLabel - Optional string that defines the source label of the link.
	 * targetLabel - Optional string that defines the target label of the link.
	 */
	function createLink($id, $label = null, $sourceLabel = null, $targetLabel = null)
	{
		$node = $this->doc->createElement("LINK");
		
		$node->setAttribute("id", $id);
		$node->setAttribute("label", $label);
		
		if ($sourceLabel != null)
		{
			$node->setAttribute("sourceLabel", $sourceLabel);
		}
		
		if ($targetLabel != null)
		{
			$node->setAttribute("targetLabel", $targetLabel);
		}

		return $node;
	}
	
	/**
	 * Function: insert
	 * 
	 * Inserts a new vertex with the given XML node as the value. The width,
	 * height and style are used to describe the vertex appearance. The
	 * returned vertex is a cell hierarchy that contains the graphical
	 * representation for the given XML node.
	 * 
	 * Parameters:
	 * 
	 * node - XML node that represents the user object of the vertex.
	 * width - Integer that defines the vertex width in pixels.
	 * height - Integer that defines the vertex height in pixels.
	 * style - Optional string the defines the vertex style.
	 */
	function insert($node, $width, $height, $style = null)
	{
		// Gets the default layer that contains the cells
		$parent = $this->getChildAt($this->root, 0);
		
		// Moves the id attribute from the user object to the cell
		$id = $node->getAttribute("id");
		$node->removeAttribute("id");
		$realstyle = $style;
		
		if ($realstyle == "vsat")
		{
			$realstyle = null;
		}
		
		// Adds the topmost vertex to the model
		$vertex = $this->addVertex($parent, $id, $node, null, null, $width, $height, $realstyle);
		
		// Adds the child vertex for the title
		$title = $this->addVertex($vertex, null, "title", 0.5, 0, 0, 0, "title");
		$title->geometry->relative = true;
		$title->connectable = false;

		// Adds the child vertex for the details
		$details = $this->addVertex($vertex, null, "details", 0.5, 1, 0, 0, "details");
		$details->geometry->relative = true;
		$details->connectable = false;
		
		// Vsat style means adding a child with a vsat shape and reset the style for the parent (see above)
		if ($style == "vsat")
		{
			$vsat = $this->addVertex($vertex, null, "", 0.5, 0, 38, 46, "vsat");
			$vsat->geometry->offset = new mxPoint(-12, -48);
			$vsat->geometry->relative = true;
			$vsat->connectable = false;
			
			$this->vsat = true;
		}
		
		return $vertex;
	}
	
	/**
	 * Function: connect
	 * 
	 * Inserts a new edge between the given source and target vertices with the
	 * given style and XML node as the value.
	 * 
	 * Parameters:
	 * 
	 * node - XML node that represents the user object of the edge.
	 * source - <mxCell> that defines the source vertex of the edge.
	 * target - <mxCell> that defines the target vertex of the edge.
	 * style - Optional string that defines the edge style.
	 */
	function connect($node, $source, $target, $style = null, $sourceLabelStyle = "", $targetLabelStyle = "")
	{
		// Gets the default layer that contains the cells
		$parent = $this->getChildAt($this->root, 0);
		
		// Adds the topmost edge to the model
		$edge = $this->addEdge($parent, null, $node, $source, $target, $style);

		// Adds the child vertex for the source label to the edge
		$tmp = (strlen($sourceLabelStyle) > 0) ? "sourceLabel;".$sourceLabelStyle : "sourceLabel";
		$label1 = $this->addVertex($edge, null, "sourceLabel", -1, 0, 0, 0, $tmp);
		$label1->geometry->relative = true;
		$label1->connectable = false;

		// Adds the child vertex for the target label to the edge
		$tmp = (strlen($targetLabelStyle) > 0) ? "targetLabel;".$targetLabelStyle : "targetLabel";
		$label1 = $this->addVertex($edge, null, "targetLabel", 1, 0, 0, 0, $tmp);
		$label1->geometry->relative = true;
		$label1->connectable = false;
		
		if (strpos($style, "shape=wave") !== false)
		{
			$wave = $this->addVertex($edge, null, "", 0, 0, 30, 14, "shape=wave;fillColor=none;");
			$wave->geometry->offset = new mxPoint(-15, -7);
			$wave->geometry->relative = true;
			$wave->connectable = false;
		}
		
		return $edge;
	}
	
	/**
	 * Function: addVertex
	 * 
	 * Adds a new vertex into the given parent <mxCell> using value as the user
	 * object and the given coordinates as the <mxGeometry> of the new vertex.
	 * The id and style are used for the respective properties of the new
	 * <mxCell>, which is returned.
	 *
	 * Parameters:
	 * 
	 * parent - <mxCell> that specifies the parent of the new vertex.
	 * id - Optional string that defines the Id of the new vertex.
	 * value - Object to be used as the user object.
	 * x - Integer that defines the x coordinate of the vertex.
	 * y - Integer that defines the y coordinate of the vertex.
	 * width - Integer that defines the width of the vertex.
	 * height - Integer that defines the height of the vertex.
	 * style - Optional string that defines the cell style.
	 */
	function addVertex($parent, $id, $value, $x = 0, $y = 0, $width = 0, $height = 0, $style = null)
	{
		$geometry = new mxGeometry($x, $y, $width, $height);
		$vertex = new mxCell($value, $geometry, $style);
		
		$vertex->setId($id);
		$vertex->setVertex(true);
		
		$index = $this->getChildCount($parent);
		
		return $this->add($parent, $vertex, $index);
	}
			
	/**
	 * Function: addEdge
	 * 
	 * Adds a new edge into the given parent <mxCell> using value as the user
	 * object and the given source and target as the terminals of the new edge.
	 * The id and style are used for the respective properties of the new
	 * <mxCell>, which is returned.
	 *
	 * Parameters:
	 * 
	 * parent - <mxCell> that specifies the parent of the new edge.
	 * id - Optional string that defines the Id of the new edge.
	 * value - JavaScript object to be used as the user object.
	 * source - <mxCell> that defines the source of the edge.
	 * target - <mxCell> that defines the target of the edge.
	 * style - Optional string that defines the cell style.
	 */
	function addEdge($parent, $id, $value, $source = null, $target = null, $style = null)
	{
		$geometry = new mxGeometry();
		$edge = new mxCell($value, $geometry, $style);
		
		$edge->setId($id);
		$edge->setEdge(true);
		$edge->geometry->relative = true;
		
		// Appends the edge to the given parent and sets
		// the edge terminals in a single transaction
		$index = $this->getChildCount($parent);
	 	
	 	$this->beginUpdate();
	 	try
	 	{
		 	$edge = $this->add($parent, $edge, $index);
			$this->setTerminal($edge, $source, true);
			$this->setTerminal($edge, $target, false);
		}
		catch (Exception $e)
		{
			$this->endUpdate();
			throw($e);
		}
		$this->endUpdate();

		return $edge;
	}

	/**
	 * Function: getXml
	 * 
	 * Returns the graph model as an XML node.
	 */
	function getXml()
	{
        $enc = new mxCodec();
        
        return $enc->encode($this);
	}

}

// Registers a codec for this class
mxCodecRegistry::register(new mxModelCodec(new vsGraphModel()));
?>
