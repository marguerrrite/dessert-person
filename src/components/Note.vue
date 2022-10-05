<script>
    import {extent, min, max} from "d3";
    import utils from "@/scripts/utils.js";

    export default {
        name: "Note",
        components: {},
        props: {},
        data() {
            return {};
        },
        computed: {},
        methods: {
            setHasSeenNote() {
                this.$store.dispatch("setHasSeenNote", true);
            },
        },
        watch: {},
    };
</script>

<template>
    <div class="Note__container">
        <div class="Note">
            <h1>Hello! Quick note. <span>😊</span></h1>
            <h2>
                The <i>Dessert Person</i> cookbook is created by Claire Saffitz
                and designed by Mia Johnson.
            </h2>
            <h4 class="Note__links">
                <Link to="https://www.dessertperson.com/" do-open-in-new-tab>
                    <i>Dessert Person</i> Site &#8594;
                </Link>
                <Link to="https://www.miaajohnson.com/" do-open-in-new-tab>
                    Mia Johnson Site &#8594;
                </Link>
            </h4>
            <h4>
                I did not design this original scatter plot and have no
                affiliations with <i>Dessert Person</i> nor its design.
                <br />
                <br />
                This chart appears at the beginning of the cookbook, showcasing
                the relationships between recipe difficulty and recipe time.
            </h4>

            <Button class="Note__button" @click="setHasSeenNote">
                Got it!
            </Button>
            <div class="Note__mute">And mute note for 15 days</div>
        </div>
    </div>
</template>

<style lang="scss">
    .Note {
        &__container {
            background: rgba(blue, 0.95);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 4em 4em 6em;

            @media (max-width: 600px) {
                padding: 1em;
            }
        }

        max-width: 900px;
        min-height: 500px;
        width: 100%;
        border: 1px solid;
        color: white;
        padding: 2em 3em 3em;
        position: relative;
        display: flex;
        flex-direction: column;

        &:after {
            width: 5em;
            height: 5em;
            border-left: 1px solid;
            position: absolute;
            content: "";
            bottom: 0;
            right: 0;
            transform: translate(50%, 50%) rotate(45deg);
        }

        h1 span {
            font-size: 0.75em;
        }

        h2 {
            margin-bottom: 2.5em;
            line-height: 1.2;
        }

        @media (max-width: 600px) {
            h1 {
                font-size: 1.7em;
            }
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p {
            //font-family: "Space Mono", monospace;
        }

        h4 {
            line-height: 1.3;

            i {
                text-decoration: underline;
            }
        }

        &__links {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-gap: 2em;
        }

        &__button {
            margin-top: auto;
            //align-self: flex-end;
            width: 10em;
            font-size: 1em;
            position: relative;
            margin-top: 2em;
        }

        .button {
            width: 100%;
            padding: 1em 0;
            align-self: start;
            max-width: 10em;

            &:hover {
                background: var(--neon-green-600);
            }
        }

        &__mute {
            padding-top: 0.4em;
            //text-align: right;
            font-size: 0.7em;
            opacity: 0.7;
        }
    }
</style>
