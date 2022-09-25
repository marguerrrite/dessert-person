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
        <text class="dot-title" v-for="d in data" :key="d" :x="d.x" :y="d.y">{{
            d.title
        }}</text>
    </template>
</template>

<style lang="scss">
    .dot-title {
        font-size: 0.6em;
    }
</style>
