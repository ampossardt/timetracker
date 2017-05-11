var app = {
	processAndStoreClients : function(response) {
		let clients = JSON.parse(response);
		let clientList = [];

		for(let i=0; i < clients.length; i++) {
			let clientInfo = {
				"id" : clients[i].id,
				"name" : clients[i].name
			};
			clientList.push(clientInfo);
			console.log(clients[i].id + ", " + clients[i].name);
		}

		chrome.storage.local.set({ "clientList" : clientList });
		hideOverlay();
		this.app.updateClientMarkup(clientList);
	},
	updateClientMarkup : function(clients) {
		let body = document.getElementById('clientTableBody');

		for(var i=0; i < clients.length; i++) {
			let row = document.createElement('tr');
			let id = document.createElement('td');
			id.innerText = clients[i].id;
			let name = document.createElement('td');
			name.innerText = clients[i].name;

			row.appendChild(id);
			row.appendChild(name);
			body.appendChild(row);
		}
	},
	processProject : function(response) {
		let projects = JSON.parse(response);
		if(projects === null) return {};
		let projectList = [];

		for(let i=0; i < projects.length; i++) {
			let project = {
				"id" : projects[i].id,
				"name" : projects[i].name,
				"color" : projects[i].hex_color
			};
			projectList.push(project);
		}
		return { "clientId" : projects[0].cid, "projects" : projectList };
	},
	updateProjectMarkup : function(projects, clients) {
		let body = element('#projectTableBody');
		let sortedClients = clients.sort(function(a,b) {
			var first = a.name.toLowerCase(), second = b.name.toLowerCase();
			if(first < second) return -1;
			else if (first > second) return 1;
			return 0;
		});

		sortedClients.forEach(function(client) {
			var header = document.createElement('h3');
			header.innerText = client.name;
			body.appendChild(header);

			var clientProjects = projects.filter(function(project) {
				return project.clientId === client.id;
			})[0];

			clientProjects.projects.forEach(function(project) {
				var row = document.createElement('tr');
				var id = document.createElement('td');
				id.innerText = project.id;

				var name = document.createElement('td');
				name.innerText = project.name;

				row.appendChild(id);
				row.appendChild(name);
				body.appendChild(row);
			});
		});
		hide(element('#overlay'));
	},
	makeRequest : function(method, url, processCallback) {
		let request = new XMLHttpRequest();
		request.open(method, url);
		request.setRequestHeader("Authorization", this.getAuthenticationToken());
		request.onload = function() {
			if(this.status >= 200 && this.status < 300) {
				processCallback(request.response);
			} else {
				console.log("something broke");
			}
		}
		request.send();
	},
	makeRequestWithPromise : function(method, url) {
		return new Promise(function(success, failure) {
			let request = new XMLHttpRequest();
			request.open(method, url);
			request.setRequestHeader("Authorization", this.app.getAuthenticationToken());
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
	}
}

if ( document.addEventListener ) {
	document.addEventListener( "DOMContentLoaded", function(){
		document.removeEventListener( "DOMContentLoaded", arguments.callee, false);
		domReady();
	}, false );
}

function domReady() {
	initTabs();
	initManualClientSync();
	initManualProjectSync();
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

	button.addEventListener('click', function() {
		show(spinner);
		app.makeRequest('GET', 'https://www.toggl.com/api/v8/clients', app.processAndStoreClients);
	});
}

function initManualProjectSync() {
	let button = element("#updateProjects");
	let spinner = element("#overlay");

	button.addEventListener('click', function() {
		show(spinner);
		chrome.storage.local.get("clientList", function(data) {
			if(data.clientList === undefined) {
				console.log("haven't got the client list yet");
				return;
			}

			let clients = data.clientList;
			let url = "https://www.toggl.com/api/v8/clients/{0}/projects";
			var promises = [];
			let results = [];

			clients.forEach(function(client) {
				promises.push(app.makeRequestWithPromise('GET', url.replace('{0}', client.id))
					.then(function(data){
						results.push(app.processProject(data));
				}));
			});

			Promise.all(promises).then(function(values) {
				app.updateProjectMarkup(results, clients);
			});
		});
	});
}

// Utility Functions

function hideOverlay() {
	hide(document.getElementById('overlay'));
}
