<?php
/**
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: vsLanPerimeter
 *
 * Implements a rectangular perimeter for the given bounds.
 */
class vsLanPerimeter implements mxPerimeterFunction
{

	/**
	 *
	 */
	public function apply($bounds, $vertex, $next, $orthogonal)
	{
		$p = mxPerimeter::$RectanglePerimeter->apply($bounds, $vertex, $next, $orthogonal);
		
		// Moves the x-coordinate to the center of the lan
		$p->x = $bounds->x + $bounds->width / 2;
		
		return $p;
	}

}

/**
 * Class: vsPerimeter
 * 
 * Provides the lan perimeter.
 */
class vsPerimeter
{

	/**
	 * Variable: LanPerimeter
	 *
	 * Provides a perimeter for the vertical lan shape.
	 */
	public static $LanPerimeter;

}

// Instanciates the declared static members of the above class
vsPerimeter::$LanPerimeter = new vsLanPerimeter();

mxStyleRegistry::putValue("lanPerimeter", vsPerimeter::$LanPerimeter);
?>
