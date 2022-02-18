<template>
    <div :id="taggingAidUiId" class="_pendota-draggable_" :style="inlineStyles">
        <div id="_pendota-drag-bar_" :style="dragbarInlineStyles">
            <div id="_pendota-drag-dots_" :style="dragdotsInlineStyles">
                <pendo-icon type="more-horizontal" />
            </div>
        </div>
        <div
            id="_pendota-close-button_"
            no-drag
            @click="emitClose"
            :style="closeButtonInlineStyles"
        >
            &times;
        </div>
        <iframe
            no-drag
            :src="iframeSrc"
            :style="iframeInlineStyles"
            :frameBorder="0"
            :allow="`clipboard-write self ${iframeSrc}`"
        />
    </div>
</template>
<script>
import { PendoIcon } from '@pendo/components';
import { moveElementToAppendedToBody } from '@/utils/float-manager.js';
import { getFileURL } from '@/utils/browser-interfaces/file-management.js';
import { TAGGING_AID_UI_ID } from '@/utils/common.js';
import u from 'umbrellajs';

export default {
    name: 'UiFrame',
    components: {
        PendoIcon,
    },
    data() {
        return {
            taggingAidUiId: TAGGING_AID_UI_ID,
            iframeSrc: getFileURL('/public/tagging-aid-ui.html'),
            dragbarHeight: '72px',
        };
    },
    computed: {
        inlineStyles() {
            let rawStyles = {
                height: '520px',
                width: '352px',
                background: 'white',
                border: '1px solid rgba(0,0,0,0.2)',
                'border-radius': '3px',
                position: 'fixed',
                top: '35px',
                right: '35px',
                'z-index': '9999999999',
                'box-sizing': 'border-box',
                'box-shadow': '0 2px 6px rgba(0, 0, 0, 0.17)',
                padding: '0',
                margin: '0',
            };

            return this.reducedStyles(rawStyles);
        },
        iframeInlineStyles() {
            let rawStyles = {
                position: 'absolute',
                top: '0',
                left: '0',
                height: '100%',
                width: '100%',
                'z-index': 0,
            };

            return this.reducedStyles(rawStyles);
        },
        dragbarInlineStyles() {
            let rawStyles = {
                'background-color': 'transparent',
                color: '#babcc5',
                'box-sizing': 'border-box',
                height: this.dragbarHeight,
                width: 'calc(100% - 80px)',
                position: 'absolute',
                top: '0',
                'touch-action': 'none',
                left: '40px',
                'z-index': 1,
            };

            return this.reducedStyles(rawStyles);
        },
        dragdotsInlineStyles() {
            let rawStyles = {
                margin: '0 auto',
                width: 'fit-content',
            };

            return this.reducedStyles(rawStyles);
        },
        closeButtonInlineStyles() {
            let rawStyles = {
                color: '#babcc5',
                cursor: 'pointer',
                'font-size': '20px',
                position: 'absolute',
                top: '4px',
                right: '6px',
                'line-height': '1',
                'z-index': '1',
            };

            return this.reducedStyles(rawStyles);
        },
    },
    mounted() {
        moveElementToAppendedToBody(this.$el);
    },
    destroyed() {
        u(this.$el).remove();
    },
    methods: {
        reducedStyles(styles) {
            return Object.entries(styles).reduce(
                (accumulator, [key, value]) => {
                    return (accumulator += `${key}:${value};`);
                },
                ''
            );
        },
        emitClose() {
            this.$emit('close', true);
        },
    },
};
</script>
<style lang="scss" scoped>
@import 'src/styles/variables.scss';

#_pendota-drag-bar_:hover {
    touch-action: none;
    color: $gray-lighter-2 !important;
}

#_pendota-close-button_:hover {
    color: $gray-lighter-2 !important;
}
</style>
