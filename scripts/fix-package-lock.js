#!/usr/bin/env node

// whatever npm does?! and for whatever this is needed..
// https://github.com/aragon/aragon-cli/blob/master/packages/aragon-cli/scripts/fix-lockfile
// https://github.com/aragon/aragon-cli/blob/master/docs-internal/Dependencies.md#regenerate-the-lockfiles

const fs = require('fs')

function replaceAll(string, mapObject) {
  const regex = new RegExp(Object.keys(mapObject).join('|'), 'gi')
  let occurrences = 0
  const result = string.replace(regex, matched => {
    occurrences++
    return mapObject[matched]
  })
  console.log(`[fix-lockfile] Replaced ${occurrences} occurrences.`)
  return result
}
async function fixLockfile(path, replacementMap) {
  const originalJson = require(path)
  const originalText = JSON.stringify(originalJson, null, 2)
  const fixedText = replaceAll(originalText, replacementMap)
  const fixedJson = JSON.parse(fixedText)
  await fs.writeFileSync(path, JSON.stringify(fixedJson, null, 2))
}
//

const LOCKFILE_PATH = '../package-lock.json'

const replacementMap = {
  //
  '"version": "github:ahultgren/async-eventemitter#fa06e39e56786ba541c180061dbf2c0a5bbf951c"':
    '"version": "0.2.3"',
  //
  '"from": "github:ahultgren/async-eventemitter#fa06e39e56786ba541c180061dbf2c0a5bbf951c"':
    '"resolved": "github:ahultgren/async-eventemitter#fa06e39e56786ba541c180061dbf2c0a5bbf951c"',
  //
  '"from": "async-eventemitter@github:ahultgren/async-eventemitter#fa06e39e56786ba541c180061dbf2c0a5bbf951c"':
    '"resolved": "github:ahultgren/async-eventemitter#fa06e39e56786ba541c180061dbf2c0a5bbf951c"',
  //
  '"async-eventemitter": "async-eventemitter@github:ahultgren/async-eventemitter#fa06e39e56786ba541c180061dbf2c0a5bbf951c"':
    '"async-eventemitter": "github:ahultgren/async-eventemitter#fa06e39e56786ba541c180061dbf2c0a5bbf951c"',
}

fixLockfile(LOCKFILE_PATH, replacementMap)
