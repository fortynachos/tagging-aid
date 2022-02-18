<template>
    <div :class="['tag-builder--box', flashClass, flashAnimatedClass, borderClass]">
        <tag-builder-tier v-for="value in valuesArray" :key="value.tier" :value="value" :activeModal="activeModal" @openModal="setActiveModal" />
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import TagBuilderTier from './tag-builder-tier.vue';
import { tagBuildValuesAsArray } from '@/utils/tag-build.js';
import get from 'lodash/get';
import { PendoMultiselect } from '@pendo/components';
import { delay, executeNextTick } from '@/utils/common.js';

export default {
    name: 'TagBuilderBlock',
    components: {
        TagBuilderTier,
        PendoMultiselect
    },
    props: {
        values: {
            type: Object,
            required: true
        },
    },
    data () {
        return {
            displayString: '',
            value: '1',
            flashApplied: false,
            flashAnimated: false,
            activeModal: null,
        }
    },
    computed: {
        ...mapGetters({
            advancedMode: 'tagBuild/advancedMode',
        }),
        valuesArray () {
            const arr = tagBuildValuesAsArray(this.values);
            return arr;
        },
        flashClass () {
            return this.flashApplied ? 'flash' : '';
        },
        flashAnimatedClass () {
            return this.flashAnimated ? 'animate-flash' : '';
        },
        borderClass () {
            return this.advancedMode ? 'border-dance' : '';
        }
    },
    methods: {
        onDelete (value) {
            this.$emit('delete', value);
        },
        async triggerFlash () {
            this.flashApplied = true;
            await delay(0);
            this.flashAnimated = true;
            await delay(20);
            this.flashApplied = false;
            await delay(820);
            this.flashAnimated = false;
        },
        setActiveModal (value) {
            this.activeModal = value;
        },
    }
};
</script>
<style lang="scss">
@import 'src/styles/variables.scss';

.tag-builder--box {
    width: 310px;
    border: 1px solid $gray-lighter-5;
    border-radius: 3px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-content: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
    max-height: 105px;
    min-height: 105px;
    overflow-y: auto;
    position: relative;

    &.border-dance {
        border: none;
        padding: 1px;
        background: linear-gradient(90deg, $teal-primary 50%, transparent 50%), linear-gradient(90deg, $teal-primary 50%, transparent 50%), linear-gradient(0deg, $teal-primary 50%, transparent 50%), linear-gradient(0deg, $teal-primary 50%, transparent 50%);
        background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
        background-size: 15px 2px, 15px 2px, 2px 15px, 2px 15px;
        background-position: left top, right bottom, left bottom, right top;
        animation: border-dance .7s infinite linear;
    }

    @keyframes border-dance {
        0% {
            background-position: left top, right bottom, left bottom, right top;
        }
        100% {
            background-position: left 15px top, right 15px bottom , left bottom 15px , right top 15px;
        }
    }

    &:after {
        position: absolute;
        content: '';
        display: block;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: $teal-lighter-1;
        opacity: 0;
        pointer-events: none;
    }

    &.flash:after {
        opacity: 30%;
    }

    &.animate-flash:after {
        transition-delay: .1s;
        transition: opacity .7s ease;
    }
}
</style>