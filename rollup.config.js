// @ts-check
import path from 'path';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
// import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';

const production = !process.env.ROLLUP_WATCH;

/** @type {Record<string, import('rollup').RollupOptions>} */
const configs = {
  bytemd: {
    input: 'src/index.js',
    external: [
      'codemirror',
      'codemirror/mode/markdown/markdown.js',
      'unified',
      'remark-parse',
      'remark-math',
      'rehype-parse'
    ],
    watch: {
      clearScreen: false
    }
  },
  'bytemd-react': {
    external: ['bytemd', 'react']
  },
  example: {
    input: 'src/main.js',
    output: [
      {
        format: 'es',
        dir: 'public/build/module'
      },
      {
        format: 'system',
        dir: 'public/build/nomodule'
      }
    ]
  },
  'plugin-highlight': {
    external: ['highlight.js']
  },
  'plugin-math': {
    external: ['katex']
  },
  'plugin-graphviz': {
    external: ['viz.js']
  },
  'plugin-mermaid': {
    external: ['mermaid', 'nanoid']
  },
  'plugin-twemoji': {
    external: ['twemoji']
  },
  'plugin-video-xgplayer': {
    external: ['xgplayer']
  }
};

Object.entries(configs).forEach(([k, v]) => {
  if (!v.input) {
    v.input = 'src/index.js';
  }
  v.input = path.resolve('packages', k, v.input);
  if (!v.output) {
    const pkg = require(`./packages/${k}/package.json`);
    v.output = [
      {
        format: 'es',
        file: pkg.module
      },
      {
        format: 'cjs',
        file: pkg.main
      }
    ];
  }
  v.output.forEach(output => {
    if (output.file) {
      output.file = path.resolve('packages', k, output.file);
    }
    if (output.dir) {
      output.dir = path.resolve('packages', k, output.dir);
    }
  });
  v.plugins = [
    svelte({ dev: !production }),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    globals(),
    builtins(),
    json(),
    production && terser(),
    visualizer()
  ];
  return v;
});

export default Object.values(configs);