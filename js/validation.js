/*
  validation.js
  Coding Conf 2026 - registration form (login.html)

  What this file does:
  1. Handles the avatar drop zone (click, drag and drop, preview, remove/change)
  2. Checks each field when the form is submitted and shows errors under the field
  3. If everything is valid, saves the attendee to localStorage and opens ticket.html
*/

// ---------- Settings ----------
const STORAGE_KEY = "codingConfAttendee";
const MAX_FILE_SIZE = 500 * 1024; // 500KB in bytes
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

// Regular expressions for the text fields
// email: something@domain.tld  (no spaces, at least 2 letters after the last dot)
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
// github: must start with @, then 1-39 letters/numbers/single hyphens (GitHub's own rules)
const GITHUB_PATTERN = /^@[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;


// ---------- Grab the elements ----------
const form = document.getElementById("register-form");
const summary = document.getElementById("form-summary");
const submitBtn = document.getElementById("submit-btn");

const nameInput = document.getElementById("full-name");
const emailInput = document.getElementById("email");
const githubInput = document.getElementById("github");
const avatarInput = document.getElementById("avatar");

const dropZone = document.getElementById("drop-zone");
const dropEmpty = document.getElementById("drop-empty");
const dropFilled = document.getElementById("drop-filled");
const avatarPreview = document.getElementById("avatar-preview");
const removeBtn = document.getElementById("remove-avatar");
const changeBtn = document.getElementById("change-avatar");


// ---------- Helpers for showing / clearing errors ----------

// Puts a message under the input and marks it invalid for screen readers
function showError(input, errorId, message) {
  document.getElementById(errorId).textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function clearError(input, errorId) {
  document.getElementById(errorId).textContent = "";
  input.removeAttribute("aria-invalid");
}


// ---------- Field checks ----------
// Each one returns an error message, or "" if the value is fine.

function checkName(value) {
  if (value.trim() === "") {
    return "Please enter your full name.";
  }
  if (value.trim().length < 2) {
    return "Your name looks too short.";
  }
  return "";
}

function checkEmail(value) {
  const email = value.trim();
  if (email === "") {
    return "Please enter your email address.";
  }
  if (!EMAIL_PATTERN.test(email)) {
    return "Please enter a valid email address, like user@domain.com.";
  }
  return "";
}

function checkGithub(value) {
  const handle = value.trim();
  if (handle === "") {
    return "Please enter your GitHub username.";
  }
  if (handle.charAt(0) !== "@") {
    return "Your GitHub username must start with @, e.g. @octocat.";
  }
  if (!GITHUB_PATTERN.test(handle)) {
    return "Only letters, numbers and single hyphens are allowed after the @.";
  }
  return "";
}

function checkAvatar(file) {
  if (!file) {
    return "Please upload a photo for your ticket.";
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Wrong file type. Please upload a JPG or PNG.";
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeKb = Math.round(file.size / 1024);
    return `File too large (${sizeKb}KB). Please upload a photo under 500KB.`;
  }
  return "";
}


// ---------- Avatar drop zone ----------

// Shows the preview if the file is valid, otherwise shows the error
function handleAvatar(file) {
  const message = checkAvatar(file);

  if (message !== "") {
    // keep the bad file in the input so the same message shows again on submit
    showError(avatarInput, "avatar-error", message);
    avatarPreview.src = "";
    dropEmpty.hidden = false;
    dropFilled.hidden = true;
    return;
  }

  clearError(avatarInput, "avatar-error");

  // read the image so it can be previewed
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    avatarPreview.src = reader.result;
    dropEmpty.hidden = true;
    dropFilled.hidden = false;
  });
  reader.readAsDataURL(file);
}

// Empties the file input and goes back to the "drag and drop" view
function resetAvatar() {
  avatarInput.value = "";
  avatarPreview.src = "";
  dropEmpty.hidden = false;
  dropFilled.hidden = true;
  clearError(avatarInput, "avatar-error");
}

avatarInput.addEventListener("change", () => {
  handleAvatar(avatarInput.files[0]);
});

removeBtn.addEventListener("click", () => {
  resetAvatar();
  avatarInput.focus();
});

changeBtn.addEventListener("click", () => {
  avatarInput.click();
});

// Drag and drop - the zone gets a highlight while a file is over it
["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-dragging");
  });
});

dropZone.addEventListener("drop", (event) => {
  const file = event.dataTransfer.files[0];
  if (!file) {
    return;
  }

  // put the dropped file into the real input so the form can read it later
  const transfer = new DataTransfer();
  transfer.items.add(file);
  avatarInput.files = transfer.files;

  handleAvatar(file);
});


// ---------- Clear errors as the user fixes them ----------
// (errors only appear after the first submit, so typing is not interrupted)
const textFields = [
  { input: nameInput, errorId: "name-error", check: checkName },
  { input: emailInput, errorId: "email-error", check: checkEmail },
  { input: githubInput, errorId: "github-error", check: checkGithub }
];

textFields.forEach((field) => {
  field.input.addEventListener("input", () => {
    if (field.input.getAttribute("aria-invalid") === "true" && field.check(field.input.value) === "") {
      clearError(field.input, field.errorId);
    }
  });
});


// ---------- Submit ----------
form.addEventListener("submit", (event) => {
  // stop the page from reloading - we handle everything here
  event.preventDefault();

  const problems = [];

  // check the avatar first, since it is the first field on the form
  const file = avatarInput.files[0];
  const avatarMessage = checkAvatar(file);
  if (avatarMessage !== "") {
    showError(avatarInput, "avatar-error", avatarMessage);
    problems.push({ id: avatarInput.id, message: avatarMessage });
  }

  // then the text fields, in the order they appear
  textFields.forEach((field) => {
    const message = field.check(field.input.value);
    if (message !== "") {
      showError(field.input, field.errorId, message);
      problems.push({ id: field.input.id, message: message });
    } else {
      clearError(field.input, field.errorId);
    }
  });

  if (problems.length > 0) {
    showSummary(problems);
    return;
  }

  summary.hidden = true;
  saveAndContinue(file);
});

// Lists all the errors at the top with links to each field
function showSummary(problems) {
  summary.innerHTML = "";

  const heading = document.createElement("p");
  heading.textContent = problems.length === 1
    ? "There is 1 problem with the form:"
    : `There are ${problems.length} problems with the form:`;

  const list = document.createElement("ul");
  problems.forEach((problem) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${problem.id}`;
    link.textContent = problem.message;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.getElementById(problem.id).focus();
    });
    item.appendChild(link);
    list.appendChild(item);
  });

  summary.appendChild(heading);
  summary.appendChild(list);
  summary.hidden = false;
  summary.focus();
}

// Makes a 5 digit ticket number like #01609
function makeTicketNumber() {
  const number = Math.floor(Math.random() * 100000);
  return "#" + String(number).padStart(5, "0");
}

// Reads the image as text (base64) so it can be stored, then saves everything
function saveAndContinue(file) {
  submitBtn.disabled = true;
  submitBtn.textContent = "Generating ticket...";

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    const attendee = {
      fullName: nameInput.value.trim().replace(/\s+/g, " "),
      email: emailInput.value.trim(),
      github: githubInput.value.trim(),
      avatar: reader.result,
      ticketNumber: makeTicketNumber(),
      registeredAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attendee));
      window.location.href = "ticket.html";
    } catch (error) {
      // storage can fail if it is full or blocked (e.g. some private modes)
      showError(avatarInput, "avatar-error", "Could not save your details on this device. Try a smaller image.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Generate My Ticket";
    }
  });

  reader.addEventListener("error", () => {
    showError(avatarInput, "avatar-error", "Something went wrong reading that image. Please try another one.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Generate My Ticket";
  });

  reader.readAsDataURL(file);
}
