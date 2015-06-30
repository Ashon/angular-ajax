/*
 *   AngularJS AsyncAjax v0.0.2
 *
 *   @author juwon.lee
 *
 *   MIT Licenced.
 */

(function() {

    'use strict';

    // ajax request constants
    var BROADCAST_PREFIX = 'asyncAjax';

    var MSG_DELIMITER = ':';

    var REQUEST_STATUS = {
        START: 'start',
        PROGRESS: 'progress',
        FINISHED: 'finished',
        ERROR: 'error'
    };

    var getBroadCastName = function(status, requestName) {
        return [BROADCAST_PREFIX, requestName, status].join(MSG_DELIMITER);
    };

    var isFunction = function(fn) {
        return fn && typeof(fn) === 'function';
    };

    // Ajax Request Service Module
    angular.module('asyncAjax', [])

    // $ajaxRequest angular Service
    .service('$asyncAjax', [

        // spectrum.ajaxRequest service dependencies
        '$rootScope', '$http', '$q',

        function($rootScope, $http, $q) {

            // async task Queue
            var asyncQueue = $q.when(true);
            var taskCanceler = $q.defer();

            var countInProgress = 0;
            var currentRequestName = '';

            var broadcastStatus = function(status, requestName) {
                $rootScope.$broadcast(getBroadCastName(status, requestName));
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
                    // if request finished, then decrease request count
                    countInProgress--;

                    // check the count and broadcast
                    if(countInProgress === 0)
                        broadcastStatus(REQUEST_STATUS.FINISHED, json.name);

                    if(isFunction(finished))
                        finished(response);
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

                return this;
            };

            /** asyncAjaxRequest
             *
             * @description
             *     AjaxRequestService's asynchronous ajax request.
             * @returns
             *     <$http> registerAsyncTask :
             */
            this.asyncAjaxRequest = function(json, success, error, finished) {
                registerAsyncTask(ajaxRequest(json, success, error, finished));
                return this;
            };

            this.then = function(task) {
                asyncQueue.then(task);
                return this;
            };

            var service = this;

            // broadcast handler combinator
            var getBroadcastHandler = function(status) {
                return function(requestName, callback) {
                    $rootScope.$on(getBroadCastName(status, requestName), callback);
                    return service;
                };
            };

            this.onStart = getBroadcastHandler(REQUEST_STATUS.START);
            this.onProgress = getBroadcastHandler(REQUEST_STATUS.PROGRESS);
            this.onFinished = getBroadcastHandler(REQUEST_STATUS.FINISHED);
            this.onError = getBroadcastHandler(REQUEST_STATUS.ERROR);

        }
    ]);

})();
