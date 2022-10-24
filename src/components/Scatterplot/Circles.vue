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
            dimensions: {
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
        <circle
            class="data-circle"
            v-for="d in data"
            :key="d"
            :cx="d.x"
            :cy="d.y"
            r="3"
        />
        <text
            :class="{flip: d.x > dimensions.boundedWidth * 0.85}"
            class="dot-title"
            v-for="d in data"
            :key="d"
            :x="d.x + (d.x > dimensions.boundedWidth * 0.85 ? -3 : 3)"
            :y="d.y + (d.x > dimensions.boundedWidth * 0.85 ? 9 : -2)"
            >{{ d.title }}</text
        >
    </template>
</template>

<style lang="scss">
    .data-circle {
        fill: $dp-dark;
    }
    .dot-title {
        font-size: 0.575em;
        opacity: 0.5;

        &.flip {
            text-anchor: end;
        }
    }
</style>
