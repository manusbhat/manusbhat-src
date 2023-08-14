use std::collections::HashMap;
use std::fs;

pub fn process_markup_meta(file_name: &str) -> HashMap<String, String> {
    fs::read_to_string(file_name)
        .map(|contents| {
            let mut result = HashMap::new();

            populate_hashmaps(&contents, &mut result);
            result
        })
        .unwrap_or_default()
}

fn populate_hashmaps(content: &str, map: &mut HashMap<String, String>) {
    let lines = content.lines();
    for line in lines {
        if line.starts_with('[') && line.ends_with(']') {
            let parts: Vec<&str> = line[1 .. line.len() - 1]
                .splitn(2, ':')
                .map(str::trim)
                .collect();

            if parts.len() == 2 {
                let key = parts[0].to_string();
                let value = parts[1].to_string();
                map.insert(key, value);
            }
        }
    }
}
