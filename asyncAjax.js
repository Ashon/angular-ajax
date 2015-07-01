/**
 *   AngularJS AsyncAjax v0.0.3
 *
 *   @author
 *       ashon
 *
 *   @licence
 *       MIT Licenced.
 */

(function(angular) {

    'use strict';

    // ajax request constants
    var BROADCAST_PREFIX = 'asyncAjax';

    var MSG_DELIMITER = ':';

    var REQUEST_STATUS = {
        START: 'start',
        FINISHED: 'finished',
        ALLFINISHED: 'allFinished',
        ERROR: 'error',
        CANCELED: 'canceled'
    };

    var getBroadCastName = function(status, requestName) {

        var logItems = [BROADCAST_PREFIX];

        if(requestName)
            logItems.push(requestName);
        logItems.push(status);

        return logItems.join(MSG_DELIMITER);
    };

    var isFunction = function(fn) {
        return fn && typeof(fn) === 'function';
    };

    // Ajax Request Service Module
    angular.module('asyncAjax', [])

    // $ajaxRequest angular Service
    .service('$asyncAjax', [

        // $ajaxRequest service dependencies
        '$rootScope', '$http', '$q',

        function($rootScope, $http, $q) {
            var service = this;

            // async task Queue
            var asyncQueue = $q.when(true);

            var taskCanceler = $q.defer();

            var countInProgress = 0;

            var broadcastStatus = function(status, requestName) {
                var msg = getBroadCastName(status, requestName);
                $rootScope.$broadcast(msg);
            };

            // asynchronous request queue
            var registerAsyncTask = function(task) {

                asyncQueue = asyncQueue.then(function() {
                    return task;
                });

                return asyncQueue;
            };

            // ajax request
            var ajaxRequest = function(json, success, error, finished) {

                // deepcopy ajax json object
                var ajaxJson = JSON.parse(JSON.stringify(json));

                // error wrapper
                var whenError = function(data, status, headers, config) {
                    // error by canceler
                    if(status === 0) {
                        broadcastStatus(REQUEST_STATUS.CANCELED, ajaxJson.name);
                    } else {
                        if(isFunction(error))
                            error(data, status, headers, config);
                        // broadcasts when failed from prism_fe.. (not spectrum_API)
                        broadcastStatus(REQUEST_STATUS.ERROR, ajaxJson.name);
                    }

                    countInProgress--;
                };

                // finished wrapper
                var whenFinished = function(response) {
                    if(isFunction(finished))
                        finished(response);

                    broadcastStatus(REQUEST_STATUS.FINISHED, ajaxJson.name);

                    // if request finished, then decrease request count
                    countInProgress--;

                    // check the count and broadcast
                    if(countInProgress === 0)
                        broadcastStatus(REQUEST_STATUS.ALLFINISHED);
                };

                if(ajaxJson.timeout === undefined)
                    ajaxJson.timeout = taskCanceler.promise;

                countInProgress++;

                broadcastStatus(REQUEST_STATUS.START, ajaxJson.name);

                // bind status handler & return
                return $http(ajaxJson)
                    .success(success)
                    .error(whenError)
                    .then(whenFinished);
            };

            /**
             * @name
             *     cancelPendingRequests
             *
             * @description
             *     Cancel all pending requests.
             *     taskCanceler : timeout promise in asyncAjax.registerAsyncTask
             *     When this function call, resolves all requests force timeout event.
             */
            this.cancelPendingRequests = function() {
                // resolve cancler
                taskCanceler.resolve();
                // revolve
                taskCanceler = $q.defer();

                return service;
            };

            /**
             * @name
             *     request
             *
             * @description
             *     AjaxRequestService's asynchronous ajax request.
             *
             * @returns
             *     <$http> registerAsyncTask :
             */
            this.request = function(json, requestHandler) {
                registerAsyncTask(
                    ajaxRequest(json,
                        requestHandler.success,
                        requestHandler.error,
                        requestHandler.finished
                    )
                );

                return service;
            };

            /**
             * @name
             *     then
             *
             * @description
             *     Facade of Async Queue Promise's then().
             */
            this.then = function(task) {
                asyncQueue.then(task);

                return service;
            };

            // broadcast handler combinator
            var getBroadcastHandler = function(status, hasRequestName) {
                if(hasRequestName)
                    return function(request, callback) {
                        if(Object.prototype.toString.call(request) === '[object Array]')
                            angular.forEach(request, function(reqName) {
                                $rootScope.$on(getBroadCastName(status, reqName), callback);
                            });
                        else
                            $rootScope.$on(getBroadCastName(status, request), callback);

                        return service;
                    };
                else
                    return function(callback) {
                        $rootScope.$on(getBroadCastName(status), callback);

                        return service;
                    };
            };

            // broadcast handlers
            this.whenStart = getBroadcastHandler(REQUEST_STATUS.START, true);
            this.whenFinished = getBroadcastHandler(REQUEST_STATUS.FINISHED, true);
            this.whenError = getBroadcastHandler(REQUEST_STATUS.ERROR, true);
            this.whenCanceled = getBroadcastHandler(REQUEST_STATUS.CANCELED, true);
            this.whenAllFinished = getBroadcastHandler(REQUEST_STATUS.ALLFINISHED, false);

            this.when = function(requestGroup) {
                var requestGroupString = JSON.stringify(requestGroup);

                var eventHandler;
                var getHandler = function(status) {
                    return function(callback) {
                        $rootScope.$on(getBroadCastName(status, requestGroupString), callback);
                        return eventHandler;
                    }
                }

                eventHandler = {
                    start: getHandler(REQUEST_STATUS.START),
                    finished: getHandler(REQUEST_STATUS.FINISHED),
                    error: getHandler(REQUEST_STATUS.ERROR),
                    canceled: getHandler(REQUEST_STATUS.CANCELED)
                };

                // return event handler
                return eventHandler;
            };
        }
    ]);

})(angular);
