import Vue from 'vue';
import CoreMain from '@/core/base/core-main.vue';
import store from '@/core/state/store.js';
import interact from 'interactjs';

const app = new Vue({
    store,
    render: (h) => h(CoreMain),
}).$mount();

let dragObj = interact('._pendota-draggable_').draggable({
    ignoreFrom: '[no-drag]',
});

let position = { x: 0, y: 0 };

dragObj.on(
    'dragmove',
    function(event) {
        position.x += event.dx;
        position.y += event.dy;

        event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
    },
    true
);
