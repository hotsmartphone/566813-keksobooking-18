'use strict';

// МОДУЛЬ CARD.JS
(function () {
  var renderCard = function (adv) {
    var cardTemplate = document.querySelector('#card').content.querySelector('.map__card');
    var cardElement = cardTemplate.cloneNode(true);

    cardElement.querySelector('.popup__title').textContent = adv.offer.title;
    cardElement.querySelector('.popup__text--address').textContent = adv.offer.address;
    cardElement.querySelector('.popup__text--price').textContent = adv.offer.price + '₽/ночь';
    cardElement.querySelector('.popup__type').textContent = window.data.typesOfHousingRus[adv.offer.type];
    cardElement.querySelector('.popup__text--capacity').textContent = adv.offer.rooms + ' комнаты для ' + adv.offer.guests + ' гостей';
    cardElement.querySelector('.popup__text--time').textContent = 'Заезд после ' + adv.offer.checkin + ', выезд до ' + adv.offer.checkout;
    cardElement.querySelector('.popup__description').textContent = adv.offer.description;
    cardElement.querySelector('.popup__avatar').src = adv.author.avatar;

    // Вставляем фото в карточку
    var cardPhotos = cardElement.querySelector('.popup__photos');
    var cardPhoto = cardElement.querySelector('.popup__photo');
    cardElement.querySelector('.popup__photo').remove();

    for (var i = 0; i < window.data.photos.length; i++) {
      cardPhoto.src = window.data.photos[i];
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
  window.card.renderCard = renderCard;
}
)();
