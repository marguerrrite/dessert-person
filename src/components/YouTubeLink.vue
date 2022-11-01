<script>
    import {mapState} from "vuex";
    import {extent, min, max} from "d3";
    import utils from "@/scripts/utils.js";

    export default {
        name: "YouTubeLink",
        components: {},
        props: {
            thumbnail: {
                type: String,
                required: true,
            },
            src: {
                type: String,
                required: true,
            },
            data: {
                type: Object,
                required: true,
            },
            title: {
                type: String,
                required: true
            },
            date: {
                type: [String, Date]
            }
        },
        data() {
            return {};
        },
        computed: {},
        methods: {},
        watch: {},
    };
</script>

<template>
    <Link class="YouTubeLink" do-open-in-new-tab :to="src" :title="title">
        <div class="image-container">
            <img :src="thumbnail" :alt="`${data.recipe} YouTube still.`" />
            <div class="youtube-icon">
                <svg
                    width="20"
                    height="14"
                    viewBox="0 0 20 14"
                    fill="none"
                >
                    <g clip-path="url(#clip0_85_15)">
                        <path
                            d="M19.5835 2.18627C19.353 1.32526 18.6763 0.648636 17.8153 0.418156C16.2545 0 10 0 10 0C10 0 3.74547 0 2.18637 0.418156C1.32532 0.648636 0.648666 1.32526 0.418176 2.18627C0 3.7453 0 7 0 7C0 7 0 10.2547 0.418176 11.8137C0.648666 12.6747 1.32532 13.3514 2.18637 13.5818C3.74547 14 10 14 10 14C10 14 16.2545 14 17.8136 13.5818C18.6747 13.3514 19.3513 12.6747 19.5818 11.8137C20 10.2547 20 7 20 7C20 7 20 3.7453 19.5835 2.18627Z"
                            fill="#FF0000"
                        />
                        <path
                            d="M7.99951 9.99955L13.1971 7.00002L7.99951 4.00049V9.99955Z"
                            fill="white"
                        />
                    </g>
                    <defs>
                        <clipPath id="clip0_85_15">
                            <rect width="20" height="14" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
            </div>
        </div>
        <div>
            <div class="title">
                {{ title }}
            </div>
            <div class="date" v-if="date">{{date}}</div>
        </div>
    </Link>
</template>

<style lang="scss">
    .YouTubeLink {
        width: 100%;
        background: #fff3f4;
        border: 1px solid #fbe9eb;
        color: #97484f;
        display: flex;
        gap: 0.75em;
        padding: 0.5em;
        align-items: center;
        text-decoration: none;

        &:hover {
            background: #fbe9eb;
        }

        .image-container {
            position: relative;
            border-radius: 2px;
            overflow: hidden;

            img {
                max-width: 6em;
                display: block;
            }

            .youtube-icon {
                position: absolute;
                left: 50%;
                margin-left: -0.75em;
                top: 0.3em;

                svg {
                    width: 1.5em;
                    height: 1.5em;
                }
            }
        }

        .title {
            font-weight: 500;
            word-break: break-all;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-size: 0.9em;
        }

        .date {
            color: #bb6e75;
            font-size: 0.75em;
            font-weight: 400;
        }
    }
</style>
