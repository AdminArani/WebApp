import config from '../config';
import Box from "@mui/material/Box";
// import logoArani from "./images/logoarani.png";
import React from 'react';
import { Button,InputAdornment, Checkbox, CircularProgress, Dialog, DialogTitle, DialogContentText,  DialogActions, DialogContent, Divider, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, TextField, Typography, useMediaQuery } from "@mui/material";
import { useContext, useEffect, useState } from "react";
// import axios from "axios";
import { AppContext } from "../App";
import axios from "axios";
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import 'dayjs/locale/es';
// import moment from "moment";
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from "@emotion/react";
import numeral from "numeral";
import parse from "html-react-parser";
import moment from "moment";
import { NumerosALetras } from 'numero-a-letras';

function Formulario({cerrarVentana, params, todobiencallback}) {
    const gContext = useContext(AppContext);
    const [botonEnviarHabilitado, set_botonEnviarHabilitado] = useState(false);
    const [seRegistro, set_seRegistro] = useState(false);
    const [yaIntentoEnviar, set_yaIntentoEnviar] = useState(false);
    const [enviandoAlApi, set_enviandoAlApi] = useState(false);

    const [inputCantidadDinero, set_inputCantidadDinero] = useState({valor: '', validado: false, textoAyuda: ""});
    const [inputPeriodo, set_inputPeriodo] = useState({valor: '', validado: false, textoAyuda: ""});
    const [inputProposito, set_inputProposito] = useState({valor: '', validado: false, textoAyuda: ""});
    const [listadoPeriodos, set_listadoPeriodos] = useState([]);
    const [interesPeriodo, set_interesPeriodo] = useState(false);
    
    const [ventanaContrato, set_ventanaContrato] = useState(false);
    const [ventanaPagare, set_ventanaPagare] = useState(false);
    const [inputAceptoContrato, set_inputAceptoContrato] = useState(false);
    const [inputAceptoPagare, set_inputAceptoPagare] = useState(false);
    const [openEditarBanco, set_openEditarBanco] = useState(false);
    const [diasPorPerSel, set_diasPorPerSel] = useState(false);
    const [inputAceptoBanco, set_inputAceptoBanco] = useState(false);

    const [usuarioDetalle, set_usuarioDetalle] = useState(false);
    const [contratoRaw, set_contratoRaw] = useState(false);
    const [pagareRaw, set_pagareRaw] = useState(false);
    const [contratoFinal, set_contratoFinal] = useState(false);
    const [pagareFinal, set_pagareFinal] = useState(false);
    const [validadoParaContrato, set_validadoParaContrato] = useState(false);
    const [openVentanaCalculadora, set_openVentanaCalculadora] = useState(false);
    const [cuota, setCuota] = useState(0); // Asegúrate de inicializar la cuota
    const [s_number, setSNumber] = useState(0); // Asegúrate de inicializar s_number
    const [totalPrestamo, setTotalPrestamo] = useState(0);
    
    
    // const [permisoP, set_permisoP] = useState(false);
    // const [cargandoPermisoP, set_cargandoPermisoP] = useState(false);

    
   
    function handleChange_inputCantidadDinero(event){
        let valor = numeral(event.target.value)._value;
        let validado = false;
        let minimoPermitido = numeral(params.pricelistData.PriMntDes)._value;
        let maximoPermitido = numeral(params.pricelistData.PriMntHas)._value;
        let texto = "Minimo L"+numeral(params.pricelistData.PriMntDes).format('0,0')+", máximo de L"+numeral(params.pricelistData.PriMntHas).format('0,0')+" y multiplo de 10.";
        
        if(valor >= minimoPermitido && valor <= maximoPermitido && (valor%10 === 0)){
            validado = true;
        }
        if(valor < minimoPermitido){
            validado = false;
            texto = 'El monto debe ser mayor o igual a L.' +numeral(params.pricelistData.PriMntDes).format('0,0'); // Agrega este mensaje cuando el valor es menor al mínimo permitido
        }
        if(valor > params.pricelistData.PriMntHas){
            validado = false;
        }
        set_inputCantidadDinero({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
        });
    }

    function handleChange_inputPeriodo(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(parseInt(valor) >= params.pricelistData.PriTerDes && parseInt(valor) <= params.pricelistData.PriTerHas){
            validado = true;
            texto = "";
        }
        if(parseInt(valor) < params.pricelistData.PriTerDes){
            validado = false;
            texto = "No debe ser menos de "+params.pricelistData.PriTerDes+".";
        }
        if(parseInt(valor) > params.pricelistData.PriTerHas){
            validado = false;
            texto = "No debe ser mayor de "+params.pricelistData.PriTerHas+".";
        }
        set_inputPeriodo({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
        });
    }

    function handleChange_inputProposito(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputProposito({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
        });
    }

    function getInformacionUsuario(callback){
        axios.request({
            url: `${config.apiUrl}/api/app/getProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
              },
        })
        .then((res) => {
            if(res.data.status === "ER"){
                // console.log(res.data.payload.message);
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                set_usuarioDetalle(res.data.payload.data);
            }
           
            if(typeof callback === 'function') callback();
        }).catch(err => {
            console.log(err.message);
        });
    }


    

    const [open, setOpen] = React.useState(false);

    // 2. Define las funciones para abrir y cerrar el modal
    const handleClickOpen = (e) => {
        e.stopPropagation();
        setOpen(true);
    };

    const handleClose = () => {
    setOpen(false);
    };

    useEffect(()=>{

        set_botonEnviarHabilitado(false);
        if( inputPeriodo.validado && inputCantidadDinero.validado && inputAceptoContrato && inputAceptoBanco  && inputAceptoPagare){
            set_botonEnviarHabilitado(true);
        }

        set_validadoParaContrato(false);
        if(inputPeriodo.validado && inputCantidadDinero.validado){
            set_validadoParaContrato(true);
        }

    }, [inputPeriodo, inputCantidadDinero, inputAceptoContrato, inputAceptoBanco, inputAceptoPagare]);
    
    useEffect(()=>{

        if(params.pricelistData && params.productSelected){

            
            let texto = "Minimo L"+numeral(params.pricelistData.PriMntDes).format('0,0')+", máximo de L"+numeral(params.pricelistData.PriMntHas).format('0,0');
            set_inputCantidadDinero({...inputCantidadDinero, textoAyuda: texto});


            // Listado de periodos para seleccionar
            // set_listadoPeriodos
            let tipo = params.productSelected.ProTip;
            let diasporper = 0;
            let cantidadperiodostxt = '';
            if(tipo === 'semanal') diasporper = 7;
            if(tipo === 'semanal') cantidadperiodostxt = 'semanas';
            if(tipo === 'quincenal') diasporper = 15;
            if(tipo === 'quincenal') cantidadperiodostxt = 'quincenas';
            if(tipo === 'mensual') diasporper = 30;
            if(tipo === 'mensual') cantidadperiodostxt = 'meses';
            set_diasPorPerSel(diasporper);
            // let diasmin = params.pricelistData.PriTerDes;
            let diasmax = params.pricelistData.PriTerHas;
            let persmax = diasmax / diasporper;
            let arrayPersSelect = [];
            for (let index = 1; index <= parseInt(persmax); index++) {
                arrayPersSelect.push(
                    <MenuItem key={index} value={(index*diasporper)}>{index} {cantidadperiodostxt}</MenuItem>
                );
            }
            set_listadoPeriodos(arrayPersSelect);

            // Sacamos el interes por periodo
            var interesPeriodo = params.pricelistData.PriInt;
            if(tipo === 'semanal') set_interesPeriodo((interesPeriodo/52.13).toFixed(2));
            if(tipo === 'quincenal') set_interesPeriodo((interesPeriodo/26.07).toFixed(10));
            if(tipo === 'mensual') set_interesPeriodo((interesPeriodo/12).toFixed(10));
            //52.13, 26.07 y 12 
        }

    // eslint-disable-next-line
    },[params]);

    //hola
    const [priCuo, setPriCuo] = useState(0);


    useEffect(() => {
        var contratoEditado = contratoRaw || "";
    
        // Reemplazos de valores de usuario
        contratoEditado = contratoEditado.replaceAll('%{realname}%', usuarioDetalle.realname?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{midname}%', usuarioDetalle.midname?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{surname}%', usuarioDetalle.surname?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{midname2}%', usuarioDetalle.midname2?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{ESTADO CIVIL}%', usuarioDetalle.marital_status?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{city}%', usuarioDetalle.county?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{CIUDAD}%', usuarioDetalle.county?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{region}%', usuarioDetalle.region?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{person_code}%', usuarioDetalle.person_code?.toUpperCase());
    
        // Convertir cantidad a letras y formato
        let cantidadEnLetras = NumerosALetras(inputCantidadDinero.valor, 'lempiras');
        cantidadEnLetras = cantidadEnLetras.replace(/\(/g, '').replace(/\)/g, '').replace('Pesos', '').replace('M.N.', 'Lempiras');
        contratoEditado = contratoEditado.replaceAll('%{amount}%', `${cantidadEnLetras} (${numeral(inputCantidadDinero.valor).format('0,0')} Lempiras)`);
    
        // Reemplazos de valores de contrato
        contratoEditado = contratoEditado.replaceAll('%{period}%', inputPeriodo.valor);
        contratoEditado = contratoEditado.replaceAll('%{s_number}%', (inputPeriodo.valor / diasPorPerSel).toFixed(2));
    
        let tipoDePago;
        if (diasPorPerSel === 7) tipoDePago = 'semanal';
        else if (diasPorPerSel === 15) tipoDePago = 'quincenal';
        else if (diasPorPerSel === 30) tipoDePago = 'mensual';
        else tipoDePago = 'desconocido';
    
        const interesAnual = params.pricelistData.PriInt || 'No tiene interes asignado'; 
        contratoEditado = contratoEditado.replaceAll('%{payment_type}%', tipoDePago.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{interest_anual}%', parseFloat(interesAnual).toFixed(2) + "%");
        contratoEditado = contratoEditado.replaceAll('%{interest}%%', parseFloat(interesPeriodo).toFixed(2) + "%");
        contratoEditado = contratoEditado.replaceAll('%{created_day}%', moment().format('DD'));
        contratoEditado = contratoEditado.replaceAll('%{NOMBRE MES}%', moment().format('MMMM')?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{AÑO}%', moment().format('YYYY'));
    
        // Capturar la fecha actual
        const fechaActual = moment().format('YYYY-MM-DD');
        
        // Calcular fecha final
        const fechaFinal = moment().add(diasPorPerSel, 'days').format('DD-MM-YYYY');
        contratoEditado = contratoEditado.replaceAll('%{fecha_final}%', fechaFinal);
    
        // Obtener el tipo de PriCuoTip y el valor de PriCuo
        const priCuoTip = params.pricelistData.PriCuoTip || 'Cliente no existe';
        const priCuoRaw = params.pricelistData.PriCuo || '0';
        const cantidadDinero = parseFloat(inputCantidadDinero.valor) || 0;

        // Calcula el valor de priCuo según el tipo
        if (priCuoTip === 'Cantidad fija') {
            // Si es una cantidad fija, usa el valor de priCuoRaw directamente
            setPriCuo(parseFloat(priCuoRaw) || 0);
        } else if (priCuoTip === 'Porcentaje del importe mensual') {
            // Si es un porcentaje, calcula el monto sobre cantidadDinero
            const porcentajeDecimal = priCuoRaw / 100;
            setPriCuo(porcentajeDecimal);
            
        } else {
            // Si el tipo no es válido, establece priCuo en 0 o maneja el error
            setPriCuo(0); // O puedes mostrar un mensaje de error si lo prefieres
        }

        // Calcular cargos administrativos usando PriCuo
        const s_number = inputPeriodo.valor / diasPorPerSel;
        const cargosAdministrativos = priCuo;
    
        // Calcular interés total
        const monto = parseFloat(inputCantidadDinero.valor);
        const tasaInteresDecimal = parseFloat(interesPeriodo) / 100;
        const interesTotal = monto * tasaInteresDecimal * s_number;

        // Calcula el numerador
        const numerador = (1 + tasaInteresDecimal) ** s_number * tasaInteresDecimal;
        const numeradorRedondeado = numerador.toFixed(9); // Redondea a 9 decimales

        const denomidador = (1 + tasaInteresDecimal) ** s_number - 1;
        const denomidadorRedondeado = denomidador.toFixed(9); // Redondea a 9 decimales     // Muestra el valor calculado

        //Cuota mensual 
        const CuotaMensual = monto * (numerador / denomidador);

        const CargoAdministrativoxCuota = cargosAdministrativos / s_number;

        // Calcular monto total
        const cantidadTotal = monto;
    
        // Calcular cuota
        const calculoCuota = CuotaMensual + CargoAdministrativoxCuota;
        

        // Calcula el valor de calculo administrativo
        if (priCuoTip === 'Cantidad fija') {
            // Si es una cantidad fija, usa el valor de priCuoRaw directamente
            setPriCuo(parseFloat(priCuoRaw) || 0);
        } else if (priCuoTip === 'Porcentaje del importe mensual') {
            // Si es un porcentaje, calcula el monto sobre cantidadDinero
            const porcentajeDecimal = priCuoRaw / 100;
            setPriCuo(porcentajeDecimal);
            
        } else {
            // Si el tipo no es válido, establece priCuo en 0 o maneja el error
            setPriCuo(0); // O puedes mostrar un mensaje de error si lo prefieres
        }
  

        const cargosadminprueba = monto * priCuo/30 * inputPeriodo.valor/s_number.toFixed(2);
        const cargosAdmExistente = cargosadminprueba.toFixed(1);


        const CuotaMensualNumerico = parseFloat(CuotaMensual.toFixed(2));
        const cargosAdmExistenteNumerico = parseFloat(cargosAdmExistente);

        let cuota;
        let totalprestamo;

        if (priCuoTip === 'Cantidad fija') {
            // Si es 'Cantidad fija', usa calculoCuota
            cuota = parseFloat(calculoCuota.toFixed(2));
        } else if (priCuoTip === 'Porcentaje del importe mensual') {
            cuota = CuotaMensualNumerico + cargosAdmExistenteNumerico;
        } else {
            console.log("No hay cuota administrativa");
            cuota = 0; // Valor por defecto si el tipo de cuota no es reconocido
        }

        // Actualiza el estado con el valor calculado
        setCuota(cuota);
        setBank(totalprestamo);

        const totalPrestamo = cuota * s_number;

        contratoEditado = contratoEditado.replaceAll('%{cuota}%', `${numeral(cuota).format('0,0.00')} Lempiras`);
    
        set_contratoFinal(contratoEditado);
        // eslint-disable-next-line
        setTotalPrestamo(cuota * s_number);
    }, [usuarioDetalle, contratoRaw, inputAceptoContrato, cuota, s_number]);
    


    const change_inputVerAceptoContrato = (e)=>{
        set_inputAceptoContrato(e.target.checked);
        if(e.target.checked){
            set_ventanaContrato(true);
        }
    }

    const change_inputAceptoContrato = (e)=>{
        set_inputAceptoContrato(e.target.checked);
    }

    const cargarContratoTemplate = ()=>{
        axios.request({
            url: `${config.apiUrl}/api/app/get_contractPre.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
              },
        })
        .then((res) => {
            if(res.data.status === "OK"){
                for (const key in res.data.payload.data) {
                    if (Object.hasOwnProperty.call(res.data.payload.data, key)) {
                        const element = res.data.payload.data[key];
                        set_contratoRaw(element.document_template);
                    }
                }
            }
        }).catch(err => {
            console.log(err.message);
            
        });
    }

    // Pagare logica

    useEffect(() => {

        var pagareEditado = pagareRaw || '';
    
        pagareEditado = pagareEditado.replaceAll('%{realname}%', usuarioDetalle.realname?.toUpperCase());
        pagareEditado = pagareEditado.replaceAll('%{midname}%', usuarioDetalle.midname?.toUpperCase());
        pagareEditado = pagareEditado.replaceAll('%{surname}%', usuarioDetalle.surname?.toUpperCase());
        pagareEditado = pagareEditado.replaceAll('%{midname2}%', usuarioDetalle.midname2?.toUpperCase());
    
        pagareEditado = pagareEditado.replaceAll('%{ESTADO CIVIL}%', usuarioDetalle.marital_status?.toUpperCase());
        pagareEditado = pagareEditado.replaceAll('%{city}%', usuarioDetalle.county?.toUpperCase());
        pagareEditado = pagareEditado.replaceAll('%{CIUDAD}%', usuarioDetalle.county?.toUpperCase());
        pagareEditado = pagareEditado.replaceAll('%{region}%', usuarioDetalle.region?.toUpperCase());
    
        pagareEditado = pagareEditado.replaceAll('%{person_code}%', usuarioDetalle.person_code?.toUpperCase());
    
        pagareEditado = pagareEditado.replaceAll('%{amount}%', numeral(inputCantidadDinero.valor).format('0,0'));
        pagareEditado = pagareEditado.replaceAll('%{period}%', inputPeriodo.valor);
        pagareEditado = pagareEditado.replaceAll('%{s_number}%', inputPeriodo.valor / diasPorPerSel);


        const interesAnual = params.pricelistData.PriInt || 'No tiene interes asignado';
        pagareEditado = pagareEditado.replaceAll('%{interest}%%', parseFloat(interesPeriodo).toFixed(2)+"%");
        pagareEditado = pagareEditado.replaceAll('%{interest_anual}%', parseFloat(interesAnual).toFixed(2) + "%");
        pagareEditado = pagareEditado.replaceAll('%{created_day}%', moment().format('DD'));
        pagareEditado = pagareEditado.replaceAll('%{NOMBRE MES}%', moment().format('MMMM')?.toUpperCase());
        pagareEditado = pagareEditado.replaceAll('%{AÑO}%', moment().format('YYYY'));
        
        // Aquí reemplazas totalPago con el totalPrestamo calculado
        pagareEditado = pagareEditado.replaceAll('%{totalPago}%', `${numeral(totalPrestamo.toFixed(2)).format('0,0.00')} Lempiras`);
    
        set_pagareFinal(pagareEditado);

      }, [usuarioDetalle, pagareRaw, inputAceptoPagare, inputCantidadDinero, inputPeriodo, diasPorPerSel, interesPeriodo, totalPrestamo]);
    
      const change_inputVerAceptoPagare = (e) => {
        set_inputAceptoPagare(e.target.checked);
        if (e.target.checked) {
          set_ventanaPagare(true);
        }
      };
    
      const change_inputAceptoPagare = (e) => {
        set_inputAceptoPagare(e.target.checked);
      };
    
      const cargarPagareTemplate = () => {
        axios
          .request({
            url: `${config.apiUrl}/api/app/get_pagarePre.php`,
            method: 'post',
            data: {
              sid: gContext.logeado?.token,
            },
          })
          .then((res) => {
            if (res.data.status === 'OK') {
              for (const key in res.data.payload.data) {
                if (Object.hasOwnProperty.call(res.data.payload.data, key)) {
                  const element = res.data.payload.data[key];
                  set_pagareRaw(element.document_template);
                }
              }
            }
          })
          .catch((err) => {
            console.log(err.message);
          });
      };
    
      useEffect(() => {
        cargarPagareTemplate();
      }, []);



    function enviarInformacionAlApi() {
        set_enviandoAlApi(true);
        axios.request({
            url: `${config.apiUrl}/api/app/postOffer.php`,
            method: "post",
            withCredentials: true,
            data: {
                sid: gContext.logeado.token,
                period: inputPeriodo.valor,
                amount: inputCantidadDinero.valor,
                purpose: inputProposito.valor,
                productId: params.productSelected.ProCod,
            },
        })
        .then((res) => {
            set_enviandoAlApi(false);
            if(res.data.status === "ER"){
                // set_seRegistro(true);
            }
            if(res.data.status === "OK"){
                set_seRegistro(true);
                handleClickOpen(); // Abre el modal
            }
        }).catch(err => {
            set_enviandoAlApi(false);
            set_seRegistro(true);
            console.log(err.message);
        });
    }

    useEffect(()=>{
        getInformacionUsuario();
        cargarContratoTemplate();
        cargarPagareTemplate();
        // eslint-disable-next-line
    },[])

    // Define el estado al inicio de tu componente
    const [cantidadSolicitada,setCantidadSolicitada] = useState(0);
    const [intereses, setIntereses] = useState(0);
    const [gastosAdministrativos, setGastosAdministrativos] = useState(0);
    const [totalAPagar, setTotalAPagar] = useState(0);
    const [pagosARealizar, setPagosARealizar] = useState(0);
    const [pagos, setPagos] = useState([]);

    useEffect(() => {
        function factura(){
            axios.request({
                url: `${config.apiUrl}/api/app/getFactura.php`,
                method: "post",
                data: {
                    sid: gContext.logeado?.token,
                  },
            })
            .then(response => {
                 if (response.status !== 200) {
                     throw new Error(`HTTP error! status: ${response.status}`);
                 }
                 return response.data;
             })
             .then(data => {
                 setCantidadSolicitada(data.cantidadSolicitada);
                 setIntereses(data.intereses);
                 setGastosAdministrativos(data.gastosAdministrativos);
                 setTotalAPagar(data.totalAPagar);
                 setPagosARealizar(data.pagosARealizar);
                 setPagos(data.pagos);
             })
             .catch(error => console.error('Error:', error));
        }
    
        const intervalId = setInterval(factura, 1000); // Ejecuta factura cada 1000 ms (1 segundo)
    
        return () => clearInterval(intervalId); // Limpia el intervalo cuando el componente se desmonta
    }, [gContext.logeado?.token]);

    function numeroAOrdinal(numero) {
        const ordinales = [
            'Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto', 
            'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo',
            'Undécimo', 'Duodécimo', 'Decimotercero', 'Decimocuarto', 'Decimoquinto',
            'Decimosexto', 'Decimoséptimo', 'Decimooctavo', 'Decimonoveno', 'Vigésimo',
            'Vigésimo Primero', 'Vigésimo segundo', 'Vigésimo Tercero', 'Vigésimo Cuarto', 'Vigésimo Quinto',
            'Vigésimo Sexto', 'Vigésimo Séptimo', 'Vigésimo Octavo', 'Vigésimo Noveno', 'Trigésimo',
            'trigésimo Primero', 'Trigésimo Segundo', 'Trigésimo Tercero', 'Trigésimo Cuarto', 'Trigésimo Quinto', 'Trigésimo Sexto'
        ];
        return numero <= 36 ? ordinales[numero - 1] : numero + 'º';
    }

    const [inputCuentaBanco, set_inputCuentaBanco] = useState({ valor: '', validado: false });
    const [inputBanco, set_inputBanco] = useState({ valor: '', validado: false });
    const [validado, set_validado] = useState(false);
    const [bank, setBank] = useState(null); // Estado para el valor del banco
    const [nombreBanco, setNombreBanco] = useState(''); // Estado para el nombre del banco

    const cargarCuentaBanco = () => {
        axios.request({
            url: `${config.apiUrl}/api/app/get_bankaccount.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
            },
        })
        .then((res) => {
            if (res.data.status === "OK") {
                let cuentaActiva = false;
                for (const key in res.data.payload?.data) {
                    if (Object.hasOwnProperty.call(res.data.payload?.data, key)) {
                        const element = res.data.payload?.data[key];
                        if (element.current === '1') {
                            cuentaActiva = element;
                        }
                    }
                }

                set_inputCuentaBanco({
                    ...inputCuentaBanco,
                    valor: cuentaActiva.account_number,
                    validado: true
                });
                set_inputBanco({
                    ...inputBanco,
                    valor: cuentaActiva.bank,
                    validado: true
                });
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    const fetchInformacionUsuario = () => {
        axios.request({
            url: `${config.apiUrl}/api/app/getProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
            },
        })
        .then((res) => {
            if (res.data.status === "OK") {
                const bankValue = res.data.payload.data?.bank; // Verificar si `data` existe
                if (bankValue !== undefined && bankValue !== null) {
                    setBank(bankValue);
                } else {
                    console.warn('Valor del banco no disponible en la respuesta');
                }
            }
        })
        .catch(err => {
            console.log('Error en la solicitud:', err.message);
        });
    };

    const obtenerNombreBanco = (valorBanco) => {
        switch (parseInt(valorBanco)) {
            case 1: return 'Bac Credomatic';
            case 2: return 'Banco Atlantida';
            case 3: return 'Banco Azteca';
            case 4: return 'Banco Banrural';
            case 5: return 'Banco Davivienda';
            case 6: return 'Banco de Honduras';
            case 7: return 'Banco de los Trabajadores';
            case 8: return 'Banco de Occidente';
            case 9: return 'Banco del Pais';
            case 10: return 'Banco Ficensa';
            case 11: return 'Banco Hondureño del Café';
            case 12: return 'Banco Lafise';
            case 13: return 'Banco Popular';
            case 14: return 'Banco Promerica';
            case 15: return 'Banco Ficohsa';
            case 16: return 'Tigo Money';
            default: return 'Banco No Registrado';
        }
    };

    useEffect(() => {
        // Inicializar el intervalo para consultar cada segundo
        const intervalId = setInterval(() => {
            fetchInformacionUsuario();
        }, 1000);

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        // Solo actualizar el nombre del banco cuando `bank` cambie y sea válido
        if (bank !== null && bank !== undefined) {
            const nombre = obtenerNombreBanco(bank);
            setNombreBanco(nombre);
        }
    }, [bank]);

    
    
    const esPantallaPequeña = useMediaQuery('(max-width:600px)');
      
    useEffect(() => {
        cargarCuentaBanco();
        getInformacionUsuario(() => {
            cargarCuentaBanco();
        });
        // eslint-disable-next-line
    }, []);
    
    useEffect(() => {
        if (inputCuentaBanco?.validado && inputBanco.validado) {
            set_validado(true);
        } else {
            set_validado(false);
        }
        // eslint-disable-next-line
    }, [inputCuentaBanco, inputBanco]);

    const botones = [
    {
        label: "Acepto el contrato",
        checked: inputAceptoContrato,
        onChange: change_inputAceptoContrato
    },
    {
        label: "Acepto el pagare",
        checked: inputAceptoPagare,
        onChange: change_inputAceptoPagare
    }
    
];

    return (
        <Box style={{
            padding: 'none', 
            margin: '0px', 
            width: '100%', 
            '@media (min-width:600px)': { 
                width: '600px', 
                marginLeft: '-24px', 
                marginRight: '-24px'
            }
        }}>
            
            <Box>
                {enviandoAlApi &&
                    <div>
                        <Typography variant="body1" sx={{pt: 1, pb: 3}} >Enviando....</Typography>
                    </div>
                }
                {(!enviandoAlApi && seRegistro) &&
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999 // Asegúrate de que esté por encima de otros elementos
                }}>
                    <div style={{
                        width: esPantallaPequeña ? '100%' : '400px',
                        margin: '0%',
                        backgroundColor: 'white', // Fondo blanco para el contenido
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        boxSizing: 'border-box',
                    }}>
                        <Typography variant="h5" sx={{pt: 1, pb: 0}} style={{fontSize: '18px',textAlign: 'center', fontWeight: 'bold'}}>Resumen de tu préstamo</Typography>
                        <br/>
                        <Box style={{backgroundColor: '#dcdcdc', boxSizing: 'border-box', marginLeft: '-20px', marginRight: '-20px'}}>
                            <div style={{padding: '10px', paddingTop: '2px', marginLeft: '30px', marginRight:'24px'}}>
                                <br/>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography variant="body2" style={{fontSize: '16px', fontWeight: 'bold'}}>Cantidad solicitada: </Typography>
                                    <Typography variant="body2" style={{fontSize: '16px'}}>L {numeral(cantidadSolicitada).format('0,0.00')}</Typography>
                                </div>
                                <br/>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography variant="body2" style={{fontSize: '16px', fontWeight: 'bold'}}>Interes:</Typography>
                                    <Typography variant="body2" style={{fontSize: '16px'}}>L {numeral(intereses).format('0,0.00')}</Typography>
                                </div>
                                <br/>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography variant="body2" style={{fontSize: '16px', fontWeight: 'bold'}}>Gastos administrativos: </Typography>
                                    <Typography variant="body2" style={{fontSize: '16px'}}>L {numeral(gastosAdministrativos).format('0,0.00')}</Typography>
                                </div>
                                <br/>
                                <Divider sx={{ mb: 1, mt: 1 }}></Divider>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography variant="body2" style={{fontSize: '16px', fontWeight: 'bold'}}>Total a Pagar: </Typography>
                                    <Typography variant="body2" style={{fontSize: '16px'}}>L {numeral(totalAPagar).format('0,0.00')}</Typography>
                                </div>
                            </div>
                            <br/>
                        </Box>
                
                        <Box style={{padding: '0',boxSizing: 'border-box', margin: '35px'}}>
                            <div>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <div>
                                        <Typography variant="body2" style={{fontSize: '16px', fontWeight: 'bold'}}>Pagos a realizar: </Typography>
                                        <Typography variant="body2" style={{fontSize: '12px'}}>{`Solicitaste un plazo de ${pagosARealizar} semanas`}</Typography>
                                    </div>
                                    <Typography variant="body2" style={{fontSize: '16px'}}>{(pagosARealizar)}</Typography>
                                </div>
                                <br/>
                                {pagos && pagos.map((pago, index) => (
                                    <div key={index} style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <div>
                                            <Typography variant="body2" style={{fontSize: '16px', color: '#647cf8', fontWeight: 'bold'}}>{numeroAOrdinal(index + 1)} pago: </Typography>
                                            <Typography variant="body2" style={{fontSize: '12px'}}>{pago.fechaDePago}</Typography>
                                            <br/>
                                        </div>
                                        <Typography variant="body2" style={{fontSize: '16px', fontWeight: 'bold'}}>L {numeral(pago.cantidad).format('0,0.00')}</Typography>
                                    </div>
                                ))}
                            </div>
                        </Box>
                            
                        <div 
                            style={{
                                display:'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                            }}
                        >
                            <br/>
                            <br/>
                            <br/>
                            <Button 
                                onClick={todobiencallback} 
                                variant="contained" 
                                sx={{ mt: 1, mr: 1 }} 
                                style={{
                                        backgroundColor: '#647cf8',
                                        textAlign: 'center',
                                        alignItems: 'center',
                                        color: 'white',
                                        height: '40px',
                                        width: '35%',
                                        marginTop: '10px',
                                        fontSize: '12px',
                                        boxShadow: 'none',
                                        border: '1px solid grey',
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        marginLeft: '10px',
                                        padding: '4px',
                                        fontWeight: 'bold',
                                        '@media (max-width:600px)': { 
                                            width: '50%',
                                            fontSize: '16px',
                                            height: '40px', 
                                        }
                                }}
                            >
                                Finalizar
                            </Button>
                        </div>
                    </div>
                </div>
                
                }
                {(!enviandoAlApi && !seRegistro) && 
                <div>
                <br/>
                <Typography variant="body2" sx={{}} align="center" style={{fontWeight: 'bold', fontSize: '18px'}}>Llena los siguientes campos para solicitar tu préstamo:</Typography>
            
                <Grid sx={{mt: 1, mb: 1}} container spacing={3} style={{padding: '25px'}}>
                    <Grid item xs={12} sm={6} style={{display: 'flex', alignItems: 'flex-start'}}>
                        <Typography variant="h6" style={{fontWeight: 'bold', marginRight: '20px', marginTop: '10px'}}>1.</Typography>
                        <TextField 
                            error={inputCantidadDinero.valor && !inputCantidadDinero.validado}
                            helperText={!inputCantidadDinero.valor ? inputCantidadDinero.textoAyuda : (!inputCantidadDinero.validado ? inputCantidadDinero.textoAyuda : '')}
                            required value={inputCantidadDinero.valor} 
                            onChange={handleChange_inputCantidadDinero} 
                            autoComplete="off" 
                            fullWidth 
                            label="Cantidad de dinero" 
                            variant="outlined"
                            InputProps={{
                                startAdornment: inputCantidadDinero.valor && <InputAdornment position="start"><Typography style={{fontSize: '13px', color: 'black', marginLeft: '0px'}}>Lps.</Typography></InputAdornment>,
                                style: {
                                    color: (inputCantidadDinero.valor && !inputCantidadDinero.validado && yaIntentoEnviar) ? 'red' : 'black',
                                    marginTop: '10px',
                                    width: '90%',
                                    height: '30px',
                                    borderRadius: '20px',
                                    fontSize: '16px',
                                }
                            }}
                            InputLabelProps={{
                                style: {
                                    fontSize: '16px',
                                },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} style={{borderRadius: '20px', '@media (max-width:600px)': { justifyContent: 'center' }}}> 
                            <FormControl fullWidth >
                                <InputLabel required error={(!inputPeriodo.validado && yaIntentoEnviar)} style={{marginLeft: '30px', fontSize: '12px'}}>A pagar en:</InputLabel>
                                <Select 
                                    required 
                                    value={inputPeriodo.valor} 
                                    onChange={handleChange_inputPeriodo} 
                                    label="Proposito del préstamo" 
                                    style={{
                                        marginTop: '10px',
                                        marginLeft: '30px', 
                                        width: '80%', 
                                        height: '34px', 
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        }} 
                                    error={(!inputPeriodo.validado && yaIntentoEnviar)}
                                >
                                {listadoPeriodos}
                                </Select>
                            </FormControl>
                    </Grid>

                    

                    <Grid item xs={12} sm={12}>
                        <FormControl fullWidth>
                            <InputLabel 
                                error={(!inputProposito.validado && yaIntentoEnviar)}
                                style={{marginLeft: '30px', fontSize: '12px'}}
                            >
                                Proposito del préstamo
                            </InputLabel>
                            <Select 
                                value={inputProposito.valor} 
                                onChange={handleChange_inputProposito} 
                                style={{
                                    marginTop: '10px',
                                    marginLeft: '30px', 
                                    width: '80%', 
                                    height: '34px', 
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    }} 
                                label="Proposito del préstamo" 
                                error={(!inputProposito.validado && yaIntentoEnviar)}
                                >
                                {Object.keys(params.purposeListaObj).map((key)=>{
                                    return (
                                        <MenuItem key={key} value={params.purposeListaObj[key].id}>{params.purposeListaObj[key].title}</MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    

                    <Grid item xs={12} sm={12}>

                        <Grid item xs={12} style={{display: 'flex', fontSize: '10px'}}>
                            <Typography variant="h6" style={{fontWeight: 'bold', marginRight: '20px', marginTop: '10px'}}>2.</Typography>
                            <Typography variant="h6" style={{fontSize: '13px', marginRight: '25px', marginTop: '10px'}}>
                                {'Confirma que la cuenta '}
                                <span style={{fontWeight: 'bold'}}>{inputCuentaBanco.valor}</span>
                                {' de '}
                                <span style={{fontWeight: 'bold'}}>{nombreBanco}</span>
                                {' es la correcta para desembolsar tu dinero'}
                            </Typography>
                            </Grid>

                        <br/>
                        <Grid item xs={12} sm={12} style={{display: 'flex', justifyContent: 'space-between'}}>
                        <div style={{'@media (max-width:600px)': { height: '50px' }}}>
                            <Button 
                                variant="contained" 
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = 'black';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.color = 'black';
                                }}
                                style={{
                                    marginLeft: '30px',
                                    backgroundColor: 'white',
                                    color: 'black',
                                    height: '65%',
                                    width: '80%',
                                    marginTop: '10px',
                                    fontSize: '10px',
                                    boxShadow: 'none',
                                    border: '1px solid grey',
                                    borderRadius: '20px',
                                    textTransform: 'none',
                                }} 
                                onClick={() => set_inputAceptoBanco(!inputAceptoBanco)}
                            >
                                {inputAceptoBanco ? 
                                    <span>
                                        <span role="img" aria-label="check" style={{ paddingRight: '15px' }}>✔️</span>
                                        Si, mi información bancaria es correcta
                                    </span> 
                                    : 
                                    'Si, mi información bancaria es correcta'
                                }
                            </Button>
                        </div>

                        <div style={{'@media (max-width:600px)': { height: '50px' }}}>
                            <Button 
                                onClick={()=>{set_openEditarBanco(true)}} 
                                variant="contained"
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = 'black';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.color = 'black';
                                }}
                                style={{
                                    marginLeft: '30px',
                                    marginRight: '30px',
                                    backgroundColor: 'white',
                                    color: 'black',
                                    height: '65%',
                                    width: '80%',
                                    marginTop: '10px',
                                    fontSize: '10px',
                                    boxShadow: 'none',
                                    border: '1px solid grey',
                                    borderRadius: '20px',
                                    textTransform: 'none',
                                }} 
                            >
                                No, Quiero actualizar mi cuenta bancaria
                            </Button>
                        </div>
                    </Grid>

                        {/* Modal del contrato */}
                        <Dialog open={ventanaContrato} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" style={{ textAlign: 'center'}}>
                            <DialogContent>
                                {parse(contratoFinal||"")}
                            </DialogContent>
                            <DialogActions>
                                <div style={{ width: '100%', textAlign: 'center' }}>
                                    <Button onClick={()=>{ set_ventanaContrato(false); set_inputAceptoContrato(false); }}  style={{
                                        marginLeft: '30px',
                                        backgroundColor: 'white',
                                        color: '#647cf8',
                                        height: '30px',
                                        width: '20%',
                                        marginTop: '10px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        boxShadow: 'none',
                                        border: '1px solid #647cf8',
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        paddingBottom: '10px',
                                        }} >
                                      Regresar
                                    </Button>

                                    <Button 
                                    autoFocus 
                                    onClick={()=>{ set_ventanaContrato(false); set_inputAceptoContrato(true); set_ventanaPagare(true);}}
                                    style={{marginLeft: '20px',
                                        backgroundColor: '#647cf8',
                                        color: 'white',
                                        height: '30px',
                                        width: '20%',
                                        marginTop: '10px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        boxShadow: 'none',
                                        border: '1px solid grey',
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        paddingBottom: '10px',}}
                                >
                                    Acepto
                                </Button>
                                </div>
                            </DialogActions>
                        </Dialog>

                        {/* Modal del pagare */}
                        <Dialog open={ventanaPagare} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" style={{ textAlign: 'center'}}>
                            <DialogContent>
                                {parse(pagareFinal||"")}
                            </DialogContent>
                            <DialogActions>
                                <div style={{ width: '100%', textAlign: 'center' }}>
                                    <Button onClick={()=>{ set_ventanaPagare(false); set_inputAceptoPagare(false); }}  style={{
                                        marginLeft: '30px',
                                        backgroundColor: 'white',
                                        color: '#647cf8',
                                        height: '30px',
                                        width: '20%',
                                        marginTop: '10px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        boxShadow: 'none',
                                        border: '1px solid #647cf8',
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        paddingBottom: '10px',
                                        }} >
                                    Regresar
                                    </Button>

                                    <Button 
                                    autoFocus 
                                    onClick={()=>{ set_ventanaPagare(false); set_inputAceptoPagare(true); }}
                                    style={{ marginLeft: '20px',
                                        backgroundColor: '#647cf8',
                                        color: 'white',
                                        height: '30px',
                                        width: '20%',
                                        marginTop: '10px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        boxShadow: 'none',
                                        border: '1px solid grey',
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        paddingBottom: '10px',}}
                                >
                                    Acepto
                                </Button>
                                </div>
                            </DialogActions>
                        </Dialog>

                        <Dialog onClose={()=>{set_openEditarBanco(false)}} open={openEditarBanco}>
                            <DialogContent>
                                <FormCambiarBanco setOpen={set_openEditarBanco} />
                            </DialogContent>
                        </Dialog>
                        </Grid>

                    <Grid item xs={12} sm={12} style={{marginBottom: '50px'}}>
                        <Grid item xs={12} style={{display: 'flex', fontSize: '10px'}}>
                            <Typography variant="h6" style={{fontWeight: 'bold', marginRight: '20px', marginTop: '10px'}}>3.</Typography>
                            <Typography variant="body1" style={{marginTop: '20px', fontSize: '14px'}}>
                                Necesitamos tu aprobación para el contrato y pagare del préstamo
                            </Typography>
                        </Grid>
                        <FormControlLabel
                            disabled={!validadoParaContrato}
                            label={
                                <Typography variant="body2" align="center" style={{ fontSize: '12px', marginLeft: esPantallaPequeña ? '70px' : '60px'}}> 
                                    Ver contrato y pagare
                                </Typography>
                                }
                            control={
                                <Checkbox 
                                    checked={inputAceptoContrato} 
                                    onChange={change_inputVerAceptoContrato} 
                                    style={{
                                        visibility: 'hidden',
                                        color: 'green',
                                        transform: 'scale(0.6)',
                                        marginTop: '2px',
                                        marginLeft: '10px',
                                        marginRight: '5px',
                                        boxShadow: 'none',
                                        fontSize: '5px',
                                        position: 'absolute',
                                        textAlign: 'center',
                                    }}
                                />
                            }
                            style={{
                                marginLeft: '30px',
                                textAlign: 'center',
                                fontSize: '5px',
                                backgroundColor: 'white',
                                height: esPantallaPequeña ? '30%' : '35%',
                                width: esPantallaPequeña ? '80%' : '40%',
                                marginTop: '10px',
                                boxShadow: 'none',
                                border: '1px solid grey',
                                borderRadius: '20px',
                                textTransform: 'none',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'black';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.color = 'black';
                            }}
                            
                        />
                        

                        {/* Acepto pagare y contrato inicio */}
                        <>
                        <FormControlLabel
                            style={{ display: 'none' }} 
                            disabled={!validadoParaContrato}
                            label={
                            <Typography variant="body2" style={{ fontSize: '12px', marginLeft: esPantallaPequeña ? '60px' : '10px' }}>
                                Acepto el contrato
                            </Typography>
                            }
                            control={
                            <Checkbox 
                                checked={inputAceptoContrato} 
                                onChange={(event) => change_inputAceptoContrato(event)} 
                                icon={<></>}
                                checkedIcon={<span style={{ fontSize: '18px' }}>✔️</span>} 
                                style={{
                                color: 'green',
                                transform: 'scale(0.6)',
                                marginTop: '2px',
                                marginLeft: '10px',
                                marginRight: '5px',
                                boxShadow: 'none',
                                fontSize: '5px',
                                }}
                            />
                            }
                        />

                        <FormControlLabel
                            style={{ display: 'none' }} 
                            disabled={!validadoParaContrato}
                            label={
                            <Typography variant="body2" style={{ fontSize: '12px', marginLeft: esPantallaPequeña ? '60px' : '10px' }}>
                                Acepto el pagare
                            </Typography>
                            }
                            control={
                            <Checkbox 
                                checked={inputAceptoPagare} 
                                onChange={(event) => change_inputAceptoPagare(event)} 
                                icon={<></>}
                                checkedIcon={<span style={{ fontSize: '18px' }}>✔️</span>} 
                                style={{
                                color: 'green',
                                transform: 'scale(0.6)',
                                marginTop: '2px',
                                marginLeft: '10px',
                                marginRight: '5px',
                                boxShadow: 'none',
                                fontSize: '5px',
                                }}
                            />
                            }
                        />

                        <FormControlLabel
                            disabled={!validadoParaContrato}
                            label={
                            <Typography variant="body2" style={{ fontSize: '12px', padding: '2px', marginLeft: esPantallaPequeña ? '60px' : '10px' }}>
                                Acepto contrato y pagare
                            </Typography>
                            }
                            control={
                            <Checkbox 
                                checked={inputAceptoContrato && inputAceptoPagare} 
                                onChange={(event) => {
                                const isChecked = event.target.checked;
                                change_inputAceptoContrato({ target: { checked: isChecked } });
                                change_inputAceptoPagare({ target: { checked: isChecked } });
                                }} 
                                icon={<></>}
                                checkedIcon={<span style={{ fontSize: '18px' }}>✔️</span>} 
                                style={{
                                color: 'green',
                                transform: 'scale(0.6)',
                                marginTop: '2px',
                                marginLeft: '10px',
                                marginRight: '5px',
                                boxShadow: 'none',
                                fontSize: '5px',
                                }}
                            />
                            }
                            style={{
                            marginLeft: '30px',
                            fontSize: '5px',
                            backgroundColor: 'white',
                            height: esPantallaPequeña ? '30%' : '35%',
                            width: esPantallaPequeña ? '80%' : '40%',
                            marginTop: '10px',
                            boxShadow: 'none',
                            border: '1px solid grey',
                            borderRadius: '20px',
                            textTransform: 'none',
                            }}
                            onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'black';
                            e.currentTarget.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = 'black';
                            }}
                        />
                        </>
                        {/* Acepto pagare y contrato fin */}


                    </Grid>

                    <br/>

                   

                    {/* <Grid item xs={12} sm={6}>
                        <Button variant="contained" onClick={()=>{set_openVentanaCalculadora(true)}} disabled={!validadoParaContrato} size="small">Calculadora de cuotas</Button>
                    </Grid> */}
                   
                   <Grid 
                        container 
                        direction="row" 
                        justifyContent="flex-end" 
                        onClick={()=>{set_yaIntentoEnviar(true)}} 
                        item xs={12} sm={12}
                    >
                        <Button 
                            onClick={(e) => handleClickOpen(e)} 
                            disabled={!botonEnviarHabilitado} 
                            variant="contained" 
                            onMouseOver={(e) => {
                                if(botonEnviarHabilitado) {
                                    e.currentTarget.style.backgroundColor = '#495cbf';
                                }
                            }}
                            onMouseOut={(e) => {
                                if(botonEnviarHabilitado) {
                                    e.currentTarget.style.backgroundColor = '#647cf8';
                                }
                            }}
                            style={{
                                backgroundColor: botonEnviarHabilitado ? '#647cf8' : 'white',
                                color: botonEnviarHabilitado ? 'white' : 'black',
                                borderColor: '#647cf8',
                                height: esPantallaPequeña ? '50px' : '30px',
                                width: esPantallaPequeña ? '30%' : '30%',
                                marginTop: '10px',
                                fontSize: '10px',
                                boxShadow: 'none',
                                border: '1px solid grey',
                                borderRadius: '20px',
                                textTransform: 'none',
                                marginLeft: '10px',
                                '&:hover': {
                                    backgroundColor: '#e0e0e0',
                                  },
                            }}
                        >
                            Enviar solicitud
                        </Button>
                        <Button 
                            onClick={()=>{cerrarVentana()}} 
                            variant="contained" 
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#647cf8';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.color = 'black';
                            }}
                            style={{
                                backgroundColor: 'white',
                                color: 'black',
                                borderColor: '#647cf8',
                                height: esPantallaPequeña ? '50px' : '30px',
                                width: esPantallaPequeña ? '30%' : '30%',
                                marginTop: '10px',
                                fontSize: '10px',
                                boxShadow: 'none',
                                border: '1px solid grey',
                                borderRadius: '20px',
                                textTransform: 'none',
                                marginLeft: '10px',
                            }}
                        >
                            Cancelar
                        </Button>
                    </Grid>

                    {/* Modal de prestamo solicitado con exito*/}
                    <Dialog
                        className="miDialogo"
                        open={open}  // El diálogo se mostrará si 'open' es true
                        onClose={(e, reason) => {
                            // Solo cerrar el diálogo si el motivo es diferente a 'backdropClick'
                            if (reason !== 'backdropClick') {
                            handleClose();
                            }
                        }}  // Cuando se cierra el diálogo, llamamos a la función 'handleClose'
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        PaperProps={{
                            style: {
                            zIndex: 1300, // Asegúrate de que el diálogo esté por encima de otros elementos
                            }
                        }}
                        >
                        <br />
                        <br />
                        <Box display="flex" justifyContent="center" alignItems="center">
                            <img src={`${process.env.PUBLIC_URL}/logowhite.png`} alt="Logo" height={'100px'} width={'100px'} />
                        </Box>
                        <DialogTitle id="alert-dialog-title" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center' }}>
                            {"¡Tu solicitud ha sido enviada!"}
                        </DialogTitle>
                        <br />
                        <DialogContent style={{ textAlign: 'center' }}>
                            <DialogContentText className="miDialogoTexto" id="alert-dialog-description" style={{ color: 'white', textAlign: 'center' }}>
                            En un máximo de 24 horas <br /> estarás recibiendo una respuesta.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions className="miDialogoAcciones" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button className="miDialogoBoton" onClick={(e) => {
                            e.preventDefault();
                            enviarInformacionAlApi();
                            }}
                            color="primary"
                            autoFocus
                            style={{
                                background: 'white',
                                alignContent: 'center',
                                fontSize: '12px',
                                borderRadius: '20px',
                                width: '200px',
                                textTransform: 'none',
                            }}>
                            Ver información de mi préstamo
                            </Button>
                        </DialogActions>
                </Dialog>

                </Grid>
                </div>
                }
                <Dialog
                    open={openVentanaCalculadora}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="xs"
                >
                    <DialogContent>
                        <Calculadora
                            setOpen={set_openVentanaCalculadora} 
                            inputCantidadDinero={inputCantidadDinero} 
                            inputPeriodo={inputPeriodo} 
                            interesPeriodo={interesPeriodo} 
                            diasPorPerSel={diasPorPerSel} 
                            params={params} />
                    </DialogContent>
                </Dialog>
            </Box>
        </Box>
    );
}

function CrearNuevoPrestamo({open, todosaliobienfn, cerrarVentana, params}){
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(()=>{
        // console.log("params", params);
    },[params])

    return (
        <Dialog fullScreen={fullScreen} onClose={cerrarVentana} open={open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
        <DialogContent>
          <Formulario todobiencallback={todosaliobienfn} cerrarVentana={cerrarVentana} params={params} />
        </DialogContent>
      </Dialog>
    );
}


function Calculadora({setOpen, inputCantidadDinero, inputPeriodo, interesPeriodo, diasPorPerSel, params}){

    const [cuota, set_cuota] = useState(parseInt(params.pricelistData.PriInt));
    const [interesTotal, set_interesTotal] = useState(0);
    const [gastosAdministrativos, set_gastosAdministrativos] = useState(0);
    const [interesEnDinero, set_interesEnDinero] = useState(0);

    useEffect(()=>{
        // console.log('inputCantidadDinero', inputCantidadDinero);
        // console.log('inputPeriodo', inputPeriodo);
        // console.log('interesPeriodo', interesPeriodo);
        // console.log('diasPorPerSel', diasPorPerSel);
        // console.log('params', params);

        let totalPrestamo = inputCantidadDinero.valor;
        let numeroDePagos = inputPeriodo.valor/diasPorPerSel;
        let interesTotalPer = interesPeriodo * numeroDePagos / 100;
        // let cuota = totalPrestamo * (interesTotalPer + 1) / numeroDePagos;
        let gastosAdministrativos = (totalPrestamo * 0.05) / numeroDePagos;
        let intDinero = (totalPrestamo * interesTotalPer) / numeroDePagos;
        let cuota = (totalPrestamo + (gastosAdministrativos * numeroDePagos) + (intDinero * numeroDePagos)) / numeroDePagos;
        set_cuota(cuota + gastosAdministrativos + intDinero);
        set_interesTotal(interesTotalPer);
        set_gastosAdministrativos(gastosAdministrativos);
        set_interesEnDinero(intDinero);
        // console.log('cuota', cuota);
        // console.log('intDinero', intDinero);
        // console.log('interesTotalPer', cuota * (interesPeriodo/100));
        // console.log('totalPrestamo', totalPrestamo);
        // console.log('gastosAdministrativos', gastosAdministrativos);
        console.log('interesPeriodo', interesPeriodo);
    }, [inputCantidadDinero, inputPeriodo, interesPeriodo, diasPorPerSel, params]);

    return (
    <>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
                <Typography variant="h5" sx={{pt: 1, pb: 0}} >Calculadora</Typography>
                <Typography variant="body2" sx={{pt: 1, pb: 5}} >Aqui encontrara información adicional sobre sus cuotas y los calculos generales aproximados de sus intereses.</Typography>
                <Typography variant="body2" sx={{}} >Detalle</Typography>
                <Divider sx={{ mb: 1, mt: 1 }}></Divider>
                {/* <Typography variant="body2" sx={{}} >Cantidad: L {numeral(inputCantidadDinero.valor).format('0,0.00')}</Typography> */}
                <Typography variant="body2" sx={{}} >Cuota {params.productSelected.ProTip}: <b>L {numeral(cuota).format('0,0.00')}</b></Typography>
                <Typography variant="body2" sx={{}} >Total de pagos: <b>{inputPeriodo.valor/diasPorPerSel}</b></Typography>
                <Typography variant="body2" sx={{}} >Periodicidad: <b>{params.productSelected.ProTip}</b></Typography>
                <Typography variant="body2" sx={{}} >Gastos administrativo: <b>L {gastosAdministrativos}</b></Typography>
                <Typography variant="body2" sx={{}} >Interes: <b>L {numeral(interesEnDinero).format("0,0.00")}</b></Typography>
                {/* <Typography variant="body2" sx={{}} >Interes <b>{params.productSelected.ProTip}: {interesPeriodo}%</b></Typography> */}
                <Typography variant="body2" sx={{}} >Tasa de interés: <b>{numeral(interesTotal*100).format("0.0")}%</b></Typography>
                {/* <Typography>params.pricelistData.PriInt {params.pricelistData.PriInt}</Typography> */}
                <Divider sx={{ mb: 6, mt: 1 }}></Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Button variant="outlined" fullWidth onClick={()=>{setOpen(false)}}>Ok</Button>
            </Grid>
        </Grid>
    </>
    );
}

export default CrearNuevoPrestamo;







function FormCambiarBanco({setOpen}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);

    const [inputCuentaBanco, set_inputCuentaBanco] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputBanco, set_inputBanco] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    
    const [errorAjax, set_errorAjax] = useState(false);
    const [apiCamposConstructor, set_apiCamposConstructor] = useState(false);
    const [terminoEditar, set_terminoEditar] = useState(false);
    const [usuarioDetalle, set_usuarioDetalle] = useState(false);
    // const [inputPass2, set_inputPass2] = useState({valor: '', validado: false, textoAyuda: "", blur: false});

    const [enviandoForm, set_enviandoForm] = useState(false);
    
    // const [usuarioDetalleFullR, set_usuarioDetalleFullR] = useState(false);
    // const [usuarioDetalle, set_usuarioDetalle] = useState(false);
    

    // function sacarNombreBanco(banconumber){
    //     for (const key in apiCamposConstructor?.bank?.values) {
    //         if (Object.hasOwnProperty.call(apiCamposConstructor?.bank?.values, key)) {
    //             const element = apiCamposConstructor?.bank?.values[key];
    //             if(key === banconumber){
    //                 return element;
    //             }
    //         }
    //     }
    // }

    function handleChange_inputBanco(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputBanco({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputBanco.blur,
        });

        set_inputCuentaBanco({
            validado: false,
            valor: "",
            textoAyuda: "",
            blur: false,
        });
    }

    function handleChange_inputCuentaBanco(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Solo números.";
        if(valor.match(/^[0-9]+$/)){
            validado = true;
            texto = "";
        }
        set_inputCuentaBanco({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputCuentaBanco.blur,
        });
    }


    function getInformacionUsuario(callback){
        axios.request({
            url: `${config.apiUrl}/api/app/getProfile.php`,
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
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                console.log('usuarioDetalle', res.data.payload.data);
                set_usuarioDetalle(res.data.payload.data);
                set_inputBanco({
                    ...inputBanco,
                    valor: res.data.payload.data.bank,
                    validado: true
                });
            }
           
            if(typeof callback === 'function') callback();
        }).catch(err => {
            console.log(err.message);
        });
    }

    const cargarDatosSeleccionables = ()=>{

        axios.request({
            url: `${config.apiUrl}/api/app/getFieldConstructor.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
              },
        })
        .then((res) => {
            if(res.data.status === "ER"){
            }
            if(res.data.status === "OK"){
                // console.log('constructorapi', res.data.payload.data);
                set_apiCamposConstructor(res.data.payload.data);
            }
        }).catch(err => {
            console.log(err.message);
        });

    }

    const cargarCuentaBanco = ()=>{

        axios.request({
            url: `${config.apiUrl}/api/app/get_bankaccount.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
              },
        })
        .then((res) => {
            if(res.data.status === "ER"){
            }
            if(res.data.status === "OK"){
                console.log('get_bankaccount', res.data.payload?.data);

                var cuentaActiva = false;
                for (const key in res.data.payload?.data) {
                    if (Object.hasOwnProperty.call(res.data.payload?.data, key)) {
                        const element = res.data.payload?.data[key];
                        // console.log('element', element);
                        if(element.current === '1'){
                            cuentaActiva = element;
                        }
                    }
                }

                set_inputCuentaBanco({
                    ...inputCuentaBanco,
                    valor: cuentaActiva.account_number
                })
            }
        }).catch(err => {
            console.log(err.message);
        });

    }

    useEffect(()=>{
        cargarDatosSeleccionables();
        getInformacionUsuario();
        cargarCuentaBanco();
        // eslint-disable-next-line
    },[]);


    

    useEffect(()=>{
        if(inputCuentaBanco?.validado && inputBanco.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputCuentaBanco, inputBanco]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    account_number: inputCuentaBanco.valor,
                    bank: inputBanco.valor,

                },
              },
        })
        .then((res) => {
            set_enviandoForm(false);
            if(res.data.status === "ER"){
                
            }
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
                set_terminoEditar(true);
            }
        }).catch(err => {
            set_errorAjax(err.message);
        });
    }

    return (
        <Box>
            
            {(usuarioDetalle && apiCamposConstructor && !terminoEditar) && 
            <Box>
                <br/>
                <Typography variant="h5" sx={{}} style={{textAlign: 'center', fontSize: '16px', fontWeight: 'bold'}}>Actualiza tu información bancaria</Typography>
                <br/>   
                <Typography variant="body1" sx={{mb: '1rem'}} style={{fontSize: '14px', textAlign: 'center'}}>
                    Asegúrate de colocar la información del banco al que quieres que llegue el dinero. Si la información es correcta, no la actualices.
                </Typography>
                <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel 
                        onBlur={()=>{set_inputBanco({...inputBanco, blur: true})}} 
                        required 
                        error={(!inputBanco.validado && inputBanco.blur)}
                        style={{fontSize: '12px'}}
                    >
                        Banco
                    </InputLabel>
                    <Select 
                        onBlur={()=>{set_inputBanco({...inputBanco, blur: true})}} 
                        required 
                        value={inputBanco.valor} 
                        onChange={handleChange_inputBanco} 
                        label="Banco" 
                        error={(!inputBanco.validado && inputBanco.blur)}
                        style={{fontSize: '12px', borderRadius: '20px', height: '30px'}}
                    >
                        {Object.keys(apiCamposConstructor?.bank?.values).map((key)=>{
                            return ((key)?<MenuItem key={key} value={key}>{apiCamposConstructor?.bank?.values[key]}</MenuItem>:'');
                        })}
                    </Select>
                </FormControl>
            </Grid>
                <Grid item xs={12} sm={6}>
                <TextField 
                    helperText={inputCuentaBanco.textoAyuda} 
                    required 
                    value={inputCuentaBanco.valor} 
                    onBlur={()=>{set_inputCuentaBanco({...inputCuentaBanco, blur: true})}}
                    onChange={handleChange_inputCuentaBanco} 
                    error={(!inputCuentaBanco.validado && inputCuentaBanco.blur)} 
                    autoComplete="off" 
                    fullWidth 
                    label={"# de cuenta" }
                    InputProps={{
                        style: {
                            fontSize: '12px',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            height: '30px',
                        }
                    }}
                    inputProps={{
                        style: {
                            fontSize: '12px',
                        }
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '12px',
                        }
                    }}
                />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <Typography variant="body2" sx={{mb: '1rem', color: '#ff4d4d'}} >{errorAjax}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} style={{textAlign: 'center'}}>
                        <Button 
                            disabled={(validado && !enviandoForm)?false:true} 
                            variant="contained" 
                            onClick={guardarDatos} 
                            sx={{ mt: 1, mr: 1 }} 
                            style={{
                                background: '#647cf8',
                                color: 'white',
                                borderRadius: '20px',
                                height: '30px',
                                width: '20%',
                                fontSize: '12px',
                                textTransform: 'none',
                            }}
                        >
                            {(enviandoForm)?"Enviando....":"Guardar"}
                        </Button>
                        <Button 
                            onClick={()=>{setOpen(false)}} 
                            sx={{ mt: 1, mr: 1 }} 
                            style={{
                                borderRadius: '20px',
                                color: '#647cf8',
                                borderColor: '#647cf8',
                                height: '30px',
                                width: '20%',
                                fontSize: '12px',
                                border: '1px solid #647cf8',
                                textTransform: 'none',
                            }}
                        >
                            Cerrar
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            }

            {(usuarioDetalle && apiCamposConstructor && terminoEditar) && 
            <Box sx={{textAlign: 'center'}}>
                <Typography sx={{p: '2rem 0', color: 'green', textAlign: 'center', maxWidth: '15rem'}}>Información guardada correctamente.</Typography>
                <Button variant="contained" onClick={()=>{setOpen(false)}} sx={{ mt: 1, mr: 1 }} >Aceptar</Button>
            </Box>
            }

            {(!apiCamposConstructor || !usuarioDetalle) &&
            <Box sx={{p: '4rem 0', textAlign: 'center', minWidth: '18rem'}}>
                <CircularProgress />
                <Typography>Cargando...</Typography>
            </Box> }
        </Box>
    )
}


