<script>
    import {mapState} from "vuex";
    import Scatterplot from "@/components/Scatterplot/Scatterplot.vue";

    export default {
        name: "Index",
        components: {
            Scatterplot,
        },
        data() {
            return {
                isLoaded: false,
                
                
            };
        },
        computed: {
            ...mapState({
                //chartStyle: state => state.chartStyle,
            }),
        },

        methods: {
            
        },
        mounted() {
            this.isLoaded = true;
        },
    };
</script>

<template>
    <MaxWidth class="Index" size="m" v-if="isLoaded">
        <Scatterplot />
    </MaxWidth>
</template>

<style lang="scss">
    @import "./../styles/globals";

    .Index {
        height: 100%;
        padding-top: 8em;

        @media (max-width: 600px) {
            padding-top: 6em;
        }

    }
</style>
