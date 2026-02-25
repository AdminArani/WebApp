import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Box, Container, Modal, Button, Chip, Dialog, DialogActions, DialogContent, TextField, Divider, Grid, List, ListItem, ListItemText, Paper, Typography, } from "@mui/material";
import axios from "axios";
import numeral from "numeral";
import moment from "moment";
import parse from "html-react-parser";
import config from "./config";
import { AppContext } from "./App";
import BarraApp from "./componentes/BarraApp";
import BarraFinal from "./componentes/BarraFinal";
import { nombreEstadoPrestamo, nombreEstadoPago } from "./componentes/utilidades.js";
import logobac from "./images/logoBaccuadro.jpg";

function Plan() {
    let { idprestamoparam } = useParams();
    const gContext = useContext(AppContext);
    const navigate = useNavigate();
    const [cargando, set_cargando] = useState(false);
    const [prestamoSeleccionado, set_prestamoSeleccionado] = useState(false);
    const [listaPagos, set_listaPagos] = useState(false);
    const [pagosrealizadosnum, set_pagosrealizadosnum] = useState(0);
    const [pricelistData, set_pricelistData] = useState(false);
    const [productsArr, set_productsArr] = useState(false);
    const [productoSeleccionado, set_productoSeleccionado] = useState(false);
    const [interesPeriodo, set_interesPeriodo] = useState(false);
    const [walletData, set_walletData] = useState(false);
    const [openSubirComprobantePago, set_openSubirComprobantePago] = useState(false);
    const [pagoseleccionado, set_pagoseleccionado] = useState(false);
    const [fDOCComprobante, set_fDOCComprobante] = useState(false);
    const [cargandoEnviandoComprobante, set_cargandoEnviandoComprobante] = useState(false);
    const [ventanaContrato, set_ventanaContrato] = useState(false);
    const [contratoPrestamo, set_contratoPrestamo] = useState(false);
    const [showAplicarLink, setShowAplicarLink] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [montoPago, setMontoPago] = useState('');
    const [numReferencia, setNumReferencia] = useState('');
    const [openModalComprobante, setOpenModalComprobante] = useState(false);
    const [openModalBAC, setOpenModalBAC] = useState(false);
    const [ setFDOCComprobante] = useState(null);
    const [setCargandoEnviandoComprobante] = useState(false);
    // --- N1co Payment Link ---
    const [openModalN1co, setOpenModalN1co] = useState(false);
    const [cargandoLinkN1co, setCargandoLinkN1co] = useState(false);
    const [errorLinkN1co, setErrorLinkN1co] = useState('');
    const [n1coLink, setN1coLink] = useState('');
    const [n1coAmount, setN1coAmount] = useState('');
    const [n1coPagoLabel, setN1coPagoLabel] = useState('');
    const [n1coOrderCode, setN1coOrderCode] = useState('');
    const [n1coOrderStatus, setN1coOrderStatus] = useState('');
    const [n1coInsertado, setN1coInsertado] = useState(false);
    const [n1coPaso, setN1coPaso] = useState('idle'); // idle | esperando | pagado | error

    const pollingRef = useRef(null);
    const popupRef = useRef(null);
    // --- N1co timers ---
    const [openModalEsperaN1co, setOpenModalEsperaN1co] = useState(false);
    const [msgEsperaN1co, setMsgEsperaN1co] = useState('');
    const [n1coExpiraEnSeg, setN1coExpiraEnSeg] = useState(null); // 600..0
    const [n1coCierreEnSeg, setN1coCierreEnSeg] = useState(null); // 30..0

    const n1coExpireIntervalRef = useRef(null);
    const n1coExpireTimeoutRef = useRef(null);
    const n1coCloseCountdownRef = useRef(null);

    

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                console.log(data);
    
                const ciudad = data.address.city || data.address.town || data.address.village || ''; // Cambio aquí
                const pais = data.address.country || '';
                setUbicacion(`${ciudad}, ${pais}`);
    
                // Lista de ubicaciones permitidas
                const ubicacionesPermitidas = [
                    "Tegucigalpa, Honduras",
                    "Comayagüela, Honduras",
                    "Valle de Angeles, Honduras",
                    "Choloma, Honduras",
                    "La Lima, Honduras",
                    "Villanueva, Honduras",
                    "Progreso, Honduras",
                    "San Pedro Sula, Honduras",
                    "Puerto Cortés, Honduras",
                    "El Progreso, Honduras",
                    "Danlí, Honduras",
                    "Choluteca, Honduras",
                    "Comayagua, Honduras",
                    "Siguatepeque, Honduras",
                    "La Ceiba, Honduras",
                    "Santa Rosa de Copán, Honduras",
                    "Gracias Lempira, Honduras"
                ];
    
                // Verificar si la ubicación coincide con alguna de las ubicaciones permitidas
                if (ubicacionesPermitidas.includes(`${ciudad}, ${pais}`)) { // Cambio aquí
                    setShowAplicarLink(true);
                }
            } catch (error) {
                console.error('Error al obtener la ubicación:', error);
            }
        });
    }, []);

    function getApplicationProfile(){
        axios.request({
            url: `${config.apiUrl}/api/app/getApplicationProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
              },
        })
        .then((res) => {
            if(res.data.status === "ER"){
                console.log(res.data.payload.message);
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                localStorage.removeItem('arani_session_data');
                gContext.set_logeado({estado: false, token: '', data: {}});
            }
            if(res.data.status === "OK"){
                
                set_productsArr(res.data?.payload?.Products);
                for (const key in res.data?.payload?.PriceList?.data?.pricelistData) {
                    if (Object.hasOwnProperty.call(res.data?.payload?.PriceList?.data?.pricelistData, key)) {
                        const element = res.data?.payload?.PriceList?.data?.pricelistData[key];
                        set_pricelistData(element);
                    }
                }
            }

        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
    }

    
    function cargarListaPrestamos(){
        if(cargando) return false;
        set_cargando(true);
        axios.request({
            url: `${config.apiUrl}/api/app/getCustomerOfferList.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
              },
        })
        .then((res) => {
            // set_cargando(false);
            if(res.data.status === "ER"){
                console.log(res.data.payload.message);
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                localStorage.removeItem('arani_session_data');
                gContext.set_logeado({estado: false, token: '', data: {}});
            }
            if(res.data.status === "OK"){
                // console.log(res.data.payload);
                // set_dataObj(res.data.payload);
                
                let elementThis = false;
                for (const key in res.data.payload) {
                    if (Object.hasOwnProperty.call(res.data.payload, key)) {
                        const element = res.data.payload[key];
                        if(idprestamoparam){
                            if(element.container_id+"" === idprestamoparam+""){
                                elementThis = element;
                            }
                        }else{
                            if(element.status === 3 || element.status === 1 || element.status === 8 || element.status === 5){
                                elementThis = element;
                            }
                        }
                    }
                }
                // console.log(elementThis.container_id);
                set_prestamoSeleccionado(elementThis);
                // console.log("prestamo seleccionado: ", elementThis);
                cargarCalendarioPagos(elementThis.container_id);
                set_contratoPrestamo(res.data.payload[elementThis.container_id]?.contract_content);
            }
            if(res.data.status === 500){
            }
        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
    }

    function cargarCalendarioPagos(idPrestamo){
        set_cargando(true);
        axios.request({
            url: `${config.apiUrl}/api/app/getBorrowerRepaymentSchedule.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                ContainerId: idPrestamo,
              },
        })
        .then((res) => {
            set_cargando(false);

            // Muestra la respuesta completa en la consola
            console.log('Respuesta completa:', res.data);

            if(res.data.status === "ER"){
                // console.log(res.data.payload.message);
            }
            if(res.data.status === "OK"){
                // console.log(res.data.payload);
                set_listaPagos(res.data.payload);
                console.log('lista de pagos: ', res.data.payload);
                // console.log('listado de pagos: ', res.data.payload);
                
                let numpagosrealizados = 0;
                for (const key in res.data.payload) {
                    if (Object.hasOwnProperty.call(res.data.payload, key)) {
                        const element = res.data.payload[key];
                        if(element.status === 6 || element.status === 1){
                            numpagosrealizados++;
                        }
                    }
                }
                set_pagosrealizadosnum(numpagosrealizados);
            }
        }).catch(err => {
            console.log(err.message);
            navigate("/login");
        });
    }

    // useEffect(()=>{
    //     cargarListaPrestamos();
    //     getApplicationProfile();
    //     cargarWallet();
    //     // eslint-disable-next-line
    // }, []);

    useEffect(()=>{
        cargarListaPrestamos();
        getApplicationProfile();
        cargarWallet();
        // eslint-disable-next-line
    }, [idprestamoparam]);

    useEffect(()=>{
        if(prestamoSeleccionado && pricelistData && productsArr){
            let productoSeleccionado = productsArr.find(element => element.ProCod+"" === prestamoSeleccionado.product_id+"")
            set_productoSeleccionado(productoSeleccionado);
            // console.log(productoSeleccionado);


            var interesPeriodo = pricelistData.interest;
            if(productoSeleccionado.ProTip === 'semanal') set_interesPeriodo(numeral(interesPeriodo/52.1429).format('0,0.00'));
            if(productoSeleccionado.ProTip === 'quincenal') set_interesPeriodo(numeral(interesPeriodo/26.0714).format('0,0.00'));
            if(productoSeleccionado.ProTip === 'mensual') set_interesPeriodo(numeral(interesPeriodo/12).format('0,0.00'));
            // console.log(prestamoSeleccionado);
            // console.log(pricelistData);
            // console.log(productsArr);
        }
        // eslint-disable-next-line
    }, [prestamoSeleccionado, pricelistData, productsArr]);



    function cargarWallet(){
        axios.request({
            url: `${config.apiUrl}/api/app/getWalletInfo.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
                },
        })
        .then((res) => {
            if(res.data.status === "ER"){
            }
            if(res.data.status === "OK"){
                set_walletData(res.data.payload.data);
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

   
    function guardarAdjuntarComprobante(){
        
        // sid: id de sesion
        // containerId: codigo de prestamo
        // DOC: documento a enviar
        const formData = new FormData();
        formData.append('DOC', fDOCComprobante);
        formData.append('sid', gContext.logeado?.token);
        formData.append('containerId', prestamoSeleccionado.container_id);
        formData.append('idpago', pagoseleccionado.id);

        // console.log(pagoseleccionado);
        set_cargandoEnviandoComprobante(true);

        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });
        axios.post(`${config.apiUrl}/api/app/send_recipemail.php`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        }).then((res) => {
            set_cargandoEnviandoComprobante(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "OK"){
                set_openSubirComprobantePago(false);
                set_fDOCComprobante(false);
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    const [fotoComprobante, setFotoComprobante] = useState(null);
    

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          setFotoComprobante(file);
        }
    };

    const handleMontoPagoChange = (event) => {
        setMontoPago(event.target.value); // Actualiza el estado cuando cambia el input
    };

    const [estadoReferencia, setEstadoReferencia] = useState('');

    const [clienteData, setClienteData] = useState(null);

    {/* Validar perfil en core  */}
    const validarPerfilEnCore = () => {
        return axios.request({
            url: `${config.apiUrl}/api/app/getProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
            },
        })
        .then((res) => {
            set_cargando(false);
            if (res.data.status === "OK") {
                console.log('usuarioDetalle', res.data.payload.data);
                const clienteData = res.data.payload.data;
                return clienteData;  // Retorna los datos del cliente para luego usarlos
            } else {
                console.log(res.data.payload.message);
                throw new Error('Error al validar perfil');
            }
        })
        .catch((err) => {
            console.log(err.message);
            navigate("/login");
            throw err; // Rechaza la promesa si ocurre un error
        });
    };
    
    const hoy = new Date();

    // Obtener la hora UTC
    const utcYear = hoy.getUTCFullYear();
    const utcMonth = hoy.getUTCMonth();
    const utcDay = hoy.getUTCDate();
    const utcHours = hoy.getUTCHours();

    const obtenerHoraActualUTC6 = () => {
        const ahora = new Date(); // Obtener la hora actual
        // console.log('Hora actual (UTC):', ahora.toUTCString()); // Verifica la hora actual en UTC
        const utc6 = new Date(ahora.getTime()); // Ajustar a UTC-6 sin modificar 'ahora'
        // console.log('Hora ajustada a UTC-6:', utc6.toString()); // Verifica la hora ajustada
        return utc6; // Retornar el objeto Date
    };
    
    const estaEnRango = () => {
        const hora = obtenerHoraActualUTC6().getHours(); // Obtener solo la hora
        return (hora >= 0 && hora < 20 ); // Habilita el botón si está entre 00:00 y 19:59
    };
    
    // Restar 6 horas a la hora UTC
    const fechaUTC6 = new Date(Date.UTC(utcYear, utcMonth, utcDay, utcHours - 6));

    // Extraer solo la fecha
    const fechaHoyUTC6 = fechaUTC6.toISOString().split('T')[0];

    const [openConfirmacionPago, setOpenConfirmacionPago] = useState(false);
    const [cargandoEnvio, setCargandoEnvio] = useState(false);
    const [exitoEnvio, setExitoEnvio] = useState(false);
    

    const handleNumReferenciaChange = async (event) => {
        // 1. Guardar solo lo que escribe el cliente, sin espacios
        const valorSinEspacios = event.target.value.replace(/\s/g, '');
        setNumReferencia(valorSinEspacios);

        if (!valorSinEspacios) {
            setEstadoReferencia('');
            return;
        }

        // 2. Concatenar con los datos del cliente y préstamo
        const referenciaConcatenada = `${clienteData?.customer_id}_${pagoseleccionado?.container_id}_${valorSinEspacios}`;
        console.log('Referencia concatenada:', referenciaConcatenada);

        // 3. Usar la referencia concatenada para validar en el API
        const params = new URLSearchParams({
            codigo: 'F1A672ACF37354D0EEAAB4F6574729AF',
            referencia: referenciaConcatenada
        });

        try {
            const response = await fetch(`https://app.aranih.com/api/app/getPagosReference.php?${params}`);
            const resultado = await response.text();

            if (resultado === '"existe"') {
                setEstadoReferencia('El comprobante con este número de referencia ya ha sido cargado, se actualizará tu foto de comprobante si se reenvía');
            } else {
                setEstadoReferencia('');
            }
        } catch (error) {
            setEstadoReferencia('Error validando');
        }
    };


    const [opcionSeleccionada, setOpcionSeleccionada] = useState('bac');
    const [element, setElement] = useState(null);

    const handleChange = (event) => {
        setOpcionSeleccionada(event.target.value);
    };

    const handleClick = () => {
        if (opcionSeleccionada === 'tigo') {
            set_openSubirComprobantePago(true);
            set_pagoseleccionado(element);
            set_fDOCComprobante(false);
        } else if (opcionSeleccionada === 'bac') {
            set_pagoseleccionado(element);
            handleOpenModal();
        }
    };

    const enviarComprobante = (clienteData) => {
        setCargandoEnvio(true);
        setExitoEnvio(false);
    
        const formData = new FormData();
        const nombreCompleto = [
            clienteData.realname,
            clienteData.midname,
            clienteData.midname2,
            clienteData.surname
        ].filter(Boolean).join(' ');
    
        const charge = parseFloat(pagoseleccionado.charge) || 0;
        const charge_covered = parseFloat(pagoseleccionado.charge_covered) || 0;
        const administratorFee = parseFloat(pagoseleccionado.administrator_fee) || 0;
        const administrator_fee_covered = parseFloat(pagoseleccionado.administrator_fee_covered) || 0;
        const amount = parseFloat(pagoseleccionado.amount) || 0;
        const amount_covered = parseFloat(pagoseleccionado.amount_covered) || 0;
        const lateFee = parseFloat(pagoseleccionado.late_fee) || 0;
        const late_fee_covered = parseFloat(pagoseleccionado.late_fee_covered) || 0;
        const penalty = parseFloat(pagoseleccionado.penalty_fee) || 0;
        const penalty_covered = parseFloat(pagoseleccionado.penalty_covered) || 0;
        const pago_date = new Date(pagoseleccionado.schedule_date);
        const schedule_date = pago_date.toISOString().split('T')[0];
        const now = new Date();
        const offset = 6 * 60 * 60 * 1000; // 6 horas en milisegundos
        const HoraHoy = new Date(now.getTime() - offset).toISOString().split('T')[1].split('.')[0]; // Solo la hora en formato HH:MM:SS
            
        const totalFee = charge - charge_covered + administratorFee - administrator_fee_covered + amount - amount_covered + lateFee - late_fee_covered + penalty - penalty_covered;

        formData.append('idCliente', clienteData.customer_id);
        formData.append('identidadCliente', clienteData.person_code);
        formData.append('nombreCliente', nombreCompleto);
        formData.append('correoElectronico', clienteData.email);
        formData.append('celular', clienteData.mob_phone);
        formData.append('numReferencia', numReferencia);
        formData.append('cuota', totalFee);
        formData.append('montoPago', parseFloat(montoPago).toFixed(2));
        formData.append('validado', 'pendiente');
        formData.append('descripcion', 'Pago_Bac');
        formData.append('comentario', 'Sin comentarios');
        formData.append('enviarMensaje', '0');
        formData.append('usuarioValidador_id', '3');
        formData.append('identificadorPago', pagoseleccionado.schedule_position);
        formData.append('identificadorPrestamo', pagoseleccionado.container_id);
        formData.append('fotoComprobante', fotoComprobante);
        formData.append('fechaPago', fechaHoyUTC6);
        formData.append('fechaCuota', schedule_date);
        formData.append('horaRegistro',HoraHoy);
    
        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });
    
        axios.post('https://app.aranih.com/api/chatbot/pagosBac/postBacPago.php', formData, {
            headers: {
                'Authorization': '70f5c0e10e6a43072595dc67c5ee4b2a68371abdc3c8438120d774ed9ac706aa',
                'Content-Type': 'multipart/form-data'
            },
        })
        .then((response) => {
            console.log('Respuesta de la API:', response.data);
            setFotoComprobante(null);
            setExitoEnvio(true);
            
            setTimeout(() => {
                setOpenModalBAC(false);
            }, 1000);
            
            setTimeout(() => {
                setExitoEnvio(false);
            }, 1000);
        })
        .catch((error) => {
            console.error('Error al enviar el comprobante:', error.response ? error.response.data : error.message);
            
            setTimeout(() => {
                setOpenModalBAC(false);
            }, 1000);
        })
        .finally(() => {
            setCargandoEnvio(false);
        });
    };
    
    
    // Manejar la apertura del modal:
    const handleOpenModal = () => {
        validarPerfilEnCore()
            .then((clienteData) => {
                setClienteData(clienteData);  // Guarda los datos del cliente para usarlos en el envío
                setOpenModalBAC(true);        // Abre el modal
            })
            .catch((err) => {
                console.error("Error al cargar el perfil del cliente:", err);
            });
    };

    useEffect(() => {
        if (exitoEnvio) {
            setOpenConfirmacionPago(true); // Abre el modal cuando exitoEnvio es true
            
            // Cierra el modal después de 3 segundos
            setTimeout(() => {
                setOpenConfirmacionPago(false);
            }, 5000);
        }
    }, [exitoEnvio]);
    

    function changefileComprobante(e){
        let file = e.target.files[0];
        set_fDOCComprobante(file);
    }
    

        const handleOpenModalN1co = async () => {
        let c = null;

        // 1) Cargar perfil (clienteData)
        try {
            c = await validarPerfilEnCore();
            setClienteData(c);
        } catch (e) {         
            setErrorLinkN1co("No se pudo cargar el perfil del cliente.");
            setOpenModalN1co(true);
            return;
        }

        // 2) Validar que haya listaPagos
        if (!Array.isArray(listaPagos) || listaPagos.length === 0) {
            setErrorLinkN1co("No hay calendario de pagos disponible.");
            setOpenModalN1co(true);
            return;
        }

        // 3) Consultar a la DB qué cuotas de N1co ya están registradas
        let cuotasPagadasDB = [];
        try {
            const body = new URLSearchParams({
            idCliente: String(c?.customer_id ?? ""),
            identificadorPrestamo: String(prestamoSeleccionado?.container_id ?? ""),
            }).toString();

            const res = await fetch("https://app.arani.hn/api/chatbot/pagosBac/getNicoCuotasPagadas.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                "Authorization": "70f5c0e10e6a43072595dc67c5ee4b2a68371abdc3c8438120d774ed9ac706aa",
            },
            body,
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.mensaje || "Error consultando cuotas en DB");

            cuotasPagadasDB = Array.isArray(data?.cuotasPagadas) ? data.cuotasPagadas : [];
        } catch (err) {
            setErrorLinkN1co(err?.message || "Error consultando cuotas en DB.");
            setOpenModalN1co(true);
            return;
        }

        // 4) Buscar el primer pago pendiente del CORE que NO esté registrado en DB como Pago_Nico
        //    cuotaN = schedule_position + 1  (1..4)
        const siguientePago = listaPagos.find((p) => {
            const st = parseInt(p.status, 10);
            const pendienteCore = st !== 1 && st !== 6;

            const sp = Number(p.schedule_position);
            const cuotaN = Number.isFinite(sp) ? sp + 1 : null;

            const noRegistradaEnDB = cuotaN && !cuotasPagadasDB.includes(cuotaN);

            return pendienteCore && noRegistradaEnDB;
        });

        // 5) Si no hay pagos disponibles (todo pagado o ya registrado)
        if (!siguientePago) {
            setN1coLink("");
            setN1coAmount("");
            setN1coPagoLabel("");
            setN1coOrderCode("");
            setN1coOrderStatus("");
            setN1coPaso("idle");
            setN1coInsertado(false);

            setErrorLinkN1co("Ya ha pagado todas las cuotas.");
            setOpenModalN1co(true);
            return;
        }

        // 6) Seleccionar esa cuota y armar UI
        set_pagoseleccionado(siguientePago);

        const idx = listaPagos.findIndex((p) => p.id === siguientePago.id);
        const pagoLabel = `Pago ${idx + 1} de ${listaPagos.length}`;
        setN1coPagoLabel(pagoLabel);

        const monto =
            (Number(siguientePago.charge) - Number(siguientePago.charge_covered)) +
            (Number(siguientePago.administrator_fee) - Number(siguientePago.administrator_fee_covered)) +
            (Number(siguientePago.amount) - Number(siguientePago.amount_covered)) +
            (Number(siguientePago.late_fee) - Number(siguientePago.cinterest_covered));

        const montoSeguro = isNaN(monto) ? 0 : monto;

        setN1coAmount(montoSeguro.toFixed(2));
        setN1coLink("");
        setErrorLinkN1co("");

        setN1coOrderCode("");
        setN1coOrderStatus("");
        setN1coPaso("idle");
        setN1coInsertado(false);

        setOpenModalN1co(true);
        };

        const validarVentana42hN1co = () => {
        if (!Array.isArray(listaPagos) || listaPagos.length === 0) {
            return { ok: true };
        }

        const createdMoments = listaPagos
            .map(p => p?.created)
            .filter(Boolean)
            .map(dt => moment(dt));

        // Si no hay created válido, no se bloquea.
        const validCreated = createdMoments.filter(m => m.isValid());
        if (validCreated.length === 0) {
            return { ok: true };
        }

        const createdMax = moment.max(validCreated); // el created más reciente
        const habilitaEn = createdMax.clone().add(42, 'hours');
        const ahora = moment();

        if (ahora.isSameOrAfter(habilitaEn)) {
            return { ok: true };
        }

        const dur = moment.duration(habilitaEn.diff(ahora));
        const horas = Math.floor(dur.asHours());
        const mins = dur.minutes();

        return {
            ok: false,
            habilitaEn,
            faltanTxt: `${horas}h ${String(mins).padStart(2, '0')}m`
        };
        };


        const extraerOrderCode = (paymentLinkUrl) => {
        try {
            return String(paymentLinkUrl).split('/').pop();
        } catch {
            return '';
        }
        };

        const consultarStatusN1co = async (orderCode) => {
        const res = await fetch("https://app.aranih.com/api/nico/GetStatus.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            token: "V3cFeaOiRmP4t2d8wrZMYxch5t4sdEIJeg6JXUeOFpiJ9ZIlcEM0f3YwlUXh0Sqs",
            orderCode
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Error consultando status");
        return data; // debe venir { orderStatus, ... }
        };

        const cerrarModalN1co = () => {
        limpiarTimersN1co();    
        setOpenModalN1co(false);
        setErrorLinkN1co('');
        setN1coLink('');
        setN1coOrderCode('');
        setN1coOrderStatus('');
        setN1coPaso('idle');

        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        };

        const limpiarTimersN1co = () => {
        if (n1coExpireIntervalRef.current) {
            clearInterval(n1coExpireIntervalRef.current);
            n1coExpireIntervalRef.current = null;
        }

        if (n1coExpireTimeoutRef.current) {
            clearTimeout(n1coExpireTimeoutRef.current);
            n1coExpireTimeoutRef.current = null;
        }

        if (n1coCloseCountdownRef.current) {
            clearInterval(n1coCloseCountdownRef.current);
            n1coCloseCountdownRef.current = null;
        }

        setN1coExpiraEnSeg(null);
        setN1coCierreEnSeg(null);
        };

        const iniciarTimersN1co = () => {
        limpiarTimersN1co();

        const total = 600;        // 10 min
        const warningAt = 30;     // mostrar warning cuando falten 30s

        setN1coExpiraEnSeg(total);
        setN1coCierreEnSeg(null);

        n1coExpireIntervalRef.current = setInterval(() => {
            setN1coExpiraEnSeg((prev) => {
            if (prev === null) return total;

            const next = prev > 0 ? prev - 1 : 0;

            // Cuando falten 30s, empieza el countdown visible 30..0
            if (next === warningAt) {
                setN1coCierreEnSeg(warningAt);

                // countdown visible (30..0)
                if (n1coCloseCountdownRef.current) {
                clearInterval(n1coCloseCountdownRef.current);
                n1coCloseCountdownRef.current = null;
                }

                n1coCloseCountdownRef.current = setInterval(() => {
                setN1coCierreEnSeg((p) => {
                    if (p === null) return warningAt;
                    return p > 0 ? p - 1 : 0;
                });
                }, 1000);
            }

            // Cuando llegue a 0, cerrar todo
            if (next === 0) {
                // stop polling
                if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
                }

                // parar interval principal
                if (n1coExpireIntervalRef.current) {
                clearInterval(n1coExpireIntervalRef.current);
                n1coExpireIntervalRef.current = null;
                }

                // parar countdown warning
                if (n1coCloseCountdownRef.current) {
                clearInterval(n1coCloseCountdownRef.current);
                n1coCloseCountdownRef.current = null;
                }

                setN1coPaso("error");
                setErrorLinkN1co("El tiempo del link expiró. Genera un nuevo link para intentar de nuevo.");

                // opcional: cerrar popup
                try { popupRef.current?.close?.(); } catch {}

                // cerrar modal
                cerrarModalN1co();
            }

            return next;
            });
        }, 1000);
        };


        const generarLinkN1co = async () => {
        try {
            setCargandoLinkN1co(true);
            setErrorLinkN1co('');
            setN1coLink('');
            setN1coOrderCode('');
            setN1coOrderStatus('');
            setN1coPaso('idle');

            const body = {
            token: "V3cFeaOiRmP4t2d8wrZMYxch5t4sdEIJeg6JXUeOFpiJ9ZIlcEM0f3YwlUXh0Sqs",
            nombre: "Pago ARANI",
            monto: Number(n1coAmount),
            descripcion: n1coPagoLabel
            };

            const res = await fetch("https://app.aranih.com/api/nico/GetUrl.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Error generando link de pago");

            const link = data?.paymentLinkUrl || data;
            if (!link) throw new Error("No se recibió el link de pago");

            setN1coLink(link);

            // Abrir solo el link (sin about:blank)
            popupRef.current = window.open(link, "_blank", "noopener,noreferrer");

            // Cambia modal a esperando
            const orderCode = extraerOrderCode(link);
            setN1coOrderCode(orderCode);
            setN1coPaso('esperando');
            iniciarTimersN1co();

            // 1er check inmediato
            const first = await consultarStatusN1co(orderCode);
            const st1 = String(first?.orderStatus || "").trim().toUpperCase();
            setN1coOrderStatus(st1);

            // Si ya no está pendiente, no cierres sin insertar
            if (st1 && st1 !== "PENDING") {
            const esFinalOK1 = st1 === "FINALIZED" || st1 === "FINISHED";

            if (esFinalOK1) {
                try {
                await enviarPostNicoPago(
                    { orderCode, orderStatus: st1, paymentLinkUrl: link },
                    { logRepeats: 5, logEveryMs: 300 } // 5 veces, cada 300ms
                    );

                setN1coPaso("pagado");
                limpiarTimersN1co();
                setTimeout(() => cerrarModalN1co(), 1500);
                } catch (e) {
                setN1coPaso("error");
                setErrorLinkN1co(e?.message || "Error insertando pago N1co");
                }
                return;
            }

            // Si cambió pero no fue exitoso
            setN1coPaso("error");
            setErrorLinkN1co(`El pago no se completó. Estado: ${st1}`);
            return;
            }

            // Polling cada 8 segundos
            if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            }

            pollingRef.current = setInterval(async () => {
                try {
                    const r = await consultarStatusN1co(orderCode);
                    const st = String(r?.orderStatus || "").trim().toUpperCase();
                    setN1coOrderStatus(st);

                    if (!st || st === "PENDING") return;

                    clearInterval(pollingRef.current);
                    pollingRef.current = null;

                    const esFinalOK = st === "FINALIZED" || st === "FINISHED";

                    if (esFinalOK) {
                    try {
                        await enviarPostNicoPago({
                        orderCode,
                        orderStatus: st,
                        paymentLinkUrl: link,
                        });

                        setN1coPaso("pagado");
                        setTimeout(() => cerrarModalN1co(), 2500);
                    } catch (e) {
                        setN1coPaso("error");
                        setErrorLinkN1co(e?.message || "Error insertando pago N1co");
                    }
                    return;
                    }

                    setN1coPaso("error");
                    setErrorLinkN1co(`El pago no se completó. Estado: ${st}`);
                } catch (e) {
                    setN1coPaso("error");
                    setErrorLinkN1co(e?.message || "Error consultando status");
                }
                }, 8000);



        } catch (err) {
            console.error(err);
            setN1coPaso('error');
            setErrorLinkN1co(err.message || "No se pudo generar el link de pago N1co.");
        } finally {
            setCargandoLinkN1co(false);
        }
        };

    const enviarPostNicoPago = async (
        { orderCode, orderStatus, paymentLinkUrl },
        opts = { logRepeats: 1, logEveryMs: 0 } // logRepeats > 1 para repetir logs
        ) => {
        // evita doble insert 
        if (n1coInsertado) return;

        if (!clienteData?.customer_id) {
            throw new Error("No hay clienteData (perfil) cargado.");
        }

        const nombreClienteConcat = [
            clienteData?.realname,
            clienteData?.midname,
            clienteData?.midname2,
            clienteData?.surname,
            ]
            .filter(Boolean)
            .join(" ");


        const sp = Number(pagoseleccionado?.schedule_position);
        const identificadorPagoCuota = Number.isFinite(sp) ? sp + 1 : null;

        // valida rango 1..4 
        if (!identificadorPagoCuota || identificadorPagoCuota < 1 || identificadorPagoCuota > 4) {
            throw new Error(
            `identificadorPago inválido: ${identificadorPagoCuota} (debe ser 1 a 4). schedule_position=${pagoseleccionado?.schedule_position}`
            );
        }

        const cuotaCalc =
            (Number(pagoseleccionado?.charge) - Number(pagoseleccionado?.charge_covered)) +
            (Number(pagoseleccionado?.administrator_fee) - Number(pagoseleccionado?.administrator_fee_covered)) +
            (Number(pagoseleccionado?.amount) - Number(pagoseleccionado?.amount_covered)) +
            (Number(pagoseleccionado?.late_fee) - Number(pagoseleccionado?.cinterest_covered));

        const cuota = isNaN(cuotaCalc) ? 0 : Number(cuotaCalc);

        const fechaCuota = pagoseleccionado?.schedule_date
            ? moment(pagoseleccionado.schedule_date).format("YYYY-MM-DD")
            : null;

        const horaRegistro = new Date(new Date().getTime() - 6 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[1]
            .split(".")[0];

        const orderStatusNorm = String(orderStatus || "").trim().toUpperCase();

        const payload = {
            orderStatus: orderStatusNorm,
            codigoOrden: orderCode,
            paymentLinkUrl,

            identificadorPrestamo: pagoseleccionado?.container_id ?? null,
            identificadorPago: identificadorPagoCuota, // CUOTA 1..4

            idCliente: clienteData?.customer_id ?? null,
            identidadCliente: clienteData?.person_code ?? null,
            nombreCliente: nombreClienteConcat,
            correoElectronico: clienteData?.email ?? null,
            celular: clienteData?.mob_phone ?? null,

            fechaPago: fechaHoyUTC6 ?? null,
            fechaCuota,
            horaRegistro,

            cuota: Number(cuota.toFixed(2)),
            montoPago: Number(Number(n1coAmount || 0).toFixed(2)),
        };

        // body x-www-form-urlencoded (para que $_POST funcione en PHP)
        const bodyStr = new URLSearchParams(
            Object.entries(payload).reduce((acc, [k, v]) => {
            acc[k] = v === null || v === undefined ? "" : String(v);
            return acc;
            }, {})
        ).toString();

        // logger repetible 
        const logRepeated = async (label, obj) => {
            const repeats = Math.max(1, Number(opts?.logRepeats || 1));
            const gap = Math.max(0, Number(opts?.logEveryMs || 0));

            for (let i = 1; i <= repeats; i++) {
            console.log(`[postNicoPago] ${label} (${i}/${repeats})`, obj);
            if (gap > 0 && i < repeats) {
                await new Promise((r) => setTimeout(r, gap));
            }
            }
        };

        await logRepeated("payload", payload);

        const res = await fetch("https://app.aranih.com/api/chatbot/pagosBac/postNicoPago.php", {
            method: "POST",
            headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "Authorization": "70f5c0e10e6a43072595dc67c5ee4b2a68371abdc3c8438120d774ed9ac706aa",
            },
            body: bodyStr,
        });

        let data = {};
        try {
            data = await res.json();
        } catch {
            data = {};
        }

        console.log("[postNicoPago] HTTP:", res.status, res.statusText);
        await logRepeated("resp", data);

        // Códigos:
        // 200 → { "mensaje": "Pago N1co ya registrado" }
        // 201 → { "mensaje": "Pago N1co registrado exitosamente" }
        // 400 → { "mensaje": "Faltan datos obligatorios" }
        // 401 → { "mensaje": "Token no válido" }
        // 409 → { "mensaje": "Pago N1co aún no finalizado" }
        // 500 → { "mensaje": "Error al registrar el pago N1co" }

        if (res.status === 201) {
            setN1coInsertado(true);
            return data;
        }

        if (res.status === 200) {
            // solo se trata como ya registrado
            if (data?.mensaje === "Pago N1co ya registrado") {
            setN1coInsertado(true);
            return data;
            }
            // si por alguna razón el backend manda 200 con otro mensaje, se trata como error lógico
            throw new Error(data?.mensaje || "Respuesta 200 inesperada");
        }

        if (res.status === 409) {
            throw new Error(data?.mensaje || "Pago N1co aún no finalizado");
        }

        if (res.status === 401) {
            throw new Error(data?.mensaje || "Token no válido");
        }

        if (res.status === 400) {
            throw new Error(data?.mensaje || "Faltan datos obligatorios");
        }

        // 500 u otros
        throw new Error(data?.mensaje || "Error al registrar el pago N1co");
        };


    function obtenerCalendarioPagos(containerId) {
        const apiKey = 'YLbU8nVhlaXu9jxMNsEDPY1rNBsa0ykV';
        const url = `https://aranih-com.creditonline.eu/api/v1.0/investment/borrower-repayment-schedule?apiKey=${apiKey}&containerId=${containerId}&preliminary=false`;
    
        axios.get(url)
            .then(response => {
                if (response.status === 200) {
                    console.log('Datos del calendario de pagos:', response.data);
                    // Aquí puedes manejar la respuesta y actualizar el estado según sea necesario
                    set_listaPagos(response.data.data);
                } else {
                    console.error('Error al obtener el calendario de pagos:', response.status);
                }
            })
            .catch(error => {
                console.error('Error al realizar la solicitud:', error);
            });
    }
    
    function obtenerFechaMasLejana(listaPagos) {
        if (!listaPagos || listaPagos.length === 0) return null;
        return listaPagos.reduce((max, pago) => {
            const fechaPago = moment(pago.schedule_date);
            return fechaPago.isAfter(max) ? fechaPago : max;
        }, moment(listaPagos[0].schedule_date));
    }

    useEffect(() => {
        if (prestamoSeleccionado) {
            obtenerCalendarioPagos(prestamoSeleccionado.container_id);
        }
    }, [prestamoSeleccionado]);
        
    return (
        <Container disableGutters sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"  }} component="main" maxWidth="md">
            {/* <Contrato /> */}
            <Box sx={{p: '4px', width: '100%'}}>
                <Paper elevation={6} sx={{p: 4}}>
                    <BarraApp />
                    <Button component={Link} to="/" variant="outlined" startIcon={<span className="material-symbols-outlined">arrow_back</span>}>Volver</Button>
                    {cargando && <Typography variant="body2" sx={{p: '8rem 0 8rem 0', color: 'silver', textAlign: 'center'}} >Cargando....</Typography>}
                    {(!cargando && prestamoSeleccionado) && <Box>
                        <Typography variant="h5" sx={{mt: 6}} >Información</Typography>
                        <Typography variant="body" sx={{}} >Resumen rápido del préstamo seleccionado:</Typography>

                        {(prestamoSeleccionado.status === 0) && <Typography variant="body2" sx={{color: '#26c926', paddingTop: '1rem'}}>Gracias por solicitar un préstamo con ARANI. Queremos informarte que hemos recibido tu solicitud y estamos trabajando en revisar la información que nos has proporcionado.</Typography>}
                        {(prestamoSeleccionado.status === 1) && <Typography variant="body2" sx={{color: '#26c926', paddingTop: '1rem'}}>Le informamos que su préstamo ha sido asignado a uno de nuestros agentes y actualmente se encuentra en proceso de validación. Nos esforzamos por asegurarnos de que cada préstamo sea revisado cuidadosamente para garantizar la mejor experiencia de préstamo posible.</Typography>}
                        {(prestamoSeleccionado.status === 5) && <Typography variant="body2" sx={{color: '#26c926', paddingTop: '1rem'}}>Le informamos que su préstamo ha sido asignado a uno de nuestros agentes y actualmente se encuentra en proceso de validación. Nos esforzamos por asegurarnos de que cada préstamo sea revisado cuidadosamente para garantizar la mejor experiencia de préstamo posible.</Typography>}
                        {(prestamoSeleccionado.status === 4) && <Typography variant="body2" sx={{color: '#26c926', paddingTop: '1rem'}}><b>Detalle:</b> Su préstamo ya ha sido pagado por completo.</Typography>}
                        {(prestamoSeleccionado.status === 2) && <Typography variant="body2" sx={{color: 'red', paddingTop: '1rem'}}>Le informamos que hemos revisado detalladamente la información que nos proporcionó para su solicitud de préstamo en línea, pero lamentablemente, su solicitud ha sido rechazada por uno de nuestros agentes.</Typography>}
                        

                        <div className="bloqueprestamopdt">
                            
                            <span className="material-symbols-outlined iconodefondogrande">payments</span>

                            <Grid container sx={{position: 'relative', zIndex: 2, mb: 2}}>
                                <Grid item xs={12} sm={6}>
                                    <Typography align="center" >Número de préstamo: {prestamoSeleccionado.container_id}</Typography>
                                </Grid>
                            </Grid>


                            <div className="bloqueprestamopdt-tit">
                                <span>Total a pagar</span>
                                <h4><span>Lps. </span>{numeral(prestamoSeleccionado.debt).format('0,0.00')}</h4>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{verticalAlign: 'middle'}} >Deposito por aplicar: <strong>Lps. {numeral(walletData?.amount_wallet_balance).format('0,0.00')}</strong></Typography>
                                </Grid>
                                <br></br>
                            </div>
                            <div className="bloqueprestamopdt-bar">
                                <div className="bloqueprestamopdt-barstatus">Pagos {pagosrealizadosnum} / {listaPagos.length}</div>
                                <div className="bloqueprestamopdt-barllena" style={{width: ((pagosrealizadosnum/listaPagos.length)*100)+"%"}}></div>
                            </div>
                            <br></br>
                            
                            <Box className="bloqueprestamopdt-dtll">
                                {/* <Chip size="small" label={"Creación: "+moment(prestamoSeleccionado.created).format("LL")} variant="outlined" sx={{color: "#FFFFFF"}} /> */}
                                <Chip size="small" label={"Interes "+productoSeleccionado.ProTip+": "+interesPeriodo+"%"} variant="outlined" sx={{color: "#FFFFFF"}} />
                                <Chip size="small" label={"Terminos: "+productoSeleccionado.ProTip} variant="outlined" sx={{color: "#FFFFFF"}} />
                                {/* {(prestamoSeleccionado.confirmed_date !== '0000-00-00 00:00:00') && <Chip size="small" label={"Aprobación: "+moment(prestamoSeleccionado.confirmed_date).format("LL")} variant="outlined" sx={{color: "#FFFFFF"}} />} */}
                                <Chip size="small" label={"Estado: "+nombreEstadoPrestamo[prestamoSeleccionado.status]} variant="outlined" sx={{color: "#FFFFFF"}} />
                            </Box>
   
                        </div>

                        <Box sx={{textAlign: 'right'}}><Button onClick={()=>{set_ventanaContrato(true)}}>Ver contrato</Button></Box>
                        

                        {walletData?.amount_wallet_balance >= prestamoSeleccionado.debt ? (
                        <div className="pago-completado">
                            <Typography 
                                variant="h5" 
                                sx={{
                                    mt: 6, 
                                    textAlign: 'center', 
                                    fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', 
            
                                    backgroundColor: '#EB9180',  
                                    padding: '20px', 
                                    borderRadius: '12px',  
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',  
                                    color: 'white',  
                                    fontWeight: 'bold', 
                                    fontSize: '1rem'  
                                }}
                            >
                                Tu préstamo ha sido pagado en su totalidad y está a la espera de ser cerrado
                                <br/>
                                la fecha: {moment(obtenerFechaMasLejana(listaPagos)).format("LL")}
                                <br/>
                                <br/>
                                <a href="https://www.arani.hn/erroresperfil.php#pagosadelantados" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>
                                    Ver más detalles
                                </a>
                            </Typography>
                        </div>
                    
                    
                        ) : (
                        <>
                            <br/>
                            <Typography 
                                variant="h8" 
                                sx={{ textAlign: 'justify', width: '100%' }}
                            >
                                Te recordamos que nuestro horario para recepción de comprobantes es de: <strong>8:00 am. -  8:00 pm.</strong> Cualquier pago recibido posterior a esas horas sera aplicado al día siguiente.
                                {moment(obtenerFechaMasLejana(listaPagos)).format("LL")}
                            </Typography>


                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 6 }}>
                            {/* Texto alineado a la izquierda */}
                            <Typography variant="h5">Plan de pagos</Typography>

                            {/* Botón alineado a la derecha */}
                            {listaPagos?.length > 0 && (
                                <Box
                                sx={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    gap: '12px', p: '12px',
                                }}
                                >
                                <Button
                                    onClick={() => {
                                    const primerPagoPendiente = listaPagos.find(p => parseInt(p.status) !== 1 && parseInt(p.status) !== 6);
                                    if (primerPagoPendiente) {
                                        set_pagoseleccionado(primerPagoPendiente);
                                        handleOpenModal();
                                    }
                                }}
                                variant="contained"
                                sx={{
                                    width: { xs: '220px', sm: '260px' },
                                    backgroundColor: 'red',
                                    color: 'white',
                                    fontSize: { xs: '0.75rem', sm: '1rem' }, // más pequeño en mobile
                                    padding: { xs: '4px 10px', sm: '8px 16px' }, // menos padding en mobile
                                    minWidth: { xs: '120px', sm: '180px' }, // ancho mínimo menor en mobile
                                    '&:hover': {
                                        backgroundColor: 'darkred',
                                        borderColor: 'darkred',
                                    },
                                }}
                                
                                disabled={!estaEnRango()}
                                >
                                    Enviar comprobante BAC
                                </Button>


                                 {/* BOTON DE NICO */}
                                <Button
                                onClick={() => {
                                    const v = validarVentana42hN1co();

                                    if (!v.ok) {
                                    setMsgEsperaN1co(
                                        `Aún no puedes realizar tu pago. Debes esperar 42 horas después del desembolso de tu préstamo.\n` +
                                        `Te faltan: ${v.faltanTxt}.\n` +
                                        `Disponible a partir de: ${v.habilitaEn.locale('es').format("D [de] MMMM [de] YYYY [a las] h:mm A")}`
                                    );
                                    setOpenModalEsperaN1co(true);
                                    return;
                                    }

                                    handleOpenModalN1co();
                                }}
                                variant="contained"
                                sx={{
                                    width: { xs: '220px', sm: '260px' },
                                    backgroundColor: 'black',
                                    color: 'white',
                                    fontSize: { xs: '0.75rem', sm: '1rem' }, // más pequeño en mobile
                                    padding: { xs: '4px 10px', sm: '8px 16px' }, // menos padding en mobile
                                    minWidth: { xs: '120px', sm: '180px' }, // ancho mínimo menor en mobile
                                    '&:hover': {
                                        backgroundColor: '#808080',
                                        borderColor: '#808080',
                                    },
                                }}
                                
                                disabled={!estaEnRango()}
                                >
                                    Pagar con Tarjeta 
                                </Button>

                                {!estaEnRango() && (
                                    <strong style={{ marginTop: '10px', color: 'black' }}>
                                    Fuera de horario operativo 😢
                                    </strong>
                                )}
                                </Box>
                            )}
                            </Box>

                            <Divider sx={{ mt: 2 }} />

                            {listaPagos && (
                            <>
                                {listaPagos.map((element, index) => (
                                <ListItem key={element.schedule_date} disablePadding className={"listitempagostatus" + element.status}>
                                    <ListItemText
                                    primaryTypographyProps={{ component: 'div', fontSize: '1.5rem' }}
                                    secondaryTypographyProps={{ component: 'div' }}
                                    primary={`Pago ${index + 1}/${listaPagos.length}`}
                                    secondary={
                                        <>
                                        <Typography variant="body2">
                                            Fecha de pago: {moment(element.schedule_date).format("LL")}
                                        </Typography>
                                        <Typography variant="body2">
                                            Estado: {(nombreEstadoPago[element.status] || element.status)}
                                        </Typography>
                                        <Typography variant="h6">
                                            <span>
                                            Lps. {numeral(
                                                element.charge - element.charge_covered +
                                                element.administrator_fee - element.administrator_fee_covered +
                                                element.amount - element.amount_covered +
                                                element.late_fee - element.cinterest_covered
                                            ).format("0,0.[00]")}
                                            </span>
                                        </Typography>
                                        </>
                                    }
                                    />
                                </ListItem>
                                ))}
                            </>
                            )}
                            {(!listaPagos) && 
                            <Typography variant="body2" sx={{m: '8rem 0', textAlign: 'center', color: 'silver'}} component={"div"} >No tienes lista de pagos</Typography>
                            }
                        </>
                        )}

                    </Box>}
                    <Dialog onClose={()=>{set_openSubirComprobantePago(false)}} open={openSubirComprobantePago}>
                    <DialogContent>
                        <Typography variant="h5">Subir archivo TIGO</Typography>
                        <Typography variant="body2" sx={{mb: 2}}>Adjunte su comprobante de pago Tigo Money.</Typography>
                        <Button disabled={Boolean(fDOCComprobante)} fullWidth variant="contained" component="label" startIcon={<span className="material-symbols-outlined">cloud_upload</span>}>
                            Adjuntar documento
                            <input onChange={changefileComprobante} hidden accept="image/*" multiple type="file" />
                        </Button>
                        <Typography variant="body2" sx={{mt: 2}}>Una vez enviado, será revisado por uno de nuestros agentes para validar que el pago se haya realizado correctamente.</Typography>
                        <Divider sx={{mb: 2, mt: 2}}></Divider>
                        <Button disabled={Boolean(!fDOCComprobante) || cargandoEnviandoComprobante} onClick={guardarAdjuntarComprobante} variant="contained">{(cargandoEnviandoComprobante)?"Subiendo....":"Enviar comprobante"}</Button>
                    </DialogContent>
                </Dialog>

                <Dialog open={openModalEsperaN1co} onClose={() => setOpenModalEsperaN1co(false)}>
                <DialogContent>
                    <Typography variant="h6">Pago con tarjeta no disponible aún</Typography>
                    <Typography variant="body2" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                    {msgEsperaN1co}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModalEsperaN1co(false)} variant="contained">
                    Entendido
                    </Button>
                </DialogActions>
                </Dialog>



                {/* Modal para N1co */}
                <Dialog
                open={openModalN1co}
                onClose={(event, reason) => {
                    // Bloquea cierre si está esperando (opcional)
                    if (n1coPaso === 'esperando') return;
                    cerrarModalN1co();
                }}
                >

                <DialogContent>
                <Typography variant="h5">Pago con N1co</Typography>

                {/* Muestra qué pago se está realizando */}
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 1 }}>
                    {n1coPagoLabel}
                </Typography>

                {/* Texto cambia según paso */}
                {n1coPaso === "idle" && (
                    <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
                    Genera tu link de pago para este pago pendiente.
                    </Typography>
                )}

                {n1coPaso === "esperando" && (
                    <Typography variant="body2" sx={{ mb: 2, mt: 1, fontWeight: "bold" }}>
                    Esperando respuesta de pago…
                    {n1coOrderStatus ? ` (Estado: ${n1coOrderStatus})` : ""}
                    <br />
                    No cierres esta ventana.
                    </Typography>
                )}

            {/* Cuenta regresiva total (10 min) */}
                    {n1coExpiraEnSeg !== null && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Link expira en:{" "}
                        <b>
                        {Math.floor(n1coExpiraEnSeg / 60)}:
                        {String(n1coExpiraEnSeg % 60).padStart(2, "0")}
                        </b>
                    </Typography>
                    )}

                    {/* Mensaje solo cuando falten 30s */}
                    {n1coCierreEnSeg !== null && (
                    <Typography
                        variant="body2"
                        sx={{ mt: 2, color: "red", fontWeight: "bold" }}
                    >
                        Esta ventana se cerrará en {n1coCierreEnSeg} segundos.
                        <br />
                        Si no realizaste el pago, no podrás volver a utilizar este link.
                    </Typography>
                    )}

                {n1coPaso === "pagado" && (
                    <Typography variant="body2" sx={{ mb: 2, mt: 1, fontWeight: "bold", color: "green" }}>
                    ✅ Pago recibido
                    </Typography>
                )}

                {/* Monto fijo (no editable) */}
                <TextField
                    label="Monto a pagar"
                    value={`L. ${n1coAmount}`}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{
                    mt: 1,
                    backgroundColor: "#f5f5f5",
                    }}
                />

                {errorLinkN1co && (
                    <Typography sx={{ mt: 2, color: "red" }}>
                    {errorLinkN1co}
                    </Typography>
                )}

                {n1coLink && (
                    <Typography sx={{ mt: 2, wordBreak: "break-all" }}>
                    Link generado: {n1coLink}
                    </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                    variant="contained"
                    onClick={generarLinkN1co}
                    disabled={cargandoLinkN1co || !n1coAmount || n1coPaso === "esperando" || n1coPaso === "pagado"}
                    >
                    {cargandoLinkN1co ? "Abriendo..." : (n1coPaso === "esperando" ? "Esperando..." : "Pagar")}
                    </Button>

                    {/* No dejar cerrar mientras está esperando */}
                    <Button
                    variant="outlined"
                    onClick={cerrarModalN1co}
                    disabled={n1coPaso === "esperando"}
                    >
                    Cerrar
                    </Button>
                </Box>
                </DialogContent>
                </Dialog>



                {/* Modal para BAC */}
                <Dialog open={openModalBAC} onClose={() => {
                    setOpenModalBAC(false);
                    setExitoEnvio(false); // Resetea el mensaje de éxito al cerrar el modal
                }}>
                <DialogContent>
                    <Typography variant="h5">Subir Archivo BAC</Typography>
                    <Typography variant="body2" sx={{mb: 2}}>Adjunte su comprobante de pago BAC.</Typography>
                    {/* Input para el montoPago */}
                    <TextField
                        label="Monto a Pagar"
                        value={montoPago}
                        onChange={handleMontoPagoChange}
                        type="number"
                        fullWidth
                        sx={{ mt: 2 }}
                    />

                    <TextField
                        label="Número de Referencia"
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
                    <Typography variant="body2" sx={{mt: 2}}>Una vez enviado, será revisado por uno de nuestros agentes para validar que el pago se haya realizado correctamente.</Typography>
                    
                    {/* Mostrar estado de envío */}
                    <div>
            {/* Mostrar estado de carga */}
            {cargandoEnvio && (
                <Typography variant="body2" sx={{ color: 'blue', mt: 2 }}>
                    Cargando...
                </Typography>
            )}

            {/* Modal de Confirmación de Pago */}
            <Modal
                open={openConfirmacionPago}
                onClose={() => setOpenConfirmacionPago(false)}
                aria-labelledby="confirmacion-pago-title"
                aria-describedby="confirmacion-pago-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 300,
                        bgcolor: '#4d5de9', // Color de fondo oscuro
                        boxShadow: 24,
                        p: 4,
                        borderRadius: '8px',
                        textAlign: 'center',
                        zIndex: 1300, // Asegúrate de que esté por encima de otros elementos
                    }}
                >
                    <img 
                        src={`${process.env.PUBLIC_URL}/logowhite.png`} 
                        alt="Logo" 
                        height={'100px'} 
                        width={'100px'} 
                        style={{ marginBottom: '16px' }} 
                    />
                    <Typography 
                        id="confirmacion-pago-title" 
                        variant="h6" 
                        component="h2" 
                        sx={{ color: 'white', fontWeight: 'bold' }}
                    >
                        ¡Comprobante enviado con éxito!
                    </Typography>
                </Box>
            </Modal>
        </div>

                    <Divider sx={{mb: 2, mt: 2}}></Divider>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                        <Button 
                            onClick={() => enviarComprobante(clienteData)}  // Usa los datos del cliente obtenidos previamente
                            disabled={!fotoComprobante} 
                            variant="contained" 
                        >
                            Enviar comprobante
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

                    {(!cargando && !prestamoSeleccionado) && <Box sx={{m: '8rem 0', textAlign: 'center', color: 'silver'}}>
                        <Typography variant="body2" sx={{maxWidth: '30rem', display: 'block', margin: '0 auto', pb: 3}} component={"div"} >No tienes préstamos aprobados aún, puedes solicitar un nuevo préstamo o ver el estado de tu solicitud.</Typography>
                        {(() => {
                        const fechaActual = new Date();
                        const fechaUTC6 = new Date(fechaActual.toLocaleString("en-US", { timeZone: "America/Tegucigalpa" }));
                        const mes = fechaUTC6.getMonth() + 1; // Los meses en JavaScript son base 0
                        const dia = fechaUTC6.getDate();

                        // Verificar si estamos en los días de feriado
                        const diasFeriado = [ 16,17, 18, 19];
                        const esFeriado = mes === 4 && diasFeriado.includes(dia);

                        if (esFeriado) {
                            return (
                                <p style={{ color: 'red' }}>
                                    Actualmente nos encontramos fuera de servicio por feriado de Semana Santa.
                                </p>
                            );
                        }

                        // return showAplicarLink ? (
                        //     <Button component={Link} to="/aplicar" variant="contained" sx={{ mr: 1 }}>
                        //         Aplicar
                        //     </Button>
                        // ) : (
                        //     <p style={{ color: 'red' }}>{errorMessage}</p>
                        // );
                    })()}
                        <Button component={Link} to="/historial" variant="contained">Historial</Button>
                    </Box>}
                </Paper>
                <BarraFinal />


                <Dialog open={ventanaContrato} onClose={()=>{set_ventanaContrato(false)}} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
                    {/* <DialogTitle id="alert-dialog-title">Contrato de préstamo Arani</DialogTitle> */}
                    <DialogContent>
                        {parse(contratoPrestamo||"<br><br>No hay contrato generado<br><br>")}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=>{set_ventanaContrato(false)}}>Cerrar</Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </Container>
    );
}

export default Plan;
