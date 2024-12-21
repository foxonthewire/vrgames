// calendar-worker.js

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNotification(event.data.event);
  }
});

function scheduleNotification(event) {
  const eventTime = new Date(`${event.date}T${event.time}`).getTime();
  const now = Date.now();

  if (eventTime > now) {
    const delay = eventTime - now;

    setTimeout(() => {
      self.registration.showNotification('Event Reminder', {
        body: `${event.title} is happening now!`,
      });
    }, delay);

    console.log(`Notification scheduled for ${event.title} in ${delay / 1000} seconds.`);
  } else {
    console.warn('Event time is in the past. No notification scheduled.');
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Preload holiday events
const holidayEvents = [
  { title: "New Year's Day", date: "2024-01-01", time: "00:00" },
  { title: "Valentine's Day", date: "2024-02-14", time: "00:00" },
  { title: "Easter Sunday", date: "2024-03-31", time: "00:00" },
  { title: "Labor Day", date: "2024-05-01", time: "00:00" },
  { title: "Halloween", date: "2024-10-31", time: "00:00" },
  { title: "Christmas Day", date: "2024-12-25", time: "00:00" },
  // Add more holidays as needed
];

self.addEventListener('activate', (event) => {
  const events = JSON.parse(localStorage.getItem('events')) || [];
  holidayEvents.forEach((holiday) => {
    if (!events.find((e) => e.title === holiday.title && e.date === holiday.date)) {
      events.push(holiday);
    }
  });
  localStorage.setItem('events', JSON.stringify(events));
  console.log('Holidays added to local events.');
});
