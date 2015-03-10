app.controller('HomeCtrl', function ($scope, $http, LxProgressService, LxNotificationService) {

    $scope.torrents = [];
    LxProgressService.circular.show('#5fa2db', '#torrents_progress');

    $http.get('/thepiratebay/top').
        success(function (result) {
            if (result.code == 200) {
                $scope.torrents = result.torrents;
            } else {
                LxNotificationService.error(result.message);
            }
            LxProgressService.circular.hide();
        }).
        error(function (err) {
            LxNotificationService.error(err);
            LxProgressService.circular.hide();
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
    }
});
