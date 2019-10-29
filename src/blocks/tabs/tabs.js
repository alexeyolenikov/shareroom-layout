const Popper = require('popper.js').default;

const Selectors = {
  TAB_LINK: '.tabs__link[data-toggle="tab"]',
  TAB_LINK_ACTIVE: '.tabs__link--active',

  TAB_LINK_DROPDOWN: '.tabs__link--dropdown',
  DROPDOWN_WRAP: '.tabs__dropdown-wrap',

}
const ClassNames = {
  TAB_LINK: 'tabs__link',
  TAB_LINK_ACTIVE: 'tabs__link--active',
  TAB_PANEL_ACTIVE: 'tabs__panel--active',
  TAB_LINK_DROPDOWN: 'tabs__link--dropdown',
  TAB_LINK_DROPDOWN_OPEN: 'tabs__link--drop-open',
  DROPDOWN_WRAP: 'tabs__dropdown-wrap',

}

class Tabs {
  constructor(tabsWrap) {
    this.tabsWrap = tabsWrap;
    this.tabsLinks = this.tabsWrap.querySelectorAll(Selectors.TAB_LINK);
    
    this.getActiveTab() || new Error('One tab must be active');
    if(!tabsWrap || !this.tabsLinks || this.tabsLinks.length <= 0) {
      throw new Error('Incorrect tabs block');
      return;
    }

    this.init();
  }

  init() {
    this.addClickEvents();
  }

  addClickEvents() {
    for (let i = this.tabsLinks.length - 1; i >= 0; i--) {

      this.tabsLinks[i].addEventListener('click', (e) => {
        e.preventDefault();

        if(this.tabsLinks[i] === this.activeTab) {
          return
        }

        // toggle active class from active tab link and panel
        this.activeTab.classList.remove(ClassNames.TAB_LINK_ACTIVE);
        this.activeTabPanel.classList.remove(ClassNames.TAB_PANEL_ACTIVE);

        const tabPanelId = this.tabsLinks[i].getAttribute('href');
        const tabPanel = this.tabsWrap.querySelector(tabPanelId);

        if(!tabPanel) {
          throw new Error('Panel with id "#' + tabPanelId + '" not found');
          return;
        }

        this.tabsLinks[i].classList.add(ClassNames.TAB_LINK_ACTIVE);
        tabPanel.classList.add(ClassNames.TAB_PANEL_ACTIVE);

        // set active tab and panel
        this.activeTab = this.tabsLinks[i];
        this.activeTabPanel = tabPanel;

      }); 

    }
  }

  getActiveTab() {
    const activeTab = this.tabsWrap.querySelector(Selectors.TAB_LINK_ACTIVE);
    const panelId = activeTab.getAttribute('href');
    const panel = this.tabsWrap.querySelector(panelId);

    this.activeTab = activeTab ? activeTab : null;
    this.activeTabPanel = panel ? panel : null;

    return this.activeTab && this.activeTabPanel;
  }

  makeTabLinksArray() {
    let linksNodes = this.tabsWrap.querySelectorAll(Selectors.TAB_LINK);

    for (let i = links.length - 1; i >= 0; i--) {
      let obTab = {

      }
    }
  }

}


class TabsAutohide extends Tabs {

  constructor(tabsWrap) {
    super(tabsWrap);
  }

  init() {
    super.init();

    this.iVisibleTabs = this.tabsLinks.length;
    this.dropdownWrap = this.tabsWrap.querySelector(Selectors.DROPDOWN_WRAP);
    this.dropdownLink = this.tabsWrap.querySelector(Selectors.TAB_LINK_DROPDOWN);

    if(!this.dropdownLink || !this.dropdownWrap) {
      throw new Error('Incorrect dropdown block');
      return 
    }

    this.checkTabsLimit();
    window.addEventListener('resize', (e) => {
      this.checkTabsLimit();
    });

    // make dropdown for this.dropdownLink
    new Popper(this.dropdownLink, this.dropdownWrap, {
      placement: 'bottom-end',
      modifiers: {
        flip: {
          enabled: false 
        },
        preventOverflow: {
          enabled: true,
          escapeWithReference: true,
        },
      },
    });

    this.dropdownLink.addEventListener('click', (e) => {
      this.dropdownLink.classList.toggle(ClassNames.TAB_LINK_DROPDOWN_OPEN);
    }); 
  }

  checkTabsLimit() {
    this.updateTabsLimit();

    // hide tabs only if needed to hide 2 and more tab
    if(this.maxTabs < this.iVisibleTabs && this.maxTabs < this.tabsLinks.length - 1) {
      this.hideTabs(this.iVisibleTabs - this.maxTabs);
      return;
    }
    
    // show hidden columns if they exist
    if(this.maxTabs > this.iVisibleTabs && this.iVisibleTabs !== this.tabsLinks.length) {
      this.showTabs();
    }

    // hide dropdown link if all tabs are visible
    if(this.iVisibleTabs === this.tabsLinks.length) {
      this.dropdownLink.style.display = 'none';
    }
  }

  hideTabs() {
    const numTabsToHide = this.iVisibleTabs - this.maxTabs;

    for (let j = 0; j < numTabsToHide; j++) {
      // move last visible tab 
      const curTab = this.tabsLinks[this.iVisibleTabs - 1];

      if(this.dropdownWrap.firstChild)
        this.dropdownWrap.insertBefore(curTab, this.dropdownWrap.firstChild);
      else
        this.dropdownWrap.appendChild(curTab);

      this.iVisibleTabs--;
    }

    // show dropdown link if it hidden
    if(this.dropdownLink.style.display === "none") {
      this.dropdownLink.style.display = '';
    }
  }

  showTabs() {
    const numHiddenTabs = this.tabsLinks.length - this.iVisibleTabs;
    const maxTabsToShow = this.maxTabs - this.iVisibleTabs;
    let numTabsToShow = Math.min(numHiddenTabs, maxTabsToShow);
    
    // if only one tab remains, show it too
    if(numHiddenTabs - numTabsToShow === 1) {
      numTabsToShow = numHiddenTabs;
    }

    for (let j = 0; j < numTabsToShow; j++) {
      // move first hidden tab to tabsWrap, after last visible tab
      const curTab = this.tabsLinks[this.iVisibleTabs];
      const lastVisTab = this.tabsLinks[this.iVisibleTabs - 1];

      if(lastVisTab.nextElementSibling)
        lastVisTab.parentNode.insertBefore(curTab, lastVisTab.nextElementSibling);
      else
        lastVisTab.parentNode.appendChild(curTab);

      this.iVisibleTabs++;
    }

  }

  /**
   * Update this.maxTabs depending viewport
   */
  updateTabsLimit() {
    if (window.matchMedia("(max-width: 479px)").matches) {
      this.maxTabs = 1;
    } else if (window.matchMedia("(max-width: 767px)").matches) {
      this.maxTabs = 2;
    } else if (window.matchMedia("(max-width: 969px)").matches) {
      this.maxTabs = 3;
    } else if (window.matchMedia("(max-width: 1169px)").matches) {
      this.maxTabs = 4;
    } else if (window.matchMedia("(max-width: 1439px)").matches) {
      this.maxTabs = 5;
    } else {
      this.maxTabs = 6;
    }
  }

}


// create searchforms
const arrTabs = document.querySelectorAll('.tabs');
if(arrTabs && arrTabs.length > 0) {
  for (let i = arrTabs.length - 1; i >= 0; i--) {
    
    if(arrTabs[i].classList.contains('tabs--autohide')) {
      new TabsAutohide(arrTabs[i]);
    }
    else {
      new Tabs(arrTabs[i]);
    }
  
  }
}