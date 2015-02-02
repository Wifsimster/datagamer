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

    $scope.breadcrumb = $location.path();

    $scope.isActive = function (route) {
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
            subnav: ["General", "Advanced", "Update", "Search", "Providers", "Transmission", "Renamer"]
        }];

// Hide sidebar left on action
    $scope.openLeftMenu = function () {
        $mdSidenav('left').toggle();
    };

// Single select with ajax and change handler
    $scope.ajax = {
        list: [],
        update: function (newFilter, oldFilter) {
            if (newFilter) {
                $scope.ajax.loading = true;
                $http.get('http://192.168.0.21:8084/api/games/by/name/' + escape(newFilter), {
                    headers: {
                        "apiKey": "b3dae6c0-83a0-4721-9901-bf0ee7011af8"
                    }
                }).
                    success(function (result) {
                        $scope.ajax.list = result.games;
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
        loading: false
    };
}])
;

app.controller('SettingsCtrl', function ($scope, $http, LxNotificationService, LxProgressService) {

    $scope.config = {};

    // Get the unique settings in database
    $http.get('/config').
        success(function (result) {
            console.log(result);
            $scope.config = result;
        }).
        error(function (err) {
            console.error(err);
        });

    // Update settings
    $scope.update = function (config) {
        console.log("Updating config.ini...");

        $http.put('/config', $scope.config).
            success(function (result) {
                LxNotificationService.success('config.ini updated !');
                console.log(result);
            }).
            error(function (err) {
                console.error(err);
            });
    }

    $scope.transmission_test = function () {

        LxProgressService.linear.show('#5fa2db', '#transmission_progress');

        $http.get('/transmission/torrents').
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


app.controller('WantedCtrl', function ($scope, $http) {

    // Get games from Datagamer
    $http.get('http://192.168.0.21:8084/api/games', {
        headers: {
            "apiKey": "b3dae6c0-83a0-4721-9901-bf0ee7011af8"
        }
    }).
        success(function (result) {
            $scope.games = result.games;

        }).
        error(function (err) {
            console.error(err);
        });

});

app.controller('CollectionCtrl', function ($scope) {

});



