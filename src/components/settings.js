import React from 'react';
import ModalWindow from './modalWindow'
import PropTypes from "prop-types";

const Settings = props => {
  const {onOptionCreate, formData, formComponent, openButtonTooltipLabel, openButtonLabel} = props;
  return <div className="d-flex justify-content-between">
    <ModalWindow onOptionCreate={onOptionCreate}
                 formData={formData}
                 formComponent={formComponent}
                 openButtonTooltipLabel={openButtonTooltipLabel}
                 openButtonLabel={openButtonLabel}
    />
  </div>;
};

Settings.propTypes = {
  formData: PropTypes.object.isRequired,
  onOptionCreate: PropTypes.func.isRequired,
};

export default Settings;
