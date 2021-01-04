var CssSelectorParser = require('css-selector-parser').CssSelectorParser,
  parser = new CssSelectorParser();

//Initialize parser
parser.registerSelectorPseudos('has');
parser.registerNestingOperators('>', '+', '~');
parser.registerAttrEqualityMods('^', '$', '*', '~', '|');
parser.enableSubstitutes();
 
// Outputs a description (with styling)
// from a selector string
module.exports = function describeSelector(selectorString) {
  try {
    let selector = parser.parse(selectorString);
    if (selector === null)
      throw new Error("Selector empty");
    return selectorToDescription(selector);
  } catch (error) {
    console.log(error);
    return errorMarkup();
  }
}


function selectorToDescription(selector) {
  if (!selector) return "";
  switch (selector.type) {
    case 'selectors':
      return selector.selectors.reduce((acc, cur, index) => (
        acc + selectorToDescription(cur)
      ), "");
    
    case 'ruleSet':
      return markupCompoundSelector(selectorToDescription(selector.rule));
    
    case 'rule':
      let tagDescription = getTagDescription(selector);
      let subclassDescription = getSubclassDescription(selector);
      return selectorToDescription(selector.rule) + tagDescription + indent(subclassDescription);
    
    default:
      throw new Error('Unknown selector parser type: ' + selector.type);
  }
}

function getTagDescription(selector) {
  let description = "";

  if (selector.tagName) {
    description += markupTag(`&lt${selector.tagName}&gt`) + " ";
  } else {
    description += "Any ";
  }
  
  description += "elements";

  return description;
}

function getSubclassDescription(selector) {
  let subclassSelector = "";
  if (selector.id)
    subclassSelector += markupSubclassLine(`with id:`) + markupSubclass(`${selector.id}`);

  if (selector.classNames) {
    subclassSelector += markupSubclassLine(`with class${selector.classNames.length === 1 ? '' : 'es'}:`);
    subclassSelector += `${selector.classNames.reduce((acc, cur) => acc + markupSubclass(cur) + "<br>", "")}`;
  }

  if (selector.attrs) {
    subclassSelector += markupSubclassLine(`with attribute${selector.attrs.length === 1 ? '' : 's'}:`)
    subclassSelector += `${selector.attrs.reduce((acc, cur) => acc + describeAttributeMatcher(cur) + "<br>", "")}`;
  }
  
  if (selector.nestingOperator !== undefined) {
    switch (selector.nestingOperator) {
      case null:
        subclassSelector += markupSubclassLine('that are descendents of:');
        break;
      
      case '>':
        subclassSelector += markupSubclassLine('that are direct children of:');
        break;
      
      case '~':
        subclassSelector += markupSubclassLine('that are preceded by:');
        break;
      
      case '+':
        subclassSelector += markupSubclassLine('that are immediately preceded by:');
        break;

      default:
        throw new Error('unkown nesting operator: ' + selector.nestingOperator);
        break;
    }
  }
  return subclassSelector;
}

function describeAttributeMatcher(attrs) {
  let description = markupSubclass(attrs.name);
  if (attrs.operator) {
    let attrValue = markupAttributeValue(`'${attrs.value}'`);
    switch (attrs.operator) {
      case '=':
        description += ` equal to ${attrValue}`;
        break;
      
      case '~=':
        description += ` as a white-space separated list, containing ${attrValue}`;
        break;

      case '|=':
        description += ` equal to ${attrValue} or beginning with ${markupAttributeValue(`'${attrs.value}-'`)}`;
        break;
      
      case '^=':
        description += ` beginning with ${attrValue}`;
        break;
      
      case '$=':
        description += ` ending with ${attrValue}`;
        break;

      case '*=':
        description += ` containing substring ${attrValue}`;
        break;
    }
  }
  return description;
}

function markupCompoundSelector(selectorString) {
  return `<div class="rounded bg-white shadow-md mt-4 p-4 slide-in-right max-w-full w-auto">${selectorString}</div>`;
}

function markupTag(tag) {
  return `<span class="text-red-700 font-mono">${tag}</span>`;
}

function markupSubclass(subclass) {
  return `<span class="text-yellow-700 font-mono">${subclass}</span>`;
}

function markupSubclassLine(subclassLine) {
  return `<div class="text-xs mt-2">${subclassLine}</div>`;
}

function markupAttributeValue(value) {
  return `<span class="text-blue-700 font-mono">${value}</span>`
}

//Indents html by wrapping in a div
function indent(html) {
  return `<div class='pl-10'>${html}</div>`;
}

function errorMarkup() {
  let describeOutput = document.querySelector('#describe-output');
  describeOutput.classList.add('flex');


  return `<div class="flex flex-col items-center h-full w-full">
    <img src="${require('../img/error.svg')}" class="w-24 opacity-75" alt="error" type="image/svg+xml">
    <p class="text-center text-sm text-neutral-800 mt-4">Invalid css selector. Try again.</p>
  </div>`;
}