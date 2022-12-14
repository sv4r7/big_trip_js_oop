import { AbstractView } from '../framework/view/abstract-view.js';

const createNewFormFilterItemTemplate = (filter, currentFilterType) => {
  const { type, name, count } = filter;

  return (
    `<div class="trip-filters__filter">
    <input id="filter-${ name }" 
    class="trip-filters__filter-input  visually-hidden" 
    type="radio" name="trip-filter" 
    value="${ name }" 
    ${ type === currentFilterType ? 'checked' : '' }
    ${ count === 0 ? 'disabled' : '' }
    >
    <label class="trip-filters__filter-label" 
    for="filter-${ name }">${ name }</label>
  </div>`
  );
};

const createNewFormFiltersTemplate = (filterItems, currentFilterType) => {
  const filterItemsTemplate = filterItems
    .map( (filter) => createNewFormFilterItemTemplate(filter, currentFilterType) )
    .join('');

  return (
    `<form class="trip-filters" action="#" method="get">
    ${ filterItemsTemplate }
<button class="visually-hidden" type="submit">Accept filter</button>
</form>`
  );
};

class FormFiltersView extends AbstractView {
  #filters = null;
  #currentFilter = null;

  constructor (filters, currentFilterType) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilterType;

  }

  get template() {
    return createNewFormFiltersTemplate(this.#filters, this.#currentFilter);
  }

  setFilterTypeChangeHandler = (cb) => {
    this._callback.filterTypeChange = cb;
    this.element.addEventListener('change', this.#filterTypeChangeHandler);
  };

  #filterTypeChangeHandler = (evt) => {
    evt.preventDefault();
    this._callback.filterTypeChange(evt.target.value);
  };

}

export { FormFiltersView };

