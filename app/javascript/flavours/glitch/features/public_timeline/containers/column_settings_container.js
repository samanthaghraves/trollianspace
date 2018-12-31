import { connect } from 'react-redux';
import ColumnSettings from 'flavours/glitch/features/community_timeline/components/column_settings';
import { changeSetting } from 'flavours/glitch/actions/settings';

const mapStateToProps = state => ({
  settings: state.getIn(['settings', 'public']),
});

const mapDispatchToProps = dispatch => ({

  onChange (path, checked) {
    dispatch(changeSetting(['public', ...path], checked));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(ColumnSettings);
