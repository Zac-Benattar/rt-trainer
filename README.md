# RT-Trainer
This project comprises a web based training platform for future pilots to learn radio telephony (RT) skills required to pass the CAA RT exam in order to obtain a Flight Radiotelephony Operator's License (FRTOL). More information about the licence and exam can be found on the [CAA's website](https://www.caa.co.uk/general-aviation/pilot-licences/flight-radio-telephony-operator-licence/). It was initially developed as part of [Zac Benattar's](https://github.com/Zac-Benattar) dissertation project.
## The repository
This repository is inspired by a starter pack repository of resources for CS310 and other, similar modules written by Warwick alumni Michael B. Gale (https://github.com/mbg/cs310). It initially comprised of:
- LaTeX templates for the project specification, progress report, and dissertation.
- GitHub Actions workflows for building each report and making them available as build artefacts.
- Generic advice for writing the reports.
## Try RT-Trainer
The system can be tested out at www.rt-trainer.com.
## Installing and Running the System
- Clone the repo into a local folder.
- Install Node.js (https://nodejs.org/en) and npm (should be installed with nodejs), you may need to restart your terminal to use
npm.
- From the `rt-trainer-app` directory run the following commands in a terminal:
	- Install the required dependencies: `npm install`
	- Run the webserver: `npx vite` 
