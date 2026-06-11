import config from "./config";
import axios from "axios";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    Modal,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./App";
import BarraApp from "./componentes/BarraApp";
import BarraFinal from "./componentes/BarraFinal";
import logobac from "./images/logoBaccuadro.jpg";

function PagosDirectos() {
    const gContext = useContext(AppContext);
    const navigate = useNavigate();
    const [castigoData, set_castigoData] = useState(null);
    const [openModalBAC, setOpenModalBAC] = useState(false);
    const [openModalN1co, setOpenModalN1co] = useState(false);
    const [openModalAvisoConfirmacionN1co, setOpenModalAvisoConfirmacionN1co] = useState(false);
    const [n1coLink, setN1coLink] = useState("");
    const [cargandoLinkN1co, setCargandoLinkN1co] = useState(false);
    const [errorLinkN1co, setErrorLinkN1co] = useState("");

    const [montoPago, setMontoPago] = useState("");
    const [numReferencia, setNumReferencia] = useState("");
    const [estadoReferencia, setEstadoReferencia] = useState("");
    const [fotoComprobante, setFotoComprobante] = useState(null);
    const [clienteData, setClienteData] = useState(null);
    const [cargandoEnvio, setCargandoEnvio] = useState(false);
    const [openConfirmacionPago, setOpenConfirmacionPago] = useState(false);
    const [mostrarAvisoPagoExitoso, setMostrarAvisoPagoExitoso] = useState(false);

    useEffect(() => {
        const castigoDataRaw = localStorage.getItem("arani_castigo_data");
        if (!castigoDataRaw) {
            set_castigoData(null);
            return;
        }

        try {
            const castigoDataParsed = JSON.parse(castigoDataRaw);
            set_castigoData(castigoDataParsed);
        } catch (error) {
            console.error("No se pudo leer arani_castigo_data:", error);
            set_castigoData(null);
        }
    }, []);

    const deudaPendiente = useMemo(() => Number(castigoData?.deuda_pendiente || 0), [castigoData]);

    useEffect(() => {
        if (deudaPendiente > 0) {
            setMontoPago(deudaPendiente.toFixed(2));
        }
    }, [deudaPendiente]);

    const formatMoney = (value) => {
        const n = Number(value || 0);
        return n.toLocaleString("es-HN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const validarPerfilEnCore = () => {
        return axios.request({
            url: `${config.apiUrl}/api/app/getProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
            },
        }).then((res) => {
            if (res.data.status === "OK") {
                return res.data.payload.data;
            }

            throw new Error(res.data?.payload?.message || "No se pudo cargar perfil del cliente");
        });
    };

    const salir = () => {
        gContext.set_logeado({ estado: false, token: "" });
        localStorage.removeItem("arani_session_id");
        navigate("/login");
    };

    const handleOpenModalBAC = () => {
        validarPerfilEnCore().then((profile) => {
            setClienteData(profile);
            setOpenModalBAC(true);
        }).catch((err) => {
            console.error("Error al cargar perfil para BAC:", err);
        });
    };

    const handleOpenModalN1co = () => {
        validarPerfilEnCore().then((profile) => {
            setClienteData(profile);
            setErrorLinkN1co("");
            setN1coLink("");
            setOpenModalN1co(true);
        }).catch((err) => {
            console.error("Error al cargar perfil para N1co:", err);
            setErrorLinkN1co("No se pudo cargar el perfil del cliente para generar el pago N1co.");
            setOpenModalN1co(true);
        });
    };

    const extraerOrderCode = (paymentLinkUrl) => {
        try {
            return String(paymentLinkUrl).split("/").pop() || "";
        } catch {
            return "";
        }
    };

    const enviarPostNicoPagoCastigado = async ({ orderCode, paymentLinkUrl }) => {
        if (!clienteData && !castigoData) {
            throw new Error("No hay datos de cliente para registrar el pago N1co.");
        }

        const now = new Date();
        const offset = 6 * 60 * 60 * 1000;
        const fechaLocal = new Date(now.getTime() - offset);
        const fechaPago = fechaLocal.toISOString().split("T")[0];
        const horaRegistro = fechaLocal.toISOString().split("T")[1].split(".")[0];

        const nombreClienteConcat = [
            clienteData?.realname,
            clienteData?.midname,
            clienteData?.midname2,
            clienteData?.surname,
        ].filter(Boolean).join(" ");

        const payload = {
            orderStatus: "PENDING",
            codigoOrden: orderCode,
            paymentLinkUrl,
            descripcion: "Pago_Nico_Castigado",
            descripcionPago: "Pago_Nico_Castigado",
            identificadorPrestamo: castigoData?.numero_prestamo || "",
            identificadorPago: castigoData?.numero_inversion || "",
            idCliente: clienteData?.customer_id || castigoData?.id_cliente || "",
            identidadCliente: clienteData?.person_code || "",
            nombreCliente: nombreClienteConcat,
            correoElectronico: clienteData?.email || "",
            celular: clienteData?.mob_phone || "",
            fechaPago,
            fechaCuota: castigoData?.fecha_final || fechaPago,
            horaRegistro,
            cuota: Number(Number(deudaPendiente || 0).toFixed(2)),
            montoPago: Number(Number(deudaPendiente || 0).toFixed(2)),
            comentario: "Pago_Nico_Castigado",
            forzarNuevoLink: 0,
        };

        const bodyStr = new URLSearchParams(
            Object.entries(payload).reduce((acc, [k, v]) => {
                acc[k] = v === null || v === undefined ? "" : String(v);
                return acc;
            }, {})
        ).toString();

        console.log("[pagosdirectos][postNicoPago] payload:", payload);

        const res = await fetch("https://app.aranih.com/api/chatbot/pagosBac/postNicoPago2.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                Authorization: "70f5c0e10e6a43072595dc67c5ee4b2a68371abdc3c8438120d774ed9ac706aa",
            },
            body: bodyStr,
        });

        let data = {};
        try {
            data = await res.json();
        } catch {
            data = {};
        }

        console.log("[pagosdirectos][postNicoPago] HTTP:", res.status, res.statusText);
        console.log("[pagosdirectos][postNicoPago] resp:", data);

        if (res.status !== 200 && res.status !== 201) {
            throw new Error(data?.mensaje || "No se pudo registrar el pago N1co en app.aranih");
        }

        setMostrarAvisoPagoExitoso(true);

        return data;
    };

    const handleNumReferenciaChange = async (event) => {
        const valorSinEspacios = event.target.value.replace(/\s/g, "");
        setNumReferencia(valorSinEspacios);

        if (!valorSinEspacios) {
            setEstadoReferencia("");
            return;
        }

        const referenciaConcatenada = `${clienteData?.customer_id || castigoData?.id_cliente}_${castigoData?.numero_prestamo}_${valorSinEspacios}`;

        const params = new URLSearchParams({
            codigo: "F1A672ACF37354D0EEAAB4F6574729AF",
            referencia: referenciaConcatenada,
        });

        try {
            const response = await fetch(`https://app.aranih.com/api/app/getPagosReference.php?${params}`);
            const resultado = await response.text();
            if (resultado === '"existe"') {
                setEstadoReferencia("El comprobante con este numero de referencia ya fue cargado.");
                return;
            }
            setEstadoReferencia("");
        } catch (error) {
            setEstadoReferencia("Error validando referencia");
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFotoComprobante(file);
        }
    };

    const enviarComprobanteBac = () => {
        if (!clienteData || !fotoComprobante) {
            return;
        }

        setCargandoEnvio(true);

        const formData = new FormData();
        const nombreCompleto = [
            clienteData.realname,
            clienteData.midname,
            clienteData.midname2,
            clienteData.surname,
        ].filter(Boolean).join(" ");

        const now = new Date();
        const offset = 6 * 60 * 60 * 1000;
        const fechaLocal = new Date(now.getTime() - offset);
        const fechaPago = fechaLocal.toISOString().split("T")[0];
        const horaRegistro = fechaLocal.toISOString().split("T")[1].split(".")[0];

        formData.append("idCliente", clienteData.customer_id || castigoData?.id_cliente || "");
        formData.append("identidadCliente", clienteData.person_code || "");
        formData.append("nombreCliente", nombreCompleto);
        formData.append("correoElectronico", clienteData.email || "");
        formData.append("celular", clienteData.mob_phone || "");
        formData.append("numReferencia", numReferencia);
        formData.append("cuota", deudaPendiente.toFixed(2));
        formData.append("montoPago", deudaPendiente.toFixed(2));
        formData.append("validado", "pendiente");
        formData.append("descripcion", "Pago_Bac_Castigado");
        formData.append("comentario", "Pago directo cliente castigado");
        formData.append("enviarMensaje", "0");
        formData.append("usuarioValidador_id", "3");
        formData.append("identificadorPago", castigoData?.numero_inversion || "0");
        formData.append("identificadorPrestamo", castigoData?.numero_prestamo || "0");
        formData.append("fotoComprobante", fotoComprobante);
        formData.append("fechaPago", fechaPago);
        formData.append("fechaCuota", castigoData?.fecha_final || fechaPago);
        formData.append("horaRegistro", horaRegistro);

        axios.post("https://app.aranih.com/api/chatbot/pagosBac/postBacPago.php", formData, {
            headers: {
                Authorization: "70f5c0e10e6a43072595dc67c5ee4b2a68371abdc3c8438120d774ed9ac706aa",
                "Content-Type": "multipart/form-data",
            },
        }).then((response) => {
            console.log("[pagosdirectos] Respuesta BAC:", response.data);
            setOpenConfirmacionPago(true);
            setMostrarAvisoPagoExitoso(true);
            setFotoComprobante(null);
            setNumReferencia("");
            setEstadoReferencia("");
            setTimeout(() => {
                setOpenModalBAC(false);
                setOpenConfirmacionPago(false);
            }, 1500);
        }).catch((error) => {
            console.error("Error al enviar comprobante BAC:", error.response ? error.response.data : error.message);
        }).finally(() => {
            setCargandoEnvio(false);
        });
    };

    const generarLinkN1co = async () => {
        try {
            setCargandoLinkN1co(true);
            setErrorLinkN1co("");
            setN1coLink("");

            const res = await fetch("https://app.aranih.com/api/nico/GetUrl.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: "V3cFeaOiRmP4t2d8wrZMYxch5t4sdEIJeg6JXUeOFpiJ9ZIlcEM0f3YwlUXh0Sqs",
                    nombre: "Pago ARANI",
                    monto: deudaPendiente,
                    descripcion: "Pago_Nico_Castigado",
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "No se pudo generar el link de pago");
            }

            const link = data?.paymentLinkUrl || "";
            if (!link) {
                throw new Error("Respuesta de N1co sin link");
            }

            const orderCode = extraerOrderCode(link);
            if (!orderCode) {
                throw new Error("No se pudo obtener codigo de orden del link N1co");
            }

            await enviarPostNicoPagoCastigado({
                orderCode,
                paymentLinkUrl: link,
            });

            setN1coLink(link);
            window.open(link, "_blank", "noopener,noreferrer");
        } catch (error) {
            setErrorLinkN1co(error.message || "Error generando link de pago");
        } finally {
            setCargandoLinkN1co(false);
            setOpenModalAvisoConfirmacionN1co(false);
        }
    };

    return (
        <Container disableGutters sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} component="main" maxWidth="md">
            <Box sx={{ p: "4px", width: "100%" }}>
                <Paper elevation={6} sx={{ p: 4 }}>
                    <BarraApp />

                    {mostrarAvisoPagoExitoso && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Pago exitoso. Recibiras un SMS cuando tu pago haya sido aplicado.
                        </Alert>
                    )}

                    <Typography variant="h5" sx={{ mt: 2 }}>
                        Pagos directos
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                        Este panel muestra la informacion del cliente castigado y los canales de pago BAC y N1co.
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    {!castigoData && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            No hay informacion disponible de castigo para este usuario.
                        </Alert>
                    )}

                    {castigoData && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={7}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Resumen de deuda
                                    </Typography>

                                    <Grid container spacing={1.5}>
                                        <Grid item xs={12} sm={6}>
                                            <Chip label={`Cliente: ${castigoData.id_cliente || "-"}`} variant="outlined" />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Chip label={`Prestamo: ${castigoData.numero_prestamo || "-"}`} variant="outlined" />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Chip label={`Dias atraso: ${castigoData.dias_atraso || "0"}`} variant="outlined" />
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="body2">Fecha de creacion: <strong>{castigoData.fecha_creacion || "-"}</strong></Typography>
                                    <Typography variant="body2">Fecha final: <strong>{castigoData.fecha_final || "-"}</strong></Typography>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="body1">Monto otorgado: <strong>L {formatMoney(castigoData.monto_otorgado)}</strong></Typography>
                                    <Typography variant="body1" sx={{ color: "error.main" }}>Deuda pendiente: <strong>L {formatMoney(castigoData.deuda_pendiente)}</strong></Typography>
                                    <Typography variant="body2">Comision mora: <strong>L {formatMoney(castigoData.comision_mora)}</strong></Typography>
                                    <Typography variant="body2">Intereses generados: <strong>L {formatMoney(castigoData.intereses_generados)}</strong></Typography>
                                    <Typography variant="body2">Comision admin: <strong>L {formatMoney(castigoData.comision_admin)}</strong></Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={5}>
                                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
                                        Pago BAC
                                    </Typography>
                                    <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                                        <img src={logobac} alt="BAC" style={{ width: "120px", borderRadius: "8px" }} />
                                    </Box>
                                    <Button fullWidth variant="contained" color="error" onClick={handleOpenModalBAC}>
                                        Enviar comprobante BAC
                                    </Button>
                                </Paper>

                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
                                        Pago N1co
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        Realiza el pago con tarjeta desde N1co.
                                    </Typography>
                                    <Button fullWidth variant="contained" sx={{ backgroundColor: "#111" }} onClick={handleOpenModalN1co}>
                                        Pagar con Tarjeta
                                    </Button>
                                </Paper>

                            </Grid>
                        </Grid>
                    )}

                    {castigoData && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                            <Button onClick={salir} variant="contained" sx={{ minWidth: 220 }}>
                                Cerrar sesion
                            </Button>
                        </Box>
                    )}

                    <Dialog open={openModalBAC} onClose={() => setOpenModalBAC(false)}>
                        <DialogContent>
                            <Typography variant="h5">Subir Archivo BAC</Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Adjunte su comprobante de pago BAC.
                            </Typography>

                            <TextField
                                label="Monto a Pagar"
                                value={montoPago}
                                fullWidth
                                sx={{ mt: 2 }}
                                InputProps={{ readOnly: true }}
                            />

                            <TextField
                                label="Numero de Referencia"
                                value={numReferencia}
                                onChange={handleNumReferenciaChange}
                                type="text"
                                fullWidth
                                sx={{ mt: 2 }}
                                error={!!estadoReferencia}
                                helperText={estadoReferencia}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                component="label"
                                startIcon={<span className="material-symbols-outlined">cloud_upload</span>}
                                sx={{ mt: 2 }}
                                disabled={!numReferencia}
                            >
                                Adjuntar documento
                                <input type="file" onChange={handleFileChange} accept="image/*" hidden multiple />
                            </Button>

                            <Typography variant="body2" sx={{ mt: 2 }}>
                                Una vez enviado, sera revisado por uno de nuestros agentes para validar el pago.
                            </Typography>

                            {cargandoEnvio && (
                                <Typography variant="body2" sx={{ color: "blue", mt: 2 }}>
                                    Cargando...
                                </Typography>
                            )}

                            <Divider sx={{ mb: 2, mt: 2 }} />

                            <Box sx={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
                                <Button
                                    onClick={enviarComprobanteBac}
                                    disabled={!fotoComprobante || !numReferencia || cargandoEnvio}
                                    variant="contained"
                                >
                                    Enviar comprobante
                                </Button>
                            </Box>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={openModalN1co} onClose={() => setOpenModalN1co(false)}>
                        <DialogContent>
                            <Typography variant="h5">Pago con N1co</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 1 }}>
                                Pago directo de deuda
                            </Typography>

                            <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
                                Genera tu link de pago para este saldo pendiente.
                            </Typography>

                            <TextField
                                label="Monto a pagar"
                                value={`L. ${formatMoney(deudaPendiente)}`}
                                fullWidth
                                InputProps={{ readOnly: true }}
                                sx={{ mt: 1, backgroundColor: "#f5f5f5" }}
                            />

                            {errorLinkN1co && (
                                <Typography sx={{ mt: 2, color: "red" }}>
                                    {errorLinkN1co}
                                </Typography>
                            )}

                            {n1coLink && (
                                <Typography sx={{ mt: 2, wordBreak: "break-all" }}>
                                    Link generado: <a href={n1coLink} target="_blank" rel="noreferrer">Abrir enlace de pago</a>
                                </Typography>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => setOpenModalAvisoConfirmacionN1co(true)}
                                    disabled={cargandoLinkN1co || deudaPendiente <= 0}
                                >
                                    {cargandoLinkN1co ? "Abriendo..." : "Pagar"}
                                </Button>
                                <Button variant="outlined" onClick={() => setOpenModalN1co(false)}>
                                    Cerrar
                                </Button>
                            </Box>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={openModalAvisoConfirmacionN1co}
                        onClose={() => {
                            if (cargandoLinkN1co) {
                                return;
                            }
                            setOpenModalAvisoConfirmacionN1co(false);
                        }}
                    >
                        <DialogContent>
                            <Typography variant="h6">Antes de continuar</Typography>
                            <Typography variant="body2" sx={{ mt: 2, whiteSpace: "pre-line" }}>
                                No cierres esta ventana mientras estes realizando tu pago.

                                {"\n\n"}
                                Al presionar Entendido, se generara tu link de pago y seras redirigido a N1co.
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenModalAvisoConfirmacionN1co(false)} variant="outlined" disabled={cargandoLinkN1co}>
                                Cancelar
                            </Button>
                            <Button onClick={generarLinkN1co} variant="contained" disabled={cargandoLinkN1co}>
                                {cargandoLinkN1co ? "Cargando..." : "Entendido"}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Modal
                        open={openConfirmacionPago}
                        onClose={() => setOpenConfirmacionPago(false)}
                        aria-labelledby="confirmacion-pago-title"
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: 300,
                                bgcolor: "#4d5de9",
                                boxShadow: 24,
                                p: 4,
                                borderRadius: "8px",
                                textAlign: "center",
                                zIndex: 1300,
                            }}
                        >
                            <Typography id="confirmacion-pago-title" variant="h6" component="h2" sx={{ color: "white", fontWeight: "bold" }}>
                                Comprobante enviado con exito
                            </Typography>
                        </Box>
                    </Modal>
                </Paper>
                <BarraFinal />
            </Box>
        </Container>
    );
}

export default PagosDirectos;
