var app = angular.module('StarterApp', ['ngMaterial', 'lumx']);

app.controller('AppCtrl', ['$scope', '$http', '$mdSidenav', function ($scope, $http, $mdSidenav) {


    $scope.confirm = function (type) {
        console.log("Confirm click !" + type);
        if (type === 1) {
            LxNotificationService.confirm('Lorem Ipsum', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sit amet urna quis nisi sodales semper pharetra eu augue.', {
                cancel: 'Disagree',
                ok: 'Agree'
            }, function (answer) {
                console.log(answer);
            });
        }
    };

    // Pages for sidebar
    $scope.pages = ["Wanted", "Collection"];

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
