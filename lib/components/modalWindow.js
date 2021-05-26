"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactstrap = require("reactstrap");

var _newOptionForm = _interopRequireDefault(require("./forms/newOptionForm"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class ModalWindow extends _react.Component {
  constructor(props) {
    super(props);
    this.id = 'Modal_form_open_button';
    this._toggleModal = this._toggleModal.bind(this);
    this.state = {
      tooltipVisible: false,
      modalVisible: false
    };
  }

  _toggleModal() {
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  render() {
    const FormComponent = this.props.formComponent || _newOptionForm.default;
    const openButtonTooltipLabel = this.props.openButtonTooltipLabel || 'Didn´t find your term? Create new one.';
    const openButtonLabel = this.props.openButtonLabel || 'Create new option';
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_reactstrap.Button, {
      color: "link",
      onClick: this._toggleModal,
      id: this.id
    }, openButtonLabel), /*#__PURE__*/_react.default.createElement(_reactstrap.Tooltip, {
      innerClassName: "bg-light text-dark border border-dark",
      delay: {
        show: 300,
        hide: 100
      },
      placement: "right",
      isOpen: this.state.tooltipVisible,
      target: this.id,
      toggle: () => this.setState({
        tooltipVisible: !this.state.tooltipVisible
      })
    }, openButtonTooltipLabel), /*#__PURE__*/_react.default.createElement(_reactstrap.Modal, {
      backdrop: "static",
      isOpen: this.state.modalVisible,
      toggle: this._toggleModal
    }, /*#__PURE__*/_react.default.createElement(FormComponent, {
      onOptionCreate: this.props.formData.onOptionCreate,
      toggleModal: this._toggleModal,
      options: this.props.formData.options,
      labelKey: this.props.formData.labelKey,
      valueKey: this.props.formData.valueKey,
      childrenKey: this.props.formData.childrenKey
    })));
  }

}

var _default = ModalWindow;
exports.default = _default;