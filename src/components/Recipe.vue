<script>
    import {mapState} from "vuex";
    import {extent, min, max} from "d3";
    import utils from "@/scripts/utils.js";
    import YouTubeLink from "./YouTubeLink.vue";

    export default {
        name: "Recipe",
        components: {YouTubeLink},
        props: {},
        data() {
            return {
                activeSort: ["recipe", 1],
                sortedRecipes: [],
            };
        },
        computed: {
            ...mapState({
                lockedData: state => state.lockedData,
                recipes: state => state.recipes,
            }),
        },
        methods: {
            setLockedRecipe(recipe) {
                if (recipe) {
                    this.$store.dispatch("setLockedData", recipe);
                } else {
                    this.$store.dispatch("setLockedData", {});
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
        },
        watch: {
            recipes() {
                this.sortRecipes();
            },
        },
        mounted() {},
    };
</script>

<template>
    <div class="Recipe">
        <div v-if="!lockedData.recipe" class="recipe-list-container">
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
            <div class="table-container">
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
                <div class="table" v-if="sortedRecipes[0]">
                    <a
                        @click="setLockedRecipe(recipe)"
                        v-for="(recipe, index) in sortedRecipes"
                        class="row"
                    >
                        <div>
                            {{ processTitle(recipe.recipe) }}
                        </div>
                        <div class="right-align">
                            {{ (Math.floor(recipe.difficulty * 10)/10).toFixed(1) }}
                        </div>
                    </a>
                </div>
            </div>
        </div>
        <div v-if="lockedData.recipe" class="active-recipe">
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
                />
            </div>
        </div>
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
        overflow: scroll;

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

            .table-container {
                overflow-y: scroll;
                max-height: 550px;
            }

            .table {
                font-size: 0.9rem;
                display: flex;
                flex-direction: column;
                height: 100%;

                .right-align {
                    text-align: right;
                    font-variant-numeric:tabular;
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
                grid-template-columns: 1fr auto;
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
                    background: $dp-stripe;
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
