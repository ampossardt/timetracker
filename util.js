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
