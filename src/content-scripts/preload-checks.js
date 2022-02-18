import { getFileURL } from '@/utils/browser-interfaces/file-management.js';
import { MESSAGE_KEYS } from '@/utils/browser-interfaces/messaging.js';
import { globalValues } from '@/utils/global-values.js';
import get from 'lodash/get';

// Only apply the listeners once
if (!globalValues.getValueByKey('initialized')) {
    globalValues.setValueByKey('initialized', true);
    function sendPreloadCheckToExtension(event) {
        if (event.source != window) return;

        if (get(event, 'data.type', '') === MESSAGE_KEYS.preload) {
            chrome.runtime.sendMessage({
                messageType: MESSAGE_KEYS.preload,
                designerEnabled: event.data.designerEnabled,
                pendoExists: event.data.pendoExists,
            });
        }
    }

    window.addEventListener('message', sendPreloadCheckToExtension);

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        const messageType = get(message, 'messageType', '');
        switch (messageType) {
            case MESSAGE_KEYS.vueload:
                sendResponse({
                    vueContentLoaded: globalValues.getValueByKey(
                        'vueContentLoaded'
                    ),
                });
                break;
            case MESSAGE_KEYS.loadVueContent:
                globalValues.setValueByKey('vueContentLoaded', true);
                sendResponse({
                    vueContentLoaded: globalValues.getValueByKey(
                        'vueContentLoaded'
                    ),
                });
        }
    });
}

// inject script onto the normal tab to access the standard window object
var preloadScript = document.createElement('script');
preloadScript.src = getFileURL('/public/check-for-pendo.js');
document.head.appendChild(preloadScript);
preloadScript.parentElement.removeChild(preloadScript);
