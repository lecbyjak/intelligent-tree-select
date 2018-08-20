"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require("reactstrap");

var _newOptionForm = require("./forms/newOptionForm");

var _newOptionForm2 = _interopRequireDefault(_newOptionForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
        this.setState({ modalVisible: !this.state.modalVisible });
    }

    render() {
        const FormComponent = this.props.formComponent || _newOptionForm2.default;

        return _react2.default.createElement(
            "div",
            null,
            _react2.default.createElement(
                _reactstrap.Button,
                { color: "link", className: "d-flex justify-content-center  align-items-center",
                    onClick: this._toggleModal,
                    id: this.id },
                "Create new option"
            ),
            _react2.default.createElement(
                _reactstrap.Tooltip,
                { innerClassName: "bg-light text-dark border border-dark", delay: { show: 300, hide: 100 },
                    placement: "right", isOpen: this.state.tooltipVisible,
                    target: this.id, toggle: () => this.setState({ tooltipVisible: !this.state.tooltipVisible }) },
                "Didn\xB4t find your term? Add new one."
            ),
            _react2.default.createElement(
                _reactstrap.Modal,
                { backdrop: "static", isOpen: this.state.modalVisible, toggle: this._toggleModal },
                _react2.default.createElement(FormComponent, { onOptionCreate: this.props.formData.onOptionCreate,
                    toggleModal: this._toggleModal,
                    options: this.props.formData.options,
                    labelKey: this.props.formData.labelKey,
                    valueKey: this.props.formData.valueKey,
                    childrenKey: this.props.formData.childrenKey
                })
            )
        );
    }
}

exports.default = ModalWindow;