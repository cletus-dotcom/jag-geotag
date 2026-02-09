/**
 * App-wide location accuracy settings for geo-tagging.
 * Change these to adjust how precise the app's GPS fixes are.
 */

/** Target horizontal accuracy in meters. App will try to get a fix this good or better. */
export const TARGET_ACCURACY_METERS = 5;

/** Max time (ms) to keep requesting a better fix before using the best we have. */
export const ACCURACY_WAIT_TIMEOUT_MS = 15000;
