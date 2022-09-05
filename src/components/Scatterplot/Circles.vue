<script>
    import {extent, min, max} from "d3";
    import utils from "@/scripts/utils.js";

    export default {
        name: "Circles",
        components: {},
        props: {
            data: {
                type: Object,
                required: true,
            },
        },
        data() {
            return {};
        },
        computed: {},
        methods: {},
        watch: {},
    };
</script>

<template>
    <template v-if="data[0].x">
        <circle v-for="d in data" :key="d" :cx="d.x" :cy="d.y" r="4" />
    </template>
</template>

<style lang="scss">
    .Circles {
        width: 100%;
        height: 100%;
    }
</style>
