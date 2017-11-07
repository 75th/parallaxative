document.addEventListener('DOMContentLoaded', function() {
	window.scrollAnimations = [];
	window.scrollDetectors = [];

	window.scrollDetectors.push( new ScrollDetector(document.querySelector('div.target')) );

	window.scrollAnimations.push(
		new ScrollAnimation(
			[document.querySelector('div.target h1')],
			window.scrollDetectors[0]
		)
	);
});