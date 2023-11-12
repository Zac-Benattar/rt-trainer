pub fn replace_phonetic_alphabet_with_chars(message: &str) -> &std {
    let mut message = message;
    let mut message = message.replace("alpha", "a");
    let mut message = message.replace("bravo", "b");
    let mut message = message.replace("charlie", "c");
    let mut message = message.replace("delta", "d");
    let mut message = message.replace("echo", "e");
    let mut message = message.replace("foxtrot", "f");
    let mut message = message.replace("golf", "g");
    let mut message = message.replace("hotel", "h");
    let mut message = message.replace("india", "i");
    let mut message = message.replace("juliet", "j");
    let mut message = message.replace("kilo", "k");
    let mut message = message.replace("lima", "l");
    let mut message = message.replace("mike", "m");
    let mut message = message.replace("november", "n");
    let mut message = message.replace("oscar", "o");
    let mut message = message.replace("papa", "p");
    let mut message = message.replace("quebec", "q");
    let mut message = message.replace("romeo", "r");
    let mut message = message.replace("sierra", "s");
    let mut message = message.replace("tango", "t");
    let mut message = message.replace("uniform", "u");
    let mut message = message.replace("victor", "v");
    let mut message = message.replace("whiskey", "w");
    let mut message = message.replace("x-ray", "x");
    let mut message = message.replace("yankee", "y");
    let mut message = message.replace("zulu", "z");
    let mut message = message.replace("one", "1");
    let mut message = message.replace("two", "2");
    let mut message = message.replace("three", "3");
    let mut message = message.replace("four", "4");
    let mut message = message.replace("five", "5");
    let mut message = message.replace("six", "6");
    let mut message = message.replace("seven", "7");
    let mut message = message.replace("eight", "8");
    let mut message = message.replace("niner", "9");
    let mut message = message.replace("zero", "0");
}

pub fn replace_pronounciation_with_chars(message: &str) -> &str {
    let mut message = message;
    let mut message = message.replace("al fah", "a");
    let mut message = message.replace("brah voh", "b");
    let mut message = message.replace("char lee", "c");
    let mut message = message.replace("shar lee", "c");
    let mut message = message.replace("dell tah", "d");
    let mut message = message.replace("eck oh", "e");
    let mut message = message.replace("foks trot", "f");
    let mut message = message.replace("golf", "g");
    let mut message = message.replace("ho tell", "h");
    let mut message = message.replace("in dee ah", "i");
    let mut message = message.replace("jew lee ett", "j");
    let mut message = message.replace("key low", "k");
    let mut message = message.replace("lee mah", "l");
    let mut message = message.replace("mike", "m");
    let mut message = message.replace("no vem ber", "n");
    let mut message = message.replace("oss cah", "o");
    let mut message = message.replace("pah pah", "p");
    let mut message = message.replace("keh beck", "q");
    let mut message = message.replace("row me oh", "r");
    let mut message = message.replace("see air rah", "s");
    let mut message = message.replace("tang go", "t");
    let mut message = message.replace("you nee form", "u");
    let mut message = message.replace("oo nee form", "u");
    let mut message = message.replace("vik tah", "v");
    let mut message = message.replace("wiss key", "w");
    let mut message = message.replace("ecks ray", "x");
    let mut message = message.replace("yang kee", "y");
    let mut message = message.replace("zoo loo", "z");
}

pub fn replace_numeral_element(message: &str) -> &str {
    let mut message = message;
    let mut message = message.replace("wun", "1");
    let mut message = message.replace("too", "2");
    let mut message = message.replace("tree", "3");
    let mut message = message.replace("fower", "4");
    let mut message = message.replace("fife", "5");
    let mut message = message.replace("six", "6");
    let mut message = message.replace("seven", "7");
    let mut message = message.replace("ait", "8");
    let mut message = message.replace("niner", "9");
    let mut message = message.replace("zero", "0");
    let mut message = message.replace("day see mal", "decimal");
    let mut message = message.repalce("hun dred", "hundred");
    let mut message = message.replace("tou sand", "thousand");
}