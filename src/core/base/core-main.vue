<template>
<div>
    <ui-main v-if="isTaggingAidUiFrame" />
    <template v-if="!isTaggingAidUiFrame && taggingAidActive">
        <ui-frame v-if="isTopWindow" @close="closeTaggingAid"/>
        <scanner />
        <sizzler />
    </template>
</div>
</template>
<script>

import { GLOBAL_KEYS, globalValues } from '@/utils/global-values.js';
import { MESSAGE_KEYS, sendMessageToAllFrames } from '@/utils/browser-interfaces/messaging.js';
import { mapActions, mapGetters } from 'vuex';
import get from 'lodash/get';
import Sizzler from '@/core/base/sizzler.vue';
import Scanner from '@/core/base/scanner.vue';
import UiFrame from '@/core/ui/ui-frame.vue';
import UiMain from '@/core/ui/ui-main.vue';
import { isTopWindow, iframeFullIndex, isTaggingAidUiFrame } from '@/utils/iframes.js';
import { ifStringTryParseJson } from '@/utils/common.js';

export default {
    name: 'CoreMain',
    components: {
        Scanner,
        Sizzler,
        UiFrame,
        UiMain,
    },
    data () {
        return {
            iframeFullIndex: iframeFullIndex(),
            storedValues: {},
            isTopWindow: isTopWindow(),
            isTaggingAidUiFrame: isTaggingAidUiFrame(),
        }
    },
    computed: {
        ...mapGetters({
            taggingAidActive: 'ui/isActive',
            isLocked: 'lockedElement/isLocked',
            isActiveFrame: 'lockedElement/isActiveFrame',
            allElements: 'lockedElement/allElements',
        }),
    },
    watch: {
        taggingAidActive (value) {
            if (!value) {
                this.setIsLocked({ value: false });
            }
        },
        isLocked (value) {
            if (this.isActiveFrame || this.isTaggingAidUiFrame) {
                sendMessageToAllFrames({ message: {type: MESSAGE_KEYS.lockUpdate, value} });
            }
        }
    },
    methods: {
        ...mapActions({
            toggleTaggingAidActive: 'ui/toggleIsActive',
            setTaggingAidActive: 'ui/setIsActive',
            setIsLocked: 'lockedElement/setIsLocked',
            setNewElementArray: 'lockedElement/setNewElementArray',
            setActiveFrame: 'lockedElement/setActiveFrame',
            traverseUp: 'lockedElement/traverseUp',
            traverseDown: 'lockedElement/traverseDown',
            setNewSimpleElementArray: 'lockedElement/setNewSimpleElementArray',
        }),
        closeTaggingAid () {
            sendMessageToAllFrames({ message: {type: MESSAGE_KEYS.taggingAidToggle, value: false} });
        },
        openTaggingAid () {
            this.setTaggingAidActive({ value: true });
        },
        updateFromMessage (event) {
            let messageData = ifStringTryParseJson(event.data);
            switch(messageData.type) {
                case MESSAGE_KEYS.taggingAidToggle:
                    if (messageData.hasOwnProperty('value')) {
                        this.setTaggingAidActive({ value: messageData.value })
                    } else {
                        this.toggleTaggingAidActive();
                    }
                    this.setIsLocked({ value: false});
                    break;

                case MESSAGE_KEYS.lockUpdate:
                    let lockState = {
                        value: !!messageData.value,
                    };
                    this.setIsLocked(lockState);
                    break;

                case MESSAGE_KEYS.traverse:
                    if (this.isLocked && this.isActiveFrame) {
                        if (messageData.direction === 'up') {
                            this.traverseUp();
                        } else {
                            this.traverseDown();
                        }
                    }
                    break;
                    
                case MESSAGE_KEYS.targetUpdate:
                    if (messageData.frameId !== iframeFullIndex()) {
                        this.setActiveFrame(false);
                    }
                    break;
            }
        },
        addMessageListener () {
            window.addEventListener('message', this.updateFromMessage, true);
        },
        removeMessageListener () {
            window.removeEventListener('message', this.updateFromMessage, true);
        },
        addAllListeners () {
            this.addMessageListener();
        },
        removeAllListeners () {
            this.removeMessageListener();
        }
    },
    beforeMount () {
        this.addAllListeners();    
    },
    beforeDestroy () {
        this.removeAllListeners()
    },
    created () {
        this.openTaggingAid();
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            const messageType = get(message, 'messageType', '');
            if (this.isTopWindow) {
                switch (messageType) {
                    case MESSAGE_KEYS.taggingAidToggle:
                        sendMessageToAllFrames({ message: {type: MESSAGE_KEYS.taggingAidToggle, value: get(message, 'value')} });
                        // no break is intentional
                    case MESSAGE_KEYS.taggingAidCheck:
                        sendResponse({
                            taggingAidActive: this.taggingAidActive,
                        });
                    break;
                }
            }
        });
    }
}
</script>