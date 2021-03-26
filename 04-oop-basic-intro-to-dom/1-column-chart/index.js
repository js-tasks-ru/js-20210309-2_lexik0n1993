export default class ColumnChart {
  constructor({
    data = [],
    label = '',
    link = '',
    value = 0
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.chartHeight = 50;

    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="column-chart ${this.data.length === 0 ? 'column-chart_loading' : ''}" style="--chart-height: 50">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ``}
        </div>

        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.value}</div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;
    this.renderCharts();
  }

  renderCharts() {
    const maxValue = Math.max(...this.data);

    const body = this.data.map(item => {
      const percent = (item / maxValue * 100).toFixed(0);
      const value = Math.floor(item * 50 / maxValue);

      return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
    }).join(``);

    this.element.querySelector('.column-chart__chart').innerHTML = body;
  }

  update(newData) {
    this.data = newData;

    this.renderBody();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
