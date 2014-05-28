module('JSHint - .');
test('app.js should pass jshint', function() { 
  ok(false, 'app.js should pass jshint.\napp.js: line 21, col 10, \'a\' is defined but never used.\napp.js: line 20, col 52, \'$scope\' is defined but never used.\napp.js: line 24, col 52, \'$scope\' is defined but never used.\napp.js: line 33, col 38, \'attrs\' is defined but never used.\n\n4 errors'); 
});
