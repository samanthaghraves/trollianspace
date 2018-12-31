import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

export default class ColumnBackButtonSlim extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  handleClick = () => {
    // if history is exhausted, or we would leave mastodon, just go to root.
    if (window.history.state) {
      this.context.router.history.goBack();
    } else {
      this.context.router.history.push('/');
    }
  }

  render () {
    return (
      <div className='column-back-button--slim'>
        <div role='button' tabIndex='0' onClick={this.handleClick} className='column-back-button column-back-button--slim-button'>
          <i className='fa fa-fw fa-chevron-left column-back-button__icon' />
          <FormattedMessage id='column_back_button.label' defaultMessage='Back' />
        </div>
      </div>
    );
  }

}
