

window.addEventListener('DOMContentLoaded', (event) => {
  let describeOutput = document.querySelector('#describe-output');
  let describeInput = document.querySelector('#describe-input');
  let describeButton = document.querySelector('#describe-button');

  describeButton.addEventListener('click', function() {
    describeOutput.innerHTML = describeInput.value;
    describeOutput.classList.remove('flex');

  });
});