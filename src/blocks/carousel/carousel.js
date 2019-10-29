/**
 * Custom carousel with loop and center mode
 *
 * Arguments:
 * 
 * {HTMLElement} wrap - the node contains carousel items
 * {Object} config - object with options
    {String} itemSelector      - carousel item selector
    {String} itemActiveClass   - class added to active item
    {String} itemNextClass     - class added to next after active item
    {String} itemPrevClass     - class added to previous item
    {Boolean} loop             - infinite carousel mode
    {Boolean} center           - center to active item
    {Boolean} slideByClick     - change slide by clicking it
 */
export default class Carousel {

  constructor(wrap, config) {
    this.wrap = wrap;
    this.config = config;

    if(config.itemSelector) {
      this.build();
    }
  }

  /**
   * Init the carousel
   */
  build() {
    this.wrap.classList.add('carousel');
    this.items = Array.prototype.slice.call(  // make array from nodelist
                  this.wrap.querySelectorAll(this.config.itemSelector)
                );

    // Make clones
    if(this.config.loop) {
      this.clonedItemsBefore = this.makeItemsClones();
      this.clonedItemsAfter = this.makeItemsClones();
      this.allItems = this.clonedItemsBefore.concat(this.items, this.clonedItemsAfter);
    }
    else {
      this.allItems = this.items;
    }
    
    this.allItems[0].style.willChange = 'margin-left';

    this.itemWidth = this.getSmallestItemWidth();

    // Insert cloned nodes before and after real items
    this.config.loop && this.insertClonesToWrap();

    this.activeItemIndex = this.getInitialActiveItem();
    this.makeItemActive(this.activeItemIndex);

    // Set center to active item
    this.resetPosition();

    this.onResizeEvent = (event) => {
      // make resize throttle
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => {

        // update itemWidth and slider position
        this.itemWidth = this.getSmallestItemWidth();
        this.resetPosition();     

      }, 100);
    }
    window.addEventListener('resize', this.onResizeEvent);

    // Click events
    this.onItemClickListeners = [];
    this.addItemsClickEvents();

    // Drag event
    this.wrap.onmousedown = this.onWrapMouseDown();

    // Touch events
    this.onTouchListeners = {
      touchstart: this.onWrapMouseDown(),
      touchend: this.dragEnd(),
      touchmove: this.dragAction(),
    }
    this.wrap.addEventListener('touchstart', this.onTouchListeners.touchstart);
    this.wrap.addEventListener('touchend', this.onTouchListeners.touchend);
    this.wrap.addEventListener('touchmove', this.onTouchListeners.touchmove);

    // Init dots
    this.config.dots && this.initDots();
  }

  /**
   * Destroys the carousel
   */
  destroy() {
    this.makeItemNotActive(this.activeItemIndex);

    this.wrap.onmousedown = null;
    document.onmouseup = null;
    document.onmousemove = null;

    window.removeEventListener('resize', this.onResizeEvent);
    window.clearTimeout(this.resizeTimer);

    this.removeItemsClickEvents();

    this.wrap.removeEventListener('touchstart', this.onTouchListeners.touchstart);
    this.wrap.removeEventListener('touchend', this.onTouchListeners.touchend);
    this.wrap.removeEventListener('touchmove', this.onTouchListeners.touchmove);  

    if(this.config.loop) this.removeClones();
    if(!this.config.loop) this.items[0].style.marginLeft = '';

    this.config.dots && this.removeDots();
  }

  /**
   * Handles touchstart and mousedown
   */
  onWrapMouseDown() {
    return (e) => {
      e = e || window.event;
      e.type !== 'touchstart' && e.preventDefault();

      this.posAfterDrag = parseFloat(this.allItems[0].style.marginLeft);
      this.isDragStarted = false;
      this.isItemClickDisabled = false;
      
      if (e.type == 'touchstart') {
        this.dragPosX1 = e.touches[0].clientX;
      } else {
        this.dragPosX1 = e.clientX;
        document.onmouseup = this.dragEnd();
        document.onmousemove = this.dragAction();
      }
    }
  }

  /**
   * Drag action handler
   */
  dragAction() {
    return (e) => {
      e = e || window.event;
      
      if (e.type == 'touchmove') {
        this.dragPosX2 = this.dragPosX1 - e.touches[0].clientX;
        this.dragPosX1 = e.touches[0].clientX;
      } else {
        this.dragPosX2 = this.dragPosX1 - e.clientX;
        this.dragPosX1 = e.clientX;
      }

      // start drag when shifted to > 2px
      if(!this.isDragStarted && Math.abs(this.dragPosX2) < 3) {
        return;
      }
      this.isDragStarted = true;
      this.isItemClickDisabled = true;
 
      const direction = this.dragPosX2 > 0 ? 1 : 0; // 1 - left, 0 - right
      const oldPos = this.posAfterDrag;
      const newPos = parseFloat(this.allItems[0].style.marginLeft) - this.dragPosX2;

      // if distance changed to more than this.itemWidth
      if(Math.abs(newPos - oldPos) > this.itemWidth / 2) {

        let shiftNum = parseInt(Math.abs(newPos - oldPos) / this.itemWidth);
        shiftNum = Math.max(1, shiftNum);

        // limit shiftNum if loop disabled
        if(!this.config.loop) {
          if(direction && this.activeItemIndex + shiftNum >= this.items.length) {
              shiftNum = this.items.length - 1 - this.activeItemIndex;
          }
          else if(!direction && this.activeItemIndex - shiftNum < 0) {
            shiftNum = this.activeItemIndex;
          }
        }

        const newActiveItem = direction ? this.activeItemIndex + shiftNum
                                        : this.activeItemIndex - shiftNum;

        this.goToSlide(newActiveItem, false);

        if(this.config.loop) {
          if(newActiveItem < this.items.length || newActiveItem >= this.items.length * 2) {
            this.posAfterDrag += newActiveItem < this.items.length 
                                  ? this.items.length * this.itemWidth * -1
                                  : this.items.length * this.itemWidth;
          }
        }

        this.posAfterDrag += direction ? shiftNum * this.itemWidth * -1
                                       : shiftNum * this.itemWidth;
      }

      this.moveSlides(-this.dragPosX2);
    }
  }
  
  /**
   * Drag end handler
   */
  dragEnd() {
    return (e) => {
      if(this.isDragStarted) {
        this.allItems[0].style.marginLeft = this.posAfterDrag + 'px';
        this.isDragStarted = false;
      }

      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  /**
   * Adds click event listeners for all items
   */
  addItemsClickEvents() {
    for (let i = 0; i < this.allItems.length; i++) {
      const listener = (e) => this.onItemClick(e, i);
      this.onItemClickListeners.push(listener);

      this.allItems[i].addEventListener('click', listener, true)
    }
  }

  /**
   * Removes click event listeners for all items
   */
  removeItemsClickEvents() {
    for (let i = this.allItems.length - 1; i >= 0; i--) {
      this.allItems[i].removeEventListener('click', this.onItemClickListeners[i], true);
    }
  }

  /**
   * Item click handler
   * @param  {Event} e           
   * @param  {Number} targetIndex Clicked item index
   */
  onItemClick(e, targetIndex) {

    if(!this.config.slideByClick) {
      if(this.isItemClickDisabled) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if(this.isItemClickDisabled) {
      return;
    }

    this.goToSlide(targetIndex);
  }

  /**
   * Item click handler
   * @param  {Event} e           
   * @param  {Number} targetIndex Clicked item index
   */
  onDotClick(e, dotIndex) {
    e.preventDefault();

    if(!this.config.loop) {
      return this.goToSlide(dotIndex);
    }

    let targetIndex = dotIndex + this.items.length;
    // change target to its clone, if the clone nearer than target
    if(this.activeItemIndex > targetIndex && this.activeItemIndex - targetIndex > this.items.length / 2)
      targetIndex += this.items.length;
    else if(this.activeItemIndex < targetIndex && targetIndex - this.activeItemIndex > this.items.length / 2)
      targetIndex -= this.items.length;

    this.goToSlide(targetIndex);
  }

  /**
   * Change active item and move carousel 
   * @param  {Number}  targetIndex Index of target item
   * @param  {Boolean} bMoveToTarget    Forbids to move carousel
   */
  goToSlide(targetIndex, bMoveToTarget = true) {
    if(this.activeItemIndex === targetIndex) {
      return;
    }   

    const prevActiveIndex = this.activeItemIndex;
    const distance = this.itemWidth * (prevActiveIndex - targetIndex);

    // if click to cloned item
    if(this.config.loop && (targetIndex < this.items.length || targetIndex >= this.items.length * 2)) {

      // replace current position and active item 
      const replacedTargetIndex = targetIndex < this.items.length 
                                  ? targetIndex + this.items.length
                                  : targetIndex - this.items.length;

      const replacedActiveIndex = targetIndex < this.items.length 
                                  ? prevActiveIndex + this.items.length
                                  : prevActiveIndex - this.items.length;

      const replacedDistance = targetIndex < this.items.length
                                ? this.items.length * this.itemWidth * -1
                                : this.items.length * this.itemWidth;

      this.disableTransition();

      this.makeItemNotActive(prevActiveIndex);
      this.makeItemActive(replacedActiveIndex);
      this.moveSlides(replacedDistance);

      this.enableTransition();
      this.makeItemNotActive(replacedActiveIndex);
      this.makeItemActive(replacedTargetIndex);
    }
    else 
    { // click to main items
      this.makeItemNotActive(prevActiveIndex);
      this.makeItemActive(targetIndex);
    }

    if(bMoveToTarget) {
      this.moveSlides(distance); 
    }

    if(this.config.dots) {
      this.arDots[this.getOriginalIndex(prevActiveIndex)].classList.remove(this.config.dotsItemActiveClass);
      this.arDots[this.getOriginalIndex(this.activeItemIndex)].classList.add(this.config.dotsItemActiveClass);
    }

    // call onChange callback if it defined
    if(this.config.onChange && typeof this.config.onChange === 'function') {
      this.config.onChange(this.allItems[this.activeItemIndex]);
    }
  }

  /**
   * Disables transition for all items
   */
  disableTransition() {
    for (var i = this.allItems.length - 1; i >= 0; i--) {
      this.allItems[i].style.transition = 'all 0ms linear';
      this.allItems[i].offsetHeight; // trigger layout for disable transition immediately
    }
  }

  /**
   * Enables transition for all items
   */
  enableTransition() {
    for (var i = this.allItems.length - 1; i >= 0; i--) {
      this.allItems[i].style.transition = '';
      this.allItems[i].offsetHeight; // trigger layout for enable transition
    }
  }

  /**
   * Scrolls the carousel for the distance
   * @param  {Number} distance
   */
  moveSlides(distance) {
    const numOldMargin = parseFloat(this.allItems[0].style.marginLeft);

    this.allItems[0].style.marginLeft = (numOldMargin + distance)+'px';
  }

  /**
   * Move carousel to current active item
   */
  resetPosition() {
    this.disableTransition();

    const firstItem = this.allItems[0];
    const actItem = this.allItems[this.activeItemIndex];

    firstItem.style.marginLeft = 0;

    const ml = this.config.center
                  ? this.wrap.offsetWidth/2 - actItem.offsetWidth/2 - actItem.offsetLeft
                  : - actItem.offsetLeft;

    firstItem.style.marginLeft = ml + 'px';

    this.enableTransition();
  }


  /**
   * Find active item and returns its index
   * or first item index (if active item not found)
   * @return {Number} index of active
   */
  getInitialActiveItem() {
    let activeIndex = this.items.length;
    for (let i = 0; i < this.items.length; i++) {
      if(this.items[i].classList.contains(this.config.itemActiveClass)) {
        activeIndex = i;
        if(this.config.loop) activeIndex += this.items.length;
      }
    }
    return activeIndex;
  }

  /**
   * Gets the width of the smallest slide
   * @return {Number} Width in pixels
   */
  getSmallestItemWidth() {
    let result = this.items[0].offsetWidth;
    for (let i = 1; i < this.items.length; i++) {
      if(this.items[i].offsetWidth < result) {
        result = this.items[i].offsetWidth;
      }
    }
    return result;
  }

  /**
   * Clone original items
   * @return {Array.<Node>} Array of cloned nodes
   */
  makeItemsClones() {
    let result = [];
    for (let i = 0; i < this.items.length; i++) {
      const clone = this.items[i].cloneNode(true);
      clone.classList.remove(this.config.itemActiveClass);

      result.push(clone);
    }

    return result;
  }

  /**
   * Insert cloned items before and after the originals
   */
  insertClonesToWrap() {
    for (let i = 0; i < this.clonedItemsAfter.length; i++) {
      this.wrap.appendChild(this.clonedItemsAfter[i]);
    }
    for (let i = 0; i < this.clonedItemsBefore.length; i++) {
      this.wrap.insertBefore(this.clonedItemsBefore[i], this.items[0]);
    }
  }

  /**
   * Removes all cloned nodes from DOM
   */
  removeClones() {
    for (let i = 0; i < this.clonedItemsAfter.length; i++) {
      this.wrap.removeChild(this.clonedItemsAfter[i]);
    }
    for (let i = 0; i < this.clonedItemsBefore.length; i++) {
      this.wrap.removeChild(this.clonedItemsBefore[i]);
    }
  }

  makeItemActive(itemIndex) {
    const item = this.allItems[itemIndex];

    if(item.previousElementSibling && this.config.itemPrevClass)
      item.previousElementSibling.classList.add(this.config.itemPrevClass);

    if(item.nextElementSibling && this.config.itemNextClass)
      item.nextElementSibling.classList.add(this.config.itemNextClass);

    item.classList.add(this.config.itemActiveClass);
    this.activeItemIndex = itemIndex;
  }

  makeItemNotActive(itemIndex) {
    const item = this.allItems[itemIndex];

    if(item.previousElementSibling && this.config.itemPrevClass)
      item.previousElementSibling.classList.remove(this.config.itemPrevClass);

    if(item.nextElementSibling && this.config.itemNextClass)
      item.nextElementSibling.classList.remove(this.config.itemNextClass);

    item.classList.remove(this.config.itemActiveClass);
    this.activeItemIndex = null;
  }

  initDots() {
    const actDotIndex = this.getOriginalIndex(this.activeItemIndex);

    this.arDots = [];
    for (let i = 0; i < this.items.length; i++) {

      let dot = document.createElement('span');
      dot.className = i === actDotIndex 
                          ? this.config.dotsItemClass + ' ' + this.config.dotsItemActiveClass
                          : this.config.dotsItemClass;

      this.config.dotsWrapNode.appendChild(dot);
      this.arDots.push(dot);

      const listener = (e) => this.onDotClick(e, i);
      dot.addEventListener('click', listener);
    }
  }

  removeDots() {
    this.arDots = null;
    if(this.config.dotsWrapNode) {
      this.config.dotsWrapNode.parentNode.removeChild(this.config.dotsWrapNode);
    }
  }

  /**
   * Gets index of original item by cloned item index
   */
  getOriginalIndex(indexFrom) {
    if(!this.config.loop)
      return indexFrom;

    if(indexFrom >= this.items.length * 2)
      return indexFrom - this.items.length * 2;
    else if(indexFrom < this.items.length)
      return indexFrom;
    else
      return indexFrom - this.items.length;
  }

}
