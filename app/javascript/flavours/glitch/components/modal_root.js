import React from 'react';
import PropTypes from 'prop-types';
import createHistory from 'history/createBrowserHistory';

export default class ModalRoot extends React.PureComponent {
  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
    noEsc: PropTypes.bool,
  };

  state = {
    revealed: !!this.props.children,
  };

  activeElement = this.state.revealed ? document.activeElement : null;

  handleKeyUp = (e) => {
    if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)
         && !!this.props.children && !this.props.noEsc) {
      this.props.onClose();
    }
  }

  componentDidMount () {
    window.addEventListener('keyup', this.handleKeyUp, false);
    this.history = this.context.router ? this.context.router.history : createHistory();
  }

  componentWillReceiveProps (nextProps) {
    if (!!nextProps.children && !this.props.children) {
      this.activeElement = document.activeElement;

      this.getSiblings().forEach(sibling => sibling.setAttribute('inert', true));
    } else if (!nextProps.children) {
      this.setState({ revealed: false });
    }
  }

  componentDidUpdate (prevProps) {
    if (!this.props.children && !!prevProps.children) {
      this.getSiblings().forEach(sibling => sibling.removeAttribute('inert'));
      this.activeElement.focus();
      this.activeElement = null;
      this.handleModalClose();
    }
    if (this.props.children) {
      requestAnimationFrame(() => {
        this.setState({ revealed: true });
      });
      if (!prevProps.children) this.handleModalOpen();
    }
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  handleModalClose () {
    this.unlistenHistory();

    const state = this.history.location.state;
    if (state && state.mastodonModalOpen) {
      this.history.goBack();
    }
  }

  handleModalOpen () {
    const history = this.history;
    const state   = {...history.location.state, mastodonModalOpen: true};
    history.push(history.location.pathname, state);
    this.unlistenHistory = history.listen(() => {
      this.props.onClose();
    });
  }

  getSiblings = () => {
    return Array(...this.node.parentElement.childNodes).filter(node => node !== this.node);
  }

  setRef = ref => {
    this.node = ref;
  }

  render () {
    const { children, onClose } = this.props;
    const { revealed } = this.state;
    const visible = !!children;

    if (!visible) {
      return (
        <div className='modal-root' ref={this.setRef} style={{ opacity: 0 }} />
      );
    }

    return (
      <div className='modal-root' ref={this.setRef} style={{ opacity: revealed ? 1 : 0 }}>
        <div style={{ pointerEvents: visible ? 'auto' : 'none' }}>
          <div role='presentation' className='modal-root__overlay' onClick={onClose} />
          <div role='dialog' className='modal-root__container'>{children}</div>
        </div>
      </div>
    );
  }

}
