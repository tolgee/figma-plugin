#!/usr/bin/env node
import process from 'node:process';
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const isProd = !watch && process.env.NODE_ENV !== 'development';

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ['src/main/main.ts'],
  outfile: 'dist/main.js',
  bundle: true,
  // Figma's plugin sandbox is a QuickJS host whose syntactical surface is
  // ES2017. Features like optional chaining (`?.`), nullish coalescing (`??`),
  // and logical assignment operators (`??=`, `||=`, `&&=`) are ES2020+ and
  // surface as "Unexpected token {" in QuickJS. `target: 'es2017'` makes
  // esbuild down-level them to equivalent ES2017 code.
  format: 'cjs',
  target: 'es2017',
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
  console.log('Watching src/main for changes...');
} else {
  await esbuild.build(options);
  console.log('Built dist/main.js');
}
