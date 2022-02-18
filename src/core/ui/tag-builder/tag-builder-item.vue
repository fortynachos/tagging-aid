<template>
    <span 
    :class="['tag-builder-item', colorClass, shownClass, activeClass, previewModeClass]" 
        @mouseover="hover = true"
        @mouseleave="hover = false">
        <span
            :class="['tag-builder-item-text', previewModeClass]"
            :title="get(item, 'label')" >
            {{ displayedValue }}
            <div v-if="!previewMode" :class="['action-buttons', actionButtonsShownClass]">
                <pendo-icon class="action-button" type="settings" size="12" @click="toggleAdvancedModal"/>
                <pendo-icon class="action-button" type="x" size="12" @click="deleteWithAnimation" />
            </div>
        </span>
        <tag-builder-advanced-modal v-if="!previewMode" :visible="advancedModalActive" :itemValue="item" :tier="tier" @close="closeAdvancedModal" />

    </span>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import { PendoIcon } from '@pendo/components';
import get from 'lodash/get';
import TagBuilderAdvancedModal from './tag-builder-advanced-modal.vue';
import { prettyTruncate } from '@/utils/common.js';

export default {
    name: 'TagBuilderItem',
    components: {
        PendoIcon,
        TagBuilderAdvancedModal,
    },
    props: {
        item: {
            type: Object,
            required: true,
        },
        tier: {
            type: Number,
            required: true,
        },
        activeModal: {
            type: Object,
            default: () => {return {}}
        },
        previewMode: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            advancedModalActive: false,
            colorClass: `${get(this.item, 'type')}-color`,
            isShown: false,
            hover: false,
        };
    },
    mounted() {
        let vm = this;
        setTimeout(() => {
            vm.isShown = true;
        }, 0);
    },
    watch: {
        activeModal (value) {
            if (
                value.tier !== this.tier ||
                value.item.type !== this.item.type ||
                value.item.subType !== this.item.subType ||
                value.item.value !== this.item.value
            ) {
                this.closeAdvancedModal();
            }
        }
    },
    computed: {
        ...mapGetters({
            advancedMode: 'tagBuild/advancedMode',
        }),
        shownClass() {
            return this.isShown ? 'shown' : '';
        },
        displayedValue() {
            return this.item.label;
        },
        activeClass() {
            return this.advancedModalActive ? 'active' : '';
        },
        actionButtonsShownClass() {
            return this.hover ? 'shown' : '';
        },
        previewModeClass() {
            return this.previewMode ? 'preview-mode' : '';
        }
    },
    methods: {
        ...mapActions({
            deleteTierValue: 'tagBuild/deleteTierValue',
        }),
        get,
        clickAction() {
            this.deleteWithAnimation();
        },
        deleteWithAnimation() {
            this.isShown = false;
            setTimeout(() => {
                this.deleteTierValue({ tier: this.tier, value: this.item });
            }, 250);
        },
        toggleAdvancedModal() {
            this.advancedModalActive = !this.advancedModalActive;
            if (this.advancedModalActive) {
                this.$emit('openModal', { tier: this.tier, item: this.item });
            }
        },
        closeAdvancedModal() {
            this.advancedModalActive = false;
        },
    },
};
</script>
<style lang="scss">
@import 'src/styles/variables.scss';

.tag-builder-item {
    border-radius: 3px;
    display: inline-block;
    margin: 2px;
    padding: 2px;
    max-width: 0;
    min-width: 0;
    opacity: 0;
    overflow: hidden;
    padding: 0 2px;
    position: relative;
    text-overflow: ellipsis;
    transition: color 0.3s, max-width 0.3s, min-width .3s, opacity 0.3s;
    vertical-align: text-bottom;
    white-space: nowrap;

    .tag-builder-item-text {
        display: inline-block;
        font-size: 12px;
        font-weight: 300;
        max-width: calc(100% - 4px);
        padding: 2px 4px 0;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    &.shown {
        max-width: calc(100% - 8px);
        opacity: 100%;
    }

    &:hover:not(.preview-mode) {
        min-width: 44px;
        & .tag-builder-item-text:not(.preview-mode) {
            max-width: calc(100% - 36px);
            min-width: 0;
        }
    }

    & .action-buttons {
        background-color: inherit;
        opacity: 0;
        position: absolute;
        right: 0;
        top: 4px;
        transition: opacity .3s;

        &.shown {
            &:hover {
                cursor: pointer;
            }
            opacity: 1;
        }
    }

    & .action-button {
        display: inline-block;
        margin-left: 0;
    }
}
</style>
