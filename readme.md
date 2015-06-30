# Angular Async Ajax
AngularJS Async Ajax Request Wrapper

## Usage
#### Add 'asyncAjax' module to your angular app
```js
var myApp = angular.module('myApp', ['asyncAjax'])
```

#### get '$asyncAjax' Service to your controller
```js
myApp.controller('myController', [

    // controller dependencies
    '$scope', '$asyncAjax',

    // controller function
    function($scope, $asyncAjax) {

        var logRequestEvent = function(event) {
            $scope.requestLog += new Date() + ' :: ' + event.name + '\n';
        };

        // request json
        $scope.helloworldAjax = {
            name: 'helloAjax',
            method: 'GET',
            url: 'dummys/a.json'
        };

        $scope.bAjax = {
            name: 'bAjax',
            method: 'GET',
            url: 'dummys/b.json'
        };

        $scope.requestLog = '';

        $asyncAjax
            .onStart($scope.helloworldAjax.name, logRequestEvent)
            .onProgress($scope.helloworldAjax.name, logRequestEvent)
            .onFinished($scope.helloworldAjax.name, logRequestEvent)
            .onError($scope.helloworldAjax.name, logRequestEvent);

        $asyncAjax
            .onStart($scope.bAjax.name, logRequestEvent)
            .onProgress($scope.bAjax.name, logRequestEvent)
            .onFinished($scope.bAjax.name, logRequestEvent)
            .onError($scope.bAjax.name, logRequestEvent);

        $asyncAjax
            .onAllOver(logRequestEvent);

        $asyncAjax.asyncAjaxRequest($scope.helloworldAjax, {
            success: function(response) {
                $scope.currentRequest = $asyncAjax.getCurrentRequestName();
                $scope.response = response;
            },
            error: function(response) {
                console.log(response);
            },
            finished: function(response) {
                console.log("A finished");
            }
        });

        $asyncAjax.asyncAjaxRequest($scope.bAjax, {
            success: function(response) {
                $scope.arrayData = response;
            },
            error: function(response) {
                console.log(response);

            },
            finished: function(response) {
                console.log("B finished");
            }
        });
    }
])
```