function getWindowWidth(){var e=0;return"number"==typeof window.innerWidth?e=window.innerWidth:document.documentElement&&(document.documentElement.clientWidth||document.documentElement.clientHeight)?e=document.documentElement.clientWidth:document.body&&(document.body.clientWidth||document.body.clientHeight)&&(e=document.body.clientWidth),e}function IsIE(){return $.browser.msie}!function(e,t){"use strict";var n=window.angulartics||(window.angulartics={});n.waitForVendorCount=0,n.waitForVendorApi=function(e,t,a,o,i){i||n.waitForVendorCount++,o||(o=a,a=void 0),!Object.prototype.hasOwnProperty.call(window,e)||void 0!==a&&void 0===window[e][a]?setTimeout(function(){n.waitForVendorApi(e,t,a,o,!0)},t):(n.waitForVendorCount--,o(window[e]))},e.module("angulartics",[]).provider("$analytics",function(){var t={pageTracking:{autoTrackFirstPage:!0,autoTrackVirtualPages:!0,trackRelativePath:!1,autoBasePath:!1,basePath:""},eventTracking:{},bufferFlushDelay:1e3,developerMode:!1},a=["pageTrack","eventTrack","setAlias","setUsername","setAlias","setUserProperties","setUserPropertiesOnce","setSuperProperties","setSuperPropertiesOnce"],o={},i={},r=function(e){return function(){n.waitForVendorCount&&(o[e]||(o[e]=[]),o[e].push(arguments))}},s=function(t,n){return i[t]||(i[t]=[]),i[t].push(n),function(){var n=arguments;e.forEach(i[t],function(e){e.apply(this,n)},this)}},c={settings:t},l=function(e,t){t?setTimeout(e,t):e()},u={$get:function(){return c},api:c,settings:t,virtualPageviews:function(e){this.settings.pageTracking.autoTrackVirtualPages=e},firstPageview:function(e){this.settings.pageTracking.autoTrackFirstPage=e},withBase:function(t){this.settings.pageTracking.basePath=t?e.element("base").attr("href").slice(0,-1):""},withAutoBase:function(e){this.settings.pageTracking.autoBasePath=e},developerMode:function(e){this.settings.developerMode=e}},d=function(n,a){c[n]=s(n,a);var i=t[n],r=i?i.bufferFlushDelay:null,u=null!==r?r:t.bufferFlushDelay;e.forEach(o[n],function(e,t){l(function(){a.apply(this,e)},t*u)})},p=function(e){return e.replace(/^./,function(e){return e.toUpperCase()})},g=function(e){var t="register"+p(e);u[t]=function(t){d(e,t)},c[e]=s(e,r(e))};return e.forEach(a,g),u}).run(["$rootScope","$window","$analytics","$injector",function(t,n,a,o){a.settings.pageTracking.autoTrackFirstPage&&o.invoke(["$location",function(e){var t=!0;if(o.has("$route")){var i=o.get("$route");for(var r in i.routes){t=!1;break}}else if(o.has("$state")){var s=o.get("$state");for(var c in s.get()){t=!1;break}}if(t)if(a.settings.pageTracking.autoBasePath&&(a.settings.pageTracking.basePath=n.location.pathname),a.settings.trackRelativePath){var l=a.settings.pageTracking.basePath+e.url();a.pageTrack(l,e)}else a.pageTrack(e.absUrl(),e)}]),a.settings.pageTracking.autoTrackVirtualPages&&o.invoke(["$location",function(e){a.settings.pageTracking.autoBasePath&&(a.settings.pageTracking.basePath=n.location.pathname+"#"),o.has("$route")&&t.$on("$routeChangeSuccess",function(t,n){if(!n||!(n.$$route||n).redirectTo){var o=a.settings.pageTracking.basePath+e.url();a.pageTrack(o,e)}}),o.has("$state")&&t.$on("$stateChangeSuccess",function(t,n){var o=a.settings.pageTracking.basePath+e.url();a.pageTrack(o,e)})}]),a.settings.developerMode&&e.forEach(a,function(e,t){"function"==typeof e&&(a[t]=function(){})})}]).directive("analyticsOn",["$analytics",function(t){function n(e){return["a:","button:","button:button","button:submit","input:button","input:submit"].indexOf(e.tagName.toLowerCase()+":"+(e.type||""))>=0}function a(e){return n(e),"click"}function o(e){return n(e)?e.innerText||e.value:e.id||e.name||e.tagName}function i(e){return"analytics"===e.substr(0,9)&&["On","Event","If","Properties","EventType"].indexOf(e.substr(9))===-1}function r(e){var t=e.slice(9);return"undefined"!=typeof t&&null!==t&&t.length>0?t.substring(0,1).toLowerCase()+t.substring(1):t}return{restrict:"A",link:function(n,s,c){var l=c.analyticsOn||a(s[0]),u={};e.forEach(c.$attr,function(e,t){i(t)&&(u[r(t)]=c[t],c.$observe(t,function(e){u[r(t)]=e}))}),e.element(s[0]).bind(l,function(a){var i=c.analyticsEvent||o(s[0]);u.eventType=a.type,c.analyticsIf&&!n.$eval(c.analyticsIf)||(c.analyticsProperties&&e.extend(u,n.$eval(c.analyticsProperties)),t.eventTrack(i,u))})}}}])}(angular);var mainApp=angular.module("main",["ngAnimate","ngRoute"]),readyStateCheckInterval=setInterval(function(){"complete"===document.readyState&&(clearInterval(readyStateCheckInterval),$(".main-app").removeClass("loading"),IsIE()&&$("body").css({"font-family":"Arial"}))},10),locationService={id:null,page:null,route:null,setRoute:null,show404:function(){this.page="error"}};mainApp.controller("route-controller",["$scope","$location","$http","$timeout",function(e,t,n,a){e.locationService=locationService,e.isLoading=!0,e.setRoute=locationService.setRoute=function(e){t.path(e)};var o=!1,i=function(){if(!o){o=!0;var t="Play through the Story of an Organism from Birth to Death",n=0;e.headerSubText="|";var i=function(){a(function(){e.headerSubText=e.headerSubText.substring(0,e.headerSubText.length-1),e.headerSubText+=t[n++]+"|",n<t.length?i():(e.headerSubText=e.headerSubText.substring(0,e.headerSubText.length-1),o=!1)},50)};a(function(){i();var t=$(".main-video video");t.attr("poster","Content/images/main-video-image.png"),e.playVideo(),$(".main-video img").attr("src","/Content/images/main-video-image.png"),e.showMainVideoImage=!0},3e3)}};e.playVideo=function(){var e=$(".main-video video");e.length>0&&e.get(0).play()},e.loadVideo=function(){var e=$(".main-video video");$(window).width()<700?(e.append("<source type='video/webm' src='https://dl.dropboxusercontent.com/u/99750801/main-video.webm' />"),e.append("<source type='video/mp4' src='https://dl.dropboxusercontent.com/u/99750801/main-video-small.mp4' />")):(e.append("<source type='video/webm' src='https://dl.dropboxusercontent.com/u/99750801/main-video.webm' />"),e.append("<source type='video/mp4' src='https://dl.dropboxusercontent.com/u/99750801/main-video.mp4' />"))};var r=function(){return t.path()};e.$watch(r,function(e,t){if(locationService.route=e,i(),""===e)locationService.page="overview";else{var n=new RegExp("^(/[a-z]+/([0-9]+))/?$"),a=e.match(n);locationService.id=null,a&&(locationService.id=parseInt(a[2]),e=e.replace("/"+locationService.id,"")),e=e.replace("/","").replace("/",""),locationService.page=e}})}]),mainApp.controller("overview-controller",["$scope",function(e){e.chapters=[{title:"Birth",progress:.2},{title:"Growth",progress:0},{title:"Purpose",progress:0},{title:"Death",progress:0}]}]);var blogData;mainApp.controller("blog-controller",["$scope","$http","$sce",function(e,t,n){e.displayType="loading",e.postLinks=[{name:"Update #1: Camera System",tigsourceLink:"http://forums.tigsource.com/index.php?topic=47220.msg1131197#msg1131197",tumblrLink:"http://organizamgame.tumblr.com/post/117144972207/devlog-1-camera-system"},{name:"Update #2: Experimenting with Organisms",tigsourceLink:"http://forums.tigsource.com/index.php?topic=47220.msg1135516#msg1135516",tumblrLink:"http://organizamgame.tumblr.com/post/117950009447/update-2-experimenting-with-organisms"}]}]);var releaseList=[{name:"Prototype",id:1,trelloId:"S6LIncuR",goal:"Develop Prototype and start Kickstarter Campaign.",startDate:new Date(2014,7,1),deadline:new Date(2014,10,1)},{name:"Prequel",id:2,trelloId:"mRJjaRUP",goal:"Develop Prequel and start Kickstarter Campaign.",startDate:new Date(2014,10,1),deadline:new Date(2015,1,1)}];mainApp.controller("development-controller",["$scope","$http",function(e,t){var n=function(e){for(var t=0,n=0;n<e.length;n++)for(var a=e[n],o=0;o<a.labels.length;o++){var i=a.labels[o];"green"==i.color&&(t+=5),"yellow"==i.color&&(t+=10),"orange"==i.color&&(t+=20),"red"==i.color&&(t+=40)}return t},a=function(e,t){var n=6048e5;return Math.abs((e.getTime()-t.getTime())/n)},o=function(t,o){e.displayType="error",o.todoCards=t[0].cards,o.doneCards=t[1].cards,o.totalWorkloadHrs=n(o.todoCards);var i=new Date,r=o.startDate<i?i:o.startDate;o.weeksLeft=a(o.deadline,r),o.hrsPerWeek=Math.ceil(o.totalWorkloadHrs/o.weeksLeft),o.isLoaded=!0,e.displayType="content"};e.loadRelease=function(n){e.displayType="loading",e.currentRelease=n,n.isLoaded?e.displayType="content":t({url:"https://api.trello.com/1/board/"+n.trelloId+"/lists?cards=open&key=fa0895bff84a850712c20d84d9ba9c20",method:"GET"}).success(function(e){o(e,n)}).error(function(t){e.displayType="error",console.log("error",t)})},e.displayType="loading",e.releaseList=releaseList,e.$watch("locationService.id",function(t){if(!t)return void locationService.setRoute("/development/1");for(var n=0;n<releaseList.length;n++){var a=releaseList[n];if(a.id===locationService.id)return void e.loadRelease(a)}locationService.show404()})}]),mainApp.controller("subscribe-controller",["$scope","$http",function(e,t){e.subscribeSuccessful=e.subscribeFailed=!1,e.submitEmail=function(){e.subscribeSuccessful=e.subscribeFailed=!1,e.email?t({url:"/api/subscribe",method:"POST",data:{email:e.email},headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(t,n,a,o){e.subscribeSuccessful=!0}).error(function(t,n,a,o){e.subscribeFailed=!0,e.errorMessage=t}):(e.subscribeFailed=!0,e.errorMessage="Email field cannot be empty.")}}]);var currentGameFolder="hit";console.log("establish: ",currentGameFolder),mainApp.controller("play-controller",["$scope","$timeout","$http",function(e,t,n){var a={};e.games=[{name:"Prototype",id:1,release:"3/21/2015",description:"The prototype focuses on testing out some simple gameplay mechanics, the art style, and the overall flow and feel of the game. The objective is to find a giant green ball with the least amount of deaths.",folderUrl:"/Content/games/Prototype"},{name:"Camera System Prototype",id:2,release:"4/12/2015",description:"This prototype focuses on testing out the camera system in the game. The purple box represents the camera focus point. You can toggle it on and off from the menu screen.",folderUrl:"/Content/games/CameraBuild"},{name:"Movement Prototype",id:3,release:"5/6/2015",description:"This prototype focuses on testing out the movements of the main organisms in the game. I am also experimenting with the aesthetics of these organisms. You can use a gamepad or the keyboard to move the organisms around.",folderUrl:"/Content/games/MovementBuild"},{name:"Intel Level Up GameDev Submission Prototype",id:4,release:"5/14/2015",description:"This prototype is what was submitted to the Intel Level Up GameDev Contest. It focuses on allowing the player to explore a habitat filled with different Organisms. You can not die and you can not win in this prototype. It is simply an exploration experience.",folderUrl:"/Content/games/IntelContestBuild"},{name:"Indiecade Submission Prototype",id:5,release:"6/1/2015",description:"This prototype is what was submitted to Indiecade 2015.",folderUrl:"/Content/games/IndiecadeBuild"},{name:"Egg Hatching Prototype",id:6,release:"7/3/2015",description:'Here I am testing out the egg hatching scene. This is along the lines of how the game will begin. There is an updated build here: <a href="www.organizam.com/#play/7">www.organizam.com/#play/7</a>',folderUrl:"/Content/games/EggHatchBuild"},{name:"Egg Hatching Prototype 2.0",id:7,release:"7/9/2015",description:"This build improves on the egg hatching experience by adding a releastic 2d breaking system.",folderUrl:"/Content/games/EggHatchBuild2"}],e.submitFeedback=function(t){n({url:"/api/feedback",method:"POST",data:{feedback:t},headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(t,n,a,o){e.feedbackSuccessful=!0}).error(function(t,n,a,o){e.feedbackFailed=!0,e.errorMessage=t})},e.playGame=function(e){return a.isPlaying=!1,e==a?void(a={}):(currentGameFolder=e.folderUrl,void t(function(){a=e,a.isPlaying=!0},10))},e.initGame=function(e){var t={width:960,height:600,params:{enableDebugging:"0"}};t.params.disableContextMenu=!0;var n=new UnityObject2(t),a=jQuery("#unityPlayer").find(".missing"),o=jQuery("#unityPlayer").find(".broken");a.hide(),o.hide(),n.observeProgress(function(e){switch(e.pluginStatus){case"broken":o.find("a").click(function(e){return e.stopPropagation(),e.preventDefault(),n.installPlugin(),!1}),o.show();break;case"missing":a.find("a").click(function(e){return e.stopPropagation(),e.preventDefault(),n.installPlugin(),!1}),a.show();break;case"installed":a.remove();break;case"first":}}),n.initPlugin(jQuery("#unityPlayer")[0],e.folderUrl+"/prototype.unity3d")},e.$watch("locationService.id",function(t){if(!t)return void e.playGame(e.games[e.games.length-1]);for(var n=0;n<e.games.length;n++){var a=e.games[n];if(a.id===locationService.id)return void e.playGame(a)}locationService.show404()})}]),mainApp.directive("customHtmlBind",["$compile",function(e){return{scope:{html:"=customHtmlBind"},compile:function(){return function(t,n){var a=function(){t.html&&(n.html(t.html),e(n.contents())(t))};a(),t.$watch("html",function(e,t){e!==t&&a()})}}}}]);var updateHeaderHeight=function(){$(".header").height($(".header .logo-section").outerHeight())};$(".header .logo-section img").on("load",function(){updateHeaderHeight(),$(window).resize(updateHeaderHeight)});