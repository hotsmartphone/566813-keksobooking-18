'use strict';

// Модуль PREVIEW.JS
(function () {
  var FILE_TYPES = ['gif', 'jpg', 'jpeg', 'png'];

  var fileChooserAvatar = document.querySelector('#avatar');
  window.previewAvatar = document.querySelector('.ad-form-header__preview img');

  var fileChooserHousingPhoto = document.querySelector('#images');
  var previewHousingPhoto = document.querySelector('.ad-form__photo');

  var acceptFileTypes = '.' + FILE_TYPES.join(',.');

  [fileChooserAvatar, fileChooserHousingPhoto].forEach(function (it) { // Установим разрешенные форматы, чтобы пользователь не мог загрузить иные файлы
    it.accept = acceptFileTypes;
  });


  var addPreviewHousingImg = function () { // Функция возвращает img, в котором будет отображаться превью жилья, так как в верстке его нет
    var img = document.createElement('img');
    img.classList.add('ad-form__photo');
    img.setAttribute('alt', 'Фотография жилья');

    if (!previewHousingPhoto.hasChildNodes()) { // Если есть пустой div, то вставь картинку в него. Иначе - создай новый.
      return previewHousingPhoto.appendChild(img);
    } else {
      var previewHousingPhotoClone = previewHousingPhoto.cloneNode(false);
      previewHousingPhoto.parentNode.appendChild(previewHousingPhotoClone);
      return previewHousingPhotoClone.appendChild(img);
    }
  };

  var showPreview = function (fileChooser, previewBlock) { // Непосредственно функция для отображения превью
    var file = fileChooser.files[0];
    var fileName = file.name.toLowerCase();

    var matches = FILE_TYPES.some(function (it) {
      return fileName.endsWith(it);
    });
    if (matches) {
      if (typeof previewBlock === 'function') { // в качестве аргумента previewBlock можно передать функцию, которая создаст img только файл имеет нужное расширение
        previewBlock = previewBlock();
      }
      var reader = new FileReader();

      reader.addEventListener('load', function () {
        previewBlock.src = reader.result;
      });
      reader.readAsDataURL(file);
    }
  };

  fileChooserAvatar.addEventListener('change', function () {
    showPreview(fileChooserAvatar, window.previewAvatar);
  });

  fileChooserHousingPhoto.addEventListener('change', function () {
    showPreview(fileChooserHousingPhoto, addPreviewHousingImg);
  });
})();
