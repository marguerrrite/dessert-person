<script>
    import {mapState} from "vuex";
    import utils from "@/scripts/utils.js";

    export default {
        name: "FilterBar",
        components: {},
        props: {},
        data() {
            return {
                shouldShowExtra: true,
                shouldShowChapters: true,
                sectionColors: [
                    "#84B5FF",
                    "#FFCE9C",
                    "#7BEFB5",
                    "#A5A5F7",
                    "#FFA5D6",
                    "#FFEF8C",
                    "#BDEFFF",
                ],
            };
        },
        computed: {
            ...mapState({
                data: state => state.data,
                lockedData: state => state.lockedData,
                recipes: state => state.recipes,
                doShowChapterColors: state => state.doShowChapterColors,
                doShowVoronoi: state => state.doShowChapterColors,
                chapterColors: state => state.chapterColors,
                selection: state => state.selection,
            }),
            chapterList() {
                let chapterList = Object.values(this.recipes).map(
                    recipe => recipe["section"]
                );
                return (chapterList = [...new Set(chapterList)]);
            },
            filterOptions() {
                let options = [...this.chapterList];
                return options;
            },
        },
        methods: {
            setChapter(chapter) {
                let query = {...this.$route.query};
                let newChap = utils.slugify(chapter);

                let newSelection = {...this.selection};

                if (!query["chapter"] || query["chapter"] != newChap) {
                    query["chapter"] = newChap;
                    query["recipe"] = undefined;
                    newSelection["chapter"] = newChap;
                    newSelection["recipe"] = "";
                } else {
                    query["chapter"] = undefined;
                    newSelection["chapter"] = "";
                }

                this.$router.push({query});
                this.$store.commit("setSelection", newSelection);
            },
            clearAll() {
                this.$router.push({});
                this.$store.commit("setSelection", {});
            },
        },
        watch: {},
    };
</script>

<template>
    <div class="FilterBar">
        <div class="FilterBar__controls">
            <div class="FilterBar__controls--chapters">
                <button
                    class="FilterBar__toggle"
                    @click="shouldShowChapters = !shouldShowChapters"
                >
                    Chapters
                    <div class="FilterBar__toggle__icon">
                        {{ shouldShowChapters ? "—" : "+" }}
                    </div>
                </button>
            </div>
        </div>
        <div class="FilterBar__content">
            <div class="FilterBar__main">
                <template v-if="shouldShowChapters">
                    <button
                        v-for="(filter, i) in filterOptions"
                        :key="i"
                        class="FilterBar__button"
                        :class="{
                            active: selection.chapter == slugify(filter),
                            inactive:
                                selection.chapter &&
                                selection.chapter != slugify(filter),
                        }"
                        @click="setChapter(filter)"
                    >
                        <div
                            class="FilterBar__button__dot"
                            :style="{
                                background: chapterColors[slugify(filter)],
                            }"
                        ></div>
                        <div>
                            {{ filter }}
                        </div>
                    </button></template
                >
            </div>
            <button
                @click="clearAll"
                class="FilterBar__button clear"
                :disabled="!selection.chapter && !selection.recipe"
                :style="{opacity: !selection.chapter && !selection.recipe ? 0.5 : 1}"
            >
                Clear all
            </button>
        </div>
        
    </div>
</template>

<style lang="scss">
    .FilterBar {
        padding: 0 1em;

        @media (max-width: 600px) {
            display: none;
        }


        &__controls,
        &__content {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;

            @media (max-width: 600px) {
                display: none;
            }
        }

        &__controls {
            &--chapters {
                display: flex;
                justify-content: space-between;
            }

            @media (max-width: 600px) {
                display: none;
            }
        }

        &__item {
            display: inline-grid;
            grid-template-columns: auto auto;
            align-items: center;
            grid-gap: 0.5em;
        }

        &__tooltip {
            .FilterBar__item__icon {
                color: white;
                transition: all 100ms linear;

                &:hover {
                    color: $dp-pink-pink;
                    transition: all 100ms linear;
                }
            }

            .UiTooltip__toggle--active {
                .FilterBar__item__icon {
                    color: $dp-pink-pink;
                }
            }
        }

        &__button {
            border: 1px solid lighten($dp-taupe, 10%);
            background: white;
            font-size: 0.8rem;
            padding: 0.35em 0.7em;
            border-radius: 3px;
            display: flex;
            align-items: center;
            color: $dp-dark;
            transition: all 100ms linear;

            &:hover {
                cursor: pointer;
                transition: all 100ms linear;
            }

            &__dot {
                width: 8px;
                height: 8px;
                border-radius: 8px;
                margin-right: 0.5em;
            }

            &.active {
                &:hover {
                    background: $dp-pink;
                    border-color: $dp-pink;
                    opacity: 1;
                }
            }

            &.inactive {
                opacity: 0.7;

                &:hover {
                    opacity: 0.9;
                }
            }

            &.clear {
                white-space: nowrap;
                &.active {
                    background: #efadd1;
                    border-color: #efadd1;
                }
            }
        }

        &__toggle {
            border: none;
            background-color: transparent;
            outline: none;
            display: flex;
            align-items: center;
            font-size: 0.85em;
            color: var(--grey-700);
            color: white;
            font-weight: 500;
            margin-top: 1em;
            margin-bottom: 0.5em;

            &:hover {
                cursor: pointer;
            }

            &__icon {
                margin-left: 0.25em;
            }
        }

        &__main {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;

            .FilterBar__button {
                margin-right: 0.75em;
                margin-bottom: 0.75em;
            }
        }

        &__extra {
            display: flex;
            flex-wrap: wrap;
            align-items: start;

            .FilterBar__button {
                margin-right: 0.75em;
                margin-bottom: 0.75em;
            }
        }
    }
</style>
