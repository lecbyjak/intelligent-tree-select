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
import { IntelligentTreeSelect , optionStateEnum } from 'intelligent-tree-select'
import "../node_modules/intelligent-tree-select/lib/styles.css"
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
| maxHeight | `number` | 300 |  |
| menuRenderer | `func` | - | overriding build-in drop-down menu render function |
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
| option | `Object` | The option to be rendered. |
| selectValue | `Function` | Callback to update the selected values; for example, you may want to call this function on click. |
| optionStyle | `Object` | Styles that must be passed to the rendered option. These styles are specifying the position of each option (required for correct option displaying in the dropdown).
| valueArray | `Array<Object>` | Array of the currently-selected options. Use this property to determine if your rendered option should be highlighted or styled differently. |
| valueKey | `string` | Attribute of option that contains the value. |

### Intelligent tree select props

| Property | Type | Default Value | Description |
|:---|:---|:---|:---|
| displayState | `bool` | false |  |
| labelValue | `func` | -- | Return the label for option. Function with signature `({ option: Object }): string` |
| onOptionCreate | `function` | -- | callback when the new option is created. Signature `({ option: Object}): none`|
| simpleTreeData | `bool` | true | whether the options are in the simple format. (One node == one option) |
| providers | `Object` | -- | see signature bellow |
| multi | `bool` | true | whether the select in multi select or not |

#### Providers object signature

| Property | Type | Default value | Description |
|:---|:---|:---|:---|
| name | `bool`| (required) | unique name (ID) of the provider |
| response | `functino` | (required) | callback for fetching the options with signature `({ searchString: string }): Promise` |
| toJsonArr | `function` | -- | function to convert response data to json array format. E.g. XML to JSON, CSV to JSON, etc. |
| simpleTreeData | `bool` | true | whether the options are in the simple format. (One node == one option) |
| labelKey | `string` | 'label' | Attribute of option that contains the display text. |
| labelValue | `function` | -- | Return the label for option. Function with signature `({ option: Object }): string` |
| valueKey | `string` | 'value' | Attribute of option that contains the value. |
| childrenKey | `string` | 'children' | Attribute of option that contains the children key. |
