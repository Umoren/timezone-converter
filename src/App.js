import { useState, useEffect } from 'react';
import timezones from './timezone-list';
import moment from 'moment-timezone';
import Select from 'react-select';


function App() {
  const [meetingTime, setMeetingTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [selectedTimezone, setSelectedTimezone] = useState(timezones[0]);
  const [utcTime, setUtcTime] = useState("");

  const handleMeetingTimeChange = (e) => {
    setMeetingTime(e.target.value);
  };

  const formattedTimezones = timezones.map((timezone) => ({
    value: timezone.abbr,
    label: timezone.iana + " " + timezone.name,
  }));


  const showMeetingNotification = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const notification = new Notification("Meeting Time!", {
          body: "It's 7:30 AM (UTC) - Time for your meeting!",
          icon: "/desertisland.jpeg",
        });

        console.log('permission is granted')

        notification.onclick = () => {
          console.log('notification is showing')
          window.focus();
        };
      }
    } catch (error) {
      console.error("Error showing notification:", error);
    }
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
    const zonedTime = utcDateTime.clone().tz("Etc/UTC");

    // Format the zoned time to display as a string
    const formattedUtcTime = zonedTime.format("hh:mm A");

    // Set the UTC time in state
    setUtcTime(formattedUtcTime);

    // Check if the zoned time is 7:30 AM (UTC) and show a notification
    if (formattedUtcTime === "07:30 AM") {
      console.log('it is time')
      showMeetingNotification();
    }
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
            placeholder='07:30'
            value={meetingTime}
            onChange={handleMeetingTimeChange}
            className="border border-gray-300 rounded w-full p-2"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="timezone" className="block mb-2">
            Select your timezone:
          </label>
          <Select
            id="timezone"
            value={{ value: selectedTimezone.abbr, label: selectedTimezone.iana + " " + selectedTimezone.name }}
            onChange={(option) => setSelectedTimezone(timezones.find((tz) => tz.abbr === option.value))}
            options={formattedTimezones}
            className="border border-gray-300 rounded w-full p-2"
          />

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
          <small> We don't consider daylight saving time for now!</small>
        </div>
      </div>
    </div>
  );
}
export default App;