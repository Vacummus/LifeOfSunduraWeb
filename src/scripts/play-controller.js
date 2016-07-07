mainApp.controller('play-controller', ['$rootScope','$scope', '$timeout', '$http', function ($rootScope, $scope, $timeout, $http) {
    var currentGame = {};

    $rootScope.isLoading = false;

    $scope.games = [
        {
            name: 'Prototype',
            id: 1,
            release: '3/21/2015',
            description: 'The prototype focuses on testing out some simple gameplay mechanics, the art style, and the overall flow and feel of the game. The objective is to find a giant green ball with the least amount of deaths.',
            folderUrl: 'src/content/games/Prototype'
        },
        {
            name: 'Camera System Prototype',
            id: 2,
            release: '4/12/2015',
            description: 'This prototype focuses on testing out the camera system in the game. The purple box represents the camera focus point. You can toggle it on and off from the menu screen.',
            folderUrl: 'src/content/games/CameraBuild'
        },
        {
            name: 'Movement Prototype',
            id: 3,
            release: '5/6/2015',
            description: 'This prototype focuses on testing out the movements of the main organisms in the game. I am also experimenting with the aesthetics of these organisms. You can use a gamepad or the keyboard to move the organisms around.',
            folderUrl: 'src/content/games/MovementBuild'
        },
        {
            name: 'Intel Level Up GameDev Submission Prototype',
            id: 4,
            release: '5/14/2015',
            description: 'This prototype is what was submitted to the Intel Level Up GameDev Contest. It focuses on allowing the player to explore a habitat filled with different Organisms. You can not die and you can not win in this prototype. It is simply an exploration experience.',
            folderUrl: 'src/content/games/IntelContestBuild'
        },
        {
            name: 'Indiecade Submission Prototype',
            id: 5,
            release: '6/1/2015',
            description: 'This prototype is what was submitted to Indiecade 2015.',
            folderUrl: 'src/content/games/IndiecadeBuild'
        },
        {
            name: 'Egg Hatching Prototype',
            id: 6,
            release: '7/3/2015',
            description: 'Here I am testing out the egg hatching scene. This is along the lines of how the game will begin. There is an updated build here: <a href="www.organizam.com/#play/7">www.organizam.com/#play/7</a>',
            folderUrl: 'src/content/games/EggHatchBuild'
        },
        {
            name: 'Egg Hatching Prototype 2.0',
            id: 7,
            release: '7/9/2015',
            description: 'This build improves on the egg hatching experience by adding a releastic 2d breaking system.',
            folderUrl: 'src/content/games/EggHatchBuild2'
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

        $timeout(function () {
            currentGame = game;
            currentGame.isPlaying = true;
        }, 10);
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