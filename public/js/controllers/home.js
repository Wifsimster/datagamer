app.controller('HomeCtrl', function ($scope, $http, LxProgressService, LxNotificationService) {

    $scope.torrents = [];

    $http.get('/thepiratebay/top').
        success(function (result) {
            if (result.code == 200) {
                $scope.torrents = result.torrents;

                if (result.torrents.length < 1) {
                    LxNotificationService.warning("No data for the top 10 !");
                }
            } else {
                LxNotificationService.error(result.message);
            }
        }).
        error(function (err) {
            LxNotificationService.error(err);
        });

    $scope.add2Transmission = function (magnetLink) {
        $http.post('/transmission/add', {url: magnetLink}).
            success(function (result) {
                if (result.code == 201) {
                    LxNotificationService.success("Torrent added to Transmission !");
                } else {
                    LxNotificationService.error(result.message);
                }
            }).
            error(function (err) {
                LxNotificationService.error(err);
            });
    };

    $http.get('/datagamer/games/top').
        success(function (result) {
            if (result.code == 200) {
                $scope.topGames = result.games;
            } else {
                LxNotificationService.error(result.message);
            }
        }).
        error(function (err) {
            LxNotificationService.error(err);
        });

    $scope.add2WantedList = function (data) {

        // Save the Datagamer id
        data.datagamer_id = data._id;
        delete data._id;
        data.name = data.defaultTitle;
        data.releaseDate = data.releaseDates[0].date;

        $http.post('/wanted/games', data).
            success(function (result) {
                if (result.code == 201) {
                    LxNotificationService.success(data.defaultTitle + " added to wanted list !");
                } else {
                    LxNotificationService.error(result.message);
                }
            }).
            error(function (err) {
                LxNotificationService.error(err);
            });
    };
});
