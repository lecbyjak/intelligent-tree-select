'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = createFilterOptions;

var _jsSearch = require('js-search');

function createFilterOptions(_ref) {
    var indexes = _ref.indexes,
        indexStrategy = _ref.indexStrategy,
        _ref$labelKey = _ref.labelKey,
        labelKey = _ref$labelKey === undefined ? 'label' : _ref$labelKey,
        _ref$options = _ref.options,
        options = _ref$options === undefined ? [] : _ref$options,
        sanitizer = _ref.sanitizer,
        searchIndex = _ref.searchIndex,
        tokenizer = _ref.tokenizer,
        _ref$valueKey = _ref.valueKey,
        valueKey = _ref$valueKey === undefined ? 'value' : _ref$valueKey;

    var search = new _jsSearch.Search(valueKey);
    search.searchIndex = searchIndex || new _jsSearch.UnorderedSearchIndex();
    search.indexStrategy = indexStrategy || new _jsSearch.AllSubstringsIndexStrategy();

    if (sanitizer) {
        search.sanitizer = sanitizer;
    }

    if (tokenizer) {
        search.tokenizer = tokenizer;
    }

    if (indexes) {
        indexes.forEach(function (index) {
            search.addIndex(index);
        });
    } else {
        search.addIndex(labelKey);
    }

    search.addDocuments(options);

    // See https://github.com/JedWatson/react-select/blob/e19bce383a8fd1694278de47b6d00a608ea99f2d/src/Select.js#L830
    // See https://github.com/JedWatson/react-select#advanced-filters
    return function filterOptions(options, filter, selectedOptions) {
        var filtered = filter ? search.search(filter) : options;

        var filteredWithParents = filtered;
        filtered.forEach(function (option) {
            var index = filteredWithParents.findIndex(function (obj) {
                return obj[valueKey] === option[valueKey];
            });
            var indexParent = options.findIndex(function (obj) {
                return obj[valueKey] === option.parent;
            });

            var _loop = function _loop() {
                var parent = options[indexParent];
                if (filteredWithParents.includes(parent)) return 'break';
                filteredWithParents.splice(index, 0, parent);
                indexParent = options.findIndex(function (obj) {
                    return obj[valueKey] === parent.parent;
                });
            };

            while (indexParent >= 0) {
                var _ret = _loop();

                if (_ret === 'break') break;
            }
        });

        for (var index = 0; index < filteredWithParents.length; index++) {
            if (!filteredWithParents[index].expanded) {
                filteredWithParents = _filter(filteredWithParents, index);
            }
        }

        if (Array.isArray(selectedOptions) && selectedOptions.length) {
            var selectedValues = selectedOptions.map(function (option) {
                return option[valueKey];
            });

            return filtered.filter(function (option) {
                return !selectedValues.includes(option[valueKey]);
            });
        }

        return filteredWithParents;
    };
}

function _filter(filteredWithParents, index) {
    return filteredWithParents.filter(function (option) {
        if (option.graph === filteredWithParents[index].graph) return true;
        return !option.graph.toString().startsWith(filteredWithParents[index].graph.toString());
    });
}