import React, {Component} from 'react';
import ModalWindow from './modalWindow'
import PropTypes from "prop-types";

class Settings extends Component {


  render() {
    return <div className="d-flex justify-content-between">
        <ModalWindow onOptionCreate={this.props.onOptionCreate}
                     formData={this.props.formData}
                     formComponent={this.props.formComponent}
                     openButtonTooltipLabel={this.props.openButtonTooltipLabel}
                     openButtonLabel={this.props.openButtonLabel}
        />
      </div>;
  }
}


export default Settings;

Settings.propTypes = {
  formData: PropTypes.object.isRequired,
  onOptionCreate: PropTypes.func.isRequired,
};
