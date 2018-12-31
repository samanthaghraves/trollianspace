const element = document.getElementById('initial-state');
const initialState = element && function () {
  const result = JSON.parse(element.textContent);
  try {
    result.local_settings = JSON.parse(localStorage.getItem('mastodon-settings'));
  } catch (e) {
    result.local_settings = {};
  }
  return result;
}();

const getMeta = (prop) => initialState && initialState.meta && initialState.meta[prop];

export const reduceMotion = getMeta('reduce_motion');
export const autoPlayGif = getMeta('auto_play_gif');
export const displaySensitiveMedia = getMeta('display_sensitive_media');
export const unfollowModal = getMeta('unfollow_modal');
export const boostModal = getMeta('boost_modal');
export const favouriteModal = getMeta('favourite_modal');
export const deleteModal = getMeta('delete_modal');
export const me = getMeta('me');
export const maxChars = (initialState && initialState.max_toot_chars) || 500;

export default initialState;
