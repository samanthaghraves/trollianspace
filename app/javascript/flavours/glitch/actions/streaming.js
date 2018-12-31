import { connectStream } from 'flavours/glitch/util/stream';
import {
  updateTimeline,
  deleteFromTimelines,
  expandHomeTimeline,
  disconnectTimeline,
} from './timelines';
import { updateNotifications, expandNotifications } from './notifications';
import { fetchFilters } from './filters';
import { getLocale } from 'mastodon/locales';

const { messages } = getLocale();

export function connectTimelineStream (timelineId, path, pollingRefresh = null) {

  return connectStream (path, pollingRefresh, (dispatch, getState) => {
    const locale = getState().getIn(['meta', 'locale']);
    return {
      onDisconnect() {
        dispatch(disconnectTimeline(timelineId));
      },

      onReceive (data) {
        switch(data.event) {
        case 'update':
          dispatch(updateTimeline(timelineId, JSON.parse(data.payload)));
          break;
        case 'delete':
          dispatch(deleteFromTimelines(data.payload));
          break;
        case 'notification':
          dispatch(updateNotifications(JSON.parse(data.payload), messages, locale));
          break;
        case 'filters_changed':
          dispatch(fetchFilters());
          break;
        }
      },
    };
  });
}

const refreshHomeTimelineAndNotification = (dispatch, done) => {
  dispatch(expandHomeTimeline({}, () => dispatch(expandNotifications({}, done))));
};

export const connectUserStream = () => connectTimelineStream('home', 'user', refreshHomeTimelineAndNotification);
export const connectCommunityStream = () => connectTimelineStream('community', 'public:local');
export const connectMediaStream = () => connectTimelineStream('community', 'public:local');
export const connectPublicStream = () => connectTimelineStream('public', 'public');
export const connectHashtagStream = (tag) => connectTimelineStream(`hashtag:${tag}`, `hashtag&tag=${tag}`);
export const connectDirectStream = () => connectTimelineStream('direct', 'direct');
export const connectListStream = (id) => connectTimelineStream(`list:${id}`, `list&list=${id}`);
