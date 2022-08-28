import {createStore} from "vuex";

const store = createStore({
    state() {
        return {
            localStorageKey: "dessertperson_",
            mode: "dev",
        };
    },

    mutations: {
        setMode(state, mode) {
            state.mode = mode;
        },
    },

    actions: {
        setMode({commit}, mode) {
            commit("setMode", mode);
        },
    },
});

export default store;
