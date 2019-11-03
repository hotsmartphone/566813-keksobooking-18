'use strict';

// Модуль DEBOUNCE.JS

(function () {
  var DEBOUNCE_INTERVAL = 500; // ms

  window.debounce = function (cb) { // Принимает на вход фнукцию, которую нужно выполнить с задержкой
    var lastTimeout = null;

    return function () {
      var parameters = arguments;
      if (lastTimeout) {
        window.clearTimeout(lastTimeout);
      }
      lastTimeout = window.setTimeout(function () {
        cb.apply(null, parameters);
      }, DEBOUNCE_INTERVAL);
    };
  };
})();
