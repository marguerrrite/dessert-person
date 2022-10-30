<script>
    import {extent, min, max} from "d3";
    import utils from "@/scripts/utils.js";

    export default {
        name: "CrossHairs",
        components: {},
        props: {
            hoveredData: {
                type: Object,
            },
            lockedData: {
                type: Object,
            },
            dimensions: {
                type: Object,
            },
            xRuleDistance: {
                type: Number,
            },
        },
        data() {
            return {};
        },
        computed: {
            hoverTextX() {
                return this.hoveredData.hoveredCoords.x + 5;
            },
            hoverTextY() {
                return this.hoveredData.hoveredCoords.y - 5;
            },
            lockTextX() {
                return this.lockedData.lockedCoords.x + 5;
            },
            lockTextY() {
                return this.lockedData.lockedCoords.y - 5;
            },
        },
        methods: {},
        watch: {},
    };
</script>

<template>
    <g class="CrossHairs">
        <g
            v-if="lockedData?.lockedData?.recipe"
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
                    ScatterPlot__locked-line
                    ScatterPlot__locked-line--horizontal
                "
                :width="dimensions.boundedWidth + xRuleDistance"
                height="1"
                :x="-xRuleDistance"
                :y="lockedData.lockedCoords.y"
            />
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
                    ScatterPlot__hovered-line
                    ScatterPlot__hovered-line--vertical
                "
                width="1"
                :height="dimensions.boundedHeight"
                :x="hoveredData.hoveredCoords.x"
            />
            <rect
                class="
                    ScatterPlot__hovered-line
                    ScatterPlot__hovered-line--horizontal
                "
                :width="dimensions.boundedWidth + xRuleDistance"
                height="1"
                :x="-xRuleDistance"
                :y="hoveredData.hoveredCoords.y"
            />
            <circle
                class="ScatterPlot__hovered-circle"
                :cx="hoveredData.hoveredCoords.x"
                :cy="hoveredData.hoveredCoords.y"
                r="5"
            />
        </g>
    </g>
</template>

<style lang="scss">
    .CrossHairs {
        width: 100%;
        height: 100%;
        position: relative;

        .ScatterPlot__hovered-line {
            fill: rgba($dp-dark, 0.35);
        }

        .ScatterPlot__locked-line {
            fill: rgba($dp-dark, 0.5);
        }

        text {
            font-size: 0.8em;
            font-weight: 600;
            fill: $dp-dark;
        }

        .text-plate {
            fill: var(--background-color);
            transform: translate(0, -14px);
            opacity: 0.75;
        }
    }
</style>
