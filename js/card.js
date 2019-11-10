'use strict';

// МОДУЛЬ CARD.JS
(function () {
  var HousingTypeRus = {
    PALACE: 'Дворец',
    FLAT: 'Квартира',
    HOUSE: 'Дом',
    BUNGALO: 'Бунгало'
  };

  window.renderCard = function (adv) {
    var cardTemplate = document.querySelector('#card').content.querySelector('.map__card');
    var cardElement = cardTemplate.cloneNode(true);

    cardElement.querySelector('.popup__title').textContent = adv.offer.title;
    cardElement.querySelector('.popup__text--address').textContent = adv.offer.address;
    cardElement.querySelector('.popup__text--price').textContent = adv.offer.price + '₽/ночь';
    cardElement.querySelector('.popup__type').textContent = HousingTypeRus[adv.offer.type.toUpperCase()];
    cardElement.querySelector('.popup__text--capacity').textContent = adv.offer.rooms + ' комнаты для ' + adv.offer.guests + ' гостей';
    cardElement.querySelector('.popup__text--time').textContent = 'Заезд после ' + adv.offer.checkin + ', выезд до ' + adv.offer.checkout;
    cardElement.querySelector('.popup__description').textContent = adv.offer.description;
    cardElement.querySelector('.popup__avatar').src = adv.author.avatar;

    // Вставляем фото в карточку
    var cardPhotos = cardElement.querySelector('.popup__photos');

    var getAdvPhotosList = function () {
      var cardPhoto = cardElement.querySelector('.popup__photo');
      var fragment = document.createDocumentFragment();
      cardElement.querySelector('.popup__photo').remove();

      adv.offer.photos.forEach(function (it) {
        cardPhoto.src = it;
        fragment.appendChild(cardPhoto.cloneNode(true));
      });

      return fragment;
    };

    cardPhotos.appendChild(getAdvPhotosList());

    // Вставляем удобства в карточку
    var cardFeatures = cardElement.querySelector('.popup__features');

    var getAdvFeaturesList = function () {
      var cardFeature = cardElement.querySelector('.popup__feature');
      var fragment = document.createDocumentFragment();
      cardFeatures.innerHTML = '';

      adv.offer.features.forEach(function (it) {
        cardFeature.className = '';
        cardFeature.classList.add('popup__feature', 'popup__feature--' + it);
        fragment.appendChild(cardFeature.cloneNode(true));
      });

      return fragment;
    };

    cardFeatures.appendChild(getAdvFeaturesList());

    return cardElement;
  };
})();
