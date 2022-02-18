<template>
    <div v-if="false" />
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import { createHighlightBox, setHighlightBoxToTarget } from '@/utils/float-manager.js';
import { MESSAGE_KEYS, sendMessageToAllFrames } from '@/utils/browser-interfaces/messaging.js';
import { iframeFullIndex } from '@/utils/iframes.js';
import { ifStringTryParseJson, isTaggingAidUi } from '@/utils/common.js';
import u from 'umbrellajs';
import Sizzle from 'sizzle';
import throttle from 'lodash/throttle';

export default {
    name: 'Sizzler',
    data () {
        return {
            sizzleTracker: [],
            timer: null,
        }
    },
    beforeMount () {
        this.timer = setInterval(() => {
            if (this.sizzleIsActive && this.sizzleTracker.length <= 50) {
                this.removeSizzleOutlines();
                this.createSizzleOutlines();
            }
        }, 3000)
        this.addAllListeners();     
    },
    beforeDestroy () {
        clearInterval(this.timer);
        this.removeSizzleOutlines();
        this.removeAllListeners();
    },
    computed: {
        ...mapGetters({
            sizzleIsActive: 'sizzler/sizzleIsActive',
            sizzleValue: 'sizzler/sizzleValue',
            sizzleUpdateId: 'sizzler/sizzleUpdateId'
        })
    },
    watch: {
        sizzleIsActive (value) {
            this.removeSizzleOutlines()
            if (value) {
                this.createSizzleOutlines();
            }
        },
        sizzleValue (value) {
            if (this.sizzleIsActive) {
                this.removeSizzleOutlines();
                this.createSizzleOutlines();
            }
        }
    },
    methods: {
        ...mapActions({
            setSizzleIsActive: 'sizzler/setSizzleIsActive',
            setSizzleValue: 'sizzler/setSizzleValue',
        }),
        updateFromMessage (event) {
            let messageData = ifStringTryParseJson(event.data);
            switch(messageData.type) {
                case MESSAGE_KEYS.sizzleActiveUpdate:
                    let active = {
                        value: !!messageData.value,
                        updateId: messageData.updateId,
                    };
                    this.setSizzleIsActive(active);
                    break;
                case MESSAGE_KEYS.sizzleValueUpdate:
                    let sizzleValue = {
                        value: messageData.value,
                        updateId: messageData.updateId,
                    };
                    this.setSizzleValue(sizzleValue);
                    break;
            }
        },
        addMessageListener () {
            window.addEventListener('message', this.updateFromMessage, true);
        },
        removeMessageListener () {
            window.removeEventListener('message', this.updateFromMessage, true);
        },
        addResizeAndScrollListener () {
			window.addEventListener('resize', this.throttledUpdateSizzleOutlines, true);
            window.addEventListener('scroll', this.throttledUpdateSizzleOutlines, true);
        },
        removeResizeAndScrollListener () {
			window.removeEventListener('resize', this.throttledUpdateSizzleOutlines, true);
            window.removeEventListener('scroll', this.throttledUpdateSizzleOutlines, true)
        },
        addAllListeners () {
            this.addMessageListener();
            this.addResizeAndScrollListener();
        },
        removeAllListeners () {
            this.removeMessageListener();
            this.removeResizeAndScrollListener();
        },
        createSizzleOutlines () {
            if (!this.sizzleValue) return;
            this.sizzleTracker = Sizzle(this.sizzleValue)
            .filter(node => {
                return !isTaggingAidUi(node)
            })
            .map(node => {
                return { node }
            });
            sendMessageToAllFrames({ 
                message: {
                    type: MESSAGE_KEYS.sizzleCountResponse, 
                    value: this.sizzleTracker.length, 
                    updateId: this.sizzleUpdateId,
                    frameId: iframeFullIndex(),
                } 
            });
            this.sizzleTracker.forEach(match => {
                match.highlightBox = createHighlightBox(match.node, {classList: ['_pendota-sizzle_']})
            })
        },
        updateSizzleOutlines () {
            this.sizzleTracker.forEach(match => {
                setHighlightBoxToTarget(match.highlightBox, match.node);
            })
        },
        throttledUpdateSizzleOutlines: throttle(function() {
            this.updateSizzleOutlines();
        }, 75),
        removeSizzleOutlines () {
            u('._pendota-sizzle_').remove();
            this.sizzleTracker = [];
        },
    }
}
</script>
<style lang="scss">
._pendota-sizzle_ {
    background: rgba(236,32,89,0.25);
    outline: 2px double #000;
    transition: top .3s ease, bottom .3s ease, left .3s ease, right .3s ease, height .3s ease, width .3s ease;
}
</style>