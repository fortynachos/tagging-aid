import Vue from 'vue';
import PopupBody from './popup-body.vue';

const app = new Vue({
    render: (h) => h(PopupBody),
}).$mount('#app');
