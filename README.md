# CS310 - Third Year Computer Science Project
This project comprises a web based training platform for future pilots to learn radio telephony (RT) skills required to pass the CAA RT exam in order to obtain a Flight Radiotelephony Operator's License (FRTOL). More information about the licence and exam can be found on the CAA's website:
https://www.caa.co.uk/general-aviation/pilot-licences/flight-radio-telephony-operator-licence/
## Abstract
The UK Civil Aviation Authority's Radio Telephony exam involves a student performing a series of radio calls to simulate a full takeoff to landing flight, during which various events which they must respond correctly to may occur. Practice commonly involves learning a large technical document, then organising mock tests with an examiner. Online solo practice systems lack the ability to speak the radio calls into the user's device microphone, leaving space for a new system to include this feature.
## The repository
This repository is inspired by a starter pack repository of resources for CS310 and other, similar modules written by Warwick alumni Michael B. Gale (https://github.com/mbg/cs310). It initially comprised of:
- LaTeX templates for the project specification, progress report, and dissertation.
- GitHub Actions workflows for building each report and making them available as build artefacts.
- Generic advice for writing the reports.
## Installing and Running the System
- Clone the repo into a local folder.
- Install Node.js (https://nodejs.org/en) and npm (should be installed with nodejs), you may need to restart your terminal to use npm.
- Install Rust (https://www.rust-lang.org/) and cargo (should be installed with Rust), again you may need to restart your terminal to use cargo.
- From the `rt-trainer-app` directory run the following commands in a terminal to start the front-end:
	- Install the required dependencies: `npm install`
	- Run the front-end webserver on `localhost:5173/`: `npx vite` 
- From the `rt-webserver` directory run the following commands in a terminal to start the back-end:
	- Install the required dependencies: `cargo install`
	- Compile and run the back-end rt-webserver on `localhost:3000/`: `cargo run`
### Communicating with the RT Webserver
The RT handles the user's radio call messages and returns the next state and ATC's response to the user's call. It also provides a start state for a given set of parameters for the scenario. It is stateless, needing only the state, seed and message to generate its response.
#### Scenario Initiation
The following JSON object containing the parameters of the scenario should be sent to `http://localhost:3000/initiatescenario`:
```
{
	"seed": 1,
	"prefix": "STUDENT",
	"user_callsign": "G-OFLY",
	"radio_frequency": 180.030,
	"transponder_frequency": 7000
}
```
#### Next State/Validate Radio Call
The following JSON object containing the seed, current state, and radio message should be sent to `http://localhost:3000/nextstate`:
```
{
	"state" :{
		"status": {
			"Parked": {
				"position": "A1",
				"stage": "PreRadioCheck" 
			}
		},
		"prefix": "STUDENT",
		"callsign": "G-OFLY",
		"target_allocated_callsign": "G-OFLY",
		"squark": false,
		"current_target": {
			"frequency_type": "AFIS",
			"frequency": 124.03,
			"callsign": "Wellesbourne Information"
		},
		"current_radio_frequency": 180.030,
		"current_transponder_frequency": 7000,
		"lat": 52.1922,
		"long": -1.6144,
		"emergency": "None",
		"aircraft_type": "Cessna"
	},
	"message": "Wellesbourne Information, G-OFLY, radio check 180.030",
	"seed": 1
}
```
### LaTeX documents
The TeX documents in this repository have all been written using Overleaf's online editor (https://www.overleaf.com/) for simplicity, and GitHub Sync (https://www.overleaf.com/learn/how-to/GitHub_Synchronization) has been used to keep the repository up to date. This can interfere with the GitHub actions compliation, as Overleaf is more compliant with errors and warnings. Hence it may be easier to view the TeX documents in Overleaf than try compile locally.
### Continuous Integration
This repository is configured with [GitHub Actions](https://docs.github.com/en/actions) workflows which will builds reports every time changes are pushed. For example, if you change `specification/specification.tex` locally, commit your changes, and push them to GitHub, then the workflow defined in `.github/workflows/specification.yml` will run and build your specification for you. If the build is successful, the resulting PDF will be uploaded as a build artefact and can be downloaded from the summary page of the corresponding job.
### Continuous Deployment
Eventually this repository will be linked to a GitHub Pages page and continuously deployed there in order to have accessible the current release version of the project