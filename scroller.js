class ScrollAnimationValueSet {
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

class ScrollAnimation {
	constructor(animateTargets, scrollDetector, options, valueSets, initImmediately = true) {
		var defaultOptions = {
			properties: ['transform', 'msTransform'],
			valueSetSeparator: ', ',
			removePropertyOnReset: true,
			activeMediaQueryList: window.matchMedia('(min-width: 720px)')
		};

		options = Object.assign({}, defaultOptions, options);

		Object.getOwnPropertyNames(options).forEach(name => {
			this[name] = options[name];
		});

		if(typeof valueSets === 'undefined' || !valueSets.length) {
			valueSets = [ new ScrollAnimationValueSet ];
		}

		this.animateTargets = animateTargets;
		this.scrollDetector = scrollDetector;
		this.valueSets = valueSets;
		this.listeners = [];
		this.ticking = false;
		this.activated = false;

		if(initImmediately) {
			this.init();
		}
	}

	init() {
		this.animateTargets.forEach(animateTarget => {
			animateTarget.classList.add('scroll-animated');
			this.updateCSS();

			this.listeners.push(() => {
				var relativeScrollPosition = this.scrollDetector.relativeScrollPosition();
				if(relativeScrollPosition > -0.1 || relativeScrollPosition < 1.1) {
					this.requestUpdate();
				}
			});

			window.addEventListener('scroll', this.listeners[this.listeners.length - 1]);
		});
	}

	setCSS(cssValues) {
		this.animateTargets.forEach((animateTarget) => {
			this.properties.forEach((animateProperty) => {
				animateTarget.style[animateProperty] = cssValues.join(this.valueSetSeparator);
			});
		});
	}

	updateCSS() {
		var cssValues = [];

		var scrollPosition = this.scrollDetector.clampedRelativeScrollPosition();

		this.valueSets.forEach((valueSet) => {
			cssValues.push(
				valueSet.valueFormat.replace(valueSet.substitutionString, ((valueSet.endValue - valueSet.startValue) * scrollPosition + valueSet.startValue).toString() + valueSet.unit)
			);
		});

		this.setCSS(cssValues);
		this.ticking = false;
	}

	requestUpdate() {
		if(!this.ticking) {
			requestAnimationFrame(() => { this.updateCSS() });
		}

		this.ticking = true;
	}

	reset() {
		if(this.removePropertyOnReset) {
			this.animateTargets.forEach((animateTarget) => {
				this.properties.forEach((property) => {
					animateTarget.style.removeProperty(property)
				});
			});
		} else {			var cssValues = [];

			this.valueSets.forEach((valueSet) => {
				cssValues.push(
					valueSet.valueFormat.replace(valueSet.substitutionString, valueSet.resetValue.toString() + valueSet.unit)
				);
			});

			this.setCSS(cssValues);
		}
	}

	activate() {
		if(!this.activated) {
			this.init();
			this.activated = true;
		}
	}

	deactivate() {
		if(this.activated) {
			window.removeEventListener('scroll', this.listener);
		}

		this.reset();
		this.activated = false;
	}

	respond() {
		if(this.activeMediaQueryList.matches) {
			this.activate();
		} else {
			this.deactivate();
		}
	}
}

class ScrollDetector {
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

	relativeScrollPosition() {
		var offset, size, windowSize, scrollPos, scroll;

		var rect = this.scrollTarget.getBoundingClientRect();

		if(this.scrollIsVertical) {
			if('scrollY' in window) {
				scroll = window.scrollY;
			} else if ('pageYOffset' in window) {
				scroll = window.pageYOffset;
			} else if (document.documentElement.scrollTop > 0) {
				scroll = document.documentElement.scrollTop;
			} else {
				scroll = document.body.scrollTop;
			}
			offset = rect.top + scroll;
			size = rect.height;
			windowSize = window.innerHeight;
			scrollPos = window.pageYOffset;
		} else {
			if('scrollX' in window) {
				scroll = window.scrollX;
			} else if ('pageXOffset' in window) {
				scroll = window.pageXOffset;
			} else if (document.documentElement.scrollLeft > 0) {
				scroll = document.documentElement.scrollLeft;
			} else {
				scroll = document.body.scrollLeft;
			}
			offset = rect.left + scroll;
			size = rect.width;
			windowSize = window.innerWidth;
			scrollPos = window.pageXOffset;
		}

		var zeroPoint = offset - windowSize;
		var completePoint = offset + size;
		return (scrollPos - zeroPoint) / (completePoint - zeroPoint);
	}

	clampedRelativeScrollPosition(relativeScrollPosition = this.relativeScrollPosition()) {
		return Math.min(Math.max(relativeScrollPosition, 0), 1);
	}
}