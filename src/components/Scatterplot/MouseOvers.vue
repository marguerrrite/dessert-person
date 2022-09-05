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
        v-if="lockedData.lockedIndex"
        :style="{
            transition: '500ms ease-in-out all 200ms',
        }"
        
    >
        <rect
            class="
                ScatterPlot__locked-line ScatterPlot__locked-line--vertical
            "
            width="1"
            :height="dimensions.boundedHeight"
            :x="lockedData.lockedCoords.x"
        />
        <rect
            class="
                ScatterPlot__locked-line ScatterPlot__locked-line--horizontal
            "
            :width="dimensions.boundedWidth + xRuleDistance"
            height="1"
            :x="-xRuleDistance"
            :y="lockedData.lockedCoords.y"
        />
        <text :x="lockedData.lockedCoords.x" :y="lockedData.lockedCoords.y">
            {{ lockedData.lockedData.recipe }}
        </text>
        <circle
            class="ScatterPlot__locked-circle"
            :cx="lockedData.lockedCoords.x"
            :cy="lockedData.lockedCoords.y"
            r="5"
        />
    </g>
    <g
        v-if="hoveredData.hoveredIndex"
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
            :x="hoveredData.hoveredCoords.x"
        />
        <rect
            class="
                ScatterPlot__hovered-line ScatterPlot__hovered-line--horizontal
            "
            :width="dimensions.boundedWidth + xRuleDistance"
            height="1"
            :x="-xRuleDistance"
            :y="hoveredData.hoveredCoords.y"
        />
        <text :x="hoveredData.hoveredCoords.x" :y="hoveredData.hoveredCoords.y">
            {{ hoveredData.hoveredData.recipe }}
        </text>
        <circle
            class="ScatterPlot__hovered-circle"
            :cx="hoveredData.hoveredCoords.x"
            :cy="hoveredData.hoveredCoords.y"
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
