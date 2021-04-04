export default class SortableTable {

  sortFunctions = {
    number: ({ direction, first, second, field }) => {
      return direction * (first[field] - second[field]);
    },
    string: ({ direction, first, second, field }) => {
      return direction * first[field].localeCompare(second[field], ['ru', 'en']);
    }
  };

  headerClickHandler = event => {
    const target = event.target.closest('[data-id]');

    if (this.isItSortable(target.dataset)) {      
      const order = this.getOrder;
      const field = target.dataset.id;
      
      this.sort(field, order);
    }
  }

  constructor(headerConfig = [], {
    data = [],
    startSortSettings = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    userSortSettings = {
      sortType: 'myType',
      sortFunction: () => {}
    }
  }) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.startSortSettings = startSortSettings;
    this.userSortSettings = userSortSettings;
    
    this.render();
    this.addListeners();
    this.sort(startSortSettings.title, startSortSettings.order);
  }

  get getTable() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
            ${this.getTableHeader}
            ${this.getTableBody}
        </div>
      </div>
    `;
  }

  get getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(item => this.getHeaderRow(item)).join(``)}
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

    return orders[this.order];
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
    return this.headerConfig
      .map(({ id, template }) => {
        return template ?
          template(item[id]) :
          `<div class="sortable-table__cell">${item[id]}</div>`;
      })
      .join(``);
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTable;

    this.element = element;

    this.subElements = this.getSubElements();
  }

  sort(field = 'title', order = 'asc') {
    this.updateHeader(field, order);
    this.order = order;

    const sortedData = this.sortData(field, order);

    this.subElements.body.innerHTML = this.getBodyRows(sortedData);
  }

  updateHeader(field, order) {
    if (!this.subElements.arrow) {
      this.subElements.arrow = this.getArrow;
    }

    const headerCells = [...this.subElements.header.children];

    headerCells.forEach(cell => cell.dataset.order = ``);

    const sortableItem = headerCells.find(item => item.dataset.id === field);

    sortableItem.append(this.subElements.arrow);
    sortableItem.dataset.order = order;
  }

  sortData(field, order) {
    const data = [...this.data];
    const { sortType } = this.headerConfig.find(item => item.id === field);
    const direction = order === 'asc' ? 1 : -1;

    return data.sort((first, second) => {
      const sortOptions = {
        direction,
        first,
        second,
        field
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

  addListeners() {
    this.subElements.header.addEventListener('pointerdown', this.headerClickHandler);
  }

  isItSortable(data) {
    return data && data.sortable === 'true';
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
