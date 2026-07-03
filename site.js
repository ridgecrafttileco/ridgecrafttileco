const QUOTE_FORM_ENDPOINT = "https://usebasin.com/f/8c0018ad43c9";
const RIDGECRAFT_PHONE_DISPLAY = "(801) 687-9723";

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      if (menu && menu.classList.contains("is-open")) {
        menu.classList.remove("is-open");
        toggle?.setAttribute("aria-expanded", "false");
      }
    });
  });

  const form = document.querySelector("#quote-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = form.querySelector("#form-status");
    clearErrors(form);

    if (form.company_website?.value) {
      setStatus(status, "Thanks. Your request was received.", "success");
      form.reset();
      return;
    }

    const valid = validateForm(form);
    if (!valid) {
      setStatus(status, "Please fix the highlighted fields.", "error");
      return;
    }

    if (!QUOTE_FORM_ENDPOINT) {
      setStatus(
        status,
        `The quote form is ready, but the receiving endpoint has not been approved yet. Please call or text ${RIDGECRAFT_PHONE_DISPLAY}.`,
        "error"
      );
      return;
    }

    try {
      const response = await fetch(QUOTE_FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("Form endpoint returned an error.");
      setStatus(status, "Thanks. Your quote request was sent. Chris will follow up shortly.", "success");
      form.reset();
    } catch (error) {
      setStatus(status, `Something went wrong. Please call or text ${RIDGECRAFT_PHONE_DISPLAY}.`, "error");
    }
  });
});

function validateForm(form) {
  let isValid = true;
  const requiredFields = ["name", "phone", "email", "city", "service", "details"];

  requiredFields.forEach((name) => {
    const field = form.elements[name];
    if (!field || !String(field.value).trim()) {
      showError(field, "Required");
      isValid = false;
    }
  });

  const email = form.elements.email;
  if (email?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    showError(email, "Use a valid email");
    isValid = false;
  }

  const phone = form.elements.phone;
  if (phone?.value && phone.value.replace(/\D/g, "").length < 10) {
    showError(phone, "Use a valid phone number");
    isValid = false;
  }

  if (!form.querySelector('input[name="preferred_contact"]:checked')) {
    const fieldset = form.querySelector(".contact-method");
    showError(fieldset, "Choose one");
    isValid = false;
  }

  return isValid;
}

function clearErrors(form) {
  form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
  form.querySelectorAll(".field-error").forEach((error) => error.remove());
}

function showError(field, message) {
  if (!field) return;
  field.setAttribute("aria-invalid", "true");
  const error = document.createElement("span");
  error.className = "field-error";
  error.textContent = message;
  field.insertAdjacentElement("afterend", error);
}

function setStatus(status, message, type) {
  if (!status) return;
  status.textContent = message;
  status.className = `form-status ${type}`;
}
