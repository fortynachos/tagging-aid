import Vue from 'vue';

export const GLOBAL_KEYS = {
    mainObject: 'pendota',
    initialized: 'initialized',
    vueContentLoaded: 'vueContentLoaded',
    taggingAidActive: 'taggingAidActive',
    vueStore: 'vueStore',
};

export class WindowGlobalValues {
    constructor() {
        if (typeof window.pendota === 'undefined') {
            // a few global vars are stored in this object to track the tab state when the popup closes
            window.pendota = {};
            window.pendota[GLOBAL_KEYS.initialized] = false;
            window.pendota[GLOBAL_KEYS.vueContentLoaded] = false;
            window.pendota[GLOBAL_KEYS.taggingAidActive] = false;
        }
    }

    _setValue(name, value) {
        Vue.set(window.pendota, name, value);
    }

    _getValue(name) {
        return window.pendota[name];
    }

    setValueByKey(key, value) {
        this._setValue(GLOBAL_KEYS[key], value);
    }

    getValueByKey(key) {
        return this._getValue(GLOBAL_KEYS[key]);
    }
}

export const globalValues = new WindowGlobalValues();
