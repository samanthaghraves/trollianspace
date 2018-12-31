import {
  ACCOUNT_FETCH_SUCCESS,
  FOLLOWERS_FETCH_SUCCESS,
  FOLLOWERS_EXPAND_SUCCESS,
  FOLLOWING_FETCH_SUCCESS,
  FOLLOWING_EXPAND_SUCCESS,
  FOLLOW_REQUESTS_FETCH_SUCCESS,
  FOLLOW_REQUESTS_EXPAND_SUCCESS,
  ACCOUNT_FOLLOW_SUCCESS,
  ACCOUNT_UNFOLLOW_SUCCESS,
} from 'flavours/glitch/actions/accounts';
import {
  BLOCKS_FETCH_SUCCESS,
  BLOCKS_EXPAND_SUCCESS,
} from 'flavours/glitch/actions/blocks';
import {
  MUTES_FETCH_SUCCESS,
  MUTES_EXPAND_SUCCESS,
} from 'flavours/glitch/actions/mutes';
import { COMPOSE_SUGGESTIONS_READY } from 'flavours/glitch/actions/compose';
import {
  REBLOG_SUCCESS,
  UNREBLOG_SUCCESS,
  FAVOURITE_SUCCESS,
  UNFAVOURITE_SUCCESS,
  BOOKMARK_SUCCESS,
  UNBOOKMARK_SUCCESS,
  REBLOGS_FETCH_SUCCESS,
  FAVOURITES_FETCH_SUCCESS,
} from 'flavours/glitch/actions/interactions';
import {
  TIMELINE_UPDATE,
  TIMELINE_EXPAND_SUCCESS,
} from 'flavours/glitch/actions/timelines';
import {
  STATUS_FETCH_SUCCESS,
  CONTEXT_FETCH_SUCCESS,
} from 'flavours/glitch/actions/statuses';
import { SEARCH_FETCH_SUCCESS } from 'flavours/glitch/actions/search';
import {
  NOTIFICATIONS_UPDATE,
  NOTIFICATIONS_EXPAND_SUCCESS,
} from 'flavours/glitch/actions/notifications';
import {
  FAVOURITED_STATUSES_FETCH_SUCCESS,
  FAVOURITED_STATUSES_EXPAND_SUCCESS,
} from 'flavours/glitch/actions/favourites';
import {
  BOOKMARKED_STATUSES_FETCH_SUCCESS,
  BOOKMARKED_STATUSES_EXPAND_SUCCESS,
} from 'flavours/glitch/actions/bookmarks';
import {
  LIST_ACCOUNTS_FETCH_SUCCESS,
  LIST_EDITOR_SUGGESTIONS_READY,
} from 'flavours/glitch/actions/lists';
import { STORE_HYDRATE } from 'flavours/glitch/actions/store';
import { Map as ImmutableMap, fromJS } from 'immutable';

const normalizeAccount = (state, account) => state.set(account.id, fromJS({
  followers_count: account.followers_count,
  following_count: account.following_count,
  statuses_count: account.statuses_count,
}));

const normalizeAccounts = (state, accounts) => {
  accounts.forEach(account => {
    state = normalizeAccount(state, account);
  });

  return state;
};

const normalizeAccountFromStatus = (state, status) => {
  state = normalizeAccount(state, status.account);

  if (status.reblog && status.reblog.account) {
    state = normalizeAccount(state, status.reblog.account);
  }

  return state;
};

const normalizeAccountsFromStatuses = (state, statuses) => {
  statuses.forEach(status => {
    state = normalizeAccountFromStatus(state, status);
  });

  return state;
};

const initialState = ImmutableMap();

export default function accountsCounters(state = initialState, action) {
  switch(action.type) {
  case STORE_HYDRATE:
    return state.merge(action.state.get('accounts').map(item => fromJS({
      followers_count: item.get('followers_count'),
      following_count: item.get('following_count'),
      statuses_count: item.get('statuses_count'),
    })));
  case ACCOUNT_FETCH_SUCCESS:
  case NOTIFICATIONS_UPDATE:
    return normalizeAccount(state, action.account);
  case FOLLOWERS_FETCH_SUCCESS:
  case FOLLOWERS_EXPAND_SUCCESS:
  case FOLLOWING_FETCH_SUCCESS:
  case FOLLOWING_EXPAND_SUCCESS:
  case REBLOGS_FETCH_SUCCESS:
  case FAVOURITES_FETCH_SUCCESS:
  case COMPOSE_SUGGESTIONS_READY:
  case FOLLOW_REQUESTS_FETCH_SUCCESS:
  case FOLLOW_REQUESTS_EXPAND_SUCCESS:
  case BLOCKS_FETCH_SUCCESS:
  case BLOCKS_EXPAND_SUCCESS:
  case MUTES_FETCH_SUCCESS:
  case MUTES_EXPAND_SUCCESS:
  case LIST_ACCOUNTS_FETCH_SUCCESS:
  case LIST_EDITOR_SUGGESTIONS_READY:
    return action.accounts ? normalizeAccounts(state, action.accounts) : state;
  case NOTIFICATIONS_EXPAND_SUCCESS:
  case SEARCH_FETCH_SUCCESS:
    return normalizeAccountsFromStatuses(normalizeAccounts(state, action.accounts), action.statuses);
  case TIMELINE_EXPAND_SUCCESS:
  case CONTEXT_FETCH_SUCCESS:
  case FAVOURITED_STATUSES_FETCH_SUCCESS:
  case FAVOURITED_STATUSES_EXPAND_SUCCESS:
  case BOOKMARKED_STATUSES_FETCH_SUCCESS:
  case BOOKMARKED_STATUSES_EXPAND_SUCCESS:
    return normalizeAccountsFromStatuses(state, action.statuses);
  case REBLOG_SUCCESS:
  case FAVOURITE_SUCCESS:
  case UNREBLOG_SUCCESS:
  case UNFAVOURITE_SUCCESS:
  case BOOKMARK_SUCCESS:
  case UNBOOKMARK_SUCCESS:
    return normalizeAccountFromStatus(state, action.response);
  case TIMELINE_UPDATE:
  case STATUS_FETCH_SUCCESS:
    return normalizeAccountFromStatus(state, action.status);
  case ACCOUNT_FOLLOW_SUCCESS:
    if (action.alreadyFollowing) {
      return state;
    }
    return state.updateIn([action.relationship.id, 'followers_count'], num => num + 1);
  case ACCOUNT_UNFOLLOW_SUCCESS:
    return state.updateIn([action.relationship.id, 'followers_count'], num => Math.max(0, num - 1));
  default:
    return state;
  }
};
