// ==UserScript==

	// @name               NicoNico Shorts To Normal Watch

	// @name:ja            ニコニコショートを通常の視聴ページへリダイレクト

	// @namespace          https://github.com/example/userscripts

	// @version            1.0.0

	// @description        Instantly redirect NicoNico Shorts (https://www.nicovideo.jp/shorts/ID) to the normal watch page (https://www.nicovideo.jp/watch/ID).

	// @description:ja     ニコニコ動画のショートURL (https://www.nicovideo.jp/shorts/ID) を通常の視聴ページ (https://www.nicovideo.jp/watch/ID) に即座にリダイレクトします。

	// @author             you

	// @match              https://www.nicovideo.jp/*

	// @match              https://sp.nicovideo.jp/*

	// @icon               https://www.nicovideo.jp/favicon.ico

	// @license            MIT

	// @grant              none

	// @noframes

	// ==/UserScript==



	(function () {

	  "use strict";



	  const SHORTS_PREFIX = "/shorts/";

	  const WATCH_PREFIX = "/watch/";



	  function toWatchUrl(href) {

	    try {

	      const url = new URL(href);

	      if (!url.pathname.startsWith(SHORTS_PREFIX)) return null;



	      // Extract the ID portion after /shorts/

	      const id = url.pathname.slice(SHORTS_PREFIX.length).split("/")[0];

	      if (!id) return null;



	      // Build new URL as /watch/{id} and keep query/hash if present

	      url.pathname = WATCH_PREFIX + id;

	      return url.toString();

	    } catch {

	      return null;

	    }

	  }



	  function redirectIfShorts() {

	    const newUrl = toWatchUrl(location.href);

	    if (newUrl && newUrl !== location.href) {

	      // Use replace to avoid polluting history

	      location.replace(newUrl);

	    }

	  }



	  // Initial check

	  redirectIfShorts();



	  // Observe SPA navigations (NicoNico often uses PJAX/SPA patterns)

	  // 1) History API hook (pushState/replaceState)

	  ["pushState", "replaceState"].forEach((name) => {

	    const original = history[name];

	    history[name] = function (...args) {

	      const ret = original.apply(this, args);

	      queueMicrotask(redirectIfShorts);

	      return ret;

	    };

	  });



	  // 2) Listen to popstate for back/forward

	  window.addEventListener("popstate", redirectIfShorts, { passive: true });



	  // 3) As a fallback, observe URL changes via MutationObserver (cheap throttle)

	  const observer = new MutationObserver(() => redirectIfShorts());

	  observer.observe(document.documentElement, { childList: true, subtree: true });



	  // Optional: also handle clicks to shorts links to avoid a brief flash

	  document.addEventListener(

	    "click",

	    (e) => {

	      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;

	      if (!a) return;

	      const newUrl = toWatchUrl(a.href);

	      if (newUrl) {

	        e.preventDefault();

	        location.assign(newUrl);

	      }

	    },

	    { capture: true }

	  );

	})()
