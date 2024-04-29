# RT-Trainer
This project comprises a web based training platform for future pilots to learn radio telephony (RT) skills required to pass the CAA RT exam in order to obtain a Flight Radiotelephony Operator's Licence (FRTOL). More information about the licence and exam can be found on the [CAA's website](https://www.caa.co.uk/general-aviation/pilot-licences/flight-radio-telephony-operator-licence/). It was developed as part of [Zac Benattar's](https://github.com/Zac-Benattar) dissertation project.
## Try RT-Trainer
The system can be tested out at [rt-trainer.com](https://www.rt-trainer.com).
## Installing and Running the System locally
- Clone the repo into a local folder.
- Install Node.js (https://nodejs.org/en) and npm (should be installed with nodejs), you may need to restart your terminal to use npm.
- From the `rt-trainer` directory run the following commands in a terminal:
	- Install the required dependencies: `npm install`
	- Run the webserver: `npx vite`
- A `.env` file is required with the line "OPENAIPKEY=<an OpenAIP client key>". Such a key can be requested on the profile page of [OpenAIP](https://www.openaip.net/users/clients#tab-clients) (an account is required). The author's key is present in the submitted zip file accompanying the final report, and will be revoked after the marking period.