pub fn parseTargetNameSenderName(message: &str) -> (&str, &str) {
    let mut target_name = "";
    let mut target_name_end = 0;
    let mut target_name_length = 0;
    let mut sender_name = "";
    let mut sender_name_start = 0;
    let mut sender_name_end = 0;

    for (i, c) in message.chars().enumerate() {
        if c == ' ' {
            target_name_start = i + 1;
        }
        if c == ',' {
            target_name_end = i;
        }
    }

    target_name = &message[..target_name_end];

    (target_name, sender_name)
}