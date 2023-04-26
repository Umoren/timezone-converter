import { useState, useEffect } from 'react';
import timezones from './timezone-list';
import moment from 'moment-timezone';

function App() {
  const [meetingTime, setMeetingTime] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState(timezones[0]);
  const [utcTime, setUtcTime] = useState("");

  const handleMeetingTimeChange = (e) => {
    setMeetingTime(e.target.value);
  };

  const handleTimezoneChange = (e) => {
    setSelectedTimezone(timezones.find((tz) => tz.abbr === e.target.value));
  };

  useEffect(() => {
    if (meetingTime === "") {
      setUtcTime("");
      return;
    }

    // Combine the current date and the input time
    const currentDate = new Date();
    const inputDateTime = moment.tz(
      `${currentDate.toISOString().split("T")[0]} ${meetingTime}`,
      "YYYY-MM-DD hh:mm A",
      selectedTimezone.iana
    );

    // Check if the input is valid
    if (!inputDateTime.isValid()) {
      setUtcTime("Invalid time value");
      return;
    }

    // Convert the local time to UTC
    const utcDateTime = inputDateTime.utc();

    // Convert the UTC time to the desired timezone
    const zonedTime = utcDateTime.clone().tz('Etc/UTC');

    // Format the zoned time to display as a string
    const formattedUtcTime = zonedTime.format("hh:mm A");

    // Set the UTC time in state
    setUtcTime(formattedUtcTime);
  }, [meetingTime, selectedTimezone]);



  return (
    <div className="App min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full sm:w-2/3 md:w-1/2">
        <h1 className="text-2xl font-bold mb-6">Desert Island Timezone Converter</h1>
        <div className="mb-6">
          <label htmlFor="meetingTime" className="block mb-2">
            Your current time (24hr format):
          </label>
          <input
            type="text"
            id="meetingTime"
            value={meetingTime}
            onChange={handleMeetingTimeChange}
            className="border border-gray-300 rounded w-full p-2"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="timezone" className="block mb-2">
            Select your timezone:
          </label>
          <select
            id="timezone"
            value={selectedTimezone.abbr}
            onChange={handleTimezoneChange}
            className="border border-gray-300 rounded w-full p-2"
          >
            {timezones.map((timezone, index) => (
              <option key={index} value={timezone.abbr}>
                {timezone.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <button
            className="bg-blue-500 text-white p-2 rounded w-full"
            disabled={!meetingTime}
          >
            Convert Time
          </button>
        </div>
        <div>
          <p>
            Desert Island Time:{" "}
            <strong className="text-blue-500">{utcTime}</strong>
          </p>
          <small> We don't consider daylight saving time yet!</small>
        </div>
      </div>
    </div>
  );
}
export default App;