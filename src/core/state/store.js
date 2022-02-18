import Vue from 'vue';
import Vuex from 'vuex';
import ui from './modules/ui.js';
import lockedElement from './modules/locked-element.js';
import sizzler from './modules/sizzler.js';
import tagBuild from './modules/tag-build.js';

import { globalValues } from '@/utils/global-values.js';

Vue.use(Vuex);

let store = globalValues.getValueByKey('vueStore');

if (!store) {
    store = new Vuex.Store({
        modules: {
            ui,
            lockedElement,
            sizzler,
            tagBuild
        },
    });
    globalValues.setValueByKey('vueStore', store);
}

export default store;
