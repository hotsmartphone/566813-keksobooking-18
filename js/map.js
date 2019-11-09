'use strict';

// МОДУЛЬ MAP.JS
(function () {
  // Размеры главного пина
  var MAIN_PIN_WIDTH = 65;
  var MAIN_PIN_HEIGHT = 65;
  var MAIN_PIN_HEIGHT_POINT = 79;

  var mapPins = document.querySelector('.map__pins');

  // Значения, для определния границ перемещения метки
  var MIN_HEIGHT_ADDRESS = 130;
  var MAX_HEIGHT_ADDRESS = 630;
  var MIN_HEIGHT_PIN_MOVE = MIN_HEIGHT_ADDRESS - MAIN_PIN_HEIGHT_POINT;
  var MAX_HEIGHT_PIN_MOVE = MAX_HEIGHT_ADDRESS - MAIN_PIN_HEIGHT_POINT;
  var MIN_WIDTH_PIN_MOVE = 0 - MAIN_PIN_WIDTH / 2;
  var MAX_WIDTH_PIN_MOVE = mapPins.offsetWidth - MAIN_PIN_WIDTH / 2;

  var advsList = []; // Переменная, в которую записывается весь массив объявлений, полученных от сервера
  var activeAdvs = []; // Переменная с актвным массивом объявлений (после фильтрации и отсечения)

  // Отрисовываем пины


  var drawPins = function (advs) {
    var fragment = document.createDocumentFragment();

    advs.forEach(function (it) {
      fragment.appendChild(window.pin.renderPin(it, advs.indexOf(it)));
    });
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
  var switchActiveForm = function (boolean) {
    var formInputsSelectors = document.querySelectorAll('.ad-form fieldset, .map__filters fieldset, .map__filters select');
    if (boolean) {
      formInputsSelectors.forEach(function (it) {
        it.disabled = false;
      });
      advForm.classList.remove('ad-form--disabled');
    } else {
      formInputsSelectors.forEach(function (it) {
        it.disabled = true;
      });
      advForm.classList.add('ad-form--disabled');
    }
  };

  switchActiveForm(false);

  // Функция обработки объявлений при их успешной загрузке с сервера
  var successDownloadHandler = function (advs) {
    window.map.advsList = advs.slice().filter(function (it) { // Фильтруем полученные данные - убираем объявления, у которых нет offer
      return it.offer;
    });
    window.map.activeAdvs = window.map.advsList.slice(0, window.MAX_SHOWN_PINS);
    drawPins(window.map.activeAdvs);
    mapActive.classList.remove('map--faded');
  };

  // Функция обработки ошибок при загрузке объявлений с сервера
  var errorDownloadHandler = function (errorMessage) {
    var errorTemplate = document.querySelector('#error').content;
    var cloneError = errorTemplate.cloneNode(true);
    var errorButton = cloneError.querySelector('.error__button');

    cloneError.querySelector('.error__message').textContent = errorMessage;

    var onErrorButtonClick = function () {
      location.reload(true);
      errorButton.removeEventListener('click', onErrorButtonClick);
      errorButton.removeEventListener('keydown', onErrorButtonEnterPress);
    };

    var onErrorButtonEnterPress = function (evt) {
      if (evt.keyCode === window.util.ENTER_KEYCODE) {
        onErrorButtonClick();
      }
    };

    errorButton.addEventListener('click', onErrorButtonClick);
    errorButton.addEventListener('keydown', onErrorButtonEnterPress);

    document.querySelector('main').append(cloneError);
    errorButton.focus();
  };

  // Фнукция включения активного состояния
  var onMainPinClick = function () {
    window.load('GET', 'https://js.dump.academy/keksobooking/data', successDownloadHandler, errorDownloadHandler);
    switchActiveForm(true);
    setMainPinAddress(true);
    window.form.setNumbersPlacesOption(window.form.roomNumber.querySelector('option:checked').value); // Запускаем фнукцию установки разрешенного количества мест сразу, чтобы пользователь случайно не отправил невалидные данные
    window.form.setMinPricePlaceholder(window.form.housingTypeAdv.querySelector('option:checked').value);
    mainPin.removeEventListener('mousedown', onMainPinClick);
    mainPin.removeEventListener('keydown', onMainPinEnterPress);
  };

  var onMainPinEnterPress = function (evt) {
    if (evt.keyCode === window.util.ENTER_KEYCODE) {
      onMainPinClick();
    }
  };

  mainPin.addEventListener('mousedown', onMainPinClick);
  mainPin.addEventListener('keydown', onMainPinEnterPress);

  // Открытие и закрытие карточек объявлений

  // Функция, которая определяет, на пине сработал клик или нет и запускает фнукцию открытия соответствующей карточки
  var onMapPinsClick = function (evt) {
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
      onPopupCloseClick();
    }
  };

  // Функция обработчика закрытия
  var onPopupCloseClick = function () {
    popup = document.querySelector('.popup');
    removeListeners();
    popup.remove();
    activePin.classList.remove('map__pin--active');
  };

  var removeListeners = function () {
    popupClose = document.querySelector('.popup__close');
    // Удаляю все обработчики
    popupClose.removeEventListener('click', onPopupCloseClick);
    popupClose.removeEventListener('keydown', onPopupCloseEnterPress);
    document.removeEventListener('keydown', onPopupEscPress);
  };

  var onPopupEscPress = function (evt) {
    if (evt.keyCode === window.util.ESC_KEYCODE) {
      onPopupCloseClick();
    }
  };

  var onPopupCloseEnterPress = function (evt) {
    if (evt.keyCode === window.util.ENTER_KEYCODE) {
      onPopupCloseClick();
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
    popupClose.addEventListener('click', onPopupCloseClick);
    // Закрытие карточки по ENTER
    popupClose.addEventListener('keydown', onPopupCloseEnterPress);
    // Закрытие карточки по Esc
    document.addEventListener('keydown', onPopupEscPress);
  };

  mapPins.addEventListener('click', onMapPinsClick);

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
    pins.forEach(function (it) {
      if (it !== mainPin) {
        it.remove();
      }
    });
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
    onMainPinClick: onMainPinClick,
    onMainPinEnterPress: onMainPinEnterPress,
    mapActive: mapActive,
    removePins: removePins
  };
})();
