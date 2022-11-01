<script>
    import {mapState} from "vuex";
    import utils from "@/scripts/utils.js";

    import {scaleLinear} from "d3";
    import {Delaunay} from "d3-delaunay";
    import Axis from "./Axis.vue";
    import Circles from "./Circles.vue";
    import CrossHairs from "./CrossHairs.vue";
    import Tooltip from "./Tooltip.vue";
    import {trigger} from "@vue/reactivity";

    export default {
        name: "Scatterplot",
        components: [Axis, Circles, CrossHairs, Tooltip],
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

                dataDots: [],
                totalDots: [],
                coordLookup: {},
                voronoiData: [],
                voronoiPaths: [],
                filteredDots: [],
                isMouseMove: false,
                currentHoveredCol: "",
                hoveredIndex: "",

                hoveredData: {
                    coords: {x: 0, y: 0},
                    data: {},
                    index: "",
                },

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
                    marginTop: 10,
                    marginRight: 40,
                    marginBottom: 125,
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
                data: state => state.data,
                lockedData: state => state.lockedData,
                selection: state => state.selection,
                recipes: state => state.recipes,
                doShowChapterColors: state => state.doShowChapterColors,
                doShowVoronoi: state => state.doShowVoronoi,
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

                if (window.screen.width < 601) {
                    this.dimensions.marginLeft = 20;
                    this.dimensions.marginBottom = 90;
                }

                this.$store.commit("setDimensions", this.dimensions);
                this.setScales();
            },
            setScales() {
                if (!this.data[0]) {
                    return;
                }
                this.yScale = scaleLinear()
                    .domain([this.yMax, 1])
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

                let data;
                if (this.selection.chapter) {
                    data = Object.values(this.data).filter(
                        recipe =>
                            utils.slugify(recipe.section) ==
                            this.selection.chapter
                    );
                } else {
                    data = Object.values(this.data);
                }
                this.totalDots = this.calculateDotCoords(this.data);
                this.dataDots = this.calculateDotCoords(data, true);
                this.setVoronoiData(this.dataDots);
            },
            setVoronoiData(dots) {
                let delaunay = Delaunay.from(
                    dots,
                    d => d.x,
                    d => d.y
                );

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
            processTitle(title) {
                let slug = title
                    .toLowerCase()
                    .replaceAll(" ", "-")
                    .replaceAll("'", "");
                slug = slug.replace(/(?:[^\w-.]+|_+)/g, " ");
                return slug;
            },
            calculateDotCoords(data, shouldSetCoords) {
                let dots = [];
                let coordLookup = {};

                data.forEach(row => {
                    let obj = {
                        x: this.xAccessorScaled(row),
                        y: this.yAccessorScaled(row),
                        title: row.recipe,
                        section: utils.slugify(row.section),
                    };
                    dots.push(obj);

                    if (shouldSetCoords) {
                        coordLookup[this.processTitle(row.recipe)] = obj;
                    }
                });

                if (shouldSetCoords) {
                    this.coordLookup = coordLookup;
                }

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

                let data = this.data;
                if (this.selection.chapter) {
                    data = data.filter(
                        row =>
                            utils.slugify(row.section) == this.selection.chapter
                    );
                }

                let closestDataPoint = data[closestIndex];

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
            changeRoute() {
                let query = {...this.$route.query};
                if (
                    !query["recipe"] ||
                    query["recipe"] != this.hoveredData.slug
                ) {
                    query["recipe"] = this.hoveredData.slug;
                    this.$router.push({query});
                } else {
                    query["recipe"] = undefined;
                    this.$router.push({query});
                }
            },
            toggleChapterColors() {
                this.$store.commit("toggleChapterColors");
            },
            toggleVoronoi() {
                this.$store.commit("toggleVoronoi");
            },
        },
        watch: {
            dataDots() {
                if (this.dataDots[0]) {
                    this.isLoaded = true;
                }
            },
            "$route.query": {
                immediate: true,
                deep: true,
                handler() {
                    let query = {...this.$route.query};
                    let selection = {...this.selection};
                    let recipe = query.recipe;

                    if (this.lockedData?.recipe != recipe) {
                        // set locked data and coords

                        let data = this.recipes[recipe];
                        this.lockedIndex = Object.keys(this.recipes).indexOf(
                            recipe
                        );

                        if (this.coordLookup[recipe]) {
                            this.lockedCoords = {
                                x: this.coordLookup[recipe].x,
                                y: this.coordLookup[recipe].y,
                            };
                        }

                        selection["recipe"] = recipe;

                        this.$store.dispatch("setLockedData", data);
                    } else if (!this.selection.recipe) {
                        // clear
                        this.lockedIndex = "";
                        this.lockedCoords = {x: 0, y: 0};
                    }

                    if (query.chapter) {
                        selection["chapter"] = utils.slugify(query.chapter);
                    }

                    if (query.other) {
                        selection["other"] = query.other;
                    }

                    this.$store.commit("setSelection", selection);

                    this.setScales();
                },
            },

            coordLookup: {
                handler() {
                    let query = {...this.$route.query};
                    let recipe = query.recipe;

                    if (this.lockedCoords.x == 0 && this.coordLookup[recipe]) {
                        this.lockedCoords = {
                            x: this.coordLookup[recipe].x,
                            y: this.coordLookup[recipe].y,
                        };
                    }
                },
            },
        },
        mounted() {
            this.setDimensions();
            this.resizeObserver = new ResizeObserver(
                utils.animationFrame(this.setDimensions)
            );
            this.resizeObserver.observe(this.$el);
        },
        beforeUnmount() {
            this.resizeObserver.disconnect();
        },
        components: {CrossHairs},
    };
</script>

<template>
    <div class="Scatterplot" ref="container">
        <div v-if="!isLoaded">Loading...</div>
        <div class="chart-header">
            <h2>Matrix</h2>
            <div class="actions">
                <div class="FilterBar__switch__container">
                    Chapter colors
                    <label class="FilterBar__switch">
                        <input
                            type="checkbox"
                            :value="doShowChapterColors"
                            @change="toggleChapterColors"
                        />
                        <div class="FilterBar__slider round"></div>
                    </label>
                </div>
                <div class="FilterBar__switch__container">
                    <div>
                        <UiTooltip neon position="bottom">
                            <template #toggle>Voronoi </template>
                            <template #contents>
                                <div>
                                    <Link
                                        do-open-in-new-tab
                                        to="https://en.wikipedia.org/wiki/Voronoi_diagram"
                                        >From wikipedia:</Link
                                    >
                                    <p>
                                        A Voronoi diagram is a partition of a
                                        plane into regions close to each of a
                                        given set of objects.
                                    </p>
                                    <p>
                                        I'm using this figure out the tooltip
                                        placement.
                                    </p>
                                    <p>
                                        <Link
                                            do-open-in-new-tab
                                            to="https://github.com/d3/d3-voronoi"
                                            >d3-voronoi</Link
                                        >
                                    </p>
                                </div>
                            </template>
                        </UiTooltip>
                    </div>
                    <label class="FilterBar__switch">
                        <input
                            type="checkbox"
                            :value="doShowVoronoi"
                            @change="toggleVoronoi"
                        />
                        <div class="FilterBar__slider round"></div>
                    </label>
                </div>
            </div>
        </div>

        <svg
            class="chart"
            :width="dimensions.width"
            :height="dimensions.height"
            @click="changeRoute"
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
                <Circles
                    v-if="isLoaded"
                    :data="dataDots"
                    :total-data="totalDots"
                    :dimensions="dimensions"
                />
                <g v-if="doShowVoronoi">
                    <path
                        v-for="(path, i) in voronoiPaths"
                        :key="path"
                        :d="path.d"
                        :fill-opacity="hoveredIndex == i ? '0.25' : '0'"
                        :fill="
                            hoveredIndex && hoveredIndex == i
                                ? '#da79ae'
                                : 'transparent'
                        "
                        stroke="#da79ae"
                        :strokeWidth="1"
                    />
                </g>

                <CrossHairs
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
                    class="Chart__listener listener"
                    :height="dimensions.boundedHeight"
                    :width="dimensions.boundedWidth"
                    @mousemove="onHover"
                    @mouseleave="onMouseLeave"
                    fill="transparent"
                    v-if="isLoaded"
                />
            </g>
        </svg>

        <Tooltip
            v-if="lockedData?.recipe"
            locked
            :no-pointer-events="!!lockedData"
            :data="lockedData"
            :style="{
                transform: `translate(${
                    dimensions.marginLeft + lockedCoords.x
                }px, ${dimensions.marginTop + lockedCoords.y}px)`,
            }"
            :flipped="lockedCoords?.x > dimensions.boundedWidth * 0.75"
            ref="lockedTooltip"
        />
        <Tooltip
            v-if="hoveredIndex"
            :data="hoveredData"
            :style="{
                transform: `translate(${
                    dimensions.marginLeft + hoveredCoords.x
                }px, ${dimensions.marginTop + hoveredCoords.y}px)`,
            }"
            :flipped="hoveredCoords?.x > dimensions.boundedWidth * 0.75"
            ref="hoveredTooltip"
        />

        <div class="decoration">
            <div
                v-for="tab in [1, 2, 3, 4]"
                :key="tab"
                class="corner-tab"
            ></div>
        </div>
    </div>
</template>

<style lang="scss">
    .Scatterplot {
        position: relative;
        height: 100%;
        max-height: 80vh;
        width: 100%;
        background: var(--background-color);
        border: 1em solid var(--background-color);
        border-radius: var(--border-radius);

        @media (max-height: 600px) {
            max-height: 90vh;
        }

        @media (max-height: 900px) {
            max-height: 50vh;
        }

        @media (max-height: 1200px) {
            max-height: 75vh;
        }

        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;

            .actions {
                display: flex;
                align-items: center;
                gap: 1em;
            }
        }

        h2 {
            // font-family: var(--juane);
            font-weight: 500;
            font-size: 1em;
            margin: 0;
            color: $dp-dark;

            font-family: var(--molitor);
            font-weight: 500;
            font-size: 1.3em;
            font-variation-settings: "opsz" 100, "wght" 255;
            letter-spacing: 0.01em;

            span {
                &._ {
                    opacity: 0;
                }
            }
        }

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
        min-width: 300px;
        max-width: 1700px;
        width: calc(100% + 1em);
        //margin-bottom: 2em;
        width: 100%;
        position: relative;

        .Chart__listener {
            z-index: 200;
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

        .Tooltip {
            position: absolute;
            top: 0;
            left: 0;
        }

        .corner-tab {
            width: 3em;
            height: 3em;
            position: absolute;
            top: -3em;
            left: -3em;
            z-index: 10;
            border-bottom: 1em solid rgb(17, 132, 147);
            border-bottom: 1em solid pink;
            border-right: 1em solid transparent;
            border-top: 1em solid transparent;
            border-left: 1em solid transparent;
            transform: rotate(-45deg);
            opacity: 0.5;

            &:nth-of-type(2) {
                right: -3em;
                left: unset;
                transform: rotate(45deg);
            }

            &:nth-of-type(3) {
                right: -3em;
                left: unset;
                bottom: -3em;
                top: unset;
                transform: rotate(135deg);
            }

            &:nth-of-type(4) {
                bottom: -3em;
                top: unset;
                transform: rotate(-135deg);
            }
        }

        .FilterBar {
            &__switch input {
                display: none;
            }

            &__slider {
                background-color: $dp-taupe;
                bottom: 0;
                cursor: pointer;
                left: 0;
                position: absolute;
                right: 0;
                top: 0;
                transition: 100ms;
            }

            &__slider:before {
                background-color: #fff;
                bottom: 4px;
                content: "";
                height: 19px;
                left: 4px;
                position: absolute;
                transition: 100ms;
                width: 19px;
            }

            &__slider.round {
                border-radius: 34px;
            }

            &__slider.round:before {
                border-radius: 20px;
            }

            &__switch {
                display: inline-flex;
                height: 26px;
                position: relative;
                width: 40px;
                transform: scale(0.75) translateY(2px);

                &__container {
                    display: flex;
                    align-items: center;
                    font-size: 0.85rem;
                    line-height: 1;

                    .toggle {
                        font-size: 0.85rem;
                        line-height: 1;
                        padding-bottom: 3px;
                    }
                }

                input:checked + .FilterBar__slider {
                    background-color: $dp-dark;
                }

                input:checked + .FilterBar__slider:before {
                    transform: translateX(12px);
                }
            }
        }

        .UiTooltip {
            .Tooltip-contents {
                padding-top: 1em;
                line-height: 1.3;
            }
        }
    }
</style>
