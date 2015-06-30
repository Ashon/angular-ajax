# Angular Async Ajax
AngularJS Async Ajax Request Wrapper

## Usage
- Add 'asyncAjax' module to your angular app

```js
var myApp = angular.module('myApp', ['asyncAjax'])
```

- get '$asyncAjax' Service to your controller

```js
myApp.controller('myController', [

    // controller dependencies
    '$scope', '$asyncAjax',

    // controller function
    function($scope, $asyncAjax) {

        // ajax request json
        var ajax = {
            name: 'helloAjax',
            method: 'GET',
            url: 'dummys/a.json'
        };

        var logRequestEvent = function(event) {
            $scope.requestLog += new Date() + ' ' + event.name + '\n';
        };

        $scope.requestLog = '';

        // bind controller event
        $asyncAjax
            .onStart(ajax.name, logRequestEvent)
            .onProgress(ajax.name, logRequestEvent)
            .onFinished(ajax.name, logRequestEvent)
            .onError(ajax.name, logRequestEvent);

        // request using asyncAjax
        $asyncAjax.asyncAjaxRequest(ajax,
            // when success
            function(response) {
                $scope.requestName = $asyncAjax.getCurrentRequestName();
                $scope.response = response;

            },
            // when error
            function(response) {
                console.log(response);

            },
            // request finished
            function(response) {
                console.log("hello");
            }
        );
    }
])
```