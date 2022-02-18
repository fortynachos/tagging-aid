<template>
    <div class="popup-body">
        <template v-if="isChromePage">
            Cannot activate tagging aid on Chrome pages.
        </template>
        <template v-else>
            <pendo-button
                id="btnTaggingAidToggle"
                class="action-button"
                theme="app"
                :label="launchTaggingAidLabel"
                @click="toggleTaggingAid"
            />
            <pendo-button
                v-if="showDesignerLaunchButton"
                id="btnDesignerToggle"
                class="action-button"
                theme="app"
                label="Launch Pendo Designer"
                @click="launchDesignerOnPage"
            />
            <div class="tutorials">
                <h5 class="tutorials-header">Tutorials</h5>
                <pendo-button
                    id="lnTutorialVideoLink"
                    class="link-button"
                    theme="app"
                    type="link"
                    label="Using this tool"
                    @click="openTutorialVideo"
                />
                <pendo-button
                    id="lnSelecterVideoLink"
                    class="link-button"
                    theme="app"
                    type="link"
                    label="Choosing a good selector"
                    @click="openSelectorVideo"
                />
            </div>
        </template>
    </div>
</template>
<script>
import { PendoButton } from '@pendo/components';
import { openLinkNewTab } from '@/utils/common.js';
import { injectContentScript } from '@/utils/browser-interfaces/scripting.js';
import { MESSAGE_KEYS, sendTabMessage } from '@/utils/browser-interfaces/messaging.js';
import '@pendo/components/lib/pendo-components.min.css';
import get from 'lodash/get';

export default {
    name: 'PopupBody',
    components: {
        PendoButton,
    },
    data() {
        return {
            activeTab: {},
            tabState: {
                designerEnabled: false,
                pendoExists: false,
                vueContentLoaded: false,
                taggingAidActive: false,
            }
        };
    },
    async created() {
        let tabQuery = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        chrome.runtime.onMessage.addListener(this.handleContentScriptMessage);

        this.activeTab = tabQuery[0];
        if (!this.isChromePage) {
            injectContentScript('/content-scripts/preload-checks.js', this.activeTabId, false);
        }

        await this.checkVueContentLoaded();
        await this.checkTaggingAidActive();
    },
    computed: {
        activeTabUrl () {
            return get(this.activeTab, 'url', '');
        },
        activeTabId () {
            return get(this.activeTab, 'id', null);
        },
        isChromePage() {
            return (
                this.activeTabUrl.startsWith('chrome://') ||
                this.activeTabUrl.startsWith('https://chrome.google.com/')
            );
        },
        launchTaggingAidLabel () {
            return `${this.tabState.taggingAidActive ? 'Close' : 'Launch'} Tagging Aid`;
        },
        showDesignerLaunchButton() {
            return this.tabState.pendoExists && !this.tabState.designerEnabled;
        }
    },
    methods: {
        openTutorialVideo () {
            openLinkNewTab('https://bit.ly/pendota-tutorial');
        },
        openSelectorVideo () {
            openLinkNewTab('https://bit.ly/pendota-good-selectors');
        },
        launchDesignerOnPage () {
            injectContentScript('/content-scripts/launch-designer.js', this.activeTabId, false);
            this.closeWithDelay();
        },
        async checkVueContentLoaded () {
            let vueloadStatus = await sendTabMessage(
                this.activeTabId, 
                { messageType: MESSAGE_KEYS.vueload }
            );

            this.tabState.vueContentLoaded = get(vueloadStatus, 'vueContentLoaded', false);
        },
        async checkTaggingAidActive () {
            let taggingAidStatus = await sendTabMessage(
                this.activeTabId, 
                { messageType: MESSAGE_KEYS.taggingAidCheck }
            );

            this.tabState.taggingAidActive = get(taggingAidStatus, 'taggingAidActive', false);
        },
        async loadVueContent () {
            await sendTabMessage (
                this.activeTabId,
                { messageType: MESSAGE_KEYS.loadVueContent }
            )
            await injectContentScript('/content-scripts/core-main.js', this.activeTabId, true);
            this.checkVueContentLoaded();
            this.closeWithDelay();
        },
        async toggleTaggingAid () {
            if (!this.tabState.vueContentLoaded) {
                this.tabState.taggingAidActive = true;
                return await this.loadVueContent();
            }

            let taggingAidStatus = await sendTabMessage(
                this.activeTabId, 
                { messageType: MESSAGE_KEYS.taggingAidToggle, value: !this.tabState.taggingAidActive }
            );

            this.tabState.taggingAidActive = get(taggingAidStatus, 'taggingAidActive', false);
            this.closeWithDelay();
        },
        handleContentScriptMessage (message, sender) {
            const messageType = get(message, 'messageType', '');
            if (messageType === MESSAGE_KEYS.preload) {
                this.tabState.pendoExists = get(message, 'pendoExists', false);
                this.tabState.designerEnabled = get(message, 'designerEnabled', false);
            }
        },
        closeWithDelay () {
            setTimeout(window.close, 50);
        }
    }
};
</script>
<style lang="scss">
@import 'src/styles/variables.scss';

.popup-body {
    padding: 4px 12px;
    min-width: 200px;
    font-size: 14px;

    .action-button {
        display: block;
        margin: 16px auto;
        width: 220px;
    }

    .link-button {
        display: block;
        margin: 0;
        margin-left: 2px;
    }

    .tutorials {
        border: 1px solid $gray-lighter-5;
        border-radius: 3px;
        margin-bottom: 12px;
        padding: 1px 8px;
    }

    .tutorials-header {
        color: $gray-lighter-3;
        margin: 2px 0;
    }
}
</style>
