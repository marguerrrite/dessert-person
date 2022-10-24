<script>
    import {Head, useHead} from "@vueuse/head";
    import {timeDay} from "d3";
    import {mapState} from "vuex";
    export default {
        components: {
            Head,
        },
        props: {},
        data() {
            return {
                loading: false,
                localDataUrl: "./data/dessert-person-recipes.csv",
            };
        },
        computed: {
            ...mapState({
                mode: state => state.mode,
                data: state => state.data,
                recipes: state => state.recipes,
                hasSeenNote: state => state.hasSeenNote,
                localStorageKey: state => state.localStorageKey,
            }),
        },
        methods: {
            async initData() {
                this.$papa.parse(this.localDataUrl, {
                    download: true,
                    header: true,
                    error: (err, file, inputElem, reason) => {
                        console.log(reason);
                    },
                    complete: data => {
                        this.$store.dispatch("setData", data.data);
                    },
                });
            },
            checkNoteDate() {
                if (this.hasSeenNote.hasSeenNote) {
                    let shouldExpire = timeDay.count(new Date(this.hasSeenNote.expire), new Date());

                    if (shouldExpire > 0) {
                        this.$store.dispatch("setHasSeenNote", false);
                    }                    
                }
            },
        },
        async beforeMount() {
            this.initData();           
        },
        mounted() {
            this.checkNoteDate();
        }
    };
</script>

<template>
    <div class="app" theme="light">
        <!-- <div class="background-container">
            <img
                src="/images/background-marble.jpeg"
                alt="Pink, blue, black, and white colors mixed together forming a marble-like pattern."
            />
            <img
                class="pink-overlay"
                src="/images/background-marble-03.jpg"
                alt="Pink, mauve, and white colors mixed together forming a marble-like pattern."
            />
            <div class="img-attribution">
                Photos by
                <a
                    href="https://unsplash.com/@pawel_czerwinski?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
                    >Pawel Czerwinski</a
                >
            </div>
        </div> -->
        <Layout>
            <router-view :key="$route.path" />
        </Layout>
    </div>
</template>

<style lang="scss">
    .app,
    #app {
        width: 100%;
        height: 100%;

        .background-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;

            img {
                height: 100%;
            }

            .pink-overlay {
                position: absolute;
                top: 0;
                left: 0;
                opacity: 1;
                animation: fadeInOut 1s ease-in-out;
            }

            .img-attribution {
                position: absolute;
                bottom: 2em;
                left: 2em;
                color: white;
                font-size: 0.7em;
                opacity: 0.5;
            }
        }

        &.navless {
            .sidebar {
                display: none;
            }

            .app-content {
                margin-left: 0;
            }

            .internal-only {
                display: none;
            }
        }

        #tooltip-teleport {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            pointer-events: none;
        }

        .sidebar-header {
            padding-left: 1.25em;

            .WyndlyTitle {
                max-width: 9em;

                &:hover {
                    cursor: pointer;
                }
            }
        }

        .hidenav-button {
            margin-top: auto;
        }

        .sidebar-option {
            text-transform: capitalize;
        }

        .app-content {
            margin-left: 14em;
        }

        &[theme="dark"] {
            color: var(--text-base-color);
        }
    }
</style>
