<script>
    import {mapState} from "vuex";
    import utils from "@/scripts/utils.js";

    import {
        scaleLinear,
        scaleUtc,
        range,
        max,
        timeFormat,
        interpolateRdPu,
        interpolateCool,
    } from "d3";
    import {Delaunay} from "d3-delaunay";
    import Axis from "./Axis.vue";
    import Circles from "./Circles.vue";
    import MouseOvers from "./MouseOvers.vue";

    export default {
        name: "Scatterplot",
        components: [Axis, Circles, MouseOvers],
        props: {
            yAccessor: {
                type: Function,
                default: d => d.difficulty,
            },
            xAccessor: {
                type: Function,
                default: d => d.minutes,
            },
            title: {
                type: String,
                default: "",
            },
        },
        data() {
            return {
                isLoaded: false,
                localDataUrl: "./data/dessert-person-recipes.csv",
                data: [],
                dataDots: [],
                voronoiData: [],
                voronoiPaths: [],
                filteredDots: [],
                isMouseMove: false,
                currentHoveredCol: "",
                hoveredIndex: "",
                hoveredData: {},
                hoveredCoords: {x: 0, y: 0},
                lockedIndex: "",
                lockedCoords: {x: 0, y: 0},

                minuteSections: [
                    5, 60, 90, 120, 150, 180, 210, 240, 360, 720, 1080,
                ],
                mainLevels: [1, 2, 3, 4, 5],
                xRuleDistance: 0,
                yRuleDistance: 0,
                yRyleDistanceThrees: 0,
                yArrowOffset: 0,
                colsPerSection: {
                    mins55: 1,
                    mins30: 6,
                    mins120: 1,
                    mins360: 2,
                },
                dimensions: {
                    marginTop: 15,
                    marginRight: 40,
                    marginBottom: 90,
                    marginLeft: 70,
                    boundedWidth: 0,
                    boundedHeight: 0,
                    sectionWidth: 0,
                    height: 0,
                    width: 0,
                    axisOffset: 35,
                },
                yScale: scaleLinear(),
                xScales: {},
                xScale55mins: scaleLinear(),
                xScale30mins: scaleLinear(),
                xScale120mins: scaleLinear(),
                xScale360mins: scaleLinear(),
            };
        },
        computed: {
            ...mapState({
                lockedData: state => state.lockedData,
            }),
            yMax() {
                return 6;
            },
            minVertRules() {
                let verticalRuleMinutes = [];
                this.minuteSections.forEach((min, i) => {
                    let interval = (this.minuteSections[i + 1] - min) / 5 || 72;
                    // calc the minutes for each vertical rule (as the sections have varying timespans)
                    for (i = 0; i <= 5; i++) {
                        let totalMin = min + i * interval;
                        if (totalMin < 1080) verticalRuleMinutes.push(totalMin);
                    }
                });
                return verticalRuleMinutes;
            },
            levelRules() {
                let horizIntervals = [];
                this.mainLevels.forEach((level, i) => {
                    let defaultInterval = 1 / 7;
                    let levelThreeInterval = 1 / 8;
                    // calc the minutes for each vertical rule (as the sections have varying timespans)
                    for (i = 0; i <= 7; i++) {
                        if (level != 3) {
                            horizIntervals.push(level + i * defaultInterval);
                        } else {
                            horizIntervals.push(level + i * levelThreeInterval);
                        }
                    }
                });
                horizIntervals = horizIntervals.filter(
                    interval => interval < this.yMax
                );
                horizIntervals = [...new Set(horizIntervals)];
                if (horizIntervals[0] == 1) {
                    horizIntervals.splice(0, 1);
                }
                return horizIntervals;
            },
        },
        methods: {
            async loadData() {
                this.$papa.parse(this.localDataUrl, {
                    download: true,
                    header: true,
                    error: (err, file, inputElem, reason) => {
                        console.log(reason);
                    },
                    complete: data => {
                        this.processData(data.data);
                    },
                });
            },
            processData(data) {
                this.data = data;
                this.setDimensions();
            },
            setDimensions() {
                let box = this.$refs.container?.getBoundingClientRect();
                this.dimensions.width = box.width;
                this.dimensions.height = box.height;
                this.dimensions.boundedHeight =
                    box.height -
                    this.dimensions.marginTop -
                    this.dimensions.marginBottom;
                this.dimensions.boundedWidth =
                    box.width -
                    this.dimensions.marginLeft -
                    this.dimensions.marginRight;
                this.dimensions.sectionWidth =
                    this.dimensions.boundedWidth /
                    Object.values(this.colsPerSection).reduce(
                        (a, b) => a + b,
                        0
                    );
                this.setScales();
            },
            setScales() {
                if (!this.data[0]) {
                    return;
                }
                this.yScale = scaleLinear()
                    .domain([1, this.yMax])
                    .range([0, this.dimensions.boundedHeight]);
                this.yRuleDistance =
                    this.yScale(this.levelRules[1]) -
                    this.yScale(this.levelRules[2]);
                this.yRyleDistanceThrees = Math.abs(
                    this.yScale(this.levelRules[16]) -
                        this.yScale(this.levelRules[17])
                );
                let xScales = {};
                let xDomains = [
                    [5, 60],
                    [60, 240],
                    [240, 360],
                    [360, 1080],
                ];
                Object.keys(this.colsPerSection).forEach((mins, i) => {
                    xScales[mins] = scaleLinear()
                        .domain(xDomains[i])
                        .range([
                            0,
                            this.dimensions.sectionWidth *
                                this.colsPerSection[mins],
                        ]);
                });
                this.xScales = xScales;
                this.xRuleDistance = Math.abs(
                    this.xScales["mins55"](this.minVertRules[1]) -
                        this.xScales["mins55"](this.minVertRules[2])
                );
                this.yArrowOffset = this.xRuleDistance * 3;
                this.dataDots = this.calculateDotCoords(this.data);
                this.setVoronoiData(this.dataDots);
            },
            setVoronoiData(dots) {
                let delaunay = Delaunay.from(
                    dots,
                    d => d.x,
                    d => d.y
                );
                let filteredDots = dots;
                let voronoi = delaunay.voronoi([
                    0,
                    0,
                    this.dimensions.boundedWidth,
                    this.dimensions.boundedHeight,
                ]);
                let voronoiPaths = dots.map((d, i) => ({
                    d: voronoi.renderCell(i),
                    ...d,
                }));
                this.voronoiData = {dots, voronoiPaths, voronoi};
                this.voronoiPaths = voronoiPaths;
            },
            getXScale(val) {
                let scale;
                // # Invert Formula
                // scale.invert - (sectionWidth * [sections before scale])
                // maybe make something that getsScale AND shifts sections? ToDo
                if (this.currentHoveredCol == 1) {
                    scale = this.xScales.mins55;
                } else if (this.currentHoveredCol <= 7) {
                    scale = this.xScales.mins30;
                } else if (this.currentHoveredCol == 8) {
                    scale = this.xScale120mins;
                } else {
                    scale = this.xScale360mins;
                }
                return scale;
            },
            xAccessorScaled(d) {
                return this.xAccessor(d) <= 60
                    ? this.xScales.mins55(this.xAccessor(d))
                    : this.xAccessor(d) <= 240
                    ? this.xScales.mins30(this.xAccessor(d)) +
                      this.dimensions.sectionWidth
                    : this.xAccessor(d) <= 360
                    ? this.xScales.mins120(this.xAccessor(d)) +
                      this.dimensions.sectionWidth * 7
                    : this.xScales.mins360(this.xAccessor(d)) +
                      this.dimensions.sectionWidth * 8;
            },
            yAccessorScaled(d) {
                return this.yScale(this.yAccessor(d));
            },
            calculateDotCoords(data) {
                let dots = [];
                data.forEach(row => {
                    let obj = {
                        x: this.xAccessorScaled(row),
                        y: this.yAccessorScaled(row),
                    };
                    dots.push(obj);
                });
                return dots;
            },
            onHover($event) {
                this.isMouseMove = true;
                let x =
                    $event.clientX -
                    $event.currentTarget.getBoundingClientRect().x;
                let y =
                    $event.clientY -
                    $event.currentTarget.getBoundingClientRect().y;
                let totalCols = Object.values(this.colsPerSection).reduce(
                    function (a, b) {
                        return a + b;
                    }
                );
                let currentCol = Math.ceil(
                    x / (this.dimensions.boundedWidth / totalCols)
                );
                this.currentHoveredCol = currentCol;
                let correctXScale = this.getXScale(x);
                let closestIndex = this.voronoiData.voronoi.delaunay.find(x, y);
                let closestDataPoint = this.data[closestIndex];
                let hoveredData = closestDataPoint;
                let hoveredCoords = this.dataDots[closestIndex];
                this.hoveredIndex = closestIndex;
                this.hoveredData = hoveredData;
                this.hoveredCoords = hoveredCoords;
            },
            onMouseLeave($event) {
                this.currentHoveredCol = "";
                this.hoveredIndex = "";
                this.hoveredData = {};
                this.hoveredCoords = {x: 0, y: 0};
            },
            setLockedCoords($event) {
                if (
                    !this.lockedIndex ||
                    this.lockedIndex != this.hoveredIndex
                ) {
                    this.lockedCoords = {...this.hoveredCoords};
                    this.lockedIndex = this.hoveredIndex;
                    this.$store.dispatch("setData", this.hoveredData);
                } else {
                    this.currentLocedCoords = {x: 0, y: 0};
                    this.lockedIndex = "";
                    this.$store.dispatch("setData", {});
                }
            },
        },
        watch: {
            dataDots() {
                if (this.dataDots[0]) {
                    this.isLoaded = true;
                }
            },
        },
        async mounted() {
            await this.loadData();
            this.resizeObserver = new ResizeObserver(
                utils.animationFrame(this.setDimensions)
            );
            this.resizeObserver.observe(this.$el);
        },
        beforeUnmount() {
            this.resizeObserver.disconnect();
        },
        components: {MouseOvers},
    };
</script>

<template>
    <div class="Scatterplot" ref="container">
        <div v-if="!isLoaded">Loading...</div>
        <!-- <Tooltip
                hoveredData={hoveredData}
                hoveredCoords={hoveredCoords ? [hoveredCoords.x, hoveredCoords.y] : [dimensions.boundedWidth / 2, dimensions.boundedHeight]}
                dimensions={dimensions}
                data={hoveredData}
            /> -->

        <svg
            class="chart"
            :width="dimensions.width"
            :height="dimensions.height"
            @click="setLockedCoords"
        >
            <g
                class="x-rules"
                :style="{
                    transform: `translate(${dimensions.marginLeft}px, ${dimensions.marginTop}px)`,
                }"
            >
                <Axis
                    dimension="x"
                    :dimensions="dimensions"
                    :y-scale="yScale"
                    :minrules="minVertRules"
                    :xscales="xScales"
                    :number-of-ticks="10"
                    label="total minutes"
                    :level-rules="levelRules"
                    :x-rule-distance="xRuleDistance"
                    :y-rule-distance="yRuleDistance"
                    :y-ryle-distanceThrees="yRyleDistanceThrees"
                />
                <Axis
                    dimension="y"
                    :scale="yScale"
                    :dimensions="dimensions"
                    :y-scale="yScale"
                    :minrules="minVertRules"
                    :xscales="xScales"
                    :number-of-ticks="5"
                    label="difficulty"
                    :level-rules="levelRules"
                    :x-rule-distance="xRuleDistance"
                    :y-rule-distance="yRuleDistance"
                    :y-ryle-distanceThrees="yRyleDistanceThrees"
                />
                <Circles v-if="isLoaded" :data="dataDots" />
                <g v-if="voronoiPaths[0]">
                    <path
                        v-for="(path, i) in voronoiPaths"
                        :key="path"
                        :d="path.d"
                        :fillOpacity="hoveredIndex == i ? '0.25' : '0'"
                        :fill="hoveredIndex == i ? '#da79ae' : 'transparent'"
                        stroke="#da79ae"
                        :strokeWidth="1"
                    />
                </g>

                <MouseOvers
                    :hovered-data="{
                        hoveredCoords,
                        hoveredData,
                        hoveredIndex,
                    }"
                    :locked-data="{
                        lockedCoords,
                        lockedData,
                        lockedIndex,
                    }"
                    :dimensions="dimensions"
                    :x-rule-distance="xRuleDistance"
                />

                <rect
                    class="listener"
                    :height="dimensions.boundedHeight"
                    :width="dimensions.boundedWidth"
                    @mousemove="onHover"
                    @mouseleave="onMouseLeave"
                    fill="transparent"
                    v-if="isLoaded"
                />
            </g>
        </svg>
    </div>
</template>

<style lang="scss">
    .Scatterplot {
        height: 100%;
        max-height: 600px;
        width: 100%;
        //background: #383735;
        background: white;
        border: 1em solid white;
        border-radius: var(--border-radius);

        --royal-blue-700: #155da1;
        --forest-green-700: #25442e;
        --forest-green-500: #49875b;
        --forest-green-300: #a4c3ad;
        --forest-green-100: #dbe7de;
        --orange-500: #ff7102;

        --prior-signs-circles: var(--red-orange-800);
        --circles: rgba(black, 0.5);

        .listener {
            //fill: transparent;
            &:hover {
                cursor: pointer;
            }
        }

        .chart {
            stroke-width: 1px;
            //stroke: red;
        }

        height: calc(90vh - 6em);
        min-height: 620px;
        min-width: 300px;
        max-width: 1700px;
        width: calc(100% + 1em);
        //margin-bottom: 2em;
        width: 100%;
        position: relative;

        .Chart__listener {
            &:hover {
                cursor: pointer;
            }
        }

        &Context {
            height: 100px;
        }

        path {
            transition: all 400ms ease-out;
        }

        &__title {
            font-size: 3em;
            font-style: italic;
            font-weight: 600;
            fill: saturate(darken($dp-pink, 16%), 5%);
        }

        // svg text {
        //     fill: #969696;
        // }

        .filters__container {
            padding: 2em 4.5rem;
        }

        .Axis__label {
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.08em;
            fill: $dp-dark;

            &__wrapper {
            }
        }

        .y-axis-label {
            font-size: 0.9em;
            text-anchor: middle;
            transform: rotate(-90deg);
        }

        .axis {
            color: #e0e0e0;
        }

        .tick {
            color: #e0e0e0;
        }

        .Axis__tick {
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.08em;
            fill: $dp-dark;
            font-size: 0.9em;

            &--difficulty {
                font-size: 0.9em;
                font-weight: 700;
                fill: $dp-dark;
            }

            @media (max-width: 1000px) {
                font-size: 0.7em;
                font-weight: 500;
            }
        }

        .Grid__section-delineator {
            stroke: $dp-pink;
            stroke-width: 1.5;
        }

        .Grid__rules {
            stroke: $dp-grids;
            stroke-width: 1;
        }

        .Grid__stripe {
            fill: rgba($dp-taupe, 0.2);
            fill: $dp-stripe;

            &:nth-of-type(odd) {
                display: none;
            }

            &:first-of-type,
            &:last-of-type {
                display: none;
            }
        }

        .AxisHorizontal,
        .AxisVertical {
            font-size: 0.8em;

            .Axis__line {
                stroke: $dp-pink;
                stroke-width: 5;
            }
        }

        .Line {
            &--type {
                &-line {
                    fill: none;
                    stroke-width: 1.5px;
                    stroke-linecap: round;
                }
            }

            &--exercise {
                &-0 {
                    stroke: $paradiddle-green;
                }
                &-1 {
                    stroke: $paradiddle-purple;
                }
                &-2 {
                    stroke: $paradiddle-blue;
                }
                &-3 {
                    stroke: $paradiddle-orange;
                }
            }

            &--isDimmed {
                opacity: 0.175;
            }
        }

        .Circles {
            &__circle {
                //fill: rgba($dp-dark, 0.45);
                transition: 600ms linear all;

                &--hovered {
                    //fill: rgba($dp-dark, 0.85);
                }
            }
        }

        .Circle {
            transition: all 100ms ease-out;
            pointer-events: none;

            &__label {
                font-size: 0.55rem;
                fill: $dp-dark;
                transition: 50ms linear all;
                transform: translate(50%, 50%);
                background: white;
                padding: 5px;
                opacity: 0.5;

                &--active {
                    transition: 50ms linear all;
                    opacity: 1;
                    fill: darken($dp-dark, 10%);
                }
            }
        }

        &__hovered-line {
            fill: rgba($dp-dark, 0.7);
            transition: all 100ms ease-out;
            pointer-events: none;
        }

        &__hovered-circle {
            fill: rgba($dp-dark, 0.45);
            transition: all 100ms ease-out;
            pointer-events: none;
        }

        &__locked-line {
            fill: rgba($dp-dark, 0.45);
            transition: all 100ms ease-out;
            pointer-events: none;
        }

        &__locked-circle {
            stroke-width: 3;
            fill: none;
            stroke: rgba($dp-dark, 0.45);
            transition: all 100ms ease-out;
            pointer-events: none;
        }

        .Tooltip {
            &__container {
                position: absolute;
                top: 0;
                left: 0;
                width: 16em;
                transform: translate(4px, 4px);
                padding: 0.4rem 0.6rem 0.5em;
                background: #fff;
                line-height: 1.4em;
                z-index: 10;
                transition: all 50ms ease-out;
                pointer-events: none;
                box-shadow: 0px 2px 9px rgba(0, 0, 0, 0.1);
                border-radius: 4px;
                background: #323747;
                color: #fbfbfb;
                font-size: 0.85em;
                line-height: 1.5;
            }

            &__title {
                font-weight: 600;
                line-height: 1.2;
                margin-bottom: 0.25em;
            }

            &__level {
                font-size: 0.8em;
                opacity: 0.85;
            }

            &__time {
                font-size: 0.8em;
                opacity: 0.85;
                display: flex;
                align-items: flex-start;

                &__icon {
                    margin-right: 0.5em;
                    transform: translateY(2px);
                }
            }
        }
    }
</style>
