import u from 'umbrellajs';
import get from 'lodash/get';

export const TAGGING_AID_UI_ID = '_pendota-ui_';

export function openLinkNewTab(url) {
    window.open(url, '_blank');
}

export function promisify(f) {
    // https://javascript.info/promisify
    return function(...args) {
        // return a wrapper-function (*)
        return new Promise((resolve, reject) => {
            function callback(result) {
                // our custom callback for f (**)
                resolve(result);
            }

            args.push(callback); // append our custom callback to the end of f arguments

            f.call(this, ...args); // call the original function
        });
    };
}

export function someParentHasId(element, idName) {
    if (!element) return null;
    else if (element.id != null && element.id == idName) return true;
    return u(element).closest(`#${idName}`).length > 0;
}

export function isTaggingAidUi(element) {
    return someParentHasId(element, TAGGING_AID_UI_ID);
}

export function ifStringTryParseJson(string) {
    if (typeof string === 'string') {
        try {
            stringJSON = JSON.parse(string);
        } catch (e) {
            return string;
        }
        return stringJSON;
    } else {
        return string;
    }
}

export function simpleDomNode(element) {
    if (!element) return null;
    else {
        var simpleNode = {};
        simpleNode.nodeName = element.nodeName.toLowerCase();
        simpleNode.id = element.id;

        let classes = get(element, 'className', '').split(/\s+/);
        if (!classes.length) classes.push('');
        simpleNode.classes = classes;

        attributes = [...get(element, 'attributes', [])];
        simpleNode.attributes = attributes
            .filter((value) => {
                return !['class', 'id', 'style'].includes(value.nodeName);
            })
            .reduce((acc, attr) => {
                return { ...acc, [attr.nodeName]: attr.value };
            }, {});

        simpleNode.textContent = '';
        if (element.innerText) {
            let textContent = element.textContent;
            if (textContent.length > 128)
                textContent = textContent.substring(0, 127);
            textContent = textContent.trim();
            simpleNode.textContent = textContent;
        }

        // recursively simplify all parent nodes
        simpleNode.parentNode = simpleDomNode(element.parentNode);
        if (!!simpleNode.parentNode) {
            delete simpleNode.parentNode.textContent;
        }
    }
    return simpleNode;
}

export function delay (timeInMS) {
    return new Promise((resolve) => {
        setTimeout(resolve.bind(null), timeInMS);
    });
}

export async function executeNextTick (func, ...args) {
    await delay(0);
    func.call(this, args);
}

export function prettyTruncate (str, maxChar = 45, endChar = 5) {
    if (str.length > maxChar) {
        return `${str.slice(0, maxChar - (endChar + 3))}...${str.slice(-endChar)}`;
    }
    return str;
}
