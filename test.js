"use strict";
{
  const sg = require('./lib.js');
  const test = {
    run
  };

  module.exports = test;
  Object.assign( self, { test } );

  function run() {
    console.log("Running tests...");
    const result = sg.generalize( ['div a.hat', 'div a.bat' ] );
    console.log( result );
  }
}
