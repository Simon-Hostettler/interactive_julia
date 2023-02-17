let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}

/**
* @returns {number}
*/
export function get_output_buffer_pointer() {
    const ret = wasm.get_output_buffer_pointer();
    return ret;
}

/**
* @param {number} width
* @param {number} height
* @param {number} t
*/
export function generate_image(width, height, t) {
    wasm.generate_image(width, height, t);
}

