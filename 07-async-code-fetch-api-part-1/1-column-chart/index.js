import fetchJson from './utils/fetch-json.js';

export default class ColumnChart {
  element = null;
  subElements = {};
  chartHeight = 50;
  baseUrl = `https://course-js.javascript.ru`;

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date()
    },
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = data => `${data}`
  } = {}) {
    this.url = url;
    this.range = range;
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>

        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : ``;
  }

  getColumnBody(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data
      .map(item => {
        const percent = (item / maxValue * 100).toFixed(0);

        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

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

  async update(startDate, endDate) {
    this.startLoading();

    const url = new URL(this.url, this.baseUrl);

    url.searchParams.set('from', startDate.toJSON());
    url.searchParams.set('to', endDate.toJSON());

    const response = await fetchJson(url.href);
    
    this.data = Object.values(response);
    
    this.subElements.body.innerHTML = this.getColumnBody(this.data);
    this.subElements.header.innerHTML = this.setHeader();

    this.finishLoading();
  }

  startLoading() {
    this.element.classList.add('column-chart_loading');
  }

  finishLoading() {
    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }
  }

  setHeader() {
    this.value = this.data.reduce((accum, item) => accum + item);

    return `${this.formatHeading(this.value)}`;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    if (this.element) {
      this.remove();
      this.element = null;
    }

    this.subElements = {};
  }
}
