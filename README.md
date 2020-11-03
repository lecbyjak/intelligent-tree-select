# Intelligent-tree-select

React tree select component  based on [react-select](https://github.com/JedWatson/react-select#react-select)
and [react-virtualized-select](https://github.com/bvaughn/react-virtualized-select#react-virtualized-select)

#### Before start

Before you can use this component you will need [Node.js](https://nodejs.org/en/) in version 6.5+, but i recommend to use the latest available version.

### Getting started
Easiest way is to install via NPM
```
npm install intelligent-tree-select --save
```

Then import it
```
import { VirtualizedTreeSelect } from 'intelligent-tree-select'
import { IntelligentTreeSelect } from 'intelligent-tree-select'
import "intelligent-tree-select/lib/styles.css"
import 'bootstrap/dist/css/bootstrap.css';
```

example of the usage in the `src/demo.js`

### Virtualized tree select Props

Props types are same as the one introduced by [_react-select@1.x_ ](https://github.com/JedWatson/react-select/tree/v1.x)
The additional parameters introduced by _virtualized-tree-select_ are optional. 
They are:

| Property | Type | Default Value | Description |
|:---|:---|:---|:---|
| childrenKey | `string` | 'children' | path of the child value in option objects |
| expanded | `bool` | false | whether the options are expanded by default |
| isMenuOpen | `bool` | false | Whether the menu is open. Setting this to true force menu to me always opened |
| maxHeight | `number` | 300 | Maximum height of the dropdown menu |
| minHeight | `number` | 0 | Minimum height of the dropdown menu |
| menuRenderer | `func` | - | overriding built-in drop-down menu render function |
| optionRenderer | `func` | - | overriding built-in option render function. |
| optionHeight | `number` or `func` | 25px | Option height. Dynamic height can be supported via a function with the signature `({ option: Object }): number` |
| optionLeftOffset | `number` | 16px | Option base left offset. Left offset is calculated as `depth level of the option * optionLeftOffset` |
| renderAsTree | `bool` | true | whether options should be rendered as a tree. |

#### Custom Option Renderer

You can override the built-in option renderer by specifying your own `optionRenderer` property. Your renderer should return a React element that represents the specified option. It will be passed the following named parameters:

| Property | Type | Description |
|:---|:---|:---|
| childrenKey | `string` | Attribute of option that contains the children key. |
| focusedOption | `Object` | The option currently-focused in the dropdown. Use this property to determine if your rendered option should be highlighted or styled differently. |
| focusedOptionIndex | `number` | Index of the currently-focused option. |
| focusOption | `Function` | Callback to update the focused option; for example, you may want to call this function on mouse-over. |
| key | `string` | A unique identifier for each element created by the renderer. |
| labelKey | `string` | Attribute of option that contains the display text. |
| getOptionLabel | `Function` | Function to extract label from an option. If specified, overrides `labelKey`. |
| option | `Object` | The option to be rendered. |
| optionIndex | `number` | Index of the option to be rendered. |
| renderAsTree | `bool` | Whether the options should be render as a tree. |
| searchString | `string` | Current content of the search input. |
| selectValue | `Function` | Callback to update the selected values; for example, you may want to call this function on click. |
| optionStyle | `Object` | Styles that must be passed to the rendered option. These styles are specifying the position of each option (required for correct option displaying in the dropdown).
| toggleOption | `Function` | Expand/Collapse option if it has children. |
| valueArray | `Array<Object>` | Array of the currently-selected options. Use this property to determine if your rendered option should be highlighted or styled differently. |
| valueKey | `string` | Attribute of option that contains the value. |

### Intelligent tree select props

| Property | Type | Default Value | Description |
|:---|:---|:---|:---|
| displayInfoOnHover | `bool` | false | Whether to render option information on hover. By default, this info is extracted by transforming the option to JSON and stringifying it. |
| tooltipKey | `string` | -- | Attribute of option which will be used as content of hover tooltip (instead of stringified option itself). |
| labelKey | `string` | `label` | Attribute of option that contains the display text. |
| getOptionLabel | `Function` | -- | Function to extract label from an option. If specified, overrides `labelKey`. |
| onOptionCreate | `function` | -- | callback when the new option is created. Signature `({ option: Object}): none`|
| optionLifetime | `string` | '5m' | String representing how long the options should be cached. Syntax: `XdXhXmXs` where `X` is some number, `d` stands for days, `h` hours ,`m` minutes, `s` seconds|
| showSettings | `bool` | 'true' | whether the section with settings and button for creating new option should be visible|
| simpleTreeData | `bool` | true | whether the options are in the simple format. (One node == one option) |
| fetchOptions | `func` | -- | Signature: `({searchString, optionID, limit, offset, option}): Promise`. If the `optionID` is not an empty string then the function should return children options of that option (`option` is provided as well should it be needed). If the `searchString` is not an empty string then the function should return all options whose label value match the `searchStromg` + their parent options|
| fetchLimit | `number` | 100 | amount of data to be fetched |
| multi | `bool` | true | whether the select in multi select or not |
| name | `string` | -- | Unique name for the component. Whenever this prop is set then the options will be cached|
| formComponent | `func` | -- | Function returning React element representing form. Syntax `({onOptionCreate, toggleModal, options, labelKey, valueKey, childrenKey}): React.component`|


### IntelligentTreeSelect public API

| Method | Description |
|:---|:---|
| `resetOptions` | Force reloading of options when `fetchOptions` property is used to specify how to load options. If options are specified in props, this reloads them from the current props. | 
