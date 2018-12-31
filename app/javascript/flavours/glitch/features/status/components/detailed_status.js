import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Avatar from 'flavours/glitch/components/avatar';
import DisplayName from 'flavours/glitch/components/display_name';
import StatusContent from 'flavours/glitch/components/status_content';
import MediaGallery from 'flavours/glitch/components/media_gallery';
import AttachmentList from 'flavours/glitch/components/attachment_list';
import { Link } from 'react-router-dom';
import { FormattedDate, FormattedNumber } from 'react-intl';
import CardContainer from '../containers/card_container';
import ImmutablePureComponent from 'react-immutable-pure-component';
import Video from 'flavours/glitch/features/video';
import VisibilityIcon from 'flavours/glitch/components/status_visibility_icon';

export default class DetailedStatus extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    status: ImmutablePropTypes.map.isRequired,
    settings: ImmutablePropTypes.map.isRequired,
    onOpenMedia: PropTypes.func.isRequired,
    onOpenVideo: PropTypes.func.isRequired,
    onToggleHidden: PropTypes.func.isRequired,
    expanded: PropTypes.bool,
  };

  handleAccountClick = (e) => {
    if (e.button === 0) {
      e.preventDefault();
      this.context.router.history.push(`/accounts/${this.props.status.getIn(['account', 'id'])}`);
    }

    e.stopPropagation();
  }

  handleOpenVideo = (media, startTime) => {
    this.props.onOpenVideo(media, startTime);
  }

  render () {
    const status = this.props.status.get('reblog') ? this.props.status.get('reblog') : this.props.status;
    const { expanded, onToggleHidden, settings } = this.props;

    let media           = '';
    let mediaIcon       = null;
    let applicationLink = '';
    let reblogLink = '';
    let reblogIcon = 'retweet';

    if (status.get('media_attachments').size > 0) {
      if (status.get('media_attachments').some(item => item.get('type') === 'unknown')) {
        media = <AttachmentList media={status.get('media_attachments')} />;
      } else if (status.getIn(['media_attachments', 0, 'type']) === 'video') {
        const video = status.getIn(['media_attachments', 0]);
        media = (
          <Video
            preview={video.get('preview_url')}
            src={video.get('url')}
            inline
            sensitive={status.get('sensitive')}
            letterbox={settings.getIn(['media', 'letterbox'])}
            fullwidth={settings.getIn(['media', 'fullwidth'])}
            onOpenVideo={this.handleOpenVideo}
            autoplay
          />
        );
        mediaIcon = 'video-camera';
      } else {
        media = (
          <MediaGallery
            standalone
            sensitive={status.get('sensitive')}
            media={status.get('media_attachments')}
            letterbox={settings.getIn(['media', 'letterbox'])}
            onOpenMedia={this.props.onOpenMedia}
          />
        );
        mediaIcon = 'picture-o';
      }
    } else media = <CardContainer onOpenMedia={this.props.onOpenMedia} statusId={status.get('id')} />;

    if (status.get('application')) {
      applicationLink = <span> · <a className='detailed-status__application' href={status.getIn(['application', 'website'])} target='_blank' rel='noopener'>{status.getIn(['application', 'name'])}</a></span>;
    }

    if (status.get('visibility') === 'direct') {
      reblogIcon = 'envelope';
    } else if (status.get('visibility') === 'private') {
      reblogIcon = 'lock';
    }

    if (status.get('visibility') === 'private') {
      reblogLink = <i className={`fa fa-${reblogIcon}`} />;
    } else {
      reblogLink = (<Link to={`/statuses/${status.get('id')}/reblogs`} className='detailed-status__link'>
        <i className={`fa fa-${reblogIcon}`} />
        <span className='detailed-status__reblogs'>
          <FormattedNumber value={status.get('reblogs_count')} />
        </span>
      </Link>);
    }

    return (
      <div className='detailed-status' data-status-by={status.getIn(['account', 'acct'])}>
        <a href={status.getIn(['account', 'url'])} onClick={this.handleAccountClick} className='detailed-status__display-name'>
          <div className='detailed-status__display-avatar'><Avatar account={status.get('account')} size={48} /></div>
          <DisplayName account={status.get('account')} />
        </a>

        <StatusContent
          status={status}
          media={media}
          mediaIcon={mediaIcon}
          expanded={expanded}
          collapsed={false}
          onExpandedToggle={onToggleHidden}
        />

        <div className='detailed-status__meta'>
          <a className='detailed-status__datetime' href={status.get('url')} target='_blank' rel='noopener'>
            <FormattedDate value={new Date(status.get('created_at'))} hour12={false} year='numeric' month='short' day='2-digit' hour='2-digit' minute='2-digit' />
          </a>{applicationLink} · {reblogLink} · <Link to={`/statuses/${status.get('id')}/favourites`} className='detailed-status__link'>
            <i className='fa fa-star' />
            <span className='detailed-status__favorites'>
              <FormattedNumber value={status.get('favourites_count')} />
            </span>
          </Link> · <VisibilityIcon visibility={status.get('visibility')} />
        </div>
      </div>
    );
  }

}
