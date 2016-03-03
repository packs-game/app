'use strict';

describe('Controller: BackpackCtrl', function () {

  // load the controller's module
  beforeEach(module('packsApp'));

  var BackpackCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BackpackCtrl = $controller('BackpackCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
