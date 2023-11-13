pub fn process_string(s: &str) -> String {
    let s = remove_punctuation(s);
    let s = trim_whitespace(s.as_str());
    let s = s.to_ascii_lowercase();
    s
}

pub fn remove_punctuation(s: &str) -> String {
    let s = s.replace(&['(', ')', ',', '\"', '.', ';', ':', '\''][..], "");
    s
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