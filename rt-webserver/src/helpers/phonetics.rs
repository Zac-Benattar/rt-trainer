pub fn replace_phonetics_with_text_formatting(message: &str) -> String {
    replace_numeral_elements_pronounciation(replace_pronounciation_with_chars(
        replace_phonetic_alphabet_with_chars(message.to_owned()),
    ))
}

pub fn replace_text_formatting_with_phonetics(message: &str) -> String {
    replace_phonetic_alphabet_with_pronounciation(replace_chars_with_phonetic_alphabet(
        replace_numeral_elements_pronounciation(message.to_owned()),
    ))
}

// potentially use hashmaps for these methods, they will not work, see the match method for how to fix without hashmap
pub fn replace_phonetic_alphabet_with_chars(message: String) -> String {
    let message = message.replace(" alpha ", " a ");
    let message = message.replace(" bravo ", " b ");
    let message = message.replace(" charlie ", " c ");
    let message = message.replace(" delta ", " d ");
    let message = message.replace(" echo ", " e ");
    let message = message.replace(" foxtrot ", " f ");
    let message = message.replace(" golf ", " g ");
    let message = message.replace(" hotel ", " h ");
    let message = message.replace(" india ", " i ");
    let message = message.replace(" juliet ", " j ");
    let message = message.replace(" kilo ", " k ");
    let message = message.replace(" lima ", " l ");
    let message = message.replace(" mike ", " m ");
    let message = message.replace(" november ", " n ");
    let message = message.replace(" oscar ", " o ");
    let message = message.replace(" papa ", " p ");
    let message = message.replace(" quebec ", " q ");
    let message = message.replace(" romeo ", " r ");
    let message = message.replace(" sierra ", " s ");
    let message = message.replace(" tango ", " t ");
    let message = message.replace(" uniform ", " u ");
    let message = message.replace(" victor ", " v ");
    let message = message.replace(" whiskey ", " w ");
    let message = message.replace(" x-ray ", " x ");
    let message = message.replace(" yankee ", " y ");
    let message = message.replace(" zulu ", " z ");
    message
}

pub fn replace_pronounciation_with_chars(message: String) -> String {
    let message = message.replace(" al fah ", " a ");
    let message = message.replace(" brah voh ", " b ");
    let message = message.replace(" char lee ", " c ");
    let message = message.replace(" shar lee ", " c ");
    let message = message.replace(" dell tah ", " d ");
    let message = message.replace(" eck oh ", " e ");
    let message = message.replace(" foks trot ", " f ");
    let message = message.replace(" golf ", " g ");
    let message = message.replace(" ho tell ", " h ");
    let message = message.replace(" in dee ah ", " i ");
    let message = message.replace(" jew lee ett ", " j ");
    let message = message.replace(" key low ", " k ");
    let message = message.replace(" lee mah ", " l ");
    let message = message.replace(" mike ", " m ");
    let message = message.replace(" no vem ber ", " n ");
    let message = message.replace(" oss cah ", " o ");
    let message = message.replace(" pah pah ", " p ");
    let message = message.replace(" keh beck ", " q ");
    let message = message.replace(" row me oh ", " r ");
    let message = message.replace(" see air rah ", " s ");
    let message = message.replace(" tang go ", " t ");
    let message = message.replace(" you nee form ", " u ");
    let message = message.replace(" oo nee form ", " u ");
    let message = message.replace(" vik tah ", " v ");
    let message = message.replace(" wiss key ", " w ");
    let message = message.replace(" ecks ray ", " x ");
    let message = message.replace(" yang kee ", " y ");
    let message = message.replace(" zoo loo ", " z ");
    message
}

pub fn replace_numeral_elements_pronounciation(message: String) -> String {
    let message = message.replace(" one ", " 1 ");
    let message = message.replace(" wun ", " 1 ");
    let message = message.replace(" two ", " 2 ");
    let message = message.replace(" too ", " 2 ");
    let message = message.replace(" three ", " 3 ");
    let message = message.replace(" tree ", " 3 ");
    let message = message.replace(" four ", " 4 ");
    let message = message.replace(" fower ", " 4 ");
    let message = message.replace(" five ", " 5 ");
    let message = message.replace(" fife ", " 5 ");
    let message = message.replace(" six ", " 6 ");
    let message = message.replace(" seven ", " 7 ");
    let message = message.replace(" eight ", " 8 ");
    let message = message.replace(" ait ", " 8 ");
    let message = message.replace(" niner ", " 9 ");
    let message = message.replace(" zero ", " 0 ");
    let message = message.replace(" day see mal ", " decimal ");
    let message = message.replace(" hun dred ", " hundred ");
    let message = message.replace(" tou sand ", " thousand ");
    message
}

pub fn replace_chars_with_phonetic_alphabet(message: String) -> String {
    let message = message.replace(" a ", " alpha ");
    let message = message.replace(" b ", " bravo ");
    let message = message.replace(" c ", " charlie ");
    let message = message.replace(" d ", " delta ");
    let message = message.replace(" e ", " echo ");
    let message = message.replace(" f ", " foxtrot ");
    let message = message.replace(" g ", " golf ");
    let message = message.replace(" h ", " hotel ");
    let message = message.replace(" i ", " india ");
    let message = message.replace(" j ", " juliet ");
    let message = message.replace(" k ", " kilo ");
    let message = message.replace(" l ", " lima ");
    let message = message.replace(" m ", " mike ");
    let message = message.replace(" n ", " november ");
    let message = message.replace(" o ", " oscar ");
    let message = message.replace(" p ", " papa ");
    let message = message.replace(" q ", " quebec ");
    let message = message.replace(" r ", " romeo ");
    let message = message.replace(" s ", " sierra ");
    let message = message.replace(" t ", " tango ");
    let message = message.replace(" u ", " uniform ");
    let message = message.replace(" v ", " victor ");
    let message = message.replace(" w ", " whiskey ");
    let message = message.replace(" x ", " x-ray ");
    let message = message.replace(" y ", " yankee ");
    let message = message.replace(" z ", " zulu ");
    let message = message.replace(" 1 ", " one ");
    let message = message.replace(" 2 ", " two ");
    let message = message.replace(" 3 ", " three ");
    let message = message.replace(" 4 ", " four ");
    let message = message.replace(" 5 ", " five ");
    let message = message.replace(" 6 ", " six ");
    let message = message.replace(" 7 ", " seven ");
    let message = message.replace(" 8 ", " eight ");
    let message = message.replace(" 9 ", " niner ");
    let message = message.replace(" 0 ", " zero ");
    message
}

pub fn replace_string_with_phonetic_alphabet(string: String) -> String {
    let mut return_string: String = "".to_string();
    let chars: Vec<char> = string.chars().collect();
    for char in chars {
        return_string.push_str(replace_char_with_phonetic_alphabet(char).as_str());
        return_string.push_str(" ");
    }
    return_string
}

pub fn replace_char_with_phonetic_alphabet(character: char) -> String {
    match character {
        'a' => "alpha".to_string(),
        'b' => "bravo".to_string(),
        'c' => "charlie".to_string(),
        'd' => "delta".to_string(),
        'e' => "echo".to_string(),
        'f' => "foxtrot".to_string(),
        'g' => "golf".to_string(),
        'h' => "hotel".to_string(),
        'i' => "india".to_string(),
        'j' => "juliet".to_string(),
        'k' => "kilo".to_string(),
        'l' => "lima".to_string(),
        'm' => "mike".to_string(),
        'n' => "november".to_string(),
        'o' => "oscar".to_string(),
        'p' => "papa".to_string(),
        'q' => "quebec".to_string(),
        'r' => "romeo".to_string(),
        's' => "sierra".to_string(),
        't' => "tango".to_string(),
        'u' => "uniform".to_string(),
        'v' => "victor".to_string(),
        'w' => "whiskey".to_string(),
        'x' => "x-ray".to_string(),
        'y' => "yankee".to_string(),
        'z' => "zulu".to_string(),
        '1' => "one".to_string(),
        '2' => "two".to_string(),
        '3' => "three".to_string(),
        '4' => "four".to_string(),
        '5' => "five".to_string(),
        '6' => "six".to_string(),
        '7' => "seven".to_string(),
        '8' => "eight".to_string(),
        '9' => "niner".to_string(),
        '0' => "zero".to_string(),
        _ => " ".to_string(),
    }
}

pub fn replace_phonetic_alphabet_with_pronounciation(message: String) -> String {
    // potentially use seed to determine which option for charlie and uniform
    let message = message.replace(" alpha ", " al fah ");
    let message = message.replace(" bravo ", " brah voh ");
    let message = message.replace(" charlie ", " char lee ");
    // let  message = message.replace( " charlie " ,  " shar lee " );
    let message = message.replace(" delta ", " dell tah ");
    let message = message.replace(" echo ", " eck oh ");
    let message = message.replace(" foxtrot ", " foks trot ");
    let message = message.replace(" hotel ", " ho tell ");
    let message = message.replace(" india ", " in dee ah ");
    let message = message.replace(" juliet ", " jew lee ett ");
    let message = message.replace(" kilo ", " key low ");
    let message = message.replace(" lima ", " lee mah ");
    let message = message.replace(" mike ", " mike ");
    let message = message.replace(" november ", " no vem ber ");
    let message = message.replace(" oscar ", " oss cah ");
    let message = message.replace(" papa ", " pah pah ");
    let message = message.replace(" quebec ", " keh beck ");
    let message = message.replace(" romeo ", " row me oh ");
    let message = message.replace(" sierra ", " see air rah ");
    let message = message.replace(" tango ", " tang go ");
    let message = message.replace(" uniform ", " you nee form ");
    // let  message = message.replace( " uniform " ,  " oo nee form " );
    let message = message.replace(" victor ", " vik tah ");
    let message = message.replace(" whiskey ", " wiss key ");
    let message = message.replace(" x-ray ", " ecks ray ");
    let message = message.replace(" zulu ", " zoo loo ");
    message
}

pub fn replace_numeral_elements_with_pronounciation(message: String) -> String {
    let message = message.replace("1", " wun ");
    let message = message.replace("2", " too ");
    let message = message.replace("3", " tree ");
    let message = message.replace("4", " fower ");
    let message = message.replace("5", " fife ");
    let message = message.replace("6", " six ");
    let message = message.replace("7", " seven ");
    let message = message.replace("8", " ait ");
    let message = message.replace("9", " niner ");
    let message = message.replace("0", " zero ");
    let message = message.replace(" decimal ", " day see mal ");
    let message = message.replace(" hundred ", " hun dred ");
    let message = message.replace(" thousand ", " tou sand ");
    message
}
