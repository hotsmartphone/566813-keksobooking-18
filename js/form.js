'use strict';

// МОДУЛЬ FORM.JS
(function () {
  var MIN_LENGTH_TITLE = 30;
  var MAX_LENGTH_TITLE = 100;
  var MAX_PRICE = 1000000;
  var MIN_PRICE_FOR_TYPE = {
    palace: 10000,
    flat: 1000,
    house: 5000,
    bungalo: 0
  };

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

    capacityRoomOptions.forEach(function (it) {
      it.disabled = true;
    });

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
  var onRoomsNumbersChange = function (evt) {
    var targetValue = evt.target.value;
    setNumbersPlacesOption(targetValue);
  };

  roomNumber.addEventListener('change', onRoomsNumbersChange);

  // Продолажем валидировать
  // Валидация заголовка
  var titleAdv = document.querySelector('#title');
  titleAdv.setAttribute('minlength', MIN_LENGTH_TITLE);
  titleAdv.setAttribute('maxlength', MAX_LENGTH_TITLE);
  titleAdv.required = true;

  var onTitleInput = function (evt) {
    titleAdv.setAttribute('value', evt.target.value);
  };
  titleAdv.addEventListener('input', onTitleInput);

  // Валидация цены
  var priceAdv = document.querySelector('#price');
  priceAdv.required = true;
  priceAdv.setAttribute('max', MAX_PRICE);

  // Валидация типа жилья - минимальная цена
  var housingTypeAdv = document.querySelector('#type');

  // Функция в зависимости от типа жилья устанавливает минимальное значение цены и placeholder
  var onPriceChange = function (evt) {
    var targetValue = evt.target.value;
    setMinPricePlaceholder(targetValue);
  };

  var setMinPricePlaceholder = function (typeHusingValue) {
    Object.keys(MIN_PRICE_FOR_TYPE).forEach(function (it) {
      if (it === typeHusingValue) {
        priceAdv.setAttribute('min', MIN_PRICE_FOR_TYPE[it]);
        priceAdv.placeholder = MIN_PRICE_FOR_TYPE[it];
      }
    });
  };

  housingTypeAdv.addEventListener('change', onPriceChange);

  // Валидация адреса
  window.map.pinAddress.required = true;
  window.map.pinAddress.setAttribute('readonly', true);

  // Валидация время заезда и выезда
  var checkin = document.querySelector('#timein');
  var checkout = document.querySelector('#timeout');

  var onCheckinChange = function (evt) {
    var target = evt.target;
    checkout.value = target.value;
  };

  var onCheckoutChange = function (evt) {
    var target = evt.target;
    checkin.value = target.value;
  };

  checkin.addEventListener('change', onCheckinChange);
  checkout.addEventListener('change', onCheckoutChange);

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
  // Фнукция возврата в неактивное состояние
  var returnInactiveState = function () {
    window.map.checkAndClosePopup(); // закроем карточку активного объявления
    // очистите заполненные поля
    window.map.advForm.reset(); // reset формы заполнения объеявления
    document.querySelector('.map__filters').reset(); // reset фильтров
    resetPhotos(); // Очищение превью картинок в форме
    titleAdv.setAttribute('value', ''); // нулевое значение в input, так как reset здесь не помогает
    window.map.switchActiveForm(false); // дизейбл полей формы объявления и фильтров
    window.map.removePins();
    window.map.mapActive.classList.add('map--faded'); // оверлей на карту
    window.map.mainPin.style = 'left: 570px; top: 375px'; // возвращаю пин в центр
    window.map.setMainPinAddress(false); // заполнение координат главного пина

    window.map.mainPin.addEventListener('mousedown', window.map.onMainPinClick);
    window.map.mainPin.addEventListener('keydown', window.map.onMainPinEnterPress);
  };

  // Функция обработки успешной загрузки данных формы на сервер
  var onSuccessUploadHandler = function () {
    var successTemplate = document.querySelector('#success').content;
    var cloneSuccess = successTemplate.cloneNode(true);
    document.querySelector('main').append(cloneSuccess);

    var onSuccessOverlayEscPress = function (evt) {
      if (evt.keyCode === window.util.ESC_KEYCODE) {
        onSuccessOverlayClick();
      }
    };
    var onSuccessOverlayClick = function () {
      document.querySelector('.success').remove();
      document.removeEventListener('keydown', onSuccessOverlayEscPress);
      document.removeEventListener('click', onSuccessOverlayClick);
      returnInactiveState();
    };
    document.addEventListener('keydown', onSuccessOverlayEscPress);
    document.addEventListener('click', onSuccessOverlayClick);
  };


  // Функция обработки ошибок при загрузке объявлений с сервера
  var errorUploadHandler = function (errorMessage) {
    var errorTemplate = document.querySelector('#error').content;
    var cloneError = errorTemplate.cloneNode(true);
    var errorButton = cloneError.querySelector('.error__button');

    cloneError.querySelector('.error__message').textContent = errorMessage;

    var onErrorOverlayClick = function () {
      document.querySelector('.error').remove();

      document.removeEventListener('keydown', onErrorOverlayEscPress);
      document.removeEventListener('click', onErrorOverlayClick);
      errorButton.addEventListener('keydown', onErrorButtonEnterPress);
    };

    var onErrorButtonEnterPress = function (evt) {
      if (evt.keyCode === window.util.ENTER_KEYCODE) {
        onErrorOverlayClick();
      }
    };
    var onErrorOverlayEscPress = function (evt) {
      if (evt.keyCode === window.util.ESC_KEYCODE) {
        onErrorOverlayClick();
      }
    };

    document.addEventListener('click', onErrorOverlayClick);
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

  // Обработчики на кнопку сброса формы
  var resetFormButton = document.querySelector('.ad-form__reset');

  resetFormButton.addEventListener('click', function () {
    returnInactiveState();
  });

  var onResetFormButtonEnterPress = function (evt) {
    if (evt.keyCode === window.util.ENTER_KEYCODE) {
      returnInactiveState();
    }
  };

  resetFormButton.addEventListener('keydown', onResetFormButtonEnterPress);

  // Обработка нажатий клавишей Enter на удобства
  var onFeatureInputEnterPress = function (evt) {
    if (evt.keyCode === window.util.ENTER_KEYCODE) {
      evt.preventDefault();
      evt.target.checked = !evt.target.checked;
    }
  };

  var featuresInputs = document.querySelectorAll('input[name=features]');

  featuresInputs.forEach(function (it) {
    it.addEventListener('keydown', onFeatureInputEnterPress);
  });

  window.form = {
    setNumbersPlacesOption: setNumbersPlacesOption,
    setMinPricePlaceholder: setMinPricePlaceholder,
    housingTypeAdv: housingTypeAdv,
    roomNumber: roomNumber
  };
})();
