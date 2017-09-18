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
        "logos/Amazon.svg",
        "logos/Apple.svg",
        "logos/BBC.svg",
        "logos/Bing.svg",
        "logos/Channel_4.svg",
        "logos/chrono.svg",
        "logos/DeviantArt.svg",
        "logos/Discord.svg",
        "logos/Dropbox.svg",
        "logos/Duolingo.svg",
        "logos/eBay.svg",
        "logos/Etsy.svg",
        "logos/evernote.svg",
        "logos/Facebook.svg",
        "logos/Flickr.svg",
        "logos/genius.svg",
        "logos/Gfycat.svg",
        "logos/GiffGaff.svg",
        "logos/GIPHY.svg",
        "logos/Github.svg",
        "logos/GOG.svg",
        "logos/Google.svg",
        "logos/guardian.svg",
        "logos/guilded.svg",
        "logos/Humble_Bundle.svg",
        "logos/ifttt.svg",
        "logos/Instagram.svg",
        "logos/itchio.svg",
        "logos/itv.svg",
        "logos/last.fm.svg",
        "logos/lernu.svg",
        "logos/linkedin.svg",
        "logos/mapbox.svg",
        "logos/Mega.svg",
        "logos/Messenger.svg",
        "logos/Microsoft.svg",
        "logos/Minecraft.svg",
        "logos/mojang.svg",
        "logos/Netflix.svg",
        "logos/OpenStreetMap.svg",
        "logos/Opera.svg",
        "logos/Pastebin.png",
        "logos/Patreon.svg",
        "logos/PayPal.svg",
        "logos/plug.dj.png",
        "logos/Reddit.svg",
        "logos/Skype.svg",
        "logos/Songsterr.png",
        "logos/Soundcloud.svg",
        "logos/Spotify.svg",
        "logos/Steam.svg",
        "logos/tic-80.svg",
        "logos/tumblr-logo-blue.svg",
        "logos/Twitch.svg",
        "logos/Twitter.svg",
        "logos/Ubisoft.svg",
        "logos/Uplay.svg",
        "logos/VK.svg",
        "logos/Wikipedia.svg",
        "logos/Xbox.svg",
        "logos/Yahoo.svg",
        "logos/YouTube.svg",
        "logos/yoyogames.svg"
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
