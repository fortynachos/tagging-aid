const { build } = require('esbuild');
const { promisify } = require('util');
const { promises } = require('fs');
const { copyFile, mkdir } = promises;
const { resolve } = require('path');
const rimraf = require('rimraf');
const { watch } = require('chokidar');
const removeDir = promisify(rimraf);
const vuePlugin = require('esbuild-vue');
const { sassPlugin } = require('esbuild-sass-plugin');
const { env } = process;

const { watch: shouldWatch } = env;

if (shouldWatch) {
    buildAndWatchTaggingAidExtension();
} else {
    buildTaggingAidExtension();
}

function updateLine(input, isBuiltInput = false) {
    const numberOfLines = (input.match(/\n/g) || []).length;
    process.stdout.write(`${input}\n`);
    if (isBuiltInput) {
        process.stdout.moveCursor(0, -numberOfLines);
    }
}

function generateBuildConfigs() {
    return [
        {
            entryPoints: {
                popup: 'src/popup/popup-main.js',
            },
            bundle: true,
            minify: false,
            plugins: [vuePlugin(), sassPlugin()],
            outdir: 'dist/popup',
            target: 'es6',
        },
        {
            entryPoints: {
                'preload-checks': 'src/content-scripts/preload-checks.js',
                'launch-designer': 'src/content-scripts/launch-designer.js',
                'core-main': 'src/content-scripts/core-main.js',
            },
            bundle: true,
            minify: false,
            plugins: [vuePlugin(), sassPlugin()],
            outdir: 'dist/content-scripts',
            target: 'es6',
        },
        {
            entryPoints: {
                'tagging-aid-ui': 'src/content-scripts/ui-main.js',
            },
            bundle: true,
            minify: false,
            plugins: [vuePlugin(), sassPlugin()],
            outdir: 'dist/public',
            target: 'es6',
        },
    ];
}

async function buildTaggingAidExtension({ watch = false } = {}) {
    try {
        await removeDir(resolve(__dirname, 'dist'));

        const buildConfigs = generateBuildConfigs();
        let buildPromises = buildConfigs.map((cfg) => {
            return build(cfg);
        });

        await Promise.all(buildPromises);

        await mkdir(resolve(__dirname, 'dist/icons'));
        await mkdir(resolve(__dirname, 'dist/public/images'));

        const fileBuildPromises = [
            copyFile(
                resolve(__dirname, 'src/chrome/manifest.json'),
                resolve(__dirname, 'dist/manifest.json')
            ),
            copyFile(
                resolve(__dirname, `src/chrome/icons/pendo_target_16.png`),
                resolve(__dirname, 'dist/icons/pendo_target_16.png')
            ),
            copyFile(
                resolve(__dirname, `src/chrome/icons/pendo_target_48.png`),
                resolve(__dirname, 'dist/icons/pendo_target_48.png')
            ),
            copyFile(
                resolve(__dirname, `src/chrome/icons/pendo_target_128.png`),
                resolve(__dirname, 'dist/icons/pendo_target_128.png')
            ),
            copyFile(
                resolve(__dirname, `src/chrome/icons/pendo_target.png`),
                resolve(__dirname, 'dist/public/images/pendo_target.png')
            ),
            copyFile(
                resolve(__dirname, 'src/popup/popup.html'),
                resolve(__dirname, 'dist/popup/popup.html')
            ),
            copyFile(
                resolve(__dirname, 'src/public/check-for-pendo.js'),
                resolve(__dirname, 'dist/public/check-for-pendo.js')
            ),
            copyFile(
                resolve(__dirname, 'src/public/launch-designer.js'),
                resolve(__dirname, 'dist/public/launch-designer.js')
            ),
            copyFile(
                resolve(__dirname, 'src/public/tagging-aid-ui.html'),
                resolve(__dirname, 'dist/public/tagging-aid-ui.html')
            ),
        ];

        await Promise.all(fileBuildPromises);
    } catch (err) {
        console.error(err);
        if (watch) return 1;

        process.exit(1);
    }
}

async function attemptBuildForWatch() {
    try {
        const start = new Date();
        const timerStart = start.getTime();
        const failure = await buildTaggingAidExtension({ watch: true });
        if (failure) return updateLine('Failed to build.');

        const timerEnd = Date.now();
        updateLine(
            `${start.toLocaleString()} - Built successfully in ${timerEnd -
                timerStart}ms.`,
            true
        );
    } catch (err) {
        console.error(err);
    }
}

function buildAndWatchTaggingAidExtension() {
    const watcher = watch(['src/**/*']);
    console.log('Watching files... \n');

    attemptBuildForWatch();
    watcher.on('change', () => {
        attemptBuildForWatch();
    });
}
