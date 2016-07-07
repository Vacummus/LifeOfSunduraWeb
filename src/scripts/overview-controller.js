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