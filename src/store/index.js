import {createStore} from "vuex";

const store = createStore({
    state() {
        return {
            localStorageKey: "dessertperson_",
            mode: "dev",
            lockedData: {},
        };
    },

    mutations: {
        setMode(state, mode) {
            state.mode = mode;
        },
        setData(state, data) {
            state.lockedData = data;
        },
    },

    actions: {
        setMode({commit}, mode) {
            commit("setMode", mode);
        },
        setData({commit}, data) {
            commit("setData", data);
        },
    },
});

export default store;
