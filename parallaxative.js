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
		super.init();

		this.updateResizeCSS();

		this.animateTargets.forEach(animateTarget => {
			animateTarget.classList.add('parallaxative-animated');
		});

		this.scrollDetector.scrollTarget.classList.add('parallaxative-container')
	}

	getStats() {
		var stats = {};
		var xDimensions = { size: 'width', Size: 'Width', offset: 'left' };
		var yDimensions = { size: 'height', Size: 'Height', offset: 'top' }

		stats.dimensions =  { scroll: {}, cross: {} }

		stats.scrollPosition = this.scrollDetector.clampedRelativeScrollPosition();

		stats.dimensions.scroll = this.scrollDetector.scrollIsVertical ? yDimensions : xDimensions;
		stats.dimensions.cross = stats.dimensions.scroll === xDimensions ? yDimensions : xDimensions;

		stats.scrollTargetRect = this.scrollDetector.scrollTarget.getBoundingClientRect();
		stats.scrollTargetScrollSize = stats.scrollTargetRect[stats.dimensions.scroll.size];
		stats.scrollDistance = stats.scrollTargetScrollSize + window['inner' + stats.dimensions.scroll.Size];

		return stats;
	}

	/**
	 * Recalculate CSS values based on the scroll position.
	 *
	 * @return {void}
	 */
	updateCSS() {
		var s = this.getStats();
		var cssValues = [];

		this.valueSets.forEach(valueSet => {
			var parallaxSize = Math.ceil(s.scrollDistance - (s.scrollDistance / valueSet.scrollPixelsPerParallaxPixel) + s.scrollTargetScrollSize);
			var scrollTranslate = Math.round(-((s.scrollTargetScrollSize - parallaxSize) * s.scrollPosition));

			cssValues.push(
				valueSet.valueFormat.replace(valueSet.substitutionString, scrollTranslate.toString() + 'px')
			);


		});

		this.setCSS(cssValues);
		this.ticking = false;
	}

	updateResizeCSS() {
		var s = this.getStats();

		this.valueSets.forEach(valueSet => {
			var parallaxSize = Math.round(s.scrollDistance - (s.scrollDistance / valueSet.scrollPixelsPerParallaxPixel) + s.scrollTargetScrollSize);

			this.animateTargets.forEach(animateTarget => {
				animateTarget.style[s.dimensions.scroll.size] = parallaxSize.toString() + 'px';
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