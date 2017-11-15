/**
 * Default option container for ScrollAnimation CSS values.
 * Making this a class might be overkill?
 */
class ScrollAnimationValueSet {

	/**
	 * Constructor. All it does is merge supplied options with defaults.
	 *
	 * @param {obj} options
	 *     Parameters for constructing CSS values to be put in a single CSS rule.
	 *         {str} unit: CSS unit
	 *         {str} valueFormat: String surrounding the CSS value, using a substitution string of your choice
	 *         {str} substitutionString: As above
	 *         {number} startValue: The value applied to the element the moment it is scrolled onto the screen
	 *         {number} endValue: The value applied to the element the moment it is scrolled off the screen
	 *         {number} resetValue: The value applied to the element when the animation is disabled
	 *
	 */
	constructor(options) {
		var defaultOptions = {
			unit: 'vh',
			valueFormat: 'translateY(_)',
			substitutionString: '_',
			startValue: 20,
			endValue: -20,
			resetValue: 0
		};

		options = Object.assign({}, defaultOptions, options);

		Object.getOwnPropertyNames(options).forEach(name => {
			this[name] = options[name];
		});
	}
}

/**
 * Class to create and manage animations that are based on scrolling the window.
 */
class ScrollAnimation {
	/**
	 * Constructor.
	 *
	 * @param {array<HTMLElement>} animateTargets
	 *     The elements to animate based on the scroll position of the ScrollDetector
	 *
	 * @param {ScrollDetector} scrollDetector
	 *
	 * @param {object} options
	 *     Other options that may be omitted to use default values
	 *         {array<string>} properties: The JavaScript CSS property names to modify
	 *         {string} valueSetSeparator: String on which to join the different CSS values for this rule
	 *         {bool} removePropertiesOnReset: Whether to unset the CSS properties altogether on deactivation,
	 *             instead of setting them to the resetValue
	 *         {MediaQueryList} activeMediaQueryList: The MediaQueryList controlling activation and deactivation of this object
	 *         {bool} activateImmediately: Whether to turn on the animation immediately upon construction.
	 *             (Even if true, the animation will not activate if activeMediaQueryList.matches is false.)
	 *
	 * @param {array<ScrollAnimationValueSet>} valueSets
	 *     Configuration for one or more values to be used in the single CSS rule
	 *     this object manages.
	 */
	constructor(animateTargets, scrollDetector, options, valueSets = [ new ScrollAnimationValueSet() ]) {
		var defaultOptions = {
			properties: ['transform', 'msTransform'],
			valueSetSeparator: ', ',
			removePropertiesOnReset: true,
			activeMediaQueryList: window.matchMedia('(min-width: 720px)'),
			activateImmediately: true
		};

		options = Object.assign({}, defaultOptions, options);

		Object.getOwnPropertyNames(options).forEach(name => {
			this[name] = options[name];
		});

		this.animateTargets = animateTargets;
		this.scrollDetector = scrollDetector;
		this.valueSets = valueSets;
		this.listeners = [];
		this.ticking = false;
		this.activated = false;

		if(this.activateImmediately) {
			this.respond();
		}

		this.activeMediaQueryList.addListener(() => {
			this.respond();
		});
	}

	/**
	 * Set up and turn on the animation.
	 *
	 * @return {void}
	 */
	init() {
		this.animateTargets.forEach(animateTarget => {
			animateTarget.classList.add('scroll-animated');
			this.updateCSS();

			this.listeners.push((e) => {
				var relativeScrollPosition = this.scrollDetector.relativeScrollPosition();
				if(relativeScrollPosition > -0.1 || relativeScrollPosition < 1.1) {
					this.requestUpdate(e);
				}
			});

			window.addEventListener('scroll', this.listeners[this.listeners.length - 1]);
			window.addEventListener('resize', this.listeners[this.listeners.length - 1]);
		});
	}

	/**
	 * Actually modify the CSS of the animateTarget.
	 *
	 * @param {array<string>} cssValues - CSS strings to be joined by the valueSetSeparator
	 */
	setCSS(cssValues) {
		for(var i = 0; i < this.animateTargets.length; i++) {
			var animateTarget = this.animateTargets[i];

			for(var j = 0; j < this.properties.length; j++) {
				var animateProperty = this.properties[j];
				animateTarget.style[animateProperty] = cssValues.join(this.valueSetSeparator);
			}
		}
	}


	updateCSS() {
		var cssValues = [];

		var scrollPosition = this.scrollDetector.clampedRelativeScrollPosition();

		this.valueSets.forEach(valueSet => {
			cssValues.push(
				valueSet.valueFormat.replace(valueSet.substitutionString, ((valueSet.endValue - valueSet.startValue) * scrollPosition + valueSet.startValue).toString() + valueSet.unit)
			);
		});

		this.setCSS(cssValues);
		this.ticking = false;
	}

	/**
	 * Throttle CSS updates to requestAnimationFrame.
	 *
	 * @return {void}
	 */
	requestUpdate() {
		if(!this.ticking) {
			requestAnimationFrame(() => { this.updateCSS(); });
		}

		this.ticking = true;
	}

	/**
	 * Set animateTarget CSS to prepare for deactivation of the animation.
	 *
	 * @return {void}
	 */
	reset() {
		if(this.removePropertiesOnReset) {
			this.animateTargets.forEach(animateTarget => {
				this.properties.forEach(property => {
					animateTarget.style.removeProperty(property)
				});
			});
		} else {
			var cssValues = [];

			this.valueSets.forEach(valueSet => {
				cssValues.push(
					valueSet.valueFormat.replace(valueSet.substitutionString, valueSet.resetValue.toString() + valueSet.unit)
				);
			});

			this.setCSS(cssValues);
		}
	}

	/**
	 * Call this.init() if it's not activated already
	 *
	 * @return {void}
	 */
	activate() {
		if(!this.activated) {
			this.init();
			this.activated = true;
		}
	}

	/**
	 * Disable the animation and restore default values.
	 *
	 * @return {void}
	 */
	deactivate() {
		if(this.activated) {
			this.listeners.forEach(listener => {
				window.removeEventListener('scroll', listener);
			});
		}

		this.reset();
		this.activated = false;
	}

	/**
	 * Call activate() or deactivate() as needed, depending on the activeMediaQueryList.
	 *
	 * @return {[type]}
	 */
	respond() {
		if(this.activeMediaQueryList.matches) {
			this.activate();
		} else {
			this.deactivate();
		}
	}
}


/**
 * Track the relative position of an element as it scrolls by.
 */
class ScrollDetector {
	/**
	 * Constructor.
	 *
	 * @param {HTMLElement} scrollTarget
	 *     Element whose position to track
	 * @param {object} options
	 *     Other options that may be omitted to use default values
	 *         {bool} scrollIsVertical: Whether to track horizontal or vertical scrolling position.
	 *
	 * @todo Track vertical and horizontal position at the same time, and let animations use both simultaneously
	 */
	constructor(scrollTarget, options) {
		var defaultOptions = {
			scrollIsVertical: true
		};

		this.scrollTarget = scrollTarget;

		options = Object.assign({}, defaultOptions, options);

		Object.getOwnPropertyNames(options).forEach(name => {
			this[name] = options[name];
		});
	}

	/**
	 * The relative position of the element, where 0 is the pixel
	 * before it scrolls onto the screen, and 1 is the pixel after
	 * it scrolls off the screen. All other values are interpolated
	 * linearly.
	 *
	 * @return {float}
	 */
	relativeScrollPosition() {
		var offset, size, windowSize, scrollPos, scroll;

		var rect = this.scrollTarget.getBoundingClientRect();

		if(this.scrollIsVertical) {
			scroll = this.getVerticalScroll();
			offset = rect.top + scroll;
			size = rect.height;
			windowSize = window.innerHeight;
			scrollPos = window.pageYOffset;
		} else {
			scroll = this.getHorizontalScroll();
			offset = rect.left + scroll;
			size = rect.width;
			windowSize = window.innerWidth;
			scrollPos = window.pageXOffset;
		}

		var zeroPoint = offset - windowSize;
		var completePoint = offset + size;
		return (scrollPos - zeroPoint) / (completePoint - zeroPoint);
	}


	/**
	 * Same as relativeScrollPosition, except all negative values are returned as zero
	 * and all values greater than 1 are returned as 1.
	 *
	 * @param {float} relativeScrollPosition
	 *     The relativeScrollPosition can be provided as a parameter to save on calculating
	 *     it multiple times in the same function.
	 *
	 * @return {[type]}
	 */
	clampedRelativeScrollPosition(relativeScrollPosition = this.relativeScrollPosition()) {
		return Math.min(Math.max(relativeScrollPosition, 0), 1);
	}

	/**
	 * Fallbacks upon fallbacks for window.scrollY
	 *
	 * @return {number}
	 */
	getVerticalScroll() {
		if('scrollY' in window) {
			return window.scrollY;
		} else if ('pageYOffset' in window) {
			return window.pageYOffset;
		} else if (document.documentElement.scrollTop > 0) {
			return document.documentElement.scrollTop;
		} else {
			return document.body.scrollTop;
		}
	}

	/**
	 * Fallbacks upon fallbacks for window.scrollX
	 *
	 * @return {number}
	 */
	getHorizontalScroll() {
		if('scrollX' in window) {
			return window.scrollX;
		} else if ('pageXOffset' in window) {
			return window.pageXOffset;
		} else if (document.documentElement.scrollLeft > 0) {
			return document.documentElement.scrollLeft;
		} else {
			return document.body.scrollLeft;
		}
	}
}

/**
 * Default option container for ParallaxativeAnimation CSS values.
 */
class ParallaxativeAnimationValueSet {
	/**
	 * Constructor. All it does is merge supplied options with defaults.
	 *
	 * @param {obj} options
	 *     Parameters for constructing CSS values to be put in a single CSS rule.
	 *         {str} valueFormat: String surrounding the CSS value, using a substitution string of your choice
	 *         {str} substitutionString: As above
	 *         {number} scrollPixelsPerParallaxPixel: How slowly the parallax effect should move.
	 *             Higher numbers make it go more slowly. 0 would cause a divide-by-zero error and
	 *             throws an exception.
	 *         {number} resetValue: The value applied to the element when the animation is disabled
	 *
	 */
	constructor(options) {
		var defaultOptions = {
			valueFormat: 'translateY(_)',
			substitutionString: '_',
			scrollPixelsPerParallaxPixel: 10,
			resetValue: 0
		};

		options = Object.assign({}, defaultOptions, options);

		Object.getOwnPropertyNames(options).forEach(name => {
			this[name] = options[name];
		});

		if(this.scrollPixelsPerParallaxPixel <= 0) {
			throw 'scrollPixelsPerParallaxPixel must be greater than zero.';
		}
	}
}

/**
 * Class to create and manage animations of parallax background elements.
 */
class ParallaxativeAnimation extends ScrollAnimation {
	/**
	 * Constructor.
	 *
	 * @param {array<HTMLElement>} animateTargets
	 *     The elements to animate based on the scroll position of the ScrollDetector
	 *
	 * @param {ScrollDetector} scrollDetector
	 *
	 * @param {object} options
	 *     Other options that may be omitted to use default values
	 *         {array<string>} properties: The JavaScript CSS property names to modify
	 *         {string} valueSetSeparator: String on which to join the different CSS values for this rule
	 *         {bool} removePropertiesOnReset: Whether to unset the CSS properties altogether on deactivation,
	 *             instead of setting them to the resetValue
	 *         {MediaQueryList} activeMediaQueryList: The MediaQueryList controlling activation and deactivation of this object
	 *         {bool} activateImmediately: Whether to turn on the animation immediately upon construction.
	 *             (Even if true, the animation will not activate if activeMediaQueryList.matches is false.)
	 *
	 * @param {array<ScrollAnimationValueSet>} valueSets
	 *     Configuration for one or more values to be used in the single CSS rule
	 *     this object manages.
	 */
	constructor(animateTargets, scrollDetector, options, valueSets = [ new ParallaxativeAnimationValueSet ]) {
		super(animateTargets, scrollDetector, options, valueSets);
	}

	/**
	 * Set up and turn on the animation.
	 *
	 * @return {void}
	 */
	init() {
		var xDimensions = { size: 'width', Size: 'Width', offset: 'left' };
		var yDimensions = { size: 'height', Size: 'Height', offset: 'top' }
		this.dimensions =  this.scrollDetector.scrollIsVertical ? yDimensions : xDimensions;

		this.updateResizeProperties();

		super.init();

		this.updateResizeCSS();

		this.animateTargets.forEach(animateTarget => {
			animateTarget.classList.add('parallaxative-animated');
		});

		this.scrollDetector.scrollTarget.classList.add('parallaxative-container')
	}

	/**
	 * Recalculate CSS values based on the scroll position.
	 *
	 * @return {void}
	 */
	updateCSS() {
		var scrollPosition = this.scrollDetector.clampedRelativeScrollPosition();
		var cssValues = [];

		for(var i = 0; i < this.valueSets.length; i++) {
			var valueSet = this.valueSets[i];
			var scrollTranslate = Math.floor(-((this.scrollTargetSize - valueSet.parallaxSize) * scrollPosition));

			cssValues.push(
				valueSet.valueFormat.replace(valueSet.substitutionString, scrollTranslate.toString() + 'px')
			);
		}

		this.setCSS(cssValues);
		this.ticking = false;
	}

	updateResizeProperties() {
		this.scrollTargetRect = this.scrollDetector.scrollTarget.getBoundingClientRect();
		this.scrollTargetSize = this.scrollTargetRect[this.dimensions.size];
		this.scrollDistance = this.scrollTargetSize + window['inner' + this.dimensions.Size];

		this.valueSets.forEach(valueSet => {
			valueSet.parallaxSize = Math.ceil(this.scrollDistance - (this.scrollDistance / valueSet.scrollPixelsPerParallaxPixel) + this.scrollTargetSize);
		});
	}

	updateResizeCSS() {
		this.updateResizeProperties();

		this.valueSets.forEach(valueSet => {
			this.animateTargets.forEach(animateTarget => {
				animateTarget.style[this.dimensions.size] = valueSet.parallaxSize.toString() + 'px';
			});
		})
	}

	requestUpdate(event) {
		if(!this.ticking) {
			requestAnimationFrame(() => {
				this.updateCSS();

				if(event.type === 'resize') {
					this.updateResizeCSS();
				}
			});
		}

		this.ticking = true;
	}
}