define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "dojo/text!StepCount/widget/template/StepCount.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, widgetTemplate) {
    "use strict";

    return declare("StepCount.widget.StepCount", [_WidgetBase, _TemplatedMixin], {

        templateString: widgetTemplate,


        widgetBase: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");
            this._updateHealthData();
            this.interval = setInterval(lang.hitch(this, this._updateHealthData), 5000);

            this._contextObj = obj;
            this._updateRendering(callback);
        },

        _updateHealthData: function() {
            this._checkForHealthData()
                .then(lang.hitch(this, this._requestAuthorization))
                .then(lang.hitch(this, this._queryForSteps))
                .then(lang.hitch(this, function(data) {
                    // this.stepsNode.innerHTML = "" + data[0].value;
                    this.countTwoDaysAgo.innerHTML = data[0].value
                    this.countYesterday.innerHTML = data[1].value
                    this.countToday.innerHTML = data[2].value
                    console.log(data);
                }))
                .catch(function(error) {
                    console.log(error);
                })
        },

        _checkForHealthData: function() {
            return new Promise(function(resolve, reject) {
                navigator.health.isAvailable(function() {
                    resolve(true)
                }, function(error) {
                    reject(error);
                });
            });
        },
        _requestAuthorization: function() {
            return new Promise(function(resolve, reject) {
                navigator.health.requestAuthorization(
                    [{ read: ['steps'] }],
                    function() {
                        resolve()
                    },
                    function(error) {
                        reject(error)
                    });
            });
        },
        _queryForSteps: function() {
            return new Promise(function(resolve, reject) {
                navigator.health.queryAggregated({
                    startDate: new Date(new Date().setHours(0, 0, 0, 0) - 2 * 24 * 60 * 60 * 1000), // begin of three days ago
                    endDate: new Date(), // now
                    dataType: 'steps',
                    bucket: 'day'
                }, function(data) {
                    resolve(data)
                }, function(error) {
                    reject(error);
                })
            });
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback);
        },

        _executeCallback: function(cb) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["StepCount/widget/StepCount"]);