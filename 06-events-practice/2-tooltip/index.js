class Tooltip {

  showTooltip = event => {
    event.stopPropagation();

    const data = event.target.dataset;
    
    if (data.tooltip) {
      const textContent = data.tooltip;

      this.render(textContent);
  
      document.addEventListener('pointermove', this.moveTooltip);
    }    
  }

  hideTooltip = event => {
    if (event.target.dataset.tooltip) {
      document.removeEventListener('pointermove', this.moveTooltip);

      this.remove();
    }    
  }

  moveTooltip = event => {
    const {clientX, clientY} = event;

    this.setTooltipPosition(clientX, clientY);
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initialize() {
    this.addListeners();
  }

  render(textContent = '') {
    const element = document.createElement('div');

    element.innerHTML = this.getTooltipBody(textContent);

    this.element = element.firstElementChild;

    document.body.append(this.element);
  }

  addListeners() {
    document.addEventListener('pointerover', this.showTooltip);
    document.addEventListener('pointerout', this.hideTooltip);
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
