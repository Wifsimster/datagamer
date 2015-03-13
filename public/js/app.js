var app = angular.module('StarterApp', ['ngMaterial', 'lumx', 'ngRoute', 'treeControl']);

// App configuration
app.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/partials/home',
                controller: 'HomeCtrl'
            })
            .when('/collection', {
                templateUrl: '/partials/collection',
                controller: 'CollectionCtrl'
            })
            .when('/settings', {
                templateUrl: '/partials/settings',
                controller: 'SettingsCtrl'
            })
            .when('/wanted', {
                templateUrl: '/partials/wanted',
                controller: 'WantedCtrl'
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
            subnav: ["General", "Advanced", "Update", "Collection", "Datagamer", "ThePirateBay", "Transmission", "Renamer"]
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
}]);