export default class SortableList {
  onPointerDown = ({ target }) => {
    if (target.closest('[data-delete-handle]')) {
      this.removeItem(target);
    }

    if (target.closest('[data-grab-handle]')) {
      target.addEventListener('dragstart', evt => {
        evt.preventDefault();
      });

      this.startDragItem(target);
    }
  }

  onPointerMove = ({ clientX, clientY }) => {
    const dragItemTop = clientY - this.sizes.height / 2;
    const dragItemLeft = clientX - this.sizes.shiftX;

    this.dragItem.style.top = `${dragItemTop}px`;
    this.dragItem.style.left = `${dragItemLeft}px`;
    this.dragItem.style.display = 'none';

    const elementBelow = document.elementFromPoint(clientX, clientY);
    const sortableItemBelow = elementBelow.closest(`.sortable-list__item`);

    if (sortableItemBelow) {
      const {
        top: topBoundry
      } = sortableItemBelow.getBoundingClientRect();
      const {
        top: topPlaceholder
      } = this.placeholder.getBoundingClientRect();

      if (dragItemTop > topBoundry) {
        this.placeholder.before(sortableItemBelow);
      }

      if (topBoundry > dragItemTop && topBoundry < topPlaceholder) {
        sortableItemBelow.before(this.placeholder);
      }
    } 
    
    this.dragItem.style.display = '';
  }

  onPointerUp = () => {
    this.stopDragItem();

    document.removeEventListener('pointermove', this.onPointerMove);    
    this.element.removeEventListener('pointerup', this.onPointerUp);
  }

  constructor({ items = [] }) {
    this.items = items;

    this.render();
  }

  get getPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.classList.add('sortable-list__placeholder');

    placeholder.style.width = `${this.sizes.width}px`;
    placeholder.style.height = `${this.sizes.height}px`;

    return placeholder;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = `<ul class="sortable-list" data-element="sortable-list"></ul>`;

    this.element = element.firstElementChild;

    this.addItemsToList();
    this.addEventListeners();
  }

  addItemsToList() {
    this.items.forEach(item => {
      item.classList.add(`sortable-list__item`);
      this.element.append(item);
    });
  }

  addEventListeners() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  removeItem(target) {
    target.closest(`.sortable-list__item`).remove();
  }

  startDragItem(target) {
    this.dragItem = target.closest(`.sortable-list__item`);

    const { top, left, width, height } = this.dragItem.getBoundingClientRect();
    this.sizes = {
      top,
      left,
      width,
      height,
      shiftX: target.offsetLeft
    };
    
    this.placeholder = this.getPlaceholder;
    
    this.element.replaceChild(this.placeholder, this.dragItem);
    this.element.append(this.dragItem);

    this.dragItem.classList.add(`sortable-list__item_dragging`);
    this.dragItem.style.width = `${width}px`;
    this.dragItem.style.height = `${height}px`;
    this.dragItem.style.top = `${top}px`;
    this.dragItem.style.left = `${left}px`;

    document.addEventListener('pointermove', this.onPointerMove);    
    this.element.addEventListener('pointerup', this.onPointerUp);
  }

  stopDragItem() {
    this.dragItem.style.cssText = ``;

    this.sizes = {};

    this.dragItem.classList.remove(`sortable-list__item_dragging`);
    this.element.replaceChild(this.dragItem, this.placeholder);

    this.placeholder.remove();
    this.placeholder = null;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    document.removeEventListener('pointermove', this.onPointerMove);
  }
}
