use rand_core::{OsRng, RngCore};

pub fn rand_i32() -> i32 {
    (OsRng::default().next_u32() % (i32::MAX as u32)) as i32
}