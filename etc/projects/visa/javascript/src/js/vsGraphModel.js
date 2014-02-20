/**
 * $Id: vsGraphModel.js,v 1.1 2012/11/15 13:26:49 gaudenz Exp $
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: vsGraphModel
 * 
 * Custom graph model for the VISA Network Editor with an additional <getXml>
 * function.
 */
{

	/**
	 * Constructor: vsGraphModel
	 *
	 * Constructs a new graph model for the given root.
	 * 
	 * Parameters:
	 * 
	 * root - Optional <mxCell> that represents the root node.
	 */
	function vsGraphModel(root)
	{
		mxGraphModel.call(this, root);
	};

	/**
	 * Extends <mxGraphModel>.
	 */	
	vsGraphModel.prototype = new mxGraphModel();
	vsGraphModel.prototype.constructor = vsGraphModel;
	
	/**
	 * Registers class for I/O.
	 */
	var codec = mxCodecRegistry.getCodec(mxGraphModel);
	codec.template = new vsGraphModel();
	mxCodecRegistry.register(codec);

	/**
	 * Function: getXml
	 * 
	 * Returns the XML node that represents the model.
	 */
	vsGraphModel.prototype.getXml = function()
	{
		var enc = new mxCodec();
		
		return enc.encode(this);
	};

}
