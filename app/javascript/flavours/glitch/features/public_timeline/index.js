import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import StatusListContainer from 'flavours/glitch/features/ui/containers/status_list_container';
import Column from 'flavours/glitch/components/column';
import ColumnHeader from 'flavours/glitch/components/column_header';
import { expandPublicTimeline } from 'flavours/glitch/actions/timelines';
import { addColumn, removeColumn, moveColumn } from 'flavours/glitch/actions/columns';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import ColumnSettingsContainer from './containers/column_settings_container';
import { connectPublicStream } from 'flavours/glitch/actions/streaming';

const messages = defineMessages({
  title: { id: 'column.public', defaultMessage: 'Federated timeline' },
});

const mapStateToProps = state => ({
  hasUnread: state.getIn(['timelines', 'public', 'unread']) > 0,
});

@connect(mapStateToProps)
@injectIntl
export default class PublicTimeline extends React.PureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
    hasUnread: PropTypes.bool,
  };

  handlePin = () => {
    const { columnId, dispatch } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('PUBLIC', {}));
    }
  }

  handleMove = (dir) => {
    const { columnId, dispatch } = this.props;
    dispatch(moveColumn(columnId, dir));
  }

  handleHeaderClick = () => {
    this.column.scrollTop();
  }

  componentDidMount () {
    const { dispatch } = this.props;

    dispatch(expandPublicTimeline());
    this.disconnect = dispatch(connectPublicStream());
  }

  componentWillUnmount () {
    if (this.disconnect) {
      this.disconnect();
      this.disconnect = null;
    }
  }

  setRef = c => {
    this.column = c;
  }

  handleLoadMore = maxId => {
    this.props.dispatch(expandPublicTimeline({ maxId }));
  }

  shouldUpdateScroll = (prevRouterProps, { location }) => {
    return !(location.state && location.state.mastodonModalOpen)
  }

  render () {
    const { intl, columnId, hasUnread, multiColumn } = this.props;
    const pinned = !!columnId;

    return (
      <Column ref={this.setRef} name='federated'>
        <ColumnHeader
          icon='globe'
          active={hasUnread}
          title={intl.formatMessage(messages.title)}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
        >
          <ColumnSettingsContainer />
        </ColumnHeader>

        <StatusListContainer
          timelineId='public'
          onLoadMore={this.handleLoadMore}
          trackScroll={!pinned}
          scrollKey={`public_timeline-${columnId}`}
          shouldUpdateScroll={this.shouldUpdateScroll}
          emptyMessage={<FormattedMessage id='empty_column.public' defaultMessage='There is nothing here! Write something publicly, or manually follow users from other instances to fill it up' />}
        />
      </Column>
    );
  }

}
