class Tooltip {

  showTooltip = event => {
    event.stopPropagation();

    const textContent = event.target.dataset.tooltip;

    this.render(textContent);

    event.target.addEventListener('pointermove', this.moveTooltip);
  }

  hideTooltip = event => {
    event.target.removeEventListener('pointermove', this.moveTooltip);

    this.remove();
  }

  moveTooltip = event => {
    const {clientX, clientY} = event;

    this.setTooltipPosition(clientX, clientY);
  }

  constructor() {
    if (Tooltip.instance) {
      Tooltip.instance.remove();
    }
  }

  get getTooltipElements() {
    const tooltipElements = document.querySelectorAll(`[data-tooltip]`);

    return [...tooltipElements];
  }

  initialize() {
    Tooltip.instance = this;

    this.tooltipElements = this.getTooltipElements;
    this.addListeners();
  }

  render(textContent = '') {
    const element = document.createElement('div');

    element.innerHTML = this.getTooltipBody(textContent);

    this.element = element.firstElementChild;

    document.body.append(this.element);
  }

  addListeners() {
    this.tooltipElements.forEach(tooltipElement => {
      tooltipElement.addEventListener('pointerover', this.showTooltip);
    });

    this.tooltipElements.forEach(tooltipElement => {
      tooltipElement.addEventListener('pointerout', this.hideTooltip);
    });
  }

  getTooltipBody(textContent) {
    return `<div class="tooltip">${textContent}</div>`;
  }

  setTooltipPosition(posX, posY) {
    this.element.style.left = `${posX + 10}px`;
    this.element.style.top = `${posY + 10}px`;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    Tooltip.instance = null;
  }
}

const tooltip = new Tooltip();

export default tooltip;
