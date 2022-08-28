<script>
    import {extent, min, max, timeFormat} from "d3";
    import utils from "@/scripts/utils.js";

    export default {
        name: "Axis",
        components: {},
        props: {
            dimensions: {
                type: Object,
                required: true,
            },
            label: {
                type: String,
            },
            formatTick: {
                type: Function,
            },
            scale: {
                type: Function,
            },
            numberOfTicks: {
                type: Number,
                default: 14,
            },
            levelRules: {
                type: Array,
            },
            yScale: {
                type: Function,
            },
            xRuleDistance: {
                type: Number,
            },
            yRuleDistance: {
                type: Number,
            },
            yRyleDistanceThrees: {
                type: Number,
            },
            scale: {
                type: String,
                default: "x",
            },
            minrules: {
                type: Array,
            },
            xscales: {
                type: Object,
            },
        },
        data() {
            return {
                hourLabels: [5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 6, 12],
                minuteSections: [5, 60, 90, 120, 150, 180, 210, 240, 360, 720],
                arrowSize: 10,
            };
        },
        computed: {
            ticks() {
                return this.scale.ticks(this.numberOfTicks);
            },
            yArrowOffset() {
                return this.yRuleDistance * 3;
            },
            xTickOffset() {
                return this.yRuleDistance * 2 < 50
                    ? 40
                    : this.yRuleDistance * 2;
            },
        },
        methods: {
            formatYears() {
                return timeFormat("%Y");
            },
        },
        watch: {},
    };
</script>

<template>
    <g
        class="Axis AxisHorizontal"
        v-if="scale == 'x'"
        :style="{transform: `translate(0, ${dimensions.boundedHeight}px)`}"
    >
        <g>
            {/* Horiz Arrow Top */}
            <line
                :x1="`${xRuleDistance * 1.5 + dimensions.boundedWidth}`"
                :x2="`${
                    xRuleDistance * 1.5 +
                    dimensions.boundedWidth -
                    arrowSize -
                    3
                }`"
                :y1="2"
                :y2="-arrowSize - 2"
                class="Axis__arrow Axis__line Axis__line--left horiz"
            />

            {/* Horiz Arrow Bottom */}
            <line
                :x1="`${xRuleDistance * 1.5 + dimensions.boundedWidth}`"
                :x2="`${
                    xRuleDistance * 1.5 +
                    dimensions.boundedWidth -
                    arrowSize -
                    3
                }`"
                :y1="-2"
                :y2="arrowSize + 1"
                class="Axis__arrow Axis__line Axis__line--right horiz"
            />

            <line
                class="Axis__line"
                :x1="-xRuleDistance - 1.5"
                :x2="dimensions.boundedWidth + xRuleDistance * 1.5 - 1"
            />
        </g>

        {/* Real fake Y axis */}
        <g>
            {/* Vert Arrow Left */}
            <g :style="{transform: `translate(0, ${yArrowOffset})px`}">
                <line
                    :x1="-xRuleDistance + 1"
                    :x2="-xRuleDistance - arrowSize + 1"
                    :y1="-dimensions.boundedHeight"
                    :y2="-dimensions.boundedHeight + arrowSize"
                    class="Axis__arrow Axis__line Axis__line--left vert"
                />

                {/* Vert Arrow Right */}
                <line
                    :x1="-xRuleDistance - 1"
                    :x2="-xRuleDistance + arrowSize - 1"
                    :y1="-dimensions.boundedHeight"
                    :y2="-dimensions.boundedHeight + arrowSize"
                    class="Axis__arrow Axis__line Axis__line--right vert"
                />
            </g>
            <line
                class="Axis__line"
                :y1="-dimensions.boundedHeight + 4"
                :y2="0"
                :x1="-11"
                :x2="-11"
            />
        </g>

        <line
            v-for="tick in minrules"
            :key="tick"
            class="Grid__rules"
            :y1="-dimensions.boundedHeight"
            :x1="
                tick < 60
                    ? xscales.mins55(tick)
                    : tick <= 240
                    ? xscales.mins30(tick) + dimensions.sectionWidth
                    : tick <= 360
                    ? xscales.mins120(tick) + dimensions.sectionWidth * 7
                    : xscales.mins360(tick) + dimensions.sectionWidth * 8
            "
            :x2="
                tick < 60
                    ? xscales.mins55(tick)
                    : tick <= 240
                    ? xscales.mins30(tick) + dimensions.sectionWidth
                    : tick <= 360
                    ? xscales.mins120(tick) + dimensions.sectionWidth * 7
                    : xscales.mins360(tick) + dimensions.sectionWidth * 8
            "
        />

        <line
            v-for="tick in minuteSections"
            :key="tick"
            :class="tick == 5 ? `Grid__rules` : `Grid__section-delineator`"
            :y1="-dimensions.boundedHeight"
            :y2="xTickOffset"
            :x1="
                tick < 60
                    ? xscales.mins55(tick)
                    : tick <= 240
                    ? xscales.mins30(tick) + dimensions.sectionWidth
                    : tick <= 360
                    ? xscales.mins120(tick) + dimensions.sectionWidth * 7
                    : xscales.mins360(tick) + dimensions.sectionWidth * 8
            "
            :x2="
                tick < 60
                    ? xscales.mins55(tick)
                    : tick <= 240
                    ? xscales.mins30(tick) + dimensions.sectionWidth
                    : tick <= 360
                    ? xscales.mins120(tick) + dimensions.sectionWidth * 7
                    : xscales.mins360(tick) + dimensions.sectionWidth * 8
            "
        />

        <g
            v-for="(tick, i) in minuteSections"
            :key="tick"
            :style="{
                transform: `translate(${
                    tick < 60
                        ? xscales.mins55(tick)
                        : tick <= 240
                        ? xscales.mins30(tick) + dimensions.sectionWidth
                        : tick <= 360
                        ? xscales.mins120(tick) + dimensions.sectionWidth * 7
                        : xscales.mins360(tick) + dimensions.sectionWidth * 8
                }px, ${xTickOffset}px)`,
            }"
        >
            <text :style="{transform: `translate(5px, 0)`}" class="Axis__tick">
                {{ hourLabels[i] }}
                <template v-if="hourLabels[i] == 5">
                    {{ ` min` }}
                </template>
                <template v-else>
                    &#8202; hour{{ hourLabels[i] != 1 ? `s` : "" }}
                </template>

                {{ hourLabels[i] == 12 ? ` +` : "" }}
            </text>
        </g>

        <!-- <g
            className="Axis__label__wrapper"
            :style="{transform: `translate(0, ${yRuleDistance / 2 - 4})`}"
        >
            <rect
                fill="white"
                :width="125"
                :height="xRuleDistance"
                :style="{transform: `translate(1, ${-xRuleDistance / 2 - 4})`}"
            />
            <text
                :style="{transform: `translate(${yRuleDistance / 3}, 0)`}"
                className="Axis__label"
            >
                {{ label }}
            </text>
        </g> -->
    </g>
</template>

<style lang="scss">
    .Axis {
    }
</style>
