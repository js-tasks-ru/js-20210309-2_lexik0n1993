import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  scrollOffset = 30;
  loading = false;
  stopScrollHandler = false;

  sortFunctions = {
    number: ({ direction, first, second, id }) => {
      return direction * (first[id] - second[id]);
    },
    string: ({ direction, first, second, id }) => {
      return direction * first[id].localeCompare(second[id], ['ru', 'en']);
    }
  };

  headerClickHandler = event => {
    const target = event.target.closest('[data-id]');

    if (this.isItSortable(target.dataset)) {      
      this.sorted.order = this.getOrder;
      this.sorted.id = target.dataset.id;

      const { id, order } = this.sorted;

      if (this.serverSideSorting) {
        this.sortOnServer(id, order);
      } else {
        this.updateTable(id, order);
      }      
    }
  }

  onScrollHandler = () => {
    if (this.stopScrollHandler) {
      return;
    }

    const scroll = window.pageYOffset;
    const bottom = document.documentElement.offsetHeight - document.documentElement.clientHeight - this.scrollOffset;

    if (scroll > bottom && !this.loading) {
      const { id, order } = this.sorted;

      this.loadData(id, order);
    }
  }

  constructor(headersConfig, {
    data = [],
    url = '',
    serverSideSorting = true,
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc',
      startIndex: 0,
      endIndex: 30,
      step: 30
    },
    userSortSettings = {
      sortType: 'myType',
      sortFunction: () => {}
    }
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.url = url ? new URL(url, BACKEND_URL) : '';
    this.serverSideSorting = serverSideSorting;
    this.sorted = sorted;
    this.userSortSettings = userSortSettings;
    
    this.render();
  }

  get getTable() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
            ${this.getTableHeader}
            ${this.getTableBody}
            <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
            ${this.getEmptyPlaceholder}
        </div>
      </div>
    `;
  }

  get getEmptyPlaceholder() {
    return `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    `;
  }

  get getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headersConfig.map(item => this.getHeaderRow(item)).join(``)}
      </div>
    `;
  }

  get getArrow() {
    const arrow = document.createElement('div');

    arrow.innerHTML = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;

    return arrow.firstElementChild;
  }

  get getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getBodyRows(this.data)}
      </div>
    `;
  }

  get getOrder() {
    const orders = {
      'asc': 'desc',
      'desc': 'asc'
    };

    return orders[this.sorted.order];
  }

  getHeaderRow({ id, title, sortable }) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
      </div>
    `;
  }

  getSubElements() {
    const subElements = this.element.querySelectorAll(`[data-element]`);
    return [...subElements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  getBodyRows(data) {
    return data.map(item => `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.getBodyRow(item)}
      </a>
    `).join(``);
  }

  getBodyRow(item) {
    return this.headersConfig
      .map(({ id, template }) => {
        return template ?
          template(item[id]) :
          `<div class="sortable-table__cell">${item[id]}</div>`;
      })
      .join(``);
  }

  async render() {
    const element = document.createElement('div');    

    element.innerHTML = this.getTable;

    this.element = element;

    this.subElements = this.getSubElements();

    if (this.serverSideSorting) {
      await this.loadData(this.sorted.id, this.sorted.order);
    } else {
      this.checkDataIsFullfilled();
    }

    this.addEventListeners();
  }

  setSearchParams(id, order) {
    const {
      startIndex,
      endIndex
    } = this.sorted;

    this.url.searchParams.set(`_sort`, id);
    this.url.searchParams.set(`_order`, order);
    this.url.searchParams.set(`_start`, startIndex);
    this.url.searchParams.set(`_end`, endIndex);
  }

  startLoading() {
    this.loading = true;
    this.subElements.loading.style.display = 'block';
  }

  finishLoading() {
    this.loading = false;
    this.subElements.loading.style.display = 'none';
  }

  async loadData(id, order) {
    this.startLoading();

    this.setSearchParams(id, order);

    const response = await fetchJson(this.url);

    this.data = [...this.data, ...response];

    this.updateTable(id, order);
    this.checkDataIsFullfilled();

    this.sorted.startIndex = this.sorted.endIndex;
    this.sorted.endIndex += this.sorted.step;

    this.finishLoading();

    if (!response.length) {
      this.stopScrollHandler = true;
    }

    return response;
  }

  checkDataIsFullfilled() {
    if (!this.data.length) {
      this.showTablePlaceholder();
    } else {
      this.hideTablePlaceholder();
    }
  }

  showTablePlaceholder() {
    this.subElements.emptyPlaceholder.style.display = 'block';
  }

  hideTablePlaceholder() {
    this.subElements.emptyPlaceholder.style.display = 'none';
  }

  updateTable(id, order, serverSideSorting = this.serverSideSorting) {
    this.updateHeader(id, order);

    const sortedData = serverSideSorting ? this.data : this.sortData(id, order);

    this.subElements.body.innerHTML = this.getBodyRows(sortedData);
  }

  updateHeader(id, order) {
    if (!this.subElements.arrow) {
      this.subElements.arrow = this.getArrow;
    }

    const headerCells = [...this.subElements.header.children];

    headerCells.forEach(cell => cell.dataset.order = ``);

    const sortableItem = headerCells.find(item => item.dataset.id === id);

    sortableItem.append(this.subElements.arrow);
    sortableItem.dataset.order = order;
  }

  sortData(id, order) {
    const data = [...this.data];
    const { sortType } = this.headersConfig.find(item => item.id === id);
    const direction = order === 'asc' ? 1 : -1;

    return data.sort((first, second) => {
      const sortOptions = {
        direction,
        first,
        second,
        id
      };

      switch (sortType) {
        case 'number':
          return this.sortFunctions.number(sortOptions);
        case 'string':
          return this.sortFunctions.string(sortOptions);
        case this.userSortSettings.sortType:
          return this.userSortSettings.sortFunction(sortOptions);
        default:
          return this.sortFunctions.string(sortOptions);
      }
    });
  }

  sortOnServer(id, order) {
    this.resetSortParams();
    this.data = [];
    this.loadData(id, order);
    this.stopScrollHandler = false;
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.headerClickHandler);

    if (this.serverSideSorting) {
      document.addEventListener('scroll', this.onScrollHandler);
    }  
  }

  isItSortable(data) {
    return data && data.sortable === 'true';
  }

  resetSortParams() {
    this.sorted.startIndex = 0;
    this.sorted.endIndex = this.sorted.step;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    if (this.element) {
      this.subElements.header.removeEventListener('pointerdown', this.headerClickHandler);
      document.removeEventListener('scroll', this.onScrollHandler);
      
      this.subElements = {};
    
      this.remove();
      this.element = null;
    }
  }
}
