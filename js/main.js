'use strict';

var typesOfHousing = ['palace', 'flat', 'house', 'bungalo'];
var checkinTimes = ['12:00', '13:00', '14:00'];
var checkoutTimes = ['12:00', '13:00', '14:00'];
var features = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];
var photos = ['http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jpg'];
var NUMBER_OF_ADV = 8;
var PIN_WIDTH = 50;
var PIN_HEIGHT = 70;

//Функция рандомного числа, в том числе в диапазоне
function getRandomNumbers(fromNumber, toNumber) { //если передать один аргумент - отдаст число от 0 до x, если два - вернет число в указанном диапазоне
    if (toNumber === undefined) {
      return (Math.floor(Math.random() * fromNumber));
    } else {
      return Math.round(fromNumber - 0.5 + Math.random() * (toNumber - fromNumber + 1));
    }
};

//Функция, которая выводит отсортированный массив, произвольной длины.
function arrSort(arr) {
  var c = arr;
  //Функция, помещаемая в качестве аргумента функции sort
    c.sort(function compareRandom() {
    return Math.random() - 0.5;
  })
  return c;
};

var getRandomAdv = function (numberOfAdv) {
  var advs = [];
  for(var i = 0; i < numberOfAdv; i++) {
advs[i] =   {
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
        features: arrSort(features),
        description: 'Произвольное описание',
        photos: arrSort(photos)
      },
      location: {
        x: getRandomNumbers(1200),
        y: getRandomNumbers(130, 630)
      }
    }
  }
  return advs;
};

//Делаем карту активной
var mapActive = document.querySelector('.map');
mapActive.classList.remove('map--faded');

//Генерируем и вставляем пины
var renderPin = function (advs) {
  var pinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');
  var pinList = document.createDocumentFragment();

  for (var i = 0; i < advs.length; i++) {
    var pinElement = pinTemplate.cloneNode(true);
    pinElement.style.left = (advs[i].location.x - PIN_WIDTH / 2) + 'px';
    pinElement.style.top = (advs[i].location.y - PIN_HEIGHT) + 'px';
    pinElement.querySelector('img').src = advs[i].author.avatar;
    pinElement.querySelector('img').alt = advs[i].offer.title;
    pinList.appendChild(pinElement);

  }
  return document.querySelector('.map__pins').appendChild(pinList);
};

renderPin(getRandomAdv(NUMBER_OF_ADV));
