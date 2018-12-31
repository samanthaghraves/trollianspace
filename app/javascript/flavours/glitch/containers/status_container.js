import React from 'react';
import { connect } from 'react-redux';
import Status from 'flavours/glitch/components/status';
import { makeGetStatus } from 'flavours/glitch/selectors';
import {
  replyCompose,
  mentionCompose,
  directCompose,
} from 'flavours/glitch/actions/compose';
import {
  reblog,
  favourite,
  bookmark,
  unreblog,
  unfavourite,
  unbookmark,
  pin,
  unpin,
} from 'flavours/glitch/actions/interactions';
import { blockAccount } from 'flavours/glitch/actions/accounts';
import { muteStatus, unmuteStatus, deleteStatus } from 'flavours/glitch/actions/statuses';
import { initMuteModal } from 'flavours/glitch/actions/mutes';
import { initReport } from 'flavours/glitch/actions/reports';
import { openModal } from 'flavours/glitch/actions/modal';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { boostModal, favouriteModal, deleteModal } from 'flavours/glitch/util/initial_state';

const messages = defineMessages({
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteMessage: { id: 'confirmations.delete.message', defaultMessage: 'Are you sure you want to delete this status?' },
  redraftConfirm: { id: 'confirmations.redraft.confirm', defaultMessage: 'Delete & redraft' },
  redraftMessage: { id: 'confirmations.redraft.message', defaultMessage: 'Are you sure you want to delete this status and re-draft it? You will lose all replies, boosts and favourites to it.' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
});

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();

  const mapStateToProps = (state, props) => {

    let status = getStatus(state, props);
    let reblogStatus = status ? status.get('reblog', null) : null;
    let account = undefined;
    let prepend = undefined;

    if (props.featured) {
      account = status.get('account');
      prepend = 'featured';
    } else if (reblogStatus !== null && typeof reblogStatus === 'object') {
      account = status.get('account');
      status = reblogStatus;
      prepend = 'reblogged_by';
    }

    return {
      containerId : props.containerId || props.id,  //  Should match reblogStatus's id for reblogs
      status      : status,
      account     : account || props.account,
      settings    : state.get('local_settings'),
      prepend     : prepend || props.prepend,
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, { intl }) => ({

  onReply (status, router) {
    dispatch(replyCompose(status, router));
  },

  onModalReblog (status) {
    dispatch(reblog(status));
  },

  onReblog (status, e) {
    if (status.get('reblogged')) {
      dispatch(unreblog(status));
    } else {
      if (e.shiftKey || !boostModal) {
        this.onModalReblog(status);
      } else {
        dispatch(openModal('BOOST', { status, onReblog: this.onModalReblog }));
      }
    }
  },

  onBookmark (status) {
    if (status.get('bookmarked')) {
      dispatch(unbookmark(status));
    } else {
      dispatch(bookmark(status));
    }
  },

  onModalFavourite (status) {
    dispatch(favourite(status));
  },

  onFavourite (status, e) {
    if (status.get('favourited')) {
      dispatch(unfavourite(status));
    } else {
      if (e.shiftKey || !favouriteModal) {
        this.onModalFavourite(status);
      } else {
        dispatch(openModal('FAVOURITE', { status, onFavourite: this.onModalFavourite }));
      }
    }
  },

  onPin (status) {
    if (status.get('pinned')) {
      dispatch(unpin(status));
    } else {
      dispatch(pin(status));
    }
  },

  onEmbed (status) {
    dispatch(openModal('EMBED', { url: status.get('url') }));
  },

  onDelete (status, withRedraft = false) {
    if (!deleteModal) {
      dispatch(deleteStatus(status.get('id'), withRedraft));
    } else {
      dispatch(openModal('CONFIRM', {
        message: intl.formatMessage(withRedraft ? messages.redraftMessage : messages.deleteMessage),
        confirm: intl.formatMessage(withRedraft ? messages.redraftConfirm : messages.deleteConfirm),
        onConfirm: () => dispatch(deleteStatus(status.get('id'), withRedraft)),
      }));
    }
  },

  onDirect (account, router) {
    dispatch(directCompose(account, router));
  },

  onMention (account, router) {
    dispatch(mentionCompose(account, router));
  },

  onOpenMedia (media, index) {
    dispatch(openModal('MEDIA', { media, index }));
  },

  onOpenVideo (media, time) {
    dispatch(openModal('VIDEO', { media, time }));
  },

  onBlock (account) {
    dispatch(openModal('CONFIRM', {
      message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong>@{account.get('acct')}</strong> }} />,
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => dispatch(blockAccount(account.get('id'))),
    }));
  },

  onReport (status) {
    dispatch(initReport(status.get('account'), status));
  },

  onMute (account) {
    dispatch(initMuteModal(account));
  },

  onMuteConversation (status) {
    if (status.get('muted')) {
      dispatch(unmuteStatus(status.get('id')));
    } else {
      dispatch(muteStatus(status.get('id')));
    }
  },

});

export default injectIntl(connect(makeMapStateToProps, mapDispatchToProps)(Status));
