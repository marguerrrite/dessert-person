<script>
    import {mapState} from "vuex";
    import Scatterplot from "@/components/Scatterplot/Scatterplot.vue";
    import {median} from "d3-array";

    export default {
        name: "Index",
        components: {
            Scatterplot,
        },
        data() {
            return {
                isLoaded: false,
                plotHeight: 0,
            };
        },
        computed: {
            ...mapState({
                hasSeenNote: state => state.hasSeenNote,
                selection: state => state.selection,
                recipes: state => state.recipes,
            }),
        },

        methods: {
            toggleNote() {
                this.$store.dispatch("setHasSeenNote", false);
            },
        },
        watch: {
            recipes() {
                if (Object.keys(this.recipes).length) {
                    this.isLoaded = true;
                }
            },
        },
    };
</script>

<template>
    <MaxWidth class="Index" size="l" v-if="isLoaded">
        <div class="metas">
            <div>
                <h1>Dessert Person</h1>
                <div>
                    Cookbook by Clare Saffitz / Book & Infographic designed by
                    Mia Hammond
                </div>
            </div>
            <Button @click="toggleNote" class="note-btn"> See Note </Button>
        </div>
        <div class="flex">
            <Scatterplot ref="plot" />
            <Recipe />
        </div>
        <FilterBar />
        <Note v-if="!hasSeenNote.hasSeenNote" />
    </MaxWidth>
</template>

<style lang="scss">
    @import "./../styles/globals";

    .Index {
        height: 100%;
        padding-top: 0em;
        position: relative;
        background: url("/images/background-marble-06.png");
        background-repeat: no-repeat;
        background-size: cover;
        height: 100vh;
        max-height: 2000px;

        @media (max-width: 600px) {
            padding: 0 1em;
        }

        .metas {
            padding: 1em 0;
            color: var(--background-color);
            position: relative;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            align-items: start;

            h1 {
                font-family: var(--juane);
                letter-spacing: 0.05em;
                font-weight: 600;
                font-size: 2.7em;
                color: var(--background-color);
                margin: 0.25em 0;
            }
        }

        .note-btn {
            font-weight: 500;
            background: $dp-pink;
            border: 1px solid darken($dp-pink, 20%);
            color: white;
            border-radius: 2px;
            color: $dp-dark;
            font-size: 0.9em;
            opacity: 0.7;
            transition: all 100ms linear;

            &:hover {
                opacity:1;
                transition: all 100ms linear;
            }
        }

        .flex {
            display: flex;
            gap: 2em;
            position: relative;
            z-index: 10;

            @media (max-width: 900px) {
                flex-direction: column;
            }

            @media (max-width: 600px) {
                gap: 1em;
            }
        }

        img {
            position: relative;
        }

        .title {
            max-width: 400px;
        }

        .FilterBar {
            position: relative;
            z-index: 10;
        }
    }
</style>
