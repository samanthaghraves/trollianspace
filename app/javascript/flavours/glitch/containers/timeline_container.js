import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import configureStore from 'flavours/glitch/store/configureStore';
import { hydrateStore } from 'flavours/glitch/actions/store';
import { IntlProvider, addLocaleData } from 'react-intl';
import { getLocale } from 'mastodon/locales';
import PublicTimeline from 'flavours/glitch/features/standalone/public_timeline';
import CommunityTimeline from 'flavours/glitch/features/standalone/community_timeline';
import HashtagTimeline from 'flavours/glitch/features/standalone/hashtag_timeline';
import ModalContainer from 'flavours/glitch/features/ui/containers/modal_container';
import initialState from 'flavours/glitch/util/initial_state';

const { localeData, messages } = getLocale();
addLocaleData(localeData);

const store = configureStore();

if (initialState) {
  store.dispatch(hydrateStore(initialState));
}

export default class TimelineContainer extends React.PureComponent {

  static propTypes = {
    locale: PropTypes.string.isRequired,
    hashtag: PropTypes.string,
    showPublicTimeline: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    showPublicTimeline: initialState.settings.known_fediverse,
  };

  render () {
    const { locale, hashtag, showPublicTimeline } = this.props;

    let timeline;

    if (hashtag) {
      timeline = <HashtagTimeline hashtag={hashtag} />;
    } else if (showPublicTimeline) {
      timeline = <PublicTimeline />;
    } else {
      timeline = <CommunityTimeline />;
    }

    return (
      <IntlProvider locale={locale} messages={messages}>
        <Provider store={store}>
          <Fragment>
            {timeline}
            {ReactDOM.createPortal(
              <ModalContainer />,
              document.getElementById('modal-container'),
            )}
          </Fragment>
        </Provider>
      </IntlProvider>
    );
  }

}
