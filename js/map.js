'use strict';

// МОДУЛЬ MAP.JS
(function () {
  var advsList = []; // Переменная, в которую записывается весь массив объявлений, полученных от сервера
  var activeAdvs = []; // Переменная с актвным массивом объявлений (после фильтрации и отсечения)

  // Отрисовываем пины
  var mapPins = document.querySelector('.map__pins');

  var drawPins = function (advs) {
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < advs.length; i++) {
      fragment.appendChild(window.pin.renderPin(advs[i], i));
    }
    return mapPins.appendChild(fragment);
  };

  // Отрисовываем карточки
  var drawCard = function (adv) {
    var mapFilters = document.querySelector('.map__filters-container'); // Перед данным разделом добавляются карточки
    var fragment = document.createDocumentFragment();

    fragment.appendChild(window.card.renderCard(adv));

    return mapFilters.before(fragment);
  };

  // Вычисляем адресс главного пина
  var MAIN_PIN_WIDTH = 65;
  var MAIN_PIN_HEIGHT = 65;
  var MAIN_PIN_HEIGHT_POINT = 79;
  var pinAddress = document.querySelector('#address');

  var getMainPinAddress = function (isActiveBoolean) {
    var mainPinAdress = {
      x: Math.round(mainPin.getBoundingClientRect().left - mapPins.getBoundingClientRect().left + MAIN_PIN_WIDTH / 2) // x всегда одинаковый
    };
    if (isActiveBoolean) {
      mainPinAdress.y = Math.round(mainPin.getBoundingClientRect().top - mapPins.getBoundingClientRect().top + MAIN_PIN_HEIGHT_POINT);
    } else {
      mainPinAdress.y = Math.round(mainPin.getBoundingClientRect().top - mapPins.getBoundingClientRect().top + MAIN_PIN_HEIGHT / 2);
    }
    return mainPinAdress;
    // ..console.log(mainPinAdress);
  };

  var setMainPinAddress = function (isActiveBoolean) {
    var coordinates = getMainPinAddress(isActiveBoolean);
    pinAddress.setAttribute('value', coordinates.x + ', ' + coordinates.y);
  };

  // Делаем карту активной
  var mapActive = document.querySelector('.map');
  var mainPin = document.querySelector('.map__pin--main');
  var advForm = document.querySelector('.ad-form');

  // Функция переключения режима полей форм (активный/неактивный)
  function switchActiveForm(boolean) {
    var formInputsSelectors = document.querySelectorAll('.ad-form fieldset, .map__filters fieldset, .map__filters select');
    if (boolean === true) {
      for (var i = 0; i < formInputsSelectors.length; i++) {
        formInputsSelectors[i].disabled = false;
      }
      advForm.classList.remove('ad-form--disabled');
    } else {
      for (var j = 0; j < formInputsSelectors.length; j++) {
        formInputsSelectors[j].disabled = true;
      }
      advForm.classList.add('ad-form--disabled');
    }
  }

  switchActiveForm(false);

  // Функция обработки объявлений при их успешной загрузке с сервера
  var successDownloadHandler = function (advs) {
    window.map.advsList = advs.slice().filter(function (it) { // Фильтруем полученные данные - убираем объявления, у которых нет offer
      return it.offer;
    });
    window.map.activeAdvs = window.map.advsList.slice(0, window.MAX_SHOWN_PINS);
    drawPins(window.map.activeAdvs);
  };

  // Функция обработки ошибок при загрузке объявлений с сервера
  var errorDownloadHandler = function (errorMessage) {
    var errorTemplate = document.querySelector('#error').content;
    var cloneError = errorTemplate.cloneNode(true);
    var errorButton = cloneError.querySelector('.error__button');

    cloneError.querySelector('.error__message').textContent = errorMessage;

    var pageReload = function () {
      location.reload(true);
      errorButton.removeEventListener('click', pageReload);
      errorButton.removeEventListener('keydown', onErrorButtonEnterPress);
    };

    var onErrorButtonEnterPress = function (evt) {
      if (evt.keyCode === window.util.ENTER_KEYCODE) {
        pageReload();
      }
    };

    errorButton.addEventListener('click', pageReload);
    errorButton.addEventListener('keydown', onErrorButtonEnterPress);

    document.querySelector('main').append(cloneError);
    errorButton.focus();
  };

  // Фнукция включения активного состояния
  var mainPinClickHandler = function () {
    window.load('GET', 'https://js.dump.academy/keksobooking/data', successDownloadHandler, errorDownloadHandler);
    mapActive.classList.remove('map--faded');
    switchActiveForm(true);
    setMainPinAddress(true);
    window.form.setNumbersPlacesOption(window.form.roomNumber.querySelector('option:checked').value); // Запускаем фнукцию установки разрешенного количества мест сразу, чтобы пользователь случайно не отправил невалидные данные
    window.form.setMinPricePlaceholder(window.form.housingTypeAdv.querySelector('option:checked').value);
    mainPin.removeEventListener('mousedown', mainPinClickHandler);
    mainPin.removeEventListener('keydown', mainPinEnterPressHandler);
  };

  var mainPinEnterPressHandler = function (evt) {
    if (evt.keyCode === window.util.ENTER_KEYCODE) {
      mainPinClickHandler();
    }
  };

  mainPin.addEventListener('mousedown', mainPinClickHandler);
  mainPin.addEventListener('keydown', mainPinEnterPressHandler);

  // Открытие и закрытие карточек объявлений

  // Функция, которая определяет, на пине сработал клик или нет и запускает фнукцию открытия соответствующей карточки
  var pinClickHandler = function (evt) {
    var target = evt.target;
    while (target !== mapPins) {
      if (target.className === 'map__pin' && target.id) {
        openPopup(target);
        return;
      }
      target = target.parentNode;
    }
  };

  var popup;
  var popupClose;
  var activePin;

  var checkAndClosePopup = function () {
    if (document.querySelector('.popup')) {
      closePopup();
    }
  };

  // Функция обработчика закрытия
  var closePopup = function () {
    popup = document.querySelector('.popup');
    removeListeners();
    popup.remove();
    activePin.classList.remove('map__pin--active');
  };

  var removeListeners = function () {
    popupClose = document.querySelector('.popup__close');
    // Удаляю все обработчики
    popupClose.removeEventListener('click', closePopup);
    popupClose.removeEventListener('keydown', onPopupCloseEnterPress);
    document.removeEventListener('keydown', onPopupEscPress);
  };

  var onPopupEscPress = function (evt) {
    if (evt.keyCode === window.util.ESC_KEYCODE) {
      closePopup();
    }
  };

  var onPopupCloseEnterPress = function (evt) {
    if (evt.keyCode === window.util.ENTER_KEYCODE) {
      closePopup();
    }
  };

  // Функция открытия карточки с обработчиками событий
  var openPopup = function (target) {
    checkAndClosePopup();

    activePin = target;

    drawCard(window.map.activeAdvs[target.id]);

    activePin.classList.add('map__pin--active');

    popupClose = document.querySelector('.popup__close');

    // Обработчик событий на закрытие окна при клике на крестик
    popupClose.addEventListener('click', closePopup);
    // Закрытие карточки по ENTER
    popupClose.addEventListener('keydown', onPopupCloseEnterPress);
    // Закрытие карточки по Esc
    document.addEventListener('keydown', onPopupEscPress);
  };

  mapPins.addEventListener('click', pinClickHandler);

  // Передвижение метки
  mainPin.addEventListener('mousedown', function (evt) {
    evt.preventDefault();

    var startCoords = {
      x: evt.clientX,
      y: evt.clientY
    };

    var onMouseMove = function (moveEvt) {
      moveEvt.preventDefault();

      var shift = {
        x: startCoords.x - moveEvt.clientX,
        y: startCoords.y - moveEvt.clientY
      };

      startCoords = {
        x: moveEvt.clientX,
        y: moveEvt.clientY
      };
      var MIN_HEIGHT_ADDRESS = 130;
      var MAX_HEIGHT_ADDRESS = 630;
      var MIN_HEIGHT_PIN_MOVE = MIN_HEIGHT_ADDRESS - MAIN_PIN_HEIGHT_POINT;
      var MAX_HEIGHT_PIN_MOVE = MAX_HEIGHT_ADDRESS - MAIN_PIN_HEIGHT_POINT;
      var MIN_WIDTH_PIN_MOVE = 0 - MAIN_PIN_WIDTH / 2;
      var MAX_WIDTH_PIN_MOVE = mapPins.offsetWidth - MAIN_PIN_WIDTH / 2;


      mainPin.style.left = Math.max(MIN_WIDTH_PIN_MOVE, Math.min(mainPin.offsetLeft - shift.x, MAX_WIDTH_PIN_MOVE)) + 'px';
      mainPin.style.top = Math.max(MIN_HEIGHT_PIN_MOVE, Math.min(mainPin.offsetTop - shift.y, MAX_HEIGHT_PIN_MOVE)) + 'px';

      setMainPinAddress(true);
    };

    var onMouseUp = function (upEvt) {
      upEvt.preventDefault();
      setMainPinAddress(true);

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // Удаляем все пины, кроме главного
  var removePins = function () {
    var pins = document.querySelectorAll('.map__pin');
    for (var i = 0; i < pins.length; i++) {
      if (pins[i] !== mainPin) {
        pins[i].remove();
      }
    }
  };

  window.map = {
    advsList: advsList,
    activeAdvs: activeAdvs,
    checkAndClosePopup: checkAndClosePopup,
    mapPins: mapPins,
    mainPin: mainPin,
    pinAddress: pinAddress,
    advForm: advForm,
    drawPins: drawPins,
    setMainPinAddress: setMainPinAddress,
    switchActiveForm: switchActiveForm,
    mainPinClickHandler: mainPinClickHandler,
    mainPinEnterPressHandler: mainPinClickHandler,
    mapActive: mapActive,
    removePins: removePins
  };
})();
