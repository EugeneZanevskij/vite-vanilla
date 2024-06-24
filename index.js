(function() {
  function loadJSON(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'json';
      xhr.onload = function() {
          var status = xhr.status;
          if (status === 200) {
              callback(null, xhr.response);
          } else {
              callback(status, xhr.response);
          }
      };
      xhr.send();
  }

  var currentScript=document.querySelector('script[data-config-url]');
  var pathname = window.location.pathname;
  var configUrl = currentScript?.getAttribute('data-config-url')|| '';
  if (configUrl === '') {
      switch (pathname) {
          case '/demo_1.html':
              configUrl = 'https://vite-vanilla-olive.vercel.app/data/configuration_1.json';
              break;
            case '/demo_3.html':
                configUrl = 'https://vite-vanilla-olive.vercel.app/data/configuration_3.json';
              break;
          default:
              configUrl = 'https://vite-vanilla-olive.vercel.app/data/configuration.json';
      }
  }

  function initWidget(config, configUrl) {
    var iframe = document.createElement('iframe');
    console.log(config);
    iframe.src = config.widgetSrc + '?config-url=' + configUrl;
    iframe.style = `position: fixed;z-index: 9999;bottom: 0;max-width: 450px;width: 100%;height: 120px;border: none;${config.widget_alignment === "Right" ? 'right: 0;' : 'left: 0;'}`;
    document.body.appendChild(iframe);
  }

  window.addEventListener('message', function(event) {
    const messagesString = event.data.toString();
    const messages = messagesString.split(',').map(message => message.trim());
    if (messages[0]==="open") {
        this.document.querySelector('iframe').style = `position: fixed;z-index: 10000;bottom: 0;width: 100%;height: 100%;border: none;${messages[1] === "Right" ? 'right: 0;' : 'left: 0;'}`;
    } else if (messages[0]==="close") {
        this.setTimeout(function() {
            this.document.querySelector('iframe').style = `position: fixed;width: 120px;height: 120px;z-index: 9999;bottom: 0;border: none;${messages[1] === "Right" ? 'right: 0;' : 'left: 0;'}`;
        }, 100)
    }
  });

  if (configUrl) {
      loadJSON(configUrl, function(err, config) {
          if (err !== null) {
              console.error('Error loading configuration:', err);
          } else {
              initWidget(config, configUrl);
          }
      });
  } else {
      console.error('No configuration URL provided.');
  }
})();
