let utils = {
    isInViewport(elem) {
        var distance = elem.getBoundingClientRect();
        return (
            distance.top >= 0 &&
            distance.left >= 0 &&
            distance.bottom <=
                (window.innerHeight || document.documentElement.clientHeight) &&
            distance.right <=
                (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    animationFrame: callback => {
        let currentCallback = null;
        return () => {
            window.cancelAnimationFrame(currentCallback);
            currentCallback = window.requestAnimationFrame(callback);
        };
    },
    debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        };
    },
    slugify(str) {
        let slug = str.toLowerCase().replaceAll(" ", "-").replaceAll("'", "");
        slug = slug.replace(/(?:[^\w-.]+|_+)/g, " ");
        return slug;
    },

    filters: {
        slugify: string => utils.slugify(string),
    },
};

export default utils;
