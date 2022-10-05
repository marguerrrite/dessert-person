<script>
    import {mapState} from "vuex";
    import {extent, min, max} from "d3";
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
            }),
            chapterList() {
                let chapterList = Object.values(this.recipes).map(recipe => recipe["section"]);
                return (chapterList = [...new Set(chapterList)]);
            },
            filterOptions() {
                let options = [...this.chapterList];
                return options;
            }
        },
        methods: {},
        watch: {},
    };
</script>

<template>
    <div class="FilterBar">
        <div class="FilterBar__controls">
            <div class="FilterBar__controls--chapters">
                <button class="FilterBar__toggle"  @click="shouldShowChapters = !shouldShowChapters">
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
                            value="{shouldShowColors}"
                            class="checked"
                            checked="{shouldShowColors}"
                        />
                        <div class="FilterBar__slider round"></div>
                    </label>
                </div>
            </div>
            <button class="FilterBar__toggle" @click="shouldShowExtra = !shouldShowExtra">
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
                >
                    <div
                        class="FilterBar__button__dot"
                        :style="{background: sectionColors[i]}"
                    ></div>
                    <div>
                        {{ filter }}
                    </div>
                </button>
            </div>
            <div class="FilterBar__extra">
                <div class="FilterBar__item" v-if="shouldShowExtra">
                    <button class="FilterBar__button">YouTube</button>
                    <button class="FilterBar__button">Recipes I've Made!</button>
                    <button class="FilterBar__button">Voronoi Diagram</button>
                    
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

        &__controls,
        &__content {
            display: grid;
            grid-template-columns: 1fr 24em;
            grid-gap: 3.5em;
        }

        &__controls {
            &--chapters {
                display: flex;
                justify-content: space-between;
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
                    color: $dp-dark;
                }
            }
        }

        &__button {
            border: 1px solid lighten($dp-taupe, 10%);
            background: white;
            font-size: 0.8em;
            padding: 0.5em 1em;
            border-radius: 3px;
            display: flex;
            align-items: center;

            &:hover {
                background: #f7f6f6;
                cursor: pointer;
            }

            &__dot {
                width: 8px;
                height: 8px;
                border-radius: 8px;
                margin-right: 0.5em;
            }

            &--active {
                background: $dp-taupe;
                border-color: $dp-taupe;

                &:hover {
                    background: $dp-taupe;
                    border-color: $dp-taupe;
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
            background-color: #ccc;
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
                background-color: $dp-dark;
            }

            input:checked + .FilterBar__slider:before {
                transform: translateX(12px);
            }
        }

        &__main {
            display: flex;
            flex-wrap: wrap;

            .FilterBar__button {
                margin-right: 0.75em;
                margin-bottom: 0.75em;
            }
        }

        &__extra {
            display: flex;
            flex-wrap: wrap;

            .FilterBar__button {
                margin-right: 0.75em;
                margin-bottom: 0.75em;
            }
        }
    }
</style>
