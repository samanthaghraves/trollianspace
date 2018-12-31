import { SETTING_CHANGE, SETTING_SAVE } from 'flavours/glitch/actions/settings';
import { COLUMN_ADD, COLUMN_REMOVE, COLUMN_MOVE } from 'flavours/glitch/actions/columns';
import { STORE_HYDRATE } from 'flavours/glitch/actions/store';
import { EMOJI_USE } from 'flavours/glitch/actions/emojis';
import { LIST_DELETE_SUCCESS, LIST_FETCH_FAIL } from '../actions/lists';
import { Map as ImmutableMap, fromJS } from 'immutable';
import uuid from 'flavours/glitch/util/uuid';

const initialState = ImmutableMap({
  saved: true,

  onboarded: false,
  layout: 'auto',

  skinTone: 1,

  home: ImmutableMap({
    shows: ImmutableMap({
      reblog: true,
      reply: true,
      direct: true,
    }),

    regex: ImmutableMap({
      body: '',
    }),
  }),

  notifications: ImmutableMap({
    alerts: ImmutableMap({
      follow: true,
      favourite: true,
      reblog: true,
      mention: true,
    }),

    shows: ImmutableMap({
      follow: true,
      favourite: true,
      reblog: true,
      mention: true,
    }),

    sounds: ImmutableMap({
      follow: true,
      favourite: true,
      reblog: true,
      mention: true,
    }),
  }),

  community: ImmutableMap({
    regex: ImmutableMap({
      body: '',
    }),
  }),

  public: ImmutableMap({
    regex: ImmutableMap({
      body: '',
    }),
  }),

  direct: ImmutableMap({
    regex: ImmutableMap({
      body: '',
    }),
  }),
});

const defaultColumns = fromJS([
  { id: 'COMPOSE', uuid: uuid(), params: {} },
  { id: 'HOME', uuid: uuid(), params: {} },
  { id: 'NOTIFICATIONS', uuid: uuid(), params: {} },
]);

const hydrate = (state, settings) => state.mergeDeep(settings).update('columns', (val = defaultColumns) => val);

const moveColumn = (state, uuid, direction) => {
  const columns  = state.get('columns');
  const index    = columns.findIndex(item => item.get('uuid') === uuid);
  const newIndex = index + direction;

  let newColumns;

  newColumns = columns.splice(index, 1);
  newColumns = newColumns.splice(newIndex, 0, columns.get(index));

  return state
    .set('columns', newColumns)
    .set('saved', false);
};

const updateFrequentEmojis = (state, emoji) => state.update('frequentlyUsedEmojis', ImmutableMap(), map => map.update(emoji.id, 0, count => count + 1)).set('saved', false);

const filterDeadListColumns = (state, listId) => state.update('columns', columns => columns.filterNot(column => column.get('id') === 'LIST' && column.get('params').get('id') === listId));

export default function settings(state = initialState, action) {
  switch(action.type) {
  case STORE_HYDRATE:
    return hydrate(state, action.state.get('settings'));
  case SETTING_CHANGE:
    return state
      .setIn(action.path, action.value)
      .set('saved', false);
  case COLUMN_ADD:
    return state
      .update('columns', list => list.push(fromJS({ id: action.id, uuid: uuid(), params: action.params })))
      .set('saved', false);
  case COLUMN_REMOVE:
    return state
      .update('columns', list => list.filterNot(item => item.get('uuid') === action.uuid))
      .set('saved', false);
  case COLUMN_MOVE:
    return moveColumn(state, action.uuid, action.direction);
  case EMOJI_USE:
    return updateFrequentEmojis(state, action.emoji);
  case SETTING_SAVE:
    return state.set('saved', true);
  case LIST_FETCH_FAIL:
    return action.error.response.status === 404 ? filterDeadListColumns(state, action.id) : state;
  case LIST_DELETE_SUCCESS:
    return filterDeadListColumns(state, action.id);
  default:
    return state;
  }
};
