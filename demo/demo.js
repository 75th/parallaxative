document.addEventListener('DOMContentLoaded', function() {
	window.scrollAnimations = [];
	window.scrollDetectors = [];

	window.scrollDetectors.push(
		new ScrollDetector(document.querySelector('div.target')),
		new ScrollDetector(document.querySelector('blockquote'))
	);

	window.scrollAnimations.push(
		new ScrollAnimation(
			[document.querySelector('div.target h1')],
			window.scrollDetectors[0]
		),

		new ParallaxativeAnimation(
			[document.querySelector('blockquote .bg')],
			window.scrollDetectors[1]
		)
	);
});