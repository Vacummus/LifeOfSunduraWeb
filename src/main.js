/**
 * @license Angulartics v0.17.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function (angular, analytics) {
    'use strict';

    var angulartics = window.angulartics || (window.angulartics = {});
    angulartics.waitForVendorCount = 0;
    angulartics.waitForVendorApi = function (objectName, delay, containsField, registerFn, onTimeout) {
        if (!onTimeout) { angulartics.waitForVendorCount++; }
        if (!registerFn) { registerFn = containsField; containsField = undefined; }
        if (!Object.prototype.hasOwnProperty.call(window, objectName) || (containsField !== undefined && window[objectName][containsField] === undefined)) {
            setTimeout(function () { angulartics.waitForVendorApi(objectName, delay, containsField, registerFn, true); }, delay);
        }
        else {
            angulartics.waitForVendorCount--;
            registerFn(window[objectName]);
        }
    };

    /**
     * @ngdoc overview
     * @name angulartics
     */
    angular.module('angulartics', [])
        .provider('$analytics', function () {
            var settings = {
                pageTracking: {
                    autoTrackFirstPage: true,
                    autoTrackVirtualPages: true,
                    trackRelativePath: false,
                    autoBasePath: false,
                    basePath: ''
                },
                eventTracking: {},
                bufferFlushDelay: 1000, // Support only one configuration for buffer flush delay to simplify buffering
                developerMode: false // Prevent sending data in local/development environment
            };

            // List of known handlers that plugins can register themselves for
            var knownHandlers = [
                'pageTrack',
                'eventTrack',
                'setAlias',
                'setUsername',
                'setAlias',
                'setUserProperties',
                'setUserPropertiesOnce',
                'setSuperProperties',
                'setSuperPropertiesOnce'
            ];
            // Cache and handler properties will match values in 'knownHandlers' as the buffering functons are installed.
            var cache = {};
            var handlers = {};

            // General buffering handler
            var bufferedHandler = function (handlerName) {
                return function () {
                    if (angulartics.waitForVendorCount) {
                        if (!cache[handlerName]) { cache[handlerName] = []; }
                        cache[handlerName].push(arguments);
                    }
                };
            };

            // As handlers are installed by plugins, they get pushed into a list and invoked in order.
            var updateHandlers = function (handlerName, fn) {
                if (!handlers[handlerName]) {
                    handlers[handlerName] = [];
                }
                handlers[handlerName].push(fn);
                return function () {
                    var handlerArgs = arguments;
                    angular.forEach(handlers[handlerName], function (handler) {
                        handler.apply(this, handlerArgs);
                    }, this);
                };
            };

            // The api (returned by this provider) gets populated with handlers below.
            var api = {
                settings: settings
            };

            // Will run setTimeout if delay is > 0
            // Runs immediately if no delay to make sure cache/buffer is flushed before anything else.
            // Plugins should take care to register handlers by order of precedence.
            var onTimeout = function (fn, delay) {
                if (delay) {
                    setTimeout(fn, delay);
                } else {
                    fn();
                }
            };

            var provider = {
                $get: function () { return api; },
                api: api,
                settings: settings,
                virtualPageviews: function (value) { this.settings.pageTracking.autoTrackVirtualPages = value; },
                firstPageview: function (value) { this.settings.pageTracking.autoTrackFirstPage = value; },
                withBase: function (value) { this.settings.pageTracking.basePath = (value) ? angular.element('base').attr('href').slice(0, -1) : ''; },
                withAutoBase: function (value) { this.settings.pageTracking.autoBasePath = value; },
                developerMode: function (value) { this.settings.developerMode = value; }
            };

            // General function to register plugin handlers. Flushes buffers immediately upon registration according to the specified delay.
            var register = function (handlerName, fn) {
                api[handlerName] = updateHandlers(handlerName, fn);
                var handlerSettings = settings[handlerName];
                var handlerDelay = (handlerSettings) ? handlerSettings.bufferFlushDelay : null;
                var delay = (handlerDelay !== null) ? handlerDelay : settings.bufferFlushDelay;
                angular.forEach(cache[handlerName], function (args, index) {
                    onTimeout(function () { fn.apply(this, args); }, index * delay);
                });
            };

            var capitalize = function (input) {
                return input.replace(/^./, function (match) {
                    return match.toUpperCase();
                });
            };

            // Adds to the provider a 'register#{handlerName}' function that manages multiple plugins and buffer flushing.
            var installHandlerRegisterFunction = function (handlerName) {
                var registerName = 'register' + capitalize(handlerName);
                provider[registerName] = function (fn) {
                    register(handlerName, fn);
                };
                api[handlerName] = updateHandlers(handlerName, bufferedHandler(handlerName));
            };

            // Set up register functions for each known handler
            angular.forEach(knownHandlers, installHandlerRegisterFunction);
            return provider;
        })

        .run(['$rootScope', '$window', '$analytics', '$injector', function ($rootScope, $window, $analytics, $injector) {
            if ($analytics.settings.pageTracking.autoTrackFirstPage) {
                $injector.invoke(['$location', function ($location) {
                    /* Only track the 'first page' if there are no routes or states on the page */
                    var noRoutesOrStates = true;
                    if ($injector.has('$route')) {
                        var $route = $injector.get('$route');
                        for (var route in $route.routes) {
                            noRoutesOrStates = false;
                            break;
                        }
                    } else if ($injector.has('$state')) {
                        var $state = $injector.get('$state');
                        for (var state in $state.get()) {
                            noRoutesOrStates = false;
                            break;
                        }
                    }
                    if (noRoutesOrStates) {
                        if ($analytics.settings.pageTracking.autoBasePath) {
                            $analytics.settings.pageTracking.basePath = $window.location.pathname;
                        }
                        if ($analytics.settings.trackRelativePath) {
                            var url = $analytics.settings.pageTracking.basePath + $location.url();
                            $analytics.pageTrack(url, $location);
                        } else {
                            $analytics.pageTrack($location.absUrl(), $location);
                        }
                    }
                }]);
            }

            if ($analytics.settings.pageTracking.autoTrackVirtualPages) {
                $injector.invoke(['$location', function ($location) {
                    if ($analytics.settings.pageTracking.autoBasePath) {
                        /* Add the full route to the base. */
                        $analytics.settings.pageTracking.basePath = $window.location.pathname + "#";
                    }
                    if ($injector.has('$route')) {
                        $rootScope.$on('$routeChangeSuccess', function (event, current) {
                            if (current && (current.$$route || current).redirectTo) return;
                            var url = $analytics.settings.pageTracking.basePath + $location.url();
                            $analytics.pageTrack(url, $location);
                        });
                    }
                    if ($injector.has('$state')) {
                        $rootScope.$on('$stateChangeSuccess', function (event, current) {
                            var url = $analytics.settings.pageTracking.basePath + $location.url();
                            $analytics.pageTrack(url, $location);
                        });
                    }
                }]);
            }
            if ($analytics.settings.developerMode) {
                angular.forEach($analytics, function (attr, name) {
                    if (typeof attr === 'function') {
                        $analytics[name] = function () { };
                    }
                });
            }
        }])

        .directive('analyticsOn', ['$analytics', function ($analytics) {
            function isCommand(element) {
                return ['a:', 'button:', 'button:button', 'button:submit', 'input:button', 'input:submit'].indexOf(
                    element.tagName.toLowerCase() + ':' + (element.type || '')) >= 0;
            }

            function inferEventType(element) {
                if (isCommand(element)) return 'click';
                return 'click';
            }

            function inferEventName(element) {
                if (isCommand(element)) return element.innerText || element.value;
                return element.id || element.name || element.tagName;
            }

            function isProperty(name) {
                return name.substr(0, 9) === 'analytics' && ['On', 'Event', 'If', 'Properties', 'EventType'].indexOf(name.substr(9)) === -1;
            }

            function propertyName(name) {
                var s = name.slice(9); // slice off the 'analytics' prefix
                if (typeof s !== 'undefined' && s !== null && s.length > 0) {
                    return s.substring(0, 1).toLowerCase() + s.substring(1);
                }
                else {
                    return s;
                }
            }

            return {
                restrict: 'A',
                link: function ($scope, $element, $attrs) {
                    var eventType = $attrs.analyticsOn || inferEventType($element[0]);
                    var trackingData = {};

                    angular.forEach($attrs.$attr, function (attr, name) {
                        if (isProperty(name)) {
                            trackingData[propertyName(name)] = $attrs[name];
                            $attrs.$observe(name, function (value) {
                                trackingData[propertyName(name)] = value;
                            });
                        }
                    });

                    angular.element($element[0]).bind(eventType, function ($event) {
                        var eventName = $attrs.analyticsEvent || inferEventName($element[0]);
                        trackingData.eventType = $event.type;

                        if ($attrs.analyticsIf) {
                            if (!$scope.$eval($attrs.analyticsIf)) {
                                return; // Cancel this event if we don't pass the analytics-if condition
                            }
                        }
                        // Allow components to pass through an expression that gets merged on to the event properties
                        // eg. analytics-properites='myComponentScope.someConfigExpression.$analyticsProperties'
                        if ($attrs.analyticsProperties) {
                            angular.extend(trackingData, $scope.$eval($attrs.analyticsProperties));
                        }
                        $analytics.eventTrack(eventName, trackingData);
                    });
                }
            };
        }]);
})(angular);




var mainApp = angular.module('main', ["ngAnimate", "ngRoute"]);

// var readyStateCheckInterval = setInterval(function () {
//     if (document.readyState === "complete") {
//         clearInterval(readyStateCheckInterval);
//         $('.main-app').removeClass('loading');

//         if (IsIE()) {
//             $('body').css({ 'font-family': 'Arial' });
//         }
//     }
// }, 10);


function getWindowWidth() {
    var myWidth = 0;

    if (typeof (window.innerWidth) == 'number') {
        //Non-IE
        myWidth = window.innerWidth;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
        //IE 6+ in 'standards compliant mode'
        myWidth = document.documentElement.clientWidth;
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
        //IE 4 compatible
        myWidth = document.body.clientWidth;
    }
    return myWidth;
}

function IsIE() {
    return ($.browser.msie);
}

var locationService = {
    id: null,
    page: null,
    route: null,
    setRoute: null,
    show404: function () { this.page = 'error'; }
};

mainApp.controller('route-controller', ['$rootScope', '$scope', '$location', '$http', '$timeout', function ($rootScope, $scope, $location, $http, $timeout) {
    $scope.locationService = locationService;
    $rootScope.isLoading = true;

    $scope.setRoute = locationService.setRoute = function (routePath) {
        $location.path(routePath);
    };

    var isPlayingTextWriting = false;
    var playTextWriting = function () {
        if (isPlayingTextWriting) {
            return;
        }
        isPlayingTextWriting = true;

        var subText = "Play through the Story of an Organism from Birth to Death";
        var counter = 0;
        $scope.headerSubText = "|";

        var setNextText = function () {
            $timeout(function () {
                $scope.headerSubText = $scope.headerSubText.substring(0, $scope.headerSubText.length - 1);
                $scope.headerSubText += subText[counter++] + "|";

                if (counter < subText.length) {
                    setNextText();
                } else {
                    $scope.headerSubText = $scope.headerSubText.substring(0, $scope.headerSubText.length - 1);
                    isPlayingTextWriting = false;
                }
            }, 50);
        };

        $timeout(function () {
            setNextText();

            var mainVideo = $('.main-video video');
            mainVideo.attr('poster', 'Content/images/main-video-image.png');
            $scope.playVideo();

            $('.main-video img').attr('src', '/Content/images/main-video-image.png');
            $scope.showMainVideoImage = true;
        }, 3000);
    }

    $scope.playVideo = function () {
        var mainVideo = $('.main-video video');
        if (mainVideo.length > 0) {
            mainVideo.get(0).play();
        }
    };

    $scope.loadVideo = function () {
        var mainVideo = $('.main-video video');

        if ($(window).width() < 700) {
            mainVideo.append("<source type='video/webm' src='https://dl.dropboxusercontent.com/u/99750801/main-video.webm' />");
            mainVideo.append("<source type='video/mp4' src='https://dl.dropboxusercontent.com/u/99750801/main-video-small.mp4' />");
        } else {
            mainVideo.append("<source type='video/webm' src='https://dl.dropboxusercontent.com/u/99750801/main-video.webm' />");
            mainVideo.append("<source type='video/mp4' src='https://dl.dropboxusercontent.com/u/99750801/main-video.mp4' />");
        }
    };

    var watchPath = function () { return $location.path(); };
    $scope.$watch(watchPath, function (newVal, oldVal) {
        locationService.route = newVal;

        playTextWriting();

        if (newVal === "") {
            locationService.page = 'overview';
        } else {
            var uriMatch = new RegExp('^(/[a-z]+/([0-9]+))/?$');
            var match = newVal.match(uriMatch);

            locationService.id = null;
            if (match) {
                locationService.id = parseInt(match[2]);
                newVal = newVal.replace('/' + locationService.id, '');
            }

            newVal = newVal.replace('/', '').replace('/', '');
            locationService.page = newVal;
        }
    });
}]);

mainApp.directive('imageOnload', function() {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            $element.bind('load', function() {
                $scope.$evalAsync(function () { $scope.image.isLoaded = true; });
            });
            $element.bind('error', function(){
                console.log('image could not be loaded');
            });
        }
    };
});

mainApp.controller('overview-controller', ['$rootScope', '$scope', '$timeout', function ($rootScope, $scope, $timeout) {
    $rootScope.isLoading = true;
    var checkOverviewLoaded = function () {
        if($('.gif-images').is(':visible')) {
            $rootScope.isLoading = false;
        } else {
            $timeout(checkOverviewLoaded, 50);
        }
    }

    checkOverviewLoaded();

    $scope.chapters = [
        { title: "Birth", progress: 1/4 },
        { title: "Growth", progress: 0/4 },
        { title: "Purpose", progress: 0/4 },
        { title: "Death", progress: 0/4 }
    ];

    $scope.animatedGifs = [
        { coverGif: "src/content/images/gifs/1-gif-cover.gif", gif: "http://i.imgur.com/sxhAfYn.gif" },
        { coverGif: "src/content/images/gifs/2-gif-cover.gif", gif: "http://i.imgur.com/iA9Xcrp.gif" },
        { coverGif: "src/content/images/gifs/3-gif-cover.gif", gif: "http://i.imgur.com/T9u9mTe.gif" },
        { coverGif: "src/content/images/gifs/4-gif-cover.gif", gif: "http://i.imgur.com/OOLeczl.gif" },
        { coverGif: "src/content/images/gifs/5-gif-cover.gif", gif: "http://i.imgur.com/D2h1Gv5.gif" },
        { coverGif: "src/content/images/gifs/6-gif-cover.gif", gif: "http://i.imgur.com/MEHTuIl.gif" }
    ];

    //var documentElement = $(document);

    // var updateGifVisibility = function () {
    //     var scrollTop = documentElement.scrollTop();
    //     var scrollBottom = scrollTop + $(window).height();

    //     $scope.$evalAsync(function () { 
    //         for (var i = 0; i < $scope.animatedGifs.length; i++) {
    //             var imageElement = $('.gif-images p:nth-child(' + (i + 1) +')');
    //             var image = $scope.animatedGifs[i];
    //             var imageTop = imageElement.offset().top - 200;
    //             var imageBottom = imageTop + imageElement.height() + 200;

    //             image.visible = imageBottom > scrollTop && scrollBottom > imageTop;
    //         }
    //     });
    // };

    // documentElement.scroll(updateGifVisibility);
    // $(window).resize(updateGifVisibility);
}]);

var blogData;

mainApp.controller('blog-controller', ['$scope', '$http', '$sce', function ($scope, $http, $sce) {
    $scope.displayType = 'loading';

    $scope.postLinks = [
        {
            name: "Update #1: Camera System",
            tigsourceLink: "http://forums.tigsource.com/index.php?topic=47220.msg1131197#msg1131197",
            tumblrLink: "http://organizamgame.tumblr.com/post/117144972207/devlog-1-camera-system",
        },
        {
            name: "Update #2: Experimenting with Organisms",
            tigsourceLink: "http://forums.tigsource.com/index.php?topic=47220.msg1135516#msg1135516",
            tumblrLink: "http://organizamgame.tumblr.com/post/117950009447/update-2-experimenting-with-organisms",
        }
    ];

    //var loadData = function (data) {
    //    blogData = data;
    //    $scope.displayType = 'content';

    //    console.log('data', data);
    //    for (var i = 0; i < data.response.posts.length; i++) {
    //        if (data.response.posts[i].type === 'video') {
    //            data.response.posts[i].video_url = $sce.trustAsResourceUrl(data.response.posts[i].video_url);
    //        }
    //    }

    //    if (locationService.id) {
    //        $scope.isSinglePost = true;

    //        (function () {
    //            for (var i = 0; i < data.response.posts.length; i++) {
    //                var post = data.response.posts[i];

    //                if (post.id === locationService.id) {
    //                    $scope.posts = [post];

    //                    return;
    //                }
    //            }
    //        }());

    //        if (!$scope.posts) {
    //            locationService.show404();
    //            return;
    //        }
    //    }
    //    else {
    //        $scope.isSinglePost = false;
    //        $scope.posts = data.response.posts;
    //    }

    //    for (var i = 0; i < $scope.posts.length; i++) {
    //        $scope.posts[i].date = moment($scope.posts[i].date).format('LL')
    //    }

    //    setTimeout(function () {
    //        updateIframeSizes();
    //    }, 10);
    //}

    //var getData = function () {
    //    if (blogData) {
    //        loadData(blogData);
    //    } else {

    //        $http({
    //            url: '/api/blog',
    //            method: "GET"
    //        }).success(loadData)
    //          .error(function (data) {
    //              $scope.displayType = 'error';
    //              console.log('error', data);
    //          });
    //    }
    //}

    //$scope.$watch('locationService.id', getData);
}]);

var releaseList = [
    {
        name: 'Prototype', id: 1, trelloId: 'S6LIncuR',
        goal: 'Develop Prototype and start Kickstarter Campaign.',
        startDate: new Date(2014, 7, 1), deadline: new Date(2014, 10, 1)
    },
    {
        name: 'Prequel', id: 2, trelloId: 'mRJjaRUP',
        goal: 'Develop Prequel and start Kickstarter Campaign.',
        startDate: new Date(2014, 10, 1), deadline: new Date(2015, 1, 1)
    }
];

mainApp.controller('development-controller', ['$scope', '$http', function ($scope, $http) {
    var getTotalWorkloadHrs = function (todoCards) {
        var totalHrs = 0;

        for (var i = 0; i < todoCards.length; i++) {
            var card = todoCards[i];

            for (var j = 0; j < card.labels.length; j++) {
                var label = card.labels[j];

                if (label.color == 'green') {
                    totalHrs += 5;
                }
                if (label.color == 'yellow') {
                    totalHrs += 10;
                }
                if (label.color == 'orange') {
                    totalHrs += 20;
                }
                if (label.color == 'red') {
                    totalHrs += 40;
                }
            }
        }

        return totalHrs;
    }

    var getTotalWeeks = function (sourceDate, targetDate) {
        var oneWeek = 7 * 24 * 60 * 60 * 1000;
        return Math.abs((sourceDate.getTime() - targetDate.getTime()) / (oneWeek));
    }

    var loadData = function (data, release) {
        $scope.displayType = 'error';

        release.todoCards = data[0].cards;
        release.doneCards = data[1].cards;
        release.totalWorkloadHrs = getTotalWorkloadHrs(release.todoCards);
        var nowDate = new Date();
        var startDate = release.startDate < nowDate ? nowDate : release.startDate;
        release.weeksLeft = getTotalWeeks(release.deadline, startDate);
        release.hrsPerWeek = Math.ceil(release.totalWorkloadHrs / release.weeksLeft);
        release.isLoaded = true;

        $scope.displayType = 'content';
    }

    $scope.loadRelease = function (release) {
        $scope.displayType = 'loading';

        $scope.currentRelease = release;
        if (!release.isLoaded) {
            $http({
                url: 'https://api.trello.com/1/board/' + release.trelloId + '/lists?cards=open&key=fa0895bff84a850712c20d84d9ba9c20',
                method: "GET"
            })
                .success(function (data) {
                    loadData(data, release);
                })
                .error(function (data) {
                    $scope.displayType = 'error';
                    console.log('error', data);
                });
        } else {
            $scope.displayType = 'content';
        }
    }

    $scope.displayType = 'loading';
    $scope.releaseList = releaseList;

    $scope.$watch('locationService.id', function (id) {
        if (!id) {
            locationService.setRoute('/development/1');
            return;
        }

        for (var i = 0; i < releaseList.length; i++) {
            var release = releaseList[i];
            if (release.id === locationService.id) {
                $scope.loadRelease(release);
                return;
            }
        }

        locationService.show404();
    });
}]);

mainApp.controller('subscribe-controller', ['$scope', '$http', function ($scope, $http) {
    $scope.subscribeSuccessful = $scope.subscribeFailed = false;

    $scope.submitEmail = function () {
        $scope.subscribeSuccessful = $scope.subscribeFailed = false;

        if (!$scope.email) {
            $scope.subscribeFailed = true;
            $scope.errorMessage = "Email field cannot be empty.";
        } else {
            $http({
                url: '/api/subscribe',
                method: "POST",
                data: { email: $scope.email },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data, status, headers, config) {
                $scope.subscribeSuccessful = true;
            }).error(function (data, status, headers, config) {
                $scope.subscribeFailed = true;
                $scope.errorMessage = data;
            });
        }
    };
}]);

var currentGameFolder = "hit";
console.log("establish: ", currentGameFolder);

mainApp.controller('play-controller', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {
    var currentGame = {};

    $scope.games = [
        {
            name: 'Prototype',
            id: 1,
            release: '3/21/2015',
            description: 'The prototype focuses on testing out some simple gameplay mechanics, the art style, and the overall flow and feel of the game. The objective is to find a giant green ball with the least amount of deaths.',
            folderUrl: '/Content/games/Prototype'
        },
        {
            name: 'Camera System Prototype',
            id: 2,
            release: '4/12/2015',
            description: 'This prototype focuses on testing out the camera system in the game. The purple box represents the camera focus point. You can toggle it on and off from the menu screen.',
            folderUrl: '/Content/games/CameraBuild'
        },
        {
            name: 'Movement Prototype',
            id: 3,
            release: '5/6/2015',
            description: 'This prototype focuses on testing out the movements of the main organisms in the game. I am also experimenting with the aesthetics of these organisms. You can use a gamepad or the keyboard to move the organisms around.',
            folderUrl: '/Content/games/MovementBuild'
        },
        {
            name: 'Intel Level Up GameDev Submission Prototype',
            id: 4,
            release: '5/14/2015',
            description: 'This prototype is what was submitted to the Intel Level Up GameDev Contest. It focuses on allowing the player to explore a habitat filled with different Organisms. You can not die and you can not win in this prototype. It is simply an exploration experience.',
            folderUrl: '/Content/games/IntelContestBuild'
        },
        {
            name: 'Indiecade Submission Prototype',
            id: 5,
            release: '6/1/2015',
            description: 'This prototype is what was submitted to Indiecade 2015.',
            folderUrl: '/Content/games/IndiecadeBuild'
        },
        {
            name: 'Egg Hatching Prototype',
            id: 6,
            release: '7/3/2015',
            description: 'Here I am testing out the egg hatching scene. This is along the lines of how the game will begin. There is an updated build here: <a href="www.organizam.com/#play/7">www.organizam.com/#play/7</a>',
            folderUrl: '/Content/games/EggHatchBuild'
        },
        {
            name: 'Egg Hatching Prototype 2.0',
            id: 7,
            release: '7/9/2015',
            description: 'This build improves on the egg hatching experience by adding a releastic 2d breaking system.',
            folderUrl: '/Content/games/EggHatchBuild2'
        }
    ];

    $scope.submitFeedback = function (feedback) {
        //ga('send', 'event', 'category', 'action', 'label');

        $http({
            url: '/api/feedback',
            method: "POST",
            data: { feedback: feedback },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data, status, headers, config) {
            $scope.feedbackSuccessful = true;
        }).error(function (data, status, headers, config) {
            $scope.feedbackFailed = true;
            $scope.errorMessage = data;
        });
    }

    $scope.playGame = function (game) {
        currentGame.isPlaying = false;
        if (game == currentGame) {
            currentGame = {};
            return;
        }

        currentGameFolder = game.folderUrl;

        $timeout(function () {
            currentGame = game;
            currentGame.isPlaying = true;
        }, 10);

        //ga('send', 'pageview', {
        //    page: '/play',
        //    title: game.name
        //});
    }

    $scope.initGame = function (game) {
        var config = {
            width: 960,
            height: 600,
            params: { enableDebugging: "0" }

        };
        config.params["disableContextMenu"] = true;

        var u = new UnityObject2(config);

        var $missingScreen = jQuery("#unityPlayer").find(".missing");
        var $brokenScreen = jQuery("#unityPlayer").find(".broken");
        $missingScreen.hide();
        $brokenScreen.hide();

        u.observeProgress(function (progress) {
            switch (progress.pluginStatus) {
                case "broken":
                    $brokenScreen.find("a").click(function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        u.installPlugin();
                        return false;
                    });
                    $brokenScreen.show();
                    break;
                case "missing":
                    $missingScreen.find("a").click(function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        u.installPlugin();
                        return false;
                    });
                    $missingScreen.show();
                    break;
                case "installed":
                    $missingScreen.remove();
                    break;
                case "first":
                    break;
            }
        });

        u.initPlugin(jQuery("#unityPlayer")[0], game.folderUrl + '/prototype.unity3d');
        //u.initPlugin(jQuery("#unityPlayer")[0], 'https://dl.dropboxusercontent.com/u/99750801/prototype.unity3d');
    };

    $scope.$watch('locationService.id', function (id) {
        if (!id) {
            $scope.playGame($scope.games[$scope.games.length - 1]);
            return;
        }

        for (var i = 0; i < $scope.games.length; i++) {
            var game = $scope.games[i];
            if (game.id === locationService.id) {
                $scope.playGame(game);
                return;
            }
        }

        locationService.show404();
    });
}]);

mainApp.directive('customHtmlBind', ['$compile', function ($compile) {
    return {
        scope: { html: '=customHtmlBind' },
        compile: function () {
            return function (scope, tElement) {
                var renderHtml = function () {
                    if (scope.html) {
                        tElement.html(scope.html);
                        $compile(tElement.contents())(scope);
                    }
                }

                renderHtml();

                scope.$watch('html', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        renderHtml();
                    }
                });
            }
        }
    }
}]);

var updateHeaderHeight = function () {
    $('.header').height($('.header .logo-section').outerHeight());
};

$('.header .logo-section img').on('load', function() {
    updateHeaderHeight();
    $(window).resize(updateHeaderHeight);
});
