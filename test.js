//-----------------------------------------------------------------------------
// Copyright (C) 2018 Hugo Castaneda
// Licensed under the MIT license.
// See LICENSE.md file in the project root for full license information.
//-----------------------------------------------------------------------------

'use strict'

const colors = require('colors')
const fs = require('fs')

const Storage = require('./index')

// ---------------------------------------------------------------
// ----------------------------------- TESTS DATA INTERNAL -------

let storage = null
let dir = __dirname+'/storage_data'

if(fs.existsSync(dir)) {
    fs.rmdirSync(dir)
}

let testMap = {}

// -------------------------------------------------------------------------------
// -------------------------------------- TESTS DEFINITION -----------------------

function beforeMethod() {

}

function afterMethod() {

}

// ----------------------------------------
testMap['INIT'] = {}
testMap['ENGINE'] = {}

testMap['INIT']['instanciate'] = async function() {

    let passed = true
    passed &= !fs.existsSync(dir)
    storage = new Storage(dir)
    passed &= fs.existsSync(dir)

    return passed
}

testMap['ENGINE']['key existance'] = async function() {

    let passed = ! storage.key_exists('data')
    passed &= ! storage.key_exists('kiki')
    passed &=  ! storage.key_exists('coucou')
    return passed

}

testMap['ENGINE']['create key'] = async function() {

    return storage.write_key('data',{hello:'world'})
}

testMap['ENGINE']['key existance 2'] = async function() {

    let passed = storage.key_exists('data')
    passed &= ! storage.key_exists('kiki')
    passed &=  ! storage.key_exists('coucou')
    return passed
}

testMap['ENGINE']['read key'] = async function() {

    let data = storage.read_key('data')
    let kiki = storage.read_key('kiki')

    return ('hello' in data) && kiki === null
}

testMap['ENGINE']['remove key'] = async function() {
    
    let passed = storage.key_exists('data')
    passed &= storage.remove_key('data')
    passed &= ! storage.remove_key('kiki')
    passed &=  ! storage.key_exists('data')

    return passed

}

testMap['INIT']['desinstanciate'] = async function() {

    fs.rmdirSync(dir)

    return ! fs.existsSync(dir)
}

// ----------------------------------------

// -------------------------------------------------------------------------------
// ---------------------------------------------------------------
// -------------------------------------------------- MAIN -------

// ---------------------------------------------------------------
async function unitTest(testName, testObj, preindent) {
  try {
    let passed = await testObj()
    let passedStr = passed?'PASSED'.green:'FAILED'.red
    console.log(preindent,'--',testName,':',passedStr)
    return passed?[1,0]:[0,1]
  }
  catch(error) {
    console.log(preindent,'--',testName,':','ERROR'.red)
    console.log('  ',('ERROR: '+error).red)
    return [0,1]
  }
}
async function multiTest(testName, testObj, preindent) {
  let newindent = preindent+'/'+testName
  let score = [0,0]
  for(let subTestName in testObj) {
    let subTestObj = testObj[subTestName]
    let subScore = await test(subTestName, subTestObj, newindent)
    score[0] += subScore[0]
    score[1] += subScore[1]
  }
  return score
}
async function test(testName, testObj, preindent) {
  preindent = preindent==undefined?'':preindent
  if(typeof(testObj) == typeof({}))
    return await multiTest(testName, testObj, preindent)
  else
    return await unitTest(testName, testObj, preindent)
}
// ------------------

async function initTests(testMap) {
  try {
    await beforeMethod()
  }
  catch(error) {
    console.log(('Error in the "before method": '+error).red)
    return null
  }
  let score = await test('Main tests',testMap)
  try {
    await afterMethod()
  }
  catch(error) {
    console.log(('Error in the "after method": '+error).red)
    return null
  }
  return score
}

function sortMap(testObj,testArgs) {
  if(testArgs.length == 0)
    return testObj
  let newTestObject = {}
  for(let subTestName in testObj) {
    let subTestObj = testObj[subTestName]
    if(testArgs.indexOf(subTestName)>-1) {
      newTestObject[subTestName] = subTestObj
    }
    else if(typeof(subTestObj) == typeof({})) {
      let newSubObject = sortMap(subTestObj,testArgs)
      if(Object.keys(newSubObject).length > 0)
        newTestObject[subTestName] = newSubObject
    }
  }
  return newTestObject
}

let testArgs = process.argv
testArgs.splice(0,2)
initTests(sortMap(testMap,testArgs)).then(function(fullScore) {

  if(fullScore == null) {
    console.log('\nError one test set'.red)
    return
  }

  let testPassedStr = fullScore[1]>0?
    (fullScore[0]==0?'FAILED'.red:'FAILED'.yellow):
    'PASSED'.green
  console.log('\nFull test:',testPassedStr)
  console.log('\nPASSED:',fullScore[0],'\nFAILED:',fullScore[1])

})