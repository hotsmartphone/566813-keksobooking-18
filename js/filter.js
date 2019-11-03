'use strict';

// Модуль FILTER.JS
(function () {
  var housingTypeFilter = document.querySelector('#housing-type');
  var priceFilter = document.querySelector('#housing-price');
  var roomsNumbersFilter = document.querySelector('#housing-rooms');
  var guestsFilter = document.querySelector('#housing-guests');

  window.MAX_SHOWN_PINS = 5;
  var PRICE_CHOISES = {// middle - то, что между low и high
    low: 10000,
    high: 50000
  };

  var selectedFilters = {
    housingType: 'any',
    price: 'any',
    rooms: 'any',
    guests: 'any',
    features: {
      wifi: false,
      dishwasher: false,
      parking: false,
      washer: false,
      elevator: false,
      conditioner: false
    }
  };

  var updateAdvs = function () {
    window.map.checkAndClosePopup();
    window.map.removePins();

    var filteredAdvs = window.map.advsList.slice();

    var filterHousingTypePins = function () {
      if (selectedFilters.housingType === 'any') {
        return;
      } else {
        filteredAdvs = filteredAdvs.filter(function (adv) {
          return adv.offer.type === selectedFilters.housingType;
        });
      }
      return;
    };

    var filterPricePins = function () {
      if (selectedFilters.price === 'any') {
        return;
      } else if (selectedFilters.price === 'low') {
        filteredAdvs = filteredAdvs.filter(function (adv) {
          return adv.offer.price < PRICE_CHOISES.low;
        });
      } else if (selectedFilters.price === 'high') {
        filteredAdvs = filteredAdvs.filter(function (adv) {
          return adv.offer.price >= PRICE_CHOISES.high;
        });
      } else {
        filteredAdvs = filteredAdvs.filter(function (adv) {
          return ((adv.offer.price >= PRICE_CHOISES.low) && (adv.offer.price < PRICE_CHOISES.high));
        });
      }
      return;
    };

    var filterNumbersRooms = function () {
      if (selectedFilters.rooms === 'any') {
        return;
      } else {
        filteredAdvs = filteredAdvs.filter(function (adv) {
          return adv.offer.rooms.toString() === selectedFilters.rooms;
        });
      }
      return;
    };

    var filterNumbersGuests = function () {
      if (selectedFilters.guests === 'any') {
        return;
      } else {
        filteredAdvs = filteredAdvs.filter(function (adv) {
          return adv.offer.guests.toString() === selectedFilters.guests;
        });
      }
      return;
    };

    var filterFeatures = function () { // Функция фильтрации удобств
      for (var key in selectedFilters.features) {
        if (selectedFilters.features[key] === true) {
          filteredAdvs = filteredAdvs.filter(function (adv) {
            return adv.offer.features.includes(key);
          });
        }
      }
    };

    filterHousingTypePins();
    filterPricePins();
    filterNumbersRooms();
    filterNumbersGuests();
    filterFeatures();

    window.map.activeAdvs = filteredAdvs.slice(0, window.MAX_SHOWN_PINS);
    window.map.drawPins(window.map.activeAdvs);
  };

  var debouncedUpdateAdvs = window.debounce(updateAdvs);

  housingTypeFilter.addEventListener('change', function (evt) {
    selectedFilters.housingType = evt.target.value;
    debouncedUpdateAdvs();
  });

  priceFilter.addEventListener('change', function (evt) {
    selectedFilters.price = evt.target.value;
    debouncedUpdateAdvs();
  });

  roomsNumbersFilter.addEventListener('change', function (evt) {
    selectedFilters.rooms = evt.target.value;
    debouncedUpdateAdvs();
  });

  guestsFilter.addEventListener('change', function (evt) {
    selectedFilters.guests = evt.target.value;
    debouncedUpdateAdvs();
  });


  var addFeaturesListeners = function () { // Функция вешает обработчик событий на каждый из шести чекбоксов
    var featuresInput = document.querySelectorAll('[id^=filter-]');
    for (var i = 0; i < featuresInput.length; i++) {
      featuresInput[i].addEventListener('change', function (evt) {
        selectedFilters.features[evt.target.value] = evt.target.checked;
        debouncedUpdateAdvs();
      });
    }
  };

  addFeaturesListeners();
})();
