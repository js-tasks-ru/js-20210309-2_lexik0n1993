export default class SortableTable {
  imgDefaultTemplate = (data = []) => {
    return `
      <div class="sortable-table__cell">
        <img class="sortable-table-image" alt="Image" src="${data[0]?.url}">
      </div>
    `
  };

  constructor(header = [], { data = [] }) {
    this.headerData = header;
    this.data = data;
    this.headerTitles = this.headerData.map(item => item.id);
    this.getImgCell = this.headerTitles.find(item => item === 'images') &&
                      this.headerTitles.find(item => item === 'images').template ||
                      this.imgDefaultTemplate;
    
    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getHeader()}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.getBody(this.data)}
          </div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  buildHeader() {
    this.subElements.header.innerHTML = this.getHeader();
  }

  getHeader() {
    return this.headerData.map(({
      id,
      title,
      sortable
    }) => `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order>
        <span>${title}</span>
      </div>
    `).join(``)
  }

  buildBody(data) {
    this.subElements.body.innerHTML = this.getBody(data);
  }

  getBody(data) {
    return data.map(dataItem => {
      const {
        id,
        images = []
      } = dataItem;

      return `
        <a href="/products/${id}" class="sortable-table__row">
          ${this.headerTitles
            .map(headerTitle => {
              if (headerTitle === 'images') {
                return this.getImgCell(images);
              } else {
                const cellContent = dataItem[headerTitle] || ``;
                
                return `
                  <div class="sortable-table__cell">${cellContent}</div>
                `;
              } 
            })
            .join(``)}
        </a>
      `;
    }).join(``);
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
          this.compareStrings(secondEl[field], firstEl[field]) :
          this.compareStrings(firstEl[field], secondEl[field])
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

  compareStrings(a, b) {
    const locales = ['ru-u-kf-upper', 'en-u-kf-upper'];
    const options = {
      sensitivity: 'variant'
    };
  
    return a.localeCompare(b, locales, options);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}