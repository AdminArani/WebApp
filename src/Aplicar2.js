import Box from "@mui/material/Box";
import { AppContext } from "./App";
import { useContext, useEffect, useRef, useState } from "react";
import Container from "@mui/material/Container";
import { alpha, useTheme } from "@mui/material/styles";
import config from "./config";
import axios from "axios";
import parse from "html-react-parser";
import {
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Paper,
    Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import BarraFinal from "./componentes/BarraFinal";
import BarraApp from "./componentes/BarraApp";
import FormCambiarBanco from "./componentes/cambiarBanco.js";

function Aplicar2() {
    const gContext = useContext(AppContext);
    const theme = useTheme();
    const navigate = useNavigate();
    const [mesesSeleccionados, setMesesSeleccionados] = useState(null);
    const [openCambiarCuenta, setOpenCambiarCuenta] = useState(false);
    const [verCondiciones, setVerCondiciones] = useState(false);
    const [usuarioDetalle, set_usuarioDetalle] = useState({});
    const [apiCamposConstructor, set_apiCamposConstructor] = useState(null);
    const [offerDr, set_offerDr] = useState(null);
    const [loadingPerfil, set_loadingPerfil] = useState(false);
    const [loadingOffer, set_loadingOffer] = useState(false);
    const [loadingBank, set_loadingBank] = useState(false);
    const [bankAccount, set_bankAccount] = useState(null);

    const [openContrato, set_openContrato] = useState(false);
    const [openPagare, set_openPagare] = useState(false);
    const [contratoRaw, set_contratoRaw] = useState("");
    const [pagareRaw, set_pagareRaw] = useState("");
    const [loadingCondiciones, set_loadingCondiciones] = useState(false);

    const [defaultPurposeId, set_defaultPurposeId] = useState(null);
    const [defaultProductId, set_defaultProductId] = useState(null);
    const [postingOffer, set_postingOffer] = useState(false);
    const [openResumen, set_openResumen] = useState(false);
    const [offerContainerId, set_offerContainerId] = useState(null);
    const [facturaData, set_facturaData] = useState(null);
    const [loadingFactura, set_loadingFactura] = useState(false);
    const [recibirError, set_recibirError] = useState("");
    const facturaIntervalRef = useRef(null);

    const token = gContext.logeado?.token;
    const set_logeado = gContext.set_logeado;

    useEffect(() => {
        console.log("[Aplicar2] sid:", token);
    }, [token]);

    useEffect(() => {
        return () => {
            if (facturaIntervalRef.current) {
                clearInterval(facturaIntervalRef.current);
                facturaIntervalRef.current = null;
            }
        };
    }, []);

    const OFFER_DR_TOKEN = "sFtBTsxF5Eri5zvQ8rqjQBiQWKFiThEwzBztGcJ9lY60Lyf50QGdoLKfUzXPMEqt";

    const defaultPlans = [
        { meses: 1, recibes: 2822.64, cuotaMensual: 3740.0, total: 3740.0 },
        { meses: 2, recibes: 5563.36, cuotaMensual: 3740.0, total: 7480.0 },
        { meses: 3, recibes: 8147.96, cuotaMensual: 3740.0, total: 11220.0 },
    ];

    const formatL = (amount) => {
        const safe = Number.isFinite(amount) ? amount : 0;
        return `L. ${safe.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const maskAccountNumber = (value) => {
        const digits = String(value ?? "").replace(/\D/g, "");
        if (!digits) return "****9821";
        const last4 = digits.slice(-4);
        return `****${last4}`;
    };

    const upperOrEmpty = (value) => String(value ?? "").trim().toUpperCase();

    const pad2 = (value) => String(value ?? "").padStart(2, "0");

    const formatLempirasText = (amount) => {
        const safe = Number.isFinite(amount) ? amount : 0;
        const formatted = safe.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `${formatted} Lempiras`;
    };

    const formatLempirasAmount = (amount) => {
        const safe = Number.isFinite(amount) ? amount : 0;
        return safe.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const formatDateDDMMYYYY = (date) => {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
        const dd = pad2(date.getDate());
        const mm = pad2(date.getMonth() + 1);
        const yyyy = String(date.getFullYear());
        return `${dd}-${mm}-${yyyy}`;
    };

    const addMonths = (date, months) => {
        const base = date instanceof Date ? new Date(date) : new Date();
        const n = Number(months);
        if (!Number.isFinite(n)) return base;
        const d = base.getDate();
        base.setMonth(base.getMonth() + n);
        if (base.getDate() !== d) {
            base.setDate(0);
        }
        return base;
    };

    const parsePercent = (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === "number") return Number.isFinite(value) ? value : null;
        const cleaned = String(value).replace("%", "").trim();
        const num = Number(cleaned);
        return Number.isFinite(num) ? num : null;
    };

    const aplicarVariablesDocumento = (rawHtml) => {
        if (!rawHtml) return "";

        const realname = upperOrEmpty(usuarioDetalle?.realname);
        const midname = upperOrEmpty(usuarioDetalle?.midname);
        const surname = upperOrEmpty(usuarioDetalle?.surname);
        const midname2 = upperOrEmpty(usuarioDetalle?.midname2);
        const prestatario = `${realname} ${midname} ${surname} ${midname2}`.replace(/\s+/g, " ").trim();

        const estadoCivil = upperOrEmpty(usuarioDetalle?.marital_status);
        const city = upperOrEmpty(usuarioDetalle?.county);
        const region = upperOrEmpty(usuarioDetalle?.region);
        const personCode = upperOrEmpty(usuarioDetalle?.person_code);

        const now = new Date();
        const createdDay = pad2(now.getDate());
        const year = String(now.getFullYear());
        const monthName = String(now.toLocaleString("es-ES", { month: "long" }) ?? "").toUpperCase();

        const principal = selectedPlan?.recibes ?? null;
        const period = selectedPlan?.meses ?? null;
        const cuota = selectedPlan?.cuotaMensual ?? null;
        const total = selectedPlan?.total ?? null;

        const fechaFinal = period ? formatDateDDMMYYYY(addMonths(now, period)) : "";

        const interestAnualFromOffer =
            parsePercent(offerDr?.interest_anual) ??
            parsePercent(offerDr?.interestAnual) ??
            parsePercent(offerDr?.interes_anual) ??
            parsePercent(offerDr?.interesAnual) ??
            null;

        const derivedAnnualRate = (() => {
            const p = parseMoney(principal);
            const t = parseMoney(total);
            const n = Number(period);
            if (!p || !t || !n) return null;
            const annual = ((t / p - 1) * (12 / n)) * 100;
            return Number.isFinite(annual) ? Math.max(0, annual) : null;
        })();

        const derivedPeriodRate = (() => {
            const p = parseMoney(principal);
            const t = parseMoney(total);
            const n = Number(period);
            if (!p || !t || !n) return null;
            const per = ((t / p - 1) / n) * 100;
            return Number.isFinite(per) ? Math.max(0, per) : null;
        })();

        const interestAnual = interestAnualFromOffer ?? derivedAnnualRate;

        const totalPago = selectedPlan?.total ?? null;

        let out = String(rawHtml);

        out = out.replaceAll("%{realname}%", realname);
        out = out.replaceAll("%{midname}%", midname);
        out = out.replaceAll("%{surname}%", surname);
        out = out.replaceAll("%{midname2}%", midname2);

        out = out.replaceAll("%{PRESTATARIO}%", prestatario);
        out = out.replaceAll("%{prestatario}%", prestatario);

        out = out.replaceAll("%{ESTADO CIVIL}%", estadoCivil);
        out = out.replaceAll("%{city}%", city);
        out = out.replaceAll("%{CIUDAD}%", city);
        out = out.replaceAll("%{region}%", region);
        out = out.replaceAll("%{person_code}%", personCode);

        out = out.replaceAll("%{created_day}%", createdDay);
        out = out.replaceAll("%{AÑO}%", year);
        out = out.replaceAll("%{NOMBRE MES}%", monthName);

        if (principal !== null) {
            out = out.replaceAll("%{amount}%", `${formatLempirasAmount(parseMoney(principal) ?? 0)} Lempiras`);
        }

        if (period !== null) {
            out = out.replaceAll("%{period}%", String(period));
        }

        if (cuota !== null) {
            out = out.replaceAll("%{cuota}%", formatLempirasText(parseMoney(cuota) ?? 0));
        }

        if (fechaFinal) {
            out = out.replaceAll("%{fecha_final}%", fechaFinal);
        }

        if (interestAnual !== null) {
            out = out.replaceAll("%{interest_anual}%", `${Number(interestAnual).toFixed(2)}%`);
        }

        if (derivedPeriodRate !== null) {
            out = out.replaceAll("%{interest}%%", `${Number(derivedPeriodRate).toFixed(2)}%`);
            out = out.replaceAll("%{interest}%", `${Number(derivedPeriodRate).toFixed(2)}%`);
        }

        if (totalPago !== null) {
            out = out.replaceAll("%{totalPago}%", formatLempirasText(totalPago));
        }

        return out;
    };

    const parseMoney = (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === "number") return Number.isFinite(value) ? value : null;

        const raw = String(value);
        const cleaned = raw
            .replace(/,/g, "")
            .replace(/\s+/g, "")
            .replace(/[^0-9.-]/g, "");

        if (!cleaned) return null;

        const num = Number.parseFloat(cleaned);
        return Number.isFinite(num) ? num : null;
    };

    const cargarContratoTemplate = () => {
        if (!token) return Promise.resolve();

        return axios
            .request({
                url: `${config.apiUrl}/api/app/get_contractPre.php`,
                method: "post",
                data: {
                    sid: token,
                },
            })
            .then((res) => {
                if (res.data.status === "OK") {
                    for (const key in res.data.payload?.data) {
                        if (Object.hasOwnProperty.call(res.data.payload?.data, key)) {
                            const element = res.data.payload?.data[key];
                            if (element?.document_template) {
                                set_contratoRaw(element.document_template);
                                break;
                            }
                        }
                    }
                }
            })
            .catch((err) => {
                console.log("[Aplicar2] get_contractPre.php -> error", err);
            });
    };

    const cargarPagareTemplate = () => {
        if (!token) return Promise.resolve();

        return axios
            .request({
                url: `${config.apiUrl}/api/app/get_pagarePre.php`,
                method: "post",
                data: {
                    sid: token,
                },
            })
            .then((res) => {
                if (res.data.status === "OK") {
                    for (const key in res.data.payload?.data) {
                        if (Object.hasOwnProperty.call(res.data.payload?.data, key)) {
                            const element = res.data.payload?.data[key];
                            if (element?.document_template) {
                                set_pagareRaw(element.document_template);
                                break;
                            }
                        }
                    }
                }
            })
            .catch((err) => {
                console.log("[Aplicar2] get_pagarePre.php -> error", err);
            });
    };

    const abrirCondiciones = () => {
        if (!token) return;
        if (mesesSeleccionados === null) return;

        set_openContrato(true);
        set_loadingCondiciones(true);

        Promise.all([contratoRaw ? Promise.resolve() : cargarContratoTemplate(), pagareRaw ? Promise.resolve() : cargarPagareTemplate()])
            .finally(() => {
                set_loadingCondiciones(false);
            });
    };

    function cargarPerfil() {
        if (!token) return Promise.resolve();

        set_loadingPerfil(true);

        return axios
            .request({
                url: `${config.apiUrl}/api/app/getProfile.php`,
                method: "post",
                data: {
                    sid: token,
                },
            })
            .then((res) => {
                console.log("[Aplicar2] getProfile.php -> status:", res?.data?.status);
                if (res.data.status === "ERS") {
                    localStorage.removeItem("arani_session_id");
                    if (typeof set_logeado === "function") set_logeado({ estado: false, token: "" });
                    return;
                }

                if (res.data.status === "OK") {
                    console.log("[Aplicar2] usuarioDetalle", res.data.payload?.data);
                    set_usuarioDetalle(res.data.payload?.data ?? {});
                }
            })
            .catch((err) => {
                console.log("[Aplicar2] getProfile.php -> error", err);
            })
            .finally(() => {
                set_loadingPerfil(false);
            });
    }

    useEffect(() => {
        if (!token) return;
        cargarPerfil();
    }, [token, set_logeado]);

    useEffect(() => {
        if (!token) return;

        axios
            .request({
                url: `${config.apiUrl}/api/app/getFieldConstructor.php`,
                method: "post",
                data: {
                    sid: token,
                },
            })
            .then((res) => {
                if (res.data.status === "OK") {
                    set_apiCamposConstructor(res.data.payload?.data ?? null);
                }
            })
            .catch((err) => {
                console.log("[Aplicar2] getFieldConstructor.php -> error", err);
            });
    }, [token]);

    useEffect(() => {
        if (!token) return;

        cargarCuentaBanco();
    }, [token]);

    useEffect(() => {
        if (!token) return;

        axios
            .request({
                url: `${config.apiUrl}/api/app/getPurposeList.php`,
                method: "post",
                data: { sid: token },
            })
            .then((res) => {
                if (res?.data?.status === "ERS") {
                    localStorage.removeItem("arani_session_id");
                    if (typeof set_logeado === "function") set_logeado({ estado: false, token: "" });
                    return;
                }
                if (res?.data?.status !== "OK") return;

                const payload = res.data.payload;
                const firstKey = payload && typeof payload === "object" ? Object.keys(payload)[0] : null;
                const firstId = firstKey ? payload?.[firstKey]?.id : null;
                if (firstId !== null && firstId !== undefined && String(firstId).trim() !== "") {
                    set_defaultPurposeId(String(firstId));
                }
            })
            .catch((err) => {
                console.log("[Aplicar2] getPurposeList.php -> error", err);
            });
    }, [token, set_logeado]);

    useEffect(() => {
        if (!token) return;

        axios
            .request({
                url: `${config.apiUrl}/api/app/getApplicationProfilev2.php`,
                method: "post",
                data: { sid: token },
            })
            .then((res) => {
                if (res?.data?.status === "ERS") {
                    localStorage.removeItem("arani_session_id");
                    if (typeof set_logeado === "function") set_logeado({ estado: false, token: "" });
                    return;
                }
                if (res?.data?.status !== "OK") return;

                const productsObj = res.data.payload?.Products;
                const allowed = res.data.payload?.Products_r;
                const products = productsObj && typeof productsObj === "object" ? Object.values(productsObj) : [];

                const isAllowed = (proCod) => {
                    if (!allowed) return true;
                    if (Array.isArray(allowed)) return allowed.includes(proCod);
                    if (typeof allowed === "string") return allowed.split(",").map((s) => s.trim()).includes(String(proCod));
                    return true;
                };

                const mensual =
                    products.find((p) => isAllowed(p?.ProCod) && String(p?.ProTip ?? "").toLowerCase() === "mensual") ||
                    products.find((p) => isAllowed(p?.ProCod)) ||
                    null;

                if (mensual?.ProCod) {
                    set_defaultProductId(mensual.ProCod);
                }
            })
            .catch((err) => {
                console.log("[Aplicar2] getApplicationProfilev2.php -> error", err);
            });
    }, [token, set_logeado]);

    function cargarCuentaBanco() {
        if (!token) return Promise.resolve();

        set_loadingBank(true);

        return axios
            .request({
                url: `${config.apiUrl}/api/app/get_bankaccount.php`,
                method: "post",
                data: {
                    sid: token,
                },
            })
            .then((res) => {
                console.log("[Aplicar2] get_bankaccount.php -> status:", res?.data?.status);

                if (res?.data?.status !== "OK") {
                    set_bankAccount(null);
                    return;
                }

                const data = res.data.payload?.data;
                const values = data && typeof data === "object" ? Object.values(data) : [];
                const current = values.find((e) => String(e?.current) === "1") ?? null;

                if (current) {
                    console.log("[Aplicar2] bankAccount (current)", current);
                    set_bankAccount({
                        bank: current.bank,
                        account_number: current.account_number,
                    });
                } else {
                    set_bankAccount(null);
                }
            })
            .catch((err) => {
                console.log("[Aplicar2] get_bankaccount.php -> error", err);
                set_bankAccount(null);
            })
            .finally(() => {
                set_loadingBank(false);
            });
    }

    const customerId =
        usuarioDetalle?.customer_id ??
        usuarioDetalle?.customerId ??
        usuarioDetalle?.client_id ??
        usuarioDetalle?.clientId ??
        null;

    useEffect(() => {
        if (!customerId) return;

        set_loadingOffer(true);

        axios
            .get("https://app.aranih.com/api/DecisionRules/getOfferDrClient.php", {
                params: {
                    token: OFFER_DR_TOKEN,
                    client_id: customerId,
                },
            })
            .then((res) => {
                console.log("[Aplicar2] getOfferDrClient -> response", res?.data);
                if (res?.data?.success) {
                    set_offerDr(res.data);
                } else {
                    set_offerDr(null);
                }
            })
            .catch((err) => {
                console.log("[Aplicar2] getOfferDrClient -> error", err);
                set_offerDr(null);
            })
            .finally(() => {
                set_loadingOffer(false);
            });
    }, [customerId]);

    const buildPlanFromOffer = (meses) => {
        const m = Number(meses);

        const recibes = parseMoney(offerDr?.[`outLoanAmount${m}M`]) ?? 0;
        const cuotaMensual = parseMoney(offerDr?.[`output${m}M`]) ?? 0;
        const interes = parseMoney(offerDr?.[`outInterest${m}M`]) ?? 0;
        const adminFee = parseMoney(offerDr?.[`outadminFee${m}M`]) ?? 0;

        return {
            meses: m,
            recibes,
            cuotaMensual,
            total: recibes + interes + adminFee,
        };
    };

    const plans = [buildPlanFromOffer(1), buildPlanFromOffer(2), buildPlanFromOffer(3)];

    const plansUi = plans.map((p) => ({
        ...p,
        disabled: !offerDr || p.recibes <= 0 || p.cuotaMensual <= 0,
    }));

    const selectedPlan = plansUi.find((p) => p.meses === mesesSeleccionados && !p.disabled) ?? null;
    const hasPlanSelected = Boolean(selectedPlan);

    useEffect(() => {
        if (mesesSeleccionados === null) return;

        const current = plansUi.find((p) => p.meses === mesesSeleccionados) ?? null;
        if (!current || current.disabled) {
            setMesesSeleccionados(null);
            setVerCondiciones(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offerDr]);

    const cuotaAprobada =
        parseMoney(
            offerDr?.cuota ??
                offerDr?.data?.cuota ??
                offerDr?.payload?.cuota ??
                offerDr?.CUOTA
        ) ?? 0;

    const contratoFinal = aplicarVariablesDocumento(contratoRaw);
    const pagareFinal = aplicarVariablesDocumento(pagareRaw);

    const bankNameRaw = bankAccount?.bank ?? usuarioDetalle?.bank ?? "";
    const bankName = apiCamposConstructor?.bank?.values?.[String(bankNameRaw)] ?? bankNameRaw ?? "--";
    const accountNumber = bankAccount?.account_number ?? usuarioDetalle?.account_number ?? "";
    const accountMasked = maskAccountNumber(accountNumber);

    const bankValue = String(bankNameRaw ?? "").trim();
    const accountValue = String(accountNumber ?? "").trim();
    const hasBankAndAccount = bankValue !== "" && bankValue !== "0" && accountValue !== "" && accountValue !== "0";
    const canRecibir = hasPlanSelected && hasBankAndAccount && Boolean(verCondiciones);

    const loadingInfo = loadingPerfil || loadingOffer || loadingBank;

    const stopFacturaPolling = () => {
        if (facturaIntervalRef.current) {
            clearInterval(facturaIntervalRef.current);
            facturaIntervalRef.current = null;
        }
    };

    const fetchFacturaOnce = (containerId) => {
        if (!token) return Promise.resolve(null);
        return axios
            .request({
                url: `${config.apiUrl}/api/app/getFactura.php`,
                method: "post",
                data: {
                    sid: token,
                    ...(containerId
                        ? {
                              ContainerId: containerId,
                              container_id: containerId,
                          }
                        : null),
                },
            })
            .then((res) => {
                if (res?.status !== 200) return null;
                return res.data;
            })
            .catch((err) => {
                console.log("[Aplicar2] getFactura.php -> error", err);
                return null;
            });
    };

    const startFacturaPolling = (containerId) => {
        stopFacturaPolling();
        set_loadingFactura(true);
        set_recibirError("");

        let attempts = 0;
        const maxAttempts = 25;

        const tick = async () => {
            attempts += 1;
            const data = await fetchFacturaOnce(containerId);
            if (data) {
                set_facturaData(data);
                const total = parseMoney(data?.totalAPagar);
                const pagos = Array.isArray(data?.pagos) ? data.pagos : [];

                if ((total !== null && total > 0) || pagos.length > 0) {
                    set_loadingFactura(false);
                    stopFacturaPolling();
                    return;
                }
            }

            if (attempts >= maxAttempts) {
                set_loadingFactura(false);
                stopFacturaPolling();
                set_recibirError("No pudimos obtener la factura todavía. Intenta de nuevo en unos segundos.");
            }
        };

        tick();
        facturaIntervalRef.current = setInterval(tick, 1000);
    };

    const handleRecibir = async () => {
        if (postingOffer) return;
        if (!token) return;
        if (!selectedPlan) return;

        set_openResumen(true);
        set_facturaData(null);
        set_offerContainerId(null);
        set_loadingFactura(false);
        set_recibirError("");

        if (!defaultProductId) {
            set_recibirError("No encontramos un producto disponible para registrar tu solicitud.");
            return;
        }
        if (!defaultPurposeId) {
            set_recibirError("No encontramos un propósito disponible para registrar tu solicitud.");
            return;
        }

        const periodDays = Number(selectedPlan.meses) * 30;
        const amount = parseMoney(selectedPlan.recibes) ?? 0;
        if (!Number.isFinite(periodDays) || periodDays <= 0 || amount <= 0) {
            set_recibirError("El plan seleccionado no es válido.");
            return;
        }

        const postOfferBody = {
            sid: token,
            period: periodDays,
            amount,
            purpose: defaultPurposeId,
            productId: defaultProductId,
        };

        const maskedSid =
            typeof token === "string" && token.length >= 8
                ? `${token.slice(0, 4)}...${token.slice(-4)}`
                : token;

        console.log("[Aplicar2] postOffer.php -> request", {
            ...postOfferBody,
            sid: maskedSid,
        });

        set_postingOffer(true);
        try {
            const res = await axios.request({
                url: `${config.apiUrl}/api/app/postOffer.php`,
                method: "post",
                withCredentials: true,
                data: postOfferBody,
            });

            console.log("[Aplicar2] postOffer.php -> response", res?.data);

            if (res?.data?.status === "ERS") {
                localStorage.removeItem("arani_session_id");
                if (typeof set_logeado === "function") set_logeado({ estado: false, token: "" });
                return;
            }

            if (res?.data?.status !== "OK") {
                set_recibirError(res?.data?.payload?.message || "No se pudo registrar la solicitud.");
                return;
            }

            const containerId =
                res?.data?.container_id ??
                res?.data?.containerId ??
                res?.data?.payload?.container_id ??
                res?.data?.payload?.containerId ??
                res?.data?.payload?.data?.container_id ??
                res?.data?.payload?.data?.containerId ??
                null;

            if (!containerId) {
                console.log("[Aplicar2] postOffer.php -> missing container_id", res?.data);
                set_recibirError("Se registró la solicitud, pero no recibimos el identificador del préstamo (container_id). ");
                return;
            }

            set_offerContainerId(String(containerId));

            startFacturaPolling(String(containerId));
        } catch (err) {
            console.log("[Aplicar2] postOffer.php -> error", err);
            set_recibirError("Ocurrió un error al enviar tu solicitud.");
        } finally {
            set_postingOffer(false);
        }
    };

    return (
        <Container
            disableGutters
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
            component="main"
            maxWidth="md"
        >
            <Box sx={{ p: "4px", width: "100%" }}>
                <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 } }}>
                    <BarraApp />
                    <Button
                        component={Link}
                        to="/"
                        variant="outlined"
                        startIcon={<span className="material-symbols-outlined">arrow_back</span>}
                    >
                        Volver
                    </Button>

                    {loadingInfo ? (
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: { xs: 8, sm: 10 } }}>
                            <CircularProgress sx={{ color: "#5b75e7" }} />
                            <Typography sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
                                Consultando la información en nuestros servicios
                            </Typography>
                        </Box>
                    ) : (

                        <>
                            <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 2, sm: 4 } }}>
                                <Box
                                    sx={{
                                        width: "100%",
                                        maxWidth: 520,
                                        backgroundColor: "#5b75e7",
                                        color: "#fff",
                                        borderRadius: 2,
                                        p: { xs: 2.5, sm: 4 },
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography variant="subtitle1" sx={{ mb: { xs: 1, sm: 2 } }}>
                                        Tu cuota máxima mensual aprobada
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        {formatL(cuotaAprobada)}
                                    </Typography>
                                    <Typography variant="body2">Disponible ahora</Typography>
                                </Box>
                            </Box>

                    <Typography variant="body2" sx={{ mt: { xs: 2, sm: 3 }, textAlign: "left", color: "text.secondary" }}>
                        Elige cómo quieres pagarlo
                    </Typography>

                    <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: { xs: 1.25, sm: 2 } }}>
                        {plansUi.map((plan) => (
                            <Box
                                key={plan.meses}
                                sx={{
                                    width: "100%",
                                    maxWidth: 520,
                                    mx: "auto",
                                    backgroundColor: "background.paper",
                                    color: "text.primary",
                                    borderRadius: 2,
                                    boxShadow: plan.disabled ? theme.shadows[0] : theme.shadows[3],
                                    border: mesesSeleccionados === plan.meses ? "2px solid #5b75e7" : "2px solid transparent",
                                    p: { xs: 2, sm: 3 },
                                    position: "relative",
                                    overflow: "hidden",
                                    cursor: plan.disabled ? "not-allowed" : "pointer",
                                    opacity: plan.disabled ? 0.55 : 1,
                                    ...(mesesSeleccionados === plan.meses
                                        ? {
                                              "&::before": {
                                                  content: '""',
                                                  position: "absolute",
                                                  inset: 0,
                                                  backgroundColor: alpha("#5b75e7", 0.18),
                                                  filter: "blur(18px)",
                                                  transform: "scale(1.1)",
                                                  zIndex: 0,
                                              },
                                              "& > *": {
                                                  position: "relative",
                                                  zIndex: 1,
                                              },
                                          }
                                        : null),
                                }}
                                onClick={() => {
                                    if (plan.disabled) return;
                                    setMesesSeleccionados(plan.meses);
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontWeight: 700 }}>
                                        {plan.meses} {plan.meses === 1 ? "mes" : "meses"}
                                    </Typography>
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                        <Box
                                            sx={{
                                                width: 20,
                                                height: 20,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: "50%",
                                                backgroundColor: "#5b75e7",
                                                color: "#fff",
                                                visibility: mesesSeleccionados === plan.meses ? "visible" : "hidden",
                                                mb: 0.5,
                                            }}
                                            aria-hidden={mesesSeleccionados === plan.meses ? "false" : "true"}
                                        >
                                            <span
                                                className="material-symbols-outlined"
                                                style={{ fontVariationSettings: '"FILL" 1, "wght" 700', fontSize: 16, lineHeight: 1 }}
                                            >
                                                check
                                            </span>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                    <Typography variant="body2">Recibes</Typography>
                                    <Typography>{formatL(plan.recibes).replace(".00", "")}</Typography>
                                </Box>

                                <Divider sx={{ width: "calc(100% + 16px)", mx: -1, my: 1.5 }} />

                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                    <Typography variant="body2">Cuota mensual</Typography>
                                    <Typography>{formatL(plan.cuotaMensual).replace(".00", "")}</Typography>
                                </Box>

                                <Divider sx={{ width: "calc(100% + 16px)", mx: -1, my: 1.5 }} />

                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                    <Typography variant="body2">Total</Typography>
                                    <Typography>{formatL(plan.total).replace(".00", "")}</Typography>
                                </Box>

                                <Divider sx={{ width: "calc(100% + 16px)", mx: -1, my: 1.5 }} />
                            </Box>
                        ))}
                    </Box>

                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: 520,
                            mx: "auto",
                            mt: { xs: 2, sm: 3 },
                            backgroundColor: "background.paper",
                            color: "text.primary",
                            borderRadius: 2,
                            boxShadow: 3,
                            p: { xs: 2, sm: 3 },
                        }}
                    >
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
                            <Typography variant="body2">Recibes</Typography>
                            <Typography sx={{ fontWeight: 700 }}>{formatL(selectedPlan?.recibes)}</Typography>
                            <Box />
                        </Box>

                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", mt: 1 }}>
                            <Typography variant="body2">Pagas</Typography>
                            <Typography sx={{ fontWeight: 700 }}>
                                {selectedPlan
                                    ? `${formatL(selectedPlan.cuotaMensual).replace(".00", "")} X ${selectedPlan.meses}`
                                    : "L 0.00 X 0"}
                            </Typography>
                            <Box />
                        </Box>

                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", mt: 1 }}>
                            <Typography variant="body2">Total</Typography>
                            <Typography>{formatL(selectedPlan?.total)}</Typography>
                            <Box />
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: 520,
                            mx: "auto",
                            mt: { xs: 2, sm: 3 },
                            backgroundColor: "background.paper",
                            color: "text.primary",
                            borderRadius: 2,
                            boxShadow: 3,
                            p: { xs: 2, sm: 3 },
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                            <Box>
                                <Typography sx={{ fontWeight: 700 }}>Depósito en</Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                                    Banco: {bankName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                                    Cuenta: {accountNumber ? accountNumber : accountMasked}
                                </Typography>
                            </Box>
                            <Button
                                variant="text"
                                disabled={!hasPlanSelected}
                                onClick={() => {
                                    if (!hasPlanSelected) return;
                                    setOpenCambiarCuenta(true);
                                }}
                                sx={{ color: hasPlanSelected ? "#5b75e7" : "text.disabled", minWidth: "auto", p: 0 }}
                            >
                                Cambiar
                            </Button>
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Checkbox
                                checked={verCondiciones}
                                disabled={!hasPlanSelected}
                                onChange={(e) => {
                                    if (!hasPlanSelected) return;
                                    if (e.target.checked) {
                                        abrirCondiciones();
                                    } else {
                                        setVerCondiciones(false);
                                    }
                                }}
                                sx={{ p: 0, pr: 1 }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: hasPlanSelected ? "text.secondary" : "text.disabled",
                                    cursor: hasPlanSelected ? "pointer" : "default",
                                }}
                                onClick={() => {
                                    if (!hasPlanSelected) return;
                                    abrirCondiciones();
                                }}
                            >
                                Ver condiciones
                            </Typography>
                        </Box>
                    </Box>

                    <Dialog open={openContrato} onClose={() => set_openContrato(false)} fullWidth maxWidth="md">
                        <DialogTitle>Contrato</DialogTitle>
                        <DialogContent>
                            {loadingCondiciones && !contratoRaw ? (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                    <CircularProgress sx={{ color: "#5b75e7" }} />
                                </Box>
                            ) : (
                                <Box>{parse(contratoFinal || "<br/><br/>No hay contrato disponible<br/><br/>")}</Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: "flex-start" }}>
                            <Button
                                onClick={() => {
                                    set_openContrato(false);
                                }}
                            >
                                Regresar
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: "#5b75e7", ":hover": { backgroundColor: "#5b75e7" } }}
                                onClick={() => {
                                    set_openContrato(false);
                                    set_openPagare(true);
                                }}
                            >
                                Acepto
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog open={openPagare} onClose={() => set_openPagare(false)} fullWidth maxWidth="md">
                        <DialogTitle>Pagaré</DialogTitle>
                        <DialogContent>
                            {loadingCondiciones && !pagareRaw ? (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                    <CircularProgress sx={{ color: "#5b75e7" }} />
                                </Box>
                            ) : (
                                <Box>{parse(pagareFinal || "<br/><br/>No hay pagaré disponible<br/><br/>")}</Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: "flex-start" }}>
                            <Button
                                onClick={() => {
                                    set_openPagare(false);
                                    set_openContrato(true);
                                }}
                            >
                                Regresar
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: "#5b75e7", ":hover": { backgroundColor: "#5b75e7" } }}
                                onClick={() => {
                                    set_openPagare(false);
                                    setVerCondiciones(true);
                                }}
                            >
                                Acepto
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog open={openCambiarCuenta} onClose={() => setOpenCambiarCuenta(false)} fullWidth maxWidth="sm">
                        <DialogContent>
                            {apiCamposConstructor?.bank?.values ? (
                                <FormCambiarBanco
                                    cerrar={() => setOpenCambiarCuenta(false)}
                                    reiniciarpantalla={() => {
                                        cargarPerfil();
                                        cargarCuentaBanco();
                                        setOpenCambiarCuenta(false);
                                    }}
                                    apiCamposConstructor={apiCamposConstructor}
                                    usuarioDetalle={usuarioDetalle}
                                />
                            ) : (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                    <CircularProgress sx={{ color: "#5b75e7" }} />
                                </Box>
                            )}
                        </DialogContent>
                    </Dialog>

                    <Button
                        fullWidth
                        variant="contained"
                        disabled={!canRecibir || postingOffer}
                        sx={{
                            mt: { xs: 2, sm: 3 },
                            maxWidth: 520,
                            mx: "auto",
                            display: "flex",
                            backgroundColor: canRecibir ? "#5b75e7" : "action.disabledBackground",
                            color: canRecibir ? "#fff" : "text.disabled",
                            fontWeight: 700,
                            textTransform: "none",
                            ":hover": { backgroundColor: canRecibir ? "#5b75e7" : "action.disabledBackground" },
                            "&.Mui-disabled": {
                                backgroundColor: "action.disabledBackground",
                                color: "text.disabled",
                            },
                        }}
                        onClick={handleRecibir}
                    >
                        {postingOffer ? (
                            <>
                                <CircularProgress size={18} sx={{ color: "#fff", mr: 1 }} />
                                Procesando...
                            </>
                        ) : (
                            <>Recibir {formatL(selectedPlan?.recibes ?? 0)}</>
                        )}
                    </Button>

                    <Dialog
                        open={openResumen}
                        onClose={() => {
                            stopFacturaPolling();
                            set_openResumen(false);
                        }}
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle>Resumen de tu préstamo</DialogTitle>
                        <DialogContent>
                            {postingOffer ? (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                                    <CircularProgress sx={{ color: "#5b75e7" }} />
                                </Box>
                            ) : null}

                            {recibirError ? (
                                <Typography color="error" sx={{ mb: 2 }}>
                                    {recibirError}
                                </Typography>
                            ) : null}

                            {loadingFactura ? (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                    <CircularProgress sx={{ color: "#5b75e7" }} />
                                </Box>
                            ) : null}

                            {!loadingFactura && facturaData ? (
                                <Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            Cantidad solicitada
                                        </Typography>
                                        <Typography variant="body2">{formatL(parseMoney(facturaData?.cantidadSolicitada) ?? 0)}</Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            Interés
                                        </Typography>
                                        <Typography variant="body2">{formatL(parseMoney(facturaData?.intereses) ?? 0)}</Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            Gastos administrativos
                                        </Typography>
                                        <Typography variant="body2">{formatL(parseMoney(facturaData?.gastosAdministrativos) ?? 0)}</Typography>
                                    </Box>

                                    <Divider sx={{ my: 1.5 }} />

                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            Total a pagar
                                        </Typography>
                                        <Typography variant="body2">{formatL(parseMoney(facturaData?.totalAPagar) ?? 0)}</Typography>
                                    </Box>

                                    {Array.isArray(facturaData?.pagos) && facturaData.pagos.length > 0 ? (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                                                Pagos
                                            </Typography>
                                            {facturaData.pagos.map((p, idx) => (
                                                <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                            Pago {idx + 1}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                            {p?.fechaDePago || ""}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2">{formatL(parseMoney(p?.cantidad) ?? 0)}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : null}
                                </Box>
                            ) : null}
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: "flex-start" }}>
                            <Button
                                onClick={() => {
                                    stopFacturaPolling();
                                    set_openResumen(false);
                                }}
                            >
                                Cerrar
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: "#5b75e7", ":hover": { backgroundColor: "#5b75e7" } }}
                                onClick={() => {
                                    stopFacturaPolling();
                                    set_openResumen(false);
                                    navigate(offerContainerId ? `/plan/${offerContainerId}` : "/plan");
                                }}
                                disabled={!offerContainerId}
                            >
                                Finalizar
                            </Button>
                        </DialogActions>
                    </Dialog>
                        </>
                    )}
                </Paper>
                <BarraFinal />
            </Box>
        </Container>
    );
}

export default Aplicar2;
