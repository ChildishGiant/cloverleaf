importScripts("cache-polyfill.js");
self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open("perdola").then(function(cache) {
      return cache.addAll([
        "index.html",
        "compiled/style.min.css",
        "compiled/jssource.min.js",
        "data/sites.json",
        "data/themes.json",
        "logos/AliExpress.png",
        "logos/Alipay.svg",
        "logos/allegorithmic.svg",
        "logos/Amazon.svg",
        "logos/Apple.svg",
        "logos/Artsy.svg",
        "logos/BBC.svg",
        "logos/Bing.svg",
        "logos/Blend Swap.svg",
        "logos/Channel 4.svg",
        "logos/Chrono.gg.svg",
        "logos/DeviantArt.svg",
        "logos/Discord.svg",
        "logos/Dribbble.svg",
        "logos/Dropbox.svg",
        "logos/Duolingo.svg",
        "logos/eBay.svg",
        "logos/Epic Games.svg",
        "logos/Etsy.svg",
        "logos/Evernote.svg",
        "logos/Facebook.svg",
        "logos/FANDOM.svg",
        "logos/Flickr.svg",
        "logos/Genius.svg",
        "logos/Gfycat.svg",
        "logos/GiffGaff.svg",
        "logos/GIPHY.svg",
        "logos/Github.svg",
        "logos/GOG.svg",
        "logos/Google.svg",
        "logos/Guilded.svg",
        "logos/HitFilm.svg",
        "logos/Humble Bundle.svg",
        "logos/IFTTT.svg",
        "logos/imgur.svg",
        "logos/Instagram.svg",
        "logos/itch.io.svg",
        "logos/itv.svg",
        "logos/JustGiving.svg",
        "logos/last.fm.svg",
        "logos/lernu.svg",
        "logos/LinkedIn.svg",
        "logos/Lloyds Bank.svg",
        "logos/logo.svg",
        "logos/Mapbox.svg",
        "logos/Mega.svg",
        "logos/Messenger.svg",
        "logos/Microsoft.svg",
        "logos/Minecraft.svg",
        "logos/Mojang.svg",
        "logos/MSN.svg",
        "logos/Netflix.svg",
        "logos/OpenStreetMap.svg",
        "logos/Opera.svg",
        "logos/Oxfam.svg",
        "logos/Pastebin.png",
        "logos/Patreon.svg",
        "logos/PayPal.svg",
        "logos/pixiv.svg",
        "logos/plug.dj.svg",
        "logos/Pocket.svg",
        "logos/Prezi.svg",
        "logos/Reddit.svg",
        "logos/Rockstar Games Social Club.svg",
        "logos/Skype.svg",
        "logos/Snapchat.svg",
        "logos/Songsterr.svg",
        "logos/Soundcloud.svg",
        "logos/Spotify.svg",
        "logos/Steam.svg",
        "logos/the Guardian.svg",
        "logos/tic.computer.svg",
        "logos/Tumblr.svg",
        "logos/Twitch.svg",
        "logos/Twitter.svg",
        "logos/Ubisoft.svg",
        "logos/Uplay.svg",
        "logos/Vimeo.svg",
        "logos/Vivaldi.svg",
        "logos/VK.svg",
        "logos/Wikipedia.svg",
        "logos/Wish.svg",
        "logos/Xbox.svg",
        "logos/Yahoo.svg",
        "logos/YouTube.svg",
        "logos/YoYo Games.svg"
      ]);
    })
  );
});
self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", function(event) {

  var cacheWhitelist = [];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
