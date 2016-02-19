"use strict";

var configXml, preorderUrl = "images/5cps.jpg";

var mainWrapper, map, popup, intro;
var controlPanel, markerModeButton, peepsModeButton, tasksModeButton, addMarkerButton, saveConfigButton;
var configWrapper, configPanel, configText;
var detailsWrapper, detailsPanel;
var satelliteTop = -70, satelliteBottom = -64, satelliteInterval = 1500;
var penguTop = 55, penguBottom = 59, penguInterval = 1900;

var mapMaxWidth = 1190;
var detailsWidth, detailsWidthPart = 412, detailsWidthPadding = 6, detailsHeight = 400, detailsInnerMargin = 94, detailsHeightStart = 80, detailsLR, detailsTB;
var detailsTaskHeight = 46, detailsMeterWidth = 302, detailsTasksAmount = 12;
var fadeTime = 400;

var chibiGrid = 64, chibiLocation = "images/chibichibi.gif";
var chibiImage = new Image();
chibiImage.src = chibiLocation;

var markers = new Array();
var peeps = new Array();
var tasks = new Array();
var currentItem, editItem;

var jsonLocation = "etwas.json";
var xmlLocation = "config.xml";

var captionInput;

var peepLocation = "images/chibichibi.gif";
var peepImage = new Image();
peepImage.src = peepLocation;

var markerLocation = "images/marker.png";
var markerImage = new Image();
markerImage.src = markerLocation;


var adminMode = false, adminLayer = "tasks", debug = false;

$( function()
	{
		mainWrapper = document.getElementById("mainWrap");
		map = $("#mapDiv");
		popup = $("#popupDiv");
		intro = $("#introDiv" );
		
		controlPanel = $("#controlPanel");
		markerModeButton = $("#markerModeButton");
		peepsModeButton = $("#peepsModeButton");
		tasksModeButton = $("#tasksModeButton");
		addMarkerButton = $("#addMarkerButton");
		saveConfigButton = $("#saveConfigButton");
		
		configWrapper = $("#configWrapper" );
		configPanel = $("#configDiv");
		configText = document.getElementById("configText");
		
		detailsWrapper = $("#detailsWrapper");
		detailsPanel = $("#detailsPanel");
		detailsHeight = ( detailsTaskHeight * detailsTasksAmount ) + detailsInnerMargin - 4;
		detailsDescription.style.height = ( detailsHeight - detailsInnerMargin ) + "px";
		detailsList.style.height = ( detailsHeight - detailsInnerMargin ) + "px";
		
		for ( var i = 0; i < detailsTasksAmount; i++ )
		{
			var task = new Task( i );
			detailsList.appendChild( task.element );
			tasks.push( task );
		}
		
		popupWrapper.style.display = "block";
		calculateDimensions();
		
		popupCloseButton.onclick = function( event ) { closePopup() };
		planet.onclick = function( event ) { openPreorder() };
		
		configWrapper.click( function( event ) { hideConfig( event ); } );
		configText.onclick = function() { configText.select() };
		
		detailsWrapper.click( function( event ) { hideDetails( event ); } );
		
		markerModeButton.click( function( event ) { selectAdminLayer( "markers" ) } );
		peepsModeButton.click( function( event ) { selectAdminLayer( "peeps" ) } );
		tasksModeButton.click( function( event ) { selectAdminLayer( "tasks" ) } );
		addMarkerButton.click( function( event ) { addMarker( event ); } );
		saveConfigButton.click( function( event ) { saveConfig(); } );
		disableAdminButton.onclick = function( event ) { toggleAdminMode(); };
		
		$(detailsDescriptionContentImages).children( ".detailsImage" ).click( function( event ) { clickedDetailsImage( event ); } );
		detailsHeaderClose.onclick = function( event ) { hideDetails( event ); };
		detailsDescriptionContentTextEdit.onblur = function( event ) { taskDescriptionBlur() };
		detailsImageAdminButton.onclick = function( event ) { closeTaskImageAdmin(); };
		detailsImageAdminThumbInput.onchange = function( event ) { taskImageUrlChanged(); };
		detailsImageAdminFullInput.onchange = function( event ) { taskImageUrlChanged(); };
		
		$(window).mousemove( function( event ) { moveItem( event ); } );
		$(window).resize( function() { calculateDimensions(); } );
		
		captionInput = $.parseHTML( "<input type='text' class='caption'>" )[0];
		$(captionInput).keyup( function( event ) { captionInputChange( event ) } );
		$(captionInput).blur( function( event ) { captionInputBlur( event ) } );
		
		
		console.log( "Fetching XML(!) at " + xmlLocation + " like a boss." );
		
		$.get( xmlLocation, function ( data )
			{
				map.append( parseConfigXML( $(data) ) );
				
				for ( var i in peeps )
					calculateElementPosition( peeps[i], null, null );
				
				for ( var i in markers )
					calculateElementPosition( markers[i], null, null );
				
				if ( debug )
				{
					toggleAdminMode();
				}
			}
		);
		
		$(satellite).css( "top", satelliteTop + "px" );
		animateSatelliteDown();
		animatePenguUp();
		
		
		
	}
);


function parseJSON( data )
{
	var frag = document.createDocumentFragment();
	
	// Set up my peeps!
	for ( var i in data.peeps )
	{
		console.log( "Creating peep for " + i );
		
		var peep = new Peep();
		peep.setName( i );
		peep.setSheetIndex( data.peeps[i].index );
		peep.setPos( data.peeps[i].posX, data.peeps[i].posY );
		
		peeps.push( peep );
		frag.appendChild( peep.element );
	}
	
	// Loopyloop through the markers. Plop those plops on the plopper like a real plop!
	for ( var i in data.markers )
	{
		console.log( "Creating marker for " + i );
		
		var marker = new Marker();
		marker.setPos( data.markers[i].posX, data.markers[i].posY );
		marker.setCaption( i );
		marker.tasks = data.markers[i].tasks;
		
		markers.push( marker );
		frag.appendChild( marker.element );
	}
	
	return frag;
}

function parseConfigXML( $xml )
{
	console.log( "Parsing XML config" );
	var frag = document.createDocumentFragment();
	
	console.log( $xml );
	
	// Set up my peeps!
	$xml.find( "peeps" ).children().each( function ( index, element )
		{
			var $child = $(element);
			console.log( "Creating new peep for " + $child.attr( "name" ) );
			
			var peep = new Peep();
			peep.fromXML( $child );
			
			console.log( "	Created " + peep );
			
			peeps.push( peep );
			frag.appendChild( peep.element );
		}
	);
	
	// Loopyloop through the markers. Plop those plops on the plopper like a real plop!
	$xml.find( "markers" ).children().each( function ( index, element )
		{
			var $child = $(element);
			console.log( "Creating new marker for " + $child.attr( "name" ) );
			
			var marker = new Marker();
			marker.fromXML( $child );
			
			console.log( "	Created " + marker );
			
			markers.push( marker );
			frag.appendChild( marker.element );
		}
	);
	
	return frag;
}

function toggleAdminMode()
{
	adminMode = !adminMode;
	console.log( "Setting admin mode to " + adminMode );
	
	if ( adminMode )
	{
		map.css( "outline", "1px solid silver" );
	}
	else
	{
		map.css( "outline", "none" );
		
		// Reset all the potential fades and nonsense from our editing
		$(".peep").addClass( "clickthrough" );
		$(".peep").css( "opacity", 1 );
		
		$(".marker").removeClass( "clickthrough" );
		$(".marker").css( "opacity", 1 );
		
		console.log( "BLARGH" );
	}
	
	controlPanel.toggle();
	$(detailsDescriptionContentTextEdit).toggle();
	$(".taskWrapper").toggleClass( "noedit" );
	$(".marker").children(".deleteButton").toggle();
	
	if ( adminMode )
		selectAdminLayer( adminLayer );
}

function selectAdminLayer( layer )
{
	adminLayer = layer;
	markerModeButton.removeClass( "selected" );
	peepsModeButton.removeClass( "selected" );
	tasksModeButton.removeClass( "selected" );
	
	addMarkerButton.addClass( "disabled" );
	
	if ( layer === "markers" )
	{
		markerModeButton.addClass( "selected" );
		controlDescription.innerText = "Cliquez sur un marqueur pour le deplacer, cliquez a nouveau pour le supprimer. Cliquez sur le nom d'un marqueur pour le modifier. Cliquez sur \"Ajouter marqueur\" ci-dessus pour ajouter en creer un. Cliquez sur la croix de supprimer un marqueur (et ses tâches associees.)";
		
		// Let's bring the click back to the markers
		$(".marker").removeClass( "clickthrough" );
		$(".marker").css( "opacity", 1 );
		
		// Pop the add marker button
		addMarkerButton.removeClass( "disabled" );
		
		// Fade out the peeps
		$(".peep").addClass( "clickthrough" );
		$(".peep").css( "opacity", .5 );
	}
	else if ( layer === "peeps" )
	{
		peepsModeButton.addClass( "selected" );
		controlDescription.innerText = "Cliquez sur une poupee pour la déplacer, cliquez à nouveau pour la supprimer. C'est du gateau !";
		
		// Make all them little peeps clickable
		$(".peep").removeClass( "clickthrough" );
		$(".peep").css( "opacity", 1 );
		
		// Fade out the markers, make non-clicky
		$(".marker").css( "opacity", .5 );
		$(".marker").addClass( "clickthrough" );
	}
	else if ( layer === "tasks" )
	{
		tasksModeButton.addClass( "selected" );
		controlDescription.innerText = "Cliquez sur un marqueur pour afficher l'onglet des taches.";
		
		// For this mode, we need markers clickable
		$(".marker").removeClass( "clickthrough" );
		$(".marker").css( "opacity", 1 );
		
		// Fade out the peeps
		$(".peep").addClass( "clickthrough" );
		$(".peep").css( "opacity", .5 );
	}
}

function calculateDimensions()
{
	if ( popupWrapper.style.display === "block" )
	{
		var popupX = ( window.innerWidth - popupPanel.offsetWidth ) / 2;
		var popupY = ( window.innerHeight - popupPanel.offsetHeight ) / 2;
		
		$(popupPanel).css( { top: popupY + "px", left: popupX + "px" } );
	}
	
	for ( var i in markers )
	{
		var marker = markers[i];
		calculateElementPosition( marker, null, null );
	}
	
	detailsWidth = detailsWidthPart * 2 + detailsWidthPadding * 2 + 10;
	detailsLR = ( window.innerWidth - detailsWidth ) / 2;
	if ( detailsLR < 0 )
		detailsLR = 10;
	
	detailsTB = ( window.innerHeight - detailsHeight ) / 2;
	if ( detailsTB < 0 )
		detailsTB = 10;
	
	if ( !detailsPanel.is( ":hidden" ) )
	{
		detailsPanel.css( { "left" : detailsLR + "px",
						"right" : detailsLR + "px",
						"top" : detailsTB + "px",
						"bottom" : detailsTB + "px" } );
	}
	
	
}


function saveConfig()
{
	console.log( "Building XML(!) data" );
	
	configWrapper.show();
	
	if ( !adminMode )
		return;
	
	var xml = "<?xml version='1.0' encoding='UTF-8'?>\n\n<config>\n";
	
	xml += "	<peeps>\n";
	for ( var i in peeps )
		xml += peeps[i].toXML();
	xml += "	</peeps>\n";
	
	xml += "	<markers>\n";
	for ( var i in markers )
	{
		xml += markers[i].toXML();
	}
	xml += "	</markers>\n";
	xml += "</config>\n";
	
	configText.value = xml;
}

var XML_CHAR_MAP =
{
	'<': '&lt;',
	'>': '&gt;',
	'&': '&amp;',
	'"': '&quot;',
	"'": '&apos;'
};
 
function escapeXML( string )
{
	return string.replace( /[<>&"']/g, function ( ch )
		{
			return XML_CHAR_MAP[ch];
		}
	);
}

function hideConfig( event )
{
	if ( event.toElement.id != "configWrapper" )
		return;
	
	configWrapper.hide();
}

function moveItem( event )
{
	if ( !adminMode || currentItem == null )
		return;
	
	calculateElementPosition( currentItem, event.pageX, event.pageY );
}

function calculateElementPosition( item, offsetX, offsetY )
{
	if ( item == null )
		return;
	
	var offsets = $(item.element.offsetParent).offset();
	
	// Start it off at our last positions
	var locationX = item.posX, locationY = item.posY;
	
	//console.log( "Positioning " + item + " starting at " + locationX + "," + locationY );
	
	// If supplied explicit position, adjust by map position and override
	if ( offsetX != null )
		locationX = offsetX - offsets.left;
	
	if ( offsetY != null )
		locationY = offsetY - offsets.top;
	
	// Shift by half marker dimensions, centering it
	locationX -= item.element.offsetWidth / 2;
	locationY -= item.element.offsetHeight / 2;
	
	// Cap location to make sure it's inside the map
	if ( locationX < 0 )
		locationX = 0;
	if ( locationX > map.innerWidth - item.element.offsetWidth )
		locationX = map.innerWidth - item.element.offsetWidth;
	
	/* - Commented out to let our markers go above the map top edge
	if ( locationY < 0 )
		locationY = 0;
	*/
	if ( locationY > map.innerHeight - item.element.offsetHeight )
		locationY = map.innerHeight - item.element.offsetHeight;
	
	// Save our location in the object (adjusted, again, by marker dimensions)
	item.posX = locationX + item.element.offsetWidth / 2;
	item.posY = locationY + item.element.offsetHeight / 2;
	
	// Aaaand then nudge it if the map div has been shrunk by insufficient window size
	if ( map.innerWidth < mapMaxWidth )
		locationX -= ( mapMaxWidth - map.innerWidth ) / 2;
	
	// Finally make it the actual position of the marker element
	item.element.style.left = locationX + "px";
	item.element.style.top = locationY + "px";
}

function coordsInside( element, pageX, pageY )
{
	var offsets = element.offset();
	
	if ( pageX > offsets.left && pageX < offsets.left + element.outerWidth()
		&& pageY > offsets.top && pageY < offsets.top + element.outerHeight() )
		return true;
	
	return false;
}

function animateSatelliteUp()
{
	$(satellite).animate( { top: satelliteTop + "px" }, satelliteInterval, function() { animateSatelliteDown() } );
}

function animateSatelliteDown()
{
	$(satellite).animate( { top: satelliteBottom + "px" }, satelliteInterval, function() { animateSatelliteUp() } );
}

function animatePenguUp()
{
	$(pengu).animate( { top: penguTop + "px" }, penguInterval, function() { animatePenguDown() } );
}

function animatePenguDown()
{
	$(pengu).animate( { top: penguBottom + "px" }, penguInterval, function() { animatePenguUp() } );
}

function closePopup()
{
	$(popupPanel).animate( { height : ( detailsHeightStart - 4 ) + "px" }, fadeTime * 2,
		function()
		{
			setTimeout( function()
				{
					$(popupPanel).animate( { opacity: 0 }, fadeTime / 2,
						function()
						{
							$(popupWrapper).hide();
						}
					)
				}, 100
			);
			//setTimeout( function() { $(popupWrapper).hide(); }, 200 );
		}
	);
}

function openPreorder()
{
	if ( $(planet).hasClass( "active" ) && preorderUrl != null )
		window.open( preorderUrl, "_blank" );
}


function drownMolly()
{
	$(peeps[6].element).animate( { top: "400px" }, 700 );
	setTimeout( function() { $(peeps[6].element).stop(); $(peeps[6].element).animate( { "background-position-y": "62px" }, 100 ) }, 400 ); markers[1].setCaption( "nope lol" );	
}