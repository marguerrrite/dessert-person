<script>
    import {extent, min, max, timeFormat, format} from "d3";
    import utils from "@/scripts/utils.js";

    export default {
        name: "Axis",
        components: {},
        props: {
            dimensions: {
                type: Object,
                required: true,
            },
            dimension: {
                type: String,
                default: "x",
            },
            label: {
                type: String,
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
                type: Function,
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
                isLoaded: false,
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
            formatTick() {
                if (this.dimension == "x") {
                    return this.format(",");
                }
            },
        },
        watch: {
            xscales() {
                if (this.xscales["mins55"]) {
                    this.isLoaded = true;
                }
            },
        },
        mounted() {},
    };
</script>

<template>
    <g
        class="Axis AxisHorizontal"
        v-if="dimension == 'x' && isLoaded"
        :style="{transform: `translate(0, ${dimensions.boundedHeight}px)`}"
    >
        <g>
            {/* Horiz Arrow Top */}
            <line
                :x1="`${dimensions.boundedWidth}`"
                :x2="`${dimensions.boundedWidth - arrowSize - 3}`"
                :y1="2"
                :y2="-arrowSize - 2"
                class="Axis__arrow Axis__line Axis__line--left horiz"
            />

            {/* Horiz Arrow Bottom */}
            <line
                :x1="`${dimensions.boundedWidth}`"
                :x2="`${dimensions.boundedWidth - arrowSize - 3}`"
                :y1="-2"
                :y2="arrowSize + 1"
                class="Axis__arrow Axis__line Axis__line--right horiz"
            />

            <line
                class="Axis__line"
                :x1="-xRuleDistance - 1.5"
                :x2="dimensions.boundedWidth"
            />
        </g>

        {/* Real fake Y axis */}
        <g>
            <g :style="{transform: `translate(0, ${yArrowOffset})px`}">
                {/* Vert Arrow Left */}
                <line
                    :x1="-xRuleDistance - 1"
                    :y1="-dimensions.boundedHeight"
                    :x2="-xRuleDistance* 1.7"
                    :y2="-dimensions.boundedHeight + arrowSize * 2 - 2"
                    class="Axis__arrow Axis__line Axis__line--left vert"
                />

                {/* Vert Arrow Right */}
                <line
                    :x1="-xRuleDistance - 3"
                    :y1="-dimensions.boundedHeight"
                    :x2="-arrowSize"
                    :y2="-dimensions.boundedHeight + arrowSize * 2 -2"
                    class="Axis__arrow Axis__line Axis__line--left vert"
                />
            </g>
            <line
                class="Axis__line"
                :x1="-xRuleDistance - 2"
                :y1="-dimensions.boundedHeight"
                :x2="-xRuleDistance - 2"
                :y2="2.5"
            />
        </g>

        <line
            v-if="isLoaded"
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
            v-if="isLoaded"
            v-for="(tick, i) in minuteSections"
            :style="{opacity: dimensions.boundedWidth < 900 && i % 2 == 0 ? 0 : 1}"
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
                opacity: dimensions.boundedWidth < 900 && i % 2 == 0 ? 0 : 1
            }"
        >
            <text :style="{transform: `translate(5px, 0)`}" class="Axis__tick x-tick">
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

        <g
            class="Axis__label__wrapper"
            :style="{transform: `translate(0px, 4px)`}"
        >
            <rect
                class="label-plate"
                :width="125"
                :height="xRuleDistance + 10"
                :style="{
                    transform: `translate(0px, -15px)`,
                }"
            />
            <text
                :style="{
                    transform: `translate(5px, 0px)`,
                }"
                class="Axis__label x-axis"
            >
                {{ label }}
            </text>
        </g>
    </g>
    <g v-if="dimension == 'y' && isLoaded" class="Axis AxisVertical">
        {/* Horizontal lines */}

        <line
            v-for="tick in levelRules"
            :key="tick"
            class="Grid__rules"
            :x1="-xRuleDistance"
            :x2="dimensions.boundedWidth"
            :y1="scale(tick)"
            :y2="scale(tick)"
        />

        <rect
            v-for="(tick, i) in ticks"
            :key="i"
            class="Grid__stripe"
            :width="dimensions.boundedWidth + xRuleDistance"
            :height="scale(ticks[1]) - scale(ticks[0])"
            :y="scale(tick)"
            :x="-xRuleDistance"
        />

        <template v-for="tick in ticks" :key="tick">
            <line
                v-if="tick != 1 && tick != 6"
                class="Grid__section-delineator"
                :x1="-dimensions.marginLeft"
                :x2="dimensions.boundedWidth"
                :y1="scale(tick)"
                :y2="scale(tick)"
            />
        </template>

        <text
            v-for="(tick, i) in ticks"
            :key="i"
            class="Axis__tick Axis__tick--difficulty"
            :style="{
                transform: `translate(
                        ${-xRuleDistance - dimensions.marginLeft / 2 + 5}px,
                        ${
                            scale(tick) +
                            3 -
                            (scale(ticks[0]) - scale(ticks[1])) / 2
                        }px)
                `,
            }"
        >
            {{ tick == 1 ? "" : tick - 1 }}
        </text>

        {/* "Difficulty" label */}
        <g
            class="Axis__label__wrapper"
            :style="{
                transform: `translate(${-xscales.mins55(minrules[1])}px, ${
                    dimensions.boundedHeight - yRuleDistance
                }px) rotate(-90deg)`,
            }"
        >
            <rect
                class="label-plate"
                :width="92"
                :height="xRuleDistance"
                :style="{
                    transform: `translate(1px, ${-xRuleDistance / 2 - 4}px)`,
                }"
            />
            <text
                :style="{transform: `translate(7px, 0px)`}"
                class="Axis__label"
            >
                {{ label }}
            </text>
        </g>
    </g>
</template>

<style lang="scss">
    .Axis {
        .label-plate {
            fill: var(--background-color);
        }
    }
</style>
