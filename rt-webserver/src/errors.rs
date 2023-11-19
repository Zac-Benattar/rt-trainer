use std::fmt;

use axum::{http::StatusCode, response::IntoResponse, Json};
use serde_json::json;

use crate::models::aerodrome::Aerodrome;

pub enum CustomError {
    InternalServerError,
    BadRequest,
    UserCallNotFound,
    ATCCallNotFound,
    UserAccountNotFound,
    ATCCallGenerationError,
    OtherAircraftCallGenerationError,
    WrongTarget,
}

pub enum ParseError {
    InvalidJSONError,
    FrequencyParseError {
        frequency_found: String,
        frequency_expected: String,
    },
    FrequencyMissingError {
        frequency_expected: String,
    },
    FrequencyIncorrectError {
        frequency_found: String,
        frequency_expected: String,
    },
    CallsignParseError {
        callsign_found: String,
        callsign_expected: String,
    },
    CallsignMissingError {
        callsign_expected: String,
    },
    MessageParseError {
        message_found: String,
        message_expected: String,
    },
    MessageMissingError {
        details: String,
    },
    SeedParseError {
        seed_found: String,
    },
    ParseInputTooLongError,
    RunwayInvalidError {
        aerodrome: Aerodrome,
        runway_index: usize,
    },
}

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let string_version = match self {
            Self::InvalidJSONError => "Invalid JSON Error".to_owned(),
            Self::FrequencyParseError {
                frequency_found,
                frequency_expected,
            } => format!(
                "Frequency Parse Error: Frequency found: {}, Frequency expected: {}",
                frequency_found, frequency_expected
            ),
            Self::FrequencyMissingError { frequency_expected } => {
                format!(
                    "Frequency Missing Error: Frequency expected: {}",
                    frequency_expected
                )
            }
            Self::FrequencyIncorrectError {
                frequency_found,
                frequency_expected,
            } => format!(
                "Frequency Incorrect Error: Frequency found: {}, Frequency expected: {}",
                frequency_found, frequency_expected
            ),
            Self::CallsignParseError {
                callsign_found,
                callsign_expected,
            } => format!(
                "Callsign Parse Error: Callsign found: {}, Callsign expected: {}",
                callsign_found, callsign_expected
            ),
            Self::CallsignMissingError { callsign_expected } => format!(
                "Callsign Missing Error: Callsign expected: {}",
                callsign_expected
            ),
            Self::MessageParseError {
                message_found,
                message_expected,
            } => format!(
                "Message Parse Error: Message found: {}, Message expected: {}",
                message_found, message_expected
            ),
            Self::MessageMissingError { details } => {
                format!("Message Missing Error: Details: {}", details)
            }
            Self::SeedParseError { seed_found } => {
                format!("Seed Parse Error: Seed found: {}", seed_found)
            }
            Self::ParseInputTooLongError => "Parse Input Too Long Error".to_string(),
            Self::RunwayInvalidError {
                aerodrome,
                runway_index,
            } => {
                format!(
                    "Runway Invalid Error: Num runways: {}, Runway requested {}",
                    aerodrome.runways.len(),
                    runway_index
                )
            }
        };
        write!(f, "{}", string_version)
    }
}

impl IntoResponse for ParseError {
    fn into_response(self) -> axum::response::Response {
        let (status, error_message) = match self {
            Self::InvalidJSONError => (
                StatusCode::EXPECTATION_FAILED,
                "Invalid JSON Error".to_string(),
            ),
            Self::FrequencyParseError {
                frequency_found,
                frequency_expected,
            } => (
                StatusCode::EXPECTATION_FAILED,
                format!(
                    "Frequency Parse Error: Frequency found: {}, Frequency expected: {}",
                    frequency_found, frequency_expected
                ),
            ),
            Self::FrequencyMissingError { frequency_expected } => (
                StatusCode::EXPECTATION_FAILED,
                format!(
                    "Frequency Missing Error: Frequency expected: {}",
                    frequency_expected
                ),
            ),
            Self::FrequencyIncorrectError {
                frequency_found,
                frequency_expected,
            } => (
                StatusCode::EXPECTATION_FAILED,
                format!(
                    "Frequency Incorrect Error: Frequency found: {}, Frequency expected: {}",
                    frequency_found, frequency_expected
                ),
            ),
            Self::CallsignParseError {
                callsign_found,
                callsign_expected,
            } => (
                StatusCode::EXPECTATION_FAILED,
                format!(
                    "Callsign Parse Error: Callsign found: {}, Callsign expected: {}",
                    callsign_found, callsign_expected
                ),
            ),
            Self::CallsignMissingError { callsign_expected } => (
                StatusCode::EXPECTATION_FAILED,
                format!(
                    "Callsign Missing Error: Callsign expected: {}",
                    callsign_expected
                ),
            ),
            Self::MessageParseError {
                message_found,
                message_expected,
            } => (
                StatusCode::EXPECTATION_FAILED,
                format!(
                    "Message Parse Error: Message found: {}, Message expected: {}",
                    message_found, message_expected
                ),
            ),
            Self::MessageMissingError { details } => (
                StatusCode::EXPECTATION_FAILED,
                format!("Message Missing Error: Details: {}", details),
            ),
            Self::SeedParseError { seed_found } => (
                StatusCode::EXPECTATION_FAILED,
                format!("Seed Parse Error: Seed found: {}", seed_found),
            ),
            Self::ParseInputTooLongError => (
                StatusCode::EXPECTATION_FAILED,
                "Parse Input Too Long Error".to_string(),
            ),
            Self::RunwayInvalidError {
                aerodrome,
                runway_index,
            } => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!(
                    "Runway Invalid Error: Num runways: {}, Runway requested {}",
                    aerodrome.runways.len(),
                    runway_index
                ),
            ),
        };
        (status, Json(json!({"error": error_message}))).into_response()
    }
}

impl fmt::Display for CustomError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let string_version = match self {
            Self::InternalServerError => "Internal Server Error",
            Self::BadRequest => "Bad Request",
            Self::UserCallNotFound => "UserCall Not Found",
            Self::ATCCallNotFound => "ATCCall Not Found",
            Self::UserAccountNotFound => "UserAccount Not Found",
            Self::ATCCallGenerationError => "ATC Call Generation Error",
            Self::OtherAircraftCallGenerationError => "Other Aircraft Call Generation Error",
            Self::WrongTarget => "Wrong Target",
        };
        write!(f, "{}", string_version)
    }
}

impl IntoResponse for CustomError {
    fn into_response(self) -> axum::response::Response {
        let (status, error_message) = match self {
            Self::InternalServerError => {
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error")
            }
            Self::BadRequest => (StatusCode::BAD_REQUEST, "Bad Request"),
            Self::UserCallNotFound => (StatusCode::NOT_FOUND, "UserCall Not Found"),
            Self::ATCCallNotFound => (StatusCode::NOT_FOUND, "ATCCall Not Found"),
            Self::UserAccountNotFound => (StatusCode::NOT_FOUND, "UserAccount Not Found"),
            Self::ATCCallGenerationError => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "ATC Call Generation Error",
            ),
            Self::OtherAircraftCallGenerationError => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Other Aircraft Call Generation Error",
            ),
            Self::WrongTarget => (StatusCode::EXPECTATION_FAILED, "Wrong Target"),
        };
        (status, Json(json!({"error": error_message}))).into_response()
    }
}
