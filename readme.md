# Angular Async Ajax
AngularJS Async Ajax Request Wrapper

## Usage
#### Add 'asyncAjax' module to your angular app
```javascript
var myApp = angular.module('myApp', ['asyncAjax'])
```

#### get '$asyncAjax' Service to your controller
```javascript
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
    Wed Jul 01 2015 13:15:38 GMT+0900 (KST) :: asyncAjax:reqA:start
    Wed Jul 01 2015 13:15:38 GMT+0900 (KST) :: asyncAjax:reqA:progress
    Wed Jul 01 2015 13:15:38 GMT+0900 (KST) :: asyncAjax:reqB:start
    Wed Jul 01 2015 13:15:38 GMT+0900 (KST) :: asyncAjax:reqB:progress
    Wed Jul 01 2015 13:15:43 GMT+0900 (KST) :: asyncAjax:reqA:finished
    Wed Jul 01 2015 13:15:46 GMT+0900 (KST) :: asyncAjax:reqB:finished
    Wed Jul 01 2015 13:15:46 GMT+0900 (KST) :: asyncAjax:allOvered
```