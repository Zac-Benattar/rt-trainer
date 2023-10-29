// May need to write server separately - rust?

// All serverside? - look into this
// Initialise list of airports - need to compile json file
// Initialise list of smaller airfields - need to compile json file
// Use random seed to chose one from each list
// Use random seed to generate set of points between takeoff and landing
//   -> Include unexpected event if enabled somewhere after takeoff before landing
//   -> Generate event at each point
//   -> Generate correct rt calls and important information required in responses and the order
//        -> Random optional words
//   -> Get aerial image of each point? - Map API
//   -> 

/* 
RT Transmission format:

a) Handshake - Start with this, easiest

b) Request - Hardest

c) Instruction & Read-back - Medium

d) Handover or Close-down - Also reasonably easy

Method for each? 
    Sub methods for things like callbacks, corrections, etc...
Taking parameters:
    current context, 
Returning:
    new context,
    strings for each atc radio call to be read using TTS,
    list of words and order (if relevant) they are required from user

Compiler design might be useful in designing the system
Base all parts of generation that can deviate on random seed so a seed gives exact same experience every time
*/