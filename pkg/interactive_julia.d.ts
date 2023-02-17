/* tslint:disable */
/* eslint-disable */
/**
* @returns {number}
*/
export function get_output_buffer_pointer(): number;
/**
* @returns {number}
*/
export function get_point_buffer_pointer(): number;
/**
* @param {number} MAX_ITER
* @param {number} width
* @param {number} height
* @param {number} angle
* @param {number} mousex
* @param {number} mousey
*/
export function iteration_points(MAX_ITER: number, width: number, height: number, angle: number, mousex: number, mousey: number): void;
/**
* @param {number} MAX_ITER
* @param {number} width
* @param {number} height
* @param {number} angle
*/
export function generate_image(MAX_ITER: number, width: number, height: number, angle: number): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly get_output_buffer_pointer: () => number;
  readonly get_point_buffer_pointer: () => number;
  readonly iteration_points: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly generate_image: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
