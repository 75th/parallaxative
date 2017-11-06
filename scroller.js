class ScrollerAnimationValueSet {
	constructor(options) {
		var defaultOptions = {
			unit: 'vh',
			valueFormat: 'translateY(_)',
			substitutionString: '_',
			startValue: 20,
			endValue: -20
		};

		options = Object.assign({}, defaultOptions, options);

		Object.getOwnPropertyNames(options).forEach(name => {
			this[name] = options[name];
		});
	}
}

class ScrollerAnimation {
	constructor(animateTargets, options, valueSets) {
		var defaultOptions = {
			properties: ['transform', 'msTransform'],
			valueSetSeparator: ', '
		}

		if(typeof valueSets === 'undefined' || !valueSets.length) {
			valueSets = [ new ScrollerAnimationValueSet ];
		}

		this.options = Object.assign({}, defaultOptions, options);
		this.valueSets = valueSets;
		this.animateTargets = animateTargets;
		this.listeners = [];
	}

	updateCSS(scrollPosition) {
		var cssValues = [];

		this.valueSets.forEach(function (valueSet) {
			console.log(valueSet);
			cssValues.push(
				valueSet.valueFormat.replace(valueSet.substitutionString, ((valueSet.endValue - valueSet.startValue) * scrollPosition + valueSet.startValue).toString() + valueSet.unit)
			);
		});

		this.animateTargets.forEach(function(animateTarget) {
			this.options.properties.forEach(function(animateProperty) {
				animateTarget.style[animateProperty] = cssValues.join(this.options.valueSetSeparator);
			}, this);
		}, this);
	}
}

class Scroller {
	constructor(scrollTarget, options, animations) {
		var defaultOptions = {
			scrollIsVertical: true,
			activeMediaQueryList: window.matchMedia('(min-width: 720px)')
		};

		if(typeof animations === 'undefined') {
			animations = [];
		}

		this.scrollTarget = scrollTarget;
		this.animations = animations;
		this.options = Object.assign({}, defaultOptions, options);
		this.activated = false;

		this.respond();

		this.options.activeMediaQueryList.addEventListener('change', function() {
			this.respond()
		});
	}

	relativeScrollPosition() {
		var offset, size, windowSize, scrollPos;

		var rect = this.scrollTarget.getBoundingClientRect();

		if(this.options.scrollIsVertical) {
			offset = rect.top + document.documentElement.scrollTop;
			size = rect.height;
			windowSize = window.innerHeight;
			scrollPos = window.pageYOffset;
		} else {
			offset = rect.left + document.documentElement.scrollLeft;
			size = rect.width;
			windowSize = window.innerWidth;
			scrollPos = window.pageXOffset;
		}

		var zeroPoint = offset - windowSize;
		var completePoint = offset + size;
		return (scrollPos - zeroPoint) / (completePoint - zeroPoint);
	}

	clampedRelativeScrollPosition() {
		console.log(Math.min(Math.max(this.relativeScrollPosition(), 0), 1));
		return Math.min(Math.max(this.relativeScrollPosition(), 0), 1);
	}

	setUpAnimations() {
		this.animations.forEach(animation => {
			animation.animateTargets.forEach(animateTarget => {
				animateTarget.classList.add('scroll-animated');
				animation.updateCSS(this.clampedRelativeScrollPosition())

				animation.listeners.push(() => {
					animation.updateCSS(this.clampedRelativeScrollPosition());
				});

				window.addEventListener('scroll', animation.listeners[animation.listeners.length - 1]); // // FIXME: Throttle scroll to requestAnimationFrame
			});
		});
	}

	activate() {
		if(!this.activated) {
			this.setUpAnimations();
			this.activated = true;
		}
	}

	deactivate() {
		if(this.activated) {
			this.animations.forEach(function(animation) {
				animation.listeners.forEach(function(listener) {
					window.removeEventListener('scroll', listener);
				});
			});

			this.activated = false;
		}
	}

	respond() {
		if(this.options.activeMediaQueryList.matches) {
			this.activate();
		} else {
			this.deactivate();
		}
	}
}