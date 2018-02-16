document.addEventListener('DOMContentLoaded', function() {
	window.scrollAnimations = [];
	window.scrollDetectors = [];

	window.scrollDetectors.push(
		new Px.ScrollDetector(document.querySelector('div.target')),
		new Px.ScrollDetector(document.querySelector('blockquote'))
	);

	window.scrollAnimations.push(
		new Px.ScrollAnimation(
			[document.querySelector('div.target h1')],
			window.scrollDetectors[0]
		),

		new Px.ParallaxAnimation(
			[document.querySelector('blockquote .bg')],
			window.scrollDetectors[1],
			{},
			[
				new Px.ParallaxAnimationValueSet(
					{
						scrollPixelsPerParallaxPixel: 2
					}
				)
			]
		)
	);
});