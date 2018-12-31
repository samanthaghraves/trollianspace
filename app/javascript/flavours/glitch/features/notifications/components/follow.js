//  Package imports.
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { HotKeys } from 'react-hotkeys';

// Our imports.
import Permalink from 'flavours/glitch/components/permalink';
import AccountContainer from 'flavours/glitch/containers/account_container';
import NotificationOverlayContainer from '../containers/overlay_container';

export default class NotificationFollow extends ImmutablePureComponent {

  static propTypes = {
    hidden: PropTypes.bool,
    id: PropTypes.string.isRequired,
    account: ImmutablePropTypes.map.isRequired,
    notification: ImmutablePropTypes.map.isRequired,
  };

  handleMoveUp = () => {
    const { notification, onMoveUp } = this.props;
    onMoveUp(notification.get('id'));
  }

  handleMoveDown = () => {
    const { notification, onMoveDown } = this.props;
    onMoveDown(notification.get('id'));
  }

  handleOpen = () => {
    this.handleOpenProfile();
  }

  handleOpenProfile = () => {
    const { notification } = this.props;
    this.context.router.history.push(`/accounts/${notification.getIn(['account', 'id'])}`);
  }

  handleMention = e => {
    e.preventDefault();

    const { notification, onMention } = this.props;
    onMention(notification.get('account'), this.context.router.history);
  }

  getHandlers () {
    return {
      moveUp: this.handleMoveUp,
      moveDown: this.handleMoveDown,
      open: this.handleOpen,
      openProfile: this.handleOpenProfile,
      mention: this.handleMention,
      reply: this.handleMention,
    };
  }

  render () {
    const { account, notification, hidden } = this.props;

    //  Links to the display name.
    const displayName = account.get('display_name_html') || account.get('username');
    const link = (
      <Permalink
        className='notification__display-name'
        href={account.get('url')}
        title={account.get('acct')}
        to={`/accounts/${account.get('id')}`}
        dangerouslySetInnerHTML={{ __html: displayName }}
      />
    );

    //  Renders.
    return (
      <HotKeys handlers={this.getHandlers()}>
        <div className='notification notification-follow focusable' tabIndex='0'>
          <div className='notification__message'>
            <div className='notification__favourite-icon-wrapper'>
              <i className='fa fa-fw fa-user-plus' />
            </div>

            <FormattedMessage
              id='notification.follow'
              defaultMessage='{name} followed you'
              values={{ name: link }}
            />
          </div>

          <AccountContainer hidden={hidden} id={account.get('id')} withNote={false} />
          <NotificationOverlayContainer notification={notification} />
        </div>
      </HotKeys>
    );
  }

}
