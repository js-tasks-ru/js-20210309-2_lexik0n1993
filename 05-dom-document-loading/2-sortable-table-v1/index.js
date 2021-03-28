export default class SortableTable {
  constructor(header, data) {
    this.headerData = header;
    this.data = data.data;
    this.getImgCell = this.headerData[0].template;
    
    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
          </div>
          <div data-element="body" class="sortable-table__body"></div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.buildHeader();
    this.buildBody(this.data);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  buildHeader() {
    this.subElements.header.innerHTML = this.headerData.map(({
      id,
      title,
      sortable
    }) => `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order>
        <span>${title}</span>
      </div>
    `).join(``);
  }

  buildBody(data) {
    this.subElements.body.innerHTML = data.map(({
      id,
      images,
      title,
      quantity,
      price,
      sales
    }) => `
      <a href="/products/${id}" class="sortable-table__row">
        ${this.getImgCell ? this.getImgCell(images) : ``}
        ${[title, quantity, price, sales].map(item => `
          ${item ? `<div class="sortable-table__cell">${item}</div>` : ``}
        `).join(``)}
      </a>
    `).join(``);
  }

  buildArrow() {
    const arrow = document.createElement('div');

    arrow.innerHTML = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
    this.arrow = arrow.firstElementChild;
  }

  sort(field, order = 'asc') {
    this.updateHeader(field, order);

    const sortedData = [...this.data].sort(
      field !== 'title' ?
        (firstEl, secondEl) => (
          order === 'desc' ?
          secondEl[field] - firstEl[field] :
          firstEl[field] - secondEl[field]
        ) :
        (firstEl, secondEl) => (
          order === 'desc' ?
          compareStrings(secondEl[field], firstEl[field]) :
          compareStrings(firstEl[field], secondEl[field])
        )
    );

    this.buildBody(sortedData);
  }

  updateHeader(field, order) {
    if (!this.arrow) {
      this.buildArrow();
    }    

    const sortableItem = [...this.subElements.header.children]
      .find(item => item.dataset.id === field);

    sortableItem.append(this.arrow);
    sortableItem.dataset.order = order;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

function compareStrings(a, b) {
  const locales = ['ru-u-kf-upper', 'en-u-kf-upper'];
  const options = {
    sensitivity: 'variant'
  };

  return a.localeCompare(b, locales, options);
}