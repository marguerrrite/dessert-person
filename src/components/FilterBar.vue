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
            setExtra(extra) {
                let query = {...this.$route.query};
                let newSelection = {...this.selection};
            },
            toggleChapterColors() {
                this.$store.commit("toggleChapterColors");
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
                <div class="FilterBar__switch__container">
                    Chapter colors
                    <label class="FilterBar__switch">
                        <input
                            type="checkbox"
                            :value="doShowChapterColors"
                            @change="toggleChapterColors"
                        />
                        <div class="FilterBar__slider round"></div>
                    </label>
                </div>
            </div>
            <button
                class="FilterBar__toggle"
                @click="shouldShowExtra = !shouldShowExtra"
            >
                Extra
                <div class="FilterBar__toggle__icon">
                    {{ shouldShowExtra ? "—" : "+" }}
                </div>
            </button>
        </div>
        <div class="FilterBar__content">
            <div class="FilterBar__main" v-if="shouldShowChapters">
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
                        :style="{background: chapterColors[slugify(filter)]}"
                    ></div>
                    <div>
                        {{ filter }}
                    </div>
                </button>
            </div>
            <div class="FilterBar__extra">
                <div class="FilterBar__item" v-if="shouldShowExtra">
                    <button class="FilterBar__button">YouTube</button>
                    <!-- <button class="FilterBar__button">
                        Recipes I've Made!
                    </button> -->
                    <div>
                        <UiTooltip>
                            <template #toggle
                                ><svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM9 12.5C9 12.78 8.78 13 8.5 13H7.5C7.22 13 7 12.78 7 12.5V11.5C7 11.22 7.22 11 7.5 11H8.5C8.78 11 9 11.22 9 11.5V12.5ZM9 9.5V8.83C10.16 8.42 11 7.3 11 6C11 4.35 9.65 3 8 3C6.51 3 5.28 4.08 5.04 5.5C5 5.78 5.12 6 5.5 6H6.5C6.91 6 7 5.64 7 5.5C7 5.22 7.22 5 7.5 5H8.5C8.78 5 9 5.22 9 5.5V6.5C9 6.78 8.78 7 8.5 7H7.75C7.12 7 7 7.45 7 8V9.5C7 9.78 7.22 10 7.5 10H8.5C8.78 10 9 9.78 9 9.5Z"
                                        fill="#17171B"
                                    />
                                </svg>
                            </template>
                            <template #contents>
                                <div>
                                    <Link
                                        do-open-in-new-tab
                                        to="https://en.wikipedia.org/wiki/Voronoi_diagram"
                                        >From wikipedia:</Link
                                    >
                                    <p>
                                        A Voronoi diagram is a partition of a
                                        plane into regions close to each of a
                                        given set of objects.
                                    </p>
                                    <p>
                                        I'm using this figure out the tooltip
                                        placement.
                                    </p>
                                    <p>
                                        <Link
                                            do-open-in-new-tab
                                            to="https://github.com/d3/d3-voronoi"
                                            >d3-voronoi</Link
                                        >
                                    </p>
                                </div>
                            </template>
                        </UiTooltip>
                    </div>
                    <button class="FilterBar__button">Voronoi Diagram</button>
                    <button @click="clearAll" class="FilterBar__button clear">
                        Clear all
                    </button>

                    <!-- <Tooltip class="FilterBar__tooltip">
                                <FontAwesomeIcon class="FilterBar__item__icon" icon={faQuestionCircle} />
                                <div>
                                    <Link doOpenInNewTab to="https://en.wikipedia.org/wiki/Voronoi_diagram">From wikipedia:</Link>
                                    <p>
                                        A Voronoi diagram is a partition of a plane into
                                        regions close to each of a given set of objects.
                                    </p>
                                    <p>
                                        I'm using this figure out the tooltip data!
                                    </p>
                                    <p>
                                        <Link doOpenInNewTab to="https://github.com/d3/d3-voronoi">d3-voronoi</Link>
                                    </p>
                                </div>
                            </Tooltip> -->
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .FilterBar {
        //background: rgba(white, 0.5);
        padding: 0 1em;

        @media (max-width: 600px) {
            display: none;
        }

        &__controls,
        &__content {
            display: grid;
            grid-template-columns: 1fr 24em;
            grid-gap: 3.5em;

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

        &__switch input {
            display: none;
        }

        &__slider {
            background-color: $dp-taupe;
            bottom: 0;
            cursor: pointer;
            left: 0;
            position: absolute;
            right: 0;
            top: 0;
            transition: 100ms;
        }

        &__slider:before {
            background-color: #fff;
            bottom: 4px;
            content: "";
            height: 19px;
            left: 4px;
            position: absolute;
            transition: 100ms;
            width: 19px;
        }

        &__slider.round {
            border-radius: 34px;
        }

        &__slider.round:before {
            border-radius: 20px;
        }

        &__switch {
            display: inline-flex;
            height: 26px;
            position: relative;
            width: 40px;
            margin-left: 0.5em;
            transform: scale(0.75) translateY(2px);

            &__container {
                display: flex;
                align-items: center;
                font-size: 0.85em;
                color: white;
            }

            input:checked + .FilterBar__slider {
                background-color: $paradiddle-pink;
            }

            input:checked + .FilterBar__slider:before {
                transform: translateX(12px);
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
