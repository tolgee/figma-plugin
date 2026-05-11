#!/usr/bin/env node
import process from 'node:process';
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const isProd = !watch && process.env.NODE_ENV !== 'development';

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ['src-v2/main/main.ts'],
  outfile: 'dist/main.js',
  bundle: true,
  format: 'iife',
  target: 'es2020',
  platform: 'browser',
  minify: isProd,
  sourcemap: watch ? 'inline' : false,
  define: {
    'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
  },
  logLevel: 'info',
};

if (watch) {
  const ctx = await esbuild.context({
    ...options,
    plugins: [
      {
        name: 'rebuild-logger',
        setup(build) {
          build.onEnd((result) => {
            const ts = new Date().toLocaleTimeString();
            if (result.errors.length > 0) {
              console.log(`[${ts}] main.js rebuild failed with ${result.errors.length} error(s)`);
            } else {
              console.log(`[${ts}] main.js rebuilt successfully`);
            }
          });
        },
      },
    ],
  });
  await ctx.watch();
  console.log('Watching src-v2/main for changes...');
} else {
  await esbuild.build(options);
  console.log('Built dist/main.js');
}
