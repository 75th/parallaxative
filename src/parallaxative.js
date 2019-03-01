function validateOptions(options) {
	if(typeof options.properties === 'string') {
		options.properties = [ options.properties ];
	}

	if(
		typeof options.valueSets === 'object' && (
			options.valueSets instanceof ScrollAnimationValueSet ||
			options.valueSets instanceof ParallaxAnimationValueSet
		)
	) {
		options.valueSets = [ options.valueSets ];
	}

	return options;
}

// eslint-disable-next-line no-unused-vars
function arrayify(obj) {
	return (obj instanceof Array || obj instanceof NodeList) ? obj : [ obj ];
}

function normalizeMediaQueryList(mql) {
	if(mql instanceof MediaQueryList || mql === null) {
		return mql;
	}

	if(typeof mql === 'string' && mql) {
		return window.matchMedia(mql);
	}

	throw new ParallaxativeException(validateOptions, 'badActiveMediaQueryList');
}

function normalizeDOMElement(el) {
	if (el instanceof HTMLElement) {
		return el;
	}

	if (typeof el === 'string') {
		el = document.querySelector(el);

		if(!el) {
			throw new ParallaxativeException(normalizeDOMElement, 'emptySelectorQuery');
		}

		return el;
	}

	throw new ParallaxativeException(normalizeDOMElement, 'badDOMElement');
}

function normalizeScrollDetector(scrollDetector, defaultScrollTarget) {

	if(!(scrollDetector instanceof ScrollDetector)) {
		if(typeof scrollDetector === 'undefined' || !scrollDetector) { // Allow passing nothing
			scrollDetector = new ScrollDetector(defaultScrollTarget);
		} else if (typeof scrollDetector === 'string' || scrollDetector instanceof HTMLElement) {
			let scrollTarget = normalizeDOMElement(scrollDetector);
			scrollDetector = new ScrollDetector(scrollTarget);
		} else if(typeof scrollDetector === 'object') { // Allow passing ScrollDetector's OR ScrollAnimation's options
			if(optionsAreForScrollDetector(scrollDetector)) {
				scrollDetector = new ScrollDetector(defaultScrollTarget, scrollDetector);
			} else {
				throw new ParallaxativeException(null, 'optionsNotForScrollDetector', {}, 'none');
			}
		}
	}

	return scrollDetector;
}

function optionsAreForScrollDetector(options) {
	return typeof options.scrollIsVertical !== 'undefined' || typeof options.scrollTarget !== 'undefined';
}

class ParallaxativeException {
	constructor(throwingFunction, type = 'generic', data = {}, level = 'error') {
		this.throwingFunction = throwingFunction;
		this.type = type;
		this.data = data;

		var log;

		if(level === 'none') {
			log = () => {};
		} else {
			// eslint-disable-next-line no-console
			log = console[level];
		}

		switch (true) {
			case (throwingFunction === ScrollDetector && type === 'badScrollTarget'):
				log('scrollTarget must be a query selector string or an HTMLElement node.');
				break;
			case (throwingFunction === ScrollDetector && type === 'scrollTargetQueryNull'):
				log('scrollTarget query selector string did not match any elements.');
				break;
			case (throwingFunction === ScrollDetector && type === 'scrollTargetEmpty'):
				log('scrollTarget was not provided, was empty, or did not resolve to a DOM element.');
				break;
			case (throwingFunction === ScrollTrigger && type === 'noTriggerElement'):
				log('You must provide ScrollTarget either a scrollDetector or a triggerTarget.');
				break;
			case (type === 'badActiveMediaQueryList'):
				log('activeMediaQueryList, if provided at all, must be either a media query string or a MediaQueryList instance.');
				break;
			case (type === 'duplicateOptions'):
				log('ScrollAnimation’s second parameter looked like it was options for ScrollAnimation, but other options were provided in the third parameter. If the third parameter is present, the second parameter must pertain to a ScrollDetector.');
				break;
			case (throwingFunction === ParallaxAnimationValueSet && type === 'divideByZero'):
				log('scrollPixelsPerParallaxPixel must not be zero.');
				break;
			case (throwingFunction === ParallaxAnimation && type === 'overlyNestedAnimateTarget'):
				log('Parallax animateTarget %o is nested too many levels beneath scrollTarget %o. The animateTarget must be a direct child of the scrollTarget.', data.animateTarget, data.scrollTarget);
				break;
			case (type === 'badDOMElement'):
				log('A Parallaxative class couldn’t convert your input into an HTMLElement');
				break;
			case (type === 'emptySelectorQuery'):
				log('Your query selector didn’t match any DOM elements.');
				break;
			case (type === 'optionsNotForScrollDetector'):
				log('Options in a scrollDetector parameter were not for a scrollDetector and were not detected to be for something else.');
				break;
			default:
				log('Error in Parallaxative class %o of type %o with data %o.', throwingFunction, type, data);
				break;
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
	constructor(options) {
		this.defaultOptions = {
			scrollTarget: null,
			scrollIsVertical: true
		};

		options = this.validateOptions(options);

		Object.getOwnPropertyNames(this.defaultOptions).forEach(name => {
			this[name] = options[name];
		});

		this.updateResizeProperties();
		window.addEventListener('resize', this.updateResizeProperties);
		window.addEventListener('load', this.updateResizeProperties);
	}

	updateResizeProperties() {
		this.rect = this.scrollTarget.getBoundingClientRect();
		this.documentOffsets = {top: this.rect.top + this.constructor.getVerticalScroll(), left: this.rect.left + this.constructor.getHorizontalScroll() };
		this.windowSizes = { width: window.innerWidth, height: window.innerHeight };
	}

	validateOptions(options) {
		if(options instanceof HTMLElement || typeof options === 'string') { // Allow providing bare DOM node
			options = { scrollTarget: options };
		}

		if(typeof options.scrollTarget === 'string') {
			options.scrollTarget = normalizeDOMElement(options.scrollTarget);
		}

		if(!(options.scrollTarget instanceof HTMLElement)) {
			throw new ParallaxativeException(this.constructor, 'badScrollTarget');
		}

		return Object.assign({}, this.defaultOptions, options);
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
		var offset, size, windowSize, scrollPos, zeroPoint, completePoint;

		if(this.scrollIsVertical) {
			scrollPos = this.constructor.getVerticalScroll();
			offset = this.documentOffsets.top;
			size = this.rect.height;
			windowSize = this.windowSizes.height;

		} else {
			scrollPos = this.constructor.getHorizontalScroll();
			offset = this.documentOffsets.left;
			size = this.rect.width;
			windowSize = this.windowSizes.width;
		}

		zeroPoint = offset - windowSize;
		completePoint = offset + size;
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
	static getVerticalScroll() {
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
	static getHorizontalScroll() {
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
 * Run a function based on a ScrollDetector
 */
class ScrollTrigger {
	constructor(options = {}) {
		options = this.validateOptions(options);

		this.defaultOptions = {
			activateImmediately: true,
			activeMediaQueryList: '(min-width: 720px)',
			scrollDetector: null, // Handled above
			triggerFunction: function(el) {
				el.classList.remove('offscreen');
			},
			triggerPosition: 0.15,
			triggerTarget: null, // Handled above
			triggerOnDeactivate: true
		};

		Object.getOwnPropertyNames(this.defaultOptions).forEach(name => {
			this[name] = options[name];
		});

		this.activeMediaQueryList.addListener(this.respond);

		if(this.activateImmediately) {
			this.respond();
		}
	}

	validateOptions(options) {
		var scrollDetectorIsEmpty = typeof options.scrollDetector === 'undefined' || !!options.scrollDetector;
		var triggerTargetIsEmpty = typeof options.triggerTarget === 'undefined' || !!options.triggerTarget;

		if(scrollDetectorIsEmpty && triggerTargetIsEmpty) {
			throw new ParallaxativeException(this.constructor, 'noTriggerElement');
		}

		if(scrollDetectorIsEmpty) {
			options.triggerTarget = normalizeDOMElement(options.triggerTarget);
			options.scrollDetector = new ScrollDetector(options.triggerTarget);
		} else if (triggerTargetIsEmpty) {
			options.scrollDetector = normalizeScrollDetector(options.scrollDetector, null);
			options.triggerTarget = options.scrollDetector.scrollTarget;
		}

		options = Object.assign({}, this.defaultOptions, options);

		options.activeMediaQueryList = normalizeMediaQueryList(options.activeMediaQueryList);

		return options;
	}

	init() {
		this.listener = () => {
			var relativeScrollPosition = this.scrollDetector.relativeScrollPosition();
			if(relativeScrollPosition > -0.1 && relativeScrollPosition < 1.1) {
				this.requestUpdate();
			}
		};

		this.listener();

		window.addEventListener('scroll', this.listener);
		window.addEventListener('resize', this.listener);
	}

	trigger() {
		this.triggerFunction(this.triggerTarget);
	}

	test() {
		if(this.scrollDetector.relativeScrollPosition() > this.triggerPosition) {
			this.triggerOnDeactivate = true;
			this.deactivate();
		}

		this.ticking = false;
	}

	/**
	 * Throttle CSS updates to requestAnimationFrame.
	 *
	 * @return {void}
	 */
	requestUpdate() {
		if(!this.ticking) {
			requestAnimationFrame(() => { this.test(); });
		}

		this.ticking = true;
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

	deactivate() {
		if(this.activated) {
			window.removeEventListener('scroll', this.listener);
			window.removeEventListener('resize', this.listener);

			if(this.triggerOnDeactivate) {
				this.trigger();
			}
		}

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
			valueFormat: 'translate3d(0px, _, 0px)',
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

	getCSSValue(scrollPosition) {
		return this.valueFormat.replace(this.substitutionString, ((this.endValue - this.startValue) * scrollPosition + this.startValue).toString() + this.unit);
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
	 *     The elements to animate based on the scroll position of the ScrollDetector. May also be a single bare HTMLElement
	 *         or a query selector string
	 *
	 * @param {ScrollDetector} scrollDetector
	 *
	 * @param {object} options
	 *     Other options that may be omitted to use default values
	 *         {array<string>} properties: The JavaScript CSS property names to modify
	 *         {array<ScrollAnimationValueSet>} valueSets: Configuration for one or more values to be modified within a single CSS rule
	 *         {string} valueSetSeparator: String on which to join the different CSS values for this rule
	 *         {bool} removePropertiesOnReset: Whether to unset the CSS properties altogether on deactivation,
	 *             instead of setting them to the resetValue
	 *         {MediaQueryList} activeMediaQueryList: The MediaQueryList controlling activation and deactivation of this object
	 *         {bool} activateImmediately: Whether to turn on the animation immediately upon construction.
	 *             (Even if true, the animation will not activate if activeMediaQueryList.matches is false.)
	 */
	constructor(animateTargets, scrollDetector, options, defaultValueSets) {
		var defaultOptions = {
			properties: ['transform', 'msTransform'],
			valueSets: defaultValueSets ? defaultValueSets : [ new ScrollAnimationValueSet() ],
			valueSetSeparator: ' ',
			removePropertiesOnReset: true,
			activeMediaQueryList: window.matchMedia('(min-width: 720px)'),
			activateImmediately: true,
			startPosition: 0, // FIXME: Not implemented
			endPosition: 1 // FIXME: Not implemented
		};

		// Syntax sugar for animateTargets
		if(animateTargets instanceof HTMLElement) { // Allow passing bare DOM node
			animateTargets = [animateTargets];
		} else if(typeof animateTargets === 'string') { // Allow passing query selector string
			animateTargets = document.querySelectorAll(animateTargets);
		}

		try {
			scrollDetector = normalizeScrollDetector(scrollDetector, animateTargets[0].parentNode, options);
		} catch(err) {
			if(err.type === 'optionsNotForScrollDetector') {
				if(typeof options === 'undefined') {
					options = scrollDetector;
					scrollDetector = new ScrollDetector(animateTargets[0].parentNode);
				} else {
					throw new ParallaxativeException(this.constructor, 'duplicateOptions');
				}
			}
		}

		if(typeof options !== 'undefined') {
			options = validateOptions(options, this.constructor);
		}

		options = Object.assign({}, defaultOptions, options);

		Object.getOwnPropertyNames(defaultOptions).forEach(name => {
			this[name] = options[name];
		});

		this.animateTargets = animateTargets;
		this.scrollDetector = scrollDetector;
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
				if(relativeScrollPosition > -0.1 && relativeScrollPosition < 1.1) {
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
		this.ticking = false;
		var cssValues = [];

		var scrollPosition = this.scrollDetector.clampedRelativeScrollPosition();

		var length = this.valueSets.length;
		for(var i = 0; i < length; i++) {
			cssValues.push( this.valueSets[i].getCSSValue(scrollPosition) );
		}

		this.setCSS(cssValues);
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
					animateTarget.style.removeProperty(property);
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

		var i;
		var length = this.animateTargets.length;

		for(i = 0; i < length; i++) {
			this.animateTargets[i].classList.remove('scroll-animated');
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
				window.removeEventListener('resize', listener);
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

	static isIE() {
		return (
			(navigator.appName === 'Microsoft Internet Explorer') || ((navigator.appName === 'Netscape') && (new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})').exec(navigator.userAgent) !== null))
		);
	}
}

/**
 * Default option container for ParallaxAnimation CSS values.
 */
class ParallaxAnimationValueSet {
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
			valueFormat: 'translate3d(0px, _, 0px)',
			substitutionString: '_',
			scrollPixelsPerParallaxPixel: 10,
			resetValue: 0
		};

		options = Object.assign({}, defaultOptions, options);

		Object.getOwnPropertyNames(defaultOptions).forEach(name => {
			this[name] = options[name];
		});

		if(this.scrollPixelsPerParallaxPixel === 0) {
			throw new ParallaxativeException(this.constructor, 'divideByZero');
		}
	}
}

/**
 * Class to create and manage animations of parallax background elements.
 */
class ParallaxAnimation extends ScrollAnimation {
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
	constructor(animateTargets, scrollDetector, options) {
		super(animateTargets, scrollDetector, options, [ new ParallaxAnimationValueSet() ]);
	}

	/**
	 * Set up and turn on the animation.
	 *
	 * @return {void}
	 */
	init() {
		this.dimensions =
			this.scrollDetector.scrollIsVertical ?
			{ size: 'height', Size: 'Height', offset: 'top' } :
			{ size: 'width', Size: 'Width', offset: 'left' }
		;

		this.updateResizeProperties();

		super.init();

		this.scrollDetector.scrollTarget.classList.add('parallax-container');

		window.addEventListener('load', () => {
			this.updateResizeCSS();
			this.updateCSS();
		});

		var i;
		var target;
		var length = this.animateTargets.length;

		try {
			for(i = 0; i < length; i++) {
				target = this.animateTargets[i];

				target.classList.add('parallax-animated');

				if(target.parentNode !== this.scrollDetector.scrollTarget) {
					throw new ParallaxativeException(this.constructor, 'overlyNestedAnimateTarget', {index: i, animateTarget: target, scrollTarget: this.scrollDetector.scrollTarget });
				}
			}
		} catch(err) {
			this.deactivate();

			this.animateTargets = this.animateTargets.filter((target) => {
				target !== err.animateTarget;
			});

			if(this.animateTargets.length) {
				this.activate();
			}
		}
	}

	/**
	 * Recalculate CSS values based on the scroll position.
	 *
	 * @return {void}
	 */
	updateCSS() {
		var scrollPosition = this.scrollDetector.clampedRelativeScrollPosition();

		var cssValues = [];

		var length = this.valueSets.length;
		for(var i = 0; i < length; i++) {
			var scrollTranslate;

			if(this.valueSets[i].scrollPixelsPerParallaxPixel < 0) {
				scrollTranslate = -((this.scrollTargetSize - this.valueSets[i].parallaxSize) * (1 - scrollPosition));
			} else {
				scrollTranslate = -((this.scrollTargetSize - this.valueSets[i].parallaxSize) * scrollPosition);
			}

			cssValues.push(
				this.valueSets[i].valueFormat.replace(this.valueSets[i].substitutionString, scrollTranslate.toString() + 'px')
			);
		}

		this.setCSS(cssValues);
		this.ticking = false;
	}

	updateResizeProperties() {
		this.scrollTargetRect = this.scrollDetector.scrollTarget.getBoundingClientRect();
		this.scrollTargetSize = this.scrollTargetRect[this.dimensions.size];
		this.scrollDistance = this.scrollTargetSize + window['inner' + this.dimensions.Size];

		var length = this.valueSets.length;
		for (var i = 0; i < length; i++) {
			this.valueSets[i].parallaxSize = Math.abs(this.scrollDistance / this.valueSets[i].scrollPixelsPerParallaxPixel) + this.scrollTargetSize;
		}
	}

	updateResizeCSS() {
		this.updateResizeProperties();

		var valueSetsLength = this.valueSets.length;
		var animateTargetsLength = this.animateTargets.length;

		for (var i = 0; i < valueSetsLength; i++) {
			for (var j = 0; j < animateTargetsLength; j++) {
				this.animateTargets[j].style[this.dimensions.size] = this.valueSets[i].parallaxSize.toString() + 'px';
			}
		}
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

	reset() {
		var i;
		var length = this.animateTargets.length;

		for(i = 0; i < length; i++) {
			this.animateTargets[i].style.removeProperty('height');
			this.animateTargets[i].classList.remove('parallax-animated');
			this.animateTargets[i].parentNode.classList.remove('parallax-anchor');
		}

		super.reset();

		this.scrollDetector.scrollTarget.classList.remove('parallax-container');
	}
}

export { ScrollDetector, ScrollTrigger, ScrollAnimation, ScrollAnimationValueSet, ParallaxAnimation, ParallaxAnimationValueSet };