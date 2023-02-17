let wasm;

/**
* @returns {number}
*/
export function get_output_buffer_pointer() {
    const ret = wasm.get_output_buffer_pointer();
    return ret;
}

/**
* @returns {number}
*/
export function get_point_buffer_pointer() {
    const ret = wasm.get_point_buffer_pointer();
    return ret;
}

/**
* @param {number} MAX_ITER
* @param {number} width
* @param {number} height
* @param {number} angle
* @param {number} mousex
* @param {number} mousey
*/
export function iteration_points(MAX_ITER, width, height, angle, mousex, mousey) {
    wasm.iteration_points(MAX_ITER, width, height, angle, mousex, mousey);
}

/**
* @param {number} MAX_ITER
* @param {number} width
* @param {number} height
* @param {number} angle
*/
export function generate_image(MAX_ITER, width, height, angle) {
    wasm.generate_image(MAX_ITER, width, height, angle);
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function getImports() {
    const imports = {};
    imports.wbg = {};

    return imports;
}

function initMemory(imports, maybe_memory) {

}

function finalizeInit(instance, module) {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;


    return wasm;
}

function initSync(module) {
    const imports = getImports();

    initMemory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return finalizeInit(instance, module);
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('interactive_julia_bg.wasm', import.meta.url);
    }
    const imports = getImports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    initMemory(imports);

    const { instance, module } = await load(await input, imports);

    return finalizeInit(instance, module);
}

export { initSync }
export default init;
