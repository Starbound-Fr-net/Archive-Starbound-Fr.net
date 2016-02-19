function Peep()
{
	this.name			= "";
	this.posX			= 0;
	this.posY			= 0;
	
	this.sheetIndex		= 0;
	
	this.currentTasks	= new Array();
	
	this.element		= $.parseHTML( "<div class='peep clickthrough'></div>" )[0];
	this.element.onclick = function( event ) { clickedPeep( event ); };
	
	this.detailsElement	= $.parseHTML( "<div class='peep details'></div>" )[0];
	this.detailsElement.onclick = function( event ) { clickedDetailsPeep( event ); };
	this.dragElement	= $.parseHTML( "<div class='peep drag'></div>" )[0];
	this.dragElement.onclick = function( event ) { clickedDragPeep( event ); };
}

Peep.prototype.setSheetIndex = function( index )
{
	this.sheetIndex = index;
	var backgroundPosition = -chibiGrid/4 - ( chibiGrid * index ) + "px -14px";
	this.element.style.backgroundPosition = backgroundPosition;
	this.detailsElement.style.backgroundPosition = backgroundPosition;
	this.dragElement.style.backgroundPosition = backgroundPosition;
}

Peep.prototype.setName = function( name )
{
	this.name = name;
}

Peep.prototype.toggleDetails = function( enabled )
{
	var backgroundPosition;
	if ( enabled )
		backgroundPosition = -chibiWidth/2 - ( chibiWidth * 2 * this.sheetIndex ) + "px bottom";
	else
		backgroundPosition = -chibiWidth/2 - ( chibiWidth * 2 * this.sheetIndex ) + "px 100px";
	
	this.detailsElement.style.backgroundPosition = backgroundPosition;
}

Peep.prototype.remove = function()
{
	$(this.element).remove();
	this.element.onclick = null;
	this.deleteBtn.onclick = null;
	// Defensive programming for the win!
}

Peep.prototype.toString = function()
{
	return "Peep[" + this.name + ", x:" + this.posX + ", y:" + this.posY + "]";
}

Peep.prototype.toJSON = function()
{
	var string		 = "		\"" + this.name + "\" : {\n";
	string			+= "			\"posX\" : " + this.posX + ",\n";
	string			+= "			\"posY\" : " + this.posY + ",\n";
	string			+= "			\"index\" : " + this.sheetIndex + "\n";
	string			+= "		}";
	
	return string;
}

Peep.prototype.fromXML = function( $xml )
{
	this.setName( $xml.attr( "name" ) );
	this.setSheetIndex( $xml.attr( "sheetIndex" ) );
	
	this.posX = $xml.find( "posX" ).text();
	this.posY = $xml.find( "posY" ).text();
}

Peep.prototype.toXML = function()
{
	var string	 = "		<peep name=\"" + escapeXML( this.name ) + "\" sheetIndex='" + this.sheetIndex + "'>\n";
	//string		+= "			<name>" + this.name + "</name>\n";
	string		+= "			<posX>" + this.posX + "</posX>\n";
	string		+= "			<posY>" + this.posY + "</posY>\n";
	string		+= "		</peep>\n";
	
	return string;
}


var detailsPeep;

function clickedPeep( event )
{
	if ( !adminMode || adminLayer !== "peeps" || currentItem != null || editItem != null )
	{
		currentItem = null;
		
		if ( adminLayer !== "peeps" )
			clickedMarker( event );
		
		return;
	}
	
	for ( var i in peeps )
	{
		var peep = peeps[i];
		if ( coordsInside( $(peep.element), event.pageX, event.pageY ) )
		{
			console.log( "Gotcha peep! " + peep );
			currentItem = peep;
			break;
		}
	}
	
	if ( !adminMode )
	{
		showDetails();
		currentItem = null;
	}
}

/*
function clickedDetailsPeep( event )
{
	if ( detailsPeep != null )
	{
		detailsDiv.removeChild( detailsPeep.dragElement );
		detailsPeep == null;
		return;
	}
	
	for ( var i in peeps )
	{
		var peep = peeps[i];
		if ( coordsInside( $(peep.detailsPeep), event.pageX, event.pageY ) )
		{
			console.log( "Gotcha peep! (" + peep.name + ")" );
			//peep.toggleDetails( false );
			detailsWrapper.append( peep.dragElement );
			peep.calculatePosition( event.clientX, event.clientY, "drag" );
			detailsPeep = peep;
			break;
		}
	}
}

function clickedDragPeep( event )
{
}
*/