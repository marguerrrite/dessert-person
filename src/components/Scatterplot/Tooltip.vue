<script>
    import {extent, min, max} from "d3";
    import utils from "@/scripts/utils.js";

    export default {
        name: "Tooltip",
        components: {},
        props: {
            data: {
                type: Object,
            },
            dimensions: {
                type: Object,
            },
            xRuleDistance: {
                type: Number,
            },
            locked: {
                type: Boolean,
                default: false,
            },
            flipped: {
                type: Boolean,
                default: false
            },
            noPointerEvents: {
                type: Boolean,
                default: false,
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
            title() {
                return this.data.recipe;
            },
        },
        methods: {},
        watch: {},
    };
</script>

<template>
    <div class="Tooltip">
        <div class="tooltip-contents" :class="{flipped: flipped}">
            <div class="title">
                {{ title }}
            </div>
            <div class="info">
                Level {{ Math.floor(data.difficulty) }}
            </div>
            <div class="info">
                Page {{ data.page }}
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .Tooltip {
        pointer-events: none;

        &:hover {
            pointer-events: none;
            cursor: pointer;
        }


        .tooltip-contents {
            background: var(--background-color);
            background: $dp-teal;
            border-radius: 4px;
            box-shadow: 0px 2px 2px 0px rgba($dp-dark, 0.1);
            padding: 0.2em 0.5em;
            border: 1px solid $dp-pink;
            transform: translate(8px, -10px);

            &.flipped {
                transform: translate(-104%, -10px);
            }
        }

        .title {
            font-size: 0.8em;
            font-weight: 600;
            color: white;
        }

        .info {
            font-size: 0.75em;
            color: white;
            opacity: 0.7;
        }
    }
</style>
