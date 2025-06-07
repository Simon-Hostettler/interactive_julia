pub mod colormap;

use colormap::*;

use libm::fma;
use wasm_bindgen::prelude::*;

const JULIA_REAL: f64 = 0.7885;
const JULIA_IM: f64 = 0.7885;
const MAX_WIDTH: usize = 2560;
const MAX_HEIGHT: usize = 1440;

const OUTPUT_BUFFER_SIZE: usize = MAX_WIDTH * MAX_HEIGHT * 4;
static mut OUTPUT_BUFFER: [u8; OUTPUT_BUFFER_SIZE] = [0; OUTPUT_BUFFER_SIZE];

const POINT_BUFFER_SIZE: usize = 256 * 2;
static mut POINT_BUFFER: [u32; POINT_BUFFER_SIZE] = [0; POINT_BUFFER_SIZE];

const COL1: Color = Color {
    r: 19,
    g: 18,
    b: 28,
};
const COL2: Color = Color {
    r: 92,
    g: 153,
    b: 209,
};
const COL3: Color = Color {
    r: 248,
    g: 255,
    b: 199,
};
const COL_MAP1: ColorMap = ColorMap { c1: COL1, c2: COL2 };
const COL_MAP2: ColorMap = ColorMap { c1: COL2, c2: COL3 };

// Function to return a pointer to our buffer in wasm memory
#[wasm_bindgen]
pub fn get_output_buffer_pointer() -> *const u8 {
    let pointer: *const u8;
    unsafe {
        pointer = OUTPUT_BUFFER.as_ptr();
    }

    return pointer;
}

#[wasm_bindgen]
pub fn get_point_buffer_pointer() -> *const u32 {
    let pointer: *const u32;
    unsafe {
        pointer = POINT_BUFFER.as_ptr();
    }

    return pointer;
}

#[wasm_bindgen]
pub fn iteration_points(
    max_iter: u32,
    width: usize,
    height: usize,
    angle: f64,
    mousex: f64,
    mousey: f64,
) {
    //stores all the iteration points of the selected coordinate

    let julia_real: f64 = JULIA_REAL * angle.cos();
    let julia_im: f64 = JULIA_IM * angle.sin();

    let img_ratio: f64 = (width as f64) / (height as f64);
    let x_range: (f64, f64) = (-1.5 * img_ratio, 3.0 * img_ratio);
    let x_unit: f64 = x_range.1 / (width as f64);

    let y_range: (f64, f64) = (-1.5, 3.0);
    let y_unit: f64 = y_range.1 / (height as f64);

    let mut zx: f64 = x_range.0 + (mousex) * x_unit;
    let mut zy: f64 = y_range.0.abs() - (mousey) * y_unit;
    let mut it: u32 = 1;

    unsafe {
        POINT_BUFFER = [0; POINT_BUFFER_SIZE];
        POINT_BUFFER[0] = (((zx - x_range.0) / x_range.1) * width as f64) as u32;
        POINT_BUFFER[1] = height as u32 - (((zy - y_range.0) / y_range.1) * height as f64) as u32;
    }

    while fma(zx, zx, zy * zy) <= 4.0 && it < max_iter {
        let xtemp = fma(zx, zx, -(zy * zy));
        zy = fma(zx * 2.0, zy, julia_im);
        zx = xtemp + julia_real;

        unsafe {
            POINT_BUFFER[2 * it as usize] = (((zx - x_range.0) / x_range.1) * width as f64) as u32;
            POINT_BUFFER[2 * it as usize + 1] =
                height as u32 - (((zy - y_range.0) / y_range.1) * height as f64) as u32;
        }

        it += 1;
    }
}

#[wasm_bindgen]
pub fn generate_image(max_iter: u32, width: usize, height: usize, angle: f64) {
    let julia_real: f64 = JULIA_REAL * angle.cos();
    let julia_im: f64 = JULIA_IM * angle.sin();

    let img_ratio: f64 = (width as f64) / (height as f64);
    let x_min: f64 = -1.5 * img_ratio;
    let x_len: f64 = 3.0 * img_ratio;
    let x_unit: f64 = x_len / (width as f64);

    let y_min: f64 = -1.5;
    let y_len = 3.0;
    let y_unit: f64 = y_len / (height as f64);

    for x in 0..width {
        for y in 0..height {
            let mut zx: f64 = fma(x_unit, x as f64, x_min);
            let mut zy: f64 = fma(y_unit, y as f64, y_min.abs());
            let mut it: u32 = 0;

            while fma(zx, zx, zy * zy) <= 4.0 && it < max_iter {
                let xtemp: f64 = fma(zx, zx, -(zy * zy));
                zy = fma(zx * 2.0, zy, julia_im);
                zx = xtemp + julia_real;
                it += 1;
            }

            let buffer_index = 4 * (y * width + x);
            let col: Color;
            let half_max_iter = max_iter >> 1;
            if it < half_max_iter {
                col = COL_MAP1.get_col_lin(it as f64 / half_max_iter as f64)
            } else {
                col = COL_MAP2.get_col_lin((it - half_max_iter) as f64 / half_max_iter as f64);
            }

            unsafe {
                OUTPUT_BUFFER[buffer_index + 0] = col.r;
                OUTPUT_BUFFER[buffer_index + 1] = col.g;
                OUTPUT_BUFFER[buffer_index + 2] = col.b;
                OUTPUT_BUFFER[buffer_index + 3] = 255;
            }
        }
    }
}
