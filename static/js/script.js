
(function(angular) {

    'use strict';

    angular.module('myApp', ['asyncAjax'])

    .controller('myController', [

        '$scope', '$asyncAjax', '$http', '$q',

        function($scope, $asyncAjax, $http, $q) {

            var logRequestEvent = function(event) {
                $scope.requestLog += new Date() + ' :: ' + event.name + '\n';
            };

            var makeRequest = function(name, method, url) {
                return { 'name': name, 'method': method, 'url': url };
            };

            var arraySum = function() {
                return Array.prototype.slice.call(arguments).reduce(function(p, e) {
                    return p + e;
                });
            };

            // request json
            $scope.reqA = makeRequest('reqA', 'GET', '/dummyA');
            $scope.reqB = makeRequest('reqB', 'GET', '/dummyB');
            $scope.reqC = makeRequest('reqC', 'GET', '/dummyC');
            $scope.reqD = makeRequest('reqD', 'GET', '/dummyD');
            $scope.reqE = makeRequest('reqE', 'GET', '/dummyE');

            // http Promises
            var httpA = $http($scope.reqA).success(function(response) {
                $scope.resA = response;
            });

            var httpB = $http($scope.reqB).success(function(response) {
                $scope.resB = response;
            });

            var httpC = $http($scope.reqC).success(function(response) {
                $scope.resC = response;
            });

            var httpD = $http($scope.reqD).success(function(response) {
                $scope.resD = response;
            });

            var httpE = $http($scope.reqE).success(function(response) {
                $scope.resE = response;
            });

            // Queue
            var qAB = $q.all([httpA, httpB]).then(function(responses) {
                $scope.resAB = arraySum(responses[0].data.exec, responses[1].data.exec);
            });

            var qAC = $q.all([httpA, httpC]).then(function(responses) {
                $scope.resAC = arraySum(responses[0].data.exec, responses[1].data.exec);
            });

            var qADE = $q.all([httpA, httpC, httpE]).then(function(responses) {
                $scope.resADE = arraySum(responses[0].data.exec, responses[1].data.exec, responses[2].data.exec);
            });

            var qABD = $q.all([httpA, httpB, httpD]).then(function(responses) {
                $scope.resABD = arraySum(responses[0].data.exec, responses[1].data.exec, responses[2].data.exec);
            });

            var qBD = $q.all([httpB, httpD]).then(function(responses) {
                $scope.resBD = arraySum(responses[0].data.exec, responses[1].data.exec);
            });

            var qBE = $q.all([httpB, httpE]).then(function(responses) {
                $scope.resBE = arraySum(responses[0].data.exec, responses[1].data.exec);
            });

            var qABCDE = $q.all([httpA, httpB, httpC, httpD, httpE]).then(function(responses) {
                $scope.summary = arraySum(responses[0].data.exec, responses[1].data.exec);
            });

            $scope.initialize = function() {

                $scope.resA = undefined;
                $scope.resB = undefined;
                $scope.resC = undefined;
                $scope.resD = undefined;
                $scope.resE = undefined;
                $scope.resAB = undefined;
                $scope.resAC = undefined;
                $scope.resABD = undefined;
                $scope.resBD = undefined;
                $scope.resADE = undefined;
                $scope.resBE = undefined;

            };

            $scope.reload = function() {
                $asyncAjax.cancelPendingRequests();
                $scope.initialize();
            };

            $scope.summarize = function(event) {

                $scope.summary = arraySum(
                    $scope.resA.exec, $scope.resB.exec, $scope.resC.exec,
                    $scope.resD.exec, $scope.resE.exec);


                logRequestEvent(event);

                $scope.requestLog += new Date() + ' :: ' + 'jobs done.' + '\n';
            };

            // v0.0.3
            // $asyncAjax
            //     .whenStart(requestNames, logRequestEvent)
            //     .whenFinished(requestNames, logRequestEvent)
            //     .whenError(requestNames, logRequestEvent)
            //     .whenCanceled(requestNames, logRequestEvent)
            //     .whenAllFinished($scope.summarize);

            // var groupAB = [$scope.reqA.name, $scope.reqB.name];

            // $asyncAjax
            //     .when(groupAB)
            //         .start(logRequestEvent)
            //         .finished(logRequestEvent)
            //         .error(logRequestEvent)
            //         .canceled(logRequestEvent);

            $scope.requestLog = '';
            $scope.initialize();
        }
    ]);

})(angular);
