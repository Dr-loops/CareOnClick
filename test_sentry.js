
try {
    require('@sentry/nextjs');
    console.log('Success: @sentry/nextjs found');
} catch (e) {
    console.error('Error requiring @sentry/nextjs:', e);
}
