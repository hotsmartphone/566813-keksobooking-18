'use strict';

// МОДУЛЬ MAP.JS
(function () {
  // Переменная, в которую записывается массив объявлений, полученных от сервера
  var advsList;

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
  var drawCards = function (adv) {
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
        advForm.classList.remove('ad-form--disabled');
      }
    } else {
      for (var j = 0; j < formInputsSelectors.length; j++) {
        formInputsSelectors[j].disabled = true;
      }
    }
  }

  switchActiveForm(false);

  // Функция обработки объявлений при их успешной загрузке с сервера
  var successHandler = function (advs) {
    drawPins(advs);
    advsList = advs;
  };

  // Функция обработки ошибок при загрузке объявлений с сервера
  var errorHandler = function (errorMessage) {
    var errorTemplate = document.querySelector('#error').content;
    var cloneError = errorTemplate.cloneNode(true);
    var errorButton = cloneError.querySelector('.error__button');

    cloneError.querySelector('.error__message').textContent = errorMessage;

    var pageReload = function () {
      location.reload(true);
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
    mapActive.classList.remove('map--faded');
    switchActiveForm(true);
    window.load(successHandler, errorHandler);
    setMainPinAddress(true);
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

  // Функция открытия карточки с обработчиками событий
  function openPopup(target) {
    if (document.querySelector('.popup')) {
      document.querySelector('.popup').remove();
    }
    window.map.drawCards(advsList[target.id]);

    var popup = document.querySelector('.popup');
    var popupClose = document.querySelector('.popup__close');


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
    // Функция обработчика закрытия
    var closePopup = function () {
      popup.remove();
      document.removeEventListener('keydown', onPopupEscPress);
    };
    // Обработчик событий на закрытие окна
    popupClose.addEventListener('click', function () {
      closePopup();
    });
    // Закрытие карточки по ENTER
    popupClose.addEventListener('keydown', onPopupCloseEnterPress);
    // Закрытие карточки по Esc
    document.addEventListener('keydown', onPopupEscPress);
  }

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

  window.map = {
    mapPins: mapPins,
    mainPin: mainPin,
    pinAddress: pinAddress,
    advForm: advForm,
    drawPins: drawPins,
    drawCards: drawCards,
    setMainPinAddress: setMainPinAddress
  };
})();
