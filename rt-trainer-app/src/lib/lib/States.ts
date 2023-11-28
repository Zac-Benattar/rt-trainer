export type Status = {
    "Parked": {
        "position": "A1",
        "stage": "PreDepartInfo"
    }
}

export type COMFrequency = {
    frequency_type: "AFIS" | "TWR" | "GND",
    frequency: number,
    callsign: string
}

export type State = {
    status: Status,
    prefix: string,
    callsign: string,
    target_allocated_callsign: string,
    squark: boolean,
    current_target: COMFrequency,
    current_radio_frequency: number,
    current_transponder_frequency: number,
    lat: number,
    long: number,
    emergency: "None" | "Mayday",
    aircraft_type: string
}

export type StateMessageSeeds = {
    state: State,
    message: string,
    scenario_seed: number,
    weather_seed: number
}

export type StateMessage = {
    state: State,
    message: string
}

export type Mistake = {
    details: string,
    message: string
}