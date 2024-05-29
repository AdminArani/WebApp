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
    const [inputAceptoContrato, set_inputAceptoContrato] = useState(false);
    const [openEditarBanco, set_openEditarBanco] = useState(false);
    const [diasPorPerSel, set_diasPorPerSel] = useState(false);
    const [inputAceptoBanco, set_inputAceptoBanco] = useState(false);

    const [usuarioDetalle, set_usuarioDetalle] = useState(false);
    const [contratoRaw, set_contratoRaw] = useState(false);
    const [contratoFinal, set_contratoFinal] = useState(false);
    const [validadoParaContrato, set_validadoParaContrato] = useState(false);
    const [openVentanaCalculadora, set_openVentanaCalculadora] = useState(false);
    
    
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
        console.log('valor: ', numeral(valor));
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
            url: "https://app.arani.hn/api/app/getProfile.php",
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
                console.log('usuarioDetalle', res.data.payload.data);
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
        console.log('inputPeriodo.validado', inputPeriodo.validado);
        console.log('inputCantidadDinero.validado', inputCantidadDinero.validado);
        console.log('inputAceptoContrato', inputAceptoContrato);
        if( inputPeriodo.validado && inputCantidadDinero.validado && inputAceptoContrato && inputAceptoBanco){
            set_botonEnviarHabilitado(true);
        }

        set_validadoParaContrato(false);
        if(inputPeriodo.validado && inputCantidadDinero.validado){
            set_validadoParaContrato(true);
        }

    }, [inputPeriodo, inputCantidadDinero, inputAceptoContrato, inputAceptoBanco]);
    
    useEffect(()=>{

        console.log('params', params);

        if(params.pricelistData && params.productSelected){
            // console.log('pricelistData', params.pricelistData);
            // console.log(params.pricelistData.PriMntHas);
            // console.log(params.pricelistData.PriMntDes);

            
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
            console.log(persmax);
            let arrayPersSelect = [];
            for (let index = 1; index <= parseInt(persmax); index++) {
                arrayPersSelect.push(
                    <MenuItem key={index} value={(index*diasporper)}>{index} {cantidadperiodostxt}</MenuItem>
                );
            }
            set_listadoPeriodos(arrayPersSelect);

            console.log("priceListData", params.pricelistData);

            // Sacamos el interes por periodo
            var interesPeriodo = params.pricelistData.PriInt;
            if(tipo === 'semanal') set_interesPeriodo((interesPeriodo/52).toFixed(10));
            if(tipo === 'quincenal') set_interesPeriodo((interesPeriodo/26).toFixed(10));
            if(tipo === 'mensual') set_interesPeriodo((interesPeriodo/12).toFixed(10));
        }

    // eslint-disable-next-line
    },[params]);


    useEffect(()=>{
        
        var contratoEditado = contratoRaw || "";
        // var contratoEditado = textContrato() || "";
        
        // contratoEditado = contratoEditado.replace('%{realname}%', usuarioDetalle.realname);
        // contratoEditado = contratoEditado.replace('%{midname}%', usuarioDetalle.midname);
        // contratoEditado = contratoEditado.replace('%{surname}%', usuarioDetalle.surname);
        // contratoEditado = contratoEditado.replace('%{midname2}%', usuarioDetalle.midname2);

        
        // contratoEditado = contratoEditado.replaceAll('$$NOMBRE COMPLETO$$', ("<b>"+usuarioDetalle.realname+" "+usuarioDetalle.midname+" "+usuarioDetalle.surname+" "+usuarioDetalle.midname2+"</b>").toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{realname}%', usuarioDetalle.realname?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{midname}%', usuarioDetalle.midname?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{surname}%', usuarioDetalle.surname?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{midname2}%', usuarioDetalle.midname2?.toUpperCase());
        
        contratoEditado = contratoEditado.replaceAll('%{ESTADO CIVIL}%', usuarioDetalle.marital_status?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{city}%', usuarioDetalle.county?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{CIUDAD}%', usuarioDetalle.county?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{region}%', usuarioDetalle.region?.toUpperCase());
        
        contratoEditado = contratoEditado.replaceAll('%{person_code}%', usuarioDetalle.person_code?.toUpperCase());

        contratoEditado = contratoEditado.replaceAll('%{amount}%', numeral(inputCantidadDinero.valor).format('0,0'));
        contratoEditado = contratoEditado.replaceAll('%{period}%', inputPeriodo.valor);
        contratoEditado = contratoEditado.replaceAll('%{s_number}%', inputPeriodo.valor/diasPorPerSel);

        contratoEditado = contratoEditado.replaceAll('%{interest}%%', interesPeriodo+"%");
        contratoEditado = contratoEditado.replaceAll('%{created_day}%', moment().format('DD'));
        contratoEditado = contratoEditado.replaceAll('%{NOMBRE MES}%', moment().format('MMMM')?.toUpperCase());
        contratoEditado = contratoEditado.replaceAll('%{AÑO}%', moment().format('YYYY'));

        

        // contratoEditado = contratoEditado.replace('%{s_number}%', 'FUNCIONA2');
        // contratoEditado = contratoEditado.replace('%{s_amount}%', 'FUNCIONA2');
        // contratoEditado = contratoEditado.replace('%{s_amount}%', 'FUNCIONA2');
        // contratoEditado = contratoEditado.replace('%{ESTADO CIVIL}%', 'FUNCIONA2');
        // contratoEditado = contratoEditado.replace('%{interest}%%', 'FUNCIONA2');
       

        set_contratoFinal(contratoEditado);
        // eslint-disable-next-line
    },[usuarioDetalle, contratoRaw, inputAceptoContrato]);


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
            url: "https://app.arani.hn/api/app/get_contractPre.php",
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

    function enviarInformacionAlApi() {
        set_enviandoAlApi(true);
        axios.request({
            url: "https://app.arani.hn/api/app/postOffer.php",
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
                url: "https://app.arani.hn/api/app/getPrueba1.php",
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

    const cargarCuentaBanco = () => {
        axios.request({
            url: "https://app.arani.hn/api/app/get_bankaccount.php",
            method: "post",
            data: {
                sid: gContext.logeado.token,
            },
        })
        .then((res) => {
            if (res.data.status === "OK") {
                console.log('get_bankaccount', res.data.payload?.data);

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

    
    const [bank, setBank] = useState(null);

    useEffect(() => {
        fetchInformacionUsuario(); // Llama a la función para obtener la información del usuario
    }, []);

    // Función para obtener la información del usuario
    const fetchInformacionUsuario = (callback) => {
        axios.request({
            url: "https://app.arani.hn/api/app/getProfile.php",
            method: "post",
            data: {
                sid: gContext.logeado?.token,
            },
        })
        .then((res) => {
            if (res.data.status === "ER") {
                console.log(res.data.payload.message);
            } else if (res.data.status === "ERS") {
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({ estado: false, token: '' });
            } else if (res.data.status === "OK") {
                console.log('usuarioDetalle', res.data.payload.data);
                set_usuarioDetalle(res.data.payload.data);

                // Almacena el valor del banco en una variable
                const bankValue = res.data.payload.data.bank;
                setBank(bankValue); // Actualiza el estado con el valor del banco
                console.log("Valor del banco:", bankValue);

                // Obtener el nombre del banco utilizando el valor numérico
                const nombreBanco = obtenerNombreBanco(bankValue);
                set_inputBanco({
                    ...inputBanco,
                    valor: nombreBanco,
                    validado: true
                });

                console.log("Nombre del banco:", nombreBanco);
            }

            if (typeof callback === 'function') callback();
        })
        .catch(err => {
            console.log(err.message);
        });
    }; 
    
    const obtenerNombreBanco = (valorBanco) => {
        console.log("Valor del banco al case:", valorBanco)
        switch (parseInt(valorBanco)) {
            case 1:
                return 'Bac Credomatic';
            case 2:
                return 'Banco Atlantida';
            case 3:
                return 'Banco Azteca';
            case 4:
                return 'Banco Banrural';
            case 5:
                return 'Banco Banrural';
            case 6:
                return 'Banco Banrural';
            case 7:
                return 'Banco Banrural';
            case 8:
                return 'Banco Banrural';
            case 9:
                return 'Banco Banrural';
            case 10:
                return 'Banco Banrural';
            case 11:
                return 'Banco Banrural';
            case 12:
                return 'Banco Banrural';
            case 13:
                return 'Banco Banrural';
            case 14:
                return 'Banco Banrural';
            case 15:
                return 'Banco Banrural';
            case 16:
                return 'Banco Banrural';
            default:
                return 'Banco No Registrado';
        }
    };
    
    
    
      
    
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

    return (
        <Box style={{padding: 'none', margin: '0px', marginLeft: '-24px', marginRight: '-24px', width:'600px'}}>
            
            <Box>
                {enviandoAlApi &&
                    <div>
                        <Typography variant="body1" sx={{pt: 1, pb: 3}} >Enviando....</Typography>
                    </div>
                }
                {(!enviandoAlApi && seRegistro) &&
                <div>
                    <Typography variant="h5" sx={{pt: 1, pb: 0}} style={{fontSize: '18px',textAlign: 'center', fontWeight: 'bold'}}>Resumen de tu préstamo</Typography>
                    <br/>
                    <Box style={{backgroundColor: '#dcdcdc', boxSizing: 'border-box'}}>
                        <div style={{padding: '10px', paddingTop: '2px', marginLeft: '30px', marginRight:'24px'}}>
                            <br/>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Typography variant="body2" style={{fontSize: '16px', fontWeight: 'bold'}}>Cantidad solicitada: </Typography>
                                <Typography variant="body2" style={{fontSize: '16px'}}>L {numeral(cantidadSolicitada).format('0,0.00')}</Typography>
                            </div>
                            <br/>
                            {/* <Typography variant="body2" sx={{}} >Total de pagos: {inputPeriodo.valor/diasPorPerSel}</Typography>
                            <Typography variant="body2" sx={{}} >Periodicidad: {params.productSelected.ProTip}</Typography> */}
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
                                    height: '30px',
                                    width: '25%',
                                    marginTop: '10px',
                                    fontSize: '10px',
                                    boxShadow: 'none',
                                    border: '1px solid grey',
                                    borderRadius: '20px',
                                    textTransform: 'none',
                                    marginLeft: '10px',
                            }}
                        >
                            Ir a mi perfil
                        </Button>
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
                                fontSize: '12px',
                            }
                        }}
                        InputLabelProps={{
                            style: {
                                fontSize: '12px',
                            },
                        }}
                    />
                    </Grid>

                    <Grid item xs={12} sm={6} style={{borderRadius: '20px'}}> 
                        {/* <TextField 
                            helperText={inputPeriodo.textoAyuda} 
                            required value={inputPeriodo.valor} 
                            onChange={handleChange_inputPeriodo} 
                            error={(!inputPeriodo.validado && yaIntentoEnviar)} 
                            autoComplete="off" 
                            fullWidth 
                            label="Tiempo para pagar (días)" 
                            /> */}
                        <FormControl fullWidth >
                            <InputLabel required error={(!inputPeriodo.validado && yaIntentoEnviar)} style={{fontSize: '12px'}} >A pagar en:</InputLabel>
                            <Select 
                                required 
                                value={inputPeriodo.valor} 
                                onChange={handleChange_inputPeriodo} 
                                label="Proposito del préstamo" 
                                style={{marginTop: '10px', width: '90%', height: '34px', borderRadius: '20px', fontSize: '12px'}}
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
                                    width: '90%', 
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
                                <span style={{fontWeight: 'bold'}}>{obtenerNombreBanco(bank)}</span>
                                {' es la correcta para desembolsar tu dinero'}
                            </Typography>
                            </Grid>

                        <br/>
                        <Grid item xs={12} sm={12} style={{display: 'flex', justifyContent: 'space-between'}}>
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
                                height: '30px',
                                width: '40%',
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
                                    <span role="img" aria-label="check" style={{ paddingRight: '10px' }}>✔️</span>
                                    La información bancaria es correcta
                                </span> 
                                : 
                                'La información bancaria es correcta'
                            }
                        </Button>

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
                                    height: '30px',
                                    width: '40%',
                                    marginTop: '10px',
                                    fontSize: '10px',
                                    boxShadow: 'none',
                                    border: '1px solid grey',
                                    borderRadius: '20px',
                                    textTransform: 'none',
                                }} 
                            >
                                Actualizar cuenta de banco
                            </Button>
                        </Grid>

                        {/* Modal del contrato */}
                        <Dialog open={ventanaContrato} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" style={{ textAlign: 'center'}}>
                            <DialogContent>
                                {parse(contratoFinal||"")}
                            </DialogContent>
                            <DialogActions>
                                <Button 
                                    autoFocus 
                                    onClick={()=>{ set_ventanaContrato(false); set_inputAceptoContrato(true); }}
                                    style={{ display: 'none' }}
                                >
                                    Acepto
                                </Button>
                                <div style={{ width: '100%', textAlign: 'center' }}>
                                    <Button onClick={()=>{ set_ventanaContrato(false); set_inputAceptoContrato(false); }}  style={{
                                        marginLeft: '30px',
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
                                        paddingBottom: '10px',
                                        }} >
                                      Regresar
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

                    <Grid item xs={12} sm={12}>
                        <Grid item xs={12} style={{display: 'flex', fontSize: '10px'}}>
                            <Typography variant="h6" style={{fontWeight: 'bold', marginRight: '20px', marginTop: '10px'}}>3.</Typography>
                            <Typography variant="body1" style={{marginTop: '20px', fontSize: '14px'}}>
                                Necesitamos tu aprobación para el contrato del préstamo
                            </Typography>
                        </Grid>
                        <FormControlLabel
                            disabled={!validadoParaContrato}
                            label={
                                <Typography variant="body2" style={{ fontSize: '12px', marginLeft: '18px'}}> 
                                    Ver contrato 
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
                                    }}
                                />
                            }
                            style={{
                                marginLeft: '30px',
                                textAlign: 'center',
                                fontSize: '5px',
                                backgroundColor: 'white',
                                height: '30px',
                                width: '20%',
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

                        <FormControlLabel
                            disabled={!validadoParaContrato}
                            label={
                                <Typography variant="body2" style={{ fontSize: '12px' }}> 
                                    Acepto el contrato
                                </Typography>
                            }
                            control={
                                <Checkbox 
                                    checked={inputAceptoContrato} 
                                    onChange={change_inputAceptoContrato} 
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
                                height: '30px',
                                width: '30%',
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
                    </Grid>

                   

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
                                height: '30px',
                                width: '30%',
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
                                height: '30px',
                                width: '30%',
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
                        onClose={handleClose}  // Cuando se cierra el diálogo, llamamos a la función 'handleClose'
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                        style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                    >
                           
                            <br/>
                            <br/>
                        <Box display="flex" justifyContent="center" alignItems="center">
                            <img src={`${process.env.PUBLIC_URL}/logowhite.png`} alt="Logo" height={'100px'} width={'100px'}/>
                        </Box>
                        <DialogTitle id="alert-dialog-title" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'}}>{"¡Tu solicitud ha sido enviada!"}</DialogTitle>
                        <br/>
                       
                        <DialogContent style={{textAlign: 'center'}}>
                            <DialogContentText className="miDialogoTexto" id="alert-dialog-description" style={{color: 'white', textAlign: 'center'}}>
                            En un máximo de 24 horas <br/> estarás recibiendo una respuesta.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions className="miDialogoAcciones" style={{display: 'flex', justifyContent: 'center'}}>
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
            url: "https://app.arani.hn/api/app/getProfile.php",
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
            url: "https://app.arani.hn/api/app/getFieldConstructor.php",
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
            url: "https://app.arani.hn/api/app/get_bankaccount.php",
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
            url: "https://app.arani.hn/api/app/putProfile.php",
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
            console.log(err.message);
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


