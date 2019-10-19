'use strict';

// МОДУЛЬ FORM.JS
(function () {
  window.map.setMainPinAddress();
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

  // Функция, которая срабатывает при смене количества комнат. Ограничивает список мест до разрешенного для даннного количества комнат
  function matchRoomsToGuests(evt) {
    var targetValue = evt.target.value;
    setPriceOption(targetValue);
  }

  // Делаю неактивными все пункты количества мест
  var setPriceOption = function (targetValue) {
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

  roomNumber.addEventListener('change', matchRoomsToGuests);

  // Запускаем фнукцию установки разрешенного количества мест сразу при открытии страницы, чтобы пользователь случайно не отправил невалидные данные
  setPriceOption(roomNumber.querySelector('option:checked').value);


  // Продолажем валидировать
  // Добавляем адрес отправки формы
  window.map.advForm.action = 'https://js.dump.academy/keksobooking';

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

  // По умолчанию тип жилья "Квартира", для которого не установлено минимальное значение. Оно устанавливается только при смене типа жилья. Проставим минимальное значение при открытии страницы.
  var selectedHousingTypeValue = housingTypeAdv.querySelector('option:checked').value;
  setMinPricePlaceholder(selectedHousingTypeValue);

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
})();
