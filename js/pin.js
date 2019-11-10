'use strict';

// МОДУЛЬ PIN.JS
(function () {
  var PIN_WIDTH = 50;
  var PIN_HEIGHT = 70;
  // Генерируем пин
  window.renderPin = function (adv, indexNumber) {
    var pinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');
    var pinElement = pinTemplate.cloneNode(true);

    pinElement.style.left = adv.location.x - (PIN_WIDTH / 2) + 'px';
    pinElement.style.top = adv.location.y - PIN_HEIGHT + 'px';
    pinElement.querySelector('img').src = adv.author.avatar;
    pinElement.querySelector('img').alt = adv.offer.title;
    pinElement.id = indexNumber;

    return pinElement;
  };
})();
