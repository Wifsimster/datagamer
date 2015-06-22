app.controller('CollectionCtrl', function ($scope, $http, $mdDialog, LxProgressService, LxNotificationService) {

    $scope.games = [];
    $scope.certifiedGames = [];
    $scope.uncertifiedGames = [];

    // Get collection video games
    $http.get('/collection/games').
        success(function (result) {
            if (result.code == 200) {
                $scope.games = result.games;
                $scope.certifiedGames = [];
                $scope.uncertifiedGames = [];

                // Split games in two type
                $scope.games.forEach(function (game) {
                    if (game.percentage == 100) {
                        $scope.certifiedGames.push(game);
                    } else {
                        $scope.uncertifiedGames.push(game);
                    }
                });

            } else {
                LxNotificationService.error(result.message);
            }
        }).
        error(function (err) {
            LxNotificationService.error(err);
        });

    $scope.change = function () {
        console.log($scope.path);
    }

    $scope.postProcessing = function () {
        LxProgressService.linear.show('#5fa2db', '#scan_progress');
        LxNotificationService.info('Post-processing started...');

        $http.get('/renamer/games/postprocessing').
            success(function (result) {
                LxProgressService.linear.hide();
                if (result.code == 201) {
                    LxNotificationService.success('Post-processing ended !');

                    // Update collection games list
                    $http.get('/collection/games').
                        success(function (result) {
                            if (result.code == 200) {

                                $scope.games = result.games;
                                $scope.certifiedGames = [];
                                $scope.uncertifiedGames = [];

                                // Split games in two type
                                $scope.games.forEach(function (game) {
                                    if (game.percentage == 100) {
                                        $scope.certifiedGames.push(game);
                                    } else {
                                        $scope.uncertifiedGames.push(game);
                                    }
                                });
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
                LxProgressService.linear.hide();
                LxNotificationService.error('Post-processing ended with error ! Need to check your conf.');
            });
    };

    $scope.scan = function () {
        LxProgressService.linear.show('#5fa2db', '#scan_progress');
        LxNotificationService.info('Scanning collection directory ...');

        $http.get('/renamer/games/scan').
            success(function (result) {
                LxProgressService.linear.hide();

                if (result.code == 201) {
                    LxNotificationService.success('Scan ended !');

                    // Update collection games list
                    $http.get('/collection/games').
                        success(function (result) {
                            if (result.code == 200) {

                                $scope.games = result.games;
                                $scope.certifiedGames = [];
                                $scope.uncertifiedGames = [];

                                // Split games in two type
                                $scope.games.forEach(function (game) {
                                    if (game.percentage == 100) {
                                        $scope.certifiedGames.push(game);
                                    } else {
                                        $scope.uncertifiedGames.push(game);
                                    }
                                });
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
                LxProgressService.linear.hide();
                LxNotificationService.error('Scan ended with error ! Need to check your conf.');
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

                    // Update collection game info
                    $http.put('/collection/games', res.game)
                        .success(function (res) {
                            if (res.code == 202) {
                                // Get collection video games
                                $http.get('/collection/games').
                                    success(function (result) {
                                        if (result.code == 200) {

                                            $scope.games = result.games;
                                            $scope.certifiedGames = [];
                                            $scope.uncertifiedGames = [];

                                            // Split games in two type
                                            $scope.games.forEach(function (game) {
                                                if (game.percentage == 100) {
                                                    $scope.certifiedGames.push(game);
                                                } else {
                                                    $scope.uncertifiedGames.push(game);
                                                }
                                            });
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

    $scope.deleteGame = function (id) {
        // Delete game from collection database
        $http.delete('/collection/games/' + id).
            success(function (result) {
                if (result.code == 204) {
                    // If ok, refresh collection games list
                    $http.get('/collection/games').
                        success(function (result) {
                            if (result.code == 200) {

                                $scope.games = result.games;
                                $scope.certifiedGames = [];
                                $scope.uncertifiedGames = [];

                                // Split games in two type
                                $scope.games.forEach(function (game) {
                                    if (game.percentage == 100) {
                                        $scope.certifiedGames.push(game);
                                    } else {
                                        $scope.uncertifiedGames.push(game);
                                    }
                                });
                            } else {
                                LxNotificationService.error(result.message);
                            }
                        }).
                        error(function (err) {
                            //console.error(err);
                            LxNotificationService.error(err);
                        });
                    LxNotificationService.notify('Game deleted from collection !', 'delete', false, 'grey');
                } else {
                    LxNotificationService.error(result.message);
                }
            }).
            error(function (err) {
                //console.error(err);
                LxNotificationService.error(err);
            });
    };

    $scope.deleteAllGames = function () {
        // Delete all games from collection database
        $http.delete('/collection/games').
            success(function (result) {
                if (result.code == 204) {
                    // If ok, refresh collection games list
                    $http.get('/collection/games').
                        success(function (result) {
                            if (result.code == 200) {

                                $scope.games = result.games;
                                $scope.certifiedGames = [];
                                $scope.uncertifiedGames = [];

                                // Split games in two type
                                $scope.games.forEach(function (game) {
                                    if (game.percentage == 100) {
                                        $scope.certifiedGames.push(game);
                                    } else {
                                        $scope.uncertifiedGames.push(game);
                                    }
                                });
                            } else {
                                LxNotificationService.error(result.message);
                            }
                        }).
                        error(function (err) {
                            //console.error(err);
                            LxNotificationService.error(err);
                        });
                    LxNotificationService.notify('Games deleted from collection !', 'delete', false, 'grey');
                } else {
                    LxNotificationService.error(result.message);
                }
            }).
            error(function (err) {
                //console.error(err);
                LxNotificationService.error(err);
            });
    };

    $scope.certifiedGame = function (game, ev) {
        $mdDialog.show({
            controller: CertificationDialogController,
            templateUrl: 'partials/certificationDialog.jade',
            targetEvent: ev,
            locals: {
                game: game
            }
        }).then(function () {

            // Update selected game with new game info
            $http.get('/collection/games').
                success(function (result) {
                    if (result.code == 200) {
                        $scope.games = result.games;
                        $scope.certifiedGames = [];
                        $scope.uncertifiedGames = [];

                        // Split games in two type
                        $scope.games.forEach(function (game) {
                            if (game.percentage == 100) {
                                $scope.certifiedGames.push(game);
                            } else {
                                $scope.uncertifiedGames.push(game);
                            }
                        });
                    } else {
                        LxNotificationService.error(result.message);
                    }
                }).
                error(function (err) {
                    LxNotificationService.error(err);
                });
        });
    }
});


function CertificationDialogController($scope, $http, game, $mdDialog) {

    $scope.originalTorrentName = game.originalTorrentName;
    $scope.game = game;

    // Return video games
    $scope.querySearch = function (query) {
        return $http.get("/datagamer/search/" + escape(query)).
            then(function (res) {
                if (res.data.code == 200) {
                    return res.data.games.slice(0, 10);
                } else {
                    return null;
                }
            });
    }

    $scope.selectedItemChange = function (item) {
        $scope.game.datagamer_id = item._id;
        $scope.game.name = item.defaultTitle;
        $scope.game.releaseDate = item.releaseDates[0].date;
    }

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.certify = function (game) {
        // Search info for new selected game to certify with his datagamer id
        $http.get('/datagamer/game/info/' + game.datagamer_id).
            success(function (res) {
                if (res.code == 200) {

                    // Save the datagamer id
                    res.game.datagamer_id = res.game._id;

                    // Change info of current game with new game info
                    res.game._id = game._id;

                    res.game.name = res.game.defaultTitle;
                    res.game.releaseDate = res.game.releaseDates[0].date;

                    var certifiedGame = res.game;

                    // Move the game directory to collection directory

                    // Set game to certified
                    certifiedGame.percentage = 100;

                    // Delete uncertified game from collection database
                    $http.delete('/collection/games/' + game._id).
                        success(function (res) {
                            console.log(res);
                            if (res.code == 204) {
                                // Save the new game to collection database
                                $http.post('/collection/games/', certifiedGame).
                                    success(function (res) {
                                        console.log(res);
                                        if (res.code == 201) {
                                            // Close dialog
                                            $mdDialog.hide();
                                        }
                                    });
                            }
                        });

                }
            });
    };
}

