/* global sprintf */
import './modernizr.js';
import './mediaCheck.js';
import './jquery.throttledresize.js';
import {sprintf} from './sprintf.js';

// --------------------------------
// Object for all scrolling effects
// --------------------------------
function Scrollers() {

	var scrollAnimate = function($els, suppliedOptions) {
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