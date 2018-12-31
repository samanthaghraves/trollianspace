//  Package imports.
import PropTypes from 'prop-types';
import React from 'react';
import spring from 'react-motion/lib/spring';

//  Components.
import ComposerOptionsDropdownContentItem from './item';

//  Utils.
import { withPassive } from 'flavours/glitch/util/dom_helpers';
import Motion from 'flavours/glitch/util/optional_motion';
import { assignHandlers } from 'flavours/glitch/util/react_helpers';

//  Handlers.
const handlers = {
  //  When the document is clicked elsewhere, we close the dropdown.
  handleDocumentClick ({ target }) {
    const { node } = this;
    const { onClose } = this.props;
    if (onClose && node && !node.contains(target)) {
      onClose();
    }
  },

  //  Stores our node in `this.node`.
  handleRef (node) {
    this.node = node;
  },
};

//  The spring to use with our motion.
const springMotion = spring(1, {
  damping: 35,
  stiffness: 400,
});

//  The component.
export default class ComposerOptionsDropdownContent extends React.PureComponent {

  //  Constructor.
  constructor (props) {
    super(props);
    assignHandlers(this, handlers);

    //  Instance variables.
    this.node = null;

    this.state = {
      mounted: false,
    };
  }

  //  On mounting, we add our listeners.
  componentDidMount () {
    const { handleDocumentClick } = this.handlers;
    document.addEventListener('click', handleDocumentClick, false);
    document.addEventListener('touchend', handleDocumentClick, withPassive);
    this.setState({ mounted: true });
  }

  //  On unmounting, we remove our listeners.
  componentWillUnmount () {
    const { handleDocumentClick } = this.handlers;
    document.removeEventListener('click', handleDocumentClick, false);
    document.removeEventListener('touchend', handleDocumentClick, withPassive);
  }

  //  Rendering.
  render () {
    const { mounted } = this.state;
    const { handleRef } = this.handlers;
    const {
      items,
      onChange,
      onClose,
      style,
      value,
    } = this.props;

    //  The result.
    return (
      <Motion
        defaultStyle={{
          opacity: 0,
          scaleX: 0.85,
          scaleY: 0.75,
        }}
        style={{
          opacity: springMotion,
          scaleX: springMotion,
          scaleY: springMotion,
        }}
      >
        {({ opacity, scaleX, scaleY }) => (
          // It should not be transformed when mounting because the resulting
          // size will be used to determine the coordinate of the menu by
          // react-overlays
          <div
            className='composer--options--dropdown--content'
            ref={handleRef}
            style={{
              ...style,
              opacity: opacity,
              transform: mounted ? `scale(${scaleX}, ${scaleY})` : null,
            }}
          >
            {items ? items.map(
              ({
                name,
                ...rest
              }) => (
                <ComposerOptionsDropdownContentItem
                  active={name === value}
                  key={name}
                  name={name}
                  onChange={onChange}
                  onClose={onClose}
                  options={rest}
                />
              )
            ) : null}
          </div>
        )}
      </Motion>
    );
  }

}

//  Props.
ComposerOptionsDropdownContent.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.string,
    meta: PropTypes.node,
    name: PropTypes.string.isRequired,
    on: PropTypes.bool,
    text: PropTypes.node,
  })),
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  style: PropTypes.object,
  value: PropTypes.string,
};

//  Default props.
ComposerOptionsDropdownContent.defaultProps = { style: {} };
