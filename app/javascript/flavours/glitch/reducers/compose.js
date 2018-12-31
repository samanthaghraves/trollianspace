import {
  COMPOSE_MOUNT,
  COMPOSE_UNMOUNT,
  COMPOSE_CHANGE,
  COMPOSE_CYCLE_ELEFRIEND,
  COMPOSE_REPLY,
  COMPOSE_REPLY_CANCEL,
  COMPOSE_DIRECT,
  COMPOSE_MENTION,
  COMPOSE_SUBMIT_REQUEST,
  COMPOSE_SUBMIT_SUCCESS,
  COMPOSE_SUBMIT_FAIL,
  COMPOSE_UPLOAD_REQUEST,
  COMPOSE_UPLOAD_SUCCESS,
  COMPOSE_UPLOAD_FAIL,
  COMPOSE_UPLOAD_UNDO,
  COMPOSE_UPLOAD_PROGRESS,
  COMPOSE_SUGGESTIONS_CLEAR,
  COMPOSE_SUGGESTIONS_READY,
  COMPOSE_SUGGESTION_SELECT,
  COMPOSE_ADVANCED_OPTIONS_CHANGE,
  COMPOSE_SENSITIVITY_CHANGE,
  COMPOSE_SPOILERNESS_CHANGE,
  COMPOSE_SPOILER_TEXT_CHANGE,
  COMPOSE_VISIBILITY_CHANGE,
  COMPOSE_EMOJI_INSERT,
  COMPOSE_UPLOAD_CHANGE_REQUEST,
  COMPOSE_UPLOAD_CHANGE_SUCCESS,
  COMPOSE_UPLOAD_CHANGE_FAIL,
  COMPOSE_DOODLE_SET,
  COMPOSE_RESET,
} from 'flavours/glitch/actions/compose';
import { TIMELINE_DELETE } from 'flavours/glitch/actions/timelines';
import { STORE_HYDRATE } from 'flavours/glitch/actions/store';
import { REDRAFT } from 'flavours/glitch/actions/statuses';
import { Map as ImmutableMap, List as ImmutableList, OrderedSet as ImmutableOrderedSet, fromJS } from 'immutable';
import uuid from 'flavours/glitch/util/uuid';
import { privacyPreference } from 'flavours/glitch/util/privacy_preference';
import { me } from 'flavours/glitch/util/initial_state';
import { overwrite } from 'flavours/glitch/util/js_helpers';
import { unescapeHTML } from 'flavours/glitch/util/html';

const totalElefriends = 3;

// ~4% chance you'll end up with an unexpected friend
// glitch-soc/mastodon repo created_at date: 2017-04-20T21:55:28Z
const glitchProbability = 1 - 0.0420215528;

const initialState = ImmutableMap({
  mounted: false,
  advanced_options: ImmutableMap({
    do_not_federate: false,
    threaded_mode: false,
  }),
  sensitive: false,
  elefriend: Math.random() < glitchProbability ? Math.floor(Math.random() * totalElefriends) : totalElefriends,
  spoiler: false,
  spoiler_text: '',
  privacy: null,
  text: '',
  focusDate: null,
  caretPosition: null,
  preselectDate: null,
  in_reply_to: null,
  is_submitting: false,
  is_uploading: false,
  progress: 0,
  media_attachments: ImmutableList(),
  suggestion_token: null,
  suggestions: ImmutableList(),
  default_advanced_options: ImmutableMap({
    do_not_federate: false,
    threaded_mode: null,  //  Do not reset
  }),
  default_privacy: 'public',
  default_sensitive: false,
  resetFileKey: Math.floor((Math.random() * 0x10000)),
  idempotencyKey: null,
  doodle: ImmutableMap({
    fg: 'rgb(  0,    0,    0)',
    bg: 'rgb(255,  255,  255)',
    swapped: false,
    mode: 'draw',
    size: 'normal',
    weight: 2,
    opacity: 1,
    adaptiveStroke: true,
    smoothing: false,
  }),
});

function statusToTextMentions(state, status) {
  let set = ImmutableOrderedSet([]);

  if (status.getIn(['account', 'id']) !== me) {
    set = set.add(`@${status.getIn(['account', 'acct'])} `);
  }

  return set.union(status.get('mentions').filterNot(mention => mention.get('id') === me).map(mention => `@${mention.get('acct')} `)).join('');
};

function apiStatusToTextMentions (state, status) {
  let set = ImmutableOrderedSet([]);

  if (status.account.id !== me) {
    set = set.add(`@${status.account.acct} `);
  }

  return set.union(status.mentions.filter(
    mention => mention.id !== me
  ).map(
    mention => `@${mention.acct} `
  )).join('');
}

function apiStatusToTextHashtags (state, status) {
  return ImmutableOrderedSet([]).union(status.tags.map(
    ({ name }) => `#${name} `
  )).join('');
}

function clearAll(state) {
  return state.withMutations(map => {
    map.set('text', '');
    map.set('spoiler', false);
    map.set('spoiler_text', '');
    map.set('is_submitting', false);
    map.set('in_reply_to', null);
    map.update(
      'advanced_options',
      map => map.mergeWith(overwrite, state.get('default_advanced_options'))
    );
    map.set('privacy', state.get('default_privacy'));
    map.set('sensitive', false);
    map.update('media_attachments', list => list.clear());
    map.set('idempotencyKey', uuid());
  });
};

function continueThread (state, status) {
  return state.withMutations(function (map) {
    let text = apiStatusToTextMentions(state, status);
    text = text + apiStatusToTextHashtags(state, status);
    map.set('text', text);
    if (status.spoiler_text) {
      map.set('spoiler', true);
      map.set('spoiler_text', status.spoiler_text);
    } else {
      map.set('spoiler', false);
      map.set('spoiler_text', '');
    }
    map.set('is_submitting', false);
    map.set('in_reply_to', status.id);
    map.update(
      'advanced_options',
      map => map.merge(new ImmutableMap({ do_not_federate: /👁\ufe0f?\u200b?(?:<\/p>)?$/.test(status.content) }))
    );
    map.set('privacy', status.visibility);
    map.set('sensitive', false);
    map.update('media_attachments', list => list.clear());
    map.set('idempotencyKey', uuid());
    map.set('focusDate', new Date());
    map.set('caretPosition', null);
    map.set('preselectDate', new Date());
  });
}

function appendMedia(state, media) {
  const prevSize = state.get('media_attachments').size;

  return state.withMutations(map => {
    map.update('media_attachments', list => list.push(media));
    map.set('is_uploading', false);
    map.set('resetFileKey', Math.floor((Math.random() * 0x10000)));
    map.set('idempotencyKey', uuid());

    if (prevSize === 0 && (state.get('default_sensitive') || state.get('spoiler'))) {
      map.set('sensitive', true);
    }
  });
};

function removeMedia(state, mediaId) {
  const prevSize = state.get('media_attachments').size;

  return state.withMutations(map => {
    map.update('media_attachments', list => list.filterNot(item => item.get('id') === mediaId));
    map.set('idempotencyKey', uuid());

    if (prevSize === 1) {
      map.set('sensitive', false);
    }
  });
};

const insertSuggestion = (state, position, token, completion) => {
  return state.withMutations(map => {
    map.update('text', oldText => `${oldText.slice(0, position)}${completion}${completion[0] === ':' ? '\u200B' : ' '}${oldText.slice(position + token.length)}`);
    map.set('suggestion_token', null);
    map.update('suggestions', ImmutableList(), list => list.clear());
    map.set('focusDate', new Date());
    map.set('caretPosition', position + completion.length + 1);
    map.set('idempotencyKey', uuid());
  });
};

const insertEmoji = (state, position, emojiData) => {
  const emoji = emojiData.native;

  return state.withMutations(map => {
    map.update('text', oldText => `${oldText.slice(0, position)}${emoji}\u200B${oldText.slice(position)}`);
    map.set('focusDate', new Date());
    map.set('caretPosition', position + emoji.length + 1);
    map.set('idempotencyKey', uuid());
  });
};

const hydrate = (state, hydratedState) => {
  state = clearAll(state.merge(hydratedState));

  if (hydratedState.has('text')) {
    state = state.set('text', hydratedState.get('text'));
  }

  return state;
};

const domParser = new DOMParser();

const expandMentions = status => {
  const fragment = domParser.parseFromString(status.get('content'), 'text/html').documentElement;

  status.get('mentions').forEach(mention => {
    fragment.querySelector(`a[href="${mention.get('url')}"]`).textContent = `@${mention.get('acct')}`;
  });

  return fragment.innerHTML;
};

export default function compose(state = initialState, action) {
  switch(action.type) {
  case STORE_HYDRATE:
    return hydrate(state, action.state.get('compose'));
  case COMPOSE_MOUNT:
    return state.set('mounted', true);
  case COMPOSE_UNMOUNT:
    return state.set('mounted', false);
  case COMPOSE_ADVANCED_OPTIONS_CHANGE:
    return state
      .set('advanced_options', state.get('advanced_options').set(action.option, !!overwrite(!state.getIn(['advanced_options', action.option]), action.value)))
      .set('idempotencyKey', uuid());
  case COMPOSE_SENSITIVITY_CHANGE:
    return state.withMutations(map => {
      if (!state.get('spoiler')) {
        map.set('sensitive', !state.get('sensitive'));
      }

      map.set('idempotencyKey', uuid());
    });
  case COMPOSE_SPOILERNESS_CHANGE:
    return state.withMutations(map => {
      map.set('spoiler_text', '');
      map.set('spoiler', !state.get('spoiler'));
      map.set('idempotencyKey', uuid());

      if (!state.get('sensitive') && state.get('media_attachments').size >= 1) {
        map.set('sensitive', true);
      }
    });
  case COMPOSE_SPOILER_TEXT_CHANGE:
    return state
      .set('spoiler_text', action.text)
      .set('idempotencyKey', uuid());
  case COMPOSE_VISIBILITY_CHANGE:
    return state
      .set('privacy', action.value)
      .set('idempotencyKey', uuid());
  case COMPOSE_CHANGE:
    return state
      .set('text', action.text)
      .set('idempotencyKey', uuid());
  case COMPOSE_CYCLE_ELEFRIEND:
    return state
      .set('elefriend', (state.get('elefriend') + 1) % totalElefriends);
  case COMPOSE_REPLY:
    return state.withMutations(map => {
      map.set('in_reply_to', action.status.get('id'));
      map.set('text', statusToTextMentions(state, action.status));
      map.set('privacy', privacyPreference(action.status.get('visibility'), state.get('default_privacy')));
      map.update(
        'advanced_options',
        map => map.merge(new ImmutableMap({ do_not_federate: /👁\ufe0f?\u200b?(?:<\/p>)?$/.test(action.status.get('content')) }))
      );
      map.set('focusDate', new Date());
      map.set('caretPosition', null);
      map.set('preselectDate', new Date());
      map.set('idempotencyKey', uuid());

      if (action.status.get('spoiler_text').length > 0) {
        map.set('spoiler', true);
        map.set('spoiler_text', action.status.get('spoiler_text'));
      } else {
        map.set('spoiler', false);
        map.set('spoiler_text', '');
      }
    });
  case COMPOSE_REPLY_CANCEL:
    state = state.setIn(['advanced_options', 'threaded_mode'], false);
  case COMPOSE_RESET:
    return state.withMutations(map => {
      map.set('in_reply_to', null);
      map.set('text', '');
      map.set('spoiler', false);
      map.set('spoiler_text', '');
      map.set('privacy', state.get('default_privacy'));
      map.update(
        'advanced_options',
        map => map.mergeWith(overwrite, state.get('default_advanced_options'))
      );
      map.set('idempotencyKey', uuid());
    });
  case COMPOSE_SUBMIT_REQUEST:
  case COMPOSE_UPLOAD_CHANGE_REQUEST:
    return state.set('is_submitting', true);
  case COMPOSE_SUBMIT_SUCCESS:
    return action.status && state.getIn(['advanced_options', 'threaded_mode']) ? continueThread(state, action.status) : clearAll(state);
  case COMPOSE_SUBMIT_FAIL:
  case COMPOSE_UPLOAD_CHANGE_FAIL:
    return state.set('is_submitting', false);
  case COMPOSE_UPLOAD_REQUEST:
    return state.set('is_uploading', true);
  case COMPOSE_UPLOAD_SUCCESS:
    return appendMedia(state, fromJS(action.media));
  case COMPOSE_UPLOAD_FAIL:
    return state.set('is_uploading', false);
  case COMPOSE_UPLOAD_UNDO:
    return removeMedia(state, action.media_id);
  case COMPOSE_UPLOAD_PROGRESS:
    return state.set('progress', Math.round((action.loaded / action.total) * 100));
  case COMPOSE_MENTION:
    return state.withMutations(map => {
      map.update('text', text => [text.trim(), `@${action.account.get('acct')} `].filter((str) => str.length !== 0).join(' '));
      map.set('focusDate', new Date());
      map.set('caretPosition', null);
      map.set('idempotencyKey', uuid());
    });
  case COMPOSE_DIRECT:
    return state.withMutations(map => {
      map.update('text', text => [text.trim(), `@${action.account.get('acct')} `].filter((str) => str.length !== 0).join(' '));
      map.set('privacy', 'direct');
      map.set('focusDate', new Date());
      map.set('caretPosition', null);
      map.set('idempotencyKey', uuid());
    });
  case COMPOSE_SUGGESTIONS_CLEAR:
    return state.update('suggestions', ImmutableList(), list => list.clear()).set('suggestion_token', null);
  case COMPOSE_SUGGESTIONS_READY:
    return state.set('suggestions', ImmutableList(action.accounts ? action.accounts.map(item => item.id) : action.emojis)).set('suggestion_token', action.token);
  case COMPOSE_SUGGESTION_SELECT:
    return insertSuggestion(state, action.position, action.token, action.completion);
  case TIMELINE_DELETE:
    if (action.id === state.get('in_reply_to')) {
      return state.set('in_reply_to', null);
    } else {
      return state;
    }
  case COMPOSE_EMOJI_INSERT:
    return insertEmoji(state, action.position, action.emoji);
  case COMPOSE_UPLOAD_CHANGE_SUCCESS:
    return state
      .set('is_submitting', false)
      .update('media_attachments', list => list.map(item => {
        if (item.get('id') === action.media.id) {
          return fromJS(action.media);
        }

        return item;
      }));
  case COMPOSE_DOODLE_SET:
    return state.mergeIn(['doodle'], action.options);
  case REDRAFT:
    return state.withMutations(map => {
      map.set('text', unescapeHTML(expandMentions(action.status)));
      map.set('in_reply_to', action.status.get('in_reply_to_id'));
      map.set('privacy', action.status.get('visibility'));
      map.set('media_attachments', action.status.get('media_attachments'));
      map.set('focusDate', new Date());
      map.set('caretPosition', null);
      map.set('idempotencyKey', uuid());

      if (action.status.get('spoiler_text').length > 0) {
        map.set('spoiler', true);
        map.set('spoiler_text', action.status.get('spoiler_text'));
      } else {
        map.set('spoiler', false);
        map.set('spoiler_text', '');
      }
    });
  default:
    return state;
  }
};
