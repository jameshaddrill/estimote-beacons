var beaconInfo = {
	'0d5a0593-32f5-6250-5f29-9eb6fd087bc3' : '#pane-6',
	'32f2ebe7-f3f2-b8f9-0a88-cb5966b8c97e' : '#pane-4',
	'b9407f30-f5f8-466e-aff9-25556b57fe6d' : '#pane-5'
};

var activeBeacon;

var dontCheck;


var app = (function()
{



	// Application object.
	var app = {};

	// Dictionary of beacons.
	var beacons = {};

	// Timer that displays list of beacons.
	var updateTimer = null;

	app.initialize = function()
	{
		document.addEventListener(
			'deviceready',
			function() { evothings.scriptsLoaded(onDeviceReady) },
			false);
	};
 
	function onDeviceReady()
	{
		startApp();

		// Start tracking beacons!
		startScan();

		// Display refresh timer.
		updateTimer = setInterval(displayClosestBeacon, 2000);

	}
 
	function startApp()
	{
		$('[data-toggle="offcanvas"]').click(function () {
	    $('.row-offcanvas').toggleClass('active');
	  });

	  //navigate between screens
	  	$('.close').click( function() { 

	  		//alert(activeBeacon.proximityUUID);
	  		dontCheck = activeBeacon.proximityUUID;
	  	}); 

	   	$('.js-nav-link').click(function () {
	    	var id =$(this).attr('href');
	    	activatePage(id, $(this));
	  	});

	  	
	}

	function activatePage(id, el) {
		var selector = 'a[href*="'+id+'"]';
		//$('#' + id).attr('data-update-timeline');

    	$('.js-nav-link').removeClass('active');
    	$(selector).addClass('active');
    	$(this).addClass('active');

    	$('.pane').removeClass('active');
    	$(id).addClass('active');
    	$('.row-offcanvas').removeClass('active');

    	if (el.attr('data-update-timeline') !== undefined ) {
			var progress = el.attr('data-update-timeline');
			$(progress).addClass('active');
    	} else {
    	}
	}

	function startScan() 
	{
		function onBeaconsRanged(beaconInfo)
		{
			//console.log('onBeaconsRanged: ' + JSON.stringify(beaconInfo))
			for (var i in beaconInfo.beacons)
			{
				// Insert beacon into table of found beacons.
				// Filter out beacons with invalid RSSI values.
				var beacon = beaconInfo.beacons[i];
				if (beacon.rssi < 0)
				{
					beacon.timeStamp = Date.now();
					var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
					beacons[key] = beacon;
				}
			}
		}

		function onError(errorMessage)
		{
			console.log('Ranging beacons did fail: ' + errorMessage);
		}

		// Request permission from user to access location info.
		// This is needed on iOS 8.
		estimote.beacons.requestAlwaysAuthorization();

		// Start ranging beacons.
		estimote.beacons.startRangingBeaconsInRegion(
			{}, // Empty region matches all beacons
			    // with the Estimote factory set UUID.
			onBeaconsRanged,
			onError);
	}

	function displayBeaconList()
	{
		// Clear beacon list.
		$('#found-beacons').empty();

		var timeNow = Date.now();

		// Update beacon list.
		$.each(beacons, function(key, beacon)
		{
			// Only show beacons that are updated during the last 60 seconds.
			if (beacon.timeStamp + 60000 > timeNow)
			{
				// Create tag to display beacon data.
				var element = $(
					'<li>'
					+	'Major: ' + beacon.major + '<br />'
					+	'Minor: ' + beacon.minor + '<br />'
					+	proximityHTML(beacon)
					+	distanceHTML(beacon)
					+	rssiHTML(beacon)
					+ '</li>'
				);

				$('#found-beacons').append(element);
			}
		});
	}

	function displayClosestBeacon()
	{
		// Clear beacon list.
		//$('#closest-beacon').empty();
		$('#closest-beacon').html('');
		var closestBeacon = '';	
		var timeNow = Date.now();
		beaconObj = {};

		// Update beacon list.
		$.each(beacons, function(key, beacon)
		{
			// Only show beacons that are updated during the last 60 seconds.
			if (beacon.timeStamp + 60000 > timeNow)
			{
				// Create tag to display beacon data.
				var element = $(
					'<li>'
					+   'Name: ' + beaconInfo[beacon.proximityUUID] + '<br />'
					+   'Distance: '  + distanceHTML(beacon)
					// +	'Major: ' + beacon.major + '<br />'
					// +	'Minor: ' + beacon.minor + '<br />'
					// +	proximityHTML(beacon)
					// +	distanceHTML(beacon)
					// +	rssiHTML(beacon)
					+ '</li>'
				);

			$('#closest-beacon').append(element);
			}
			// Only show beacons that are updated during the last 60 seconds.
			if (beacon.timeStamp + 60000 > timeNow) {

				var beaconProximity = distanceHTML(beacon);
				//alert(distanceHTML(beacon));

				if ((beaconProximity < closestBeacon || closestBeacon === '') && beaconProximity < 10)  { 
					closestBeacon = beaconProximity;
					beaconObj = beacon;
				}
			}
		});

		closestBeaconFunc(beaconObj);

	}

	function closestBeaconFunc(beacon) {
		activeBeacon = beacon;
		//alert(beacon.proximityUUID);
		var uuid = beacon.proximityUUID;
		
		$('#closest-beacon').append('<p>name = ' + beaconInfo[uuid] + '</p>');//<div><p>Closest beacon is ' + distanceHTML(beacon) + 'm away and UUID is ' + beaconInfo[uuid].name + '</p></div>');
		

		if(uuid !== undefined  && uuid !== dontCheck){
			//alert(beaconInfo[uuid])
			activatePage(beaconInfo[uuid]);
		} 
	}

	function proximityHTML(beacon) 
	{
		var proximity = beacon.proximity;
		if (!proximity) { return ''; }

		var proximityNames = [
			'Unknown',
			'Immediate',
			'Near',
			'Far'];

		return 'Proximity: ' + proximityNames[proximity] + '<br />';
	}

	function distanceHTML(beacon)
	{
		var meters = beacon.distance;
		// if (!meters) { return ''; }

		// var distance = meters;
		var distance = ((beacon.distance) * 10);
		distance = distance.toFixed(2);

		return distance;
	}

	function rssiHTML(beacon)
	{
		var beaconColors = [
			'rgb(214,212,34)', // unknown
			'rgb(215,228,177)', // mint
			'rgb(165,213,209)', // ice
			'rgb(45,39,86)', // blueberry
			'rgb(200,200,200)', // white
			'rgb(200,200,200)', // transparent
		];

		// Get color value.
		var color = beacon.color || 0;
		// Eliminate bad values (just in case).
		color = Math.max(0, color);
		color = Math.min(5, color);
		var rgb = beaconColors[color];

		// Map the RSSI value to a width in percent for the indicator.
		var rssiWidth = 1; // Used when RSSI is zero or greater.
		if (beacon.rssi < -100) { rssiWidth = 100; }
		else if (beacon.rssi < 0) { rssiWidth = 100 + beacon.rssi; }
		// Scale values since they tend to be a bit low.
		rssiWidth *= 1.5;

		var html =
			'RSSI: ' + beacon.rssi + '<br />'
			+ '<div style="background:' + rgb + ';height:20px;width:'
			+ 		rssiWidth + '%;"></div>'

		return html;
	}

	return app;
})();

app.initialize();
