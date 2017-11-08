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
		var cssValues = [];
		var scrollPosition = this.scrollDetector.clampedRelativeScrollPosition();

		var scrollTargetRect = this.scrollDetector.scrollTarget.getBoundingClientRect();

		var dimension = this.scrollDetector.scrollIsVertical ? 'height' : 'width';
		var capitalizedDimension = dimension.slice(0,1).toUpperCase() + dimension.slice(1);

		var scrollDistance = scrollTargetRect[dimension] + window['inner' + capitalizedDimension];

		this.valueSets.forEach(valueSet => {

			var parallaxDistance = Math.floor(scrollDistance / valueSet.scrollPixelsPerParallaxPixel);
			var pos = -parallaxDistance * scrollPosition;

			cssValues.push(
				valueSet.valueFormat.replace(valueSet.substitutionString, pos.toString() + 'px')
			);

			this.animateTargets.forEach(animateTarget => {
				var targetDimensionSize = Math.ceil(this.scrollDetector.scrollTarget.clientHeight + parallaxDistance).toString() + 'px';

				animateTarget.style[dimension] = targetDimensionSize; // FIXME: Do this once, not every tick!!
			});
		});

		super.setCSS(cssValues);
		this.ticking = false;
	}
}