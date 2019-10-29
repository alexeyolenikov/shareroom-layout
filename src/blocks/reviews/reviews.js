const Carousel = require('../../blocks/carousel/carousel.js').default;

const Selectors = {
  SLIDER_WRAP: '.reviews__wrap',
  SLIDER_REVIEW: '.reviews__slide',
  SLIDER_REVIEW_ACTIVE: '.reviews__slide--active',
  SLIDER_AUTHORS_LEFT: '.reviews__authors-left',
  SLIDER_AUTHORS_RIGHT: '.reviews__authors-right',
  SLIDER_AUTHOR: '.reviews__author',
  SLIDER_AUTHOR_ACTIVE: '.reviews__author--active',
  CAROUSEL: '.reviews__carousel',
}

const ClassNames = {
  SLIDER_REVIEW: 'reviews__slide',
  SLIDER_REVIEW_ACTIVE: 'reviews__slide--active',
  SLIDER_AUTHOR_ACTIVE: 'reviews__author--active',
  SLIDER_AUTHOR_PREV: 'reviews__author--prev',
  SLIDER_AUTHOR_NEXT: 'reviews__author--next',
}

const arSlidersWraps = document.querySelectorAll(Selectors.SLIDER_WRAP);
for (let i = arSlidersWraps.length - 1; i >= 0; i--) {
  const sliderWrap = arSlidersWraps[i];

  const sliderReviews = sliderWrap.querySelectorAll(Selectors.SLIDER_REVIEW);
  const sliderAuthors = sliderWrap.querySelectorAll(Selectors.SLIDER_AUTHOR);
  const carouselWrap = sliderWrap.querySelector(Selectors.CAROUSEL);

  let authorsCarousel = null;
  let bSmallScreen = false;
  let activeReview = sliderWrap.querySelector(Selectors.SLIDER_REVIEW_ACTIVE);

  // Handle click on the review's author
  for (let i = 0; i < sliderAuthors.length; i++) {
    sliderAuthors[i].addEventListener('click', function(e) {
      if(bSmallScreen) {
        return;
      }

      const slideId = sliderAuthors[i].getAttribute('data-slide-id');
      if(slideId) {
        showReview(slideId);
      }
    }); 
  }

  let resizeTimer;
  let resizeDelay = 100;

  // make authors carousel for small screens
  // and remove for large screens
  checkReviews();
  window.addEventListener('resize', checkReviewsThrottle);

  function checkReviewsThrottle() {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(checkReviews, resizeDelay);
  }

  function checkReviews() {
    bSmallScreen = window.matchMedia("(max-width: 969px)").matches;

    // move img's and create authorsCarousel for small screens
    if (!authorsCarousel && bSmallScreen) {
      for (let i = 0; i < sliderAuthors.length; i++) {
        carouselWrap.appendChild(sliderAuthors[i]);
      }
      
      authorsCarousel = new Carousel(carouselWrap, {
        itemSelector: Selectors.SLIDER_AUTHOR,
        itemActiveClass: ClassNames.SLIDER_AUTHOR_ACTIVE,
        itemNextClass: ClassNames.SLIDER_AUTHOR_NEXT,
        itemPrevClass: ClassNames.SLIDER_AUTHOR_PREV,
        loop: true,
        center: true,
        slideByClick: true,
        onChange: function(newActiveItem) {
          const slideId = newActiveItem.getAttribute('data-slide-id');
          
          if(slideId) {
            showReview(slideId, 100);
          }
        }
      });
    }
    // destroy authorsCarousel and move back img's
    else if(authorsCarousel && !bSmallScreen) {
      authorsCarousel.destroy();

      const wrapRight = sliderWrap.querySelector(Selectors.SLIDER_AUTHORS_RIGHT);
      const wrapLeft = sliderWrap.querySelector(Selectors.SLIDER_AUTHORS_LEFT);

      let i = 0;
      for (; i <= (sliderAuthors.length - 1) / 2; i++) {
        wrapLeft.appendChild(sliderAuthors[i]);
      }
      for (; i < sliderAuthors.length; i++) {
        wrapRight.appendChild(sliderAuthors[i]);
      }

      authorsCarousel = null;
    }
  }

  // throttle for changing review using carousel drag
  let showReviewTimer;
  function showReview(reviewId, showReviewDelay = 0) {
    window.clearTimeout(showReviewTimer);

    showReviewTimer = window.setTimeout(() => {
      
      targetReview = sliderWrap.querySelector(Selectors.SLIDER_REVIEW+'[data-slide-id="'+reviewId+'"]');
      if(targetReview) {

        if(activeReview) {
          activeReview.classList.remove(ClassNames.SLIDER_REVIEW_ACTIVE);
        }

        targetReview.classList.add(ClassNames.SLIDER_REVIEW_ACTIVE);
        activeReview = targetReview;

        if(!bSmallScreen) {
          const targetReviewAuthor = sliderWrap.querySelector(Selectors.SLIDER_AUTHOR+'[data-slide-id="'+reviewId+'"]');
          const activeReviewAuthor = sliderWrap.querySelector(Selectors.SLIDER_AUTHOR_ACTIVE);
          activeReviewAuthor && activeReviewAuthor.classList.remove(ClassNames.SLIDER_AUTHOR_ACTIVE);
          targetReviewAuthor.classList.add(ClassNames.SLIDER_AUTHOR_ACTIVE);
        }

        let reviewIndex = 0;
        for (let i = sliderReviews.length - 1; i >= 0; i--) {
          if(reviewId === sliderReviews[i].getAttribute('data-slide-id')) reviewIndex = i;
        }

        sliderReviews[0].style.marginLeft = (-100 * reviewIndex) + '%';
      }

    }, showReviewDelay);
  }
}
