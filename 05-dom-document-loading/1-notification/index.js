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
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;
    NotificationMessage.instance = this;
    this.getSubElements();
  }

  getSubElements() {
    this.header = this.element.querySelector('.notification-header');
    this.body = this.element.querySelector('.notification-body');
  }

  show(container = document.body) {
    container.appendChild(this.element);
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
