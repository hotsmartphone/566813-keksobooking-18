'use strict';

// МОДУЛЬ MAP.JS
(function () {
  // Отрисовываем пины
  var mapPins = document.querySelector('.map__pins');

  var drawPins = function (advsList) {
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < advsList.length; i++) {
      fragment.appendChild(window.pin.renderPin(advsList[i], i));
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
  var MAIN_PIN_WIDTH = 62;
  var MAIN_PIN_HEIGHT = 62;
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

  var randomAdvs = window.data.getRandomAdvs(window.data.NUMBER_OF_ADVS);

  var mainPinClickHandler = function () {
    mapActive.classList.remove('map--faded');
    switchActiveForm(true);
    window.map.drawPins(randomAdvs);
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
        testFunc(target);
        return;
      }
      target = target.parentNode;
    }
  };

  // Функция открытия карточки с обработчиками событий
  function testFunc(target) {
    if (document.querySelector('.popup')) {
      document.querySelector('.popup').remove();
    }
    window.map.drawCards(randomAdvs[target.id]);

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

  window.map = {
    mapPins: mapPins,
    mainPin: mainPin,
    pinAddress: pinAddress,
    advForm: advForm,
    drawPins: drawPins,
    drawCards: drawCards,
    setMainPinAddress: setMainPinAddress
  };

// Передвижение метки
mainPin.addEventListener('mousedown', function (evt) {
  evt.preventDefault();

  var startCoords = {
    x: evt.clientX,
    y: evt.clientY
  };

var dragged = false;

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
// console.log('startCoords.x ' + startCoords.x );
// console.log('startCoords.y ' + startCoords.y  );
// console.log('moveEvt.clientX ' + moveEvt.clientX );
// console.log('moveEvt.clientY ' +moveEvt.clientY );
    // mainPin.style.top = (mainPin.offsetTop - shift.y) + 'px';
    // mainPin.style.left = (mainPin.offsetLeft - shift.x) + 'px';

// function blockcoord () {
//   var coordinates = getMainPinAddress(true);
//   if (coordinates.x <= 0) {
//     mainPin.style.left  = (-MAIN_PIN_WIDTH / 2) + 'px';
//     mainPin.style.top = (mainPin.offsetTop - shift.y) + 'px';
//   } else {
//     mainPin.style.top = (mainPin.offsetTop - shift.y) + 'px';
//     mainPin.style.left = (mainPin.offsetLeft - shift.x) + 'px';
//   }
// };
// blockcoord();
//
//     setMainPinAddress(true);
//   };
var objminBoundX = e.parentNode.offsetLeft;
var objminBoundY = e.parentNode.offsetTop;

obj.maxBoundX = obj.minBoundX + e.parentNode.offsetWidth - e.offsetWidth;
obj.maxBoundY = obj.minBoundY + e.parentNode.offsetHeight - e.offsetHeight;


dragObj.element.style.left = Math.max(dragObj.minBoundX, Math.min(event.clientX - dragObj.posX, dragObj.maxBoundX)) + "px";
dragObj.element.style.top = Math.max(dragObj.minBoundY, Math.min(event.clientY - dragObj.posY, dragObj.maxBoundY)) + "px";


// ////////////////////////////////////////////////////////////////////
  var onMouseUp = function (upEvt) {
  upEvt.preventDefault();
  setMainPinAddress(true);

  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);

  if (dragged) {
  var onClickPreventDefault = function (evt) {
    evt.preventDefault();
    dialogHandler.removeEventListener('click', onClickPreventDefault)
  };
  dialogHandler.addEventListener('click', onClickPreventDefault);
}
};

document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);
});

// ?????????????
// document.addEventListener('click', function (evt) {
//   // ..console.log(evt.clientX, evt.clientY)
// });

}
)();
