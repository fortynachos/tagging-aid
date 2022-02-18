export const state = getInitialState();

export function getInitialState() {
    return {
        isActive: false,
    };
}

export const mutations = {
    setIsActive(state, { value }) {
        state.isActive = value;
    },
};

export const actions = {
    toggleIsActive({ state, commit }) {
        commit('setIsActive', { value: !state.isActive });
    },
    setIsActive({ commit }, { value }) {
        commit('setIsActive', { value });
    },
};

export const getters = {
    isActive(state) {
        return state.isActive;
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
