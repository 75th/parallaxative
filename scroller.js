class Scroller {
	constructor(scrollTarget, animateTargets, activeMediaQuery, animations) {
		defaultAnimation = {
			properties: ['transform', 'msTransform'],
			separator: ', ',
			scrollIsVertical: true,
			valueSets = [
				{
					unit: 'vh',
					valueFormat: 'translateY(%s)',
					startValue: 15;
					endValue: 40,
				}
			]
		};

		if(typeof animations === 'undefined') {
			animations = [];
		};

		if(animations.length === 0) {
			animations.push(defaultAnimations);
		} else {
			for( var i = 0; i < animations.length; i++) {
				animations[i] = Object.assign(animations[i], defaultAnimation);
			}
			animations.forEach(function(animation) {
				Object.assign()
			});
		}

		this.animations = animations;
		this.activated = false;
		this.isTouch = 'ontouchstart' in document.documentElement;

		var mql = window.matchMedia('(min-width: 720px)')

		this.respond(mql.matches);

		mql.addListener(function(e) {
			this.respond(e.matches)
		});
	}

	relativeScrollPosition(animation) {
		var offset, size, windowSize, scrollPos;

		var rect = this.scrollTarget.getBoundingClientRect();

		if(animation.scrollIsVertical) {
			offset = rect.top + document.body.scrollTop;
			size = thisscrollTarget.offsetHeight;
			windowSize = window.innerHeight;
			scrollPos = window.pageYOffset;
		} else {
			offset = rect.left + document.body.scrollLeft;
			size = this.scrollTarget.offsetWidth;
			windowSize = window.innerWidth;
			scrollPos = window.pageXOffset;
		}

		var zeroPoint = offset - windowSize;
		var completePoint = offset + size;
		return (scrollPos - zeroPoint) / (completePoint - zeroPoint);
	}

	clampedRelativeScrollPosition(animation) {
		return Math.min(Math.max(this.relativeScrollPosition(animation), 0), 1);
	}

	updateAnimation(animation) {
		var scrollPosition = clampedRelativeScrollPosition(animation);
		var cssValues = [];
		animation.valueSets.forEach(function (valueSet) {
			cssValues.push(
				sprintf(
					'%f%s',
					(valueSet.endValue - valueSet.startValue) * scrollPosition + valueSet.startValue,
					valueSet.unit
				)
			);
		});

		this.animateTargets.forEach(function(target) {
			animation.properties.forEach(function(animateProperty) {
				target.style[animateProperty] = cssValues.join(animation.separator);
			});
		});
	}

	scrollAnimate(animation) {
		animation.listeners = [];
		this.animateTargets.forEach(function(target) {
			target.classList.add('scroll-animated');
			this.updateAnimation(animation)

			animation.listeners.push(function(e) {
				this.updateAnimation(animation);
			});

			window.addEventListener('scroll', animation.listeners[animation.listeners.length - 1]); // FIXME: Throttle scroll to requestAnimationFrame
		});
	}

	activate() {
		this.animations.forEach(function(animation) {
			scrollAnimate(animation);
		});

		this.activated = true;
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

	respond(queryDoesMatch) {
		if(queryDoesMatch) {
			this.activate();
		} else {
			this.deactivate();
		}
	}
}