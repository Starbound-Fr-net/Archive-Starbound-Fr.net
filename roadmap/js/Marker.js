function Marker()
{
	this.name		= "";
	this.posX		= 0;
	this.posY		= 0;
	this.tasks		= new Array();
	
	var elements	= $.parseHTML( "<div class='marker'> <div class='caption'></div> <div class='deleteButton'>-</div> </div>" );
	
	this.element	= elements[0];
	this.caption	= elements[0].children[0];
	this.deleteBtn	= elements[0].children[1];
	
	$(this.deleteBtn).hide();
	
	this.element.onclick = function( event ) { clickedMarker( event ); };
	this.caption.onclick = function( event ) { editCaption( event ); };
	this.deleteBtn.onclick = function( event ) { deleteMarker( event ); };
}

Marker.prototype.setCaption = function( caption )
{
	this.name = caption;
	this.caption.innerHTML = caption;
}

Marker.prototype.remove = function()
{
	$(this.element).remove();
	this.element.onclick = null;
	this.caption.onclick = null;
	this.deleteBtn.onclick = null;
	// Defensive programming for the win!
}

Marker.prototype.toString = function()
{
	return "Marker[" + this.name + ", x:" + this.posX + ", y:" + this.posY + "]";
}

Marker.prototype.fromXML = function( $xml )
{
	this.setCaption( $xml.attr( "name" ) );
	this.posX = $xml.find( "posX" ).text();
	this.posY = $xml.find( "posY" ).text();
	
	var marker = this;
	$xml.children( "tasks" ).children().each( function ( index, element )
		{
			var $taskChild = $(element);
			var task = new Array();
			
			task.name = $taskChild.attr( "name" );
			task.progress = $taskChild.attr( "progress" );
			task.description = $taskChild.children( "description" ).text();
			task.images = new Array();
			
			$taskChild.children( "images" ).children().each( function ( index, element )
				{
					var $imgChild = $(element);
					var image = new Object();
					image.thumbUrl = $imgChild.children( "thumbUrl" ).text();
					image.fullUrl = $imgChild.children( "fullUrl" ).text();
					
					task.images.push( image );
				}
			);
			
			marker.tasks.push( task );
		}
	);
}

Marker.prototype.toXML = function()
{
	var string		 = "		<marker name=\"" + escapeXML( this.name ) + "\">\n";
	//string			+= "			<name>" + this.name + "</name>\n";
	string			+= "			<posX>" + this.posX + "</posX>\n";
	string			+= "			<posY>" + this.posY + "</posY>\n";
	string			+= "			<tasks>\n";
	
	for ( var i in this.tasks )
	{
		var task = this.tasks[i];
		if ( task == null || task.name == null )
		{
			string	+= "				<task/>\n";
			continue;
		}
		
		string		+= "				<task name='" + escapeXML( task.name ) + "' progress='" + task.progress + "'>\n";
		
		string		+= "					<description>";
		if ( task.description )
			string	+= escapeXML( task.description );
		string		+= "</description>\n";
		
		string		+= "					<images>\n";
		
		for ( var j in task.images )
		{
			var image = task.images[j];
			string	+= "						<image>\n";
			string	+= "							<thumbUrl>" + escapeXML( image.thumbUrl ) + "</thumbUrl>\n";
			string	+= "							<fullUrl>" + escapeXML( image.fullUrl ) + "</fullUrl>\n";
			string	+= "						</image>\n";
		}
		string		+= "					</images>\n";
		
		string		+= "				</task>\n";
	}
	
	string			+= "			</tasks>\n";
	string			+= "		</marker>\n";
	
	return string;
}

function addMarker( event )
{
	if ( !adminMode || adminLayer !== "markers" )
		return;
	
	console.log( "Creating new marker at " + event.pageX + "," + event.pageY );
	
	currentItem = new Marker();
	currentItem.setCaption( "New Marker" );
	map.append( currentItem.element );
	calculateElementPosition( currentItem, event.pageX, event.pageY );
	$(currentItem.deleteBtn).toggle();
	
	markers.push( currentItem );
}

function clickedMarker( event )
{
	if ( currentItem != null || editItem != null )
	{
		currentItem = null;
		return;
	}
	
	if ( adminMode && adminLayer !== "markers" && adminLayer !== "tasks" )
		return;
	
	console.log( "Finding marker clicked at " + event.pageX + "," + event.pageY );
	
	for ( var i in markers )
	{
		var marker = markers[i];
		console.log( "Trying " + marker );
		if ( coordsInside( $(marker.element), event.pageX, event.pageY ) )
		{
			console.log( "Gotcha marker! " + marker );
			currentItem = marker;
			break;
		}
	}
	
	if ( currentItem != null && !adminMode || adminLayer === "tasks" )
	{
		showDetails( currentItem );
		currentItem = null;
	}
}

function deleteMarker( event )
{
	if ( !adminMode || adminLayer !== "markers" )
		return;
	
	clickedMarker( event );
	console.log( "Delete " + currentItem );
	
	if ( markers.indexOf( currentItem ) != -1 )
	{
		markers.splice( markers.indexOf( currentItem ), 1 );
		currentItem.remove();
	}
	
	currentItem = null;
}

function editCaption( event )
{
	if ( !adminMode || editItem != null || adminLayer !== "markers" )
		return;
	
	clickedMarker( event );
	console.log( "Edit caption of " + currentItem );
	
	currentItem.caption.style.display = "none";
	editItem = currentItem;
	
	captionInput.value = currentItem.name;
	$(currentItem.element).prepend( captionInput );
	captionInput.focus();
	captionInput.select();
}

function captionInputChange( event )
{
	if ( event.which == 13 )
		$(captionInput).blur();
}

function captionInputBlur( event )
{
	//return;
	
	console.log( "Blurring input" );
	if ( captionInput.value == "" )
		captionInput.value = "[undefined]";
	
	editItem.setCaption( captionInput.value );
	$(captionInput).detach();
	editItem.caption.style.display = "block";
	
	editItem = null;
}

