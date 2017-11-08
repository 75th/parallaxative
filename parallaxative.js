class ParallaxativeAnimationValueSet {
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

class ParallaxativeAnimation extends ScrollAnimation {
	constructor(animateTargets, scrollDetector, options, valueSets = [ new ParallaxativeAnimationValueSet ]) {
		super(animateTargets, scrollDetector, options, valueSets);

	//	this.parallaxDistance = (this.scrollDetector.scrollTarget.getBoundingClientRect().)
	}

	init() {
		super.init();

		this.animateTargets.forEach(animateTarget => {
			animateTarget.classList.add('parallaxative-animated');
		});

		this.scrollDetector.scrollTarget.classList.add('parallaxative-container')
	}

	updateCSS() {
		var cssValues = [];
		var scrollPosition = this.scrollDetector.clampedRelativeScrollPosition();

		var scrollTargetRect = this.scrollDetector.scrollTarget.getBoundingClientRect();

		var dimension = this.scrollDetector.scrollIsVertical ? 'height' : 'width';
		var capitalizedDimension = dimension.slice(0,1).toUpperCase() + dimension.slice(1);
		var beginningOffsetDimension = dimension === 'height' ? 'bottom' : 'right';
		var endingOffsetDimension = dimension === 'height' ? 'top' : 'left';

		var scrollDistance = scrollTargetRect[dimension] + window['inner' + capitalizedDimension];

		this.valueSets.forEach(valueSet => {

			var parallaxDistance = Math.floor(scrollDistance / valueSet.scrollPixelsPerParallaxPixel);
			var pos = -parallaxDistance * scrollPosition;

			cssValues.push(
				valueSet.valueFormat.replace(valueSet.substitutionString, pos.toString() + 'px')
			);

			this.animateTargets.forEach(animateTarget => {
				var targetDimensionSize = Math.ceil(this.scrollDetector.scrollTarget.clientHeight + parallaxDistance).toString() + 'px';

				animateTarget.style[dimension] = targetDimensionSize;
			});
		});

		super.setCSS(cssValues);
		this.ticking = false;
	}
}