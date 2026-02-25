(function () {
  const script = document.currentScript;
  const tenantId = script?.dataset?.chatbotId;
  const widgetBaseUrl = script?.dataset?.chatbotUrl || 'http://localhost:3000/widget';

  if (!tenantId) {
    console.error('[Chatbot Widget] Missing data-chatbot-id attribute.');
    return;
  }

  const launcher = document.createElement('button');
  launcher.innerText = '💬';
  launcher.setAttribute('aria-label', 'Open chat support');
  launcher.style.cssText = 'position:fixed;right:24px;bottom:24px;width:56px;height:56px;border-radius:999px;border:none;background:#2563eb;color:#fff;font-size:24px;box-shadow:0 10px 24px rgba(0,0,0,.2);cursor:pointer;z-index:999998;';

  const frameWrap = document.createElement('div');
  frameWrap.style.cssText = 'position:fixed;right:24px;bottom:90px;width:min(380px,calc(100vw - 20px));height:min(640px,calc(100vh - 120px));display:none;z-index:999999;';

  const iframe = document.createElement('iframe');
  iframe.src = `${widgetBaseUrl}/${tenantId}`;
  iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:16px;overflow:hidden;background:transparent;';
  iframe.allow = 'clipboard-write';

  frameWrap.appendChild(iframe);
  launcher.addEventListener('click', function () {
    frameWrap.style.display = frameWrap.style.display === 'none' ? 'block' : 'none';
  });

  document.body.appendChild(launcher);
  document.body.appendChild(frameWrap);
})();
