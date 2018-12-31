import { connect } from 'react-redux';
import StatusList from 'flavours/glitch/components/status_list';
import { scrollTopTimeline } from 'flavours/glitch/actions/timelines';
import { Map as ImmutableMap, List as ImmutableList } from 'immutable';
import { createSelector } from 'reselect';
import { debounce } from 'lodash';
import { me } from 'flavours/glitch/util/initial_state';

const makeGetStatusIds = () => createSelector([
  (state, { type }) => state.getIn(['settings', type], ImmutableMap()),
  (state, { type }) => state.getIn(['timelines', type, 'items'], ImmutableList()),
  (state)           => state.get('statuses'),
], (columnSettings, statusIds, statuses) => {
  const rawRegex = columnSettings.getIn(['regex', 'body'], '').trim();
  let regex      = null;

  try {
    regex = rawRegex && new RegExp(rawRegex, 'i');
  } catch (e) {
    // Bad regex, don't affect filters
  }

  return statusIds.filter(id => {
    if (id === null) return true;

    const statusForId = statuses.get(id);
    let showStatus    = true;

    if (columnSettings.getIn(['shows', 'reblog']) === false) {
      showStatus = showStatus && statusForId.get('reblog') === null;
    }

    if (columnSettings.getIn(['shows', 'reply']) === false) {
      showStatus = showStatus && (statusForId.get('in_reply_to_id') === null || statusForId.get('in_reply_to_account_id') === me);
    }

    if (columnSettings.getIn(['shows', 'direct']) === false) {
      showStatus = showStatus && statusForId.get('visibility') !== 'direct';
    }

    if (showStatus && regex && statusForId.get('account') !== me) {
      const searchIndex = statusForId.get('reblog') ? statuses.getIn([statusForId.get('reblog'), 'search_index']) : statusForId.get('search_index');
      showStatus = !regex.test(searchIndex);
    }

    return showStatus;
  });
});

const makeMapStateToProps = () => {
  const getStatusIds = makeGetStatusIds();

  const mapStateToProps = (state, { timelineId }) => ({
    statusIds: getStatusIds(state, { type: timelineId }),
    isLoading: state.getIn(['timelines', timelineId, 'isLoading'], true),
    isPartial: state.getIn(['timelines', timelineId, 'isPartial'], false),
    hasMore:   state.getIn(['timelines', timelineId, 'hasMore']),
  });

  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, { timelineId }) => ({

  onScrollToTop: debounce(() => {
    dispatch(scrollTopTimeline(timelineId, true));
  }, 100),

  onScroll: debounce(() => {
    dispatch(scrollTopTimeline(timelineId, false));
  }, 100),

});

export default connect(makeMapStateToProps, mapDispatchToProps)(StatusList);
