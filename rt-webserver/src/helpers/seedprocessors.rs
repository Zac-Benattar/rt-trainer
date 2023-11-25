pub fn get_scenario_seed(whole_seed: u32) -> u32 {
    return cat_right(whole_seed, 3);
}

pub fn get_weather_seed(whole_seed: u32) -> u32 {
    return cat_left(whole_seed, count_n(whole_seed) - 3);
}

fn count_n(mut n: u32) -> u32 {
    // count the digits in the number
    if n == 0 {
        return 1;
    }

    let mut count = 0;
    while n > 0 {
        n = n / 10;
        count = count + 1;
    }

    count
}

fn cat_left(mut n: u32, cat: u32) -> u32 {
    // remove digit in left in the number
    let mut count = 0;
    let mut nn = 1;
    while count != cat {
        count = count + 1;
        nn = add_digit(nn, 0);
    }
    n = n % nn;
    n
}

fn cat_right(mut n: u32, cat: u32) -> u32 {
    // remove digit in rite in the number
    let mut count = 0;
    let mut nn = 1;
    n = reverse_n(n);
    while count != cat {
        count = count + 1;
        nn = add_digit(nn, 0);
    }
    n = n % nn;
    n
}

fn reverse_n(mut n: u32) -> u32 {
    // reverse the number
    let radix = 10;

    let mut reversed = 0;

    while n != 0 {
        reversed = reversed * radix + n % radix;
        n /= radix;
    }
    reversed
}

fn add_digit(mut n: u32, digit: u32) -> u32 {
    // add digit to number

    n = n * 10;
    n = n + digit;
    n
}
