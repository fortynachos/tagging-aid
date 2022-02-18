<template>
    <div id="_pendota-container_" class="_pendota-draggable_">
        <ui-header />
        <ui-body />
    </div>
</template>
<script>
import u from 'umbrellajs';
import '@pendo/components/lib/pendo-components.min.css';
import UiHeader from './ui-header.vue';
import UiBody from './ui-body.vue';
import { mapActions } from 'vuex';
import { ifStringTryParseJson } from '@/utils/common.js';
import { MESSAGE_KEYS } from '@/utils/browser-interfaces/messaging.js';


export default {
    name: 'UiMain',
    components: {
        UiHeader,
        UiBody,
    },
    methods: {
    ...mapActions({
        setNewSimpleElementArray: 'lockedElement/setNewSimpleElementArray',
    }),
        updateFromMessage (event) {
            let messageData = ifStringTryParseJson(event.data);
            switch(messageData.type) {
                case MESSAGE_KEYS.targetUpdate:
                    let newTarget = messageData.value;
                    this.setNewSimpleElementArray(newTarget);
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
        },
    },
    beforeMount () {
        this.addAllListeners();    
    },
    beforeDestroy () {
        this.removeAllListeners()
    },
};
</script>
<style lang="scss">
@import 'src/styles/variables.scss';

#_pendota-container_ {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: block;
	margin: 0 auto;
	z-index: 100;
    font-size: medium;
	overflow-y: auto;
	border-radius: 0 0 3px 3px;
	background: white;
	-webkit-box-sizing: border-box;
	-moz-box-sizing: border-box;
	box-sizing: border-box;
}

.disabled {
    opacity: 50%;
    pointer-events: none;
}

</style>
