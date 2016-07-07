var mainApp = angular.module('main', ["ngAnimate", "ngRoute"]);

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

var updateHeaderHeight = function () {
    $('.header').height($('.header .logo-section').outerHeight());
};

$('.header .logo-section img').on('load', function() {
    updateHeaderHeight();
    $(window).resize(updateHeaderHeight);
});
