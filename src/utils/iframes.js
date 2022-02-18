import get from 'lodash/get';
import { getFileURL } from '@/utils/browser-interfaces/file-management.js';

// Returns the index of the iframe in the parent document, or -1 if we are the topmost document
// https://stackoverflow.com/questions/26010355/is-there-a-way-to-uniquely-identify-an-iframe-that-the-content-script-runs-in-fo
export function iframeIndex(win) {
    win = win || window; // Assume self by default
    if (!isTopWindow(win)) {
        for (var i = 0; i < win.parent.frames.length; i++) {
            if (win.parent.frames[i] === win) {
                return i;
            }
        }
        throw Error('In a frame, but could not find myself');
    }

    return -1;
}

// Returns a unique index relative to all iframes on the page, or 0 if topmost
export function iframeFullIndex(win) {
    win = win || window; // Assume self by default
    if (isTopWindow(win)) return '0';
    return iframeFullIndex(win.parent) + '.' + iframeIndex(win);
}

export function isIframe(win) {
    win = win || window; // Assume self by default
    return get(win, 'nodeName', '') === 'iframe';
}

export function isTopWindow(win) {
    win = win || window; // Assume self by default
    return win.parent === win;
}

export function isTaggingAidUiFrame(win) {
    win = win || window; // Assume self by default
    return win.location.href === getFileURL('/public/tagging-aid-ui.html');
}
