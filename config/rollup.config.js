import * as p from 'path';
import * as fs from 'fs';
import { rollup } from 'rollup';
import buble from 'rollup-plugin-buble';
import filesize from 'rollup-plugin-filesize';
import hash from 'rollup-plugin-hash';
import uglify from 'rollup-plugin-uglify';
import cssnext from 'rollup-plugin-postcss';

const pack = JSON.parse(fs.readFileSync('./package.json'));
const EVENT = process.env.npm_lifecycle_event || '';

let plugins = [
   buble({
      transforms: {
         dangerousForOf: true
      }
   }),
   postcss({
      plugins: [
         cssnext()
      ]
   }),
];

if (process.env.NODE_ENV === 'development') {

} else if (process.env.NODE_ENV === 'production') {
   plugins.push(
      uglify({
         warnings: false,
         compress: {
            screw_ie8: true,
            dead_code: true,
            unused: true,
            drop_debugger: true,
            booleans: true
         },
         mangle: { screw_ie8: true }
      })
   )
   plugins.push(
      hash({
         manifestKey: 'build/main.min.js',
         dest: 'build/main.[hash].min.js',
         manifest: 'hash.json'
      })
   )
}

// this plugin needs to be last
plugins.push(filesize());

const copyright =
   '/*!\n' +
   ' * ' + pack.name + ' v' + pack.version + '\n' +
   ' * (c) ' + new Date().getFullYear() + ' ' + pack.author + '\n' +
   ' */';
const entry = p.resolve('src/client/app.js');
const dest = p.resolve(`build/main.${process.env.NODE_ENV === 'production' ? 'min.js' : 'js'}`);

const bundleConfig = {
   dest,
   format: 'umd',
   moduleName: 'OAuth',
   banner: copyright,
   sourceMap: false
};

let cache;
rollup({ entry, plugins, cache })
   .then(bundle => {
      bundle.write(bundleConfig);
      if (EVENT.includes('watch')) {
         cache = bundle;
      }
   })
   .catch(err => {
      console.log(err);
   });
