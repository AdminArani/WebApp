import Box from "@mui/material/Box";
import { AppContext } from "./App";
import { useContext, useEffect, useState } from "react";
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
import { Link } from "react-router-dom";
import BarraFinal from "./componentes/BarraFinal";
import BarraApp from "./componentes/BarraApp";
import FormCambiarBanco from "./componentes/cambiarBanco.js";

function Aplicar2() {
    const gContext = useContext(AppContext);
    const theme = useTheme();
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

    const token = gContext.logeado?.token;
    const set_logeado = gContext.set_logeado;

    useEffect(() => {
        console.log("[Aplicar2] sid:", token);
    }, [token]);

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
        const num = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
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

    const cuotaFromOffer = parseMoney(offerDr?.cuota);
    const cuotaValue = cuotaFromOffer ?? 0;

    const plans = [
        {
            meses: 1,
            recibes: parseMoney(offerDr?.output1M) ?? 0,
            cuotaMensual: cuotaValue,
            total: cuotaValue * 1,
        },
        {
            meses: 2,
            recibes: parseMoney(offerDr?.output2M) ?? 0,
            cuotaMensual: cuotaValue,
            total: cuotaValue * 2,
        },
        {
            meses: 3,
            recibes: parseMoney(offerDr?.output3M) ?? 0,
            cuotaMensual: cuotaValue,
            total: cuotaValue * 3,
        },
    ];

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
    }, [offerDr, cuotaValue]);

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
                                        Tu cuota mensual aprobada
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        {formatL(cuotaValue)}
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
                        disabled={!canRecibir}
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
                    >
                        Recibir {formatL(selectedPlan?.recibes ?? 0)}
                    </Button>
                        </>
                    )}
                </Paper>
                <BarraFinal />
            </Box>
        </Container>
    );
}

export default Aplicar2;
