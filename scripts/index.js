import { format } from "date-fns";
import { de, es, ru } from "date-fns/locale";
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { toZonedTime } from 'date-fns-tz';
import conf from '/public/data/configuration.json' with { type: 'json' };
import deLang from '/public/data/de.json' with { type: 'json' };
import enLang from '/public/data/en.json' with { type: 'json' };
import esLang from '/public/data/es.json' with { type: 'json' };
import duLang from '/public/data/du.json' with { type: 'json' };
import ruLang from '/public/data/ru.json' with { type: 'json' };
const resources = { de: { translation: deLang }, en: { translation: enLang }, es: { translation: esLang }, du: { translation: duLang }, ru: { translation: ruLang } };

function getConfigQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const queryArray = queryString.split('&');
  
  queryArray.forEach(function(query) {
    const pair = query.split('=');
    const key = decodeURIComponent(pair[0]);
    let preValue = decodeURIComponent(pair[1] || '');
    if (pair[2]) {
      preValue+= '=' + decodeURIComponent(pair[2]);
    }
    const value = decodeURIComponent(preValue || '');
    params[key] = value;
  });

  return params;
}

let configuration = conf;
// updateWidget(configuration);
const params = getConfigQueryParams();
let configUrl  = 'https://contact.versacloud.io/data/configuration.json';
const getParams = () => {
  return new Promise((resolve, reject) => {
    if (params["config-url"]) {
      fetch(params["config-url"])
        .then((response) => response.json())
        .then((data) => {
          configUrl = params["config-url"];
          configuration = data;
          console.log(data);
          resolve();
        })
        .catch((error) => reject(error));
    } else {
      resolve();
    }
  });
};

getParams()
  .then(() => {
    // Your code that uses the configuration data
    updateWidget(configuration);
  })
  .catch((error) => {
    updateWidget(configuration);
    console.error('Error getting configuration data:', error);
  });


function updateWidget(configuration) {
  if (!configuration.active) document.querySelector(".contact-widget").style.display = 'none';
const ctaWidget = document.querySelector('.contact-widget-cta');
const widgetContainer = document.querySelector('.contact-widget-container');
const widgetTextContainer = document.querySelector('.contact-widget-text-container');
if (configuration.widget_alignment ===  "Left") {
  ctaWidget.style.left = '0';
  ctaWidget.style.right = 'auto';
  widgetContainer.style.left = '20px';
  widgetContainer.style.right = 'auto';
  widgetTextContainer.classList.remove('contact-widget-cta-right');
  widgetTextContainer.classList.add('contact-widget-cta-left');
  }
  if (configuration.display_options ===  "Round") {
    document.querySelector('.contact-widget-cta-container').style.borderRadius = '50%';
}

document.querySelector('#header').style.background = configuration.background_color;
document.querySelector('#footer').style.background = configuration.background_color;
document.querySelector('.contact-widget-cta-image').src = configuration.call_to_action_image;
document.querySelector('.contact-widget-inner-image').src = configuration.call_to_action_image;
document.querySelectorAll('.contact-widget-reply-info-response').forEach(el => el.textContent = configuration.response_time);
if (!configuration.show_business_hours) {
  const openingHoursLink = document.querySelector('#openingHoursLink')
  openingHoursLink.parentElement.removeChild(openingHoursLink);
  const openingHoursPage = document.querySelector('#openingHoursPage')
  openingHoursPage.parentElement.removeChild(openingHoursPage);
}

if (!configuration.enable_v_card_download) {
  const saveContact = document.querySelector('#saveContact')
  saveContact?.parentElement?.removeChild(saveContact);
}

const contactWidget = document.querySelector('.contact-widget');
const contactWidgetCta = document.querySelector('.contact-widget-cta');
const contactWidgetClose = document.querySelector('.contact-widget-close');
const contactWidgetOverlay = document.querySelector('.contact-widget-overlay');
const openChatBox = () => {
  if (contactWidget.classList.contains('contact-widget--is-visible')) {
    closeCTA();
    contactWidget.classList.remove('contact-widget--is-visible');
    window.parent.postMessage(`close, ${configuration.widget_alignment}`, '*');
  } else {
    closeCTA();
    setTimeout(() => {
      contactWidget.classList.add('contact-widget--is-visible');
    })
    window.parent.postMessage(`open, ${configuration.widget_alignment}`, '*');
  }
  if (!configuration.show_dark_background_overlay) {
    contactWidgetOverlay.style.position = 'static';
  }
};

contactWidgetCta.addEventListener('click', () => {
  openChatBox();
});

contactWidgetClose.addEventListener('click', () => {
  contactWidget.classList.remove('contact-widget--is-visible');
  window.parent.postMessage(`close, ${configuration.widget_alignment}`, '*');
});

contactWidgetOverlay.addEventListener('click', () => {
  contactWidget.classList.remove('contact-widget--is-visible');
  window.parent.postMessage(`close, ${configuration.widget_alignment}`, '*');
  document.querySelector('.contact-widget-subpage--is-visible')?.classList.remove('contact-widget-subpage--is-visible');
});

window.addEventListener('message', event => {
  if (event.data === "close") {
    contactWidget.classList.remove('contact-widget--is-visible');
    window.parent.postMessage(`close, ${configuration.widget_alignment}`, '*');
    document.querySelector('.contact-widget-subpage--is-visible')?.classList.remove('contact-widget-subpage--is-visible');
  }
}, false);

const contactWidgetOpenHoursLink = document.querySelector('.contact-widget-open-hours-link');
const contactWidgetOpenHoursClose = document.querySelector('.contact-widget-open-hours-close');
const contactWidgetOpenHours = document.querySelector('.contact-widget-open-hours');
const currentDateZoned = toZonedTime(new Date(), configuration.timezone);

contactWidgetOpenHoursLink?.addEventListener('click', () => {
  contactWidgetOpenHours.classList.add('contact-widget-subpage--is-visible');
  document.querySelector('.contact-widget-open-hours-local-time').textContent = configuration.business_hours_24h_format ? format(currentDateZoned, 'HH:mm') : format(currentDateZoned, 'h:mm a');
});

contactWidgetOpenHoursClose?.addEventListener('click', () => {
  contactWidgetOpenHours.classList.remove('contact-widget-subpage--is-visible');
});

function renderButtons() {
  const contactMethods = {
    whats_app: "watsapp",
    facebook_messenger: "messenger",
    phone_number: "call",
    sms: "sms",
    call_back: "callback",
    twitter: "twitter",
    telegram: "telegram",
    viber: "viber"
  };

  for (const key in contactMethods) {
    if (!configuration[key]) {
      const button = document.querySelector(`.contact-widget-button--${contactMethods[key]}`);
      button.parentElement.removeChild(button);
    }
  }
}

renderButtons();

document.querySelectorAll('.contact-widget-subpage-open').forEach((item) => {
  item.addEventListener('click', () => {
    console.log(item);
    const subpage = document.querySelector(`.${item.getAttribute('data-for')}`);
    const formattedTime = format(currentDateZoned, "h:mm aa");
    subpage.querySelector('.contact-widget-reply-info b').textContent = formattedTime;

    subpage.classList.add('contact-widget-subpage--is-visible');
  });
});

document.querySelectorAll('.contact-widget-subpage-close').forEach((item) => {
  item.addEventListener('click', () => {
    const subpage = item.closest('.contact-widget-subpage');
    subpage.classList.remove('contact-widget-subpage--is-visible');
  });
});

const contactWidgetEmail = document.querySelector('.contact-widget-email');
contactWidgetEmail.textContent = configuration.customer_support_email;
contactWidgetEmail.href = `mailto:${configuration.customer_support_email}?subject=${configuration.sent_from_message}`;

document.getElementById('sendMessageButton').addEventListener('click', async function() {
  const form = document.getElementById('contactMessageForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const formData = new FormData(form);

  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    body: formData.get('text'),
    'config_url': configUrl
  };

  try {
    const response = await fetch('https://contact.versacloud.io/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(data).toString()
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Email sent successfully:', responseData);
    } else {
      console.error('Failed to send email:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

document.getElementById('callbackButton').addEventListener('click', async function(event) {
  event.preventDefault();

  const form = document.getElementById('callbackForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const formData = new FormData(form);

  const data = {
    name: formData.get('name'),
    phone: formData.get('tel'),
    'config_url': configUrl
  };

  try {
    const response = await fetch('https://contact.versacloud.io/api/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(data).toString()
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Callback request sent successfully:', responseData);
    } else {
      console.error('Failed to send callback request:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});


const contactWidgetPhone = document.querySelector('.contact-widget-phone');
contactWidgetPhone.textContent = configuration.phone_number;
contactWidgetPhone.href = `tel:${configuration.phone_number}`;
document.getElementById('phone-button').href = `tel:${configuration.phone_number}`;

const contactWidgetSms = document.querySelector('.contact-widget-sms');
contactWidgetSms.textContent = configuration.sms;
contactWidgetSms.href = `sms:${configuration.sms}`;

document.getElementById('whatsapp-button').addEventListener('click', function() {
  const whatsappMessage = document.querySelector('.contact-widget-watsapp-textarea').value;
  window.open("https://wa.me/"+configuration.whats_app+"?text="+encodeURIComponent(whatsappMessage));
});

document.getElementById('fmessenger-button').addEventListener('click', function() {
  window.open('https://m.me/'+configuration.facebook_messenger);    
});

document.getElementById('twitter-button').addEventListener('click', function() {
  const twitterUrl = `https://twitter.com/messages/compose?recipient_id=${configuration.twitter}`;
  window.open(twitterUrl, '_blank');    
});

document.getElementById('telegram-button').addEventListener('click', function() {
  window.open(`https://t.me/${configuration.telegram}`, '_blank');
});

document.getElementById('viber-button').addEventListener('click', function() {
  window.open(`viber://chat?number=${configuration.viber}`, '_blank');
});

const ctaTextElement = document.getElementById('cta_text');
const dotsElement = document.querySelector('.dots');

function typeMessage(message, index) {
    if (index < message.length) {
        ctaTextElement.textContent += message.charAt(index);
        dotsElement.style.visibility = 'hidden';
        setTimeout(() => typeMessage(message, index + 1), 25);
    } else {
        ctaTextElement.style.visibility = 'visible';
        dotsElement.style.visibility = 'hidden';
        closeCTAcase();
    }
}

if (configuration.hide_call_to_action_text !== "Always") {
  setTimeout(() => {
    typeMessage(configuration.call_to_action_text || i18next.t('ctaText'), 0);
  }, 5000);
}
function closeCTA() {
  const ctaElement = document.querySelector('.contact-widget-text-container');
  ctaElement.style.display = 'none';
}

function closeCTAcase(){
  switch (configuration.hide_call_to_action_text) {
    case 'When widget is clicked':
      document.querySelector('.contact-widget-cta').addEventListener('click', () => {
        closeCTA();
      });
      break;
    case "After 5 seconds":
      setTimeout(() => {
        closeCTA();
      }, 5000);
      break;
    case "After 10 seconds":
      setTimeout(() => {
        closeCTA();
      }, 10000);
      break;
    case "After 20 seconds":
      setTimeout(() => {
        closeCTA();
      }, 20000);
      break;
  }
}

if (configuration.video_welcome_message) {
  document.querySelector('#videoMessage iframe').src = configuration.video_welcome_message;
} else {
  document.querySelector('#videoMessage').style.display = 'none';
}

function openingOfChatBox() {
  switch(configuration.chatbox_triggers) {
    case "On load":
      openChatBox();
      break;
    case "After 5 seconds":
      setTimeout(openChatBox, 5000);
      break;
    case "After 30 seconds":
      setTimeout(openChatBox, 30000);
      break;
    case "When scrolled 50%":
      window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        if (scrollPosition >= documentHeight / 2) {
          openChatBox();
        }
      });
      break;
    case "When scrolled to bottom":
      window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        if (scrollPosition >= documentHeight) {
          openChatBox();
        }
      });
      break;
    case "Exit intent":
      document.addEventListener('mouseleave', (event) => {
        if (event.clientY <= 0) {
          openChatBox();
        }
      });
      break;
  }
}

openingOfChatBox();

const vCardData = `
  BEGIN:VCARD
  VERSION:3.0
  FN:${configuration.company_name}
  ORG:${configuration.company_name}
  TEL;TYPE=WORK,VOICE:${configuration.phone_number}
  EMAIL:${configuration.customer_support_email}
  ADR;CHARSET=UTF-8;TYPE=WORK:;;${configuration.street};${configuration.city};;;${configuration.country}
  END:VCARD
`;

function generateVCardFile(vCardData) {
  const blob = new Blob([vCardData], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  return url;
}

// function generateVCardDataUrl(vCardData) {
//   const vCardDataBase64 = btoa(vCardData);
//   return `data:text/vcard;base64,${vCardDataBase64}`;
// }

document.getElementById('saveContact')?.addEventListener('click', function() {
  const vCardUrl = generateVCardFile(vCardData);
  const link = document.createElement('a');
  link.href = vCardUrl;
  link.download = `${configuration.company_name.trim().split(' ').join('_')}.vcf`;
  // document.body.appendChild(link);
  // link.click();
  // document.body.removeChild(link);
  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  link.dispatchEvent(clickEvent);
  URL.revokeObjectURL(vCardUrl);
  
  // const vCardDataUrl = generateVCardDataUrl(vCardData);
  // const link = document.createElement('a');
  // link.href = vCardDataUrl;
  // link.download = `${configuration.company_name.trim().split(' ').join('_')}.vcf`;
  // document.body.appendChild(link);
  // link.click();
  // document.body.removeChild(link);
});

const getWidgetLanguage = () => {
  switch (configuration.widget_language) {
    case 'English':
      return 'en';
    case 'Español':
      return 'es';
    case 'Deutsch Du':
      return 'du';
    case 'Russian':
      return 'ru';
    case 'Deutsch Sie':
      return 'de';
    case "Automatic browser language detection":
      return undefined;
    default:
      return 'de';
  }
}

i18next.use(LanguageDetector).init({
  resources,
  lng: getWidgetLanguage(),
  fallbackLng: 'de',
  detection: {
    order: ['navigator'],
  }
}, function(err, t) {
  if (err) return console.error(err);
  
  updateContent();
});

document.getElementById('show-route-button').addEventListener('click', function() {
  const address = `${configuration.street}, ${configuration.city}}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  window.open(mapsUrl, '_blank');
});

function updateContent() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = i18next.t(key);
  });
  document.querySelectorAll('textarea').forEach(el => el.placeholder = i18next.t('textareaPlaceholder'));
  document.querySelectorAll('input[name="name"]').forEach(el => el.placeholder = i18next.t('namePlaceholder'));
  document.querySelectorAll('input[name="email"]').forEach(el => el.placeholder = i18next.t('emailPlaceholder'));
  document.querySelectorAll('input[name="tel"]').forEach(el => el.placeholder = i18next.t('telPlaceholder'));
  document.querySelectorAll('.contact-widget-reply-info-response').forEach(el => el.textContent = i18next.t('response'+configuration.response_time.split(' ').pop()));
  }

  const getDateFnsLocale = () => {
    switch (i18next.t('language')) {
      case 'en':
        return undefined;
      case 'ru':
        return ru;
      case 'es':
        return es;
      default:
        return de;
    }
  };
  
  document.querySelector('#welcomeMessage').textContent = configuration.welcome_message;
  const locale = getDateFnsLocale();
  document.querySelector('.contact-widget-local-time').textContent = format(currentDateZoned, 'eeee, MMMM do', { locale });
  
  const timeToAmPm = (time) => {
    const [hours, minutes] = time.split(':');
    const amPm = +hours >= 12 ? 'PM' : 'AM';
    const hours12 = +hours % 12 || 12;
    return `${hours12}:${minutes} ${amPm}`;
  };
  
  const getCurrentDay = () => {
    return format(currentDateZoned, 'eeee');
  };
  
  const getCurrentDayLocale = () => {
    return format(currentDateZoned, 'eeee', { locale });
  };
  
  const daysMapping = {
    "Montag": "Monday",
    "Dienstag": "Tuesday",
    "Mittwoch": "Wednesday",
    "Donnerstag": "Thursday",
    "Freitag": "Friday",
    "Samstag": "Saturday",
    "Sonntag": "Sunday"
  };
  
  const addNewTimeData = (dayRow, openTime, closeTime) => {
    const openCell = dayRow.querySelector('.opens');
    const closeCell = dayRow.querySelector('.closes');
  
    openCell.innerHTML += `<br>${openTime}`;
    closeCell.innerHTML += `<br>${closeTime}`;
  };
  
  const currentDay = getCurrentDay();
  const currentTime = currentDateZoned;
  let isOpen = false;
  
  const openText = i18next.t("openText");
  const closedText = i18next.t("closedText");
  
  configuration.show_business_hours && configuration.opening_hours.forEach((entry) => {
    const [day, times] = entry.split(": ");
    const mappedDay = daysMapping[day];
    const [openTimeCheck, closeTimeCheck] = times.includes("Geschlossen") ? ["", openText.split(' ')[1]] : times.replace(' Uhr', '').split('–');
    const [openTime, closeTime] = times.includes("Geschlossen") ? ["", openText.split(' ')[1]] : times.replace(' Uhr', '').split('–').map(time => timeToAmPm(time.trim()));
  
    const openTimeToPaste = configuration.business_hours_24h_format ? openTimeCheck : openTime;
    const closeTimeToPaste = configuration.business_hours_24h_format ? closeTimeCheck : closeTime;
    const dayRow = document.querySelector(`#${mappedDay}`);
    const dayCell = dayRow.querySelector('.day');
    dayCell.textContent = i18next.t('weekdays' + mappedDay);
  
    if (currentDay === mappedDay) {
      dayRow.classList.add('contact-widget-open-hours-today');
  
      if (!times.includes("Geschlossen")) {
        const fixedCurrentTime = format(currentTime, 'HH:mm');  
        const compareTime = (currentTime, openTime, closeTime) => {
          const currentDateTime = parseTime(currentTime);
          const openDateTime = parseTime(openTime);
          const closeDateTime = parseTime(closeTime);
          
          return currentDateTime >= openDateTime && currentDateTime < closeDateTime;
        };
        
        const parseTime = (timeString) => {
          const [hours, minutes] = timeString.split(':');
          const date = currentDateZoned;
          date.setHours(parseInt(hours, 10));
          date.setMinutes(parseInt(minutes, 10));
          date.setSeconds(0);
          return date;
        };
        if (compareTime(fixedCurrentTime, openTimeCheck, closeTimeCheck)) {
          isOpen = true;
        }
  
        document.querySelector(".hours-status").textContent = isOpen ? openText : closedText;
        if (isOpen) {
          document.querySelector('.contact-widget-open-hours-status').classList.add('open');
        }
        document.querySelector(".today_status").textContent = isOpen
          ? `${openText.split(' ')[1]} (${getCurrentDayLocale()} ${openTimeToPaste} - ${closeTimeToPaste})`
          : `${closedText.split(' ')[1]} (${getCurrentDayLocale()} ${openTimeToPaste} - ${closeTimeToPaste})`;
      } else {
        document.querySelector(".hours-status").textContent = closedText;
        document.querySelector(".today_status").textContent = closedText.split(' ')[1];
      }
    }
  
    if (times.includes("Geschlossen")) {
      document.querySelector(`#${mappedDay} .opens`).textContent = '';
      document.querySelector(`#${mappedDay} .closes`).textContent = closedText.split(' ')[1];
    } else {
      if (dayRow.querySelector('.opens').textContent === '') {
        document.querySelector(`#${mappedDay} .opens`).textContent = openTimeToPaste;
        document.querySelector(`#${mappedDay} .closes`).textContent = closeTimeToPaste;
      } else {
        addNewTimeData(dayRow, openTimeToPaste, closeTimeToPaste);
      }
    }
  });
}