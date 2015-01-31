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
app.controller('AppCtrl', ['$scope', '$http', '$route', '$location', function ($scope, $http, $routeParams, $location) {

    $scope.breadcrumb = $location.path();

    $scope.isActive = function (route) {
        console.log(route + " / " + $location.path());
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
            url: "settings"
        }];

    // Sub-menu for settings sidebar
    $scope.settings = ["General", "Searcher", "Downloaders", "Renamer", "Automation", "Notifications", "Manage", "About"];

    $scope.next = function () {
        $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2);
    };
    $scope.previous = function () {
        $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
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
}]);

app.controller('WantedCtrl', function ($scope) {

});

app.controller('SettingsCtrl', function ($scope) {

});

app.controller('CollectionCtrl', function ($scope) {

});
