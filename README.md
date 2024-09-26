# Intelligent-tree-select

React tree select component based on [react-select](https://github.com/jedwatson/react-select)
and virtualization with [react-window](https://github.com/bvaughn/react-window).

#### Before start

Before you can use this component you will need [Node.js](https://nodejs.org/en/) in version 14+, but we recommend
using the latest available version.

### Getting started

Easiest way is to install via NPM

```
npm install intelligent-tree-select --save
```

Then import it

```
import { IntelligentTreeSelect } from "intelligent-tree-select"
import "intelligent-tree-select/lib/styles.css"
```

Usage example can be found in `examples/demo.js`

### Intelligent Tree Select Props

Props types are the same as the ones introduced by [react-select](https://github.com/JedWatson/react-select).

Additional parameters introduced by _intelligent-tree-select_ are:

| Property          | Type                   | Default Value | Description                                                                                                                                                                                                                               |
| :---------------- | :--------------------- | :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fetchOptions      | `func`                 | -             | Function used to fetch options. See below for argument description.                                                                                                                                                                       |
| fetchLimit        | `number`               | 100           | Size of a page loaded in one request via `fetchOptions`                                                                                                                                                                                   |
| searchDelay       | `number`               | -             | Delay in milliseconds between the input change and `fetchOptions` invocation. Allows to wait for reasonable user input before actually invoking search on the server. By default the search is invoked with no delay.                     |
| options           | `Array<Object>`        | -             | Options to render in the menu list. If `fetchOptions` is not specified (it takes precedence over this property if specified), this property can be used to provide options to select from. Note that it is recommended to _memoize_ them. |
| expanded          | `bool`                 | false         | whether the options are expanded by default                                                                                                                                                                                               |
| isMenuOpen        | `bool`                 | false         | Whether the menu is open. Setting this to true force menu to me always opened                                                                                                                                                             |
| multi             | `bool`                 | true          | Whether multiple selection is supported                                                                                                                                                                                                   |
| maxHeight         | `number`               | 300           | Maximum height of the dropdown menu                                                                                                                                                                                                       |
| minHeight         | `number`               | 0             | Minimum height of the dropdown menu                                                                                                                                                                                                       |
| optionRenderer    | `React component/func` | -             | overriding built-in option render component                                                                                                                                                                                               |
| valueRenderer     | `React component/func` | -             | overriding built-in value render component. Receives the selected option's label and the option itself as parameter (works for both multi and single select).                                                                             |
| optionHeight      | `number` or `func`     | 25px          | Option height. Dynamic height can be supported via a function with the signature `({ option: Object }): number`                                                                                                                           |
| optionLeftOffset  | `number`               | 16px          | Option base left offset. Left offset is calculated as `depth level of the option * optionLeftOffset`                                                                                                                                      |
| renderAsTree      | `bool`                 | true          | Whether options should be rendered as a tree.                                                                                                                                                                                             |
| noResultsText     | `string`               | -             | Text displayed when no matching options were found.                                                                                                                                                                                       |
| loadingText       | `string`               | -             | Text displayed while options are being loaded.                                                                                                                                                                                            |
| labelKey          | `string`               | 'label'       | Attribute of an option that contains the display text.                                                                                                                                                                                    |
| valueKey          | `string`               | 'value'       | Attribute of an option that represents the option's value.                                                                                                                                                                                |
| childrenKey       | `string`               | 'children'    | Attribute of an option that represents its children.                                                                                                                                                                                      |
| titleKey          | `string`               | 'title'       | Attribute of an option that contains the tooltip text.                                                                                                                                                                                    |
| getOptionLabel    | `Function`             | -             | Function to extract label from an option. If specified, overrides `labelKey`.                                                                                                                                                             |
| onOptionCreate    | `function`             | -             | callback when the new option is created. Signature `({ option: Object}): none` **Currently disabled.**                                                                                                                                    |
| optionLifetime    | `string`               | '5m'          | String representing how long the options should be cached. Syntax: `XdXhXmXs` where `X` is some number, `d` stands for days, `h` hours ,`m` minutes, `s` seconds.                                                                         |
| simpleTreeData    | `bool`                 | true          | Whether the options are in a simple format. (One node == one option). In this case, children are just an array of identifiers (values).                                                                                                   |
| name              | `string`               | --            | Unique name for the component. Whenever this prop is set then the options will be cached.                                                                                                                                                 |
| valueIsControlled | `boolean`              | true          | Sets if the passed value is changed over time. If not, the value can be used only to set the initial values.                                                                                                                              |
| menuIsFloating    | `boolean`              | true          | Sets if the dropdown is rendered above content or as a part of it. Useful when `isMenuOpen` is `true`.                                                                                                                                    |

#### Fetch Options Function

The component can either be provided all options to render in `props`, or a function used to fetch options as necessary.
This function should support:

1. Searching by string (component input). If search string is provided, options should be provided including their ancestors.
2. Paging
3. Fetching children of a node

The function is passed an object with the following attributes:

| Attribute    | Type     | Description                                                                                           |
| :----------- | :------- | :---------------------------------------------------------------------------------------------------- |
| searchString | `string` | Search string entered by the user. Possibly empty.                                                    |
| optionID     | `string` | Identifier of the option being expanded (whose children should be fetched). Possibly undefined/empty. |
| limit        | `number` | Number of options to fetch (page size). Based on `fetchLimit` property.                               |
| offset       | `number` | Fetch offset.                                                                                         |
| option       | `object` | Th option being expanded. Possibly undefined.                                                         |

#### Custom Option Renderer

You can override the built-in option renderer by specifying your own `optionRenderer` property. Your renderer should
return a React element that represents the specified option. It will be passed the following named parameters:

| Property    | Type            | Description                                                   |
| :---------- | :-------------- | :------------------------------------------------------------ |
| data        | `Array<Object>` | Options to render in the menu list.                           |
| key         | `string`        | A unique identifier for each element created by the renderer. |
| optionStyle | `Object`        | Passed styles for option.                                     |
| selectProps | `SelectProps`   | Props of Select.                                              |
| isFocused   | `bool`          | Whether the option is focused.                                |
| isDisabled  | `bool`          | Whether the option is focused.                                |
| isSelected  | `bool`          | Whether the option is selected.                               |

#### SelectProps

If you override the `optionRenderer` the `react-select` props are passed in the `selectProps` property. It gives you
access to the internals of the select. Some useful properties are listed below.

| Property       | Type       | Description                                                                                       |
| :------------- | :--------- | :------------------------------------------------------------------------------------------------ |
| childrenKey    | `string`   | Attribute of option that contains the children key.                                               |
| key            | `string`   | A unique identifier for each element created by the renderer.                                     |
| labelKey       | `string`   | Attribute of option that contains the display text.                                               |
| getOptionLabel | `Function` | Function to extract label from an option. If specified, overrides `labelKey`.                     |
| renderAsTree   | `bool`     | Whether the options should be render as a tree.                                                   |
| searchString   | `string`   | Current content of the search input.                                                              |
| onOptionSelect | `Function` | Callback to update the selected values; for example, you may want to call this function on click. |
| onOptionToggle | `Function` | Expand/Collapse option if it has children.                                                        |
| valueKey       | `string`   | Attribute of option that contains the value.                                                      |

### IntelligentTreeSelect public API

The following methods can be called on instances of the intelligent-tree-select component (accessed via a `ref`).

| Method         | Description                                                                                                                                                                  |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resetOptions` | Force reloading of options when `fetchOptions` property is used to specify how to load options. If options are specified in props, this reloads them from the current props. |
| `getOptions`   | Gets the options (flattened) currently provided by the component.                                                                                                            |
| `focus`        | Focus the tree select input.                                                                                                                                                 |
| `blurInput`    | Blur the tree select input.                                                                                                                                                  |
