import { useState, useEffect } from "react";
import timezones from "./timezone-list";
import moment from "moment-timezone";
import Select from "react-select";
import Modal from "./components/Modal";

function App() {
  const getUserTimezone = () => {
    const userTimezoneIana = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userTimezone = timezones.find((tz) => tz.iana === userTimezoneIana);
    return userTimezone || timezones[0];
  };

  const [meetingTime, setMeetingTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [selectedTimezone, setSelectedTimezone] = useState(getUserTimezone());
  const [utcTime, setUtcTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countdown, setCountdown] = useState("");

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

  const meetingSchedule = [
    {
      label: "Sunrise/Sundown Meeting",
      utcTime: "07:30",
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    { label: "Speaker Meeting", utcTime: "20:00", days: [1] },
    { label: "Topic Meeting", utcTime: "20:00", days: [4] },
    {
      label: "Thank the fellowship it's Friday Meeting",
      utcTime: "23:00",
      days: [5],
    },
    { label: "Newcomer Meeting", utcTime: "20:00", days: [0] },
  ];

  const getNextMeeting = () => {
    const now = moment();
    const upcomingMeetings = meetingSchedule.flatMap((meeting) => {
      return meeting.days.map((day) => {
        const meetingDate = now.clone().day(day).format("YYYY-MM-DD");
        const meetingTime = moment.tz(
          `${meetingDate} ${meeting.utcTime}`,
          "YYYY-MM-DD hh:mm",
          "Europe/London"
        );

        // If the meeting is in the past, add 1 week
        if (now.isAfter(meetingTime)) {
          meetingTime.add(1, "weeks");
        }

        return { ...meeting, time: meetingTime };
      });
    });

    return upcomingMeetings.sort((a, b) => a.time - b.time)[0];
  };

  const updateCountdown = () => {
    const nextMeeting = getNextMeeting();
    const now = moment();
    const duration = moment.duration(nextMeeting.time.diff(now));

    setCountdown({
      label: nextMeeting.label,
      time: `${
        duration.days() > 0 ? `${duration.days()}d ` : ""
      }${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`,
    });
  };

  useEffect(() => {
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

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
      console.log("formatted time triggered");
    }
  }, [meetingTime, selectedTimezone]);

  return (
    <div className="App min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full sm:w-2/3 md:w-1/2">
        <h1 className="text-2xl font-bold mb-6">
          Desert Island Timezone Converter
        </h1>
        <div className="mb-6">
          <label htmlFor="meetingTime" className="block mb-2">
            Your current time (24hr format):
          </label>
          <input
            type="text"
            id="meetingTime"
            placeholder="07:30"
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
            value={{
              value: selectedTimezone.abbr,
              label: selectedTimezone.iana + " " + selectedTimezone.name,
            }}
            onChange={(option) =>
              setSelectedTimezone(
                timezones.find((tz) => tz.abbr === option.value)
              )
            }
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

      <div className="bg-white shadow-md rounded-lg p-8 w-full sm:w-2/3 md:w-1/2 my-8">
        <p className="mb-2 text-sm font-mono font-semibold">
          The next Desert Island Meeting is the {countdown.label} and it starts
          in:
        </p>

        <p className="text-center text-2xl">
          <strong className="text-blue-500 ">{countdown.time}</strong>
        </p>

        <div>
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <p>
            This application automatically detects your timezone and shows the
            time remaining for the next meeting based on your local time. The
            meeting schedule is as follows:
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Sunrise or Sundown meeting: Every day at 7:30 AM (BST)</li>
            <li>Speaker Meeting: Mondays at 8:00 PM (BST)</li>
            <li>Topic Meeting: Thursdays at 8:00 PM (BST)</li>
            <li>
              Thank the fellowship it is Friday Meeting: Fridays at 11:00 PM
              (BST)
            </li>
            <li>Newcomer Meeting: Sundays at 8:00 PM (BST)</li>
          </ul>
          <p className="mt-4">
            The countdown timer will display the time remaining for the next
            meeting based on the schedule above. You can also input your current
            time and select your timezone to see the Desert Island Time for that
            specific moment.
          </p>
        </div>
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
