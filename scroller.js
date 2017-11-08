

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
		this.animateTargets.forEach(animateTarget => {
			this.properties.forEach(animateProperty => {
				animateTarget.style[animateProperty] = cssValues.join(this.valueSetSeparator);
			});
		});
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

	requestUpdate() {
		if(!this.ticking) {
			requestAnimationFrame(() => { this.updateCSS() });
		}

		this.ticking = true;
	}

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

	activate() {
		if(!this.activated) {
			this.init();
			this.activated = true;
		}
	}

	deactivate() {
		if(this.activated) {
			this.listeners.forEach(listener => {
				window.removeEventListener('scroll', listener);
			});
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

	clampedRelativeScrollPosition(relativeScrollPosition = this.relativeScrollPosition()) {
		return Math.min(Math.max(relativeScrollPosition, 0), 1);
	}

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