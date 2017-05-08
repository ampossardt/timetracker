function domReady() {
	var tabs = document.getElementsByClassName('tab');
	var content = document.getElementsByClassName('content');

	for(let i=0; i < tabs.length; i++) {
		tabs[i].addEventListener('click', function() {
			if(hasClass(this, 'active')) return;
			let id = this.attributes["data-content"].value;

			for(let j=0; j < tabs.length; j++) {
				removeClass(tabs[j], 'active');
				removeClass(content[j], 'active');
			}
			addClass(this, 'active');
			addClass(document.getElementById(id), 'active');
		});
	}
}

if ( document.addEventListener ) {
	document.addEventListener( "DOMContentLoaded", function(){
		document.removeEventListener( "DOMContentLoaded", arguments.callee, false);
		domReady();
	}, false );
}
var requestOptions = {
	method: '',
	url: '',
};

function makeRequest(method, url, callback) {
	let request = new XMLHttpRequest();
	request.setRequestHeader("Authorization", getAuthenticationToken());
	request.open(method, url);
	request.onload = function() {
		if(this.status >= 200 && this.status < 300) {

		}
	}
}

function getAuthenticationToken() {
	let key = "5d2497ff82e41340ff6e20c4222ea428";
	return "Basic " + btoa(apiKey + ":api_token");
}

function getAuthenticationToken(key) {
	return "Basic " + btoa(key + ":api_token");
}

var app = {
	makeRequest : function(method, url, processCallback) {
		let request = new XMLHttpRequest();
		request.setRequestHeader("Authorization", getAuthenticationToken());
		request.open(method, url);
		request.onload = function() {
			if(this.status >= 200 && this.status < 300) {
				processCallback(request.response);
			}
		}
	},

}

curl -v -u 1971800d4d82861d8f2c1651fea4d212:5d2497ff82e41340ff6e20c4222ea428 \
	-X GET https://www.toggl.com/api/v8/clients
//
// function domReady() {
// 	chrome.storage.local.get('apiKey', function(result) {
// 		if(result.apiKey !== undefined) {
// 			var apiKey = result.apiKey;
// 			window.apiKey = result.apiKey;
//
// 			document.getElementById('existingKey').innerHTML = apiKey;
// 			document.getElementById('setApiKey').style = "display: none;";
// 			document.getElementById('existingKeyContainer').style = "display: block;";
// 		}
//
// 	});
//
// 	chrome.storage.local.get('cachedMarkup', function(result) {
// 		if(result.cachedMarkup !== undefined) {
// 			var cachedMarkup = result.cachedMarkup;
//
// 			document.getElementById('startDate').value = cachedMarkup.start;
// 			document.getElementById('endDate').value = cachedMarkup.end;
// 			document.getElementById('entryData').innerHTML = cachedMarkup.markup;
// 		}
//
// 		document.getElementById('entryData').addEventListener('click', function(event) {
// 			if(event.target.className !== "updateTask") {
// 				return;
// 			}
//
// 			event.preventDefault();
// 			var id = event.target.dataset.projectId;
//
// 			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
// 				chrome.tabs.sendMessage(tabs[0].id, { "projectId" : id }, function(response) {
// 				});
// 			});
// 		}, false);
// 	});
//
// 	document.getElementById('changeKey').onclick = function(event) {
// 		event.preventDefault();
// 		document.getElementById('setApiKey').style = "display: block;";
// 	}
//
// 	document.getElementById('testApi').onclick = function() {
// 		var message = document.getElementById('apiTestMessage');
// 		message.style = "";
// 		message.innerHTML = "";
//
// 		var spinner = document.getElementById('spinner');
// 		spinner.style = "display: inline-block";
//
// 		var requestUrl = "https://www.toggl.com/api/v8/me";
// 		var apiKey = document.getElementById('apiKey').value;
// 		var request = new XMLHttpRequest();
//
// 		request.onreadystatechange = function() {
// 			if(request.readyState === XMLHttpRequest.DONE) {
// 				if(request.status === 200) {
// 					message.innerHTML = "Success! Everything seems to be in order.";
// 					message.style = "display: block; color:green;";
// 					saveApiKey(apiKey);
// 				} else if(request.status === 403) {
// 					message.innerHTML = "Oops, this doesn't appear to be a valid key. Please try again.";
// 					message.style = "display: block; color:red;";
// 				}
//
// 				spinner.style = "";
// 			}
// 		};
//
// 		request.open('GET', requestUrl, true);
// 		request.setRequestHeader("Authorization", "Basic " + btoa(apiKey + ":api_token"));
// 		request.send(null);
// 	};
//
// 	document.getElementById('getTasks').onclick = function(event) {
// 		event.preventDefault();
// 		var startInput = document.getElementById('startDate');
// 		var endInput = document.getElementById('endDate');
// 		var errorMessage = document.getElementById('taskError');
//
// 		if(startInput.value === "" || endInput.value === "") {
// 			setErrorMessage(errorMessage, "Dates can't be blank.", "color: red;");
// 			return;
// 		}
//
// 		var startDate = new Date(startInput.value);
// 		var endDate = new Date(endInput.value);
//
// 		if(startDate >= endDate) {
// 			setErrorMessage(errorMessage, "Start date needs to be less than end date.", "color: red;");
// 			return;
// 		}
//
// 		getTogglData(startDate.toISOString(), endDate.toISOString());
//
// 		chrome.storage.local.get("timeItems", function(result) {
// 			var items = result.timeItems;
//
// 			if(items === undefined) {
// 				setErrorMessage(errorMessage, "Sorry, there was an issue getting your tasks. Please try again.", "color: red;");
// 				return;
// 			}
//
// 			var dataText = "";
// 			var itemsForContentScript = [];
//
// 			for(var i = 0; i < items.length; i++) {
// 				dataText += formatDataToMarkup(items[i]);
// 				itemsForContentScript.push(getDataForContentScript(items[i]));
// 			}
//
// 			var cachedMarkup = {};
// 			cachedMarkup.markup = dataText;
// 			cachedMarkup.start = startInput.value;
// 			cachedMarkup.end = endInput.value;
//
// 			chrome.storage.local.set({ "contentScriptItems" : itemsForContentScript });
// 			chrome.storage.local.set({ "cachedMarkup" : cachedMarkup });
//
// 			document.getElementById('entryData').innerHTML = dataText;
// 		});
// 	}
// }
//
// function saveApiKey(key) {
// 	chrome.storage.local.set({'apiKey' : key }, function(){ console.log("API key saved."); });
// }
//
// function getTogglData(startdate, enddate) {
// 	var requestUrl = "https://www.toggl.com/api/v8/time_entries?start_date=" + encodeURIComponent(startdate) + "&end_date=" + encodeURIComponent(enddate);
// 	var token = window.apiKey + ":api_token";
// 	var request = new XMLHttpRequest();
//
// 	request.onreadystatechange = function() {
// 		if(request.readyState === XMLHttpRequest.DONE) {
// 			if(request.status === 200) {
// 				var json = JSON.parse(request.responseText);
// 				processData(json);
// 			}
// 		}
// 	};
//
// 	request.open('GET', requestUrl, false);
// 	request.setRequestHeader("Authorization", "Basic " + btoa(token));
// 	request.send(null);
// }
//
// function processData(json) {
// 	var item = {};
// 	var items = [];
// 	var projects = [];
//
// 	for(var i=0; i<json.length; i++) {
// 		projects.push(json[i].pid);
// 	}
//
// 	var uniqueProjects = getUniqueValues(projects);
//
// 	for(var i=0; i<uniqueProjects.length; i++) {
// 		item = {};
// 		item.projectid = uniqueProjects[i];
// 		item.entries = getTasksByProjectId(json, uniqueProjects[i]);
// 		items.push(item);
// 	}
//
// 	items = getAdditionalData(items).sort(function(a,b){
// 		var first = a.clientname.toLowerCase();
// 		var second = b.clientname.toLowerCase();
// 		return (first < second) ? -1 : (first > second) ? 1 : 0;
// 	});
//
// 	chrome.storage.local.set({ "timeItems" : items });
// }
//
// // fuck this API. you have to get the client name and project name separately because they only
// // give you the IDs for a time entry, but then they throttle your requests to one per second.
// // additionally, you can get all of the clients for a person, but you can't get all of their projects.
// // what the actual fuck
// function getAdditionalData(items) {
// 	var token = window.apiKey + ":api_token";
// 	var request = new XMLHttpRequest();
// 	var requestUrl = "https://www.toggl.com/api/v8/projects/";
//
// 	request.onreadystatechange = function() {
// 		if(request.readystate === XMLHttpRequest.done) {
// 			if(request.status === 200) {
// 				var json = JSON.parse(request.responseText);
// 				items[i].projectname = json.data.name;
// 				items[i].clientid = json.data.cid;
// 			}
// 		}
// 	};
//
// 	for(var i = 0; i < items.length; i++) {
// 		request.open('get', requestUrl + items[i].projectid, false);
// 		request.setRequestHeader("authorization", "basic " + btoa(token));
// 		request.send(null);
// 	}
//
// 	requestUrl = "https://www.toggl.com/api/v8/clients";
//
// 	var allClients = [];
//
// 	request.onreadystatechange = function() {
// 		if(request.readystate === XMLHttpRequest.done) {
// 			if(request.status === 200) {
// 				allClients = JSON.parse(request.responseText);
// 			}
// 		}
// 	};
// 	request.open('get', requestUrl, false);
// 	request.setRequestHeader("authorization", "basic " + btoa(token));
// 	request.send(null);
//
// 	for(var i = 0; i< items.length; i++) {
// 		items[i].clientname = getClientNameById(allClients, items[i].clientid);
// 	}
//
// 	items = getTotalTime(items);
//
// 	return items;
// }
//
// function sumItems(items) {
// 	var total = 0;
// 	for(var i = 0; i<items.length; i++) {
// 		total += items[i].duration;
// 	}
// 	return total;
// }
//
// function getUniqueValues(array) {
// 	return array.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
// }
//
// function getTasksByProjectId(array, id) {
// 	return array.filter(function(item, i, ar){
// 		return item.pid === id;
// 	});
// }
//
// function getClientNameById(array, id) {
// 	return array.filter(function(item, i, ar) {
// 		return item.id == id;
// 	})[0].name;
// }
//
// /* Converting API duration to intranet-friendly version */
//
// function getTotalTime(items) {
// 	for(var i = 0; i < items.length; i++) {
// 		totalTime = sumItems(items[i].entries);
// 		items[i].formattedTime = getIntranetFriendlyTimeEntryDuration(totalTime);
// 	}
//
// 	return items;
// }
//
// function getIntranetFriendlyTimeEntryDuration(duration) {
// 	var hours = duration / 3600;
// 	return roundHours(hours);
// }
//
// function roundHours(hours) {
// 	var hourPortion = Math.floor(hours);
// 	var decimalPortion = hours - hourPortion;
// 	var tolerance = .115;
//
// 	if(decimalPortion >= 1) {
// 		// dont give us bullshit
// 		return hours;
// 	}
//
// 	if (decimalPortion > 0.0 && decimalPortion <= .25) {
// 		decimalPortion = decimalPortion <= tolerance ? 0.0 : .25;
// 	} else if (decimalPortion > .25 && decimalPortion <= .5) {
// 		decimalPortion = decimalPortion <= (tolerance + .25) ? .25 : .5;
// 	} else if (decimalPortion > .5 && decimalPortion <= .75) {
// 		decimalPortion = decimalPortion <= (tolerance + .5) ? .5 : .75;
// 	} else if (decimalPortion > .75) {
// 		decimalPortion = decimalPortion <= (tolerance + .75) ? .75 : 1;
// 	}
//
// 	var finalTime = hourPortion + decimalPortion;
//
// 	return finalTime;
// }
//
// function setErrorMessage(elem, message, style) {
// 	elem.style = "display: none;";
// 	elem.innerHTML = message;
// 	elem.style = "display: block; " + style;
// }
//
// function formatDataToMarkup(item) {
// 	var markup = "";
//
// 	markup += "<h3>" + item.clientname + " - " + item.projectname + "</h3>";
// 	markup += "<table>";
//
// 	for(var i = 0; i < item.entries.length; i++) {
// 		markup += "<tr><td>" + item.entries[i].description + "</td>";
// 		markup += "<td>" + item.entries[i].duration + "s</td></tr>";
// 	}
//
// 	markup += "<tr><td>Total</td><td>" + item.formattedTime + "</td>"
// 		+ "<td><a href='#' data-project-id='" + item.projectid + "' class='updateTask'>Update task</a>";
// 	markup += "</table>";
//
// 	return markup;
// }
//
// function getDataForContentScript(item) {
// 	var current = {};
// 	var descriptionsText = "";
//
// 	current.projectid = item.projectid;
// 	current.totalTime = item.formattedTime;
//
// 	for(var i = 0; i < item.entries.length; i++) {
// 		if(descriptionsText.indexOf(item.entries[i].description) === -1) {
// 			if(item.entries[i].description !== undefined) {
// 				descriptionsText += item.entries[i].description + "; ";
// 			}
// 		}
// 	}
//
// 	current.descriptions = descriptionsText;
//
// 	return current;
// }
