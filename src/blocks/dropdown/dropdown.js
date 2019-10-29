const Popper = require('popper.js').default;
const arrDropdowns = document.querySelectorAll('.dropdown');

if(arrDropdowns && arrDropdowns.length > 0) {

  for (let i = arrDropdowns.length - 1; i >= 0; i--) {
    
    const toggler = arrDropdowns[i].querySelector('.dropdown__toggler'),
          dropdown = arrDropdowns[i].querySelector('.dropdown__content');

    if(!toggler )
      continue;

    const popper = new Popper(toggler, dropdown, {
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
    popper.disableEventListeners();

    toggler.addEventListener('click', function(e) {
      e.preventDefault();
      arrDropdowns[i].classList.contains('dropdown--is-open') || popper.update();
      arrDropdowns[i].classList.toggle('dropdown--is-open');
    }); 

  }

}
