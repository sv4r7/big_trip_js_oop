import { AbstractStatefulView } from '../framework/view/abstract-stateful-view.js';
import { formatToTimeDateDual, formatToUtc } from '../util.js';
import { OFFER_BY_TYPE } from '../const.js';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';

const getCurrenPointId = (currentCityName, destinations) => {
  const cityName = destinations.find( (element) => element.name === currentCityName );
  return cityName.id;
};

const getCurrenPointDescription = (currentCityName, destinations, description) => {
  const destination = destinations.find( (element) => element.name === currentCityName );
  return destination?.description ?? description;
};

const createOffersForCurrentType = (currentPoint, offers) => {
  const currentOffers = offers.find( (element) => element.type === currentPoint.type);
  return currentOffers.offers.map( (offer) => ( {
    ...offer,
    checked: currentPoint.offers.includes(offer.id),
  } ) );
};

const getCurrentPointPhotos = (pictures) => pictures.map( (picture) => `<img class="event__photo" src="${ picture.src }" alt="${ picture.description }">`).join('');

const getButtonCancelName = (state, isDeleting) => {
  if (!state) {
    return 'Cancel';
  }
  if (isDeleting) {
    return 'Deleting...';
  }
  return 'Delete';
};

const renderButtonCancel = (state, isDisabled) => state ? `<button class="event__rollup-btn" type="button" ${ isDisabled ? 'disabled' : '' }>
  <span class="visually-hidden">Open event</span>` : '';

const createEventTypeItemTemplate = (currentType) => OFFER_BY_TYPE.map( (type) => `<input id="event-type-${ type }" 
  class="event__type-input  
  visually-hidden" type="radio" name="event-type" value="${ type }" ${ currentType === type ? 'checked' : '' }>
  <label class="event__type-label  event__type-label--${ type }" 
  for="event-type-${ type }">${ type }</label>` ).join('');

const createEventOffersTemplate = (waypointOffers, type) => waypointOffers.map( ( offer ) =>
  `<div class="event__offer-selector">
  <input class="event__offer-checkbox  visually-hidden" id="event-offer-${ type }-${ offer.id }" type="checkbox" name="event-offer-${ type }" value="${ offer.id }" ${ offer.checked ? 'checked' : '' }>
  <label class="event__offer-label" for="event-offer-${ type }-${ offer.id }">
  <span class="event__offer-title">${ offer.title }</span>
  &plus;&euro;&nbsp;
  <span class="event__offer-price">${ offer.price }</span>
  </label>
  </div>` ).join('');

const createDestinationsTemplate = (destinations, city, type) => (
  `<div class="event__field-group  event__field-group--destination">
    <label class="event__label  event__type-output" for="event-destination-1">
      ${ type }
    </label>
    <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${ he.encode(city) }" list="destination-list-1">
  <datalist id="destination-list-1">
  ${ destinations.map( (point) => `<option value="${ point }" ${ point === city ? 'checked' : '' }></option>` ).join('') }
  </datalist>
  </div>`);

const createEditFormElement = (state, destinations, offers, updateState) => {
  const { basePrice = '', dateFrom = dayjs() , dateTo = dayjs(), type, currentPointCityName, isDeleting, isDisabled, isSaving } = state;

  const allDestinationsCityNames = destinations.map( (cityName) => cityName.name);

  const currentPointDestination = destinations.filter( (element) => element.id === state.destination );
  const { description, name, pictures } = currentPointDestination[0];

  const generatedOffersForCurrentType = createOffersForCurrentType(state, offers);

  return (
    `<li class="trip-events__item">
<form class="event event--edit" action="#" method="post">
  <header class="event__header">
    <div class="event__type-wrapper">
      <label class="event__type  event__type-btn" for="event-type-toggle-1">
        <span class="visually-hidden">Choose event type</span>
        <img class="event__type-icon" width="17" height="17" src="img/icons/${ type }.png" alt="Event type icon">
      </label>
      <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

      <div class="event__type-list">
        <fieldset class="event__type-group">
          <legend class="visually-hidden">Event type</legend>

          <div class="event__type-item">
            ${ createEventTypeItemTemplate(type) }
          </div>
        </fieldset>
      </div>
    </div>
    ${ createDestinationsTemplate(allDestinationsCityNames, name, type ) } 
    <div class="event__field-group  event__field-group--time">
      <label class="visually-hidden" for="event-start-time-1">From</label>
      <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${ formatToTimeDateDual(dateFrom) }">
      &mdash;
      <label class="visually-hidden" for="event-end-time-1">To</label>
      <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${ formatToTimeDateDual(dateTo) }">
    </div>

    <div class="event__field-group  event__field-group--price">
      <label class="event__label" for="event-price-1">
        <span class="visually-hidden">Price</span>
        &euro;
      </label>
      <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value="${ basePrice }">
    </div>

    <button class="event__save-btn  btn  btn--blue" type="submit" ${ isDisabled ? 'disabled' : '' }>${ isSaving ? 'Saving...' : 'Save' }</button>
    <button class="event__reset-btn" type="reset" ${ isDisabled ? 'disabled' : '' }>${ getButtonCancelName(updateState, isDeleting) }</button>
    ${ renderButtonCancel(updateState, isDisabled) } 
  </header>
  <section class="event__details">
    <section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <div class="event__available-offers">  
      ${ createEventOffersTemplate(generatedOffersForCurrentType, type) }
      </div>
    </section>

    <section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${ getCurrenPointDescription(currentPointCityName, destinations, description) }</p>

      <div class="event__photos-container">
        <div class="event__photos-tape">
         ${ getCurrentPointPhotos(pictures) }
        </div>
      </div>
    </section>
  </section>
</form>
</li>`
  );
};

class EditFormView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #setDateFromPicker = null;
  #setDateToPicker = null;
  #updateState = null;

  constructor(point, destinations, offers) {
    super();
    this._state = EditFormView.parseWaypointDataToState(point);
    this.#destinations = destinations;
    this.#offers = offers;
    this.#getUpdateState(this._state.destination);

    if (!this._state.destination) {
      this._state.destination = destinations[0].id;
    }

    this.#setInnerHandlers();
  }

  get template() {
    return createEditFormElement(this._state, this.#destinations, this.#offers, this.#updateState);
  }

  reset = (point) => {
    this.updateElement(
      EditFormView.parseWaypointDataToState(point),
    );
  };

  setFormSubmitHandler(cb) {
    this._callback.formSubmit = cb;
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
  }

  setFormDeleteHandler(cb) {
    this._callback.formDelete = cb;
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formDeleteHandler);
  }

  setFormCancelHandler(cb) {
    if (this.#updateState) {
      this._callback.formCancel = cb;
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#formCancelHandler);
    }
  }

  removeElement = () => {
    super.removeElement();

    if (this.#setDateFromPicker) {
      this.#setDateFromPicker.destroy();
      this.#setDateFromPicker = null;
    }
    if (this.#setDateToPicker) {
      this.#setDateToPicker.destroy();
      this.#setDateToPicker = null;
    }
  };

  _restoreHandlers = () => {
    this.#setInnerHandlers();
    this.#setDatePicker();
    this.setFormCancelHandler(this._callback.formCancel);
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setFormDeleteHandler(this._callback.formDelete);
  };

  #getUpdateState = (stateId) => {
    this.#updateState = Boolean(stateId);
  };

  #setInnerHandlers = () => {
    this.element.querySelector('.event__type-list').addEventListener('change', this.#eventTypeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__available-offers').addEventListener('change', this.#currentOffersCheckHandler);
    this.element.querySelector('#event-price-1').addEventListener('change', this.#currentPriceChange);
    this.#setDatePicker();
  };

  #currentPriceChange = (evt) => {
    let currentPrice = +evt.target.value;
    if (currentPrice < 0) {
      currentPrice = Math.abs(currentPrice);
    }
    this.updateElement( {
      basePrice: currentPrice,
    } );
  };

  #checkOffers = (target) => {
    const currentStateOffers = this._state.offers.slice();
    const offerId = +target;
    if (currentStateOffers.includes(offerId) ) {
      const index = currentStateOffers.findIndex( (element) => element === offerId );
      return [...currentStateOffers.slice(0, index), ...currentStateOffers.slice(index + 1) ];
    }
    return [...currentStateOffers, offerId];
  };

  #currentOffersCheckHandler = (evt) => {
    const currentOfferId = evt.target.value;
    this.updateElement( {
      offers: this.#checkOffers(currentOfferId),
    } );
  };

  #destinationChangeHandler = (evt) => {
    const currentCityName = evt.target.value;
    const allDistinationNames = this.#destinations.map( (point) => point.name );
    if (!allDistinationNames.includes(currentCityName) ) {
      this.value = evt.target.defaultValue;
      return;
    }
    this.updateElement( {
      currentPointCityName: currentCityName,
      destination: getCurrenPointId(evt.target.value, this.#destinations),
    } );
  };

  #eventTypeChangeHandler = (evt) => {
    this.updateElement( {
      type: evt.target.value,
      offers: [],
    } );
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this._callback.formSubmit(EditFormView.parseStateToWaypointData(this._state) );
  };

  #formDeleteHandler = (evt) => {
    evt.preventDefault();
    this._callback.formDelete(EditFormView.parseStateToWaypointData(this._state) );
  };

  #formCancelHandler = () => {
    this._callback.formCancel();
  };

  #dateFromChangeHandler = ([selectedDate]) => {
    this.updateElement( {
      dateFrom: formatToUtc(selectedDate),
    } );
  };

  #dateToChangeHandler = ([selectedDate]) => {
    this.updateElement( {
      dateTo: formatToUtc(selectedDate),
    } );
  };

  #setDatePicker = () => {
    const { dateFrom, dateTo } = this._state;
    const startTime = this.element.querySelector('#event-start-time-1');
    const endTime = this.element.querySelector('#event-end-time-1');

    this.#setDateFromPicker = flatpickr(
      startTime,
      { enableTime: true,
        dateFormat: 'd/m/y H:i',
        'time_24hr': true,
        defaultDate: formatToTimeDateDual(dateFrom),
        onChange: this.#dateFromChangeHandler,
        minDate: 'today',
      },
    );

    this.#setDateToPicker = flatpickr(
      endTime,
      { enableTime: true,
        dateFormat: 'd/m/y H:i',
        'time_24hr': true,
        defaultDate: formatToTimeDateDual(dateTo),
        onChange: this.#dateToChangeHandler,
        minDate: this.#setDateFromPicker.selectedDates[0],
      },
    );

    this.#setDateFromPicker.config.onChange.push( () => {
      this.#setDateToPicker.set('minDate', this.#setDateFromPicker.selectedDates[0] );
    } );

    if (dayjs(this.#setDateFromPicker.selectedDates[0] ).isAfter(dayjs(this.#setDateToPicker.selectedDates[0] ) ) ) {
      this.#setDateToPicker.setDate(this.#setDateFromPicker.selectedDates[0] );
    }

  };

  static parseWaypointDataToState = (point) => (
    {
      ...point,
      currentPointCityName: null,
      isDisabled: false,
      isDeleting: false,
      isSaving: false,
    }
  );

  static parseStateToWaypointData = (state) => {
    const waypointData = {...state};
    delete waypointData.currentPointCityName;
    delete waypointData.isDeleting;
    delete waypointData.isSaving;
    delete waypointData.isDisabled;
    return waypointData;
  };

}

export { EditFormView };
