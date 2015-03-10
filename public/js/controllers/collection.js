app.controller('CollectionCtrl', function ($scope, $http, LxProgressService, LxNotificationService) {

    $scope.games = [];

    $scope.treeOptions = {
        nodeChildren: "children",
        dirSelectable: true,
        injectClasses: {
            ul: "a1",
            li: "a2",
            liSelected: "a7",
            iExpanded: "a3",
            iCollapsed: "a4",
            iLeaf: "a5",
            label: "a6",
            labelSelected: "a8"
        }
    }

    $scope.srcpath = "c:/";

    // Initialize tree view to root path
    $http.get('/directories/?path=' + $scope.srcpath).
        success(function (response) {
            if (response.code == 200) {
                $scope.dataForTheTree = response.directories;
            } else {
                LxNotificationService.error(response.message);
            }
        }).
        error(function () {
            callback();
        });

    // Recursive populate
    populateChildren = function (tree, node, response) {
        if (tree) {
            for (var i = 0; i < tree.length; i++) {
                if (tree[i].rel_path == node.rel_path) {
                    tree[i].children = response.directories;
                    return;
                }
                populateChildren(tree[i].children, node, response);
            }
        }
    };

    $scope.showToggle = function (node, expanded) {

        $http.get('/directories/?path=' + node.rel_path).
            success(function (response) {
                if (response.code == 200) {

                    // Populate children
                    populateChildren($scope.dataForTheTree, node, response);

                } else {
                    LxNotificationService.error(response.message);
                }
            }).
            error(function () {
                callback();
            });

    };

    $scope.showSelected = function (node) {
        $scope.selectedNode = node;
    };

    $scope.srcpathChange = function () {
        $http.get('/directories/?path=' + $scope.srcpath).
            success(function (response) {
                if (response.code == 200) {
                    $scope.dataForTheTree = response.directories;
                } else {
                    LxNotificationService.error(response.message);
                }
            }).
            error(function () {
                callback();
            });
    };

    // Get collection video games
    $http.get('/collection/games').
        success(function (result) {
            if (result.code == 200) {
                $scope.games = result.games;
            } else {
                LxNotificationService.error(result.message);
            }
        }).
        error(function (err) {
            //console.error(err);
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
                    $scope.postProcessingResult = result;
                    LxNotificationService.success('Post-processing ended !');

                    // Update collection games list
                    $http.get('/collection/games').
                        success(function (result) {
                            if (result.code == 200) {
                                $scope.games = result.games;
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

                    // Update wanted game info
                    $http.put('/collection/games', res.game)
                        .success(function (res) {
                            if (res.code == 202) {
                                // Get wanted video games
                                $http.get('/collection/games').
                                    success(function (result) {
                                        if (result.code == 200) {
                                            $scope.games = result.games;
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
});
