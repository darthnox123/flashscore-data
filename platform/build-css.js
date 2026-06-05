const postcss = require('postcss')
const tailwind = require('@tailwindcss/postcss')
const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const src = resolve(__dirname, 'client/assets/css/app.css')
const out = resolve(__dirname, 'client/assets/css/styles.built.css')

postcss([tailwind()])
  .process(readFileSync(src, 'utf-8'), { from: src, to: out })
  .then(result => {
    writeFileSync(out, result.css)
    console.log(`Tailwind CSS built: ${result.css.length} bytes → ${out}`)
  })
  .catch(e => { console.error('build-css error:', e.message); process.exit(1) })
