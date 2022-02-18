<template>
    <div v-if="false" />
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import { createHighlightBox, setHighlightBoxToTarget } from '@/utils/float-manager.js';
import { blockerFunction } from '@/utils/default-blockers.js';
import { isTaggingAidUi } from '@/utils/common.js';
import { isIframe, iframeFullIndex } from '@/utils/iframes.js';
import { MESSAGE_KEYS, sendMessageToAllFrames } from '@/utils/browser-interfaces/messaging.js';
import u from 'umbrellajs';
import get from 'lodash/get';
import throttle from 'lodash/throttle';

export default {
    name: 'Scanner',
    data () {
        return {
            activeHighlightBox: null,
            iframeFullIndex: iframeFullIndex(),
        }
    },
    computed: {
        ...mapGetters({
            currentElement: 'lockedElement/currentElement',
            simpleElementArray: 'lockedElement/simpleElementArray',
            isLocked: 'lockedElement/isLocked',
            isActiveFrame: 'lockedElement/isActiveFrame',
        })
    },
    beforeMount () {
        this.addAllListeners();    
    },
    beforeDestroy () {
        this.removeOutline();
        this.removeAllListeners();
    },
    watch: {
        currentElement (value) {
            if ( this.isActiveFrame ) {
                this.updateOutline(value);
            }
        },
        isLocked (value) {
            if (value) {
                this.removeMouseoverListener();
                this.addResizeAndScrollListener();
                this.addAnimationClass();
                return;
            }
            this.removeAnimationClass();
            this.removeResizeAndScrollListener();
            this.addMouseoverListener();
        },
        simpleElementArray (value) {
            if (this.isActiveFrame) {
                sendMessageToAllFrames({ message: {type: MESSAGE_KEYS.targetUpdate, value, frameId: this.iframeFullIndex} })
            }
        },
        isActiveFrame (value) {
            if (!value) {
                this.removeOutline();
            }
        }
    },
    methods: {
        ...mapActions({
            setNewRoot: 'lockedElement/setNewRoot',
            toggleIsLocked: 'lockedElement/toggleIsLocked',
            setActiveFrame: 'lockedElement/setActiveFrame',
        }),
        onMouseover(e) {
		    blockerFunction(e);
            let targetElement = e.target;

            // Don't process mouseover if over tagging aid
            if (
                !isTaggingAidUi(targetElement)
                && !isIframe(targetElement)
            ) {
                this.setNewRoot(targetElement);
                this.setActiveFrame(true);
            }
        },
        onClick(e) {
            let targetElement = e.target;
            if (!e.altKey && !this.isLocked && !isTaggingAidUi(targetElement) && !isIframe(targetElement)) {
                blockerFunction(e);
                this.toggleIsLocked();
            }
        },
        updateOutline (newTarget) {
            if (!this.activeHighlightBox) {
                this.activeHighlightBox = createHighlightBox(newTarget, {classList: ['_pendota-scanner_']});
                return;
            }

            this.activeHighlightBox = setHighlightBoxToTarget(this.activeHighlightBox, newTarget);
        },
        throttledUpdateOutline: throttle(function() {
            this.updateOutline(this.currentElement);
        }, 25),
        removeOutline () {
            if (this.activeHighlightBox) {
                u(this.activeHighlightBox).remove();
            }
            this.activeHighlightBox = null;
        },
        addAnimationClass () {
            u(this.activeHighlightBox).addClass('_pendota-scanner-animated_');
        },
        removeAnimationClass () {
            u(this.activeHighlightBox).removeClass('_pendota-scanner-animated_');
        },
        addMouseoverListener () {
            window.addEventListener('mouseover', this.onMouseover, true);
        },
        addClickListener () {
            window.addEventListener('click', this.onClick, true);
        },
        addResizeAndScrollListener () {
			window.addEventListener('resize', this.throttledUpdateOutline, true);
            window.addEventListener('scroll', this.throttledUpdateOutline, true);
        },
        removeMouseoverListener () {
            window.removeEventListener('mouseover', this.onMouseover, true);
        },
        removeClickListener () {
            window.removeEventListener('click', this.onClick, true);
        },
        removeResizeAndScrollListener () {
			window.removeEventListener('resize', this.throttledUpdateOutline, true);
            window.removeEventListener('scroll', this.throttledUpdateOutline, true)
        },
        addAllListeners () {
            this.addMouseoverListener();
            this.addClickListener();
            this.addResizeAndScrollListener();
        },
        removeAllListeners () {
            this.removeMouseoverListener();
            this.removeClickListener();
            this.removeResizeAndScrollListener();
        }
    }
}
</script>
<style lang="scss">
._pendota-scanner_ {
    &, &:hover, &:visited, &:active, &::before, &::after {
        box-shadow: inset 0 0 6px #028cc2;
        outline: 2px dashed #028cc2;
    }
}

._pendota-scanner-animated_ {
    &, &:hover, &:visited, &:active, &::before, &::after {
        transition: top .3s ease, bottom .3s ease, left .3s ease, right .3s ease, height .3s ease, width .3s ease;
    }
}
</style>