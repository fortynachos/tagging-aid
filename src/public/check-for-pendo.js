window.postMessage(
    {
        type: 'PRELOAD_CHECK',
        designerEnabled: !window.pendo
            ? false
            : !!window.pendo.designerEnabled || !!window.pendo.designerLaunched,
        pendoExists: !!(window.pendo && window.pendo.apiKey),
    },
    '*'
);
