function hasClass(elem, name) {
  var index = elem.className.indexOf(name);

  return elem.className.indexOf(' ' + name + ' ') > -1 ||
    elem.className.indexOf(name + ' ') === 0 ||
    (elem.className.indexOf(' ' + name) > -1 && index + name.length === elem.className.length) ||
    elem.className === name;
}

function addClass(elem, name) {
  if (hasClass(elem, name)) return;

  if (elem.className.length === 0) {
    elem.className = name;
  } else {
    elem.className += ' ' + name;
  }
}

function removeClass(elem, name) {
  if (elem.className.length === 0 || !hasClass(elem, name)) return;

  let allClasses = elem.className;

  if (allClasses.indexOf(' ' + name) > -1 &&
    allClasses.indexOf(name) + name.length === allClasses.length) {
    elem.className = allClasses.replace(' ' + name, '');
  } else if (allClasses === name) {
    elem.className = "";
  } else if (allClasses.indexOf(name + ' ') === 0) {
    elem.className = allClasses.replace(name + ' ', '');
  } else if (allClasses.indexOf(' ' + name + ' ') > -1) {
    elem.className = allClasses.replace(' ' + name + ' ', ' ');
  }
}

function toggleClass(elem, name) {
  if(hasClass(elem, name)) {
    removeClass(elem, name);
  } else {
    addClass(elem, name);
  }
}

function show(elem) {
  elem.style.display = "block";
}

function hide(elem) {
  elem.style.display = "none";
}

function element(query) {
  let identifier = query.substring(0, 1);
  if(identifier === '#') {
    return document.getElementById(query.replace('#', ''));
  } else {
    return document.querySelectorAll(query);
  }
}

function createHeader(text, columnSpan) {
  var row = document.createElement('tr');
  var cell = document.createElement('td');
  cell.innerText = text;
  cell.colSpan = columnSpan;
  cell.classList.add("header");
  row.appendChild(cell);

  return row;
}

function createSubHeader(text, columnSpan, color) {
  var row = document.createElement('tr');
  var cell = document.createElement('td');
  cell.innerText = text;
  cell.colSpan = columnSpan;
  cell.classList.add("sub-header");

  if(color !== undefined) {
    cell.style["background-color"] = color;
    cell.style["color"] = getFontColorForBackgroundColor(color);
  }

  row.appendChild(cell);

  return row;
}

function getFontColorForBackgroundColor(hexCode) {
  var bareHex = hexCode.replace('#', '');
  var red = parseInt(bareHex.substring(0, 2), 16);
  var green = parseInt(bareHex.substring(2, 4), 16);
  var blue = parseInt(bareHex.substring(4, 6), 16);
  //magic numbers
  var luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

  if(luminance > 186)
    return "#aeaeae";
  else
    return "#ffffff";
}

function createTwoColumnRow(firstValue, secondValue) {
  var row = document.createElement('tr');

  var firstCell = document.createElement('td');
  firstCell.innerText = firstValue;
  var secondCell = document.createElement('td');
  secondCell.innerText = secondValue;

  row.appendChild(firstCell);
  row.appendChild(secondCell);

  return row;
}

function createTwoColumnProjectRow(firstValue, secondValue, color) {
  var row = document.createElement('tr');

  var firstCell = document.createElement('td');
  firstCell.innerText = firstValue;
  firstCell.style["border-left"] = "3px solid " + color;
  var secondCell = document.createElement('td');
  secondCell.innerText = secondValue;

  row.appendChild(firstCell);
  row.appendChild(secondCell);

  return row;
}

function createThreeColumnRow(firstValue, secondValue, thirdValue) {
  var row = document.createElement('tr');

  var firstCell = document.createElement('td');
  firstCell.innerText = firstValue;
  var secondCell = document.createElement('td');
  secondCell.innerText = secondValue;
  var thirdCell = document.createElement('td');
  thirdCell.innerText = thirdValue;

  row.appendChild(firstCell);
  row.appendChild(secondCell);
  row.appendChild(thirdCell);

  return row;
}

function createThreeColumnTimeEntrySummaryRow(firstValue, secondValue, addTimeButton) {
  var row = document.createElement('tr');

  var firstCell = document.createElement('td');
  firstCell.innerText = firstValue;
  var secondCell = document.createElement('td');
  secondCell.innerText = secondValue;
  var thirdCell = document.createElement('td');
  thirdCell.appendChild(addTimeButton);

  row.appendChild(firstCell);
  row.appendChild(secondCell);
  row.appendChild(thirdCell);

  return row;
}

function createTimeEntryButton(clientId, projectId) {
  var a = document.createElement('a');

  a.setAttribute("href", "#");
  a.classList.add("button", "time-entry");
  a.setAttribute("data-client", clientId);
  a.setAttribute("data-project", projectId);
  a.innerText = "Add Time";

  return a;
}

function getTimestamp() {
  return new Date().toString();
}

function createTimestampMarkup(timestamp) {
  var p = document.createElement('p');
  p.innerText = timestamp.toLocaleString();
  return p;
}

function getTotalTime(entries) {
  return getIntranetFriendlyTimeFromSeconds(getTotalTimeInSeconds(entries));
}

function getTotalTimeInSeconds(entries) {
  var totalTime = 0;

  entries.forEach((entry) => {
    totalTime += parseInt(entry.duration);
  });

  return totalTime;
}

function getIntranetFriendlyTimeFromSeconds(seconds) {
  var hours = seconds / 3600;
  seconds -= hours * 3600;
  var minutes = seconds / 60;
  seconds -= minutes * 60;
  minutes += seconds > 30 ? 1 : 0;

  return hours + (minutes / 60);
}

function roundProjectTime(hours, threshold) {
	var hourPortion = Math.floor(hours);
	var decimalPortion = hours - hourPortion;

	if(decimalPortion >= 1) {
		return hours;
	}

	if (decimalPortion > 0.0 && decimalPortion <= .25) {
		decimalPortion = decimalPortion <= threshold ? 0.0 : .25;
	} else if (decimalPortion > .25 && decimalPortion <= .5) {
		decimalPortion = decimalPortion <= (threshold + .25) ? .25 : .5;
	} else if (decimalPortion > .5 && decimalPortion <= .75) {
		decimalPortion = decimalPortion <= (threshold + .5) ? .5 : .75;
	} else if (decimalPortion > .75) {
		decimalPortion = decimalPortion <= (threshold + .75) ? .75 : 1;
	}

	return hourPortion + decimalPortion;
}

function isEmpty(item) {
  return item === '' || item === undefined || item === null || item === NaN;
}

function isValidDate(text) {
  let regex = new RegExp(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
  return !isEmpty(text) && regex.test(text);
}

function removeActiveButtons(){
  var button = element('a.button.active');
  for(var i=0; i<button.length; i++) {
    removeClass(button[i], 'active');
  }
}
