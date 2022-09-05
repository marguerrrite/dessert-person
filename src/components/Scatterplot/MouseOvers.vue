<script>
    import {extent, min, max} from "d3";
    import utils from "@/scripts/utils.js";

    export default {
        name: "MouseOvers",
        components: {},
        props: {
            hoveredData: {
                type: Object,
            },
            lockedData: {
                type: Object,
            },
            dimensions: {
                type: Object
            },
            xRuleDistance: {
                type: Number
            }
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
    <g
        v-if="hoveredData.currentHoveredIndex || lockedData.currentLockedIndex"
        :style="{
            transition: '500ms ease-in-out all 200ms',
        }"
        
    >
        <rect
            class="
                ScatterPlot__hovered-line ScatterPlot__hovered-line--vertical
            "
            width="1"
            :height="dimensions.boundedHeight"
            :x="hoveredData.currentHoveredCoords.x"
        />
        <rect
            class="
                ScatterPlot__hovered-line ScatterPlot__hovered-line--horizontal
            "
            :width="dimensions.boundedWidth + xRuleDistance"
            height="1"
            :x="-xRuleDistance"
            :y="hoveredData.currentHoveredCoords.y"
        />
        <text :x="hoveredData.currentHoveredCoords.x" :y="hoveredData.currentHoveredCoords.y">
            {{ lockedData.currentLockedData.Recipes || hoveredData.currentHoveredData.Recipes }}
        </text>
        <circle
            class="ScatterPlot__hovered-circle"
            :cx="hoveredData.currentHoveredCoords.x"
            :cy="hoveredData.currentHoveredCoords.y"
            r="5"
        />
    </g>
</template>

<style lang="scss">
    .MouseOvers {
        width: 100%;
        height: 100%;
    }
</style>
