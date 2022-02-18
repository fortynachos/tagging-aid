<template>
    <span class="tag-builder-tier">
        <tag-builder-item
            v-if="tagType"
            :tier="value.tier"
            category="type"
            :item="tagType"
            @openModal="emitOpenModal"
            :activeModal="activeModal"
        /><tag-builder-item
            v-if="tagId"
            :tier="value.tier"
            category="id"
            :item="tagId"
            @openModal="emitOpenModal"
            :activeModal="activeModal"
        /><tag-builder-item
            v-for="classItem in tagClasses"
            :tier="value.tier"
            :key="classItem.value"
            category="class"
            :item="classItem"
            @openModal="emitOpenModal"
            :activeModal="activeModal"
        /><tag-builder-item
            v-for="attribute in tagAttributes"
            :tier="value.tier"
            :key="attribute.subType"
            category="attribute"
            :item="attribute"
            @openModal="emitOpenModal"
            :activeModal="activeModal"
        /><tag-builder-item
            v-if="tagContains"
            :tier="value.tier"
            category="contains"
            :item="tagContains"
            @openModal="emitOpenModal"
            :activeModal="activeModal"
        />
    </span>
</template>
<script>
import TagBuilderItem from './tag-builder-item.vue';
import get from 'lodash/get';
import u from 'umbrellajs';

export default {
    name: 'TagBuilderTier',
    components: {
        TagBuilderItem,
    },
    props: {
        value: {
            type: Object,
            required: true,
        },
        activeModal: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            isWrapped: false,
        };
    },
    computed: {
        tagType() {
            return this.value.type;
        },
        tagId() {
            return this.value.id;
        },
        tagClasses() {
            return this.value.classes;
        },
        tagAttributes() {
            return this.value.attributes;
        },
        tagContains() {
            return this.value.contains;
        }
    },
    methods: {
        onDelete(item) {
            this.$emit('delete', { tier: this.value.tier, value: item });
        },
        emitOpenModal(event) {
            this.$emit('openModal', event);
        },
    },
};
</script>
<style lang="scss">
@import 'src/styles/variables.scss';

.tag-builder-tier {
    background-color: rgba($gray-lighter-7, 1);
    border-radius: 3px;
    color: black;
    display: inline-block;
    font-size: 12px;
    height: fit-content;
    margin: 2px;
    padding: 4px;
    max-width: 92%;
    text-overflow: ellipsis;
}

.wrapped {
    width: min-content;
}
</style>
