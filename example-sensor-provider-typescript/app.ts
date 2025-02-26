import express, { Request, Response, NextFunction } from "express";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type ProjectId = string;

type SensorId = string;
enum SensorType {
  TemperatureSensor = "temperature_sensor",
  HumiditySensor = "humidity_sensor",
  DewPointSensor = "dew_point_sensor",
  Co2Sensor = "co2_sensor",
  NoxSensor = "nox_sensor",
  VocSensor = "voc_sensor",
  ParticleSensor = "particle_sensor",
  BarometricPressureSensor = "barometric_pressure_sensor",
  LightSensor = "light_sensor",
  Other = "other",
}

interface ProjectSensorsDto {
  projectId: ProjectId;
  projectName?: string;
  data: {
    id: SensorId;
    type: SensorType;
    name?: string;
    localization?: string;
    description?: string;
  }[];
}

interface SensorStatusDto {
  id: SensorId;
  type: SensorType;
  name?: string;
  localization?: string;
  description?: string;
  active: boolean;
  batteryLife?: number;
  wireless?: boolean;
  valueUnit: string | null;
  minSafeValue?: number;
  maxSafeValue?: number;
  lastMeasurementDate: string | null;
  lastMeasurementValue: number | null;
  lastMeasurementRssi?: number;
  nextMeasurementDate?: string;
}

interface SensorMeasurementsDto {
  valueUnit: string | null;
  minSafeValue?: number;
  maxSafeValue?: number;
  data: {
    date: string;
    value: number | null;
  }[];
}

/* -------------------------------------------------------------------------- */
/*                                EXAMPLE DATA                                */
/* -------------------------------------------------------------------------- */

const EXAMPLE_PROJECT_ID: ProjectId = "abc";
const EXAMPLE_REFRESH_TOKEN = "123";
const EXAMPLE_ACCESS_TOKEN = "xyz";
const EXAMPLE_SENSOR_ID: SensorId = "00000000-0000-0000-0000-000000000000";

const EXAMPLE_SENSOR_STATUS: SensorStatusDto = {
  id: EXAMPLE_SENSOR_ID,
  type: SensorType.Co2Sensor,
  name: `Sensor #1`,
  localization: `Localization #1`,
  description: `Lorem ipsum`,
  active: true,
  wireless: true,
  batteryLife: 0.6,
  valueUnit: "°C",
  minSafeValue: -8,
  maxSafeValue: 20,
  lastMeasurementDate: "2025-02-25T08:45:24.804Z",
  lastMeasurementValue: 5,
  lastMeasurementRssi: -49,
  nextMeasurementDate: "2025-02-25T08:45:24.804Z",
};

const EXAMPLE_PROJECT_SENSORS: ProjectSensorsDto = {
  projectId: EXAMPLE_PROJECT_ID,
  projectName: `Fake sensor project`,
  data: [EXAMPLE_SENSOR_STATUS],
};

const EXAMPLE_SENSOR_MEASUREMENTS: SensorMeasurementsDto = {
  valueUnit: "°C",
  minSafeValue: -8,
  maxSafeValue: 20,
  data: [
    { date: "2025-02-25T08:42:24.804Z", value: -2 },
    { date: "2025-02-25T08:42:24.804Z", value: 1 },
    { date: "2025-02-25T08:43:24.804Z", value: 8 },
    { date: "2025-02-25T08:44:24.804Z", value: 2 },
    { date: "2025-02-25T08:45:24.804Z", value: 5 },
  ],
};

/* -------------------------------------------------------------------------- */
/*                                    LOGIC                                   */
/* -------------------------------------------------------------------------- */

const app = express();
app.use(express.json());

app.post("/sensors-auth", async (req, res) => {
  const body: unknown = req.body;
  if (
    !body ||
    typeof body !== "object" ||
    !("projectId" in body) ||
    !("refreshToken" in body) ||
    typeof body.projectId !== "string" ||
    typeof body.refreshToken !== "string"
  ) {
    res.status(400).json({ message: "Missing projectId or refreshToken" });
    return;
  }

  const { projectId, refreshToken } = body;

  /*
    To keep this example simple, we simply compare received values against hardcoded values.
    You should compare it against your database state.
  */
  if (
    projectId !== EXAMPLE_PROJECT_ID ||
    refreshToken !== EXAMPLE_REFRESH_TOKEN
  ) {
    res.status(400).json({ message: "Invalid projectId or refreshToken" });
    return;
  }

  /*
    To keep this example simple, we generate an access token as a hardcoded value.
    You should use a secure encryption approach of your choice (for example a JWT).
  */
  const accessToken = EXAMPLE_ACCESS_TOKEN;

  res.status(200).json({ accessToken });
});

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  /*
    You may use this header when you decrypt the access token to improve security or performance.
  */
  const xProjectIdHeader = req.headers["x-projectid"];
  if (!xProjectIdHeader) {
    res.status(401).json({ message: 'Missing "X-ProjectId" header.' });
    return;
  }

  /*
    To keep this example simple, we compare access token against a hardcoded value.
    You should decrypt a received access token and verify that it was signed by you.
  */
  const authorizationHeader = req.headers["authorization"];
  if (authorizationHeader !== `Bearer ${EXAMPLE_ACCESS_TOKEN}`) {
    res.status(401).json({ message: "Unauthorized." });
    return;
  }

  next();
};

app.get("/sensors", authMiddleware, async (req, res) => {
  /*
    To keep this example simple, we simply return hardcoded sensors project data.
    You should get this data from your database.
  */
  res.status(200).json(EXAMPLE_PROJECT_SENSORS);
});

app.get("/sensors/:sensorId/status", authMiddleware, async (req, res) => {
  /*
    To keep this example simple, we simply compare sensorId against hardcoded sensor id.
    You should verify that a given sensor belongs to a given project.
  */
  const sensorId = req.params["sensorId"];
  if (sensorId !== EXAMPLE_SENSOR_ID) {
    res.status(401).json({ message: "Sensor does not exist in a project." });
  }

  /*
    To keep this example simple, we simply return hardcoded sensor status.
    You should get this data from your database.
  */
  res.status(200).json(EXAMPLE_SENSOR_STATUS);
});

app.get("/sensors/:sensorId/measurements", authMiddleware, async (req, res) => {
  /*
    To keep this example simple, we simply compare sensorId against hardcoded sensor id.
    You should verify that a given sensor belongs to a given project.
  */
  const sensorId = req.params["sensorId"];
  if (sensorId !== EXAMPLE_SENSOR_ID) {
    res.status(401).json({ message: "Sensor does not exist in a project." });
  }

  /*
    To keep this example simple, we return all available data.
    You should use these two ISO dates, to narrow down the results.
    If you decide that we're asking for to much data, you may return a status code 403.
  */
  const from = req.query["from"];
  const to = req.query["to"];

  /*
    To keep this example simple, we simply return hardcoded sensor measurements.
    You should get this data from your database.
  */
  res.status(200).json(EXAMPLE_SENSOR_MEASUREMENTS);
});

app.get(
  "/sensors/:sensorId/notifications",
  authMiddleware,
  async (req, res) => {
    /*
      To keep this example simple, we assume that notifications are not supported.
    */
    res.status(501).json({ message: "Not implemented." });
  }
);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
