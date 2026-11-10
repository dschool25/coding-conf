/*
  ticket.js
  Coding Conf 2026 - ticket page (ticket.html)

  What this file does:
  1. Guard: if there is no saved attendee, send the visitor back to index.html
  2. Fills the banner and the glass ticket with the saved details
  3. Extra buttons: print, copy ticket number, register someone else
  4. Small 3D tilt on the ticket when the mouse moves over it
*/

const STORAGE_KEY = "codingConfAttendee";

// ---------- 1. Guard ----------
// Read the saved data. Returns null if it is missing or broken.
function getAttendee() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return null;
  }

  try {
    const data = JSON.parse(saved);
    // make sure the important parts are actually there
    if (data.fullName && data.email && data.github && data.avatar && data.ticketNumber) {
      return data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

const attendee = getAttendee();

if (attendee === null) {
  // replace() so the back button does not bring them to this page again
  window.location.replace("index.html");
} else {
  document.addEventListener("DOMContentLoaded", () => {
    fillTicket(attendee);
    setUpButtons(attendee);
    setUpTilt();
  });
}


// ---------- 2. Fill the page ----------
function fillTicket(data) {
  // textContent (not innerHTML) so user input can never be run as HTML
  document.getElementById("banner-name").textContent = data.fullName;
  document.getElementById("banner-email").textContent = data.email;

  document.getElementById("ticket-name").textContent = data.fullName;
  document.getElementById("ticket-serial").textContent = data.ticketNumber;

  const avatar = document.getElementById("ticket-avatar");
  avatar.src = data.avatar;
  avatar.alt = `Profile photo of ${data.fullName}`;

  // the link should go to github.com/username (without the @)
  const username = data.github.slice(1);
  const githubLink = document.getElementById("ticket-github");
  githubLink.href = `https://github.com/${encodeURIComponent(username)}`;
  document.getElementById("ticket-github-text").textContent = data.github;

  document.title = `${data.fullName}'s Ticket | Coding Conf 2026`;
}


// ---------- 3. Buttons ----------
function setUpButtons(data) {
  const status = document.getElementById("copy-status");

  document.getElementById("print-btn").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("copy-btn").addEventListener("click", () => {
    // clipboard only works on https or localhost, so fall back to a message
    if (navigator.clipboard) {
      navigator.clipboard.writeText(data.ticketNumber)
        .then(() => {
          status.textContent = `Copied ${data.ticketNumber} to your clipboard.`;
        })
        .catch(() => {
          status.textContent = `Your ticket number is ${data.ticketNumber}.`;
        });
    } else {
      status.textContent = `Your ticket number is ${data.ticketNumber}.`;
    }
  });

  document.getElementById("new-btn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "login.html";
  });
}


// ---------- 4. Tilt effect ----------
function setUpTilt() {
  const ticket = document.getElementById("ticket");

  // skip the effect for people who prefer less motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  ticket.addEventListener("mousemove", (event) => {
    const box = ticket.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;   // 0 to 1
    const y = (event.clientY - box.top) / box.height;   // 0 to 1

    const rotateY = (x - 0.5) * 12;
    const rotateX = (0.5 - y) * 12;

    ticket.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    ticket.style.setProperty("--mx", `${x * 100}%`);
    ticket.style.setProperty("--my", `${y * 100}%`);
  });

  ticket.addEventListener("mouseleave", () => {
    ticket.style.transform = "";
  });
}
