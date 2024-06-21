import configuration from '/public/data/configuration.json';
const value = document.createElement('div');
value.innerHTML = configuration.display_options;
document.body.appendChild(value)