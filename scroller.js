class ScrollerAnimationValueSet {
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

class ScrollerAnimation {
	constructor(animateTargets, options, valueSets) {
		var defaultOptions = {
			properties: ['transform', 'msTransform'],
			valueSetSeparator: ', ',
			removePropertyOnReset: true
		};

		if(typeof valueSets === 'undefined' || !valueSets.length) {
			valueSets = [ new ScrollerAnimationValueSet ];
		}

		this.options = Object.assign({}, defaultOptions, options);
		this.valueSets = valueSets;
		this.animateTargets = animateTargets;
		this.listeners = [];
		this.ticking = false;
		this.scrollPosition = 0.5;
	}

	setCSS(cssValues) {
		this.animateTargets.forEach((animateTarget) => {
			this.options.properties.forEach((animateProperty) => {
				animateTarget.style[animateProperty] = cssValues.join(this.options.valueSetSeparator);
			});
		});
	}

	updateCSS() {
		var cssValues = [];

		this.valueSets.forEach((valueSet) => {
			cssValues.push(
				valueSet.valueFormat.replace(valueSet.substitutionString, ((valueSet.endValue - valueSet.startValue) * this.scrollPosition + valueSet.startValue).toString() + valueSet.unit)
			);
		});

		this.setCSS(cssValues);
		this.ticking = false;
	}

	requestUpdate(scrollPosition) {
		if(!this.ticking) {
			this.scrollPosition = scrollPosition;
			requestAnimationFrame(() => { this.updateCSS() });
		}

		this.ticking = true;
	}

	reset() {
		if(this.removePropertyOnReset) {
			this.animateTargets.forEach((animateTarget) => {
				this.options.properties.forEach((property) => {
					animateTarget.style.removeProperty(property)
				});
			});
		} else {
			var cssValues = [];

			this.valueSets.forEach((valueSet) => {
				cssValues.push(
					valueSet.valueFormat.replace(valueSet.substitutionString, valueSet.resetValue.toString() + valueSet.unit)
				);
			});

			this.setCSS(cssValues);
		}
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

		this.options.activeMediaQueryList.addEventListener('change', () => {
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
		return Math.min(Math.max(this.relativeScrollPosition(), 0), 1);
	}

	setUpAnimations() {
		this.animations.forEach(animation => {
			animation.animateTargets.forEach(animateTarget => {
				animateTarget.classList.add('scroll-animated');
				animation.updateCSS(this.clampedRelativeScrollPosition())

				animation.listeners.push(() => {
					var relativeScrollPosition = this.relativeScrollPosition();
					if(relativeScrollPosition > -0.2 || relativeScrollPosition < 1.2) {
						animation.requestUpdate(this.clampedRelativeScrollPosition());
					}
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
			this.animations.forEach((animation) => {
				animation.listeners.forEach((listener) => {
					window.removeEventListener('scroll', listener);
				});

				animation.reset();
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