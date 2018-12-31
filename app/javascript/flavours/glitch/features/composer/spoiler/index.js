//  Package imports.
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

//  Utils.
import {
  assignHandlers,
  hiddenComponent,
} from 'flavours/glitch/util/react_helpers';

//  Messages.
const messages = defineMessages({
  placeholder: {
    defaultMessage: 'Write your warning here',
    id: 'compose_form.spoiler_placeholder',
  },
});

//  Handlers.
const handlers = {

  //  Handles a keypress.
  handleKeyDown ({
    ctrlKey,
    keyCode,
    metaKey,
  }) {
    const { onSubmit } = this.props;

    //  We submit the status on control/meta + enter.
    if (onSubmit && keyCode === 13 && (ctrlKey || metaKey)) {
      onSubmit();
    }
  },

  handleRefSpoilerText (spoilerText) {
    this.spoilerText = spoilerText;
  },
};

//  The component.
export default class ComposerSpoiler extends React.PureComponent {

  //  Constructor.
  constructor (props) {
    super(props);
    assignHandlers(this, handlers);
  }

  //  Rendering.
  render () {
    const { handleKeyDown, handleRefSpoilerText } = this.handlers;
    const {
      hidden,
      intl,
      onChange,
      text,
    } = this.props;

    //  The result.
    return (
      <div className={`composer--spoiler ${hidden ? '' : 'composer--spoiler--visible'}`}>
        <label>
          <span {...hiddenComponent}>
            <FormattedMessage {...messages.placeholder} />
          </span>
          <input
            id='glitch.composer.spoiler.input'
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={intl.formatMessage(messages.placeholder)}
            type='text'
            value={text}
            ref={handleRefSpoilerText}
          />
        </label>
      </div>
    );
  }

}

//  Props.
ComposerSpoiler.propTypes = {
  hidden: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  text: PropTypes.string,
};
