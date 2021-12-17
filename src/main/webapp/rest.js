var jwtToken = null;
var irentServiceUrl = 'http://localhost:8081';

class UserService {	
  user;

  constructor() {
  }	
	
  loadCurrentUser(successMethod) {
	if(jwtToken) {
		callRestService('/users/current', currentUser => {
			this.user = currentUser;
			successMethod.call();
		});
	} else {
		this.getJwt(jwt => {
			jwtToken = jwt;
			callRestService('/users/current', currentUser => {
				this.user = currentUser;
				successMethod.call();
			});
		})
	};
  }
  
  getJwt(successMethod) {
    $.ajax({
		url: '/irent-ui/jwt', // вызов сервлета
		success: successMethod,
		error: showErrorToast
	});
  }
}

class ParkingsService {
  constructor() {
  }	
	
  getParkings(successMethod) {
    callRestService('/parking', successMethod);
  }

  createParking(parking, successMethod) {
    callRestService('/parking', successMethod, 'POST', parking);
  }

  deleteParking(id, successMethod) {
    callRestService(`/parking/${id}`, successMethod, 'DELETE');
  }
}

class VehiclesService {
  constructor() {
  }
	
  getVehicles(successMethod) {
    callRestService('/transport', successMethod);
  }

  createVehicle(vehicle, successMethod) {
    callRestService('/transport', successMethod, 'POST', vehicle);
  }
} 

class TripsService {
  constructor() {
  }
	
  getTrips(successMethod) {
    callRestService('/trip', successMethod);
  }
}

function callRestService(restUrl, successMethod, method = 'GET', data = null) {
	$.ajax({
		url: `${irentServiceUrl}${restUrl}`,
		method: method,
		data: JSON.stringify(data),
		headers: {
			"Authorization": `Bearer ${jwtToken}`,
			"Content-Type": 'application/json'
		},
		success: successMethod,
		error: showErrorToast
	});
}

function showErrorToast(error) {
	var errorBody = error.responseJSON;	
	var errorMessage = errorBody.message ? errorBody.message : 'Внутренняя ошибка сервиса';
	
	$('#toast .toast-body').html(errorMessage);
	$('#toast').toast('show');
}
