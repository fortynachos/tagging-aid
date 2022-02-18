import get from 'lodash/get';
import set from 'lodash/set';
import { tagItemIsEmpty } from '@/utils/tag-build.js';


export const state = getInitialState();

export function getInitialState() {
    return {
        tagBuild: { maxTier: 0 },
        advancedMode: false
    };
}

export const mutations = {
    setFullBuild(state, { tagBuild }) {
        state.tagBuild = { ...tagBuild };
    },
    resetBuild(state,) {
        state.tagBuild = { maxTier: 0 };
    },
    setAdvancedMode(state, { value }) {
        state.advancedMode = value;
    }
};

export const actions = {
    setTierValue({ state, commit }, { tier, value }) {
        const tagBuild = { ...state.tagBuild };
        if (!tagBuild.hasOwnProperty(tier)) {
            tagBuild[tier] = {}
            tagBuild.maxTier = Math.max(tagBuild.maxTier, tier);
        }

        const tagBuildTier = tagBuild[tier];
        const type = get(value, 'type', '');
        const subType = get(value, 'subType', '');

        switch (type) {
            case 'id':
            case 'type':
            case 'contains':
                set(tagBuildTier, type, value);
                break;
            case 'class':
                set(tagBuildTier, `classes.${subType}`, value);
                break;
            case 'attribute':
                set(tagBuildTier, `attributes.${subType}`, value);
                break;
        }

        commit('setFullBuild', { tagBuild });
    },
    deleteTierValue({ state, commit }, { tier, value }) {
        const tagBuild = { ...state.tagBuild };
        if (!tagBuild.hasOwnProperty(tier)) {
            return;
        }

        const tagBuildTier = tagBuild[tier];
        const type = get(value, 'type', '');
        const subType = get(value, 'subType', '');

        switch (type) {
            case 'id':
            case 'type':
            case 'contains':
                delete tagBuildTier[type];
                break;
            case 'class':
                let newClasses = { ...tagBuildTier.classes };
                delete newClasses[value.subType];
                tagBuildTier.classes = newClasses;
                break;
            case 'attribute':
                let newAttributes = { ...tagBuildTier.attributes };
                delete newAttributes[value.subType];
                tagBuildTier.attributes = newAttributes;
                break;
        }

        if(tagItemIsEmpty(tagBuildTier)) {
            delete tagBuild[tier];
        }

        commit('setFullBuild', { tagBuild });
    },
    resetTagBuild({commit}) {
        commit('resetBuild');
    },
    setAdvancedMode({ commit }, value) {
        commit('setAdvancedMode', { value });
    }
}

export const getters = {
    tagBuild(state) {
        return state.tagBuild;
    },
    advancedMode(state) {
        return state.advancedMode;
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};