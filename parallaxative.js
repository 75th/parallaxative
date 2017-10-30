if(! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
	&& responder.getBreakpoint() !== 'mobile-large'
	&& responder.getBreakpoint() !== 'mobile-small'
) {
	$window = $(window);

	$('[data-type="background"]').each(function(){
		var $bgobj = $(this);
		$bgobj.css('background-attachment', 'fixed');
		$bgobj.css('background-repeat', 'no-repeat');

		// data-speed attribute: An integer x, for which the background will move
		// one pixel for every x pixels of scrolling. Thus a lower speed actually
		// makes the background move faster, a speed of 1 is equivalent to
		// background-attachment: scroll without parallax, and a speed of 0 is
		// equivalent to background-attachment: fixed without parallax

		var speedDividend = $bgobj.data('speed');

		$window.on('scroll resize load', function() {
			var parallaxDistance = ($bgobj.height() + $window.height()) / speedDividend;

			// data-bg-attach attribute: If set to 'bottom', the background image's
			// bottom edge and the element's bottom edge will reach the bottom of
			// the viewport at the same time.
			//
			// Otherwise, the background-image's top edge and the element's top
			// edge will reach the top of the viewport at the same time.
			//
			// Thus, 'bottom' will make sure the very bottom of the bg image is
			// visible for at least a moment during the animation; otherwise,
			// the top of image will be visible for at least a moment.

			if($bgobj.data('bg-attach') === 'bottom') {
				var zeroPointPercent = $bgobj.height() / ($window.height() + $bgobj.height());
				var startPoint = -(parallaxDistance * zeroPointPercent);
				var endPoint = startPoint + parallaxDistance;
			} else {
				var zeroPointPercent = $window.height() / ($window.height() + $bgobj.height());
				var startPoint = parallaxDistance * zeroPointPercent;
				var endPoint = startPoint - parallaxDistance;
			}

			var offset = $bgobj.offset().top;
			var progress = ($bgobj.height() + $bgobj.offset().top - $window.scrollTop()) / ($window.height() + $bgobj.height());

			if($bgobj.data('bg-attach') === 'bottom') {
				var yPos = Math.floor((parallaxDistance * (1 - progress)) + startPoint);
				$bgobj.css('background-position', 'center bottom ' + yPos + 'px');
			} else {
				var yPos = Math.floor((parallaxDistance * progress) + endPoint);
				$bgobj.css('background-position', 'center '+ yPos + 'px');
			}
		});
	});
}