import { useState, useEffect } from 'react';
import timezones from './timezone-list';
import moment from 'moment-timezone';
import Select from 'react-select';
import Modal from './components/Modal';


function App() {
  const [meetingTime, setMeetingTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [selectedTimezone, setSelectedTimezone] = useState(timezones[0]);
  const [utcTime, setUtcTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countdown, setCountdown] = useState("");

  console.log("Something is here")

  const handleMeetingTimeChange = (e) => {
    setMeetingTime(e.target.value);
  };

  const formattedTimezones = timezones.map((timezone) => ({
    value: timezone.abbr,
    label: timezone.iana + " " + timezone.name,
  }));


  const showMeetingNotification = async () => {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const notification = new Notification("Meeting Time!", {
          body: "It's 7:30 AM (UTC) - Time for your meeting!",
          icon: "/desertisland.jpeg",
        });

        notification.onclick = () => {
          window.focus();
        };
      }
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  };

  // Calculate the time difference between the current time and the meeting time
  const calculateCountdown = () => {
    const now = moment();
    const meetingTimeUK = moment.tz(
      `${now.format("YYYY-MM-DD")} ${"07:30"}`,
      "YYYY-MM-DD hh:mm A",
      "Europe/London"
    );

    if (now.isAfter(meetingTimeUK)) {
      meetingTimeUK.add(1, "days");
    }

    const duration = moment.duration(meetingTimeUK.diff(now));
    setCountdown(
      `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`
    );
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
    const zonedTime = utcDateTime.clone().tz("Europe/London");

    // Format the zoned time to display as a string
    const formattedUtcTime = zonedTime.format("hh:mm A z");

    // Set the UTC time in state
    setUtcTime(formattedUtcTime);

    console.log("formattedUtcTime:", formattedUtcTime);
    // Check if the zoned time is 7:30 AM (BST) and show a notification
    if (formattedUtcTime === "07:30 AM BST") {
      setIsModalOpen(true);
      showMeetingNotification();
      console.log("formatted time triggered")
    }
  }, [meetingTime, selectedTimezone]);

  useEffect(() => {
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="App min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full sm:w-2/3 md:w-1/2">
        <h1 className="text-2xl font-bold mb-6">Desert Island Timezone Converter</h1>
        <div className="mb-6">
          <label htmlFor="meetingTime" className="block mb-2">
            Your current time (24hr format):
          </label>
          <input
            type="time-local"
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

        <div>
          <p>
            Desert Island Time:{" "}
            <strong className="text-blue-500">{utcTime}</strong>
          </p>
          <small>Now considering daylight saving time!</small>
        </div>
      </div>

      <div className='bg-white shadow-md rounded-lg p-8 w-full sm:w-2/3 md:w-1/2 my-8'>

        <p className='mb-2 text-sm font-mono font-semibold'>
          The next Sunrise/Sundown Meeting is in (based on your current time):{" "}
        </p>

        <p className='text-center text-2xl'><strong className="text-blue-500 ">{countdown}</strong></p>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        meetingLink="https://us06web.zoom.us/j/92642189858?pwd=TUpkVElab1JTVTMzV1FGelRXYU9VZz09"
      />
    </div>

  );
}
export default App;