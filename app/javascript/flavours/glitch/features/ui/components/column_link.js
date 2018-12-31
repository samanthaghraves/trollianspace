import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ColumnLink = ({ icon, text, to, onClick, href, method, badge }) => {
  const badgeElement = typeof badge !== 'undefined' ? <span className='column-link__badge'>{badge}</span> : null;

  if (href) {
    return (
      <a href={href} className='column-link' data-method={method}>
        <i className={`fa fa-fw fa-${icon} column-link__icon`} />
        {text}
        {badgeElement}
      </a>
    );
  } else if (to) {
    return (
      <Link to={to} className='column-link'>
        <i className={`fa fa-fw fa-${icon} column-link__icon`} />
        {text}
        {badgeElement}
      </Link>
    );
  } else {
    const handleOnClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return onClick(e);
    }
    return (
      <a href='#' onClick={onClick && handleOnClick} className='column-link' tabIndex='0'>
        <i className={`fa fa-fw fa-${icon} column-link__icon`} />
        {text}
        {badgeElement}
      </a>
    );
  }
};

ColumnLink.propTypes = {
  icon: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  to: PropTypes.string,
  onClick: PropTypes.func,
  href: PropTypes.string,
  method: PropTypes.string,
  badge: PropTypes.node,
};

export default ColumnLink;
