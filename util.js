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

function getTimestamp() {
  return new Date().toLocaleString();
}

function createTimestampMarkup(timestamp) {
  var p = document.createElement('p');
  p.innerText = timestamp;
  return p;
}
