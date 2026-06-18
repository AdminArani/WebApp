import axios from "axios";
import React from "react";
import { createRoot } from "react-dom/client";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
let isInstalled = false;
let lastNotificationAt = 0;
let isModalOpen = false;
let currentUserContext = null;
const NOTIFICATION_COOLDOWN_MS = 15000;
function getAllowedErrorReportHosts() {
  const hosts = new Set([window.location.hostname, "app.aranih.com", "aranih-com.creditonline.eu"]);
  const apiUrl = safeString(process.env.REACT_APP_API_URL);
  if (apiUrl) {
    try {
      hosts.add(new URL(apiUrl).hostname);
    } catch (_) {
      // Ignore malformed API URL configuration.
    }
  }
  return hosts;
}
function getRequestUrl(input) {
  if (typeof input === "string") {
    return input;
  }
  if (input && typeof input === "object" && "url" in input) {
    return input.url;
  }
  return "desconocida";
}
function isErrorStatus(statusCode) {
  return typeof statusCode === "number" && statusCode >= 400;
}
function shouldReportRequestError(requestUrl) {
  const normalizedUrl = safeString(requestUrl);
  if (!normalizedUrl || normalizedUrl === "desconocida") {
    return true;
  }
  try {
    const parsedUrl = new URL(normalizedUrl, window.location.origin);
    return getAllowedErrorReportHosts().has(parsedUrl.hostname);
  } catch (_) {
    return true;
  }
}
function safeString(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}
function parseBodyToObject(body) {
  if (!body) {
    return {};
  }
  if (typeof body === "object") {
    if (body instanceof FormData) {
      const out = {};
      body.forEach((v, k) => {
        out[k] = v;
      });
      return out;
    }
    if (body instanceof URLSearchParams) {
      const out = {};
      for (const [k, v] of body.entries()) {
        out[k] = v;
      }
      return out;
    }
    return body;
  }
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (_) {
      // Continue with URL encoded parser below.
    }
    const params = new URLSearchParams(body);
    const out = {};
    for (const [k, v] of params.entries()) {
      out[k] = v;
    }
    return out;
  }
  return {};
}
function deepFindByKeys(obj, keys, visited = new WeakSet()) {
  if (!obj || typeof obj !== "object") {
    return "";
  }
  if (visited.has(obj)) {
    return "";
  }
  visited.add(obj);
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = safeString(obj[key]);
      if (value) {
        return value;
      }
    }
  }
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      const found = deepFindByKeys(value, keys, visited);
      if (found) {
        return found;
      }
    }
  }
  return "";
}
function mergeCurrentUserContext(partial) {
  if (!partial || typeof partial !== "object") {
    return;
  }
  const clean = Object.entries(partial).reduce((acc, [k, v]) => {
    const sv = safeString(v);
    if (sv) {
      acc[k] = sv;
    }
    return acc;
  }, {});
  if (!Object.keys(clean).length) {
    return;
  }
  currentUserContext = {
    ...(currentUserContext || {}),
    ...clean
  };
}
function extractUserContextFromPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const customerId = payload.customer_id || payload.customerId || payload.idCliente || payload.client_id || payload.clientId || deepFindByKeys(payload, ["customer_id", "customerId", "idCliente", "client_id", "clientId"]);
  const email = payload.email || payload.correoElectronico || deepFindByKeys(payload, ["email", "correoElectronico"]);
  const mobPhone = payload.mob_phone || payload.phone || payload.telefono || payload.celular || deepFindByKeys(payload, ["mob_phone", "phone", "telefono", "celular"]);
  const personCode = payload.person_code || payload.identidadCliente || deepFindByKeys(payload, ["person_code", "identidadCliente"]);
  const activeCreditsAmountSum = payload.active_credits_amount_sum || payload.activeCreditsAmountSum || deepFindByKeys(payload, ["active_credits_amount_sum", "activeCreditsAmountSum"]);
  const erroresPerfil = payload.errores_perfil || payload.erroresPerfil || deepFindByKeys(payload, ["errores_perfil", "erroresPerfil"]);
  const status = payload.status || deepFindByKeys(payload, ["status"]);
  return {
    customer_id: customerId,
    realname: payload.realname || payload.nombreCliente || payload.name,
    midname: payload.midname,
    midname2: payload.midname2,
    surname: payload.surname,
    email,
    mob_phone: mobPhone,
    person_code: personCode,
    active_credits_amount_sum: activeCreditsAmountSum,
    errores_perfil: erroresPerfil,
    status
  };
}
function hydrateUserContextFromLocalStorage() {
  try {
    const raw = localStorage.getItem("arani_session_data");
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    const candidates = [parsed, parsed?.data, parsed?.logeado, parsed?.logeado?.data, parsed?.payload, parsed?.payload?.data];
    for (const candidate of candidates) {
      const extracted = extractUserContextFromPayload(candidate);
      mergeCurrentUserContext(extracted);
    }
  } catch (_) {
    // Ignore malformed local storage payload.
  }
}
function hydrateUserContextFromRequestData(requestData) {
  const payload = parseBodyToObject(requestData);
  const extracted = extractUserContextFromPayload(payload);
  mergeCurrentUserContext(extracted);
}
function hydrateUserContextFromResponseData(responseData) {
  if (!responseData) {
    return;
  }
  const candidates = [responseData, responseData?.data, responseData?.payload, responseData?.payload?.data];
  for (const candidate of candidates) {
    const extracted = extractUserContextFromPayload(candidate);
    mergeCurrentUserContext(extracted);
  }
}
function getNormalizedUserContext() {
  if (!currentUserContext || typeof currentUserContext !== "object") {
    return null;
  }
  const customerId = currentUserContext.customer_id || currentUserContext.customerId || currentUserContext.idCliente || currentUserContext.client_id || currentUserContext.clientId;
  const firstName = currentUserContext.realname || currentUserContext.nombre || currentUserContext.name;
  const nameParts = [firstName, currentUserContext.midname, currentUserContext.midname2, currentUserContext.surname].map(safeString).filter(Boolean);
  const activeCreditsAmountSum = safeString(currentUserContext.active_credits_amount_sum || currentUserContext.activeCreditsAmountSum) || "0";
  const erroresPerfil = safeString(currentUserContext.errores_perfil || currentUserContext.erroresPerfil) || "0";
  const status = safeString(currentUserContext.status) || "0";
  return {
    customerId: safeString(customerId),
    fullName: nameParts.join(" "),
    email: safeString(currentUserContext.email || currentUserContext.correoElectronico),
    phone: safeString(currentUserContext.mob_phone || currentUserContext.phone || currentUserContext.telefono || currentUserContext.celular),
    personCode: safeString(currentUserContext.person_code || currentUserContext.identidadCliente),
    activeCreditsAmountSum,
    erroresPerfil,
    status
  };
}
function buildMailToLink(supportEmail, statusCode, requestUrl) {
  const subject = encodeURIComponent(`[WebApp] Error ${statusCode} reportado`);
  const bodyLines = ["Hola equipo,", "", `Estoy reportando un error ${statusCode} en la app.`, "Adjunto captura de pantalla.", "", `Fecha y hora: ${new Date().toISOString()}`, `Ruta actual: ${window.location.href}`, `Endpoint: ${requestUrl}`, `Navegador: ${navigator.userAgent}`];
  const userCtx = getNormalizedUserContext();
  if (userCtx && (userCtx.customerId || userCtx.fullName || userCtx.email || userCtx.phone || userCtx.personCode || userCtx.activeCreditsAmountSum || userCtx.erroresPerfil || userCtx.status)) {
    bodyLines.push("");
    bodyLines.push("--- Datos del Usuario ---");
    if (userCtx.customerId) {
      bodyLines.push(`ID Cliente: ${userCtx.customerId}`);
    }
    if (userCtx.fullName) {
      bodyLines.push(`Nombre: ${userCtx.fullName}`);
    }
    if (userCtx.email) {
      bodyLines.push(`Correo: ${userCtx.email}`);
    }
    if (userCtx.phone) {
      bodyLines.push(`Teléfono: ${userCtx.phone}`);
    }
    if (userCtx.personCode) {
      bodyLines.push(`Identidad: ${userCtx.personCode}`);
    }
    bodyLines.push(`Monto adeudado: ${userCtx.activeCreditsAmountSum || "0"}`);
    const statusRaw = String(userCtx.status || "0");
    const statusText = statusRaw === "1" ? "Confirmado" : statusRaw === "0" ? "No Confirmado" : statusRaw;
    bodyLines.push(`Errores perfil: ${userCtx.erroresPerfil || "0"}`);
    bodyLines.push(`Status: ${statusText}`);
  }
  bodyLines.push("");
  bodyLines.push("Quedo atento(a).");
  const body = encodeURIComponent(bodyLines.join("\n"));
  return `mailto:${supportEmail}?subject=${subject}&body=${body}`;
}
function showSupportModal({
  statusCode,
  requestUrl
}) {
  return new Promise(resolve => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const closeModal = sendEmail => {
      root.unmount();
      container.remove();
      resolve(sendEmail);
    };
    root.render(<Dialog open onClose={() => closeModal(false)} maxWidth="sm" fullWidth aria-labelledby="http-error-dialog-title">
                <DialogTitle id="http-error-dialog-title">
                    Error HTTP {statusCode}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Se detecto un error HTTP {statusCode}. Por favor toma una captura de pantalla para soporte.
                    </DialogContentText>
                    <DialogContentText sx={{
          mt: 2
        }}>
                        Endpoint: {requestUrl}
                    </DialogContentText>
                    <DialogContentText sx={{
          mt: 2
        }}>
                        Si deseas enviarnos el reporte ahora, presiona "Enviar correo".
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => closeModal(false)} color="inherit">
                        Cerrar
                    </Button>
                    <Button onClick={() => closeModal(true)} variant="contained">
                        Enviar correo
                    </Button>
                </DialogActions>
            </Dialog>);
  });
}
async function showErrorFlow({
  supportEmail,
  statusCode,
  requestUrl
}) {
  const now = Date.now();
  hydrateUserContextFromLocalStorage();
  if (!shouldReportRequestError(requestUrl)) {
    return;
  }
  if (isModalOpen || now - lastNotificationAt < NOTIFICATION_COOLDOWN_MS) {
    return;
  }
  lastNotificationAt = now;
  isModalOpen = true;
  try {
    const shouldOpenEmail = await showSupportModal({
      statusCode,
      requestUrl
    });
    if (shouldOpenEmail) {
      window.location.href = buildMailToLink(supportEmail, statusCode, requestUrl);
    }
  } finally {
    isModalOpen = false;
  }
}
export function installHttp405Handler({
  supportEmail
}) {
  if (isInstalled) {
    return;
  }
  isInstalled = true;
  axios.interceptors.response.use(response => {
    hydrateUserContextFromRequestData(response?.config?.data);
    hydrateUserContextFromResponseData(response?.data);
    if (isErrorStatus(response?.status)) {
      void showErrorFlow({
        supportEmail,
        statusCode: response.status,
        requestUrl: response?.config?.url || "desconocida"
      });
    }
    return response;
  }, error => {
    hydrateUserContextFromRequestData(error?.config?.data);
    hydrateUserContextFromResponseData(error?.response?.data);
    if (isErrorStatus(error?.response?.status)) {
      void showErrorFlow({
        supportEmail,
        statusCode: error.response.status,
        requestUrl: error?.config?.url || "desconocida"
      });
    }
    return Promise.reject(error);
  });
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    hydrateUserContextFromRequestData(args?.[1]?.body);
    try {
      const response = await originalFetch(...args);
      try {
        const cloned = response.clone();
        const contentType = cloned.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await cloned.json();
          hydrateUserContextFromResponseData(data);
        }
      } catch (_) {
        // Ignore body parsing errors in background hydration.
      }
      if (isErrorStatus(response?.status)) {
        void showErrorFlow({
          supportEmail,
          statusCode: response.status,
          requestUrl: getRequestUrl(args[0])
        });
      }
      return response;
    } catch (error) {
      void showErrorFlow({
        supportEmail,
        statusCode: "de red",
        requestUrl: getRequestUrl(args[0])
      });
      throw error;
    }
  };
  if (process.env.NODE_ENV !== "production") {
    window.__araniTestHttpErrorModal = (statusCode = 401, requestUrl = "prueba/manual") => {
      void showErrorFlow({
        supportEmail,
        statusCode,
        requestUrl
      });
    };
  }
}
export function registerUserContextForErrors({
  customerId,
  email,
  phone,
  name
}) {
  currentUserContext = {
    ...(currentUserContext || {}),
    customer_id: customerId || currentUserContext?.customer_id || currentUserContext?.customerId || null,
    email: email || currentUserContext?.email || null,
    mob_phone: phone || currentUserContext?.mob_phone || currentUserContext?.phone || null,
    realname: name || currentUserContext?.realname || currentUserContext?.name || null
  };
}
export function clearUserContextForErrors() {
  currentUserContext = null;
}
export function setUserDetailsFromComponent(usuarioDetalle) {
  if (usuarioDetalle && typeof usuarioDetalle === 'object') {
    mergeCurrentUserContext(usuarioDetalle);
  }
}
