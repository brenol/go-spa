(function() {

    'use strict';

    angular.module('app.home', [
            'ui.router',
            'angular-storage',
            'angular-jwt',

            'app.main'
        ])
        .config(Config)
        .factory('Me', Me)
        .factory('Group', Group)
        .controller('HomeCtrl', HomeCtrl)
        .controller('MeCtrl', MeCtrl)
        .controller('GroupListCtrl', GroupListCtrl)
        .controller('GroupDetailCtrl', GroupDetailCtrl);

    function Config($stateProvider) {
        $stateProvider
            .state('home', {
                url: '',
                templateUrl: 'app/home/home.tmpl.html',
                controller: 'HomeCtrl as vm',
            })
            .state('home.me', {
                url: '/me',
                templateUrl: 'app/home/me.tmpl.html',
                controller: 'MeCtrl as vm',
                resolve: {
                    Me: 'Me',
                    user: function(Me) {
                        return Me.get();
                    }
                }
            })
            .state('home.group', {
                url: '/groups',
                templateUrl: 'app/home/group.list.tmpl.html',
                controller: 'GroupListCtrl as vm',
                resolve: {
                    Group: 'Group',
                    groups: function(Group) {
                        return Group.getAll();
                    }
                }
            })
            .state('home.group.detail', {
                url: '/:groupId',
                templateUrl: 'app/home/group.detail.tmpl.html',
                controller: 'GroupDetailCtrl as vm',
                resolve: {
                    group: function($stateParams, Group) {
                        return Group.getById($stateParams.groupId);
                    }
                }
            });
    }

    function Me($http, $q) {
        function get() {
            var deferred = $q.defer();
            $http.get("/api/v1/account/user/me")
                .then(function success(response) {
                    deferred.resolve(response.data);
                })
                .catch(function error(response) {
                    deferred.reject(response.data.error);
                });
            return deferred.promise;
        }
        return {
            get: get
        }
    }

    function Group($http, $q) {
        function getAll() {
            var deferred = $q.defer();
            $http.get("/api/v1/account/group")
                .then(function success(response) {
                    deferred.resolve(response.data);
                })
                .catch(function error(response) {
                    deferred.reject(response.data.error);
                });
            return deferred.promise;
        }

        function getById(id) {
            var deferred = $q.defer();
            $http.get("/api/v1/account/group/" + id)
                .then(function success(response) {
                    deferred.resolve(response.data);
                })
                .catch(function error(response) {
                    deferred.reject(response.data.error);
                });
            return deferred.promise;
        }

        function remove(group) {
            var deferred = $q.defer();
            $http.delete("/api/v1/account/group/" + group.id)
                .then(function success(response) {
                    deferred.resolve(response.data);
                })
                .catch(function error(response) {
                    deferred.reject(response.data.error);
                });
            return deferred.promise;
        }

        return {
            getAll: getAll,
            getById: getById,
            remove: remove
        }
    }

    function HomeCtrl($state) {
        var vm = this;
        vm.error = null;
    }

    function MeCtrl(user) {
        var vm = this;
        vm.user = user;
    }

    function GroupListCtrl(groups, Group, Flash) {
        var vm = this;
        vm.groups = groups;
        vm.delete = function(group) {
            Group.remove(group)
                .then(function success(response) {
                    Group.getAll()
                        .then(function success(response) {
                            vm.groups = response;
                        });
                    Flash.show("Deleted");
                })
                .catch(function error(response) {
                    Flash.show("Error!");
                });
        }
    }

    function GroupDetailCtrl(group) {
        var vm = this;
        vm.group = group;
    }

})();
