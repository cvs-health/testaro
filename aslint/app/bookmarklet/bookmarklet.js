/* eslint-disable no-invalid-this */
(function (global) {
  let timeout = null;

  const options = {
    asyncRunner: false,
    context: document.documentElement,
    includeElementReference: true,
    includeHidden: true,
    reportFormat: {
      JSON: true
    },
    watchDomChanges: false
  };

  const appInstance = document.getElementById('aslintBox');

  if (appInstance) {
    appInstance.parentNode.removeChild(appInstance);
  }

  const message = '<div id="aslintInitMessage" style="position: fixed; top: 0; left: 0; margin: 0; padding: 0; box-shadow: none; font-size: 1em; text-align: center; width: 100%; background: transparent; z-index: 999999"><p style="background: {%background%}; border-radius: 3px; color: white; margin: 0.25em auto 0; padding: 0.25em 0.75em; display: inline-block;">{%message%}</p></div>';

  const hideMessage = () => {
    const el = document.getElementById('aslintInitMessage');

    if (el === null) {
      return;
    }

    el.parentNode.removeChild(el);
  };

  const showMessage = (msg) => {
    hideMessage();

    if (typeof timeout === 'number') {
      clearTimeout(timeout);
      timeout = null;
    }

    const fragment = document.createDocumentFragment();
    const div = document.createElement('div');

    div.innerHTML = msg;

    while (div.firstChild) {
      fragment.appendChild(div.firstChild);
    }

    document.body.appendChild(fragment.querySelector('#aslintInitMessage'));
  };

  showMessage(
    message
      .replace('{%background%}', 'black')
      .replace('{%message%}', 'Loading ASLint')
  );

  const script = document.createElement('script');

  script.type = 'text/javascript';
  script.async = true;
  script.src = `https://localhost.aslint.org/aslint.bundle.js?ver=latest&now=${Date.now()}`;

  const onAslintLoaded = () => {
    hideMessage();

    if (typeof global.aslint === 'undefined') {
      showMessage(message.replace('{%background%}', 'red').replace('{%message%}', 'ASLint is not available. One of the reason could be Content Security Policy.'));

      return;
    }

    global.aslint
      .config(options)
      .run()
      .then((res) => {
        console.log('Resolved: ', res);
      })
      .catch((err) => {
        console.error('[ASLint error]', err);
      });
  };

  const onAslintLoadError = (err) => {
    console.error(err);

    showMessage(
      message
        .replace('{%background%}', 'red')
        .replace('{%message%}', 'Failed to load ASLint')
    );

    timeout = setTimeout(() => {
      hideMessage();
    }, 5000);
  };

  const onGlobalError = (err) => {
    console.error(err);
  };

  script.addEventListener('load', onAslintLoaded);
  script.addEventListener('error', onAslintLoadError);
  window.addEventListener('error', onGlobalError);

  document.head.insertBefore(script, document.head.firstChild);
}(this));
