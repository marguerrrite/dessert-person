<script>
    import {mapState} from "vuex";
    import {extent, min, max} from "d3";
    import YouTubeLink from "./YouTubeLink.vue";

    export default {
        name: "Recipe",
        components: {YouTubeLink},
        props: {},
        data() {
            return {
                activeSort: ["recipe", 1],
                sortedRecipes: [],
                isLoaded: false,
            };
        },
        computed: {
            ...mapState({
                lockedData: state => state.lockedData,
                recipes: state => state.recipes,
                selection: state => state.selection,
                dimensions: state => state.dimensions,
            }),
        },
        methods: {
            changeRoute(recipe) {
                let query = {...this.$route.query};

                if (recipe && query["recipe"] != recipe.slug) {
                    query["recipe"] = recipe.slug;
                    this.$router.push({query});
                } else {
                    query["recipe"] = undefined;
                    this.$router.push({query});
                }
            },
            processTitle(title) {
                return title
                    .replaceAll("And", "and")
                    .replaceAll("Of", "of")
                    .replaceAll("With", "with");
            },
            toggleSort(sort) {
                if (sort == this.activeSort[0]) {
                    this.activeSort[1] = this.activeSort[1] == 1 ? -1 : 1;
                } else {
                    this.activeSort = [sort, 1];
                }

                this.sortRecipes();
            },
            sortRecipes() {
                let sorted = Object.values(this.recipes);

                if (this.activeSort[0] == "recipe") {
                    if (this.activeSort[1] == 1) {
                        sorted = sorted.sort((a, b) => {
                            return a.recipe.localeCompare(b.recipe);
                        });
                    } else {
                        sorted = sorted.sort((a, b) => {
                            return b.recipe.localeCompare(a.recipe);
                        });
                    }
                } else {
                    if (this.activeSort[1] == 1) {
                        sorted = sorted.sort((a, b) => {
                            return a.difficulty - b.difficulty;
                        });
                    } else {
                        sorted = sorted.sort((a, b) => {
                            return b.difficulty - a.difficulty;
                        });
                    }
                }

                this.sortedRecipes = sorted;
            },
            setSelection(newSelection) {
                let query = {...this.$route}.query;
                query = {...query, ...newSelection.query};

                this.$router.push({query});
            },
            scrollList(recipe) {
                let scrollDiv = this.$refs["table-scroll"];

                let scrollDepth = scrollDiv.scrollTop;
                let rowHeight = this.$refs[recipe][0].clientHeight;
                let rowOffsetTop = this.$refs[recipe][0].offsetTop - rowHeight;

                let tableHeight =
                    this.$refs["table-container"].clientHeight * 0.85;

                let isRecipeVisible =
                    rowOffsetTop > scrollDepth &&
                    rowOffsetTop - 50 < scrollDepth + tableHeight;

                console.log(rowOffsetTop, scrollDepth);
                console.log("visible?:", isRecipeVisible);

                if (!isRecipeVisible) {
                    scrollDiv.scrollTo({
                        top: rowOffsetTop - 70,
                        behavior: "smooth",
                        duration: 100,
                    });
                }
            },
            humanTime(minutes) {
                if (minutes < 60) {
                    return `${minutes} minutes`;
                }

                let min = minutes % 60;
                let hours = Math.floor(minutes / 60);

                return `${hours} ${
                    hours == 1 ? "hour" : "hours"
                } ${min} minutes`;
            },
        },
        mounted() {
            this.sortRecipes();
        },
        watch: {
            lockedData: {
                deep: true,
                handler() {
                    if (this.lockedData?.slug) {
                        this.scrollList(this.lockedData?.slug);
                    }
                },
            },
        },
    };
</script>

<template>
    <div class="Recipe">
        <div class="recipe-list-container">
            <h2>
                <span
                    class="letter-rotate"
                    v-for="letter in 'Recipes'.split('')"
                    :style="{opacity: letter == '_' ? 0 : 1}"
                    :key="letter"
                >
                    {{ letter }}
                </span>
            </h2>
            <div class="table-container" ref="table-container">
                <div class="table-header">
                    <div class="header-toggle" @click="toggleSort('recipe')">
                        Recipe
                        <span v-if="activeSort[0] == 'recipe'" class="arrow">
                            {{ activeSort[1] == 1 ? "&#8593;" : "&#8595;" }}
                        </span>
                    </div>
                    <div
                        class="header-toggle right-align"
                        @click="toggleSort('difficulty')"
                    >
                        <span
                            v-if="activeSort[0] == 'difficulty'"
                            class="arrow"
                        >
                            {{ activeSort[1] == 1 ? "&#8593;" : "&#8595;" }}
                        </span>
                        Difficulty
                    </div>
                </div>
                <div
                    class="table-scroll"
                    ref="table-scroll"
                    :style="{maxHeight: `${dimensions.boundedHeight}px`}"
                >
                    <div class="table" v-if="sortedRecipes[0]" ref="table">
                        <template
                            v-for="(recipe, index) in sortedRecipes"
                            :key="index"
                        >
                            <a
                                @click="changeRoute(recipe)"
                                class="row"
                                :class="{
                                    active: selection?.recipe == recipe.slug,
                                    inactive:
                                        selection?.recipe &&
                                        selection?.recipe != recipe.slug,
                                }"
                                :ref="recipe.slug"
                            >
                                <div class="recipe">
                                    {{ processTitle(recipe.recipe) }}
                                </div>
                                <div>
                                    <div
                                        class="youtube-icon"
                                        v-if="recipe.video_src"
                                    >
                                        <svg
                                            width="20"
                                            height="14"
                                            viewBox="0 0 20 14"
                                            fill="none"
                                        >
                                            <g clip-path="url(#clip0_85_15)">
                                                <path
                                                    d="M19.5835 2.18627C19.353 1.32526 18.6763 0.648636 17.8153 0.418156C16.2545 0 10 0 10 0C10 0 3.74547 0 2.18637 0.418156C1.32532 0.648636 0.648666 1.32526 0.418176 2.18627C0 3.7453 0 7 0 7C0 7 0 10.2547 0.418176 11.8137C0.648666 12.6747 1.32532 13.3514 2.18637 13.5818C3.74547 14 10 14 10 14C10 14 16.2545 14 17.8136 13.5818C18.6747 13.3514 19.3513 12.6747 19.5818 11.8137C20 10.2547 20 7 20 7C20 7 20 3.7453 19.5835 2.18627Z"
                                                    fill="#d7c6c8"
                                                />
                                                <path
                                                    d="M7.99951 9.99955L13.1971 7.00002L7.99951 4.00049V9.99955Z"
                                                    fill="white"
                                                />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_85_15">
                                                    <rect
                                                        width="20"
                                                        height="14"
                                                        fill="white"
                                                    />
                                                </clipPath>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                                <div class="right-align">
                                    {{
                                        (
                                            Math.floor(recipe.difficulty * 10) /
                                            10
                                        ).toFixed(1)
                                    }}
                                </div>
                            </a>
                            <div
                                class="expanded-row"
                                v-if="selection?.recipe == recipe.slug"
                            >
                                <div class="info">
                                    <div>
                                        {{ lockedData.section }}
                                    </div>
                                </div>
                                <div class="info">
                                    <div>
                                        Level
                                        {{ Math.floor(lockedData.difficulty) }}
                                        | Total time:
                                        {{ humanTime(lockedData.minutes) }}

                                        <!-- | Page: {{ lockedData.page }} -->
                                    </div>
                                </div>
                                <YouTubeLink
                                    v-if="lockedData.video_thumbnail"
                                    :data="lockedData"
                                    :src="lockedData.video_src"
                                    :thumbnail="lockedData.video_thumbnail"
                                    :title="lockedData.video_title"
                                    :date="lockedData.video_date"
                                />
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <!-- <div v-if="lockedData.recipe" class="active-recipe">
            <div>
                <Button @click="setLockedRecipe()">
                    <span class="arrow">&#60;-</span></Button
                >
            </div>
            <h2>
                {{ processTitle(lockedData.recipe) || "" }}
            </h2>
            <div>Level {{ Math.floor(lockedData.difficulty) }}</div>
            <div>
                <div>Recipe time: {{ lockedData.minutes }}</div>
                <div>Page: {{ lockedData.page }}</div>
            </div>
            <div v-if="lockedData.video_src">
                <YouTubeLink
                    :data="lockedData"
                    :src="lockedData.video_src"
                    :thumbnail="lockedData.video_thumbnail"
                    :title="lockedData.video_title"
                    :date="lockedData.video_date"
                />
            </div>
        </div> -->
        <div class="decoration">
            <div
                v-for="tab in [1, 2, 3, 4]"
                :key="tab"
                class="corner-tab"
            ></div>
        </div>
    </div>
</template>

<style lang="scss">
    .Recipe {
        position: relative;
        max-width: 22em;
        width: 100%;
        background: var(--background-color);
        border-radius: var(--border-radius);
        padding-top: 1em;
        color: var(--text-base-color);
        //overflow: hidden;

        @media (max-width: 1200px) {
            max-width: 14em;
        }

        @media (max-width: 900px) {
            max-width: 100%;
        }

        h2 {
            font-family: var(--juane);
            font-weight: 500;
            font-size: 1.3em;
        }

        .active-recipe {
            padding: 0 1em;

            h2 {
                text-align: center;
            }
        }

        .youtube-preview {
            width: 100%;
            background: #fff3f4;
            color: #97484f;
        }

        .recipe-list-container {
            h2 {
                text-align: center;
                text-orientation: sideways;
                color: $dp-pink-pink;
                margin: 0 0 1em;
                opacity: 0.5;
            }

            .table-scroll {
                overflow-y: scroll;
            }

            .table {
                font-size: 0.9rem;
                display: flex;
                flex-direction: column;
                height: 100%;

                .right-align {
                    text-align: right;
                    font-variant-numeric: tabular;
                }
            }

            .table-header {
                display: grid;
                grid-template-columns: 1fr auto;
                padding: 0.25em 1rem 0.25em 1rem;
                font-size: 0.7em;

                &:hover {
                    cursor: pointer;
                }
            }

            .header-toggle {
                color: rgba($dp-dark, 0.5);

                span {
                    color: rgba($dp-dark, 0.5);
                }
            }

            .row {
                display: grid;
                grid-template-columns: 1fr auto 1.5em;
                gap: 1em;
                padding: 0.5em 1rem 0.5em 1rem;
                border-top: 1px solid $dp-pink;
                align-items: baseline;
                color: $dp-dark;
                line-height: 1.2;
                font-size: 0.9em;
                text-decoration: none;

                .index {
                    opacity: 0.4;
                }

                &:hover {
                    cursor: pointer;
                }

                .youtube-icon {
                    svg {
                        max-width: 16px;
                        padding-top: 4px;
                    }
                }

                .recipe {
                    padding-right: 0.5em;
                    opacity: 0.7;
                }

                &.active {
                    background: white;
                    padding-bottom: 0.1em;

                    .recipe {
                        font-weight: 600;
                        padding-right: 0.25em;
                        opacity: 1;
                    }
                }

                &.inactive {
                    background: rgba($dp-pink-pink, 0.05);

                    &:hover {
                        background: rgba($dp-pink-pink, 0.15);
                    }
                }
            }

            .expanded-row {
                padding: 0em 3.1rem 0.6em 1rem;

                .info {
                    display: flex;
                    font-size: 0.825em;
                    width: 100%;
                    justify-content: space-between;
                    padding: 0.25em 0 0.5em;
                    color: rgba($dp-dark, 0.75);
                }
            }

            @media (max-width: 1200px) {
                .row {
                    .recipe {
                        display: -webkit-box;
                        -webkit-line-clamp: 1;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    .youtube-icon {
                        svg {
                            max-width: 13px;
                            padding-top: 4px;
                        }
                    }
                }
            }

            .index {
                text-align: right;
                font-size: 0.9em;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                    Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue",
                    sans-serif;
                font-weight: 600;
                color: $dp-dark;
            }
        }

        .corner-tab {
            width: 3em;
            height: 3em;
            position: absolute;
            top: -2em;
            left: -2em;
            z-index: 10;
            border-bottom: 1em solid rgb(17, 132, 147);
            border-bottom: 1em solid pink;
            border-right: 1em solid transparent;
            border-top: 1em solid transparent;
            border-left: 1em solid transparent;
            transform: rotate(-45deg);
            opacity: 0.5;

            &:nth-of-type(2) {
                right: -2em;
                left: unset;
                transform: rotate(45deg);
            }

            &:nth-of-type(3) {
                right: -2em;
                left: unset;
                bottom: -2em;
                top: unset;
                transform: rotate(135deg);
            }

            &:nth-of-type(4) {
                bottom: -2em;
                top: unset;
                transform: rotate(-135deg);
            }
        }
    }
</style>
