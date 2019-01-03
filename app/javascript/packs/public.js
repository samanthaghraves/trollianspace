import loadPolyfills from '../mastodon/load_polyfills';
import ready from '../mastodon/ready';
import { start } from '../mastodon/common';

start();

window.addEventListener('message', e => {
  const data = e.data || {};

  if (!window.parent || data.type !== 'setHeight') {
    return;
  }

  ready(() => {
    window.parent.postMessage({
      type: 'setHeight',
      id: data.id,
      height: document.getElementsByTagName('html')[0].scrollHeight,
    }, '*');
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(sizeBioText);
    } else {
      sizeBioText();
    }
  });
});

function main() {
  const IntlMessageFormat = require('intl-messageformat').default;
  const { timeAgoString } = require('../mastodon/components/relative_timestamp');
  const { delegate } = require('rails-ujs');
  const emojify = require('../mastodon/features/emoji/emoji').default;
  const { getLocale } = require('../mastodon/locales');
  const { messages } = getLocale();
  const React = require('react');
  const ReactDOM = require('react-dom');
  const Rellax = require('rellax');
  const createHistory = require('history').createBrowserHistory;

  ready(() => {
    const locale = document.documentElement.lang;

    const dateTimeFormat = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });

    [].forEach.call(document.querySelectorAll('.emojify'), (content) => {
      content.innerHTML = emojify(content.innerHTML);
    });

    [].forEach.call(document.querySelectorAll('time.formatted'), (content) => {
      const datetime = new Date(content.getAttribute('datetime'));
      const formattedDate = dateTimeFormat.format(datetime);

      content.title = formattedDate;
      content.textContent = formattedDate;
    });

    [].forEach.call(document.querySelectorAll('time.time-ago'), (content) => {
      const datetime = new Date(content.getAttribute('datetime'));
      const now      = new Date();

      content.title = dateTimeFormat.format(datetime);
      content.textContent = timeAgoString({
        formatMessage: ({ id, defaultMessage }, values) => (new IntlMessageFormat(messages[id] || defaultMessage, locale)).format(values),
        formatDate: (date, options) => (new Intl.DateTimeFormat(locale, options)).format(date),
      }, datetime, now, datetime.getFullYear());
    });

    const reactComponents = document.querySelectorAll('[data-component]');

    if (reactComponents.length > 0) {
      import(/* webpackChunkName: "containers/media_container" */ '../mastodon/containers/media_container')
        .then(({ default: MediaContainer }) => {
          const content = document.createElement('div');

          ReactDOM.render(<MediaContainer locale={locale} components={reactComponents} />, content);
          document.body.appendChild(content);
        })
        .catch(error => console.error(error));
    }

    const parallaxComponents = document.querySelectorAll('.parallax');

    if (parallaxComponents.length > 0 ) {
      new Rellax('.parallax', { speed: -1 });
    }

    const history = createHistory();
    const detailedStatuses = document.querySelectorAll('.public-layout .detailed-status');
    const location = history.location;

    if (detailedStatuses.length === 1 && (!location.state || !location.state.scrolledToDetailedStatus)) {
      detailedStatuses[0].scrollIntoView();
      history.replace(location.pathname, { ...location.state, scrolledToDetailedStatus: true });
    }
    [].forEach.call(document.querySelectorAll('[data-component="Card"]'), (content) => {
      const props = JSON.parse(content.getAttribute('data-props'));
      ReactDOM.render(<CardContainer locale={locale} {...props} />, content);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(sizeBioText);
    } else {
      sizeBioText();
    }
  });
}


  const MAX_QUIRK_LENGTH = 30; // ???

<<<<<<< HEAD
  delegate(document, '#account_display_name', 'input', ({ target }) => {
    const name = document.querySelector('.card .display-name strong');
=======
  delegate(document, '#account_quirk', 'input', ({ target }) => {
    const quirkCounter = document.querySelector('.quirk-counter');
                                                            // Not sure about this selector...
                                                            // just copying the display name one above...
    const quirk         = document.querySelector('.card .quirk strong');

    if (quirkCounter) {
      quirkCounter.textContent = MAX_QUIRK_LENGTH - length(target.value);
    }
>>>>>>> 7dd17d4e7bf91bf58e88f009bd39c94b24ae0d62

    if (quirk) {
      quirk.innerHTML = target.value; // probably shouldn't need to emojify this, right?
    }
  });

<<<<<<< HEAD
  delegate(document, '#account_avatar', 'change', ({ target }) => {
    const avatar = document.querySelector('.card .avatar img');
    const [file] = target.files || [];
    const url = file ? URL.createObjectURL(file) : avatar.dataset.originalSrc;

    avatar.src = url;
  });

  delegate(document, '#account_header', 'change', ({ target }) => {
    const header = document.querySelector('.card .card__img img');
    const [file] = target.files || [];
    const url = file ? URL.createObjectURL(file) : header.dataset.originalSrc;

    header.src = url;
  });

  delegate(document, '#account_locked', 'change', ({ target }) => {
    const lock = document.querySelector('.card .display-name i');

    if (target.checked) {
      lock.style.display = 'inline';
    } else {
      lock.style.display = 'none';
    }
  });

  delegate(document, '.input-copy input', 'click', ({ target }) => {
    target.select();
  });

  delegate(document, '.input-copy button', 'click', ({ target }) => {
    const input = target.parentNode.querySelector('.input-copy__wrapper input');

    input.focus();
    input.select();

    try {
      if (document.execCommand('copy')) {
        input.blur();
        target.parentNode.classList.add('copied');

        setTimeout(() => {
          target.parentNode.classList.remove('copied');
        }, 700);
      }
    } catch (err) {
      console.error(err);
    }
  });
  delegate(document, '#account_note', 'input', sizeBioText);

  function sizeBioText() {
    const noteCounter = document.querySelector('.note-counter');
    const bioTextArea = document.querySelector('#account_note');

    if (noteCounter) {
      noteCounter.textContent = 413 - length(bioTextArea.value);
    }

    if (bioTextArea) {
      bioTextArea.style.height = 'auto';
      bioTextArea.style.height = (bioTextArea.scrollHeight+3) + 'px';
    }
  }
}
=======
  const MAX_REGEX_LENGTH = 30; // ???
   delegate(document, '#account_regex', 'input', ({ target }) => {
    const regexCounter = document.querySelector('.regex-counter');
    // Not sure about this selector...
    // just copying the display name one above...
    const regex         = document.querySelector('.card .regex strong');
     if (regexCounter) {
      regexCounter.textContent = MAX_REGEX_LENGTH - length(target.value);
    }
     if (regex) {
      regex.innerHTML = target.value; // probably shouldn't need to emojify this, right?
    }
  });
>>>>>>> 7dd17d4e7bf91bf58e88f009bd39c94b24ae0d62

  const MAX_QUIRK_LENGTH = 200; // ???
   delegate(document, '#account_quirk', 'input', ({ target }) => {
    const quirkCounter = document.querySelector('.quirk-counter');
                                                            // Not sure about this selector...
                                                            // just copying the display name one above...
    const quirk         = document.querySelector('.card .quirk strong');
     if (quirkCounter) {
      quirkCounter.textContent = MAX_QUIRK_LENGTH - length(target.value);
    }
     if (quirk) {
      quirk.innerHTML = target.value; // probably shouldn't need to emojify this, right?
    }
  });
   const MAX_REGEX_LENGTH = 200; // ???
   delegate(document, '#account_regex', 'input', ({ target }) => {
    const regexCounter = document.querySelector('.regex-counter');
    // Not sure about this selector...
    // just copying the display name one above...
    const regex         = document.querySelector('.card .regex strong');
     if (regexCounter) {
      regexCounter.textContent = MAX_REGEX_LENGTH - length(target.value);
    }
     if (regex) {
      regex.innerHTML = target.value; // probably shouldn't need to emojify this, right?
    }
  });

loadPolyfills().then(main).catch(error => {
  console.error(error);
});
