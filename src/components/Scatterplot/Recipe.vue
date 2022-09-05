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
            }),
        },
        methods: {},
        watch: {},
    };
</script>

<template>
    <div class="Recipe">
        <h2>
            {{ lockedData.recipe || "" }}
        </h2>
    </div>
</template>

<style lang="scss">
    .Recipe {
        position: relative;
        max-width: 24em;
        width: 100%;
        background: white;
         border-radius: var(--border-radius);
        font-family: "Source Serif Pro";
        padding: 2em 2.5em;

        h2 {
            font-family: var(--juane);
            font-weight: 500;
            font-size: 1.3em;
        }
    }
</style>
