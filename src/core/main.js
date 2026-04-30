/**
 * @module Core
 * @submodule Structure
 * @for p5
 * @requires constants
 */

import * as constants from './constants';

/**
 * This is the p5 instance constructor.
 *
 * A p5 object holds all the properties and methods for a single p5 sketch.
 * It can be instantiated in global mode (where p5 functions are available
 * globally) or instance mode (where they are bound to a specific object).
 *
 * @class p5
 * @constructor
 * @param {function} sketch a closure that can set optional preload(),
 *                          setup(), and/or draw() properties on the
 *                          given p5 instance
 * @param {HTMLElement} [node] element to attach the canvas to
 */
class p5 {
  constructor(sketch, node) {
    //////////////////////////////////////////////
    // PUBLIC p5 PROPERTIES AND METHODS
    //////////////////////////////////////////////

    /**
     * A function that's called once to load assets before the sketch runs.
     * @property {function} preload
     */
    this.preload = null;

    /**
     * A function that's called once when the sketch begins running.
     * @property {function} setup
     */
    this.setup = null;

    /**
     * A function that's called repeatedly while the sketch runs.
     * @property {function} draw
     */
    this.draw = null;

    // Internal state
    this._setupDone = false;
    this._preloadDone = false;
    this._frameRate = 60;
    this._frameCount = 0;
    this._isGlobal = false;
    this._loop = true;
    this._startTime = null;
    this._userNode = node;
    this._renderer = null;
    this._elements = [];
    this._requestAnimId = 0;
    this._preloadCount = 0;

    // Bind constants to instance
    for (const [key, val] of Object.entries(constants)) {
      this[key] = val;
    }

    // Execute the sketch closure
    if (typeof sketch === 'function') {
      sketch(this);
    }

    // Start the sketch lifecycle
    this._start();
  }

  /**
   * Starts the p5 lifecycle: preload -> setup -> draw loop
   * @private
   */
  _start() {
    if (typeof this.preload === 'function') {
      this.preload();
      this._waitForPreload();
    } else {
      this._setup();
      this._draw();
    }
  }

  /**
   * Waits for all preload assets to finish loading before calling setup.
   * @private
   */
  _waitForPreload() {
    if (this._preloadCount === 0) {
      this._setup();
      this._draw();
    } else {
      setTimeout(() => this._waitForPreload(), 10);
    }
  }

  /**
   * Calls the user-defined setup() function once.
   * @private
   */
  _setup() {
    if (typeof this.setup === 'function') {
      this.setup();
    }
    this._setupDone = true;
    this._startTime = window.performance.now();
  }

  /**
   * Runs the draw loop via requestAnimationFrame.
   * @private
   */
  _draw() {
    if (!this._loop) return;

    if (typeof this.draw === 'function') {
      this._frameCount++;
      this.draw();
    }

    this._requestAnimId = window.requestAnimationFrame(() => this._draw());
  }

  /**
   * Stops the draw loop.
   */
  noLoop() {
    this._loop = false;
    window.cancelAnimationFrame(this._requestAnimId);
  }

  /**
   * Resumes the draw loop.
   */
  loop() {
    if (!this._loop) {
      this._loop = true;
      this._draw();
    }
  }

  /**
   * Returns the current frame count.
   * @returns {number}
   */
  get frameCount() {
    return this._frameCount;
  }
}

export default p5;
