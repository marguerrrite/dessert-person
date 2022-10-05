import {createStore} from "vuex";

const store = createStore({
    state() {
        return {
            localStorageKey: "dessertperson_",
            hasSeenNote:
                typeof window !== "undefined" &&
                localStorage.getItem("dessertperson_")
                    ? JSON.parse(localStorage.getItem("dessertperson_"))
                    : {hasSeenNote: false, expire: ""},
            mode: "dev",
            lockedData: {
                coords: {x: 0, y: 0},
                data: {},
                index: "",
            },
            data: [],
            recipes: {},
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
            let processed = [...data];
            processed.forEach(row => {
                row["slug"] = row.recipe.toLowerCase().replaceAll(" ", "-");
            });
            state.data = processed;

            let recipes = {};
            data.forEach(row => {
                recipes[row.slug] = row;
            });

            state.recipes = recipes;
        },
        setHasSeenNote(state, hasSeenNote) {
            if (!hasSeenNote) {
                localStorage.removeItem(state.localStorageKey);
                state.hasSeenNote = {hasSeenNote: false, expire: ""};
                return
            }

            let expire = new Date();
            expire.setDate(expire.getDate() + 15);

            let agreedObj = {
                hasSeenNote: true,
                expire,
            };

            state.hasSeenNote = agreedObj;

            localStorage.setItem(
                state.localStorageKey,
                JSON.stringify(agreedObj)
            );
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
        setHasSeenNote({commit}, hasSeenNote) {
            commit("setHasSeenNote", hasSeenNote);
        },
    },
});

export default store;
