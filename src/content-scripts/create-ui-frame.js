import UiFrame from '@/core/ui/ui-frame.vue';
import Vue from 'vue';
import store from '@/core/state/store.js';

const app = new Vue({
    store,
    render: (h) => h(UiFrame),
}).$mount();
