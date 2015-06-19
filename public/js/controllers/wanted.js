app.controller('WantedCtrl', function ($scope, $http, LxNotificationService, LxProgressService) {

    $scope.wantedGames = [];
    $scope.datagamerCount = -1;

    // Get wanted video games
    $http.get('/wanted/games').
        success(function (result) {
            if (result.code == 200) {
                $scope.wantedGames = result.games;
            } else {
                LxNotificationService.error(result.message);
            }
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
                $scope.datagamerCount = null;
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
                LxProgressService.linear.show('#5fa2db', '#scan_progress');

                $http.get("/datagamer/search/" + escape(newFilter)).
                    success(function (data) {
                        console.log('Datagamer response !');
                        console.log(data.games);
                        $scope.ajax.list = data.games.slice(0, 10);
                        $scope.ajax.loading = false;
                        LxProgressService.linear.hide();
                    }).
                    error(function (err) {
                        console.error(err);
                        $scope.ajax.loading = false;
                        LxProgressService.linear.hide();
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
            delete data._id;
            data.name = data.defaultTitle;
            data.releaseDate = data.releaseDates[0].date;

            if (data.datagamer_id) {
                // Add new game to wanted database
                $http.post('/wanted/games', data).
                    success(function (result) {
                        //if (result.code == 412) {
                        //    LxNotificationService.warning(data.name + ' already in wanted list !');
                        //}

                        // SUCCESS POST CODE
                        if (result.code == 201) {

                            LxNotificationService.success(result.game.name + ' added to wanted game !');

                            $scope.updateGameInfo(result.game._id, result.game.datagamer_id);

                            // If ok, refresh wanted games list
                            $http.get('/wanted/games').
                                success(function (result) {
                                    if (result.code == 200) {
                                        $scope.wantedGames = result.games;
                                    } else {
                                        LxNotificationService.error(result.message);
                                    }
                                }).
                                error(function (err) {
                                    LxNotificationService.error(err);
                                });
                        } else {
                            LxNotificationService.error(result.message);
                        }
                    }).
                    error(function (err) {
                        LxNotificationService.error(err);
                    });
            }
        }
    };

    $scope.deleteWantedGame = function (id) {
        // Delete wanted game from database
        $http.delete('/wanted/games/' + id).
            success(function (result) {
                if (result.code == 204) {
                    // If ok, refresh wanted games list
                    $http.get('/wanted/games').
                        success(function (result) {
                            if (result.code == 200) {
                                $scope.wantedGames = result.games;
                            } else {
                                LxNotificationService.error(result.message);
                            }
                        }).
                        error(function (err) {
                            LxNotificationService.error(err);
                        });
                    LxNotificationService.notify('Wanted game deleted !', 'delete', false, 'grey');
                } else {
                    LxNotificationService.error(result.message);
                }
            }).
            error(function (err) {
                LxNotificationService.error(err);
            });
    };

    $scope.searchTorrents = function (id) {

        LxProgressService.linear.show('#5fa2db', '#scan_progress_' + id);

        $http.get('/wanted/games/' + id).
            success(function (result) {

                var selectedGame = result.game;

                //LxNotificationService.info('Searching new torrents for ' + selectedGame.name + '...');

                $http.get('/thepiratebay/search/' + selectedGame.name).
                    success(function (result) {

                        if (result.code == 200) {
                            LxNotificationService.success('Found ' + result.torrent.name + ' !');

                            $http.post('/transmission/add/', {url: result.torrent.magnetLink}).
                                success(function (res) {
                                    if (res.code == 201) {
                                        LxNotificationService.success(result.torrent.name + ' added to Transmission !');

                                        selectedGame.snatched = true;

                                        $http.put('/wanted/games', selectedGame).
                                            success(function () {
                                                // If ok, refresh wanted games list
                                                $http.get('/wanted/games').
                                                    success(function (result) {
                                                        $scope.wantedGames = result.games;
                                                        LxProgressService.linear.hide();
                                                    }).
                                                    error(function (err) {
                                                        LxNotificationService.error(err);
                                                        LxProgressService.linear.hide();
                                                    });
                                            }).
                                            error(function (err) {
                                                //console.error(err);
                                                LxNotificationService.error(err);
                                                LxProgressService.linear.hide();
                                            });
                                    } else {
                                        LxNotificationService.error('No torrent added to Transmission !');
                                        LxProgressService.linear.hide();
                                    }
                                }).
                                error(function (err) {
                                    LxNotificationService.error(err.message);
                                    LxProgressService.linear.hide();
                                });

                        }
                        if (result.code == 404) {
                            LxNotificationService.error('No torrent found for ' + selectedGame.name + ' !');
                            LxProgressService.linear.hide();
                        }
                    }).
                    error(function (err) {
                        //console.error(err);
                        LxNotificationService.error(err);
                        LxProgressService.linear.hide();
                    });
            }).
            error(function (err) {
                //console.error(err);
                LxNotificationService.error(err);
                LxProgressService.linear.hide();
            });
    };

    $scope.updateGameInfo = function (id, datagamer_id) {

        LxProgressService.linear.show('#5fa2db', '#scan_progress_' + id);

        $http.get('/datagamer/game/info/' + datagamer_id).
            success(function (res) {
                if (res.code == 200) {

                    // Save the datagamer id
                    res.game.datagamer_id = res.game._id;
                    delete res.game._id;
                    res.game.name = res.game.defaultTitle;
                    res.game.releaseDate = res.game.releaseDates[0].date;

                    // Reset snatched info
                    res.game.snatched = false;

                    if (res.game.datagamer_id) {
                        // Update wanted game info
                        $http.put('/wanted/games', res.game)
                            .success(function (res) {
                                if (res.code == 202) {
                                    // Get wanted video games
                                    $http.get('/wanted/games').
                                        success(function (result) {
                                            if (result.code == 200) {
                                                $scope.wantedGames = result.games;
                                                LxProgressService.linear.hide();
                                            } else {
                                                LxNotificationService.error(result.message);
                                                LxProgressService.linear.hide();
                                            }
                                        }).
                                        error(function (err) {
                                            LxNotificationService.error(err);
                                            LxProgressService.linear.hide();
                                        });
                                } else {
                                    LxNotificationService.error(res.message);
                                    LxProgressService.linear.hide();
                                }
                            })
                            .error(function (err) {
                                LxNotificationService.error(err);
                                LxProgressService.linear.hide();
                            });
                    }
                } else {
                    LxNotificationService.error(res.message);
                    LxProgressService.linear.hide();
                }
            }).
            error(function (err) {
                //console.error(err);
                LxNotificationService.error(err);
                LxProgressService.linear.hide();
            });
    };
});