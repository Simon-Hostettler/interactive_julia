pub mod colormap;

use colormap::*;

use std::f64::consts::PI;

use wasm_bindgen::prelude::*;

const MAX_WIDTH: usize = 1920;
const MAX_HEIGHT: usize = 1080;

const OUTPUT_BUFFER_SIZE: usize = MAX_WIDTH * MAX_HEIGHT * 4;
static mut OUTPUT_BUFFER: [u8; OUTPUT_BUFFER_SIZE] = [0; OUTPUT_BUFFER_SIZE];

const POINT_BUFFER_SIZE: usize = 256 * 2;
static mut POINT_BUFFER: [u32; POINT_BUFFER_SIZE] = [0; POINT_BUFFER_SIZE];

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
pub fn iteration_points(MAX_ITER: u32, width: usize, height: usize, angle: f64, mousex: f64, mousey: f64) {
    //stores all the iteration points of the selected coordinate

    
    let julia_complex: (f64, f64) = (0.7885 * angle.cos(), 0.7885 * angle.sin());

    let img_ratio = (width as f64) / (height as f64);
    let x_range: (f64, f64) = (-1.5 * img_ratio, 3.0 * img_ratio);
    let x_unit: f64 = x_range.1 / (width as f64);

    let y_range: (f64, f64) = (-1.5, 3.0);
    let y_unit: f64 = y_range.1 / (height as f64);

    let mut zx = x_range.0 + (mousex) * x_unit;
    let mut zy = y_range.0.abs() - (mousey) * y_unit;
    let mut it: u32 = 1;
    unsafe {
        POINT_BUFFER = [0; POINT_BUFFER_SIZE];
        POINT_BUFFER[0] = (((zx - x_range.0) / x_range.1) * width as f64)as u32;
        POINT_BUFFER[1] = height as u32 - (((zy - y_range.0) / y_range.1) * height as f64) as u32;
    }
   

    while (zx * zx + zy * zy) <= 4.0 && it < MAX_ITER {

        let xtemp = zx * zx - (zy * zy);
        zy = (2.0 * zx * zy) + julia_complex.1;
        zx = xtemp + julia_complex.0;

        unsafe {
            POINT_BUFFER[2 * it as usize] = (((zx - x_range.0) / x_range.1) * width as f64)as u32;
            POINT_BUFFER[2* it as usize + 1] = height as u32 - (((zy - y_range.0) / y_range.1) * height as f64) as u32;
        }
        
        it += 1;
    }
}
#[wasm_bindgen]
pub fn generate_image(MAX_ITER: u32, width: usize, height: usize, angle: f64) {

    //colors to interpolate between dependent to # of iterations
    let col1 = Color {r: 19, g: 18, b: 28};
    let col2 = Color {r: 92, g: 153, b: 209};
    let col3 = Color {r: 248, g: 255, b: 199};
    let col_map1 = ColorMap {c1: col1, c2: col2};
    let col_map2 = ColorMap {c1: col2, c2: col3};

    let img_ratio = (width as f64) / (height as f64);
    let x_range: (f64, f64) = (-1.5 * img_ratio, 3.0 * img_ratio);
    let x_unit: f64 = x_range.1 / (width as f64);

    let y_range: (f64, f64) = (-1.5, 3.0);
    let y_unit: f64 = y_range.1 / (height as f64);

    let julia_complex: (f64, f64) = (0.7885 * angle.cos(), 0.7885 * angle.sin());

    for x in 0..width {
        for y in 0..height {

            let mut zx = x_range.0 + (x as f64) * x_unit;
            let mut zy = y_range.0.abs() - (y as f64) * y_unit;
            let mut it: u32 = 0;

            while (zx * zx + zy * zy) <= 4.0 && it < MAX_ITER {
                let xtemp = zx * zx - (zy * zy);
                zy = (2.0 * zx * zy) + julia_complex.1;
                zx = xtemp + julia_complex.0;
                it += 1;
            }

            
            let buffer_index = 4 * (y * width + x);
            let col: Color;
            if it < MAX_ITER / 2 {
                col = col_map1.get_col_lin(it as f64 / (MAX_ITER / 2) as f64)
            } else {
                col = col_map2.get_col_lin((it - MAX_ITER / 2) as f64 / (MAX_ITER / 2) as f64);
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
