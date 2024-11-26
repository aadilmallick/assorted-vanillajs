export class AnimationModel {
  static animate({
    timing,
    draw,
    duration,
  }: {
    timing: (timeFraction: number) => number;
    draw: (progress: number) => void;
    duration: number;
  }) {
    let start = performance.now();

    requestAnimationFrame(function animate(time) {
      // timeFraction goes from 0 to 1
      let timeFraction = (time - start) / duration;
      if (timeFraction > 1) timeFraction = 1;

      // calculate the current animation state
      let progress = timing(timeFraction);

      draw(progress); // draw it

      if (timeFraction < 1) {
        requestAnimationFrame(animate);
      }
    });
  }

  static linear(timeFraction: number) {
    return timeFraction;
  }
  static quad(timeFraction: number) {
    return Math.pow(timeFraction, 2);
  }
  static circ(timeFraction: number) {
    return 1 - Math.sin(Math.acos(timeFraction));
  }
  static back(elasticity: number, timeFraction: number) {
    return (
      Math.pow(timeFraction, 2) * ((elasticity + 1) * timeFraction - elasticity)
    );
  }
  static bounce(timeFraction: number) {
    for (let a = 0, b = 1; 1; a += b, b /= 2) {
      if (timeFraction >= (7 - 4 * a) / 11) {
        return (
          -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2)
        );
      }
    }
  }
  static elastic(elasticity: number, timeFraction: number) {
    return (
      Math.pow(2, 10 * (timeFraction - 1)) *
      Math.cos(((20 * Math.PI * elasticity) / 3) * timeFraction)
    );
  }
  static makeEaseOut(timing: (timeFraction: number) => number) {
    return function (timeFraction: number) {
      return 1 - timing(1 - timeFraction);
    };
  }
  static makeEaseInOut(timing: (timeFraction: number) => number) {
    return function (timeFraction: number) {
      if (timeFraction < 0.5) return timing(2 * timeFraction) / 2;
      else return (2 - timing(2 * (1 - timeFraction))) / 2;
    };
  }
}
