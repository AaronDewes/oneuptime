/* eslint-disable */
const workboxBuild = require('workbox-build');

// NOTE: This should be run *AFTER* all your assets are built
const buildSW = () => {
    // This will return a Promise
    return workboxBuild
        .injectManifest({
            swSrc: 'src/sw-template.js', // this is your sw template file
            swDest: 'build/service-worker.js', // this will be created in the build step
            globDirectory: 'build',
            globPatterns: ['**/*.{js,css,html,png}'],
            dontCacheBustURLsMatching: new RegExp(".+.[a-f0-9]{20}..+|index.html"),
            exclude: [new RegExp("index.html")],
            skipWaiting: true,
        })
        .then(({ count, size }) => {
            // Optionally, log any warnings and details.
            return `${count} files will be precached, totaling ${size} bytes.`;
        });
};
buildSW();
