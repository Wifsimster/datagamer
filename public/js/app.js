var app = angular.module('StarterApp', ['ngMaterial', 'lumx', 'ngRoute']);

// App configuration
app.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/wanted', {
                templateUrl: '/partials/wanted',
                controller: 'WantedCtrl'
            })
            .when('/settings', {
                templateUrl: '/partials/settings',
                controller: 'SettingsCtrl'
            })
            .when('/collection', {
                templateUrl: '/partials/collection',
                controller: 'CollectionCtrl'
            });

        $locationProvider.html5Mode({enabled: true, requireBase: false});
    }]);

// App controller
app.controller('AppCtrl', ['$scope', '$http', '$route', '$location', '$mdSidenav', function ($scope, $http, $routeParams, $location, $mdSidenav) {

    // Hide/Show subnav on click
    $scope.show = false;

    if ($location.path() == "/settings") {
        $scope.show = true;
    }

    $scope.toggle = function () {
        $scope.show = $scope.show === false ? true : false;
    };

    $scope.isOpen = function () {
        return $scope.show;
    };

    $scope.isActive = function (route) {

        // Update breadcrumb on click
        $scope.breadcrumb = $location.path().split("/")[1];

        return route === $location.path();
    }

    // Pages for sidebar
    $scope.pages = [
        {
            title: "Home",
            url: ""
        }, {
            title: "Wanted",
            url: "wanted"
        }, {
            title: "Collection",
            url: "collection"
        }, {
            title: "Settings",
            url: "settings",
            subnav: ["General", "Advanced", "Update", "Collection", "Search", "Providers", "Transmission", "Renamer"]
        }];

// Hide sidebar left on action
    $scope.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };
}])
;

app.controller('SettingsCtrl', function ($scope, $http, LxNotificationService, LxProgressService) {

    $scope.config = {};

    // Get the unique settings in database
    $http.get('/config').
        success(function (result) {
            //console.log(result);
            $scope.config = result;
        }).
        error(function (err) {
            console.error(err);
        });

    // Update config inputs
    $scope.update = function (config) {
        //console.log("Updating config.ini...");

        if (config.general.port == null) {
            LxNotificationService.error('Port cannot be empty !');
        } else {
            if (config.collection.directory == null) {
                LxNotificationService.error('Collection directory cannot be empty !');
            } else {
                $http.put('/config', $scope.config).
                    success(function (result) {
                        LxNotificationService.success('config.ini updated !');
                        //console.log(result);
                    }).
                    error(function (err) {
                        console.error(err);
                    });
            }
        }
    }

    $scope.thepiratebay_test = function () {
        LxProgressService.linear.show('#5fa2db', '#thepiratebay_progress');

        $http.get('/thepiratebay/test').
            success(function () {
                LxProgressService.linear.hide();
                LxNotificationService.success('ThePirateBay provider is OK');
            }).
            error(function (err) {
                console.error(err);
                LxProgressService.linear.hide();
                LxNotificationService.error('Something is wrong with ThePirateBay configuration !');
            });
    }

    $scope.kickasstorrents_test = function () {
        LxProgressService.linear.show('#5fa2db', '#kickasstorrents_progress');

        $http.get('/kickasstorrents/test').
            success(function () {
                LxProgressService.linear.hide();
                LxNotificationService.warning('KickAssTorrents provider is not implemented yet.');
            }).
            error(function (err) {
                console.error(err);
                LxProgressService.linear.hide();
                LxNotificationService.error('Something is wrong with KickAssTorrents configuration !');
            });
    }

    $scope.transmission_test = function () {

        LxProgressService.linear.show('#5fa2db', '#transmission_progress');

        $http.get('/transmission/test').
            success(function (result) {
                LxProgressService.linear.hide();

                if (result.torrents) {
                    LxNotificationService.success('Transmission is OK');
                } else {
                    LxNotificationService.error('Something is wrong with Transmission configuration !');
                }
            }).
            error(function (err) {
                console.error(err);
                LxProgressService.linear.hide();
                LxNotificationService.error('Something is wrong with Transmission configuration !');
            });
    }
});


app.controller('WantedCtrl', function ($scope, $http, LxNotificationService) {

    $scope.wantedGames = [];

    // Get wanted video games
    $http.get('/wanted/games').
        success(function (result) {
            //console.log(result);
            $scope.wantedGames = result;
        }).
        error(function (err) {
            console.error(err);
        });

    // Get the total video games on Datagamer db
    $http.get('/datagamer/games/count').
        success(function (result) {
            //console.log(result);
            $scope.datagamerCount = result.count;
        }).
        error(function (err) {
            console.error(err);
        });

    // Search input
    $scope.ajax = {
        list: [],
        update: function (newFilter, oldFilter) {
            if (newFilter) {
                $scope.ajax.loading = true;
                $http.get("/datagamer/search/" + escape(newFilter)).
                    success(function (data) {
                        $scope.ajax.list = data.games;
                        $scope.ajax.loading = false;
                    }).
                    error(function () {
                        $scope.ajax.loading = false;
                    });
            }
            else {
                $scope.ajax.list = false;
            }
        },
        loading: false,
        toModel: function (data) {
            // Add new game to wanted database
            $http.post('/wanted/games', data).
                success(function (result) {

                    console.log(result)

                    if (result.code == 412) {
                        LxNotificationService.warning(data.name + ' already in wanted list !');
                    }

                    // SUCCESS CODE
                    if (result.code == 200) {

                        LxNotificationService.success(data.name + ' added to wanted game !');

                        // If ok, refresh wanted games list
                        $http.get('/wanted/games').
                            success(function (result) {
                                $scope.wantedGames = result;
                            }).
                            error(function (err) {
                                console.error(err);
                            });
                    }
                }).
                error(function (err) {
                    console.error(err);
                });
        }
    };

    $scope.deleteWantedGame = function (id) {
        // Delete wanted game from database
        $http.delete('/wanted/games/' + id).
            success(function (result) {
                // If ok, refresh wanted games list
                $http.get('/wanted/games').
                    success(function (result) {
                        $scope.wantedGames = result;
                    }).
                    error(function (err) {
                        console.error(err);
                    });

                LxNotificationService.success('Wanted game deleted !');
            }).
            error(function (err) {
                console.error(err);
            });
    };

    $scope.searchTorrents = function (id) {
        //console.log('Search for torrents');

        $http.get('/wanted/games/' + id).
            success(function (game) {

                LxNotificationService.info('Searching new torrents for ' + game.name + '...');

                $http.get('/thepiratebay/search/' + game.name).
                    success(function (torrent) {
                        if (torrent) {
                            //console.log('Found one torrent : ' + torrent.name);
                            LxNotificationService.success('Found ' + torrent.name + ' !');

                            $http.post('/transmission/add/', {url: torrent.magnetLink}).
                                success(function (res) {
                                    if (res) {
                                        //console.log('Torrent added to Transmission !');
                                        LxNotificationService.success(res.name + ' added to Transmission !');
                                    } else {
                                        LxNotificationService.error('No torrent added to Transmission !');
                                    }
                                }).
                                error(function (err) {
                                    if (err) {
                                        console.error(err.result);
                                        LxNotificationService.error(JSON.parse(err.result).result);
                                    }
                                });

                        } else {
                            LxNotificationService.error('No torrent found for ' + game.name + ' !');
                        }
                    }).
                    error(function (err) {
                        console.error(err);
                    });
            }).
            error(function (err) {
                console.error(err);
            });
    };

    $scope.scanNewReleases = function () {
        console.log('Start new relealses scan...');
        LxNotificationService.success('Starting new releases scan...');
    }
});

app.controller('CollectionCtrl', function ($scope, $http, LxProgressService, LxNotificationService) {

    $scope.games = [];

    // Get collection video games
    $http.get('/collection/games').
        success(function (result) {
            //console.log(result);
            $scope.games = result;
        }).
        error(function (err) {
            console.error(err);
        });

    $scope.scanGames = function () {
        LxProgressService.linear.show('#5fa2db', '#scan_progress');
        LxNotificationService.info('Scan started...');

        $http.get('/collection/games/scan').
            success(function (result) {
                LxProgressService.linear.hide();

                // Refresh game list
                $http.get('/collection/games').
                    success(function (result) {
                        //console.log(result);
                        $scope.games = result;
                        LxNotificationService.success('Scan ended. Collection updated !');
                    }).
                    error(function (err) {
                        console.error(err);
                        LxNotificationService.error('Scan ended with error !');
                    });
            }).
            error(function (err) {
                console.error(err);
                LxProgressService.linear.hide();
                LxNotificationService.error('Scan ended with error ! Need to check your conf.');
            });
    };

    $scope.deleteGame = function (id) {
        // Delete game from collection database
        $http.delete('/collection/games/' + id).
            success(function (result) {
                // If ok, refresh collection games list
                $http.get('/collection/games').
                    success(function (result) {
                        $scope.games = result;
                    }).
                    error(function (err) {
                        console.error(err);
                    });

                LxNotificationService.success('Game deleted from collection !');
            }).
            error(function (err) {
                console.error(err);
            });
    };
});



