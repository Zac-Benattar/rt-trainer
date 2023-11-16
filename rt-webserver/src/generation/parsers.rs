pub fn parse_parked_to_takeoff_radio_check(
    radio_check: &str,
    current_state: &State,
) -> Result<State, CustomError> {

    let mut callsign_stated = String::new();
    let mut astu_callsign_stated = String::new();
    let mut radio_freq_stated = String::new();

    // TODO - Implement this
    Ok(current_state.to_owned())
}
