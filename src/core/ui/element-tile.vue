<template>
    <span v-if="showTile" :title="elementValue.label" :class="['element-tile', colorClass, shownClass]" @click="emitItemAdd(elementValue)">
        {{ displayedValue }}
    </span>
</template>
<script>
import get from 'lodash/get';
import { PendoTag } from '@pendo/components';
import { executeNextTick, prettyTruncate } from '@/utils/common.js';

export default {
    name: 'ElementTile',
    components: {
        PendoTag
    },
    props: {
        disableAdd: {
            type: Boolean,
            default: false
        },
        elementType: String,
        elementValue: { 
            type: Object,
            default: () => { {} }
        },
    },
    data () {
        return {
            applyShownClass: false,
        }
    },
    mounted () {
        this.triggerAnimation();
    },
    watch: {
        elementValue () {
            this.triggerAnimation();
        },
        showTile (value) {
            if (value) {
                this.triggerAnimation();
            }
        }
    },
    computed: {
        showTile () {
            return !!get(this.elementValue, 'value.length');
        },
        tagType () {
            switch (get(this.elementValue, 'type')) {
                case 'type':
                    return 'success';
                case 'id':
                    return 'info';
                case 'class':
                    return 'warning';
                case 'attribute':
                    return 'beta';
            }
        },
        colorClass () {
            return `${get(this.elementValue, 'type')}-color`
        },
        delayClass () {
            return this.applyDelayClass ? 'delay-fade-in' : '';
        },
        shownClass () {
            return this.applyShownClass ? 'shown' : '';
        },
        displayedValue () {
            return this.elementValue.label;
        }
    },
    methods: {
        emitItemAdd (value) {
            this.$emit('addItem', value);
        },
        triggerAnimation () {
            let vm = this;
            vm.applyShownClass = false;
            setTimeout(() => { 
                vm.applyShownClass = true;
            }, 20);
        }
    }
}
</script>
<style lang="scss">

.element-tile {
    border-radius: 3px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
    box-sizing: border-box;
    cursor: pointer;
    display: inline-block;
    font-size: 12px;
    font-weight: 300;
    margin: 4px 2px;
    opacity: 0;
    overflow: hidden;
    padding: 4px;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.shown {
        transition: box-shadow .15s, transform .15s, filter .2s, opacity .3s;
        opacity: 100%;
        @for $i from 1 through 100 {
            &:nth-child(#{$i}) {
                transition-delay: 0s, 0s, 0s, #{($i - 1) * .1}s;
            }
        }
    }

    &:hover {
        box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
        transform: scale(1.04, 1.04);
    }

    &:active {
        box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
        filter: brightness(90%);
        transform: scale(1, 1);
    }
}

</style>