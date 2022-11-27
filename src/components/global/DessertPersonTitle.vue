<script>
    export default {
        name: "DessertPersonTitle",
        components: {},
        props: {},
        data() {
            return {
                isHovered: false,
                shadowFill: "#00e101",
                gradientTransformDeg: 90,
            };
        },
        computed: {},
        methods: {},
    };
</script>

<template>
    <div class="DessertPersonTitle">
        <h1>D<span>essert</span> P<span>erson</span></h1>
    </div>
</template>

<style lang="scss">
    .DessertPersonTitle {
        h1 {
            font-family: var(--molitor);
            letter-spacing: 0.05em;
            font-weight: 600;
            font-size: 3.5em;
            color: var(--background-color);
            margin: 0.25em 0;
            font-variation-settings: "opsz" 100, "wght" 230;

            span {
                font-variation-settings: "opsz" 900, "wght" 235;
                font-size: 0.95em;
                padding-left: 3px;
                letter-spacing: 0.035em;
            }
        }
    }
</style>
