import {createStore} from "vuex";

const store = createStore({
    state() {
        return {
            localStorageKey: "dessertperson_",
            mode: "dev",
            lockedData: {
                coords: {x: 0, y: 0},
                data: {},
                index: ""
            },
            data: [],
            recipes: {}
        };
    },

    mutations: {
        setMode(state, mode) {
            state.mode = mode;
        },
        setLockedData(state, data) {
            state.lockedData = data;
        },
        setData(state, data) {
            let processed = [...data]
            processed.forEach(row => {
                row["slug"] = row.recipe.toLowerCase().replaceAll(" ", "-");
            })
            state.data = processed;

            let recipes = {};
            data.forEach(row => {
                recipes[row.slug] = row;
            })

            state.recipes = recipes;
        },
    },

    actions: {
        setMode({commit}, mode) {
            commit("setMode", mode);
        },
        setLockedData({commit}, data) {
            commit("setLockedData", data);
        },
        setData({commit}, data) {
            commit("setData", data);
        },
    },
});

export default store;
