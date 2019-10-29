const toggler = document.querySelector('.top-nav__toggler');
const navElem = toggler.parentNode;
let bIsMenuOpen = navElem.classList.contains(['top-nav', 'top-nav--is-open']);

if(navElem && navElem.classList.contains('top-nav')) {

  // show mobile nav by clicking ".top-nav__toggler"
  toggler.addEventListener('click', function(e) {
    navElem.classList.toggle('top-nav--is-open');
    bIsMenuOpen = !bIsMenuOpen;
  }); 

  // hide menu on click outside of ".top-nav__list"
  const listElem = navElem.querySelector('.top-nav__list');
  document.addEventListener('click', function(e) {
    if (!bIsMenuOpen || listElem.contains(e.target) || toggler.contains(e.target)) 
      return;

    navElem.classList.toggle('top-nav--is-open');
    bIsMenuOpen = !bIsMenuOpen;
  }); 

}
