import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { fetchBookmarkedStatuses, expandBookmarkedStatuses } from 'flavours/glitch/actions/bookmarks';
import Column from 'flavours/glitch/features/ui/components/column';
import ColumnHeader from 'flavours/glitch/components/column_header';
import { addColumn, removeColumn, moveColumn } from 'flavours/glitch/actions/columns';
import StatusList from 'flavours/glitch/components/status_list';
import { defineMessages, injectIntl } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { debounce } from 'lodash';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
});

const mapStateToProps = state => ({
  statusIds: state.getIn(['status_lists', 'bookmarks', 'items']),
  isLoading: state.getIn(['status_lists', 'bookmarks', 'isLoading'], true),
  hasMore: !!state.getIn(['status_lists', 'bookmarks', 'next']),
});

@connect(mapStateToProps)
@injectIntl
export default class Bookmarks extends ImmutablePureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    statusIds: ImmutablePropTypes.list.isRequired,
    intl: PropTypes.object.isRequired,
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
    hasMore: PropTypes.bool,
    isLoading: PropTypes.bool,
  };

  componentWillMount () {
    this.props.dispatch(fetchBookmarkedStatuses());
  }

  handlePin = () => {
    const { columnId, dispatch } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('BOOKMARKS', {}));
    }
  }

  handleMove = (dir) => {
    const { columnId, dispatch } = this.props;
    dispatch(moveColumn(columnId, dir));
  }

  handleHeaderClick = () => {
    this.column.scrollTop();
  }

  setRef = c => {
    this.column = c;
  }

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandBookmarkedStatuses());
  }, 300, { leading: true })

  shouldUpdateScroll = (prevRouterProps, { location }) => {
    return !(location.state && location.state.mastodonModalOpen)
  }

  render () {
    const { intl, statusIds, columnId, multiColumn, hasMore, isLoading } = this.props;
    const pinned = !!columnId;

    return (
      <Column ref={this.setRef} name='bookmarks'>
        <ColumnHeader
          icon='bookmark'
          title={intl.formatMessage(messages.heading)}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
          showBackButton
        />

        <StatusList
          trackScroll={!pinned}
          statusIds={statusIds}
          scrollKey={`bookmarked_statuses-${columnId}`}
          shouldUpdateScroll={this.shouldUpdateScroll}
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={this.handleLoadMore}
        />
      </Column>
    );
  }

}
