import { simpleDomNode } from '@/utils/common';

export const state = getInitialState();

export function getInitialState() {
    return {
        isLocked: false,
        activeFrame: false,
        elementArray: [],
        simpleElementArray: [{}],
    };
}

export const mutations = {
    replaceRootElement(state, { value }) {
        state.elementArray = [value];
    },
    replaceSimpleRootElement(state, { value }) {
        state.simpleElementArray = [value];
    },
    replaceElementArray(state, { value }) {
        state.elementArray = value;
    },
    replaceSimpleElementArray(state, { value }) {
        state.simpleElementArray = value;
    },
    pushElement(state, { newElement }) {
        state.elementArray.push(newElement);
    },
    pushSimpleElement(state, { newElement }) {
        state.simpleElementArray.push(newElement);
    },
    removeLastElement(state) {
        state.elementArray.pop();
    },
    removeLastSimpleElement(state) {
        state.simpleElementArray.pop();
    },
    setLocked(state, { value }) {
        state.isLocked = value;
    },
    setActiveFrame(state, { value }) {
        state.activeFrame = value;
    },
};

export const actions = {
    toggleIsLocked({ state, commit, dispatch }) {
        dispatch('setIsLocked', {
            value: !state.isLocked,
        });
    },
    setIsLocked({ commit }, { value }) {
        commit('setLocked', { value });
    },
    traverseUp({ state, commit, getters }) {
        if (state.isLocked && !getters.currentElementIsRootHtml) {
            commit('pushElement', { newElement: getters.parentElement });
            commit('pushSimpleElement', {
                newElement: simpleDomNode(getters.currentElement),
            });
        }
    },
    traverseDown({ state, commit, getters }) {
        if (state.isLocked && getters.numElements > 1) {
            commit('removeLastElement');
            commit('removeLastSimpleElement');
        }
    },
    setNewRoot({ commit, dispatch }, value) {
        let simplifiedRoot = simpleDomNode(value);
        commit('replaceRootElement', { value });
        dispatch('setNewSimpleRoot', simplifiedRoot);
    },
    setNewSimpleRoot({ commit }, value) {
        commit('replaceSimpleRootElement', { value });
    },
    setNewElementArray({ commit }, value) {
        commit('replaceElementArray', { value });
    },
    setNewSimpleElementArray({ commit }, value) {
        commit('replaceSimpleElementArray', { value });
    },
    setActiveFrame({ commit }, value) {
        commit('setActiveFrame', { value });
    },
};

export const getters = {
    currentElement(state) {
        let elements = state.elementArray;
        let numElements = elements.length;
        if (numElements) {
            return elements[numElements - 1];
        }
    },
    currentSimpleElement(state) {
        let elements = state.simpleElementArray;
        let numElements = elements.length;
        return elements[numElements - 1] || {};
    },
    allElements(state) {
        return state.elementArray;
    },
    simpleElementArray(state) {
        return state.simpleElementArray;
    },
    currentElementIsRootHtml(state, getters) {
        return getters.currentElement.nodeName.toLowerCase() === 'html';
    },
    currentSimpleElementIsRootHtml(state, getters) {
        return getters.currentSimpleElement.nodeName.toLowerCase() === 'html';
    },
    parentElement(state, getters) {
        return getters.currentElement.parentNode;
    },
    numElements(state) {
        return state.elementArray.length;
    },
    numSimpleElements(state) {
        return state.simpleElementArray.length;
    },
    isLocked(state) {
        return state.isLocked;
    },
    isActiveFrame(state) {
        return state.activeFrame;
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
