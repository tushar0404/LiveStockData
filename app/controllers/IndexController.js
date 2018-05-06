MyApp.controller('IndexController', mainFunction);

function mainFunction($scope){

	// Setting status on initialization
	$scope.status  = "Connecting to server .....";
	// For storing live data
	$scope.livedata = new Object();
	// To maintain last updated records to manage update section
	$scope.lastUpdatedRecords = new Object();
	
	// Creating socket connection 
	var ws = new WebSocket("ws://stocks.mnet.website");
	ws.onopen = function(){  
		
		$scope.status = "Connected to  ws://stocks.mnet.website. Receiving data .....";
        console.log("Socket has been opened!");  
    
    };
    ws.onmessage = function(message) {

    	console.log("We are receiving data ......");  
    	var data = JSON.parse(message.data);
    	
    	// Using previous records so that there will be no duplicate values
    	var dataPrevious = $scope.livedata;
    	
    	// Just to check if key (ticket) is present in last updation or not 
    	var lastUpdatedRecords = $scope.lastUpdatedRecords;
    	var lastKeysUpdated = new Object();
		var keys =  Object.keys(lastUpdatedRecords);
		var currDateTime = new Date();

		for (var ticket in dataPrevious){

			// If ticket was not in last update then we will update last update section for this ticket according to how long it has been updated before.
			if(keys.indexOf(ticket) < 0 ){
				
				var updatedOn = dataPrevious[ticket].updatedOn;
				
				var diffMs = currDateTime - updatedOn;

				var diffDays = moment(currDateTime).diff(moment(updatedOn), 'days');
				var diffHrs = moment(currDateTime).diff(moment(updatedOn), 'hours');
				var diffMins = moment(currDateTime).diff(moment(updatedOn), 'minutes');
				var diffSec = moment(currDateTime).diff(moment(updatedOn), 'seconds');

				if(diffDays >= 1){
					dataPrevious[ticket].lastUpdates = moment(updatedOn).format("Do MMM  h:mm A");
				}else if(diffHrs >= 1){
					dataPrevious[ticket].lastUpdates = moment(updatedOn).format('LT');;
				}else if (diffMins>=1){
					dataPrevious[ticket].lastUpdates = moment(updatedOn).startOf('hour')+" Minutes Ago"; 
				}else{
					dataPrevious[ticket].lastUpdates = diffSec+" Seconds Ago"; 
				}
			}
		}

    	for(i=0;i<data.length;i++){
    		
    		lastKeysUpdated[data[i][0]] = {};

    		if(typeof dataPrevious[data[i][0]] == 'undefined'){
    			
    			// If this is first ticket in our record
    			var newData = {price:data[i][1], class:"",lastUpdates:"A Few Seconds Ago",updatedOn: currDateTime};
    			dataPrevious[data[i][0]] =  newData;
    		
    		}else if(dataPrevious[data[i][0]].price < data[i][1]){
    		
    			// Price is greater then previous  then change color to green
    			dataPrevious[data[i][0]].price = data[i][1];
    			dataPrevious[data[i][0]].class = 'btn-success';
    		
    		}else{
    		
    			// Price is less then previous  then change color to red
    			dataPrevious[data[i][0]].price = data[i][1];
    			dataPrevious[data[i][0]].class = 'btn-danger';
    		}

    		// Default set for all new updated
    		dataPrevious[data[i][0]].lastUpdates = 'A Few Seconds Ago';
    		dataPrevious[data[i][0]].updatedOn = currDateTime;

    		dataPrevious[data[i][0]].price = parseFloat(Math.round(dataPrevious[data[i][0]].price * 100) / 100).toFixed(2);
    
    	}
		
		// Final assignment     	
    	$scope.$apply(function () {
	        $scope.livedata = dataPrevious;
	        $scope.lastUpdatedRecords = lastKeysUpdated;
	        console.log($scope.livedata);
	    });
		
    };

}