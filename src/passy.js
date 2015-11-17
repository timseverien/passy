/*!
 * jQuery Passy
 * Generating and analazing passwords, realtime.
 *
 * Tim Severien
 * https://timseverien.github.io/passy/
 *
 * Copyright (c) 2013-2015 Tim Severien
 * Released under the MIT license.
 *
 */

(function($) {
	var passy = {
		// List of character types
		character: { DIGIT: 1, LOWERCASE: 2, UPPERCASE: 4, PUNCTUATION: 8, EXTENDED: 16 },

		// List of password strengths
		strength: { LOW: 0, MEDIUM: 1, HIGH: 2, EXTREME: 3 },

		// Guessing time threshold
		// Values are no. of days
		threshold: {
			medium: 365,
			high: Math.pow(365, 2),
			extreme: Math.pow(365, 5)
		}
	};


	/****************************************************************
	 * PASSWORD REQUIREMENTS
	 * Requirements a inserted/generated password should meet
	 ****************************************************************/

	passy.requirements = {

		// Types of characters
		characters: [
			passy.character.DIGIT,
			passy.character.LOWERCASE,
			passy.character.UPPERCASE,
			passy.character.PUNCTUATION
		],

		length: {
			min: 6,
			max: Infinity
		}
	};


	/****************************************************************
	 * CHARACTER RANGES
	 * A list of character types containing a list of min/max values
	 * used to identify a character and to calculate complexity
	 ****************************************************************/

	passy.charRanges = {};

	passy.charRanges[passy.character.DIGIT] = [
		{ min: 0x30, max: 0x39 }
	];

	passy.charRanges[passy.character.LOWERCASE] = [
		{ min: 0x41, max: 0x5A }
	];

	passy.charRanges[passy.character.UPPERCASE] = [
		{ min: 0x61, max: 0x7A }
	];

	passy.charRanges[passy.character.PUNCTUATION] = [
		{ min: 0x20, max: 0x2F },
		{ min: 0x3A, max: 0x40 },
		{ min: 0x5B, max: 0x60 },
		{ min: 0x7B, max: 0x7E },
	];

	passy.charRanges[passy.character.EXTENDED] = [
		{ min: 0x80, max: 0xFF }
	];


	/****************************************************************
	 * SEAL & FREEZE OBJECTS
	 ****************************************************************/

	if(Object.seal) {
		Object.seal(passy.character);
		Object.seal(passy.charRanges);
		Object.seal(passy.strength);
	}

	if(Object.freeze) {
		Object.freeze(passy.character);
		Object.freeze(passy.charRanges);
		Object.freeze(passy.strength);
	}


	/****************************************************************
	 * GET CHARACTER COUNT OF A TYPE
	 ****************************************************************/

	passy.getCharacterCount = function() {
		var count, i, k, range, ranges, type,
			charCount = {};

		// Iterate through character types
		for(k in passy.character) {
			count = 0;
			type = passy.character[k];
			ranges = passy.charRanges[type];

			// Iterate through character ranges
			for(i = 0; i < ranges.length; i++) {
				range = ranges[i];

				// Increment the range count
				// +1 because min and max are inclusive
				count += (range.max - range.min) + 1;
			}

			charCount[type] = count;
		}

		return charCount;
	};


	/****************************************************************
	 * TEST PASSWORD
	 ****************************************************************/

	passy.analyze = function(password) {
		var charScore = passy.analyzeCharacters(password),
			score = Math.pow(charScore, password.length) / 1000000;

		return passy.analyzeScore(score / 60 / 60 / 24);
	};


	/****************************************************************
	 * GET SCORE OF CHARACTERS
	 ****************************************************************/

	passy.analyzeCharacters = function(password) {
		var char, code, k, type,
			charCount = passy.getCharacterCount(),
			i = password.length,
			present = {},
			score = 0;

		// Iterate through character types
		for(k in passy.character) {
			type = passy.character[k];

			// Check if password contains type
			if(passy.contains(password, type)) {
				// Append amount of characters of that type
				score += charCount[type];
			}
		}

		return score;
	};


	/****************************************************************
	 * GET DUDGEMENT OF SCORE
	 ****************************************************************/

	passy.analyzeScore = function(score) {
		if(score >= passy.threshold.extreme) return passy.strength.EXTREME;
		if(score >= passy.threshold.high) return passy.strength.HIGH;
		if(score >= passy.threshold.medium) return passy.strength.MEDIUM;

		return passy.strength.LOW;
	};


	/****************************************************************
	 * GENERATE PASSWORD OF SET LENGTH
	 ****************************************************************/

	passy.generate = function(n) {
		var i, r,
			characters = passy.requirements.characters,
			password = '',
			types = [];

		n = Math.max(n, passy.requirements.length.min) || 8;

		characters = characters || [
			passy.character.DIGIT,
			passy.character.LOWERCASE,
			passy.character.UPPERCASE,
			passy.character.PUNCTUATION
		];

		// Generate a list of character types
		for(i = 0; i < characters.length; i++) types.push(characters[i]);

		if(n >= 1 && n < Infinity) {
			while(types.length < n) {
				r = Math.floor(Math.random() * passy.requirements.characters.length);
				types.push(passy.requirements.characters[r]);
			}
		}

		// Randomize
		types = types.sort(function(a, b) {
			return Math.random() < 0.5;
		});

		// Generate password based on types
		for(i = 0; i < types.length; i++) {
			password += passy.generateCharacter(types[i]);
		}

		return password;
	};

	passy.generateCharacter = function(type) {
		var r, range,
			ranges = passy.charRanges[type];

		// Get random range
		r = Math.floor(Math.random() * ranges.length);
		range = ranges[r];

		// Generate random char
		r = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
		return String.fromCharCode(r);
	};


	/****************************************************************
	 * CHECK IF A PASSWORD CONTAINS CHARACTERS OF A SPECIFIC TYPE
	 ****************************************************************/

	passy.contains = function(password, type) {
		var char,
			i = password.length;

		if(type === passy.character.DIGIT) {
			return /\d/.test(password);
		} else if(type === passy.character.LOWERCASE) {
			return /[a-z]/.test(password);
		} else if(type === passy.character.UPPERCASE) {
			return /[A-Z]/.test(password);
		} else if(
			type === passy.character.PUNCTUATION ||
			type === passy.character.EXTENDED
		) {
			while(i--) {
				if(passy.isCharacter(password.charAt(i), type))
					return true;
			}
		}

		return false;
	};


	/****************************************************************
	 * CHECK IF A CHARACTER IS OF TYPE
	 ****************************************************************/

	passy.isCharacter = function(char, type) {
		var range,
			code = char.charCodeAt(0),
			ranges = passy.charRanges[type] || [],
			i = ranges.length;

		while(i--) {
			range = ranges[i];

			if(
				code >= range.min &&
				code <= range.max
			) return true;
		}

		return false;
	};


	/****************************************************************
	 * VALIDATE PASSWORD
	 ****************************************************************/

	passy.valid = function(password) {
		var i;

		if(!passy.requirements) return true;

		if(
			password.length < passy.requirements.length.min ||
			password.length > passy.requirements.length.max
		) return false;

		for(i in passy.requirements.characters) {
			if(!passy.contains(password, passy.requirements.characters[i])) {
				return false;
			}
		}

		return true;
	};


	/****************************************************************
	 * API METHODS
	 ****************************************************************/

	var methods = {
		init: function(callback) {
			var $this = $(this);

			$this.each(function(i, e) {
				var $e = $(e);

				$e.on('change keyup', function() {
					if(typeof callback !== 'function') return;
					callback.call(
						$e,
						passy.analyze($e.val()),
						methods.valid.call($e)
					);
				});
			});
		},

		generate: function(len) {
			var $this = $(this);

			$this.each(function(i, e) {
				var $e = $(e);

				$e.val(passy.generate(len));
				$e.change();
			});
		},

		valid: function() {
			var $this = $(this),
				valid = true;

			$this.each(function(i, e) {
				var $e = $(e);

				if(!passy.valid($e.val())) {
					valid = false;
					return false;
				}
			});

			return valid;
		}
	};

	$.fn.passy = function(opt) {
		var args = Array.prototype.slice.call(arguments);
		var rargs = Array.prototype.slice.call(arguments, 1);

		if(methods[opt] && typeof methods[opt] === 'function') {
			return methods[opt].apply(this, rargs);
		} else if(typeof opt === 'function') {
			return methods.init.apply(this, args);
		}

		return this;
	};

	$.extend({ passy: passy });
})(jQuery);
