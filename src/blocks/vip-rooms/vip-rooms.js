const Carousel = require('../../blocks/carousel/carousel.js').default;

const Selectors = {
  SLIDER_WRAP: '.vip-rooms',
  SLIDER_ITEMS_WRAP: '.vip-rooms__wrap',
  SLIDER_ITEM: '.vip-rooms__item',
  SLIDER_ITEM_ACTIVE: '.vip-rooms__item--active',
  DOTS_WRAP: '.vip-rooms__dots',
}

const ClassNames = {
  SLIDER_WRAP: 'vip-rooms',
  SLIDER_ITEMS_WRAP: 'vip-rooms',
  SLIDER_ITEM: 'vip-rooms__item',
  SLIDER_ITEM_ACTIVE: 'vip-rooms__item--active',
  SLIDER_ITEM_VISIBLE: 'vip-rooms__item--visible',
  DOTS_ITEM: 'vip-rooms__dot',
  DOTS_ITEM_ACTIVE: 'vip-rooms__dot--active',
}

// Render carousel for all vip-rooms blocks
const arSlidersWraps = document.querySelectorAll(Selectors.SLIDER_WRAP);
for (let i = arSlidersWraps.length - 1; i >= 0; i--) {

  const carouselWrap = arSlidersWraps[i].querySelector(Selectors.SLIDER_ITEMS_WRAP);
  const dotsWrapNode = arSlidersWraps[i].querySelector(Selectors.DOTS_WRAP);

  new Carousel(carouselWrap, {
    itemSelector: Selectors.SLIDER_ITEM,
    itemActiveClass: ClassNames.SLIDER_ITEM_ACTIVE,
    itemVisibleClass: ClassNames.SLIDER_ITEM_VISIBLE,
    dots: true,
    dotsWrapNode: dotsWrapNode,
    dotsItemClass: ClassNames.DOTS_ITEM,
    dotsItemActiveClass: ClassNames.DOTS_ITEM_ACTIVE,
    loop: true,
    center: false,
    slideByClick: false,
  });

}
