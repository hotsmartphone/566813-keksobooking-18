'use strict';

// Модуль FILTER.JS
(function () {
  var housingTypeFilter = document.querySelector('#housing-type');

  var filterPinsHousingType = function (evt) { // Обработчик с этой функцией  вешается в момент, когда карта становится активной.
    var targetValue = evt.target.value;
    window.map.checkAndClosePopup();

    if (targetValue === 'any') { // Если тип жилья "Любой"  - показываем первых пять карточек
      window.map.removePins();
      window.map.drawPins(window.map.advsList.slice(0, 5));
    } else {
      window.map.removePins();
      window.map.drawPins(window.map.advsList
      .filter(function (adv) {
        return adv.offer.type === targetValue;
      })
      .slice(0, 5)
      );
    }
  };

  window.filter = {
    housingTypeFilter: housingTypeFilter,
    filterPinsHousingType: filterPinsHousingType
  };
})();
