class ParallaxativeAnimationValueSet {
	constructor(options) {
		var defaultOptions = {
			valueFormat: 'translateY(_)',
			substitutionString: '_',
			scrollPixelsPerParallaxPixel: 10,
			parallaxElementFocus: 'top',
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

			var zeroPointPercent, startPoint, endPoint, pos;

			var parallaxDistance = scrollDistance / valueSet.scrollPixelsPerParallaxPixel;

			if(valueSet.parallaxElementFocus === 'bottom') {
				zeroPointPercent = scrollTargetRect[dimension] / scrollDistance;
				startPoint = -(parallaxDistance * zeroPointPercent);
				endPoint = startPoint + parallaxDistance;
				pos = Math.floor((parallaxDistance * (1 - scrollPosition)) + startPoint);

			} else {
				zeroPointPercent = window['inner' + capitalizedDimension] / scrollDistance;
				startPoint = parallaxDistance * zeroPointPercent;
				endPoint = startPoint - parallaxDistance;
				pos = Math.floor((parallaxDistance * scrollPosition) + endPoint);
			}

			cssValues.push(
				valueSet.valueFormat.replace(valueSet.substitutionString, pos.toString() + 'px')
			);

			this.animateTargets.forEach(animateTarget => {
				var targetDimensionSize = Math.min(
					this.scrollDetector.scrollTarget['client' + capitalizedDimension] + (parallaxDistance * 2),
					window['inner' + capitalizedDimension] + (parallaxDistance * 2)
				).toString() + 'px';

				animateTarget.style[dimension] = targetDimensionSize;

				if(valueSet.parallaxElementFocus === 'bottom') {
					animateTarget.style[endingOffsetDimension] = 'auto';
					animateTarget.style[beginningOffsetDimension] = '0px';
				} else {
					animateTarget.style[endingOffsetDimension] = '0px';
					animateTarget.style[beginningOffsetDimension] = 'auto';
				}
			});
		});

		super.setCSS(cssValues);
		this.ticking = false;
	}
}