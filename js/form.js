'use strict';

// МОДУЛЬ FORM.JS
(function () {
  window.map.setMainPinAddress(false);
  // Накладываем валиадацию на зависимость количества комнат от количества гостей и наоборот
  // Объект, в котором ключ - количество комнат, а значение - массив доступного количества места для такого количества комнат
  var capacityRoomsGuests = {
    1: [1],
    2: [1, 2],
    3: [1, 2, 3],
    100: [0]
  };

  var roomNumber = document.querySelector('#room_number');
  var capacityRoomOptions = document.querySelectorAll('#capacity option');

  // Делаю неактивными все пункты количества мест
  var setNumbersPlacesOption = function (targetValue) {
    for (var i = 0; i < capacityRoomOptions.length; i++) {
      capacityRoomOptions[i].disabled = true;
    }

    for (var k = 0; k < Object.keys(capacityRoomsGuests).length; k++) { // Цикл идет по каждому ключу, сравнивая отловленное количество комнат с ключами объекта
      if (targetValue === String(Object.keys(capacityRoomsGuests)[k])) {
        for (var l = 0; l < capacityRoomsGuests[Object.keys(capacityRoomsGuests)[k]].length; l++) { // При совпадении с ключом, идет обращением к массиву (значение), к каждому его элементу
          for (var m = 0; m < capacityRoomOptions.length; m++) { // Сопоставляем спискок количества мест с элементом массива
            if (capacityRoomOptions[m].value === String(capacityRoomsGuests[Object.keys(capacityRoomsGuests)[k]][l])) { // Если элемент массива найден, соответствующий пункт списка мест становится активным
              capacityRoomOptions[m].disabled = false;
              capacityRoomOptions[m].selected = true; // Дополнительно помечаем пункт списка мест как "selected".
            }
          }
        }
      }
    }
  };

  // Функция, которая срабатывает при смене количества комнат. Ограничивает список мест до разрешенного для даннного количества комнат
  function matchRoomsToGuests(evt) {
    var targetValue = evt.target.value;
    setNumbersPlacesOption(targetValue);
  }

  roomNumber.addEventListener('change', matchRoomsToGuests);

  // Продолажем валидировать

  // Валидация заголовка
  var titleAdv = document.querySelector('#title');
  titleAdv.setAttribute('minlength', 30);
  titleAdv.setAttribute('maxlength', 100);
  titleAdv.required = true;

  var setNewTitle = function (evt) {
    titleAdv.setAttribute('value', evt.target.value);
  };
  titleAdv.addEventListener('input', setNewTitle);

  // Валидация цены
  var priceAdv = document.querySelector('#price');
  priceAdv.required = true;
  priceAdv.setAttribute('max', 1000000);

  // Валидация типа жилья - минимальная цена
  var housingTypeAdv = document.querySelector('#type');
  var priceForType = {
    palace: 10000,
    flat: 1000,
    house: 5000,
    bungalo: 0
  };

  // Функция в зависимости от типа жилья устанавливает минимальное значение цены и placeholder
  var matchTypePrice = function (evt) {
    var targetValue = evt.target.value;
    setMinPricePlaceholder(targetValue);
  };

  var setMinPricePlaceholder = function (typeHusingValue) {
    for (var i = 0; i < Object.keys(priceForType).length; i++) {
      if (Object.keys(priceForType)[i] === typeHusingValue) {
        priceAdv.setAttribute('min', priceForType[Object.keys(priceForType)[i]]);
        priceAdv.placeholder = priceForType[Object.keys(priceForType)[i]];
      }
    }
  };

  housingTypeAdv.addEventListener('change', matchTypePrice);

  // Валидация адреса
  window.map.pinAddress.required = true;
  window.map.pinAddress.setAttribute('readonly', true);

  // Валидация время заезда и выезда
  var checkin = document.querySelector('#timein');
  var checkout = document.querySelector('#timeout');

  var matchCheckinCheckout = function (evt) {
    var target = evt.target;
    if (target === checkin) {
      checkout.value = target.value;
    } else {
      checkin.value = target.value;
    }
  };

  checkin.addEventListener('change', matchCheckinCheckout);
  checkout.addEventListener('change', matchCheckinCheckout);

  // Функция сброса превью аватарки и фото жилья
  var resetPhotos = function () {
    window.previewAvatar.src = 'img/muffin-grey.svg';
    var housingPhotos = document.querySelectorAll('div .ad-form__photo');
    var parentHousingPhotoBlock = document.querySelector('.ad-form__photo').parentNode;
    if (housingPhotos.length > 0) {
      var housingPhoto = housingPhotos[0]; // Клонируем любой из элементов div с классом .ad-form__photo, чтобы оставить его единственным блоком при сбросе формы
      housingPhotos.forEach(function (it) { // Удаляем все блоки с фото
        it.remove();
      });
      parentHousingPhotoBlock.appendChild(housingPhoto); // Оставляем один блок
    }
  };

  // Отправка данных формы при нажатии на кнопку "Опубликовать"
  // Функция обработки успешной загрузки данных формы на сервер
  var onSuccessUploadHandler = function () {
    // возвращаю пин в центр
    window.map.mainPin.style = 'left: 570px; top: 375px';

    // очистите заполненные поля
    window.map.advForm.reset(); // reset формы
    resetPhotos(); // Очищение превью картинок в форме
    titleAdv.setAttribute('value', ''); // нулевое значение в input, так как reset здесь не помогает
    window.map.switchActiveForm(false); // дизейбл поле формы объявления и фильтров
    window.map.removePins();
    window.map.mapActive.classList.add('map--faded'); // оверлей на карту
    window.map.setMainPinAddress(false); // заполнение координат главного пина

    window.map.mainPin.addEventListener('mousedown', window.map.mainPinClickHandler);
    window.map.mainPin.addEventListener('keydown', window.map.mainPinEnterPressHandler);

    var successTemplate = document.querySelector('#success').content;
    var cloneSuccess = successTemplate.cloneNode(true);
    document.querySelector('main').append(cloneSuccess);

    var closeSuccessOverlay = function () {
      document.querySelector('.success').remove();
      document.removeEventListener('keydown', onSuccessOverlayEscPress);
      document.removeEventListener('click', closeSuccessOverlay);
    };
    var onSuccessOverlayEscPress = function (evt) {
      if (evt.keyCode === window.util.ESC_KEYCODE) {
        closeSuccessOverlay();
      }
    };
    document.addEventListener('keydown', onSuccessOverlayEscPress);
    document.addEventListener('click', closeSuccessOverlay);
  };

  // Функция обработки ошибок при загрузке объявлений с сервера
  var errorUploadHandler = function (errorMessage) {
    var errorTemplate = document.querySelector('#error').content;
    var cloneError = errorTemplate.cloneNode(true);
    var errorButton = cloneError.querySelector('.error__button');

    cloneError.querySelector('.error__message').textContent = errorMessage;

    var closeErrorOverlay = function () {
      document.querySelector('.error').remove();

      document.removeEventListener('keydown', onErrorOverlayEscPress);
      document.removeEventListener('click', closeErrorOverlay);
      errorButton.addEventListener('keydown', onErrorButtonEnterPress);
    };

    var onErrorButtonEnterPress = function (evt) {
      if (evt.keyCode === window.util.ENTER_KEYCODE) {
        closeErrorOverlay();
      }
    };
    var onErrorOverlayEscPress = function (evt) {
      if (evt.keyCode === window.util.ESC_KEYCODE) {
        closeErrorOverlay();
      }
    };

    document.addEventListener('click', closeErrorOverlay);
    errorButton.addEventListener('keydown', onErrorButtonEnterPress);
    document.addEventListener('keydown', onErrorOverlayEscPress);

    document.querySelector('main').append(cloneError);
    errorButton.focus();
  };

  // Обработчик на submit формы
  window.map.advForm.addEventListener('submit', function (evt) {
    evt.preventDefault();
    window.load('POST', 'https://js.dump.academy/keksobooking', onSuccessUploadHandler, errorUploadHandler, new FormData(window.map.advForm));
  });

  window.form = {
    setNumbersPlacesOption: setNumbersPlacesOption,
    setMinPricePlaceholder: setMinPricePlaceholder,
    housingTypeAdv: housingTypeAdv,
    roomNumber: roomNumber
  };
})();
