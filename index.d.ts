import * as React from "react";

export interface BaseOption {
  [key: string]: any;
  label?: string;
  value?: string | number;
  children?: (string | number)[];
}

export interface TreeOption extends BaseOption {
  value: string | number;
  label: string;
  children: (string | number)[];
  parent?: TreeOption | null;
  depth?: number;
  expanded?: boolean;
  visible?: boolean;
  path?: (string | number)[];
  fetchingChild?: boolean;
}

/** Parameters supplied to fetchOptions. */
export interface FetchParams<T extends TreeOption = TreeOption> {
  /** Search string entered by the user. Possibly empty. */
  searchString: string;
  /** Identifier of the option being expanded (whose children should be fetched). Possibly undefined/empty. */
  optionID: string | number;
  /** Number of options to fetch (page size). Based on fetchLimit property. */
  limit: number;
  /** Fetch offset. */
  offset: number;
  /** The option being expanded. Possibly undefined. */
  option?: T | null;
}

/** Async option loader. Return flattened or nested options. */
export type FetchOptionsFn<T extends TreeOption = TreeOption> = (params: FetchParams<T>) => Promise<BaseOption[] | T[]>;

/** Shared props (outer + inner). */
export interface CommonTreeSelectProps<T extends TreeOption = TreeOption> {
  /** Auto-focus the input on mount. Default: false */
  autoFocus?: boolean;
  /** Whether the menu is open. Setting this to true forces the menu to stay always open. Default: false */
  isMenuOpen?: boolean;
  /** Attribute of an option that represents its children (array of child IDs after simplification). Default: 'children' */
  childrenKey?: string;
  /** Whether the options are expanded by default. Default: false */
  expanded?: boolean;
  /** Size of a page loaded in one request via fetchOptions. Default: 100 */
  fetchLimit?: number;
  /** Function used to fetch options. See README 'Fetch Options Function'. */
  fetchOptions?: FetchOptionsFn<T>;
  /** Custom match predicate used in filtering. */
  matchCheck?: (search: string, optionLabel: string) => boolean;
  /** Attribute of an option that contains the display text. Default: 'label' */
  labelKey?: string;
  /** Function to extract label from an option. If specified, overrides labelKey. */
  getOptionLabel?: (option: T) => string;
  /** Derive value programmatically. */
  getOptionValue?: (option: T) => string | number;
  /** Whether multiple selection is supported. Default: true. */
  multi?: boolean;
  /** Unique name for the component. Whenever this prop is set then the options will be cached. */
  name?: string;
  /** Callback when the input value changes. */
  onInputChange?: (input: string) => void;
  /** Option row height. Supports number or function returning height per option. Default: 25 */
  optionHeight?: number | ((ctx: {option: T}) => number);
  /** Initial / externally provided option set (ignored if fetchOptions). */
  options?: BaseOption[] | T[];
  /** Whether options should be rendered as a tree; if false a flat selectable list is shown. Default: true */
  renderAsTree?: boolean;
  /** Whether the options are already in simple flattened format (one node per option). Default: true */
  simpleTreeData?: boolean;
  /** String representing how long fetched options should be cached. Syntax: XdXhXmXs (e.g. 1d2h30m, 5m). Default: '5m' */
  optionLifetime?: string;
  /** Attribute of an option that represents its value. Default: 'value' */
  valueKey?: string;
  /** Custom component to render each option row. */
  optionRenderer?: React.ComponentType<any>;
  /** Custom renderer for selected value(s); receives default label node + option. Works for single and multi. */
  valueRenderer?: (children: React.ReactNode, option: T) => React.ReactNode;
  /** Debounce delay (ms) before triggering fetch (immediate if unset). */
  searchDelay?: number;

  hideSelectedOptions?: boolean;
  /** Sets if the dropdown is rendered above other content (absolute) or as part of layout (relative). Default: true */
  menuIsFloating?: boolean;
  /** Sets if the passed value is controlled externally and may change over time. Default: true */
  valueIsControlled?: boolean;

  isClearable?: boolean;

  styles?: Record<string, any>;
  /** Attribute of an option that contains tooltip text. Default: 'title' */
  titleKey?: string;
  /** Maximum height of the dropdown menu. Default: 300 */
  maxHeight?: number;
  /** Minimum height of the dropdown menu. Default: 0 */
  minHeight?: number;

  menuStyle?: React.CSSProperties;
  /** Base left indent applied per depth level (depth * optionLeftOffset). Default: 16 */
  optionLeftOffset?: number;
  /** Text displayed when no matching options were found. */
  noResultsText?: string;
  /** Text displayed while options are being loaded. */
  loadingText?: string;
}

/** Outer wrapper props. */
export interface IntelligentTreeSelectProps<T extends TreeOption = TreeOption> extends CommonTreeSelectProps<T> {
  /** Controlled or initial value(s); can be option objects or raw ids. */
  value?: T | T[] | (string | number)[] | null;
  /** Called with selected option objects (flattened) after change. */
  onChange?: (value: T[] | null) => void;
}

/** Low-level virtualized select props. */
export interface VirtualizedTreeSelectProps<T extends TreeOption = TreeOption> extends CommonTreeSelectProps<T> {
  onChange?: (value: T[] | null) => void;
  value?: T[];
  listProps?: {
    onScroll?: (e: {clientHeight: number; scrollHeight: number; scrollTop: number}) => void;
    [k: string]: any;
  };

  update?: number;
  /** Toggle expand/collapse of a tree option */
  onOptionToggle?: (option: T) => void;

  noOptionsMessage?: () => React.ReactNode;
  loadingMessage?: () => React.ReactNode;
}

/** The following methods can be called on instances of the intelligent-tree-select component (accessed via a ref). */
export class IntelligentTreeSelect<T extends TreeOption = TreeOption> extends React.Component<
  IntelligentTreeSelectProps<T>
> {
  /** Focus the tree select input. */
  focus(): void;
  /** Blur the tree select input. */
  blurInput(): void;
  /** Force reloading of options when fetchOptions property is used to specify how to load options. If options are specified in props, this reloads them from the current props. */
  resetOptions(): void;
  /** Current flattened (processed) option list */
  getOptions(): T[];
}

export class VirtualizedTreeSelect<T extends TreeOption = TreeOption> extends React.Component<
  VirtualizedTreeSelectProps<T>
> {
  /** Focus the tree select input.*/
  focus(): void;
  /** Blur the tree select input. */
  blurInput(): void;
  /** Force reloading of options when fetchOptions property is used to specify how to load options. If options are specified in props, this reloads them from the current props. */
  resetOptions(): void;
}

/** Minus icon used in tree expand/collapse UI */
export const ToggleMinusIcon: React.FC<React.SVGProps<SVGSVGElement>>;
/** Plus icon used in tree expand/collapse UI */
export const TogglePlusIcon: React.FC<React.SVGProps<SVGSVGElement>>;

export {IntelligentTreeSelect as default};
