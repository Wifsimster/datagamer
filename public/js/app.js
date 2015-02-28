var app = angular.module('StarterApp', ['ngMaterial', 'lumx', 'ngRoute', 'react']);

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
app.controller('AppCtrl', ['$scope', '$http', '$route', '$location', '$mdSidenav', 'LxNotificationService', function ($scope, $http, $routeParams, $location, $mdSidenav, LxNotificationService) {

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

    // Get the config.ini
    $http.get('/config').
        success(function (config) {
            // If user want to display notification for available update
            if (config.update.notification) {
                // Check update, if update display notification
                $http.get('/update/available').
                    success(function (result) {
                        // If success code : update available
                        if (result.code == 200) {
                            LxNotificationService.info('Update available !', true);
                        }
                    }).
                    error(function (err) {
                        LxNotificationService.error(err);
                    });
            }
        }).
        error(function (err) {
            LxNotificationService.error(err);
        });
}])
;

app.controller('SettingsCtrl', function ($scope, $rootScope, $http, $mdDialog, LxNotificationService, LxProgressService) {

    $rootScope.config = {};
    $scope.lastRelease = {};
    $scope.isUpdate = false;

    // Check update
    $http.get('/update/available').
        success(function (result) {
            if (result.code == 200) {
                $scope.isUpdate = true;
                $scope.lastRelease = result.releases[0];
            }
        }).
        error(function (err) {
            console.error(err);
        });

    // Update Datagamer with new release
    $scope.updateApp = function () {

        LxNotificationService.info('Updating...');

        // Get update
        $http.get('/update/release/' + $scope.lastRelease.tag_name).
            success(function (result) {
                console.log(result);
                if (result.code == 200) {
                    LxNotificationService.success('Update done !');
                    $scope.isUpdate = false;

                    // Update config on UI
                    $http.get('/config').
                        success(function (result) {
                            $rootScope.config = result;
                        }).
                        error(function (err) {
                            console.error(err);
                        });
                }
            }).
            error(function (err) {
                console.error(err);
            });
    };

    // Get the config.ini
    $http.get('/config').
        success(function (result) {
            //console.log(result);
            $rootScope.config = result;
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

    $scope.refreshSearchCron = function () {
        $http.get('/cron/search').
            success(function () {
                LxNotificationService.success('Search CRON restart !');
            }).
            error(function (err) {
                console.error(err);
                LxNotificationService.error('Something is wrong with search configuration !');
            });
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

    // Show request dialog
    $scope.showRequestDialog = function (ev) {
        $mdDialog.show({
            controller: RequestDialogController,
            templateUrl: 'partials/requestDialog.jade',
            targetEvent: ev
        });
    }
});

function RequestDialogController($scope, $rootScope, $mdDialog, $http, LxProgressService, LxNotificationService) {

    $scope.request = function () {
        if ($scope.username && $scope.email) {

            LxProgressService.linear.show('#5fa2db', '#apikey_progress');

            $http.post('/datagamer/request/user', {name: $scope.username, email: $scope.email}).
                success(function (result) {

                    console.log(result);

                    LxProgressService.linear.hide();
                    if (result.code == 201) {
                        $mdDialog.hide();
                        LxNotificationService.success('Your API key has been generated and saved !');

                        // Update config datagamer api key
                        $rootScope.config.search.datagamer.apikey = result.user.apiKey;

                    } else {
                        LxNotificationService.error(result.message);
                    }
                }).
                error(function (err) {
                    LxNotificationService.error('Something is wrong with Datagamer configuration !');
                    LxProgressService.linear.hide();
                });
        } else {
            LxNotificationService.error('Fields are mandatory !');
        }
    }

    $scope.requestCancel = function () {
        $mdDialog.cancel();
    };
}

app.controller('WantedCtrl', function ($scope, $http, LxNotificationService, LxProgressService) {

    $scope.wantedGames = [];

    // Get wanted video games
    $http.get('/wanted/games').
        success(function (result) {
            $scope.wantedGames = result;
        }).
        error(function (err) {
            LxNotificationService.error(err);
        });

    // Get the total video games on Datagamer db
    LxProgressService.circular.show('#5fa2db', '#datagamer_progress');
    $http.get('/datagamer/games/count').
        success(function (result) {
            if (result.code == 200) {
                $scope.datagamerCount = result.count;
                LxProgressService.circular.hide();
            } else {
                LxNotificationService.error('Datagamer - ' + result.message);
            }
        }).
        error(function (err) {
            LxNotificationService.error(err);
        });

    // Search input
    $scope.ajax = {
        list: [],
        update: function (newFilter, oldFilter) {
            if (newFilter) {
                $scope.ajax.loading = true;
                $http.get("/datagamer/search/" + escape(newFilter)).
                    success(function (data) {
                        //console.log('Datagmer response !');
                        $scope.ajax.list = data.games;
                        $scope.ajax.loading = false;
                    }).
                    error(function (err) {
                        //console.error(err);
                        $scope.ajax.loading = false;
                    });
            }
            else {
                $scope.ajax.list = false;
            }
        },
        loading: false,
        toModel: function (data) {

            // Save the Datagamer id
            data.datagamer_id = data._id;

            // Add new game to wanted database
            $http.post('/wanted/games', data).
                success(function (result) {
                    //if (result.code == 412) {
                    //    LxNotificationService.warning(data.name + ' already in wanted list !');
                    //}

                    // SUCCESS POST CODE
                    if (result.code == 201) {

                        LxNotificationService.success(result.game.name + ' added to wanted game !');

                        $scope.updateGameInfo(result.game.datagamer_id);

                        // If ok, refresh wanted games list
                        $http.get('/wanted/games').
                            success(function (result) {
                                $scope.wantedGames = result;
                            }).
                            error(function (err) {
                                LxNotificationService.error(err);
                            });
                    }
                }).
                error(function (err) {
                    LxNotificationService.error(err);
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
                        LxNotificationService.error(err);
                    });

                LxNotificationService.notify('Wanted game deleted !', 'delete', false, 'grey');
            }).
            error(function (err) {
                LxNotificationService.error(err);
            });
    };

    $scope.searchTorrents = function (id) {
        //console.log('Search for torrents');

        $http.get('/wanted/games/' + id).
            success(function (result) {

                var selectedGame = result.game;

                LxNotificationService.info('Searching new torrents for ' + selectedGame.name + '...');

                $http.get('/thepiratebay/search/' + selectedGame.name).
                    success(function (result) {

                        if (result.code == 200) {
                            LxNotificationService.success('Found ' + result.torrent.name + ' !');

                            $http.post('/transmission/add/', {url: result.torrent.magnetLink}).
                                success(function (res) {
                                    if (res) {
                                        //console.log('Torrent added to Transmission !');
                                        LxNotificationService.success(res.game.name + ' added to Transmission !');

                                        selectedGame.snatched = true;

                                        $http.put('/wanted/games', selectedGame).
                                            success(function () {
                                                //console.log('Game snatched !');

                                                // If ok, refresh wanted games list
                                                $http.get('/wanted/games').
                                                    success(function (result) {
                                                        $scope.wantedGames = result;
                                                    }).
                                                    error(function (err) {
                                                        LxNotificationService.error(err);
                                                    });
                                            }).
                                            error(function (err) {
                                                //console.error(err);
                                                LxNotificationService.error(err);
                                            });
                                    } else {
                                        LxNotificationService.error('No torrent added to Transmission !');
                                    }
                                }).
                                error(function (err) {
                                    if (err) {
                                        //console.error(err.result);
                                        LxNotificationService.error(JSON.parse(err.result).result);
                                    }
                                });

                        }
                        if (result.code == 404) {
                            LxNotificationService.error('No torrent found ' + selectedGame.name + ' !');
                        }
                    }).
                    error(function (err) {
                        //console.error(err);
                        LxNotificationService.error(err);
                    });
            }).
            error(function (err) {
                //console.error(err);
                LxNotificationService.error(err);
            });
    };

    $scope.updateGameInfo = function (datagamer_id) {

        LxProgressService.circular.show('#5fa2db', '#scan_progress');

        $http.get('/datagamer/game/info/' + datagamer_id).
            success(function (res) {

                // SUCCESS
                if (res.code == 200) {

                    // Save the datagamer id
                    res.game.datagamer_id = res.game._id;

                    // Reset snatched info
                    res.game.snatched = false;

                    // Update wanted game info
                    $http.put('/wanted/games', res.game)
                        .success(function (res) {
                            // Get wanted video games
                            $http.get('/wanted/games').
                                success(function (result) {
                                    $scope.wantedGames = result;
                                    // LxNotificationService.success('Game info refreshed !');
                                    LxProgressService.circular.hide();
                                }).
                                error(function (err) {
                                    LxNotificationService.error(err);
                                    LxProgressService.circular.hide();
                                });
                        })
                        .error(function (err) {
                            LxNotificationService.error(err);
                            LxProgressService.circular.hide();
                        });
                } else {
                    LxNotificationService.error(res.message);
                    LxProgressService.circular.hide();
                }
            }).
            error(function (err) {
                //console.error(err);
                LxNotificationService.error(err);
            });
    };

    $scope.scanNewReleases = function () {
        //console.log('Start new relealses scan...');
        LxNotificationService.success('Starting new releases scan...');
    };
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
            //console.error(err);
            LxNotificationService.error(err);
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
                        //console.error(err);
                        LxNotificationService.error('Scan ended with error !');
                    });
            }).
            error(function (err) {
                //console.error(err);
                LxProgressService.linear.hide();
                LxNotificationService.error('Scan ended with error ! Need to check your conf.');
            });
    };

    $scope.postProcessing = function () {
        LxProgressService.linear.show('#5fa2db', '#scan_progress');
        LxNotificationService.info('Post-processing started...');

        $http.get('/renamer/games/postprocessing').
            success(function (result) {
                LxProgressService.linear.hide();

                // Refresh game list
                $http.get('/collection/games').
                    success(function (result) {
                        $scope.postProcessingResult = result;
                        LxNotificationService.success('Post-processing ended. Collection updated !');
                    }).
                    error(function (err) {
                        //console.error(err);
                        LxNotificationService.error('Post-processing ended with error !');
                    });
            }).
            error(function (err) {
                //console.error(err);
                LxProgressService.linear.hide();
                LxNotificationService.error('Post-processing ended with error ! Need to check your conf.');
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
                        //console.error(err);
                        LxNotificationService.error(err);
                    });

                LxNotificationService.success('Game deleted from collection !');
            }).
            error(function (err) {
                //console.error(err);
                LxNotificationService.error(err);
            });
    };
});



