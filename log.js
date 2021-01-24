const Sentry = require('@sentry/node');
const { version } = require('./package.json');

Sentry.init({
	dsn: 'https://066bf6b764814b3995ce8b814cd190da@o509887.ingest.sentry.io/5604935',
	release: 'Accela@' + version,
	tracesSampleRate: 1.0,
	autoSessionTracking: true,
});

module.exports = Sentry;