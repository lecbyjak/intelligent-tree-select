import React from "react";
import classNames from "classnames";
import {ToggleMinusIcon, TogglePlusIcon} from "./Icons";
import {hashCode} from "./utils/Utils";
import Highlighter from "react-highlight-words";

const Option = (props) => {
  const classes = classNames("VirtualizedSelectOption", {
    VirtualizedSelectDisabledOption: props.isDisabled,
    VirtualizedSelectSelectedOption: props.isSelected,
    VirtualizedSelectFocusedOption: props.isFocused,
  });

  const events = props.isDisabled
    ? {}
    : {
        onClick: () => {
          props.selectProps.onOptionSelect(props);
        },
      };

  const value = props.data[props.selectProps.valueKey];
  const isExpanded = props.selectProps.isOptionExpanded(props.data);
  const isFetchingChild = props.selectProps.isOptionFetchingChild(props.data);

  let button = null;
  if (props.data[props.selectProps.childrenKey].length > 0) {
    button = getExpandButton(props.selectProps.onOptionToggle, props.data, isExpanded);
  }

  return (
    <div ref={props.innerRef} className={classes} style={{marginLeft: `${props.data.depth * 16}px`}}>
      {props.selectProps.renderAsTree && <div style={{width: "16px"}}>{button}</div>}
      <div
        id={"item-" + hashCode(value)}
        className={"result-item"}
        onClick={events.onClick}
        title={props.data[props.selectProps.titleKey]}
      >
        <Highlighter
          highlightClassName="highlighted"
          searchWords={[props.selectProps.inputValue]}
          autoEscape={true}
          textToHighlight={props.label}
          highlightTag={"span"}
        />
      </div>

      {isFetchingChild && (
        <span className="Select-loading-zone" aria-hidden="true" style={{paddingLeft: "5px"}}>
          <span className="Select-loading" />
        </span>
      )}
    </div>
  );
};

function getExpandButton(onToggle, option, isExpanded) {
  return (
    <span onClick={() => onToggle(option)} className="toggleButton">
      {isExpanded ? <ToggleMinusIcon /> : <TogglePlusIcon />}
    </span>
  );
}

export default Option;
