import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import Button from 'flavours/glitch/components/button';
import StatusContent from 'flavours/glitch/components/status_content';
import Avatar from 'flavours/glitch/components/avatar';
import RelativeTimestamp from 'flavours/glitch/components/relative_timestamp';
import DisplayName from 'flavours/glitch/components/display_name';
import ImmutablePureComponent from 'react-immutable-pure-component';

const messages = defineMessages({
  favourite: { id: 'status.favourite', defaultMessage: 'Favourite' },
});

@injectIntl
export default class FavouriteModal extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    status: ImmutablePropTypes.map.isRequired,
    onFavourite: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.button.focus();
  }

  handleFavourite = () => {
    this.props.onFavourite(this.props.status);
    this.props.onClose();
  }

  handleAccountClick = (e) => {
    if (e.button === 0) {
      e.preventDefault();
      this.props.onClose();
      this.context.router.history.push(`/accounts/${this.props.status.getIn(['account', 'id'])}`);
    }
  }

  setRef = (c) => {
    this.button = c;
  }

  render () {
    const { status, intl } = this.props;

    return (
      <div className='modal-root__modal favourite-modal'>
        <div className='favourite-modal__container'>
          <div className='status light'>
            <div className='favourite-modal__status-header'>
              <div className='favourite-modal__status-time'>
                <a href={status.get('url')} className='status__relative-time' target='_blank' rel='noopener'><RelativeTimestamp timestamp={status.get('created_at')} /></a>
              </div>

              <a onClick={this.handleAccountClick} href={status.getIn(['account', 'url'])} className='status__display-name'>
                <div className='status__avatar'>
                  <Avatar account={status.get('account')} size={48} />
                </div>

                <DisplayName account={status.get('account')} />
              </a>
            </div>

            <StatusContent status={status} />
          </div>
        </div>

        <div className='favourite-modal__action-bar'>
          <div><FormattedMessage id='favourite_modal.combo' defaultMessage='You can press {combo} to skip this next time' values={{ combo: <span>Shift + <i className='fa fa-star' /></span> }} /></div>
          <Button text={intl.formatMessage(messages.favourite)} onClick={this.handleFavourite} ref={this.setRef} />
        </div>
      </div>
    );
  }

}
