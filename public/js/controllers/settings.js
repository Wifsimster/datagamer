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

    $scope.transmission_test = function () {

        LxProgressService.linear.show('#5fa2db', '#transmission_progress');

        $http.get('/transmission/test').
            success(function (result) {
                if (result.code == 200) {
                    LxProgressService.linear.hide();
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

    // Show tree view dialog
    $scope.debugTreeViewDialog = function (ev) {
        $mdDialog.show({
            controller: TreeViewDialogController,
            templateUrl: 'partials/treeViewDialog.jade',
            targetEvent: ev
        }).then(function (node) {
            // Set selected directory
            $scope.config.advanced.debug_directory = node.rel_path;

            // Trigger update config file
            $scope.update($scope.config);
        });
    };

    $scope.scanTreeViewDialog = function (ev) {
        $mdDialog.show({
            controller: TreeViewDialogController,
            templateUrl: 'partials/treeViewDialog.jade',
            targetEvent: ev
        }).then(function (node) {
            // Set selected directory
            $scope.config.collection.directory = node.rel_path;

            // Trigger update config file
            $scope.update($scope.config);
        });
    };

    $scope.transmissionTreeViewDialog = function (ev) {
        $mdDialog.show({
            controller: TreeViewDialogController,
            templateUrl: 'partials/treeViewDialog.jade',
            targetEvent: ev
        }).then(function (node) {
            // Set selected directory
            $scope.config.transmission.directory = node.rel_path;

            // Trigger update config file
            $scope.update($scope.config);
        });
    };

    $scope.renamerFromTreeViewDialog = function (ev) {
        $mdDialog.show({
            controller: TreeViewDialogController,
            templateUrl: 'partials/treeViewDialog.jade',
            targetEvent: ev
        }).then(function (node) {
            // Set selected directory
            $scope.config.renamer.from = node.rel_path;

            // Trigger update config file
            $scope.update($scope.config);
        });
    };

    $scope.renamerToTreeViewDialog = function (ev) {
        $mdDialog.show({
            controller: TreeViewDialogController,
            templateUrl: 'partials/treeViewDialog.jade',
            targetEvent: ev
        }).then(function (node) {
            // Set selected directory
            $scope.config.renamer.to = node.rel_path;

            // Trigger update config file
            $scope.update($scope.config);
        });
    };
});

function RequestDialogController($scope, $rootScope, $mdDialog, $http, LxProgressService, LxNotificationService) {

    $scope.request = function () {
        if ($scope.username && $scope.email) {

            LxProgressService.linear.show('#5fa2db', '#apikey_progress');

            $http.post('/datagamer/request/user', {name: $scope.username, email: $scope.email}).
                success(function (result) {

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

function TreeViewDialogController($scope, $rootScope, $mdDialog, $http, LxProgressService, LxNotificationService) {
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

        LxProgressService.circular.show('#5fa2db', '#progress');

        $http.get('/directories/?path=' + node.rel_path).
            success(function (response) {
                if (response.code == 200) {

                    // Populate children
                    populateChildren($scope.dataForTheTree, node, response);
                } else {
                    LxNotificationService.error(response.message);
                }
                LxProgressService.circular.hide();
            }).
            error(function () {
                callback();
            });

    };

    $scope.showSelected = function (node) {
        $mdDialog.hide(node);
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

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
}