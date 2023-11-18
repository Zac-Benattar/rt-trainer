use fancy_regex::Regex;

pub fn process_string(s: &str) -> String {
    let s = remove_punctuation(s);
    let s = trim_whitespace(s.as_str());
    let s = s.to_ascii_lowercase();
    s
}

pub fn remove_punctuation(s: &str) -> String {
    let result = Regex::new(r"[^0-9A-Za-z_.\-\s]|(?<!\d)\.(?!\d)|(?<!\w)-(?!\w)$");
    let final_string = match result {
        Ok(re) => re.replace_all(s, "").to_string(),
        Err(_) => "remove punctuation error".to_owned(),
    };
    final_string
}

pub fn trim_whitespace(s: &str) -> String {
    let mut new_str = s.trim().to_owned();
    let mut prev = ' '; // The initial value doesn't really matter
    new_str.retain(|ch| {
        let result = ch != ' ' || prev != ' ';
        prev = ch;
        result
    });
    new_str
}