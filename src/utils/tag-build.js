import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

export function tagItemDefaultLabel(itemType, itemValue, itemKey = '') {
    switch (itemType) {
        case 'id':
            return `#${itemValue}`;

        case 'type':
            return `${itemValue}`;

        case 'class':
            return `.${itemValue}`;

        case 'attribute':
            return `[${itemKey}="${itemValue}"]`;

        case 'contains':
            return `:contains("${itemValue}")`
    }
}

export function computeLabel(item) {
    const modifier = get(item, 'modifier', {});
    const modKey = item.type === 'attribute' ? item.subType : item.type;
    if (!isEmpty(modifier)) {
        const { modType, modValue } = modifier;
        switch (modType) {
            case 'begins with':
                return `[${modKey}^="${modValue}"]`;
            case 'ends with':
                return `[${modKey}$="${modValue}"]`;
            case 'contains':
                if (item.type === 'contains') {
                    return `:contains("${modValue}")`;
                }
                return `[${modKey}*="${modValue}"]`;
            case 'attribute exists':
                return `[${modKey}]`;
            case 'custom':
                return modValue;
            default:
                return tagItemDefaultLabel(item.type, item.value, item.subType);
        }
    }
    return tagItemDefaultLabel(item.type, item.value, item.subType);
}

export function tagItemIsEmpty(item) {
    let hasId = !!item.id;
    let hasType = !!item.type;
    let hasClasses = !!Object.keys(get(item, 'classes', {})).length;
    let hasAttributes = !!Object.keys(get(item, 'attributes', {})).length;
    let hasContains = !!item.contains;

    return !(hasId || hasType || hasClasses || hasAttributes || hasContains);
}

export function tagBuildValuesAsArray(values) {
    let maxTier = get(values, 'maxTier', 0);
    let valuesArray = [];
    for (let i = maxTier; i > 0; i--) {
        if (values.hasOwnProperty(i)) {
            let newValue = { ...values[i], tier: i };
            valuesArray.push(newValue);
        }
    }
    return valuesArray;
}

export function tagBuildString(values) {
    let maxTier = get(values, 'maxTier', 0);
    let valuesString = '';
    for (let i = maxTier; i > 0; i--) {
        if (values.hasOwnProperty(i)) {
            let nextItem = tagItemString(values[i]);
            if (nextItem) valuesString = valuesString.concat(` ${nextItem}`);
        }
    }
    return valuesString.trim();
}

export function tagItemString(item) {
    let itemString = '';
    if (get(item, 'type.value', '')) itemString += get(item, 'type.label', '');
    if (get(item, 'id.value', '')) itemString += get(item, 'id.label', '');
    const classList = Object.values(get(item, 'classes', {}));
    classList.forEach((className) => {
        itemString += get(className, 'label', '');
    });
    const attributeList = Object.values(get(item, 'attributes', {}));
    attributeList.forEach((attributeName) => {
        itemString += get(attributeName, 'label', '');
    });
    if (get(item, 'contains.value', '')) itemString += get(item, 'contains.label', '');
    return itemString;
}
