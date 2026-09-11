/* ==========================================================================
   Twin Cities Animal Rescue - Touchstone 4
   Interactive volunteer interest tracker + contact form validation
   ========================================================================== */

/* ---------- Data ---------- */

// Array of volunteer role objects. Each object stores the role name and a
// short description. This is the data source for the interest tracker
// feature on the Services page.
const volunteerRoles = [
  { name: "Dog Walker", description: "Walk and exercise animals at the shelter" },
  { name: "Event Helper", description: "Support adoption events and fundraisers" },
  { name: "Administrative Support", description: "Help with paperwork and phone calls" },
  { name: "Transport Driver", description: "Drive animals to vet visits or foster homes" }
];

// The key used to save the visitor's selected roles in localStorage.
const STORAGE_KEY = "tcRescueSelectedInterests";

/* ---------- Storage helpers ---------- */

// Reads the saved interest array out of localStorage.
// Returns an empty array if nothing has been saved yet.
function getSelectedInterests() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    return [];
  }
}

// Saves the given array of role names into localStorage as JSON text.
function saveSelectedInterests(interestArray) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(interestArray));
}

/* ---------- Interest tracker (Services page) ---------- */

// Adds a role name to the saved list, if it is not already there.
function addInterest(roleName) {
  const current = getSelectedInterests();
  if (!current.includes(roleName)) {
    current.push(roleName);
    saveSelectedInterests(current);
    renderInterestList();
  }
}

// Removes a role name from the saved list.
function removeInterest(roleName) {
  const current = getSelectedInterests();
  const updated = current.filter(function (name) {
    return name !== roleName;
  });
  saveSelectedInterests(updated);
  renderInterestList();
}

// Clears every saved role.
function clearAllInterests() {
  saveSelectedInterests([]);
  renderInterestList();
}

// Draws the "My Volunteer Interests" list on the Services page, based on
// whatever is currently saved in localStorage.
function renderInterestList() {
  const listEl = document.getElementById("interest-list");
  const emptyMessageEl = document.getElementById("interest-empty-message");

  if (!listEl) {
    return; // this page does not have the interest tracker section
  }

  const selected = getSelectedInterests();
  listEl.innerHTML = "";

  if (selected.length === 0) {
    if (emptyMessageEl) {
      emptyMessageEl.style.display = "block";
    }
    return;
  }

  if (emptyMessageEl) {
    emptyMessageEl.style.display = "none";
  }

  selected.forEach(function (roleName) {
    const li = document.createElement("li");
    li.textContent = roleName + " ";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.className = "remove-interest-btn";
    removeBtn.addEventListener("click", function () {
      removeInterest(roleName);
    });

    li.appendChild(removeBtn);
    listEl.appendChild(li);
  });
}

// Connects every "Add to My Interests" button, and the "Clear" button, to
// their click behavior.
function initInterestButtons() {
  const buttons = document.querySelectorAll(".interest-btn");
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const roleName = button.getAttribute("data-role");
      addInterest(roleName);
    });
  });

  const clearBtn = document.getElementById("clear-interests-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearAllInterests);
  }
}

/* ---------- Interest summary (Contact page) ---------- */

// Shows a short reminder on the Contact page if the visitor already saved
// roles on the Services page, and pre-selects "Volunteering" for them.
function renderInterestSummary() {
  const summaryEl = document.getElementById("interest-summary");
  if (!summaryEl) {
    return; // this page does not have the summary element
  }

  const selected = getSelectedInterests();

  if (selected.length === 0) {
    summaryEl.textContent = "";
    return;
  }

  summaryEl.textContent =
    "Roles you saved on the Services page: " + selected.join(", ") +
    ". We pre-selected \"Volunteering\" below for you.";

  const interestTypeSelect = document.getElementById("interest-type");
  if (interestTypeSelect && interestTypeSelect.value === "") {
    interestTypeSelect.value = "volunteer";
  }
}

/* ---------- Contact form validation ---------- */

// Displays an error message under a field, and highlights the field.
function showError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + "-error");
  const inputEl = document.getElementById(fieldId);
  if (errorEl) {
    errorEl.textContent = message;
  }
  if (inputEl) {
    inputEl.classList.add("input-error");
  }
}

// Clears the error message and highlight for one field.
function clearError(fieldId) {
  const errorEl = document.getElementById(fieldId + "-error");
  const inputEl = document.getElementById(fieldId);
  if (errorEl) {
    errorEl.textContent = "";
  }
  if (inputEl) {
    inputEl.classList.remove("input-error");
  }
}

// Required field check: makes sure the field is not empty.
function validateRequiredField(fieldId, label) {
  const inputEl = document.getElementById(fieldId);
  if (!inputEl || inputEl.value.trim() === "") {
    showError(fieldId, label + " is required.");
    return false;
  }
  clearError(fieldId);
  return true;
}

// Minimum length check for the name field.
function validateNameLength() {
  const nameEl = document.getElementById("full-name");
  if (!nameEl) {
    return true;
  }
  if (nameEl.value.trim().length < 2) {
    showError("full-name", "Please enter at least 2 characters for your name.");
    return false;
  }
  clearError("full-name");
  return true;
}

// Email format check using a simple pattern.
function validateEmailFormat() {
  const emailEl = document.getElementById("email");
  if (!emailEl) {
    return true;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailEl.value.trim())) {
    showError("email", "Please enter a valid email address, like name@example.com.");
    return false;
  }
  clearError("email");
  return true;
}

// Runs every check, stops the form from submitting if anything is invalid,
// and shows a success message when everything passes.
function validateContactForm(event) {
  event.preventDefault();

  const checks = [
    validateRequiredField("full-name", "Full name"),
    validateNameLength(),
    validateRequiredField("email", "Email address"),
    validateEmailFormat(),
    validateRequiredField("interest-type", "Interest type"),
    validateRequiredField("availability", "Availability"),
    validateRequiredField("experience", "Experience with pets")
  ];

  const isValid = checks.every(function (result) {
    return result === true;
  });

  const successEl = document.getElementById("form-success-message");

  if (isValid) {
    if (successEl) {
      successEl.textContent = "Thank you! Your request has been received. We will reach out soon.";
    }
    event.target.reset();
    clearAllInterests();
    renderInterestSummary();
  } else if (successEl) {
    successEl.textContent = "";
  }
}

// Connects the form's submit event, and clears field errors as the visitor
// starts fixing them.
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) {
    return; // this page does not have the contact form
  }
  form.addEventListener("submit", validateContactForm);

  const fieldsToWatch = ["full-name", "email", "interest-type", "availability", "experience"];
  fieldsToWatch.forEach(function (fieldId) {
    const el = document.getElementById(fieldId);
    if (el) {
      el.addEventListener("input", function () {
        clearError(fieldId);
      });
      el.addEventListener("change", function () {
        clearError(fieldId);
      });
    }
  });
}

/* ---------- Initialize on every page load ---------- */

document.addEventListener("DOMContentLoaded", function () {
  renderInterestList();      // runs only on services.html
  initInterestButtons();     // runs only on services.html
  renderInterestSummary();   // runs only on contact.html
  initContactForm();         // runs only on contact.html
});
