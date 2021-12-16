var pages = [];
var activePage;
var map;

var activeParking, activeVehicle;

var parkingsService = new ParkingsService();
var vehiclesService = new VehiclesService();
var tripsService = new TripsService();
var userService = new UserService();

var parkingBalloonContentLayout;

$(document).ready(function() {
	pages = [$("div#map-container"), $("div#trips-container")];
	pages.forEach(page => page.hide());
	
	userService.loadCurrentUser(currentUser => {
		$("span#user-login").html(userService.user.login);
		if(userService.user.balance) {
			$("span#user-balance").html(`${userService.user.balance}р.`);
		}
		
		initLayout();
	});
});

function isAdmin() {
	return userService.user.role == 'ADMIN';
}

function initLayout() {
	activePage = pages[0];
	activePage.show();
	
    initPage('#map-container');

	$("ul.navbar-nav a").click(function(target) {	
		let container = $("div" + target.currentTarget.hash);
		if(!container.is(activePage)) {
			container.show();
			activePage.hide();
			activePage = container;
			initPage(target.currentTarget.hash);
			$('ul.navbar-nav a').removeClass('active');
			$(this).addClass('active');
		}
	});
}

function initPage(pageName) {
	if(pageName == "#map-container") {
		initMapPage();
	} else if(pageName == "#trips-container") {
		initTripsPage();
	}	
}

function initVehicleCreation() {
	parkingsService.getParkings(parkings => {
		$("#vehicle-parking").empty();
		parkings.forEach(parking => {
			$("#vehicle-parking").append(`<option value="${parking.id}">${parking.name}</option>`); 
		});		
	});

	$("#vehicle-form").show();
	$("#toolbar").hide();
	activeVehicle = new ymaps.Placemark(
        map.getCenter(), {
			
		}, {
			preset: 'islands#governmentCircleIcon',
			iconColor: 'green',
			draggable: true,
		});

	map.geoObjects.add(activeVehicle);	
}

function completeVehicleCreation() {
	vehiclesService.createVehicle({
		type: $("#vehicle-type").val(),
		parking: {
			id: $("#vehicle-parking").val()
		},
		geoPosition: {
			latitude: activeVehicle.geometry.getCoordinates()[0],
			longitude: activeVehicle.geometry.getCoordinates()[1]
		}	
	}, () => {
		complateFormAction();
		loadMapObjects();		
	});
}

function initParkingCreation() {
	$("#parking-form").show();
	$("#toolbar").hide();
	activeParking = new ymaps.Circle([map.getCenter(), 200],
	{ hintContent: 'Новая парковка' }, {
		draggable: true,
		fillColor: "#3DED9777",
		strokeColor: "#028A0F",
		strokeOpacity: 0.8,
		strokeWidth: 5
	});

	map.geoObjects.add(activeParking);

	$("#parking-name").val('Новая парковка');
	$("#parking-radius").val(200);
	$("#parking-radius").bind("change paste keyup", function() {
		activeParking.geometry.setRadius($(this).val());
	});	
}

function completeParkingCreation() {
	parkingsService.createParking({
		name: $("#parking-name").val(),
		type: "ALL",
		status: "ACTIVE",
		area: {
			center: {
				latitude: activeParking.geometry.getCoordinates()[0],
				longitude: activeParking.geometry.getCoordinates()[1]
			},
			radiusInMeters: $("#parking-radius").val()
		}
	}, () => {
		complateFormAction();
		loadMapObjects();		
	});
}

/*function removeParking(parkingMapObject) {
	parkingsService.deleteParking(parkingMapObject.getData().properties.get('objectId'), loadMapObjects);
}*/

function complateFormAction() {
	if(activeParking != null) {
		map.geoObjects.remove(activeParking);
		$("#toolbar").show();
		$("#parking-form").hide();
		activeParking = null;
	}

	if(activeVehicle != null) {
		map.geoObjects.remove(activeVehicle);
		$("#toolbar").show();
		$("#vehicle-form").hide();
		activeVehicle = null;
	}
}

function initMapPage() {
	if(isAdmin()) {
		$("#parking-form").hide();
		$("#vehicle-form").hide();
		$("#init-create-parking").click(initParkingCreation);
		$("#init-create-vehicle").click(initVehicleCreation);
		$("#create-parking").click(completeParkingCreation);
		$("#create-vehicle").click(completeVehicleCreation);
		$("button.cancel").click(complateFormAction);
	} else {
		$("#common-toolbar").hide();
		$("#parking-form").hide();
		$("#vehicle-form").hide();
	}

	ymaps.ready(() => {
		map = new ymaps.Map('map', {
			center: [56.851574, 35.883856],
			zoom: 13,
			controls: ['zoomControl', 'searchControl']
		}, {
			searchControlProvider: 'yandex#search',
			/*restrictMapArea: [
				[56.84,35.7],
				[56.86,36.0]
			]*/
		});

		loadMapObjects();	
	});	
}

function loadMapObjects() {
	map.geoObjects.removeAll();
	vehiclesService.getVehicles(function(vehicles) {
		vehicles.forEach(vehicle => addVehicleToMap(vehicle));
	});
	parkingsService.getParkings(parkings => {
		parkings.forEach(parking => addParkingToMap(parking));
	});
}

function initTripsPage() {
	var tableBody = $('div#trips-container table tbody');
	var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

	tripsService.getTrips(function(trips) {
		tableBody.empty();
		trips.forEach(item => {
			var statusText, badgeClass;
			if(item.status == 'FINISHED') {
				statusText = 'ЗАВЕРШЕНА';
				badgeClass = 'alert-success';
			} else {
				badgeClass = 'alert-primary';
				statusText = 'В ПРОЦЕССЕ';
			} 

			tableBody.append(
				'<tr>' + 
					`<td>${item.id}</td>` + 
					`<td>${item.user.login}</td>` + 
					`<td>${item.vehicle.regNumber}</td>` + 
					`<td><span class="badge ${badgeClass}">${statusText}</span></td>` + 
					`<td>${item.startDateTime} ${item.finishDateTime ? ' - ' + item.finishDateTime : ''}</td>` + 
					`<td>${item.startParking.name} -> ` + (item.finishParking ? `${item.finishParking.name}</td>` : '</td>') + 
					`<td>${item.totalPrice}</td>` + 
					
				'</tr>');
		});
	});	
}

function addParkingToMap(parking) {
	var parkingArea = new ymaps.Circle([
        [parking.area.center.latitude, parking.area.center.longitude],
        parking.area.radiusInMeters
    ], {
        hintContent: parking.name,
		objectId: parking.id,
    }, {
        draggable: false,
        fillColor: "#DB709377",
        strokeColor: "#990066",
        strokeOpacity: 0.8,
        strokeWidth: 3,
		objectId: parking.id
    });

	map.geoObjects.add(parkingArea);
	parkingArea.events.add('click', function (e) {
		var coords = e.get('coords');
        map.balloon.open(coords, {
			contentHeader: parking.name,		
		});
    });
}

function addVehicleToMap(vehicle) {
	var color, statusName;
	if(vehicle.status == 'FREE') {
		color = 'green';
		statusName = 'Свободен';
	} else {
		color = 'blue';
		statusName = 'Арендован';
	}
	var content;
	var typeName = vehicle.type == 'BICYCLE' ? 'Велосипед' : 'Электросамокат'; 
	
	content = 	`<strong>${typeName} ${vehicle.regNumber}</strong><br>` +
				`Статус: ${statusName}<br>` + 
				`Парковка: ${vehicle.parking.name}<br>`;

	if(vehicle.type == 'ELECTRIC_SCOOTER') {
		content += `Макс. скорость: ${vehicle.maxKmPerHourSpeed} км/ч<br>`;
		content += `Заряд: ${vehicle.chargePercent}%<br>`
	}

	var vehiclePlacemark = new ymaps.Placemark(
        [vehicle.geoPosition.latitude, vehicle.geoPosition.longitude], {
			balloonContent: content
		}, {
			preset: 'islands#governmentCircleIcon',
			iconColor: color
		});
        
	map.geoObjects.add(vehiclePlacemark);
}
      
