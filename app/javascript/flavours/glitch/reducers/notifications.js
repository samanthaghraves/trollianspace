import {
  NOTIFICATIONS_UPDATE,
  NOTIFICATIONS_EXPAND_SUCCESS,
  NOTIFICATIONS_EXPAND_REQUEST,
  NOTIFICATIONS_EXPAND_FAIL,
  NOTIFICATIONS_CLEAR,
  NOTIFICATIONS_SCROLL_TOP,
  NOTIFICATIONS_DELETE_MARKED_REQUEST,
  NOTIFICATIONS_DELETE_MARKED_SUCCESS,
  NOTIFICATION_MARK_FOR_DELETE,
  NOTIFICATIONS_DELETE_MARKED_FAIL,
  NOTIFICATIONS_ENTER_CLEARING_MODE,
  NOTIFICATIONS_MARK_ALL_FOR_DELETE,
} from 'flavours/glitch/actions/notifications';
import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
} from 'flavours/glitch/actions/accounts';
import { TIMELINE_DELETE, TIMELINE_DISCONNECT } from 'flavours/glitch/actions/timelines';
import { Map as ImmutableMap, List as ImmutableList } from 'immutable';
import compareId from 'flavours/glitch/util/compare_id';

const initialState = ImmutableMap({
  items: ImmutableList(),
  hasMore: true,
  top: true,
  unread: 0,
  isLoading: false,
  cleaningMode: false,
  // notification removal mark of new notifs loaded whilst cleaningMode is true.
  markNewForDelete: false,
});

const notificationToMap = (state, notification) => ImmutableMap({
  id: notification.id,
  type: notification.type,
  account: notification.account.id,
  markedForDelete: state.get('markNewForDelete'),
  status: notification.status ? notification.status.id : null,
});

const normalizeNotification = (state, notification) => {
  const top = state.get('top');

  if (!top) {
    state = state.update('unread', unread => unread + 1);
  }

  return state.update('items', list => {
    if (top && list.size > 40) {
      list = list.take(20);
    }

    return list.unshift(notificationToMap(state, notification));
  });
};

const expandNormalizedNotifications = (state, notifications, next) => {
  let items = ImmutableList();

  notifications.forEach((n, i) => {
    items = items.set(i, notificationToMap(state, n));
  });

  return state.withMutations(mutable => {
    if (!items.isEmpty()) {
      mutable.update('items', list => {
        const lastIndex = 1 + list.findLastIndex(
          item => item !== null && (compareId(item.get('id'), items.last().get('id')) > 0 || item.get('id') === items.last().get('id'))
        );

        const firstIndex = 1 + list.take(lastIndex).findLastIndex(
          item => item !== null && compareId(item.get('id'), items.first().get('id')) > 0
        );

        return list.take(firstIndex).concat(items, list.skip(lastIndex));
      });
    }

    if (!next) {
      mutable.set('hasMore', true);
    }

    mutable.set('isLoading', false);
  });
};

const filterNotifications = (state, relationship) => {
  return state.update('items', list => list.filterNot(item => item !== null && item.get('account') === relationship.id));
};

const updateTop = (state, top) => {
  if (top) {
    state = state.set('unread', 0);
  }

  return state.set('top', top);
};

const deleteByStatus = (state, statusId) => {
  return state.update('items', list => list.filterNot(item => item !== null && item.get('status') === statusId));
};

const markForDelete = (state, notificationId, yes) => {
  return state.update('items', list => list.map(item => {
    if(item.get('id') === notificationId) {
      return item.set('markedForDelete', yes);
    } else {
      return item;
    }
  }));
};

const markAllForDelete = (state, yes) => {
  return state.update('items', list => list.map(item => {
    if(yes !== null) {
      return item.set('markedForDelete', yes);
    } else {
      return item.set('markedForDelete', !item.get('markedForDelete'));
    }
  }));
};

const unmarkAllForDelete = (state) => {
  return state.update('items', list => list.map(item => item.set('markedForDelete', false)));
};

const deleteMarkedNotifs = (state) => {
  return state.update('items', list => list.filterNot(item => item.get('markedForDelete')));
};

export default function notifications(state = initialState, action) {
  let st;

  switch(action.type) {
  case NOTIFICATIONS_EXPAND_REQUEST:
  case NOTIFICATIONS_DELETE_MARKED_REQUEST:
    return state.set('isLoading', true);
  case NOTIFICATIONS_DELETE_MARKED_FAIL:
  case NOTIFICATIONS_EXPAND_FAIL:
    return state.set('isLoading', false);
  case NOTIFICATIONS_SCROLL_TOP:
    return updateTop(state, action.top);
  case NOTIFICATIONS_UPDATE:
    return normalizeNotification(state, action.notification);
  case NOTIFICATIONS_EXPAND_SUCCESS:
    return expandNormalizedNotifications(state, action.notifications, action.next);
  case ACCOUNT_BLOCK_SUCCESS:
  case ACCOUNT_MUTE_SUCCESS:
    return filterNotifications(state, action.relationship);
  case NOTIFICATIONS_CLEAR:
    return state.set('items', ImmutableList()).set('hasMore', false);
  case TIMELINE_DELETE:
    return deleteByStatus(state, action.id);
  case TIMELINE_DISCONNECT:
    return action.timeline === 'home' ?
      state.update('items', items => items.first() ? items.unshift(null) : items) :
      state;

  case NOTIFICATION_MARK_FOR_DELETE:
    return markForDelete(state, action.id, action.yes);

  case NOTIFICATIONS_DELETE_MARKED_SUCCESS:
    return deleteMarkedNotifs(state).set('isLoading', false);

  case NOTIFICATIONS_ENTER_CLEARING_MODE:
    st = state.set('cleaningMode', action.yes);
    if (!action.yes) {
      return unmarkAllForDelete(st).set('markNewForDelete', false);
    } else {
      return st;
    }

  case NOTIFICATIONS_MARK_ALL_FOR_DELETE:
    st = state;
    if (action.yes === null) {
      // Toggle - this is a bit confusing, as it toggles the all-none mode
      //st = st.set('markNewForDelete', !st.get('markNewForDelete'));
    } else {
      st = st.set('markNewForDelete', action.yes);
    }
    return markAllForDelete(st, action.yes);

  default:
    return state;
  }
};
