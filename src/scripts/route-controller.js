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