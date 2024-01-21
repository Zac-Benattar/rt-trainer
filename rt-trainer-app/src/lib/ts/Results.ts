import { AirborneStage, LandingStage, StartAerodromeStage} from '$lib/ts/RouteStages';
import type RadioCall from './RadioCall';

export default class Results {
    private radioCalls: RadioCall[];

    constructor(radioCalls: RadioCall[]) {
        this.radioCalls = radioCalls;
    }

    public getRadioCalls(): RadioCall[] {
        return this.radioCalls;
    }

    public getStartUpAndTaxiCalls(): RadioCall[] {
        return this.radioCalls.filter((radioCall) => Object.values(StartAerodromeStage).includes(radioCall.getRoutePoint().stage));
    }

    public getAirborneCalls(): RadioCall[] {
        return this.radioCalls.filter((radioCall) => Object.values(AirborneStage).includes(radioCall.getRoutePoint().stage));
    }

    public getLandingCalls(): RadioCall[] {
        return this.radioCalls.filter((radioCall) => Object.values(LandingStage).includes(radioCall.getRoutePoint().stage));
    }
}