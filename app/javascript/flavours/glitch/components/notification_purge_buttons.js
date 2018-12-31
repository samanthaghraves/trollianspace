/**
 * Buttons widget for controlling the notification clearing mode.
 * In idle state, the cleaning mode button is shown. When the mode is active,
 * a Confirm and Abort buttons are shown in its place.
 */


//  Package imports  //
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';

const messages = defineMessages({
  btnAll : { id: 'notification_purge.btn_all', defaultMessage: 'Select\nall' },
  btnNone : { id: 'notification_purge.btn_none', defaultMessage: 'Select\nnone' },
  btnInvert : { id: 'notification_purge.btn_invert', defaultMessage: 'Invert\nselection' },
  btnApply : { id: 'notification_purge.btn_apply', defaultMessage: 'Clear\nselected' },
});

@injectIntl
export default class NotificationPurgeButtons extends ImmutablePureComponent {

  static propTypes = {
    onDeleteMarked : PropTypes.func.isRequired,
    onMarkAll : PropTypes.func.isRequired,
    onMarkNone : PropTypes.func.isRequired,
    onInvert : PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    markNewForDelete: PropTypes.bool,
  };

  render () {
    const { intl, markNewForDelete } = this.props;

    //className='active'
    return (
      <div className='column-header__notif-cleaning-buttons'>
        <button onClick={this.props.onMarkAll} className={markNewForDelete ? 'active' : ''}>
          <b>∀</b><br />{intl.formatMessage(messages.btnAll)}
        </button>

        <button onClick={this.props.onMarkNone} className={!markNewForDelete ? 'active' : ''}>
          <b>∅</b><br />{intl.formatMessage(messages.btnNone)}
        </button>

        <button onClick={this.props.onInvert}>
          <b>¬</b><br />{intl.formatMessage(messages.btnInvert)}
        </button>

        <button onClick={this.props.onDeleteMarked}>
          <i className='fa fa-trash' /><br />{intl.formatMessage(messages.btnApply)}
        </button>
      </div>
    );
  }

}
