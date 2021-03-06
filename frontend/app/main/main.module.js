'use strict';

angular.module("app.main", [
    'app.account',
    'app.translations'
])

.controller("MainCtrl", function MainCtrl($scope, $translate, Account, Flash) {
    var main = this;

    main.getUser = Account.getUser;
    main.isUserSignedIn = Account.isUserSignedIn;
    main.signOut = Account.signOut;

    main.getFlashMessage = Flash.get;
    main.hasFlashMessage = Flash.hasMessage;

    if (!Account.isTokenExpired()) {
        Account.startTokenRenewal();
    }

    main.switchLang = function(newLang) {
        $translate.use(newLang);
        Flash.show(newLang);
    }
})

.factory("Flash", function Flash($translate, $timeout) {
    var flash = this;

    flash.hideScheduled = false;
    flash.message = null;

    flash.show = function show(message, timeout) {
        flash.message = {
            message: message,
            timeout: timeout || 5000
        };
    }

    flash.hide = function hide() {
        flash.message = null;
        flash.hideScheduled = false;
    }

    flash.get = function get() {
        if (flash.message == null) {
            return null;
        }
        if (!flash.hideScheduled) {
            flash.hideScheduled = true;
            $timeout(flash.hide, flash.message.timeout);
        }
        return flash.message.message;
    }

    flash.hasMessage = function hasMessage() {
        return flash.message != null;
    }

    return {
        show: flash.show,
        hide: flash.hide,
        get: flash.get,
        hasMessage: flash.hasMessage
    }
});
