(function($) {
    var passy = {
        strength: { LOW: 0, MEDIUM: 1, HIGH: 2, EXTREME: 3 },

        patterns: [
            '0123456789',
            'abcdefghijklmnopqrstuvwxyz',
            'qwertyuiopasdfghjklzxcvbnm',
            'azertyuiopqsdfghjklmwxcvbn',
            '!@#$%^&*()'
        ],

        threshold: {
            medium: 16,
            high: 22,
            extreme: 42
        }
    };

    if(Object.seal) Object.seal(passy.strength);
    if(Object.freeze) Object.freeze(passy.strength);

    passy.analize = function(password) {
        var score = Math.floor(password.length * 2);
        var i = password.length;

        score += $.passy.analizePatterns(password);
        while(i--) score += $.passy.analizeCharacter(password.charAt(i));

        return $.passy.analizeScore(score);
    };

    passy.analizeCharacter = function(char) {
        var code = char.charCodeAt(0);

        if(code >= 97 && code <= 122) return 1; // lower case
        if(code >= 48 && code <= 57) return 2;  // numeric
        if(code >= 65 && code <= 90) return 2;  // capital
        if(code <= 126) return 3;               // punctuation
        return 4;                               // foreign characters etc
    };

    passy.analizePattern = function(password, pattern) {
        var lastmatch = -1;
        var score = -2;

        for(var i = 0; i < password.length; i++) {
            var match = pattern.indexOf(password.charAt(i));

            if(lastmatch === match - 1) {
                lastmatch = match;
                score++;
            }
        }

        return Math.max(0, score);
    };

    passy.analizePatterns = function(password) {
        var chars = password.toLowerCase();
        var score = 0;

        for(var p in $.passy.patterns) {
            var pattern = $.passy.patterns[p].toLowerCase();
            score += $.passy.analizePattern(chars, pattern);
        }

        // patterns are bad man!
        return score * -5;
    };

    passy.analizeScore = function(score) {
        if(score >= $.passy.threshold.extreme) return $.passy.strength.EXTREME;
        if(score >= $.passy.threshold.high) return $.passy.strength.HIGH;
        if(score >= $.passy.threshold.medium) return $.passy.strength.MEDIUM;

        return $.passy.strength.LOW;
    };

    passy.generate = function(len) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()';
        var password = '';
        var index;

        while(len--) {
            index = Math.floor(Math.random() * chars.length);
            password += chars.charAt(index);
        }

        return password;
    };

    var methods = {
        init: function(callback) {
            var $this = $(this);

            $this.on('change keyup', function() {
                if(typeof callback !== 'function') return;
                callback.call($this, $.passy.analize($this.val()));
            });
        },

        generate: function(len) {
            this.val($.passy.generate(len));
            this.change();
        }
    };

    $.fn.passy = function(opt) {
        if(methods[opt]) {
            return methods[opt].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof opt === 'function' || !opt) {
            return methods.init.apply(this, arguments);
        }

        return this;
    };

    $.extend({ passy: passy });
})(jQuery);
