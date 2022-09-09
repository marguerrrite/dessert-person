<script>
    import {mapState} from "vuex";
    import {extent, min, max} from "d3";
    import utils from "@/scripts/utils.js";

    export default {
        name: "Recipe",
        components: {},
        props: {},
        data() {
            return {};
        },
        computed: {
            ...mapState({
                lockedData: state => state.lockedData,
                recipes: state => state.recipes,
            }),
        },
        methods: {},
        watch: {},
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
                <div class="table">
                    <div
                        v-for="(recipe, index) in Object.keys(recipes)"
                        class="row"
                    >
                        <div class="index">
                            {{ index + 1 }}
                        </div>
                        <div>
                            {{ recipes[recipe].recipe }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="lockedData.recipe">
            <h2>
                {{ lockedData.recipe || "" }}
            </h2>
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
        max-width: 24em;
        width: 100%;
        background: var(--background-color);
        border-radius: var(--border-radius);
        font-family: var(--juane);
        padding: 1em 0;
        color: var(--text-base-color);

        h2 {
            font-family: var(--juane);
            font-weight: 500;
            font-size: 1.3em;
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
                max-height: 560px;
                overflow-y: scroll;
            }

            .table {
                font-size: 0.9rem;
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            .row {
                display: grid;
                grid-template-columns: 1em auto;
                gap: 1em;
                padding: 0.7em 1rem 0.7em 1rem;
                border-top: 2px solid $dp-grids;
                align-items: baseline;
                color: $dp-dark;
                line-height: 1.2;

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
