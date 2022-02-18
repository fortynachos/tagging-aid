import { promisify } from '@/utils/common.js';

export const MESSAGE_KEYS = {
    preload: 'PRELOAD_CHECK',
    vueload: 'VUELOAD_CHECK',
    taggingAidCheck: 'TA_CHECK',
    loadVueContent: 'VUELOAD',
    taggingAidToggle: 'TAGGING_AID_TOGGLE',
    lockUpdate: 'PENDOTA_LOCK_UPDATE',
    targetUpdate: 'PENDOTA_TARGET_UPDATE',
    traverse: 'PENDOTA_TRAVERSE',
    sizzleActiveUpdate: 'PENDOTA_SIZZLE_ACTIVE',
    sizzleValueUpdate: 'PENDOTA_SIZZLE_VALUE',
    sizzleCountResponse: 'PENDOTA_SIZZLE_COUNT',
};

export async function sendTabMessage(tabId, message, options = null) {
    let promisifiedFn = promisify(chrome.tabs.sendMessage);
    return promisifiedFn(tabId, message, options);
}

export function sendMessageToAllFrames({ target, message }) {
    target = target || window;
    if (target.parent === target) {
        sendMessageToChildFrames({ target, message });
    } else {
        sendMessageToAllFrames({ target: target.parent, message });
    }
}

export function sendMessageToChildFrames({ target, message }) {
    if (typeof message !== 'string') message = JSON.stringify(message);
    target.postMessage(message, '*');
    for (var i = 0; i < target.frames.length; i++) {
        sendMessageToChildFrames({ target: target.frames[i], message });
    }
}
