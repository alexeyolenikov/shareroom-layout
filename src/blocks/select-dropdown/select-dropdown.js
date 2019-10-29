const Popper = require('popper.js').default;
const arrSelects = document.querySelectorAll('.select-dropdown');

if(arrSelects && arrSelects.length) {

  // add popper.js only for screens with width > $screen-md
  let arrPopperObjects = [];

  checkPopper(arrSelects, arrPopperObjects);
  window.addEventListener('resize', function(event){
    checkPopper(arrSelects, arrPopperObjects);
  });

  for (let i = arrSelects.length - 1; i >= 0; i--) {

    const dropdown = arrSelects[i].querySelector('.select-dropdown__dropdown');

    // show dropdown content by clicking ".select-dropdown"
    arrSelects[i].addEventListener('click', function(e) {
      if(!dropdown.contains(e.target)) {
        arrSelects[i].classList.toggle('select-dropdown--is-open');
      }
    });

    const resultButton = arrSelects[i].querySelector('.select-dropdown__result-btn');
    if(resultButton) {
      resultButton.addEventListener('click', function(e) {
        arrSelects[i].classList.toggle('select-dropdown--is-open');
      });
    }
    
  }

}

/**
 * Destroy Popper for small screens
 * and create for large
 */
function checkPopper(arrSelects, arrPopperObjects) {
  if (window.matchMedia("(max-width: 767px)").matches) {
    if(arrPopperObjects.length) {
      // destroy all Popper objects
      for (let i = arrPopperObjects.length - 1; i >= 0; i--) {
        arrPopperObjects[i].destroy();
      }
      arrPopperObjects = [];
    }
  }
  else {
    // make Popper objects
    for (let i = arrSelects.length - 1; i >= 0; i--) {
      const dropdown = arrSelects[i].querySelector('.select-dropdown__dropdown');
      const obPopper = new Popper(arrSelects[i], dropdown, {
        placement: 'bottom-end',
        modifiers: {
          flip: {
            enabled: false 
          },
          preventOverflow: {
            enabled: true,
            escapeWithReference: false,
          },
        }
      });
      arrPopperObjects.push(obPopper);
    }
  }
}