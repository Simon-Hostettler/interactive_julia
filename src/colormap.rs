#[derive(Copy, Clone)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

pub struct ColorMap {
    pub c1: Color,
    pub c2: Color,
}

impl ColorMap {
    //linear interpolation
    pub fn get_col_lin(&self, t: f64) -> Color {
        let new_r = self.c1.r + ((self.c2.r - self.c1.r) as f64 * t) as u8;
        let new_g = self.c1.g + ((self.c2.g - self.c1.g) as f64 * t) as u8;
        let new_b = self.c1.b + ((self.c2.b - self.c1.b) as f64 * t) as u8;
        Color {r: new_r, g: new_g, b: new_b}
    }
}