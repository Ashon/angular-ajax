/*
 *   AngularJS AsyncAjax v0.0.3
 *
 *   @author ashon
 *
 *   MIT Licenced.
 */

(function(angular) {

    'use strict';

    // ajax request constants
    var BROADCAST_PREFIX = 'asyncAjax';

    var MSG_DELIMITER = ':';

    var REQUEST_STATUS = {
        START: 'start',
        PROGRESS: 'progress',
        FINISHED: 'finished',
        ALLOVER: 'allOvered',
        ERROR: 'error',
        ALLCANCELED: 'allCanceled'
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
            var currentRequestName = '';

            var broadcastStatus = function(status, requestName) {
                var msg = getBroadCastName(status, requestName);
                $rootScope.$broadcast(msg);
            };

            // asynchronous request queue
            var registerAsyncTask = function(task) {
                broadcastStatus(REQUEST_STATUS.PROGRESS, currentRequestName);
                asyncQueue = asyncQueue.then(function() {
                    return task;
                });
                return asyncQueue;
            };

            // ajax request
            var ajaxRequest = function(json, success, error, finished) {

                // error wrapper
                var whenError = function(data, status, headers, config) {
                    if(isFunction(error))
                        error(data, status, headers, config);

                    // broadcasts when failed from prism_fe.. (not spectrum_API)
                    broadcastStatus(REQUEST_STATUS.ERROR, json.name);
                };

                // finished wrapper
                var whenFinished = function(response) {
                    broadcastStatus(REQUEST_STATUS.FINISHED, json.name);
                    if(isFunction(finished))
                        finished(response);

                    // if request finished, then decrease request count
                    countInProgress--;
                    // check the count and broadcast
                    if(countInProgress === 0)
                        broadcastStatus(REQUEST_STATUS.ALLOVER);
                };

                if(json.timeout === undefined)
                    json.timeout = taskCanceler.promise;

                currentRequestName = json.name;
                broadcastStatus(REQUEST_STATUS.START, currentRequestName);

                var request = $http(json);
                countInProgress++;

                // bind status handler & return
                return request
                    .success(success)
                    .error(whenError)
                    .then(whenFinished);
            };

            this.getCurrentRequestName = function() {
                return currentRequestName;
            };

            /** cancelAllRequests
             *
             * @description
             *     Cancel all requests in progress.
             *     taskCanceler : timeout promise in AjaxRequestService.registerAsyncTask
             *     When this function call, resolves all requests force timeout event.
             */
            this.cancelAllRequests = function() {
                // resolve cancler
                taskCanceler.resolve();
                // revolve
                taskCanceler = $q.defer();
                asyncQueue = $q.when(true);

                return service;
            };

            /** request
             *
             * @description
             *     AjaxRequestService's asynchronous ajax request.
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

            this.then = function(task) {
                asyncQueue.then(task);

                return service;
            };

            // broadcast handler combinator
            var getBroadcastHandler = function(status, hasRequestName) {
                if(hasRequestName)
                    return function(request, callback) {
                        if(Object.prototype.toString.call(request) === '[object Array]')
                            request.forEach(function(reqName) {
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

            // broadcast handler
            this.onStart = getBroadcastHandler(REQUEST_STATUS.START, true);
            this.onProgress = getBroadcastHandler(REQUEST_STATUS.PROGRESS, true);
            this.onFinished = getBroadcastHandler(REQUEST_STATUS.FINISHED, true);
            this.onError = getBroadcastHandler(REQUEST_STATUS.ERROR, true);
            this.onAllCanceled = getBroadcastHandler(REQUEST_STATUS.ALLCANCELED, false);
            this.onAllOver = getBroadcastHandler(REQUEST_STATUS.ALLOVER, false);

        }
    ]);

})(angular);
