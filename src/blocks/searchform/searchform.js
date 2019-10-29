class Searchform {

  constructor(formWrap) {
    this.maxCols = 6;

    this.formWrap = formWrap;
    this.hiddenColsWrap = formWrap.querySelector('.searchform__more');
    this.arAllCols = this.makeColumnsArray();
    this.iVisibleColumns = this.arAllCols.length;

    this.formWrap && this.hiddenColsWrap && this.init();
  }

  init() {
    this.checkColumns();

    window.addEventListener('resize', (event) => {
      this.checkColumns();
    });

  }

  checkColumns() {
    this.updateColumnsLimit();

    if(this.maxCols < this.iVisibleColumns) {
      this.hideExcessiveColumns();
      return;
    }
    
    // show hidden columns if they exist
    if(this.maxCols > this.iVisibleColumns && this.iVisibleColumns !== this.arAllCols.length) {
      this.showHiddenColumns();
    }

  }

  hideExcessiveColumns() {
    const numColsToHide = this.iVisibleColumns - this.maxCols;

    for (let j = 0; j < numColsToHide; j++) {
      // select last visible column
      const curColumnIndex = this.iVisibleColumns - 1;
      const curColumn = this.arAllCols[curColumnIndex];

      // move column content
      this.moveNodeContent(curColumn.contentWrap, curColumn.movedContentWrap)

      // hide column and show hidden column
      curColumn.node.classList.add("searchform__col--hidden");
      curColumn.movedContentWrap.classList.remove('searchform__more-col--hidden');
      
      this.iVisibleColumns--;
    }
  }

  showHiddenColumns() {
    const numHiddenCols = this.arAllCols.length - this.iVisibleColumns;
    const maxColsToShow = this.maxCols - this.iVisibleColumns;
    const numColsToShow = Math.min(numHiddenCols, maxColsToShow);

    for (let i = 0; i < numColsToShow; i++) {
      // select first hidden column
      const curColumnIndex = this.iVisibleColumns;
      const curColumn = this.arAllCols[curColumnIndex];

      // move curent item content
      this.moveNodeContent(curColumn.movedContentWrap, curColumn.contentWrap);

      // show column
      curColumn.node.classList.remove("searchform__col--hidden");
      curColumn.movedContentWrap.classList.add('searchform__more-col--hidden');

      this.iVisibleColumns++;
    }
  }

  /**
   * Update this.maxCols depending viewport
   */
  updateColumnsLimit() {
    if (window.matchMedia("(max-width: 479px)").matches) {
      this.maxCols = 2;
    } else if (window.matchMedia("(max-width: 767px)").matches) {
      this.maxCols = 3;
    } else if (window.matchMedia("(max-width: 969px)").matches) {
      this.maxCols = 3;
    } else if (window.matchMedia("(max-width: 1169px)").matches) {
      this.maxCols = 4;
    } else if (window.matchMedia("(max-width: 1439px)").matches) {
      this.maxCols = 5;
    } else {
      this.maxCols = 6;
    }
  }

  /**
   * Makes an array of column objects
   * @return {Object[]} 
   *         Object[].id column identifier
   *         Object[].node column node
   *         Object[].contentWrap element containing movable content
   *         Object[].movedContentWrap element into which the content will be transferred
   */
  makeColumnsArray() {
    const allColsNodes = this.formWrap.querySelectorAll('.searchform__col[data-col-id]');
    let arResult = [];

    for (let i = allColsNodes.length - 1; i >= 0; i--) {
      let obColumn = {
        id: allColsNodes[i].getAttribute('data-col-id'),
        node: allColsNodes[i],
        contentWrap: allColsNodes[i].querySelector('.searchform__col-drop-content'),
      };
      obColumn.movedContentWrap = this.makeHiddenCol(obColumn.id);

      if(obColumn.id === null || obColumn.id === "" || !obColumn.node || !obColumn.contentWrap) {
        continue;
      }

      arResult[i] = obColumn;
    }

    return arResult;
  }

  /**
   * Move content from containerFrom into nodeTo 
   * @param  {HTMLElement} containerFrom Element whose children will be moved
   * @param  {HTMLElement} nodeTo        Target element
   */
  moveNodeContent(containerFrom, nodeTo) {
    while (containerFrom.firstChild) {
      if(nodeTo.firstChild)
        nodeTo.insertBefore(containerFrom.firstChild, nodeTo.firstChild);
      else
        nodeTo.appendChild(containerFrom.firstChild);
    }
  }


  /**
   * Make new column and put it into this.hiddenColsWrap
   * @param  {Number} columnId 
   * @return {HTMLElement}
   */
  makeHiddenCol(columnId) {
    newCol = document.createElement('div');
    newCol.className = "searchform__more-col searchform__more-col--hidden";
    newCol.setAttribute("data-col-id", columnId);
  
    // put newCol at the beginning
    if(this.hiddenColsWrap.firstChild)
      this.hiddenColsWrap.insertBefore(newCol, this.hiddenColsWrap.firstChild);
    else
      this.hiddenColsWrap.appendChild(newCol);

    return newCol;
  }
}

// create searchforms
const arrSearchform = document.querySelectorAll('.searchform');
if(arrSearchform && arrSearchform.length > 0) {
  for (let i = arrSearchform.length - 1; i >= 0; i--) {
    new Searchform(arrSearchform[i]);
  }
}
