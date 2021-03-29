export default class NotificationMessage {
  constructor(message, {
    duration = 2000,
    type = 'success'
  } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    if (NotificationMessage.instance) {
      this.element = NotificationMessage.instance.element;

      this.destroy();
      NotificationMessage.instance = null;
    }
    
    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header" data-element="header">${this.type}</div>
          <div class="notification-body" data-element="body">
            ${this.message}
          </div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;
    NotificationMessage.instance = this;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  show(container = document.body) {
    container.append(this.element);
    this.timer = setTimeout(this.destroy.bind(this), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    clearTimeout(this.timer);
  }

}
