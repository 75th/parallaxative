# Parallaxative

A vanilla JS library to help those who must implement parallax under duress. Contains several classes to help run code based on the viewport position of an HTML element.

This seems to work decently in most circumstances, but the API is very ugly; it needs massive cleanup and documentation improvements. Use at your own risk.

## TODO

<small>(in rough order of importance)</small>

- Add necessary default CSS for `ParallaxAnimation`s
- Document all classes extensively in code and in readme
- Accept strings/dicts everywhere objects are now required
    - Accept a media query string instead of a MediaQueryList object
    - Accept a dict with options instead of an object already instantiated
      with those options
    - *Et cetera*
- Accept single objects everywhere arrays of objects are now required
- Disable `ParallaxAnimation`s in IE by default?
- Clean up or eliminate the `AnimationValueSet` classes
    - If not eliminate, then maybe add `ParallaxAnimationValueSet.prototype.getCSSValue()`? I can't remember at the moment whether it makes sense to do that
- Substantially improve the power and flexibility of the `ScrollTrigger` class
- Implement `startPosition` and `endPosition` options in `ScrollAnimation`
- Enhance  `ScrollDetector.prototype.relativeScrollPosition()` to base the `0` and `1` points at places other than immediately before/after the element scrolls onto/off the screen
    - Enhance `ScrollAnimation` and `ScrollTrigger` to allow the above