const API_BASE_URL = "";
const LOGIN_ENDPOINTS = ["/api/auth/login", "/auth/login", "/api/login", "/api/v1/auth/login"];

function findLoginForm() {
  const passwordInput = document.querySelector('input[type="password"]');
  if (!passwordInput) {
    return null;
  }

  return passwordInput.closest("form") || document.querySelector("form");
}

function findEmailInput(form) {
  return (
    form?.querySelector('input[type="email"]') ||
    form?.querySelector('input[name="email"]') ||
    form?.querySelector('input[name="username"]') ||
    form?.querySelector('input[type="text"]')
  );
}

function findPasswordInput(form) {
  return form?.querySelector('input[type="password"]');
}

async function postLogin(endpoint, payload) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${endpoint} -> HTTP ${response.status}: ${data.message || "Dang nhap khong thanh cong."}`);
  }

  return data;
}

async function login(payload) {
  let lastError;

  for (const endpoint of LOGIN_ENDPOINTS) {
    try {
      return await postLogin(endpoint, payload);
    } catch (error) {
      lastError = error;
      if (!String(error.message).includes("HTTP 404")) {
        break;
      }
    }
  }

  throw lastError || new Error("Khong ket noi duoc API dang nhap.");
}

function setButtonLoading(button, isLoading) {
  if (!button) {
    return;
  }

  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = "Dang nhap...";
    button.disabled = true;
    return;
  }

  button.textContent = button.dataset.originalText || button.textContent;
  button.disabled = false;
}

function showLoginError(message) {
  let errorElement = document.querySelector("[data-login-error]");

  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.dataset.loginError = "true";
    errorElement.className = "alert alert-danger mt-3";
    findLoginForm()?.prepend(errorElement);
  }

  errorElement.textContent = message;
}

async function handleLoginSubmit(event) {
  const form = findLoginForm();
  if (!form) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const emailInput = findEmailInput(form);
  const passwordInput = findPasswordInput(form);
  const submitButton = form.querySelector('button[type="submit"], input[type="submit"], button');
  const email = emailInput?.value?.trim();
  const password = passwordInput?.value;

  if (!email || !password) {
    showLoginError("Vui long nhap email va mat khau.");
    return;
  }

  try {
    setButtonLoading(submitButton, true);
    const data = await login({ email, password });

    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authUser", JSON.stringify(data.user));
    window.location.href = "inventory.html";
  } catch (error) {
    showLoginError(error.message);
  } finally {
    setButtonLoading(submitButton, false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = findLoginForm();

  if (form) {
    form.addEventListener("submit", handleLoginSubmit, true);
  }
});
