// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript#3855394

// https://stackoverflow.com/a/384380
export function __isELement(obj) {

  try {
    //Using W3 DOM2 (works for FF, Opera and Chrome)
    return obj instanceof HTMLElement;
  }
  catch(e){
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have (works on IE7)
    return (typeof obj==="object") &&
      (obj.nodeType===1) && (typeof obj.style === "object") &&
      (typeof obj.ownerDocument ==="object");
  }

}

export function __getQueryStringParams() {
  const parameters = window.location.search.substr(1).split('&');

  if (parameters === '') {
    return {};
  }

  const b = {};

  for (let i = 0; i < parameters.length; i += 1) {
    const p = parameters[i].split('=', 2);

    if (p.length === 1) {
      b[p[0]] = '';
    } else {
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));
    }
  }

  return b;
}

/* https://plainjs.com/javascript/events/trigger-an-event-11/ */
export function __triggerEvent(el, type) {

  if ('createEvent' in document) {
    // modern browsers, IE9+
    const e = new Event(type);
    el.dispatchEvent(e);
  } else {
      // IE 8
      const e = document.createEventObject();
      e.eventType = type;
      el.fireEvent('on'+e.eventType, e);
  }
}

export function __keycodeIsPrintableCharacter(keycode) {

  const valid =
    (keycode > 47 && keycode < 58) || // number keys
    keycode == 32 || keycode == 13 || // spacebar & return key(s) (if you want to allow carriage returns)
    (keycode > 64 && keycode < 91) || // letter keys
    (keycode > 95 && keycode < 112) || // numpad keys
    (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
    (keycode > 218 && keycode < 223); // [\]' (in order)
  // https://stackoverflow.com/questions/12467240/determine-if-javascript-e-keycode-is-a-printable-non-control-character#answer-12467610

  return valid;

}

export function __isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
// Maybe use lodash ? https://lodash.com/docs/4.17.10#defaultsDeep
export function __mergeDeep(target, source) {
  const output = Object.assign({}, target);
  if (__isObject(target) && __isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (__isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = __mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

export function __isObjectEmpty(object) {
  return !Object.keys(object).length;
}

export function __insertBefore(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

export function __insertAfter(newNode, referenceNode) {

  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);

}

export function __getRealDimensions(el, translated = true) {

  const clonedElement = el.cloneNode(true);

  clonedElement.style.visibility = 'hidden';
  clonedElement.style.display = 'block';

  __insertAfter(clonedElement, el);

  const elDimensions = clonedElement.getBoundingClientRect();
  const elPosition = (translated) ? __positionTranslated(clonedElement) : __position(clonedElement);


  __remove(clonedElement);

  return {
    width: elDimensions.width,
    height: elDimensions.height,
    top: elPosition.top,
    left: elPosition.left,
  };

}

export function __remove(el /* :HTMLElement */) {

  el.parentNode.removeChild(el);

}


export function __getHTML(node) {

  if (!node || !node.tagName) { return; }
  if (node.outerHTML) { return node.outerHTML; }

  // polyfill:
  const wrapper = document.createElement('div');
  wrapper.appendChild(node.cloneNode(true));
  return wrapper.innerHTML;

}

export function __getText(el) {
  return el.innerText || el.textContent;
}

export function __globalPosition(event) {
  // d3.event
  // The current event, if any. This is set during the invocation of an event listener, and is reset after the listener terminates. Use this to access standard event fields such as event.timeStamp and methods such as event.preventDefault. While you can use the native event.pageX and event.pageY, it is often more convenient to transform the event position to the local coordinate system of the container that received the event using d3.mouse, d3.touch or d3.touches.
  // If you use Babel, Webpack, or another ES6-to-ES5 bundler, be aware that the value of d3.event changes during an event! An import of d3.event must be a live binding, so you may need to configure the bundler to import from D3’s ES6 modules rather than from the generated UMD bundle; not all bundlers observe jsnext:main. Also beware of conflicts with the window.event global.
  return {
    x: event.pageX,
    y: event.pageY,
  };
}

export function __localPosition(container) {
  // d3.mouse
  // Returns the x and y coordinates of the current event relative to the specified container. The container may be an HTML or SVG container element, such as a G element or an SVG element. The coordinates are returned as a two-element array of numbers [x, y].
  // BUG: d3.mouse doesn’t observe CSS transform on Firefox — https://github.com/d3/d3-selection/issues/81
  const pos = d3.mouse(container);
  return {
    x: d3.format('.0f')(pos[0]),
    y: d3.format('.0f')(pos[1]),
  };
}

export function __isEqualNodeTo(element1, element2) {
  return element1.isEqualNode(element2);
}

export function __scrollTo(element, behavior = 'smooth') {
  window.scroll({
    behavior,
    left: 0,
    top: element.offsetTop,
  });
}

export function __positionTranslated(el) {


  const curTransform = new WebKitCSSMatrix(window.getComputedStyle(el).webkitTransform);

  const body = document.body;

  const scrollTop = window.pageYOffset || body.scrollTop;
  const scrollLeft = window.pageXOffset || body.scrollLeft;

  return {
    left: el.offsetLeft + curTransform.m41,
    top: el.offsetTop + curTransform.m42,
  };

}

export function __position(el) {

  const elAttibutes = el.getBoundingClientRect();
  const body = document.body;

  const scrollTop = window.pageYOffset || body.scrollTop;
  const scrollLeft = window.pageXOffset || body.scrollLeft;

  return {
    left: elAttibutes.left + scrollLeft,
    top: elAttibutes.top + scrollTop,
    height: elAttibutes.height,
    width: elAttibutes.width,
  };
}

// TODO: check for https://github.com/vladocar/nanoJS/
export function __toggleClass(element, cls) {
  if (__hasClass(element, cls)) {
    __removeClass(element, cls);
  } else {
    __addClass(element, cls);
  }
}

export function __hasClass(element, cls) {
  // if there are no elements or classes, we're done
  if (!element || !cls) return false;
  return (element.classList) ? element.classList.contains(cls) : (`${element.className} `).indexOf(`${cls} `) > -1;
}

export function __addClass(elements, classes) {
  let _elements = elements;
  let _classes = classes;

  // if there are no elements or classes, we're done
  if (!_elements || !_classes) { return; }

  if (typeof (_elements) === 'string') {
    // if we have a selector, get the chosen _elements
    _elements = document.querySelectorAll(_elements);
  } else if (_elements.tagName) {
    // if we have a single DOM element, make it an array to simplify behavior
    _elements = [_elements];
  }

  if (typeof (_classes) === 'string') {
    // make an array from string _classes
    _classes = _classes.split(' ');
  } else {
    console.log('Class argument must be string with spaces in between class names.');
    return;
  }

  // add class to all chosen _elements
  for (let i = 0; i < _elements.length; i += 1) {
    // check classList support
    if (_elements[i].classList) {
      _elements[i].classList.add(..._classes);
    } else if (!__hasClass(_elements[i], ..._classes)) {
      for (let j = 0; j < _classes.length; j += 1) {
        _elements[i].classes += ` ${_classes[j]}`;
      }
    }
  }
}

export function __removeClass(elements, classes) {
  let _elements = elements;
  let _classes = classes;

  // if there are no elements or classes, we're done
  if (!_elements || !_classes) { return; }

  if (typeof (_elements) === 'string') {
    // if we have a selector, get the chosen _elements
    _elements = document.querySelectorAll(_elements);
  } else if (_elements.tagName) {
    // if we have a single DOM element, make it an array to simplify behavior
    _elements = [_elements];
  }

  if (typeof (_classes) === 'string') {
    // make an array from string _classes
    _classes = _classes.split(' ');
  } else {
    console.log('Class argument must be string with spaces in between class names.');
    return;
  }

  // remove class from all chosen _elements
  for (let i = 0; i < _elements.length; i += 1) {
    // check classList support
    if (_elements[i].classList) {
      _elements[i].classList.remove(..._classes);
    } else {
      for (let j = 0; j < _classes.length; j += 1) {
        _elements[i].className = _elements[i].className.replace(new RegExp(`\\b${classes[j]}\\b`, 'g'), '');
      }
    }
  }
}

export function __getObjectByNotation (baseObj, path) {
  const paths = path.split('.');
  const len = paths.length;

  for(let i=0; i<len; i++) {
    baseObj = baseObj[paths[i]];
  }
  return baseObj;

};

// https://stackoverflow.com/a/10934946
export function __setObjByNotation (obj, str, val) {
    str = str.split(".");
    while (str.length > 1) obj = obj[str.shift()];
    return obj[str.shift()] = val;
}

export function _replaceSpacesInTextCZ(text) {
  // check if variable is string
  if (Object.prototype.toString.call(text) !== '[object String]') { return false; }

  const regex = /(?<=\s[aiouksvz])\s/gi;
  const newText = text.replace(regex, '&nbsp;');

  return newText;
}

