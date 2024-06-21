import './style.css'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

function initWidget(config, configUrl) {
  var iframe = document.createElement('iframe');
  iframe.src = "./widget/demo.html";
  document.body.appendChild(iframe);
}
initWidget()

setupCounter(document.querySelector('#counter'))
