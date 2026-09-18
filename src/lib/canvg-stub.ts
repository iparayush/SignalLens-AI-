/**
 * Stub for canvg optional dependency used by jsPDF in browser environments.
 */
export class Canvg {
  static from() {
    return Promise.reject(new Error('canvg stubbed'));
  }
}
export default Canvg;
