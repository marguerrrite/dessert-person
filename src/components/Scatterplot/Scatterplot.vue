<script>
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

    export default {
        name: "Scatterplot",
        components: [Axis],
        props: {
            yAccessor: {
                type: Function,
                default: d => parseInt(d.age_of_shooter),
            },
            xAccessor: {
                type: Function,
                default: d => new Date(d.date.toString()),
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
                currentHoveredIndex: "",
                currentHoveredData: {},
                currentHoveredCoords: {},

                currentLockedIndex: "",
                currentLockedCoords: {},

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
                    marginTop: 0,
                    marginRight: 10,
                    marginBottom: 50,
                    marginLeft: 60,
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
            yMax() {
                //return max(this.data, this.yAccessor);
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
                    header: true, // gives us a data object with the headers as key names
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

                this.isLoaded = true;
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
                        .range([0, this.dimensions.sectionWidth * this.colsPerSection[mins]]);
                });

                this.xScales = xScales;

                this.xRuleDistance = Math.abs(
                    this.xScale55mins(this.minVertRules[1]) -
                        this.xScale55mins(this.minVertRules[2])
                );

                this.yArrowOffset = this.xRuleDistance * 3;

                this.setVoronoiData(this.data);
            },
            setVoronoiData(dots) {
                // let delaunay = Delaunay.from(
                //     dots,
                //     d => d.x,
                //     d => d.y
                // );
                // let filteredDots = dots;
                // let voronoi = delaunay.voronoi([
                //     0,
                //     0,
                //     this.dimensions.boundedWidth,
                //     this.dimensions.boundedHeight,
                // ]);
                // let voronoiPaths = dots.map((d, i) => ({
                //     d: voronoi.renderCell(i),
                //     ...d,
                // }));
                // this.voronoiData = {dots, voronoiPaths, voronoi};
            },
            getXScale(val) {
                let totalCols = Object.values(this.colsPerSection).reduce(
                    function (a, b) {
                        return a + b;
                    }
                );

                let currentCol = Math.ceil(
                    val / (this.dimensions.boundedWidth / this.totalCols)
                );
                this.currentHoveredCol = currentCol;

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
                this.yScale(this.yAccessor(d));
            },
            calculateDotCoords(data) {
                let dots = [];

                data.forEach((row, rowIndex) => {
                    let obj = {
                        x: this.xAccessorScaled(row, rowIndex),
                        y: this.yAccessorScaled(row, rowIndex),
                    };
                    dots.push(obj);
                });

                return dots;
            },
        },
        watch: {
            data: {
                handler() {
                    if (this.data[0].date) {
                        this.setDimensions();
                    }
                },
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
    };
</script>

<template>
    <div class="Scatterplot" ref="container">
        <!-- <Tooltip
                currentHoveredData={currentHoveredData}
                currentHoveredCoords={currentHoveredCoords ? [currentHoveredCoords.x, currentHoveredCoords.y] : [dimensions.boundedWidth / 2, dimensions.boundedHeight]}
                dimensions={dimensions}
                data={currentHoveredData}
            /> -->

        <svg
            class="chart"
            :width="dimensions.width"
            :height="dimensions.height"
            v-if="isLoaded"
        >
            <g
                class="x-rules"
                :style="{
                    transform: `translate(${dimensions.marginLeft}px, ${dimensions.marginTop}px)`,
                }"
            >
                <rect
                    class="listener"
                    :x="dimensions.marginLeft"
                    :y="dimensions.marginTop"
                    :height="dimensions.boundedHeight"
                    :width="
                        dimensions.boundedWidth -
                        dimensions.marginLeft -
                        dimensions.marginRight
                    "
                    @onMouseMove="console.log()"
                    @onMouseLeave="console.log()"
                    @onClick="console.log()"
                />
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
            </g>
        </svg>
        <!-- 

                <Axis
                    dimension="x"
                    yScale={yScale}
                    minrules={minVertRules}
                    xscales={xScales}
                    numberOfTicks={10}
                    sectionwidth={sectionWidth}
                    label={'total minutes'}
                    levelRules={levelRules}
                    xRuleDistance={xRuleDistance}
                    yRuleDistance={yRuleDistance}
                    yRyleDistanceThrees={yRyleDistanceThrees}
                />
                <Axis
                    dimension="y"
                    minrules={minVertRules}
                    xscales={xScales}
                    scale={yScale}
                    label={'difficulty'}
                    numberOfTicks={5}
                    levelRules={levelRules}
                    xRuleDistance={xRuleDistance}
                    yRuleDistance={yRuleDistance}
                    yRyleDistanceThrees={yRyleDistanceThrees}
                />

                <Circles
                    dimensions={dimensions}
                    data={data}
                    dots={dataDots}
                    minrules={minVertRules}
                    xAccessor={xAccessorScaled}
                    yAccessor={yAccessorScaled}
                    parsedQueryParams={parsedQueryParams}
                    isLoaded={isLoaded}
                    currentHoveredData={currentHoveredData}
                    currentLockedData={currentLockedData}
                    sectionColors={sectionColors}
                    bookSections={bookSections}
                />

                <g transform={`
                    translate(${-xRuleDistance * 2.5}, ${yRuleDistance * 1.5})`}>
                    <text
                        className="ScatterPlot__title">
                        Dessert Person Recipes
                    </text>
                </g>

                <g style={{ opacity: !isLoaded ? 0 : 1, transition: `500ms ease-in-out all 200ms` }}>
                    {isMouseMove && (
                        // Vertical rule
                        <>
                            <rect
                                className="ScatterPlot__hovered-line ScatterPlot__hovered-line--vertical"
                                width="1"
                                height={dimensions.boundedHeight}
                                x={currentHoveredCoords.x}
                                style={{ opacity: (isMouseMove ? 1 : 0) }}
                            />
                        </>
                    )}
                    {isMouseMove && (
                        // Horizontal rule
                        <>
                            <rect
                                className="ScatterPlot__hovered-line ScatterPlot__hovered-line--vertical"
                                width={dimensions.boundedWidth}
                                height="1"
                                x={-xRuleDistance}
                                y={currentHoveredCoords.y}
                                style={{ opacity: (isMouseMove ? 1 : 0) }}
                            />
                            <Circle className="ScatterPlot__hovered-circle" cx={currentHoveredCoords.x} cy={currentHoveredCoords.y} r={5} />
                        </>
                    )}
                    {currentLockedCoords && (
                        <>
                            <rect
                                className="ScatterPlot__locked-line ScatterPlot__locked-line--vertical"
                                width={dimensions.boundedWidth}
                                height="1"
                                x={-xRuleDistance}
                                y={currentLockedCoords.y}

                            />
                            <rect
                                className="ScatterPlot__locked-line ScatterPlot__locked-line--vertical"
                                width="1"
                                height={dimensions.boundedHeight}
                                x={currentLockedCoords.x}
                            />
                            <Circle className="ScatterPlot__locked-circle" cx={currentLockedCoords.x} cy={currentLockedCoords.y} r={6} />
                        </>
                    )}

                    {parsedQueryParams.extra && parsedQueryParams.extra.includes("voronoi") && (
                        <>
                            {voronoiPaths && voronoiPaths.map((path, i) => (
                                <g key={i}>
                                    <path
                                        style={{ transition: `100ms ease-in-out all` }}
                                        d={path.d}
                                        fillOpacity={currentHoveredIndex == i ? "0.25" : "0"}
                                        fill={currentHoveredIndex == i ? "#da79ae" : "none"}
                                        stroke="#da79ae"
                                        strokeWidth={1} />
                                </g>
                            ))}
                        </>
                    )}
                </g>
            </Chart>

 -->
    </div>
</template>

<style lang="scss">
    .Scatterplot {
        height: 100%;
        max-height: 600px;
        width: 100%;
        //background: #383735;
        background: var(--red-orange-400);

        --royal-blue-700: #155da1;
        --forest-green-700: #25442e;
        --forest-green-500: #49875b;
        --forest-green-300: #a4c3ad;
        --forest-green-100: #dbe7de;
        --orange-500: #ff7102;

        --prior-signs-circles: var(--red-orange-800);
        --circles: rgba(black, 0.5);

        border: 1px solid;

        .listener {
            fill: transparent;
        }

        .chart {
            stroke-width: 1px;
            //stroke: red;
        }

        height: calc(90vh - 6em);
        min-height: 620px;
        min-width: 1000px;
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

            &:nth-of-type(even) {
                display: none;
            }

            &:first-of-type {
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
