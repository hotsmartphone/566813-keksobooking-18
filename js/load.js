'use strict';

// МОДУЛЬ lOAD.JS
(function () {
  var SUCCESS_CODE = 200;
  var TIMEOUT = 10000; // 10сек

  window.load = function (method, URL, onSuccess, onError, data) {
    var xhr = new XMLHttpRequest();

    xhr.responseType = 'json';

    xhr.addEventListener('load', function () {
      if (xhr.status === SUCCESS_CODE) {
        onSuccess(xhr.response);
      } else {
        onError('Статус ответа: ' + xhr.status + ' ' + xhr.statusText);
      }
    });
    xhr.addEventListener('error', function () {
      onError('Произошла ошибка соединения');
    });
    xhr.addEventListener('timeout', function () {
      onError('Запрос не успел выполниться за ' + xhr.timeout + 'мс');
    });

    xhr.timeout = TIMEOUT;

    xhr.open(method, URL);

    if (method === 'POST') {
      xhr.send(data);
    } else {
      xhr.send();
    }
  };
})();
