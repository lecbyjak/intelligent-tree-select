import {getOptionId, hashCode, logAndError} from "./utils/Utils";

/**
 * Processes registered options, creating their structured copy and allows calculating their depth, parents and path
 */
export default class OptionsProcessor {
  /**
   * Sorted set of already visited options
   *
   * @type {Set<any>}
   * @private
   */
  _visitedOptions = new Set();

  /**
   * Map of optionId to option objects
   *
   * @type {Map<string, Object>}
   * @private
   */
  _knownOptionsMap = new Map();

  constructor(valueKey, childrenKey) {
    this._valueKey = valueKey;
    this._childrenKey = childrenKey;
  }

  /**
   * Register a new option with a unique option ID
   *
   * @param option {Object}
   */
  register = (option) => {
    if (typeof option !== "object") {
      throw logAndError(`Unknown option type '${typeof option}'`);
    }

    const optionId = option[this.valueKey];
    if (this._knownOptionsMap.has(optionId)) {
      console.error("Duplicated option value", optionId, option);
      return;
    }

    const processedOption = Object.assign({}, option, {
      value: optionId,
      parent: null,
    });

    this._knownOptionsMap.set(optionId, processedOption);
  };

  /**
   * Processes the options for tree structure, calculating their depths and parents
   */
  processWithDepths = () => {
    const childOptionIds = new Set();

    this._knownOptionsMap.forEach((option) => {
      const children = option[this.childrenKey];
      if (Array.isArray(children)) {
        children.forEach((child) => childOptionIds.add(getOptionId(child, this.valueKey)));
      }
    });

    this._knownOptionsMap.forEach((option, optionId) => {
      if (!childOptionIds.has(optionId)) {
        this._calculateInternal(optionId, 0, null, new Set());
      }
    });

    // Process components without a root as well, e.g. cyclic or otherwise malformed subtrees.
    this._knownOptionsMap.forEach((option, optionId) => {
      if (!this._visitedOptions.has(option)) {
        this._calculateInternal(optionId, 0, null, new Set());
      }
    });
  };

  /**
   * Processes the options for flat structure, setting all depths to 0 and parents to {@code null}.
   */
  processFlat = () => {
    this._knownOptionsMap.forEach((option) => {
      option.depth = 0;
      option.parent = null;
      option.path = Object.freeze([option[this.valueKey]]);
      Object.freeze(option);
      this._visitedOptions.add(option);
    });
  };

  /**
   *
   *
   * @param optionId {string} the option
   * @param depth {number} the current depth
   * @param parent {Object|null} the direct parent of the {@code option}
   * @param visitedKeys {Set<string>} visited keys on this tree branch
   * @private
   */
  _calculateInternal = (optionId, depth, parent, visitedKeys) => {
    let option = this._knownOptionsMap.get(optionId);
    if (!option || visitedKeys.has(optionId)) {
      return;
    }

    if (this._visitedOptions.has(option)) {
      option = structuredClone(option);
    }

    this._visitedOptions.add(option);
    visitedKeys.add(optionId);

    option.depth = depth;
    option.parent = parent;
    option.path = Object.freeze([...visitedKeys]);
    Object.freeze(option); // TODO: remove options modification (expanded, isFetchingChild, visible) and freeze them

    const children = option[this.childrenKey];
    if (!Array.isArray(children)) {
      return;
    }
    children.forEach((child) => {
      let childId = getOptionId(child, this.valueKey);
      // Create a new set for each child to avoid modifying the parent's visited set - prevent only loops in one tree branch
      this._calculateInternal(childId, depth + 1, option, new Set(visitedKeys));
    });
  };

  /**
   * Array of the processed options
   *
   * @returns {Object[]}
   */
  getProcessedOptions() {
    return Object.freeze([...this._visitedOptions]);
  }

  /**
   * The key of option object where the value for selection is stored
   *
   * @returns {string}
   */
  get valueKey() {
    return this._valueKey;
  }

  /**
   * The key of option object where children array is stored
   * @returns {string}
   */
  get childrenKey() {
    return this._childrenKey;
  }
}
