app.controller('HomeCtrl', function ($scope, $http, LxProgressService, LxNotificationService) {

    $scope.torrents = [];
    LxProgressService.circular.show('#5fa2db', '#torrents_progress');

    $http.get('/thepiratebay/top').
        success(function (result) {
            if (result.code == 200) {
                $scope.torrents = result.torrents;

                if(result.torrents.length < 1) {
                    LxNotificationService.warning("No data for the top 10 !");
                }
            } else {
                LxNotificationService.error(result.message);
            }
            LxProgressService.circular.hide();
        }).
        error(function (err) {
            LxNotificationService.error(err);
            LxProgressService.circular.hide();
        });

    $scope.parseTorrent = function (name) {
        $http.get('renamer/parse/' + name).
            success(function (res) {
                if (res.code == 200) {
                    console.log(res.game);
                } else {
                    LxNotificationService.error(res.message);
                }
            }).
            error(function (err) {
                LxNotificationService.error(err);
            });
    }

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
    }
});
