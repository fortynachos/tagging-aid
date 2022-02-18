<template>
    <div id="_pendota-ui-body_">
        <div class="lock-bar">
            <div class="lock-bar-vert">
                <pendo-button
                    class="target-button"
                    :class="!isLocked ? 'no-element' : ''"
                    @click="onRetargetClick"
                    :label="targetButtonLabel"
                    theme="p2-dark"
                    :type="targetButtonType"
                    size="medium"
                    :prefixIcon="targetButtonIcon"
                    iconSize="18"
                />
                <pendo-button
                    class="traverse-button"
                    title="Select parent element"
                    :disabled="disableTraverseUp"
                    theme="p2-light"
                    type="secondary"
                    size="medium"
                    icon="arrow-up"
                    iconSize="18"
                    @click="onTraverseUpClick"
                />
                <pendo-button
                    class="traverse-button"
                    title="Select child element"
                    :disabled="disableTraverseDown"
                    theme="p2-light"
                    type="secondary"
                    size="medium"
                    icon="arrow-down"
                    iconSize="18"
                    @click="onTraverseDownClick"
                />
            </div>
        </div>
        <hr class="spacer" />
        <div class="element-tiles-label">Select elements you'd like to include in your rule:</div>
        <div class="element-tiles-wrapper">
            <div class="element-tiles">
                <element-tile v-for="elementType in displayElement.type"
                    :disableAdd="!isLocked"
                    element-type="Type"
                    :element-value="elementType"
                    @addItem="onAddItem" />
                <element-tile v-for="elementId in displayElement.id"
                    :disableAdd="!isLocked"
                    element-type="ID"
                    :element-value="elementId"
                    @addItem="onAddItem" />
                <element-tile v-for="elementClass in displayElement.classes"
                    :disableAdd="!isLocked"
                    element-type="Classes"
                    :element-value="elementClass"
                    @addItem="onAddItem" />
                <element-tile v-for="elementAttribute in displayElement.attributes"
                    :disableAdd="!isLocked"
                    element-type="Custom Attributes"
                    :element-value="elementAttribute"
                    @addItem="onAddItem" />
                <element-tile v-for="elementTextContent in displayElement.textContent"
                    :disableAdd="!isLocked"
                    element-type="Contains"
                    :element-value="elementTextContent"
                    @addItem="onAddItem" />
            </div>
        </div>
        <div class="tag-builder-wrapper">
            <hr class="spacer" />
            <div class="tag-builder-label">Selection:
            <pendo-button
                    id="tag-builder-copy-button"
                    title="Copy to clipboard"
                    theme="app"
                    type="link"
                    size="mini"
                    prefix-icon="clipboard"
                    label="Copy"
                    @click="onTagBuildCopy"
                />
            </div>
            <div class="tag-builder" title="Tag builder">
                <tag-builder-block :values="tagBuild" ref="tagBuilderBlock"/>
            </div>
            <div class="tag-tester-buttons">
                <pendo-button
                    id="test-tag-button"
                    :label="testButtonLabel"
                    theme="app"
                    type="link"
                    size="mini"
                    @click="onTestClick"
                />
                <span
                    v-if="testingActive"
                    id="sizzleCounter"
                    :label="numSizzleMatches" 
                >{{numSizzleMatches}}</span>
            </div>
        </div>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import {
    PendoButton,
    PendoIcon,
    PendoTag,
    PendoMultiselect,
} from '@pendo/components';
import {
    MESSAGE_KEYS,
    sendMessageToAllFrames,
} from '@/utils/browser-interfaces/messaging.js';
import { iframeFullIndex } from '@/utils/iframes.js';
import ElementTile from '@/core/ui/element-tile.vue';
import TagBuilderBlock from '@/core/ui/tag-builder/tag-builder-block.vue';
import get from 'lodash/get';
import set from 'lodash/set';
import { tagBuildString, tagItemDefaultLabel, tagItemIsEmpty } from '@/utils/tag-build.js';
import { ifStringTryParseJson } from '@/utils/common.js';


export default {
    name: 'UiBody',
    components: {
        ElementTile,
        PendoButton,
        PendoIcon,
        PendoTag,
        PendoMultiselect,
        TagBuilderBlock,
    },
    data() {
        return {
            iframeFullIndex: iframeFullIndex(),
            selectedCustomAttribute: '',
            testingActive: false,
            sizzleUpdateId: '',
            sizzleMatchCounters: {},
        };
    },
    computed: {
        ...mapGetters({
            currentSimpleElement: 'lockedElement/currentSimpleElement',
            isLocked: 'lockedElement/isLocked',
            currentSimpleElementIsRootHtml:
                'lockedElement/currentSimpleElementIsRootHtml',
            numSimpleElements: 'lockedElement/numSimpleElements',
            tagBuild: 'tagBuild/tagBuild',
            advancedMode: 'tagBuild/advancedMode',
        }),
        currentTierIndex () {
            return this.numSimpleElements;
        },
        targetButtonLabel() {
            if (this.isLocked) {
                return 'Select New Element';
            }
            return 'No Element Selected';
        },
        targetButtonIcon() {
            if (this.isLocked) {
                return 'crosshair';
            }
            return null;
        },
        targetButtonType() {
            if (this.isLocked) {
                return 'primary';
            }
            return 'secondary';
        },
        disableTraverseUp() {
            return !this.isLocked || this.currentSimpleElementIsRootHtml;
        },
        disableTraverseDown() {
            return !this.isLocked || this.numSimpleElements <= 1;
        },
        testButtonLabel() {
            return this.testingActive ? 'Stop Testing' : 'Test Rule';
        },
        advancedModeButtonType () {
            return this.advancedMode ? 'primary' : 'secondary';
        },
        numSizzleMatches() {
            let numMatches = 0;
            Object.values(this.sizzleMatchCounters).forEach(counter => {
                numMatches += counter;
            });
            return this.testingActive ? `${numMatches.toString()} Match${numMatches !== 1 ? 'es' : ''} Found` : '--';
        },
        displayElement() {
            let attributes = {};
            let srcAttributes = get(
                this.currentSimpleElement,
                'attributes',
                {}
            );
            return {
                id: [get(this.currentSimpleElement, 'id', ' ')]
                .map((value) => {
                        return { label: tagItemDefaultLabel('id', value), type: 'id', value };
                    }
                ),
                type: [get(this.currentSimpleElement, 'nodeName', 'N/A')]
                .map((value) => {
                        return { label: tagItemDefaultLabel('type', value), type: 'type', value };
                    }
                ),
                classes: get(this.currentSimpleElement, 'classes', [])
                .sort((a, b) => {
                    return a.length - b.length;
                })
                .map((value) => {
                        return { label: tagItemDefaultLabel('class', value), type: 'class', subType: value, value };
                    }
                ),
                attributes: Object.keys(srcAttributes)
                .sort((a, b) => {
                    return a.length - b.length;
                })
                .map( (key) => {
                        return { label: tagItemDefaultLabel('attribute', srcAttributes[key], key), type: 'attribute', subType: key, value: srcAttributes[key]};
                    }
                ),
                textContent: [get(this.currentSimpleElement, 'textContent', 'N/A')]
                .map((value) => {
                        return { label: tagItemDefaultLabel('contains', value), type: 'contains', value };
                    }
                ),
            };
        },
        testingActiveClass () {
            return this.testingActive ? 'testing-active' : '';
        },
        advModeActiveClass () {
            return this.advancedMode ? 'advanced-mode-active' : '';
        }
    },
    watch: {
        isLocked(value) {
            if (!value) {
                this.resetTagBuild();
            }
        },
        testingActive(value) {
            this.resetSizzleCounter();
            sendMessageToAllFrames({ message: {type: MESSAGE_KEYS.sizzleActiveUpdate, value, updateId: this.sizzleUpdateId} })
        },
        tagBuild(value) {
            this.resetSizzleCounter();
            sendMessageToAllFrames({ message: {type: MESSAGE_KEYS.sizzleValueUpdate, value: tagBuildString(value), updateId: this.sizzleUpdateId} })
        }
    },
    methods: {
        ...mapActions({
            toggleIsLocked: 'lockedElement/toggleIsLocked',
            setTierValue: 'tagBuild/setTierValue',
            deleteTierValue: 'tagBuild/deleteTierValue',
            resetTagBuild: 'tagBuild/resetTagBuild',
            setAdvancedMode: 'tagBuild/setAdvancedMode',
        }),
        onRetargetClick() {
            if (this.isLocked) {
                this.toggleIsLocked({ frameId: this.iframeFullIndex });
            }
        },
        signalTraverse(direction) {
            sendMessageToAllFrames({
                message: { type: MESSAGE_KEYS.traverse, direction },
            });
        },
        onTraverseUpClick() {
            if (this.isLocked) {
                this.signalTraverse('up');
            }
        },
        onTraverseDownClick() {
            if (this.isLocked) {
                this.signalTraverse('down');
            }
        },
        onTestClick() {
            this.testingActive = !this.testingActive;
        },
        onTagBuildCopy() {
            navigator.clipboard.writeText(tagBuildString(this.tagBuild));
            this.$refs.tagBuilderBlock.triggerFlash();
        },
        onAddItem(value) {
            if (get(value, 'value.length', 0) === 0) return;
            this.setTierValue({tier: this.currentTierIndex, value});
        },
        onDeleteTagItem (item) {
            this.deleteTierValue({ tier: item.tier, value: item.value });
        },
        resetSizzleCounter () {
            this.sizzleUpdateId = Math.floor(Math.random() * 10000000).toString().padStart(8, '0');
            this.sizzleMatchCounters = {};
        },
        toggleAdvancedMode () {
            this.setAdvancedMode(!this.advancedMode);
        },
        updateFromMessage (event) {
            let messageData = ifStringTryParseJson(event.data);
            switch(messageData.type) {
                case MESSAGE_KEYS.sizzleCountResponse:
                    if (messageData.updateId === this.sizzleUpdateId) {
                        this.$set(this.sizzleMatchCounters, messageData.frameId, messageData.value)
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
@import 'src/styles/fonts.scss';

#_pendota-ui-body_ {
    color: $font-gray;
    display: flex;
    flex-direction: column;
    font-family: 'proxima-nova', 'Open Sans', 'Helvetica Neue Light', 'Helvetica Neue', 'Helvetica', 'Arial',
    sans-serif;
    font-weight: 300;
    height: calc(100vh - 72px);
}

.target-button {
    font-weight: 400;
    vertical-align: top;
    width: 175px;

    &.no-element {
        cursor: auto !important;
        &:hover {
            background-color: $gray-lighter-2;
        }
    }
}

.spacer {
    border: none;
    border-top: 1px dashed $gray-lighter-5;
    flex-grow: 0;
    flex-shrink: 0;
    margin: 0 12px;
}

.lock-bar {
    display: flex;
    justify-content: center;
    flex-grow: 0;
    flex-shrink: 0;
}

.lock-bar-vert {
    margin: 16px auto;
}

.tag-builder-wrapper {
    position: fixed;
    bottom: 0;
    width: 100%;
}

.tag-builder {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;

    &--buttons {
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin-bottom: 16px;
        
        & > * {
            margin-left: 8px;
        }
    }
}

.tag-builder-label {
    font-size: 14px;
    font-weight: 500;
    margin: 12px 22px 8px;
}

#test-tag-button {
    font-weight: 500;
    margin: 8px 0 12px 24px;
    padding-right: 8px;
}

#sizzleCounter {
    border-left: 1px solid $gray-lighter-5;
    font-size: 14px;
    padding-left: 10px;
}

#tag-builder-copy-button {
    float: right;
    font-weight: 500;
    max-height: 17px;
}

.tag-builder-toolbar-button {
    min-width: unset !important;
    width: 42px;

    &.advanced-mode-active {
        box-shadow: 0 0 0 0 rgba($teal-primary, 1);
        animation: advanced-mode-pulse 2s infinite;
    }
}

@keyframes advanced-mode-pulse {
	0% {
		box-shadow: 0 0 0 0 rgba($teal-primary, 0.7);
	}

	70% {
		box-shadow: 0 0 0 10px rgba($teal-primary, 0);
	}

	100% {
		box-shadow: 0 0 0 0 rgba($teal-primary, 0);
	}
}

.element-tiles-label {
    font-size: 12px;
    margin: 12px 20px 4px;
}

.element-tiles-wrapper {
    max-height: 140px;
    overflow-y: auto;
}

.element-tiles {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin: 0 20px 32px;
    overflow: visible;
}

.tiles-empty-state {
    display: flex;
    flex-direction: row;
    justify-content: center;

    & > div {
        display: flex;
        flex-direction: column;
        height: 180px;
        justify-content: center;
        & > span {
            font-size: 14px;
            text-align: center;
            width: 200px;
        }
    }
}

.attributeSelector {
    display: flex;
    justify-content: start;
    padding: 6px 4px;

    & .pendo-multiselect__selected {
        font-size: 14px !important;
    }
}

.type-color {
    background-color: $tile-green;
    border: 1px solid $tile-green-border;
    color: $font-gray;
}

.id-color {
    background-color: $tile-light-blue;
    border: 1px solid $tile-light-blue-border;
    color: $font-gray;
}

.class-color {
    background-color: $tile-purple;
    border: 1px solid $tile-purple-border;
    color: $font-gray;
}

.attribute-color {
    background-color: $tile-yellow;
    border: 1px solid $tile-yellow-border;
    color: $font-gray;
}

.contains-color {
    background-color: $tile-blue;
    border: 1px solid $tile-blue-border;
    color: $font-gray;
}
</style>
