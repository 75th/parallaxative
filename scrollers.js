/* global sprintf */
import './modernizr.js';
import './mediaCheck.js';
import './jquery.throttledresize.js';
import {sprintf} from './sprintf.js';

// ------------------------------------------------------------
// Console shim. Should be in a separate file loaded previously
// ------------------------------------------------------------

if(typeof window.console === 'undefined') {
	var console = {
		log: function(){},
		error: function(){}
	};
}

if (!Array.prototype.indexOf)
{
	Array.prototype.indexOf = function(elt /*, from*/)
	{
		var len = this.length >>> 0;

		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0) {
			from += len;
		}

		for (; from < len; from++) {
			if (from in this && this[from] === elt) {
				return from;
			}
		}

		return -1;
	};
}

// --------------------------------
// Object for all scrolling effects
// --------------------------------
function Scrollers() {
	this.activated = false;
	var $ = jQuery;
	var isTouch = 'ontouchstart' in document.documentElement;


	// Shove all the similar function input data for all pages into an object
	var modifications = {};
	modifications.front = {};
	modifications.aboutUs = {};
	modifications.services = {};
	modifications.process = {};

	modifications.front.scrollAnimations = [
		{
			element: '.home > .content > div',
			options: {
				animateElement: 'h2'
			}
		},
		{
			element: '.home > .content > div',
			options: {
				animateElement: 'p',
				startValue: -9,
				endValue: 10
			}
		}
	];

	modifications.aboutUs.scrollAnimations = [
		{
			element: '.year19xx',
			options: {
				animateElement: 'img',
				animatePropertyValueFormat: 'translateY(%s)',
				animateUnit: 'vh',
				startValue: -10,
				endValue: 15,
				scrollIsVertical: true
			}
		}
	];

	modifications.services.scrollAnimations = [
		{
			element: 'article.services > .content > .categories',
			options: {
				animateElement: 'img',
				animateUnit: 'px',
				startValue: -1000,
				endValue: 0
			}
		},
		{
			element: 'article.services > .content .intro',
			options: {
				animateElement: 'h2, p'
			}
		}
	];

	modifications.process.scrollAnimations = [
		{
			element: 'article.process > .content > section',
			options: {
				animateElement: 'h2'
			}
		}
	];
	var relativeScrollPosition = function($el, scrollIsVertical) {
		if(typeof scrollIsVertical === 'undefined') {
			scrollIsVertical = true;
		}

		var elOffset = $el.offset();
		elOffset = scrollIsVertical ? elOffset.top : elOffset.left;
		var elSize = scrollIsVertical ? $el.height() : $el.width();
		var windowSize = scrollIsVertical ? $(window).height() : $(window).width();
		var scrollPos = scrollIsVertical ? $(window).scrollTop() : $(window).scrollLeft();

		var zeroPoint = elOffset - windowSize;
		var completePoint = elOffset + elSize;
		return (scrollPos - zeroPoint) / (completePoint - zeroPoint);
	};

	var constrainedRelativeScrollPosition = function($el, scrollIsVertical) {
		return Math.min(Math.max(relativeScrollPosition($el, scrollIsVertical), 0), 1);
	};

	var scrollAnimate = function($els, suppliedOptions) {
		var defaultOptions = {
			animateElement: $(),
			animateProperties: ['transform', 'msTransform'],
			animatePropertyValueFormat: 'translateY(%s)',
			animateUnit: 'vh',
			startValue: 15,
			endValue: -40,
			scrollIsVertical: true
		};

		if(typeof $els === 'string') {
			$els = $($els);
		}

		$els.each(function() {
			var $el = $(this);

			var options = $.extend({}, defaultOptions, suppliedOptions);

			if(typeof options.animateElement === 'string') {
				var $animateElement = $el.find(options.animateElement);
			}

			if(!$el.length || !options.animateElement.length || !options.startValue) {
				window.console.error('Invalid scroll animation', $el, suppliedOptions);
				return;
			}

			var scrollPosition = constrainedRelativeScrollPosition($el, options.scrollIsVertical);
			var cssValue = sprintf(
				'%f%s',
				(options.endValue - options.startValue) * scrollPosition + options.startValue,
				options.animateUnit
			);

			$animateElement.addClass('scroll-animated');

			options.animateProperties.forEach(function(prop) {

				$animateElement.each(function() {
					var $animateEl = $(this);

					$animateEl.css(prop, sprintf(options.animatePropertyValueFormat, cssValue));

					$(window).on('scroll.scroller', function() {
						var scrollPosition = constrainedRelativeScrollPosition($el, options.scrollIsVertical);
						var cssValue = sprintf(
							'%f%s',
							(options.endValue - options.startValue) * scrollPosition + options.startValue,
							options.animateUnit
						);

						$animateEl.css(prop, sprintf(options.animatePropertyValueFormat, cssValue));
					});
				});
			});
		});
	};

	var activateFrontPage = function() {
		modifications.front.scrollAnimations.forEach(function(item) {
			scrollAnimate(item.element, item.options);
		});
	};

	var activateServices = function() {
		modifications.services.scrollAnimations.forEach(function(item) {
			scrollAnimate(item.element, item.options);
		});
	}

	var activateProcess = function() {
		modifications.process.scrollAnimations.forEach(function(item) {
			scrollAnimate(item.element, item.options);
		});
	}

	var activateAboutUs = function() {
		modifications.aboutUs.scrollAnimations.forEach(function(item) {
			scrollAnimate(item.element, item.options);
		});

		$('.year1990').css('background-color', 'black');
		$('.year1990 li').addClass('invisible');
		$('.conclusion').find('h2 span, h2 strong').addClass('invisible');

		$(window).on('throttledscroll.scroller', function() {
			var pos = constrainedRelativeScrollPosition($('.year1990'), true) * 10;

			if(pos >= 0 && pos <= 10) {
				var $year = $('.year1990 h2');
				var start = 1985;
				var end = 1990;
				$year.text(Math.min(end, Math.floor(start + Math.max(0, pos - 0.5))));

				var $items = $('.year1990 li');

				if(pos > 4) {
					$items.eq(0).removeClass('invisible');
				}

				if(pos > 4.5) {
					$items.eq(1).removeClass('invisible');
				}

				if(pos > 5) {
					$items.eq(2).removeClass('invisible');
				}

				if(pos > 5.5) {
					$items.eq(3).removeClass('invisible');
				}

				if(pos > 6) {
					$items.eq(4).removeClass('invisible');
				}
			}

			var conclusionPos = constrainedRelativeScrollPosition($('.conclusion'), true);

			if(conclusionPos > 0.2) {
				$('.conclusion span').removeClass('invisible');
			}

			if(conclusionPos > 0.425) {
				$('.conclusion strong').removeClass('invisible');
			}

		});
	};

	this.activate = function() {
		if(!this.activated) {
			$('body').removeClass('noscroller');

			if($('body').hasClass('index')) {
				activateFrontPage();
			}

			if($('article#about-us').length) {
				activateAboutUs();
			}

			if($('article.services').length) {
				activateServices();
			}

			if($('article.process').length) {
				activateProcess();
			}

			$(window).trigger('resize.scroller');
			this.activated = 5;
		}
	};

	this.deactivate = function() {
		if(this.activated > 0) {
			$('*').off('.scroller');
			$(window).off('.scroller');
			$('body').addClass('noscroller');
			$('.scroller-effect').trigger('disablescroller').removeClass('scroller-effect');
			$('.scroll-animated').each(function() {
				$(this).css('transform', '').removeClass('scroll-animated');
			});
			this.activated--;
		}
	};

	this.monitorVideos = function() {
		$('video[autoplay]').each(function() {
			var el = this;
			if(el.pause && el.play) {
				$(window).on('throttledscroll.hideOffscreen', function() {
					var scrollPosition = relativeScrollPosition($(el));
					if(scrollPosition < 0 || scrollPosition > 1) {
						el.pause();
					} else if(el.paused) {
						el.play();
					}
				});
			}
		});
	};

	this.respond = function() {
		if($(window).width() >= 960 && $(window).height() >= 650) {
			this.activate();
		} else {
			this.deactivate();
		}
	};
}

window.scrollers = new Scrollers();