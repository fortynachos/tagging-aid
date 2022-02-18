<template>
    <pendo-modal
        :class="['advanced-modal', animateClass, activeClass]"
        :visible="true"
        title="Configure"
        :show-backdrop="false"
        :pivot-y="0"
        height="260px"
        :show-close="true"
        :esc-to-close="true"
        @close="submitModal"
    >
        <template slot="body">
            <pendo-multiselect
                v-model="dropdownValue"
                :options="modalDropdownOptions"
                :allow-empty="false"
                :preselect-first="true"
                :full-width="true"
            />
            <div class="previewBlock">
                <pendo-editable-content
                    v-if="showEditablePreview"
                    v-model="previewValue"
                    exit-event="blur"
                    class="displayPreview"
                    @confirm="confirmModEdit"
                >
                    <template
                        slot="append"
                        slot-scope="{ pending, confirm, cancel }"
                    >
                        <pendo-button
                            theme="via"
                            icon="check"
                            :loading="pending"
                            type="primary"
                            @click="confirm"
                        />
                    </template>
                </pendo-editable-content>
                <span
                    v-if="false"
                    class="nonEditDisplayPreview"
                >
                    {{ modifiedItemValue.label }}
                </span>
            </div>
            <div id="tilePreview">
                <div class="tilePreviewLabel">Preview:</div>
                <tag-builder-item
                    v-if="itemValue.type"
                    :tier="tier"
                    category="type"
                    :item="modifiedItemValue"
                    :preview-mode="true"
                />
            </div>
        </template>
    </pendo-modal>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import { moveElementToAppendedToBody } from '@/utils/float-manager.js';
import { tagItemDefaultLabel, computeLabel } from '@/utils/tag-build.js';
import {
    PendoModal,
    PendoMultiselect,
    PendoEditableContent,
    PendoButton,
} from '@pendo/components';
import startCase from 'lodash/startCase';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { delay, executeNextTick } from '@/utils/common.js';
import u from 'umbrellajs';

export default {
    name: 'TagBuilderAdvancedModal',
    components: {
        PendoModal,
        PendoMultiselect,
        PendoEditableContent,
        PendoButton,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        itemValue: {
            type: Object,
            required: true,
        },
        tier: {
            type: Number,
            required: true,
        },
    },
    beforeCreate () {
        this.$options.components.TagBuilderItem = require('./tag-builder-item.vue').default;
    },
    data() {
        return {
            modalActive: false,
            animateModal: false,
            showModal: false,
            modalType: '',
            modalValue: '',
            dropdownValue: null,
            previewValue: '',
            modifiedItemValue: { ...this.itemValue },
            originalItemValue: { ...this.itemValue },
        };
    },
    computed: {
        animateClass() {
            return this.animateModal ? 'animate-slide' : '';
        },
        activeClass() {
            return this.modalActive ? 'active' : '';
        },
        modalDropdownOptions() {
            let options = [];
            options.push('default');
            if (this.itemValue.type === 'attribute') {
                options.push('attribute exists');
            }
            if (['id', 'attribute'].includes(this.itemValue.type)) {
                options.push('begins with');
                options.push('ends with');
            }
            if (
                ['id', 'class', 'attribute', 'contains'].includes(
                    this.itemValue.type
                )
            ) {
                options.push('contains');
            }
            options.push('custom');
            return options.map((value) => {
                return { id: value, label: startCase(value) };
            });
        },
        showEditablePreview() {
            return !['default', 'delete', 'attribute exists'].includes(
                get(this.dropdownValue, 'id')
            );
        },
        showNonEditablePreview() {
            return ['default', 'attribute exists'].includes(
                get(this.dropdownValue, 'id')
            );
        },
    },
    watch: {
        visible(value) {
            if (value) {
                this.activateModal();
                return;
            }
            this.deactivateModal();
        },
        dropdownValue(value) {
            this.updateModifiedItem();
        },
    },
    methods: {
        ...mapActions({
            setTierValue: 'tagBuild/setTierValue',
        }),
        startCase,
        emitClose() {
            this.$emit('close');
        },
        async activateModal(modalType) {
            this.animateModal = true;
            await delay(0);
            this.modalActive = true;
            this.originalItemValue = { ...this.itemValue };
        },
        async deactivateModal() {
            this.modalActive = false;
            await delay(200);
            this.animateModal = false;
        },
        cancelModal() {
            this.setTierValue({
                tier: this.tier,
                value: this.originalItemValue,
            });
            this.emitClose();
        },
        submitModal() {
            this.modifiedItemValue.label = computeLabel(this.modifiedItemValue);
            this.setTierValue({
                tier: this.tier,
                value: this.modifiedItemValue,
            });
            this.emitClose();
        },
        updateModifiedItem() {
            const item = this.modifiedItemValue;
            const modifier = this.getModifier();
            if (isEmpty(modifier)) item.modifier = modifier;
            const selectedMod = this.dropdownValue.id;
            modifier.modType = selectedMod;
            switch (selectedMod) {
                case 'default':
                    delete item.modifier;
                    break;
                case 'exists':
                    modifier.modValue = get(item, 'subType', item.type);
                    break;
                case 'custom':
                    modifier.modValue = tagItemDefaultLabel(
                        item.type,
                        item.value,
                        get(item, 'subType', '')
                    );
                    break;
                default:
                    modifier.modValue = item.value;
                    break;
            }
            item.label = computeLabel(item);
            this.previewValue = get(item, 'modifier.modValue', 'N/A');
            this.setTierValue({
                tier: this.tier,
                value: this.modifiedItemValue,
            });
        },
        confirmModEdit() {
            const modifier = this.getModifier();
            modifier.modValue = this.previewValue;
            this.modifiedItemValue.label = computeLabel(this.modifiedItemValue);
            this.setTierValue({
                tier: this.tier,
                value: this.modifiedItemValue,
            });
        },
        cancelModEdit() {
            const modifier = this.getModifier();
            this.previewValue = get(modifier, 'modValue', this.item.value);
        },
        getModifier() {
            const modifier = get(this.modifiedItemValue, 'modifier', {});
            if (isEmpty(modifier)) this.modifiedItemValue.modifier = modifier;
            return modifier;
        },
    },
};
</script>
<style lang="scss">
@import 'src/styles/variables.scss';

.advanced-modal {
    top: calc(520px - 250px);
    transform: translateY(100%);

    & .el-dialog__body {
        padding-top: 4px;
        padding-bottom: 4px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
    }

    & .previewBlock {
        height: 36px;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    & .displayPreview {
        display: flex;
        flex-direction: row;
        justify-content: center;

        & .pendo-editable-content__form {
            width: calc(100% - 4px);
        }

        & .pendo-editable-content__text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    & .nonEditDisplayPreview {
        font-size: 14px;
        font-weight: 600;
        line-height: 36px;
        padding: 0 2px;
        text-align: left;
        white-space: nowrap;
        width: 100%;
    }

    &.active {
        transform: translateY(58px);
    }

    &.animate-slide {
        transition: transform 0.3s ease-in-out;
    }
}

#tilePreview {
    border-top: 1px dashed $gray-lighter-5;
    padding-top: 4px;

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
}

.tilePreviewLabel {
    display: flex;
    flex-direction: column;
    justify-content: center;

    font-weight: 600;
    padding-right: 8px;
}
</style>
