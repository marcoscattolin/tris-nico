(function () {
  const PUB_ID = 'pub-1324858277403968';

  const s = document.createElement('script');
  s.async = true;
  s.setAttribute('data-cfasync', 'false');
  s.src = 'https://fundingchoicesmessages.google.com/i/' + PUB_ID + '?ers=1';
  document.head.appendChild(s);

  function signalGooglefcPresent() {
    if (window.frames['googlefcPresent']) return;
    if (!document.body) { setTimeout(signalGooglefcPresent, 0); return; }
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;display:none;';
    iframe.name = 'googlefcPresent';
    document.body.appendChild(iframe);
  }
  signalGooglefcPresent();
})();
