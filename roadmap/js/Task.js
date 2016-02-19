function Task( index )
{
	this.index			= index;
	this.name			= null;
	this.progress		= 0;
	this.description	= null;
	this.images			= new Array();
	
	this.element		= $.parseHTML( "<div class=\"taskWrapper noedit\"><div class=\"taskTop\"></div><div class=\"taskBottom\"></div><div class=\"taskInner\"></div><div class=\"taskContents\"><div class=\"taskTitle\">[not used]</div><input class=\"taskTitleInput\"/><div class=\"taskPercentage\">0%</div><div class=\"taskMeter\"><div class=\"taskMeterCap left\"></div><div class=\"taskMeterCap right\"></div><div class=\"taskMeterInner\"></div><div class=\"taskMeterFill\"></div></div></div><div class=\"taskDeleteButton\"></div></div>" )[0];
	$(this.element).click( function( event ) { clickedTaskWrapper( event ); } );
	$(this.element).find( ".taskContents" ).click( function( event ) { clickedTaskWrapper( event ); } );
	
	this.meterElement	= $(this.element).find( ".taskMeterInner" );
	this.meterElement.click( function( event ) { clickedTaskMeter( event ); } );
	
	$(this.element).find( ".taskTitle" ).click( function( event ) { clickedTaskTitle( event ); } );
	$(this.element).find( ".taskDeleteButton" ).click( function( event ) { clickedTaskDelete( event ); } );
}

Task.prototype.setName = function( name )
{
	this.name = name;
	$(this.element).find( ".taskTitle" ).text( name != null ? name : "[not used]" );
	$(this.element).find( ".taskTitleInput" ).val( name != null ? name : "" );
}

Task.prototype.setProgress = function( progress )
{
	//console.log( "Setting progress to " + progress );
	
	//if ( progress > 100 )
	//	progress = 100;
	
	if ( !progress || progress == NaN )
		progress = 0;
	
	this.progress = progress;
	
	$(this.element).find( ".taskMeterFill" ).css( "width", ( ( progress / 100 ) * detailsMeterWidth ) + "px" );
	$(this.element).find( ".taskPercentage" ).text( Math.floor( progress ) + "%" );
	
	if ( progress >= 100 )
		$(this.element).addClass( "completed" );
	else
		$(this.element).removeClass( "completed" );
}

Task.prototype.select = function()
{
	if ( currentTask )
		$(currentTask.element).removeClass( "selected" );
	
	currentTask = this;
	
	$(this.element).addClass( "selected" );
	
	if ( this.description != null && this.description.length > 0 )
	{
		detailsDescriptionContentText.innerHTML = this.description.replace( /\n/g, "<br>" );
		detailsDescriptionContentTextEdit.value = this.description;
	}
	
	$(detailsDescriptionContentImages).children( ".detailsImage" ).hide();
	$(detailsDescriptionContentImages).children( ".detailsImage" ).css( "background-image", "none" );
	
	for ( var i in this.images )
	{
		var image = this.images[i];
		console.log( "Checking image " + i + ": " + image.thumbUrl + ", " + image.fullUrl );
		
		if ( image.thumbUrl != null && image.thumbUrl != undefined && image.thumbUrl.length > 0 )
		{
			console.log( "Passed" );
			
			var $el = $("#detailsImage" + ++i );
			console.log( $el );
			$el.css( "background-image", "url( " + image.thumbUrl + " )" );
			$el.show();
		}
	}

	if ( adminMode )
		$(detailsDescriptionContentImages).children( ".detailsImage" ).show();
}

Task.prototype.clear = function()
{
	this.setName( null );
	this.setProgress( 0 );
	this.description = null;
	this.images = new Array();
	$(this.element).removeClass( "selected" );
	$(this.element).removeClass( "completed" );
	
	if ( currentTask == this )
		this.select();
}

Task.prototype.toString = function()
{
	var offset = $(this.element).offset();
	return "Task[" + this.name + ", x:" + offset.left + ", y:" + offset.top + "]";
}

Task.prototype.toObject = function()
{
	var task = new Object();
	task.name = this.name;
	task.progress = this.progress;
	task.description = this.description;
	task.images = this.images;
	
	return task;
}

var detailsMarker, currentTask, currentImage;

function showDetails( marker )
{
	if ( marker == null )
		return;
	
	detailsMarker = marker;
	populateDetails( marker );
	
	detailsWrapper.show();
	
	if ( adminMode )
	{
		detailsPanel.css( { left: detailsLR + "px", right: detailsLR + "px",
						top: detailsTB + "px", bottom: detailsTB + "px" } );
		
		if ( tasks.length > 0 )
			tasks[0].select();
		
		return;
	}
	
	$(detailsDescriptionContentImages).children( ".detailsImage" ).hide();
	detailsPanel.css( { left : ( window.innerWidth / 2 - 3 ) + "px",
						right : detailsLR + "px",
						top : ( window.innerHeight / 2 - detailsHeightStart / 2 ) + "px",
						bottom : ( window.innerHeight / 2 - detailsHeightStart / 2 ) + "px" } );
	detailsPanel.show();
	
	detailsPanel.animate( { top : detailsTB + "px", bottom : detailsTB + "px" }, fadeTime,
			function()
			{
				detailsPanel.animate( { left : detailsLR + "px" }, fadeTime,
					function()
					{
						if ( tasks.length > 0 )
							tasks[0].select();
					}
				);
			}
		);
}

function populateDetails( marker )
{
	detailsHeaderTitle.innerHTML = marker.name;
	detailsDescriptionContentText.innerText = "";
	detailsDescriptionContentTextEdit.innerText = "";
	
	for ( var i = 0; i < detailsTasksAmount; i++ )
	{
		if ( i < marker.tasks.length )
		{
			tasks[i].clear();
			tasks[i].setName( marker.tasks[i].name );
			tasks[i].setProgress( marker.tasks[i].progress );
			tasks[i].description = marker.tasks[i].description;
			tasks[i].images = marker.tasks[i].images;
			
			$(tasks[i].element).show();
		}
		else if ( !adminMode )
			$(tasks[i].element).hide();
		else
			tasks[i].clear();
	}
}

function hideDetails( event )
{
	if ( event.target.id != "detailsWrapper" && event.target.id != "detailsHeaderClose" )
		return;
	
	if ( adminMode )
	{
		detailsWrapper.hide();
		detailsAdmin.style.display = "none";
		return;
	}
	
	detailsPanel.animate( { left : ( window.innerWidth / 2 - 3 ) + "px" }, fadeTime,
		function()
		{
			detailsDescriptionContentText.innerText = "";
			detailsDescriptionContentTextEdit.value = "";
			
			$(detailsDescriptionContentImages).children( ".detailsImage" ).hide();
			
			detailsPanel.animate( { top : ( window.innerHeight / 2 - detailsHeightStart / 2 ) + "px",
						bottom : ( window.innerHeight / 2 - detailsHeightStart / 2 ) + "px" },fadeTime,
				function()
				{
					detailsWrapper.hide();
					
					for ( var i in tasks )
						if ( tasks[i] != null )
							tasks[i].clear();
					detailsMarker = null;
				}
			);
		}
	);
}

function findClickedTask( posX, posY )
{
	for ( var i in tasks )
	{
		var task = tasks[i];
		if ( coordsInside( $(task.element), posX, posY ) )
		{
			console.log( "Found click in " + task );
			return task;
		}
	}
	
	return null;
}

function clickedTaskWrapper( event )
{
	if ( detailsMarker == null )
		return;
	
	console.log( "Trying to find clicked task at " + event.pageX + "," + event.pageY );
	
	//for ( var i in tasks )
	//	$(tasks[i].element).removeClass( "selected" );
		
	var task = findClickedTask( event.pageX, event.pageY );
	
	if ( task != null )
		task.select();
}

function clickedTaskTitle( event )
{
	if ( !adminMode )
		return clickedTaskWrapper( event );
	
	var task = findClickedTask( event.pageX, event.pageY );
	
	if ( task == null )
		return;
	
	// Now we switch the title to an edit field
	$(task.element).find( ".taskTitle" ).hide();
	var input = $(task.element).find( ".taskTitleInput" );
	input.show();
	input.focus();
	input.select();
	input.keyup( function( event ) { taskTitleInputChange( event ) } );
	input.blur( function( event ) { taskTitleInputBlur( event ) } );
}

function clickedTaskMeter( event )
{
	if ( !adminMode || detailsMarker == null )
		return clickedTaskWrapper( event );
	
	console.log( "Clicked a task meter at " + event.pageX + "," + event.pageY );
	
	// Find which task we clicked in
	var task = findClickedTask( event.pageX, event.pageY );
	
	if ( task == null )
		return;
	
	// Now find how far in the meter we clicked
	var clickPosition = event.pageX - $(task.meterElement).offset().left;
	console.log( "Clicked at " + clickPosition );
	var percentage = Math.floor( ( clickPosition / detailsMeterWidth ) * 10 ) + 1 ;
	percentage *= 10; // Because fuck floating point numbers
	
	console.log( "Clicked meter at percentage " + percentage );
	
	task.setProgress( percentage );
	
	if ( detailsMarker.tasks.length <= task.index )
		detailsMarker.tasks[task.index] = task.toObject();
	
	detailsMarker.tasks[task.index].progress = percentage;
}

function clickedDetailsImage( event )
{
	// First find our image
	$(detailsDescriptionContentImages).children( ".detailsImage" ).each( function( index, element )
		{
			if ( coordsInside( $(element), event.pageX, event.pageY ) )
			{
				console.log( "I clicked image " + element.id );
				
				var index = 0;
				currentImage = null;
				
				// Pick the right image from our current task
				if ( element.id === "detailsImage2" )
					index = 1;
				else if ( element.id === "detailsImage3" )
					index = 2;
				
				currentImage = currentTask.images[index];
				
				if ( adminMode )
				{
					// Show our image config dialogue
					if ( currentImage == null )
					{
						currentImage = { thumbUrl: "", fullUrl: "" };
						currentTask.images[index] = currentImage;
					}
					
					if ( currentImage )
					{
						detailsImageAdminThumbInput.value = currentImage.thumbUrl;
						detailsImageAdminFullInput.value = currentImage.fullUrl;
						detailsImageAdminPreview.style.backgroundImage = "url( " + currentImage.thumbUrl + " )";
					}
					else
					{						
						detailsImageAdminThumbInput.value = "";
						detailsImageAdminFullInput.value = "";
						detailsImageAdminPreview.style.backgroundImage = "none";
					}
					
					$(detailsImageAdminWrapper).show();
					detailsImageAdminThumbInput.focus();
				}
				else
				{
					// Pop image in new, shiny tab (it smells like fresh laundry)
					if ( currentImage && currentImage.fullUrl && currentImage.fullUrl != null )
						window.open( currentImage.fullUrl, "_blank" );
				}
				
				return;
			}
		}
	);
}

function clickedTaskDelete( event )
{
	if ( !adminMode || currentTask == null || detailsMarker == null )
		return;
	
	console.log( "Clicked delete button for " + currentTask + " (KILL! KILL! KILL!)" );
	// We already have our edit task since this button only appears on selection, delete away!
	
	currentTask.clear();
	
	if ( detailsMarker.tasks.length > currentTask.index )
		detailsMarker.tasks[currentTask.index] = new Array();
}

function taskTitleInputChange( event )
{
	if ( event.which == 13 )
		$(currentTask.element).find( ".taskTitleInput" ).blur();
}

function taskTitleInputBlur( event )
{
	if ( !adminMode || currentTask == null || detailsMarker == null )
		return;
	
	console.log( "Blurring input" );
	var input = $(currentTask.element).find( ".taskTitleInput" );
	
	currentTask.setName( input.val() === "" ? null : input.val() );
	input.hide();
	$(currentTask.element).find( ".taskTitle" ).show();
	
	if ( detailsMarker.tasks.length <= currentTask.index )
		detailsMarker.tasks[currentTask.index] = currentTask.toObject();
	
	detailsMarker.tasks[currentTask.index].name = currentTask.name;
}

function taskDescriptionBlur()
{
	if ( !adminMode || currentTask == null || detailsMarker == null )
		return;
	
	currentTask.description = detailsDescriptionContentTextEdit.value;
	
	if ( detailsMarker.tasks.length <= currentTask.index )
		detailsMarker.tasks[currentTask.index] = currentTask.toObject();
	
	detailsMarker.tasks[currentTask.index].description = currentTask.description;
}

function taskImageUrlChanged()
{
	if ( !adminMode )
		return;
	
	var thumbUrl = detailsImageAdminThumbInput.value;
	var fullUrl = detailsImageAdminFullInput.value;
	
	if ( thumbUrl && thumbUrl != undefined && thumbUrl.length > 0 )
	{
		currentImage.thumbUrl = thumbUrl;
		detailsImageAdminPreview.style.backgroundImage = "url( " + thumbUrl + " )";
	}
	
	if ( fullUrl && fullUrl != undefined && fullUrl.length > 0 )
		currentImage.fullUrl = fullUrl;
	
	detailsMarker.tasks[currentTask.index].images = currentTask.images;
}

function closeTaskImageAdmin()
{
	$(detailsImageAdminWrapper).hide();
	
	currentTask.select();
}