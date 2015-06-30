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
#### Request Result
```
# Current Req Name
    bAjax
# A Req
    {"name":"helloAjax","method":"GET","url":"dummys/a.json","timeout":{}}
# A Data
    {"data":{"hello":"world"}}
# B Req
    {"name":"bAjax","method":"GET","url":"dummys/b.json","timeout":{}}
# B Data
    {"data":[1,2,3,4]}
# Broadcast Log
    Tue Jun 30 2015 19:56:35 GMT+0900 (KST) :: asyncAjax:helloAjax:start
    Tue Jun 30 2015 19:56:35 GMT+0900 (KST) :: asyncAjax:helloAjax:progress
    Tue Jun 30 2015 19:56:35 GMT+0900 (KST) :: asyncAjax:bAjax:start
    Tue Jun 30 2015 19:56:35 GMT+0900 (KST) :: asyncAjax:bAjax:progress
    Tue Jun 30 2015 19:56:35 GMT+0900 (KST) :: asyncAjax:helloAjax:finished
    Tue Jun 30 2015 19:56:35 GMT+0900 (KST) :: asyncAjax:bAjax:finished
    Tue Jun 30 2015 19:56:35 GMT+0900 (KST) :: asyncAjax:allOvered
```