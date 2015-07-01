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
        $scope.reqA = {
            name: 'reqA',
            method: 'GET',
            url: '/dummy'
        };

        // other ajax request
        $scope.reqB = {
            name: 'reqB',
            method: 'GET',
            url: '/dummy'
        };

        $scope.requestLog = '';

        // requests names
        var requestNames = [$scope.reqA.name, $scope.reqB.name];

        // controller initialize function
        $scope.initialize = function() {
            // send ajax request to server when initializing controller.
            $asyncAjax

                // send request A
                .request($scope.reqA, {
                    success: function(response) {
                        $scope.resA = response;
                    }
                })

                // send request B
                .request($scope.reqB, {
                    success: function(response) {
                        $scope.resB = response;
                    }
                });
        };

        // if request all of A and B is finished, summarize data from responses..
        $scope.summarize = function(event) {
            $scope.summary = $scope.resA.exec + $scope.resB.exec;
            logRequestEvent(event);
        };

        // bind event on async Ajax
        $asyncAjax
            .onStart(requestNames, logRequestEvent)
            .onProgress(requestNames, logRequestEvent)
            .onFinished(requestNames, logRequestEvent)
            .onError(requestNames, logRequestEvent)

            // when all requests is finished, execute summarize function.
            .onAllOver($scope.summarize);

        $scope.initialize();
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