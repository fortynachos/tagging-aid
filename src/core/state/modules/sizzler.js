export const state = getInitialState();

export function getInitialState() {
    return {
        sizzleIsActive: false,
        sizzleValue: '',
        sizzleUpdateId: '',
    };
}

export const mutations = {
    setSizzleIsActive(state, { value }) {
        state.sizzleIsActive = value;
    },
    setSizzleValue(state, { value }) {
        state.sizzleValue = value;
    },
    setSizzleUpdateId(state, { value }) {
        state.sizzleUpdateId = value;
    }
};

export const actions = {
    setSizzleIsActive({ commit }, { value, updateId }) {
        commit('setSizzleIsActive', { value });
        commit('setSizzleUpdateId', { value: updateId });
    },
    setSizzleValue({ commit }, { value, updateId }) {
        commit('setSizzleValue', { value });
        commit('setSizzleUpdateId', { value: updateId });
    },
}

export const getters = {
    sizzleIsActive(state) {
        return state.sizzleIsActive;
    },
    sizzleValue(state) {
        return state.sizzleValue;
    },
    sizzleUpdateId(state) {
        return state.sizzleUpdateId;
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};