const describe = require('./describe.js');
var describeSelector = require('./describe.js')

window.addEventListener('DOMContentLoaded', (event) => {
  // Setup describe inputs
  let describeOutput = document.querySelector('#describe-output');
  let describeInput = document.querySelector('#describe-input');
  let describeButton = document.querySelector('#describe-button');

  //Set the describe event listeners
  function describeEventHandler() {
    describeOutput.innerHTML = describeSelector(describeInput.value);
    describeOutput.classList.remove('flex');
  }

  describeButton.addEventListener('click', describeEventHandler);
  describeInput.addEventListener('keydown', function(event) {
    if (event.keyCode === 13) 
      describeEventHandler();
  });

  
});