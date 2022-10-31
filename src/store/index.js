import {createStore} from "vuex";
import utils from "../scripts/utils";

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
                data: {},
                index: "",
            },
            data: [],
            recipes: {},
            selection: {
                recipe: "",
                chapter: "",
                other: [],
            },
            dimensions: {},
            doShowChapterColors: false,

            chapterColors: {},
        };
    },

    mutations: {
        setMode(state, mode) {
            state.mode = mode;
        },
        toggleChapterColors(state) {
            state.doShowChapterColors = !state.doShowChapterColors;
        },
        setDimensions(state, dimnsions) {
            state.dimensions = dimnsions;
        },
        setLockedData(state, data) {
            state.lockedData = data;
        },
        setData(state, data) {
            let processed = [...data];
            processed.forEach(row => {
                let slug = row.recipe
                    .toLowerCase()
                    .replaceAll(" ", "-")
                    .replaceAll("'", "");
                slug = slug.replace(/(?:[^\w-.]+|_+)/g, " ");
                row["slug"] = slug;
            });
            state.data = processed;

            let recipes = {};
            data.forEach(row => {
                recipes[row.slug] = row;
            });

            let chapters = [
                ...new Set(data.map(row => utils.slugify(row.section))),
            ];
            let colors = [
                "#84B5FF",
                "#FFCE9C",
                "#7BEFB5",
                "#A5A5F7",
                "#FFA5D6",
                "#FFEF8C",
                "#BDEFFF",
            ];
            let chapterColors = {};
            chapters.forEach((chapter, i) => {
                chapterColors[chapter] = colors[i];
            })

            state.recipes = recipes;
            state.chapterColors = chapterColors;
        },
        setHasSeenNote(state, hasSeenNote) {
            if (!hasSeenNote) {
                localStorage.removeItem(state.localStorageKey);
                state.hasSeenNote = {hasSeenNote: false, expire: ""};
                return;
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
        setSelection(state, newSelection) {
            state.selection = newSelection;
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
