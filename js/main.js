'use strict';

var typesOfHousing = ['palace', 'flat', 'house', 'bungalo'];
var typesOfHousingRus = {
  palace: 'Дворец',
  flat: 'Квартира',
  house: 'Дом',
  bungalo: 'Бунгало'
};
var checkinTimes = ['12:00', '13:00', '14:00'];
var checkoutTimes = ['12:00', '13:00', '14:00'];
var features = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];
var photos = ['http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jpg'];
var NUMBER_OF_ADVS = 8;
var PIN_WIDTH = 50;
var PIN_HEIGHT = 70;

var ENTER_KEYCODE = 13;

// Функция рандомного числа, в том числе в диапазоне
function getRandomNumbers(fromNumber, toNumber) { // Если передать один аргумент - отдаст число от 0 до x, если два - вернет число в указанном диапазоне
  if (toNumber === undefined) {
    return (Math.floor(Math.random() * fromNumber));
  } else {
    return Math.round(fromNumber - 0.5 + Math.random() * (toNumber - fromNumber + 1));
  }
}

// Функция, которая выводит отсортированный массив, произвольной длины.
function arrSort(arr) {
  var c = arr.slice(0);
  // Функция, помещаемая в качестве аргумента функции sort
  c.sort(function compareRandom() {
    return Math.random() - 0.5;
  });
  return c;
}

function arrSortAndCut(arr) {
  var d = arrSort(arr);
  d.length = getRandomNumbers(1, arr.length);
  return d;
}

var getRandomAdvs = function (numberOfAdv) {
  var advs = [];
  for (var i = 0; i < numberOfAdv; i++) {
    advs[i] = {
      author: {
        avatar: 'img/avatars/user0' + (i + 1) + '.png'
      },
      offer: {
        title: 'Заголовок объявления',
        address: '600, 350',
        price: getRandomNumbers(3000, 50000),
        type: typesOfHousing[getRandomNumbers(typesOfHousing.length)],
        rooms: getRandomNumbers(1, 9),
        guests: getRandomNumbers(1, 10),
        checkin: checkinTimes[getRandomNumbers(checkinTimes.length)],
        checkout: checkoutTimes[getRandomNumbers(checkoutTimes.length)],
        features: arrSortAndCut(features),
        description: 'Произвольное описание',
        photos: arrSort(photos)
      },
      location: {
        x: getRandomNumbers(1200),
        y: getRandomNumbers(130, 630)
      }
    };
  }
  return advs;
};

// Генерируем пин
var renderPin = function (adv) {
  var pinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');
  var pinElement = pinTemplate.cloneNode(true);

  pinElement.style.left = adv.location.x - (PIN_WIDTH / 2) + 'px';
  pinElement.style.top = adv.location.y - PIN_HEIGHT + 'px';
  pinElement.querySelector('img').src = adv.author.avatar;
  pinElement.querySelector('img').alt = adv.offer.title;

  return pinElement;
};

// Отрисовываем пины
var pinList = document.querySelector('.map__pins');

var drawPins = function (advsList) {
  var fragment = document.createDocumentFragment();

  for (var i = 0; i < advsList.length; i++) {
    fragment.appendChild(renderPin(advsList[i]));
  }
  return pinList.appendChild(fragment);
};

// Генерируем карточку
var renderCard = function (adv) {
  var cardTemplate = document.querySelector('#card').content.querySelector('.map__card');
  var cardElement = cardTemplate.cloneNode(true);

  cardElement.querySelector('.popup__title').textContent = adv.offer.title;
  cardElement.querySelector('.popup__text--address').textContent = adv.offer.address;
  cardElement.querySelector('.popup__text--price').textContent = adv.offer.price + '₽/ночь';
  cardElement.querySelector('.popup__type').textContent = typesOfHousingRus[adv.offer.type];
  cardElement.querySelector('.popup__text--capacity').textContent = adv.offer.rooms + ' комнаты для ' + adv.offer.guests + ' гостей';
  cardElement.querySelector('.popup__text--time').textContent = 'Заезд после ' + adv.offer.checkin + ', выезд до ' + adv.offer.checkout;
  cardElement.querySelector('.popup__description').textContent = adv.offer.description;
  cardElement.querySelector('.popup__avatar').src = adv.author.avatar;

  // Вставляем фото в карточку
  var cardPhotos = cardElement.querySelector('.popup__photos');
  var cardPhoto = cardElement.querySelector('.popup__photo');
  cardElement.querySelector('.popup__photo').remove();

  for (var i = 0; i < photos.length; i++) {
    cardPhoto.src = photos[i];
    cardPhotos.append(cardPhoto.cloneNode(true));
  }

  // Вставляем удобства в карточку
  var cardFeatures = cardElement.querySelector('.popup__features');
  var cardFeature = cardElement.querySelector('.popup__feature');
  cardFeatures.innerHTML = '';

  for (var n = 0; n < adv.offer.features.length; n++) {
    cardFeature.className = '';
    cardFeature.classList.add('popup__feature', 'popup__feature--' + adv.offer.features[n]);
    cardFeatures.appendChild(cardFeature.cloneNode(true));
  }

  return cardElement;
};

// Отрисовываем карточки
var drawCards = function (advsList) {
  var mapFilters = document.querySelector('.map__filters-container'); // Перед данным разделом добавляются карточки
  var fragment = document.createDocumentFragment();

  for (var i = 0; i < advsList.length; i++) {
    fragment.appendChild(renderCard(advsList[i]));
  }
  return mapFilters.before(fragment);
};

// Делаем карту активной
var mapActive = document.querySelector('.map');
var mainPin = document.querySelector('.map__pin--main');

// Функция переключения режима полей форм (активный/неактивный)
function switchActiveForm(boolean) {
  var formInputsSelectors = document.querySelectorAll('.ad-form fieldset, .map__filters fieldset, .map__filters select');
  var advForm = document.querySelector('.ad-form');
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

var mainPinClickHandler = function () {
  mapActive.classList.remove('map--faded');
  switchActiveForm(true);
  drawPins(getRandomAdvs(NUMBER_OF_ADVS));
  drawCards(getRandomAdvs(NUMBER_OF_ADVS));
  getMainPinAddress(true);
  mainPin.removeEventListener('mousedown', mainPinClickHandler);
  mainPin.removeEventListener('keydown', mainPinEnterPressHandler);
};

var mainPinEnterPressHandler = function (evt) {
  if (evt.keyCode === ENTER_KEYCODE) {
    mainPinClickHandler();
  }
};

mainPin.addEventListener('mousedown', mainPinClickHandler);
mainPin.addEventListener('keydown', mainPinEnterPressHandler);

// Вычисляем и подставяем адресс главного пина
var MAIN_PIN_WIDTH = 62;
var MAIN_PIN_HEIGHT = 62;
var MAIN_PIN_HEIGHT_POINT = 84;
var pinAddress = document.querySelector('#address');

function getMainPinAddress(isActiveBoolean) {
  if (isActiveBoolean) {
    pinAddress.value = (mainPin.getBoundingClientRect().left - pinList.getBoundingClientRect().left + MAIN_PIN_WIDTH / 2) + ', ' + (mainPin.getBoundingClientRect().top - pinList.getBoundingClientRect().top + MAIN_PIN_HEIGHT_POINT / 2);
  } else {
    pinAddress.value = (mainPin.getBoundingClientRect().left - pinList.getBoundingClientRect().left + MAIN_PIN_WIDTH / 2) + ', ' + (mainPin.getBoundingClientRect().top - pinList.getBoundingClientRect().top + MAIN_PIN_HEIGHT / 2);
  }
}

getMainPinAddress();

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

  // Делаю неактивными все пункты количества мест
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
}

roomNumber.addEventListener('change', matchRoomsToGuests);
