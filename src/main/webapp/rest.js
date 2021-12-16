var jwtToken = null;
//'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhNjA5OGRmNi01ZDEzLTQzNzctYmU1OS00YzA3NmQ0NzI3ZjYiLCJyb2xlIjoiQURNSU4iLCJsb2dpbiI6ImFkbWluIiwiZXhwIjoxNjM5NTYxMDQ0LCJpYXQiOjE2Mzk1NTc0NDR9.rEZUynjmhHBnVJAW_PxPkKWt8ifaQ2Q4UVkKyk6-axf602VJLGBD2TM7dXe2e7R0sPMBl9wGcrLgWRSe9BGrhg';
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
		url: '/jwt', // вызов сервлета
		success: successMethod,
		error: showErrorToast
	});
  }
}

class ParkingsService {
  constructor() {
  }	
	
  getParkings(successMethod) {
    callRestService('/parking/all', successMethod);
  }

  createParking(parking, successMethod) {
    callRestService('/parkings', successMethod, 'POST', parking);
  }

  deleteParking(id, successMethod) {
    callRestService(`/parkings/${id}`, successMethod, 'DELETE');
  }
}

class VehiclesService {
  constructor() {
  }
	
  getVehicles(successMethod) {
    callRestService('/transport/all', successMethod);
  }

  createVehicle(vehicle, successMethod) {
    callRestService('/vehicles', successMethod, 'POST', vehicle);
  }
} 

class TripsService {
  constructor() {
  }
	
  getTrips(successMethod) {
    callRestService('/trips/all', successMethod, 'POST', {});
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
