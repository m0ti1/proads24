/* ============================================================
   proads24 — Яндекс Карта (JavaScript API 3.0)

   1. Получите ключ: https://developer.tech.yandex.ru/services/
      → «JavaScript API и HTTP API Геокодера» → Создать ключ.
   2. Вставьте ключ в переменную YMAPS_API_KEY ниже.
   3. Готово. Без ключа сайт покажет аккуратную заглушку
      со ссылкой на Яндекс.Карты — ничего не сломается.
   ============================================================ */
(function () {
  "use strict";

  var YMAPS_API_KEY = "09b26bd7-b9a7-48c3-a3e3-fb291082a4af";

  var MAP_CONTAINER_ID = "ymap";
  var FALLBACK_ID = "map-fallback";
  var CENTER = [37.5397, 55.7494];        // Москва-Сити, Пресненская наб., 12
  var ZOOM = 16;
  var SCRIPT_TIMEOUT_MS = 12000;

  var container = document.getElementById(MAP_CONTAINER_ID);
  var fallback = document.getElementById(FALLBACK_ID);
  if (!container) return;

  function showFallback() {
    if (fallback) fallback.hidden = false;
    container.setAttribute("aria-hidden", "true");
  }

  if (!YMAPS_API_KEY) {
    showFallback();
    return;
  }

  /* Подгружаем скрипт API и ждём готовности */
  var script = document.createElement("script");
  script.src = "https://api-maps.yandex.ru/v3/?apikey=" + encodeURIComponent(YMAPS_API_KEY) + "&lang=ru_RU";
  script.async = true;

  var settled = false;

  function fail() {
    if (settled) return;
    settled = true;
    showFallback();
  }

  script.onerror = fail;
  document.head.appendChild(script);

  window.setTimeout(fail, SCRIPT_TIMEOUT_MS);

  script.onload = function () {
    initMap().catch(fail);
  };

  function initMap() {
    return ymaps3.ready.then(function () {
      if (settled) return; // уже истёк таймаут

      var YMap = ymaps3.YMap;
      var YMapDefaultSchemeModule = ymaps3.YMapDefaultSchemeModule;
      var YMapDefaultFeaturesLayer = ymaps3.YMapDefaultFeaturesLayer;
      var YMapControls = ymaps3.YMapControls;
      var YMapZoomControl = ymaps3.YMapZoomControl;
      var YMapMarker = ymaps3.YMapMarker;

      var map = new YMap(container, {
        location: { center: CENTER, zoom: ZOOM }
      });

      map.addChild(new YMapDefaultSchemeModule());
      map.addChild(new YMapDefaultFeaturesLayer());
      map.addChild(new YMapControls({ position: { right: "10px", top: "10px" } }))
        .addChild(new YMapZoomControl());

      /* Фирменный маркер: разомкнутое кольцо с зелёной стрелой */
      var pin = document.createElement("div");
      pin.className = "map-pin";
      pin.setAttribute("aria-hidden", "true");
      pin.innerHTML =
        '<svg viewBox="0 0 64 64">' +
        '<path d="M53.2 27.3 A22 22 0 0 1 26.3 54.3" fill="none" stroke="#1e6fe8" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M10.8 38.7 A22 22 0 0 1 37.7 11.7" fill="none" stroke="#1e6fe8" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M7 54 L24 33 L30 42 L50 17" fill="none" stroke="#3ac85a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<polygon points="58,8 55,21 44,13" fill="#3ac85a"/>' +
        "</svg>";

      map.addChild(new YMapMarker({ coordinates: CENTER }, pin));

      settled = true;
    });
  }
})();
