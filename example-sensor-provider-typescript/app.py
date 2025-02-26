#
#
#
# THIS WAS GENERATED WITCH CHAT GPT
# TAKE A LOOK AT APP.TS FOR A PROPER EXAMPLE
#
#
#



from flask import Flask, request, jsonify
from functools import wraps

app = Flask(__name__)

# Example Data
EXAMPLE_PROJECT_ID = "abc"
EXAMPLE_REFRESH_TOKEN = "123"
EXAMPLE_ACCESS_TOKEN = "xyz"
EXAMPLE_SENSOR_ID = "00000000-0000-0000-0000-000000000000"

EXAMPLE_SENSOR_STATUS = {
    "id": EXAMPLE_SENSOR_ID,
    "type": "co2_sensor",
    "name": "Sensor &&&& #1",
    "localization": "Localization #1",
    "description": "Lorem ipsum",
    "active": True,
    "wireless": True,
    "batteryLife": 0.6,
    "valueUnit": "°C",
    "minSafeValue": -8,
    "maxSafeValue": 20,
    "lastMeasurementDate": "2025-02-25T08:45:24.804Z",
    "lastMeasurementValue": 5,
    "lastMeasurementRssi": -49,
    "nextMeasurementDate": "2025-02-25T08:45:24.804Z",
}

EXAMPLE_PROJECT_SENSORS = {
    "projectId": EXAMPLE_PROJECT_ID,
    "projectName": "Fake sensor project",
    "data": [EXAMPLE_SENSOR_STATUS],
}

EXAMPLE_SENSOR_MEASUREMENTS = {
    "valueUnit": "°C",
    "minSafeValue": -8,
    "maxSafeValue": 20,
    "data": [
        {"date": "2025-02-25T08:42:24.804Z", "value": -2},
        {"date": "2025-02-25T08:42:24.804Z", "value": 1},
        {"date": "2025-02-25T08:43:24.804Z", "value": 8},
        {"date": "2025-02-25T08:44:24.804Z", "value": 2},
        {"date": "2025-02-25T08:45:24.804Z", "value": 5},
    ],
}

# Authentication Middleware
def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        x_project_id = request.headers.get("X-ProjectId")
        if not x_project_id:
            return jsonify({"message": "Missing 'X-ProjectId' header."}), 401

        authorization = request.headers.get("Authorization")
        if authorization != f"Bearer {EXAMPLE_ACCESS_TOKEN}":
            return jsonify({"message": "Unauthorized."}), 401

        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route("/sensors-auth", methods=["POST"])
def sensors_auth():
    data = request.get_json()
    if not data or "projectId" not in data or "refreshToken" not in data:
        return jsonify({"message": "Missing projectId or refreshToken"}), 400
    
    if data["projectId"] != EXAMPLE_PROJECT_ID or data["refreshToken"] != EXAMPLE_REFRESH_TOKEN:
        return jsonify({"message": "Invalid projectId or refreshToken"}), 400

    return jsonify({"accessToken": EXAMPLE_ACCESS_TOKEN}), 200

@app.route("/sensors", methods=["GET"])
@auth_required
def get_sensors():
    return jsonify(EXAMPLE_PROJECT_SENSORS), 200

@app.route("/sensors/<sensor_id>/status", methods=["GET"])
@auth_required
def get_sensor_status(sensor_id):
    if sensor_id != EXAMPLE_SENSOR_ID:
        return jsonify({"message": "Sensor does not exist in a project."}), 401
    return jsonify(EXAMPLE_SENSOR_STATUS), 200

@app.route("/sensors/<sensor_id>/measurements", methods=["GET"])
@auth_required
def get_sensor_measurements(sensor_id):
    if sensor_id != EXAMPLE_SENSOR_ID:
        return jsonify({"message": "Sensor does not exist in a project."}), 401
    return jsonify(EXAMPLE_SENSOR_MEASUREMENTS), 200

@app.route("/sensors/<sensor_id>/notifications", methods=["GET"])
@auth_required
def get_sensor_notifications(sensor_id):
    return jsonify({"message": "Not implemented."}), 501

if __name__ == "__main__":
    app.run(port=4000, debug=True)
