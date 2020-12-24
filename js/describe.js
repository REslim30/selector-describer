var CssSelectorParser = require('css-selector-parser').CssSelectorParser,
  parser = new CssSelectorParser();
 
parser.registerSelectorPseudos('has');
parser.registerNestingOperators('>', '+', '~');
parser.registerAttrEqualityMods('^', '$', '*', '~', '|');
parser.enableSubstitutes();
 
var util = require('util');

// Outputs a description (with styling)
// from a selector string
module.exports = function describeSelector(selectorString) {
  try {
    let selector = parser.parse(selectorString);
    console.log(util.inspect(selector, false, null));
  
    return selectorToDescription(selector);
  } catch (error) {
    console.log(error);
    return "Invalid css selector. (Or currently unsupported syntax)"
  }
}


function selectorToDescription(selector) {
  if (!selector) return "";
  switch (selector.type) {
    case 'selectors':
      return selector.selectors.reduce((acc, cur, index) => (
        acc + (index === 0 ? ' ' : '\n\nAlong with...\n') + helper(cur)
      ), "");
    
    case 'ruleSet':
      return selectorToDescription(selector.rule);
    
    case 'rule':
      let description = "Any ";

      if (selector.tagName)
        description += selector.tagName + " ";
      
      description += "elements";

      if (selector.id)
        description += `\n\twith id: \n\t\t${selector.id}`;

      if (selector.classNames)
        description += `\n\twith class${selector.classNames.length === 1 ? '' : 'es'}: ${selector.classNames.reduce((acc, cur) => acc + '\n\t\t' + cur, "")}`;

      if (selector.attrs)
        description += `\n\twith attribute${selector.attrs.length === 1 ? '' : 's'}: ${selector.attrs.reduce((acc, cur) => acc + '\n\t\t' + describeAttributeMatcher(cur), "")}`;
      
      if (selector.nestingOperator !== undefined) {
        switch (selector.nestingOperator) {
          case null:
            description += '\n\tthat are descendents of: \n';
            break;
          
          case '>':
            description += '\n\tthat are direct children of: \n';
            break;
          
          case '~':
            description += '\n\tthat are preceded by: \n';
            break;
          
          case '+':
            description += '\n\tthat are immediately preceded by: \n'
            break;

          default:
            throw new Error('unkown nesting operator: ' + selector.nestingOperator);
            break;
        }
      }

      return selectorToDescription(selector.rule) + description ;
    
    default:
      throw new Error('Unknown selector parser type: ' + selector.type);
  }
}

function describeAttributeMatcher(attrs) {
  let description = `'${attrs.name}'`;
  if (attrs.operator) {
    switch (attrs.operator) {
      case '=':
        description += ` equal to '${attrs.value}'`;
        break;
      
      case '~=':
        description += ` as a white-space separated list, containing '${attrs.value}'`;
        break;

      case '|=':
        description += ` equal to '${attrs.value}' or beginning with '${attrs.value}-'`;
        break;
      
      case '^=':
        description += ` beginning with '${attrs.value}'`;
        break;
      
      case '$=':
        description += ` ending with '${attrs.value}'`;
        break;

      case '*=':
        description += ` containing substring '${attrs.value}'`;
        break;
    }
  }
  return description;
}