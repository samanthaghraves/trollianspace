import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { fetchStatus } from 'flavours/glitch/actions/statuses';
import MissingIndicator from 'flavours/glitch/components/missing_indicator';
import DetailedStatus from './components/detailed_status';
import ActionBar from './components/action_bar';
import Column from 'flavours/glitch/features/ui/components/column';
import {
  favourite,
  unfavourite,
  bookmark,
  unbookmark,
  reblog,
  unreblog,
  pin,
  unpin,
} from 'flavours/glitch/actions/interactions';
import {
  replyCompose,
  mentionCompose,
  directCompose,
} from 'flavours/glitch/actions/compose';
import { blockAccount } from 'flavours/glitch/actions/accounts';
import { muteStatus, unmuteStatus, deleteStatus } from 'flavours/glitch/actions/statuses';
import { initMuteModal } from 'flavours/glitch/actions/mutes';
import { initReport } from 'flavours/glitch/actions/reports';
import { makeGetStatus } from 'flavours/glitch/selectors';
import { ScrollContainer } from 'react-router-scroll-4';
import ColumnBackButton from 'flavours/glitch/components/column_back_button';
import ColumnHeader from '../../components/column_header';
import StatusContainer from 'flavours/glitch/containers/status_container';
import { openModal } from 'flavours/glitch/actions/modal';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { HotKeys } from 'react-hotkeys';
import { boostModal, favouriteModal, deleteModal } from 'flavours/glitch/util/initial_state';
import { attachFullscreenListener, detachFullscreenListener, isFullscreen } from 'flavours/glitch/util/fullscreen';

const messages = defineMessages({
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteMessage: { id: 'confirmations.delete.message', defaultMessage: 'Are you sure you want to delete this status?' },
  redraftConfirm: { id: 'confirmations.redraft.confirm', defaultMessage: 'Delete & redraft' },
  redraftMessage: { id: 'confirmations.redraft.message', defaultMessage: 'Are you sure you want to delete this status and re-draft it? You will lose all replies, boosts and favourites to it.' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  revealAll: { id: 'status.show_more_all', defaultMessage: 'Show more for all' },
  hideAll: { id: 'status.show_less_all', defaultMessage: 'Show less for all' },
});

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();

  const mapStateToProps = (state, props) => ({
    status: getStatus(state, { id: props.params.statusId }),
    settings: state.get('local_settings'),
    ancestorsIds: state.getIn(['contexts', 'ancestors', props.params.statusId]),
    descendantsIds: state.getIn(['contexts', 'descendants', props.params.statusId]),
  });

  return mapStateToProps;
};

@injectIntl
@connect(makeMapStateToProps)
export default class Status extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    status: ImmutablePropTypes.map,
    settings: ImmutablePropTypes.map.isRequired,
    ancestorsIds: ImmutablePropTypes.list,
    descendantsIds: ImmutablePropTypes.list,
    intl: PropTypes.object.isRequired,
  };

  state = {
    fullscreen: false,
    isExpanded: false,
    threadExpanded: null,
  };

  componentWillMount () {
    this.props.dispatch(fetchStatus(this.props.params.statusId));
  }

  componentDidMount () {
    attachFullscreenListener(this.onFullScreenChange);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.statusId !== this.props.params.statusId && nextProps.params.statusId) {
      this._scrolledIntoView = false;
      this.props.dispatch(fetchStatus(nextProps.params.statusId));
    }
  }

  handleExpandedToggle = () => {
    if (this.props.status.get('spoiler_text')) {
      this.setExpansion(!this.state.isExpanded);
    }
  };

  handleModalFavourite = (status) => {
    this.props.dispatch(favourite(status));
  }

  handleFavouriteClick = (status, e) => {
    if (status.get('favourited')) {
      this.props.dispatch(unfavourite(status));
    } else {
      if (e.shiftKey || !favouriteModal) {
        this.handleModalFavourite(status);
      } else {
        this.props.dispatch(openModal('FAVOURITE', { status, onFavourite: this.handleModalFavourite }));
      }
    }
  }

  handlePin = (status) => {
    if (status.get('pinned')) {
      this.props.dispatch(unpin(status));
    } else {
      this.props.dispatch(pin(status));
    }
  }

  handleReplyClick = (status) => {
    this.props.dispatch(replyCompose(status, this.context.router.history));
  }

  handleModalReblog = (status) => {
    this.props.dispatch(reblog(status));
  }

  handleReblogClick = (status, e) => {
    if (status.get('reblogged')) {
      this.props.dispatch(unreblog(status));
    } else {
      if (e.shiftKey || !boostModal) {
        this.handleModalReblog(status);
      } else {
        this.props.dispatch(openModal('BOOST', { status, onReblog: this.handleModalReblog }));
      }
    }
  }

  handleBookmarkClick = (status) => {
    if (status.get('bookmarked')) {
      this.props.dispatch(unbookmark(status));
    } else {
      this.props.dispatch(bookmark(status));
    }
  }

  handleDeleteClick = (status, withRedraft = false) => {
    const { dispatch, intl } = this.props;

    if (!deleteModal) {
      dispatch(deleteStatus(status.get('id'), withRedraft));
    } else {
      dispatch(openModal('CONFIRM', {
        message: intl.formatMessage(withRedraft ? messages.redraftMessage : messages.deleteMessage),
        confirm: intl.formatMessage(withRedraft ? messages.redraftConfirm : messages.deleteConfirm),
        onConfirm: () => dispatch(deleteStatus(status.get('id'), withRedraft)),
      }));
    }
  }

  handleDirectClick = (account, router) => {
    this.props.dispatch(directCompose(account, router));
  }

  handleMentionClick = (account, router) => {
    this.props.dispatch(mentionCompose(account, router));
  }

  handleOpenMedia = (media, index) => {
    this.props.dispatch(openModal('MEDIA', { media, index }));
  }

  handleOpenVideo = (media, time) => {
    this.props.dispatch(openModal('VIDEO', { media, time }));
  }

  handleMuteClick = (account) => {
    this.props.dispatch(initMuteModal(account));
  }

  handleConversationMuteClick = (status) => {
    if (status.get('muted')) {
      this.props.dispatch(unmuteStatus(status.get('id')));
    } else {
      this.props.dispatch(muteStatus(status.get('id')));
    }
  }

  handleToggleAll = () => {
    const { isExpanded } = this.state;
    this.setState({ isExpanded: !isExpanded, threadExpanded: !isExpanded });
  }

  handleBlockClick = (account) => {
    const { dispatch, intl } = this.props;

    dispatch(openModal('CONFIRM', {
      message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong>@{account.get('acct')}</strong> }} />,
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => dispatch(blockAccount(account.get('id'))),
    }));
  }

  handleReport = (status) => {
    this.props.dispatch(initReport(status.get('account'), status));
  }

  handleEmbed = (status) => {
    this.props.dispatch(openModal('EMBED', { url: status.get('url') }));
  }

  handleHotkeyMoveUp = () => {
    this.handleMoveUp(this.props.status.get('id'));
  }

  handleHotkeyMoveDown = () => {
    this.handleMoveDown(this.props.status.get('id'));
  }

  handleHotkeyReply = e => {
    e.preventDefault();
    this.handleReplyClick(this.props.status);
  }

  handleHotkeyFavourite = () => {
    this.handleFavouriteClick(this.props.status);
  }

  handleHotkeyBoost = () => {
    this.handleReblogClick(this.props.status);
  }

  handleHotkeyMention = e => {
    e.preventDefault();
    this.handleMentionClick(this.props.status);
  }

  handleHotkeyOpenProfile = () => {
    this.context.router.history.push(`/accounts/${this.props.status.getIn(['account', 'id'])}`);
  }

  handleMoveUp = id => {
    const { status, ancestorsIds, descendantsIds } = this.props;

    if (id === status.get('id')) {
      this._selectChild(ancestorsIds.size - 1);
    } else {
      let index = ancestorsIds.indexOf(id);

      if (index === -1) {
        index = descendantsIds.indexOf(id);
        this._selectChild(ancestorsIds.size + index);
      } else {
        this._selectChild(index - 1);
      }
    }
  }

  handleMoveDown = id => {
    const { status, ancestorsIds, descendantsIds } = this.props;

    if (id === status.get('id')) {
      this._selectChild(ancestorsIds.size + 1);
    } else {
      let index = ancestorsIds.indexOf(id);

      if (index === -1) {
        index = descendantsIds.indexOf(id);
        this._selectChild(ancestorsIds.size + index + 2);
      } else {
        this._selectChild(index + 1);
      }
    }
  }

  _selectChild (index) {
    const element = this.node.querySelectorAll('.focusable')[index];

    if (element) {
      element.focus();
    }
  }

  renderChildren (list) {
    return list.map(id => (
      <StatusContainer
        key={id}
        id={id}
        expanded={this.state.threadExpanded}
        onMoveUp={this.handleMoveUp}
        onMoveDown={this.handleMoveDown}
        contextType='thread'
      />
    ));
  }

  setExpansion = value => {
    this.setState({ isExpanded: value });
  }

  setRef = c => {
    this.node = c;
  }

  componentDidUpdate () {
    if (this._scrolledIntoView) {
      return;
    }

    const { status, ancestorsIds } = this.props;

    if (status && ancestorsIds && ancestorsIds.size > 0) {
      const element = this.node.querySelectorAll('.focusable')[ancestorsIds.size - 1];

      window.requestAnimationFrame(() => {
        element.scrollIntoView(true);
      });
      this._scrolledIntoView = true;
    }
  }

  componentWillUnmount () {
    detachFullscreenListener(this.onFullScreenChange);
  }

  onFullScreenChange = () => {
    this.setState({ fullscreen: isFullscreen() });
  }

  shouldUpdateScroll = (prevRouterProps, { location }) => {
    return !(location.state && location.state.mastodonModalOpen)
  }

  render () {
    let ancestors, descendants;
    const { setExpansion } = this;
    const { status, settings, ancestorsIds, descendantsIds, intl } = this.props;
    const { fullscreen, isExpanded } = this.state;

    if (status === null) {
      return (
        <Column>
          <ColumnBackButton />
          <MissingIndicator />
        </Column>
      );
    }

    if (ancestorsIds && ancestorsIds.size > 0) {
      ancestors = <div>{this.renderChildren(ancestorsIds)}</div>;
    }

    if (descendantsIds && descendantsIds.size > 0) {
      descendants = <div>{this.renderChildren(descendantsIds)}</div>;
    }

    const handlers = {
      moveUp: this.handleHotkeyMoveUp,
      moveDown: this.handleHotkeyMoveDown,
      reply: this.handleHotkeyReply,
      favourite: this.handleHotkeyFavourite,
      boost: this.handleHotkeyBoost,
      mention: this.handleHotkeyMention,
      openProfile: this.handleHotkeyOpenProfile,
      toggleSpoiler: this.handleExpandedToggle,
    };

    return (
      <Column>
        <ColumnHeader
          showBackButton
          extraButton={(
            <button className='column-header__button' title={intl.formatMessage(!isExpanded ? messages.revealAll : messages.hideAll)} aria-label={intl.formatMessage(!isExpanded ? messages.revealAll : messages.hideAll)} onClick={this.handleToggleAll} aria-pressed={!isExpanded ? 'false' : 'true'}><i className={`fa fa-${!isExpanded ? 'eye-slash' : 'eye'}`} /></button>
          )}
        />

        <ScrollContainer scrollKey='thread' shouldUpdateScroll={this.shouldUpdateScroll}>
          <div className={classNames('scrollable', 'detailed-status__wrapper', { fullscreen })} ref={this.setRef}>
            {ancestors}

            <HotKeys handlers={handlers}>
              <div className='focusable' tabIndex='0'>
                <DetailedStatus
                  status={status}
                  settings={settings}
                  onOpenVideo={this.handleOpenVideo}
                  onOpenMedia={this.handleOpenMedia}
                  expanded={isExpanded}
                  onToggleHidden={this.handleExpandedToggle}
                />

                <ActionBar
                  status={status}
                  onReply={this.handleReplyClick}
                  onFavourite={this.handleFavouriteClick}
                  onReblog={this.handleReblogClick}
                  onBookmark={this.handleBookmarkClick}
                  onDelete={this.handleDeleteClick}
                  onDirect={this.handleDirectClick}
                  onMention={this.handleMentionClick}
                  onMute={this.handleMuteClick}
                  onMuteConversation={this.handleConversationMuteClick}
                  onBlock={this.handleBlockClick}
                  onReport={this.handleReport}
                  onPin={this.handlePin}
                  onEmbed={this.handleEmbed}
                />
              </div>
            </HotKeys>

            {descendants}
          </div>
        </ScrollContainer>
      </Column>
    );
  }

}
