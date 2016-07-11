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

$(document).ready(function() {
    var updateHeight = function (amount) {
        setTimeout(function() {
            updateHeaderHeight();
            if (amount > 0) updateHeight(amount -1);
        }, 100);
    }

    var initialUpdate = function() {
        setTimeout(function() {
            var imgElement = $('.header .logo-section img');
            if (imgElement.length > 0 && imgElement[0].complete) updateHeight(20);
            else initialUpdate();
        }, 50);
    };

    initialUpdate();
    $(window).resize(updateHeaderHeight);
});
