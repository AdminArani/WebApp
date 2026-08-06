import config from './config';
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from "@mui/material";
import { useContext, useState, useEffect, useMemo } from "react";
import { AppContext } from "./App";
import BarraFinal from "./componentes/BarraFinal";
import { nombreEstadoPrestamo } from "./componentes/utilidades.js";
import { Link, useNavigate } from "react-router-dom";
import BarraApp from "./componentes/BarraApp";
import axios from "axios";
import numeral from "numeral";
import moment from "moment";
import 'moment/locale/es';
function Historial() {
  const gContext = useContext(AppContext);
  const navigate = useNavigate();
  const [dataObj, set_dataObj] = useState({});
  const [cargando, set_cargando] = useState(false);
  const [customerId, set_customerId] = useState(null);
  const [enviandoFiniquitoId, set_enviandoFiniquitoId] = useState(null);
  const [popupFiniquito, set_popupFiniquito] = useState({
    open: false,
    title: "",
    message: ""
  });
  const prestamosVisibles = useMemo(() => Object.keys(dataObj).reverse().filter(key => nombreEstadoPrestamo[dataObj[key].status] !== "Rechazado"), [dataObj]);

  function cerrarPopupFiniquito() {
    set_popupFiniquito({
      open: false,
      title: "",
      message: ""
    });
  }

  function enviarFiniquito(containerId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('[Historial][Finiquito] gContext.logeado:', gContext?.logeado);
    console.log('[Historial][Finiquito] Datos para endpoint:', {
      NcustomerId: customerId,
      NContainerid: containerId
    });
    if (!customerId || !containerId) {
      set_popupFiniquito({
        open: true,
        title: "Error",
        message: "No se pudo enviar el finiquito. Faltan datos del cliente o del prestamo."
      });
      return;
    }
    set_enviandoFiniquitoId(containerId);
    const payload = new URLSearchParams();
    payload.append('NcustomerId', String(customerId));
    payload.append('NContainerid', String(containerId));
    axios.request({
      url: `https://app.aranih.com/api/app/generarFiniquito.php`,
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 15000,
      data: payload
    }).then(res => {
      const status = String(res?.data?.status || "").toUpperCase();
      const success = res?.data?.success === true;
      const emailEnviado = res?.data?.email_enviado === true || Number(res?.data?.email_resultado) === 1;
      if (status === "OK" || success || emailEnviado) {
        const destinatarios = Array.isArray(res?.data?.destinatarios) ? res.data.destinatarios.join(', ') : '';
        set_popupFiniquito({
          open: true,
          title: "Finiquito enviado",
          message: destinatarios ? `El finiquito fue enviado al correo electronico correctamente. Destinatario(s): ${destinatarios}` : "El finiquito fue enviado al correo electronico correctamente."
        });
        return;
      }
      const backendDetail = res?.data?.message || res?.data?.error || res?.data?.payload?.message || JSON.stringify(res?.data || {});
      set_popupFiniquito({
        open: true,
        title: "Error",
        message: `No se pudo enviar el finiquito. Detalle: ${backendDetail}`
      });
    }).catch(err => {
      const statusCode = err?.response?.status;
      const backendData = err?.response?.data;
      const backendText = typeof backendData === 'string' ? backendData : backendData ? JSON.stringify(backendData) : "";
      const networkDetail = err?.message || "Error de red o CORS";
      const detalleFinal = `${statusCode ? `HTTP ${statusCode}. ` : ""}${backendText || networkDetail}`;
      console.error('[Historial][Finiquito] Error al enviar:', {
        statusCode,
        backendData,
        networkDetail
      });
      set_popupFiniquito({
        open: true,
        title: "Error",
        message: `No se pudo enviar el finiquito. Detalle: ${detalleFinal}`
      });
    }).finally(() => {
      set_enviandoFiniquitoId(null);
    });
  }

  useEffect(() => {
    set_cargando(true);
    console.log('[Historial] gContext.logeado completo:', gContext?.logeado);
    const customerIdSesion = gContext?.logeado?.data?.customer_id ?? gContext?.logeado?.data?.customerId ?? gContext?.logeado?.data?.client_id ?? gContext?.logeado?.data?.clientId ?? null;
    console.log('[Historial] customerId desde sesion:', customerIdSesion);
    set_customerId(customerIdSesion);
    console.log('Historial sid de sesion:', gContext.logeado?.token);

    axios.request({
      url: `${config.apiUrl}/api/app/getCustomerOfferList.php`,
      method: "post",
      data: {
        sid: gContext.logeado?.token
      }
    }).then(res => {
      set_cargando(false);
      if (res.data.status === "ER") {}
      if (res.data.status === "ERS") {
        localStorage.removeItem('arani_session_id');
        localStorage.removeItem('arani_session_data');
        gContext.set_logeado({
          estado: false,
          token: '',
          data: {}
        });
      }
      if (res.data.status === "OK") {
        set_dataObj(res.data.payload);
        const firstKey = Object.keys(res.data.payload || {})[0];
        const customerIdPayload = firstKey ? res.data.payload?.[firstKey]?.customer_id ?? res.data.payload?.[firstKey]?.customerId ?? null : null;
        if (customerIdPayload) {
          set_customerId(customerIdPayload);
          console.log('[Historial] customerId desde getCustomerOfferList:', customerIdPayload);
        }
      }
      if (res.data.status === 500) {

        // Manejo de error 500
      }
    }).catch(err => {
      navigate("/login");
    });
    // eslint-disable-next-line
  }, []);
  return <Container disableGutters sx={{
    minHeight: '100vh',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  }} component="main" maxWidth="md">
            <Box sx={{
      p: '4px',
      width: '100%'
    }}>
                <Paper elevation={6} sx={{
        p: 4
      }}>
                    <BarraApp />
                    <Button component={Link} to="/" variant="outlined" startIcon={<span className="material-symbols-outlined">arrow_back</span>}>Volver</Button>
                    {prestamosVisibles.length > 0 && <>
                        <Typography variant="h5" sx={{
            mt: 6
          }}>Historial</Typography>
                        <Typography variant="body2">Listado de todos los préstamos solicitados en Arani y sus estados.</Typography>
                        <Divider sx={{
            mt: 2
          }} />
                        <List sx={{
            width: '100%',
            bgcolor: 'background.paper'
          }}>
                            {prestamosVisibles.map(key => {
              const estado = nombreEstadoPrestamo[dataObj[key].status]; // Obtener el nombre del estado
              const nContainerId = dataObj[key].container_id ?? key;

              return <ListItemButton key={key} component='div' sx={{
                cursor: 'default'
              }}>

                                        <ListItemIcon>
                                            <span className="material-symbols-outlined">calendar_month</span>
                                        </ListItemIcon>
                                        <ListItemText primary={`Préstamo N. ${nContainerId} de L. ${numeral(dataObj[key].amount_limit).format("0,0.[00]")}`} secondary={moment(dataObj[key].created).format('LL')} />
                                        <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 1,
                  ml: 2
                }}>
                                            <Typography variant="body2" sx={{
                    color: estado === "Pagado" ? '#2e7d32' : 'inherit',
                    fontWeight: estado === "Pagado" ? 700 : 400
                  }}>{estado}</Typography>
                                          {estado === "Pagado" && <Button variant="outlined" size="small" disabled={enviandoFiniquitoId === nContainerId} onClick={event => enviarFiniquito(nContainerId, event)}>
                                            {enviandoFiniquitoId === nContainerId ? 'Enviando...' : 'Enviar finiquito'}
                                          </Button>}
                                        </Box>
                                    </ListItemButton>;
            })}
                        </List>
                    </>}
                    {prestamosVisibles.length === 0 && cargando && <Typography variant="body2" sx={{
          p: '4rem 0',
          color: 'silver',
          textAlign: 'center'
        }}>Cargando....</Typography>}
                    {prestamosVisibles.length === 0 && !cargando && <Typography variant="body2" sx={{
          p: '4rem 0',
          textAlign: 'center'
        }}>No hay nada que mostrar aún.</Typography>}
                    <Dialog open={popupFiniquito.open} onClose={cerrarPopupFiniquito}>
                      <DialogTitle>{popupFiniquito.title}</DialogTitle>
                      <DialogContent>
                        <Typography variant="body2">{popupFiniquito.message}</Typography>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={cerrarPopupFiniquito} autoFocus>Aceptar</Button>
                      </DialogActions>
                    </Dialog>
                </Paper>
                <BarraFinal />
            </Box>
        </Container>;
}
export default Historial;
