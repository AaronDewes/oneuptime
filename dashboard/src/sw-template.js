/* eslint-disable */
if ('function' === typeof importScripts) {
    importScripts(
        'https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js'
    );
    /* global workbox */
    if (workbox) {
        /* injection point for manifest files.  */
        workbox.precaching.precacheAndRoute([], {
            cleanURLs: false,
        });
    }
}
