var app = {
	init : function() {
		this.initListeners();
		this.authenticate();
		this.loadStoredClientsAndProjects();
	},
	initListeners : function() {
		initManualClientSync();
		initManualProjectSync();
		initManualTimeEntrySync();
		initKeyCheck();
		initSaveSettings();
		initOpenDialog();
		initCloseDialog();
	},
	authenticate : function(textboxKey) {
		if(textboxKey === undefined || textboxKey === null) {
			chrome.storage.local.get("apiKey", function(data) {
				if(data.apiKey !== undefined) {
					app.checkKeyValidity(data.apiKey, false);
				} else {
					show(element('#login'));
				}
			});
		} else {
			this.checkKeyValidity(textboxKey, true);
		}
	},
	checkKeyValidity : function(key, storeValue) {
		this.makeRequest({
			method : 'GET',
			url : 'https://www.toggl.com/api/v8/me',
			success : storeValue ? () => { this.loginSuccess(); this.storeKey(key); } : this.loginSuccess,
			failure : this.loginFailure,
			authToken : this.getAuthenticationToken(key)
		});
	},
	loginSuccess : function() {
		chrome.notifications.create({
			type : "basic", title : "Success!", message : "Successfully verified your API token.", iconUrl : "../icon_128.png"
		}, () => { hide(element('#login')) });
	},
	loginFailure : function() {
		console.log("TODO: update markup to show error");
	},
	storeKey : function(key) {
		chrome.storage.local.set({ "apiKey" : key });
		element("#apiKey").value = "";
	},
	processAndStoreClients : function(response) {
		let clients = JSON.parse(response);
		let clientList = [];

		for(let i=0; i < clients.length; i++) {
			let clientInfo = {
				"id" : clients[i].id,
				"name" : clients[i].name
			};
			clientList.push(clientInfo);
		}

		var clientObject = { timestamp : getTimestamp(), clients : clientList };
		chrome.storage.local.set({ "clientList" : clientObject });
		app.updateClientMarkup(clientObject);
	},
	updateClientMarkup : function(clientList, fromStorage) {
		let body = document.getElementById('clientTableBody');
		body.innerHTML = "";
		element('#clientTimestamp').innerText = new Date(clientList.timestamp).toLocaleString();

		for(var i=0; i < clientList.clients.length; i++) {
			body.appendChild(createTwoColumnRow(clientList.clients[i].id, clientList.clients[i].name));
		}

		removeClass(element('#updateClients'), 'active');
	},
	processAndStoreProjects : function(key) {
		chrome.storage.local.get("clientList", function(data) {
			if(data.clientList === undefined) {
				return;
			}

			let authToken = app.getAuthenticationToken(key);
			let url = "https://www.toggl.com/api/v8/clients/{0}/projects";
			var promises = [];
			let projects = [];

			data.clientList.clients.forEach(function(client) {
				promises.push(app.makeRequestWithPromise('GET', url.replace('{0}', client.id), authToken)
					.then(function(data){
						projects.push(app.processProject(data, client));
				}));
			});

			Promise.all(promises).then(() => {
				var projectList = { timestamp : getTimestamp(), projects : projects };
				app.updateProjectMarkup(projectList, data.clientList.clients);
				chrome.storage.local.set({ "projectList" : projectList });
			});
		});
	},
	processProject : function(response, client) {
		let projects = JSON.parse(response);
		if(projects === null) return {};
		let projectList = [];

		for(let i=0; i < projects.length; i++) {
			let project = {
				"id" : projects[i].id,
				"name" : projects[i].name,
				"color" : projects[i].hex_color,
				"client" : client
			};
			projectList.push(project);
		}
		return { "clientId" : projects[0].cid, "projects" : projectList };
	},
	updateProjectMarkup : function(projectList, clients) {
		let body = element('#projectTableBody');
		body.innerHTML = "";
		let sortedClients = clients.sort(function(a,b) {
			var first = a.name.toLowerCase(), second = b.name.toLowerCase();
			if(first < second) return -1;
			else if (first > second) return 1;
			return 0;
		});
		element('#projectTimestamp').innerText = new Date(projectList.timestamp).toLocaleString();

		sortedClients.forEach(function(client) {
			body.appendChild(createHeader(client.name));

			var clientProjects = projectList.projects.filter(function(project) {
				return project.clientId === client.id;
			})[0];

			clientProjects.projects.forEach(function(project) {
				body.appendChild(createTwoColumnProjectRow(project.id, project.name, project.color));
			});
		});
		removeClass(element('#updateProjects'), 'active');
	},
	processAndStoreTimeEntries : function(key) {
		app.makeRequest({
			url : app.getTimeEntryRequestEndpoint(),
			method : 'GET',
			success : app.processRawEntries,
			failure : () => {},
			authToken : app.getAuthenticationToken(key)
		});
	},
	processRawEntries : function(data) {
		chrome.storage.local.get(["clientList", "projectList"], (result) => {
			if(result.clientList === undefined || result.projectList === undefined
				|| data.length === 0) return;

				var items = [];
				var entries = JSON.parse(data);

				entries.forEach((entry) => {
					var project;
					result.projectList.projects.forEach((projectContainer) => {
						var innerProject = projectContainer.projects.find((pr) => {
							return pr.id === entry.pid;
						});

						if(innerProject !== undefined) project = innerProject;
					});

					if(project === undefined) return;

					var clientId = project.client.id;
					var projectId = project.id;

					if(items[clientId] === undefined) {
						items[clientId] = app.buildClientProjectStructure(project, entry);
					} else {
						if(items[clientId].projects[projectId] === undefined) {
							var projectItem = {
								projectName : project.name,
								entries : []
							}
							projectItem.entries[entry.description] = {
								timeSeconds : entry.duration, timeFormatted : 0
							};

							items[clientId].projects[projectId] = projectItem;
						} else {
							if(items[clientId].projects[projectId].entries[entry.description] === undefined) {
								items[clientId].projects[projectId].entries[entry.description] = {
									timeSeconds : entry.duration, timeFormatted : 0
								};
							} else {
								items[clientId].projects[projectId].entries[entry.description].timeSeconds += entry.duration;
							}
						}
					}
				});

				console.log(JSON.stringify(items));
		});
	},
	buildClientProjectStructure : function(project, entry) {
		var entryItem = { timeSeconds : entry.duration, timeFormatted : 0 };
		var projectItem = {
			projectName : project.name,
			entries : []
		};
		projectItem.entries[entry.description] = entryItem;

		var clientItem = {
			clientName : project.client.name,
			projects : []
		};
		clientItem.projects[project.client.id] = projectItem;

		return clientItem;
	},
	// var entries = [
	//		12345 : {
	// 	clientId : 12345,
	// 	clientName : "Test Client",
	// 	projects : [
	//			123456 : {
	// 		projectId : 123456,
	// 		projectName : "Test Project",
	// 		entries : [{
	//			"Some Description" : {
	// 			timeSeconds : 1204,
	// 			description : "Lorem Ipsum Dolor"
	// 		}}]
	// 	}]
	// }];
	getTimeEntryRequestEndpoint : function() {
		let startDate = getDate(element('#startDate'));
		let endDate = getDate(element('#endDate'));
		let url = 'https://www.toggl.com/api/v8/time_entries?start_date={0}&end_date={1}';

		return url.replace('{0}', encodeURIComponent(startDate.toISOString())).replace('{1}', encodeURIComponent(endDate.toISOString()));
	},
	loadStoredClientsAndProjects : function() {
		chrome.storage.local.get(["clientList", "projectList", "settings"], function(data) {
			var settings = getSettingsForSave();
			if(data.settings === undefined) {
				chrome.storage.local.set({ "settings" : settings });
			} else {
				settings = data.settings;
			}
			var updateThreshold = new Date();
			updateThreshold.setDate(updateThreshold.getDate() - 1);

			if(data.clientList === undefined) return;

			if(settings.syncClients && new Date(data.clientList.timestamp) < updateThreshold) {
				element('#updateClients').click();
			} else {
				app.updateClientMarkup(data.clientList);
			}

			if(data.projectList === undefined) return;

			if(settings.syncProjects && new Date(data.projectList.timestamp) < updateThreshold) {
				element('#updateProjects').click();
			} else {
				app.updateProjectMarkup(data.projectList, data.clientList.clients);
			}
		});
	},
	makeRequest : function(options) {
		let request = new XMLHttpRequest();
		request.open(options.method, options.url);
		request.setRequestHeader("Authorization", options.authToken);
		request.onload = function() {
			if(this.status >= 200 && this.status < 300) {
				options.success(request.response);
			} else {
				options.failure();
			}
		}
		request.send();
	},
	makeRequestWithPromise : function(method, url, authToken) {
		return new Promise(function(success, failure) {
			let request = new XMLHttpRequest();
			request.open(method, url);
			request.setRequestHeader("Authorization", authToken);
			request.onload = function() {
				if(this.status >= 200 && this.status < 300) {
					success(request.response);
				} else {
					console.log("something broke");
					failure();
				}
			}
			setTimeout(function() {
				request.send();
			}, 400);
		});
	},
	getAuthenticationToken : function () {
		let key = "5d2497ff82e41340ff6e20c4222ea428";
		return "Basic " + btoa(key + ":api_token");
	},
	getAuthenticationToken : function (key) {
		return "Basic " + btoa(key + ":api_token");
	},
	sendNotification : function(message, success, callback) {
		chrome.notifications.create({
			type : "basic",
			title : success ? "Success!" : "Error",
			"message" : message,
			iconUrl : "../icon_128.png"
		}, callback);
	}
};

if ( document.addEventListener ) {
	document.addEventListener( "DOMContentLoaded", function(){
		document.removeEventListener( "DOMContentLoaded", arguments.callee, false);
		domReady();
	}, false );
}

function domReady() {
	initTabs();
	app.init();
}

function initTabs() {
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

function initManualClientSync() {
	let button = document.getElementById('updateClients');
	let spinner = document.getElementById('overlay');

	button.addEventListener('click', () => {
		addClass(button, 'active');

		chrome.storage.local.get("apiKey", function(data) {
			if(data.apiKey === undefined) return;

			app.makeRequest({
				method : 'GET',
				url : 'https://www.toggl.com/api/v8/clients',
				success : app.processAndStoreClients,
				failure : () => {},
				authToken : app.getAuthenticationToken(data.apiKey)
			});
		});
	});
}

function initManualProjectSync() {
	let button = element("#updateProjects");

	button.addEventListener('click', () => {
		addClass(button, 'active');

		chrome.storage.local.get("apiKey", function(data) {
			if(data.apiKey === undefined) return;

			app.processAndStoreProjects(data.apiKey);
		});
	});
}

function initManualTimeEntrySync() {
	let button = element('#updateTimeEntries');
	let startDate = element('#startDate');
	let endDate = element('#endDate');

	button.addEventListener('click', () => {
		addClass(button, 'active');
		let validStart = isValidDate(startDate.value);
		let validEnd = isValidDate(endDate.value);

		if(!validStart || !validEnd ) {
			if(!validStart) {
				addClass(startDate, 'error');
			}

			if(!validEnd) {
				addClass(endDate, 'error');
			}
			show(element('#invalidDate'));
			removeClass(button, 'active');
			return;

		} else {
			removeClass(startDate, 'error');
			removeClass(endDate, 'error');
			hide(element('#invalidDate'));
		}

		chrome.storage.local.get("apiKey", function(data) {
			if(data.apiKey === undefined) return;
			app.processAndStoreTimeEntries(data.apiKey);
		});
	});
}

function initKeyCheck() {
	var testButton = element('#testApiKey');
	var keyTextbox = element('#apiKey');

	testButton.addEventListener('click', function() {
		if(keyTextbox.value !== "") {
			app.authenticate(keyTextbox.value);
		}
	});
}

function initSaveSettings() {
	let button = element("#saveSettings");

	button.addEventListener('click', function() {
		chrome.storage.local.set({ "settings" : getSettingsForSave() });
		removeClass(element('#saveSettings'), 'active');
		closeDialog();
	});
}

function getSettingsForSave() {
	return {
		syncClients : element('#autoSyncClients').checked,
		syncProjects : element('#autoSyncProjects').checked
	};
}

function initOpenDialog() {
	element('#openSettings').addEventListener('click', openDialog);
}

function openDialog() {
	show(element('#settings'));
}

function initCloseDialog() {
	element('#closeSettings').addEventListener('click', closeDialog);
}

function closeDialog() {
	hide(element('#settings'));
	removeClass(element('#openSettings'), 'active');
}

function getDate(input) {
	return isEmpty(input.value) ? new Date() : new Date(input.value);
}
