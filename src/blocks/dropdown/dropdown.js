const Popper = require('popper.js').default;

class Dropdown {

  constructor(wrap, toggler = null, dropdown = null, config = {}) {
    this.wrap = wrap;
    this.toggler = toggler || wrap.querySelector('.dropdown__toggler');
    this.dropdown = dropdown || wrap.querySelector('.dropdown__content');
    this.config = {
      classOpen: 'dropdown--is-open',
      ...config
    };
    this.popper = null;

    if(!wrap || !this.toggler || !this.dropdown) {
      return;
    }

    this.init();
  }

  init() {
    this.popper = new Popper(this.toggler, this.dropdown, {
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
    this.popper.disableEventListeners();

    this.toggler.addEventListener('click', this.togglerClickHandler.bind(this)); 
  }

  togglerClickHandler(e) {
    e.preventDefault();
    this.wrap.classList.contains(this.config.classOpen) || this.popper.update();
    this.wrap.classList.toggle(this.config.classOpen);
  }


  updatePos() {
    this.popper.update();
  }
  destroy() {
    this.popper.destroy();
    this.toggler.removeEventListener('click', this.togglerClickHandler.bind(this)); 
  }

}

const arrDropdowns = document.querySelectorAll('.dropdown');

if(arrDropdowns && arrDropdowns.length > 0) {

  for (let i = arrDropdowns.length - 1; i >= 0; i--) {
    
    if(arrDropdowns[i].getAttribute('data-init-dropdown') === "false") {
      continue;
    }

    const toggler = arrDropdowns[i].querySelector('.dropdown__toggler'),
          dropdown = arrDropdowns[i].querySelector('.dropdown__content');

    new Dropdown(arrDropdowns[i], toggler, dropdown, { classOpen: 'dropdown--is-open' });

  }

}

export default Dropdown;