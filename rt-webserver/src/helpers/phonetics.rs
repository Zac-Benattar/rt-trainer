pub fn replace_phonetic_alphabet_with_chars(s: &str) -> String {
    // Loop on each word and replace with pronounciation if needed
    let mut return_string: String = "".to_string();
    let words: Vec<&str> = s.split(" ").collect();
    for (word, is_last_element) in words
        .iter()
        .enumerate()
        .map(|(i, w)| (w, i == words.len() - 1))
    {
        return_string.push(replace_phonetic_alphabet_word_with_char(word));
        if !is_last_element {
            return_string.push_str("-");
        }
    }

    return_string
}

fn replace_phonetic_alphabet_word_with_char(s: &str) -> char {
    match s {
        "alpha" => 'a',
        "bravo" => 'b',
        "charlie" => 'c',
        "delta" => 'd',
        "echo" => 'e',
        "foxtrot" => 'f',
        "golf" => 'g',
        "hotel" => 'h',
        "india" => 'i',
        "juliet" => 'j',
        "kilo" => 'k',
        "lima" => 'l',
        "mike" => 'm',
        "november" => 'n',
        "oscar" => 'o',
        "papa" => 'p',
        "quebec" => 'q',
        "romeo" => 'r',
        "sierra" => 's',
        "tango" => 't',
        "uniform" => 'u',
        "victor" => 'v',
        "whiskey" => 'w',
        "x-ray" => 'x',
        "zulu" => 'z',
        _ => ' ',
    }
}

pub fn replace_string_with_phonetic_alphabet(string: &str) -> String {
    let mut return_string: String = "".to_string();
    let chars: Vec<char> = string.chars().collect();
    for (char, is_last_element) in chars
        .iter()
        .enumerate()
        .map(|(i, w)| (w, i == chars.len() - 1))
    {
        if char != &'-' {
            return_string.push_str(&replace_char_with_phonetic_alphabet(*char));
            if !is_last_element {
                return_string.push_str(" ");
            }
        }
    }

    return_string
}

pub fn replace_char_with_phonetic_alphabet(character: char) -> &'static str {
    match character {
        'a' => "alpha",
        'b' => "bravo",
        'c' => "charlie",
        'd' => "delta",
        'e' => "echo",
        'f' => "foxtrot",
        'g' => "golf",
        'h' => "hotel",
        'i' => "india",
        'j' => "juliet",
        'k' => "kilo",
        'l' => "lima",
        'm' => "mike",
        'n' => "november",
        'o' => "oscar",
        'p' => "papa",
        'q' => "quebec",
        'r' => "romeo",
        's' => "sierra",
        't' => "tango",
        'u' => "uniform",
        'v' => "victor",
        'w' => "whiskey",
        'x' => "x-ray",
        'y' => "yankee",
        'z' => "zulu",
        '1' => "one",
        '2' => "two",
        '3' => "three",
        '4' => "four",
        '5' => "five",
        '6' => "six",
        '7' => "seven",
        '8' => "eight",
        '9' => "niner",
        '0' => "zero",
        '-' => "-",
        _ => "",
    }
}

pub fn replace_phonetic_alphabet_with_pronounciation(s: &str) -> String {
    // Loop on each word and replace with pronounciation if needed
    let mut return_string: String = "".to_string();
    let words: Vec<&str> = s.split(" ").collect();
    for (word, is_last_element) in words
        .iter()
        .enumerate()
        .map(|(i, w)| (w, i == words.len() - 1))
    {
        return_string.push_str(&replace_phonetic_alphabet_word_with_pronounciation(word));
        if !is_last_element {
            return_string.push_str(" ");
        }
    }
    return_string
}

pub fn replace_phonetic_alphabet_word_with_pronounciation(s: &str) -> &str {
    // TODO potentially use seed to determine whether to use second option for charlie and uniform
    // let  s = s.replace( " charlie " ,  " shar lee " );
    // let  s = s.replace( " uniform " ,  " oo nee form " );
    match s {
        "alpha" => "al fah",
        "bravo" => "brah voh",
        "charlie" => "char lee",
        "delta" => "dell tah",
        "echo" => "eck oh",
        "foxtrot" => "foks trot",
        "golf" => "golf",
        "hotel" => "ho tell",
        "india" => "in dee ah",
        "juliet" => "jew lee ett",
        "kilo" => "key low",
        "lima" => "lee mah",
        "mike" => "mike",
        "november" => "no vem ber",
        "oscar" => "oss cah",
        "papa" => "pah pah",
        "quebec" => "keh beck",
        "romeo" => "row me oh",
        "sierra" => "see air rah",
        "tango" => "tang go",
        "uniform" => "you nee form",
        "victor" => "vik tah",
        "whiskey" => "wiss key",
        "x-ray" => "ecks ray",
        "yankee" => "yankee",
        "zulu" => "zoo loo",
        _ => "",
    }
}

pub fn replace_numeral_elements_with_pronounciation(s: &str) -> String {
    // Loop on each word and replace with pronounciation if needed
    let mut return_string: String = "".to_string();
    let words: Vec<&str> = s.split(" ").collect();
    for (word, is_last_element) in words
        .iter()
        .enumerate()
        .map(|(i, w)| (w, i == words.len() - 1))
    {
        return_string.push_str(&replace_numeral_element_with_pronounciation(word));
        if !is_last_element {
            return_string.push_str(" ");
        }
    }
    return_string
}

fn replace_numeral_element_with_pronounciation(s: &str) -> &str {
    match s {
        "1" => "wun",
        "2" => "too",
        "3" => "tree",
        "4" => "fower",
        "5" => "fife",
        "6" => "six",
        "7" => "seven",
        "8" => "ait",
        "9" => "niner",
        "0" => "zero",
        "decimal" => "day see mal",
        "hundred" => "hun dred",
        "thousand" => "tou sand",
        _ => ""
    }
}

pub fn replace_pronounciation_with_phonetic_alphabet(s: &str) -> String {
    let mut return_string: String = "".to_string();
    let words: Vec<&str> = s.split(" ").collect();
    for (word, is_last_element) in words
        .iter()
        .enumerate()
        .map(|(i, w)| (w, i == words.len() - 1))
    {
        return_string.push_str(&replace_pronounciation_with_phonetic_alphabet_word(word));
        if !is_last_element {
            return_string.push_str(" ");
        }
    }
    return_string
}

// Defualt case here ignores already correct words such as if november passed in, would return ""
fn replace_pronounciation_with_phonetic_alphabet_word(s: &str) -> &str {
    match s {
        "al fah" => "alpha",
        "brah voh" => "bravo",
        "char lee" => "charlie",
        "shar lee" => "charlie",
        "dell tah" => "dell tah",
        "eck oh" => "eck oh",
        "golf" => "golf",
        "ho tell" => "hotel",
        "in dee ah" => "india",
        "jew lee ett" => "juliet",
        "key low" => "kilo",    
        "lee mah" => "lima",
        "mike" => "mike",
        "no vem ber" => "november",
        "oss cah" => "oscar",
        "pah pah" => "papa",
        "keh beck" => "quebec",
        "row me oh" => "romeo",
        "see air rah" => "sierra",
        "tang go" => "tango",
        "you nee form" => "uniform",
        "vik tah" => "victor",
        "wiss key" => "whiskey",
        "ecks ray" => "x-ray",
        "yankee" => "yankee",
        "zoo loo" => "zulu",
        _ => ""
    }
}

pub fn replace_pronounciation_with_numeral_elements(s: &str) -> String {
    let mut return_string: String = "".to_string();
    let words: Vec<&str> = s.split(" ").collect();
    for (word, is_last_element) in words
        .iter()
        .enumerate()
        .map(|(i, w)| (w, i == words.len() - 1))
    {
        return_string.push_str(&replace_pronounciation_with_numeral_element(word));
        if !is_last_element {
            return_string.push_str(" ");
        }
    }
    return_string
}

fn replace_pronounciation_with_numeral_element(s: &str) -> &str {
    match s {
        "wun" => "1",
        "too" => "2",
        "tree" => "3",
        "fower" => "4",
        "fife" => "5",
        "six" => "6",
        "seven" => "7",
        "ait" => "8",
        "niner" => "9",
        "zero" => "0",
        "day see mal" => "decimal",
        "hun dread" => "hundred",
        "tou sand" => "thousand",
        _ => ""
    }
}
