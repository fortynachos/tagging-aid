import Vue from 'vue';
import UiMain from '@/core/base/core-main.vue';
import store from '@/core/state/store.js';

const app = new Vue({
    store,
    render: (h) => h(UiMain),
}).$mount('#app');
