import React from "react";
import classNames from "classnames";
import {ToggleMinusIcon, TogglePlusIcon} from "./Icons";
import {hashCode} from "./utils/Utils";
import Highlighter from "react-highlight-words";

const Option = (props) => {
  const classes = classNames("VirtualizedSelectOption", {
    "VirtualizedSelectDisabledOption": props.isDisabled,
    "VirtualizedSelectSelectedOption": props.isSelected
  })

  const events = props.isDisabled ? {} : {
    onClick: () => {
      props.selectProps.onOptionSelect(props);
    },
  };

  let button = null;
  if (props.data[props.selectProps.childrenKey].length > 0) {
    button = getExpandButton(props.selectProps.onOptionToggle, props.data);
  }
  const value = props.data[props.selectProps.valueKey]

  return <div ref={props.innerRef} className={classes} style={{marginLeft: `${props.data.depth * 16}px`}}>

    {props.selectProps.renderAsTree &&
      <div style={{width: '16px'}}>
        {button}
      </div>
    }
    <div id={"item-" + hashCode(value)} className={"result-item"} onClick={events.onClick}>

      <Highlighter
        highlightClassName='highlighted'
        searchWords={[props.selectProps.inputValue]}
        autoEscape={true}
        textToHighlight={props.label}
        highlightTag={"span"}
      />
    </div>

    {props.data.fetchingChild &&
      <span className="Select-loading-zone" aria-hidden="true" style={{'paddingLeft': '5px'}}>
                <span className="Select-loading"/>
    </span>
    }
  </div>;
}

function getExpandButton(onToggle, option) {
  return <span onClick={() => onToggle(option)} className="toggleButton">
                {option.expanded ? <ToggleMinusIcon/> : <TogglePlusIcon/>}
  </span>;
}

export default Option;
