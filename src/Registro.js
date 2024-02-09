import { AppBar, Box, Button, Checkbox, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Paper, Select, Step, StepContent, StepLabel, Stepper, TextField, Toolbar, Tooltip, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/es';
import moment from "moment/moment";
import { AppContext } from "./App.js";
import axios from "axios";
import BarraFinal from "./componentes/BarraFinal";
import procesar_login from "./funciones/procesar_login.js";
// import logoArani from "./images/logoarani_blanco.png";
import logoArani from "./images/logoarani.png";
// import { Stack } from "@mui/system";


// UsrMail = correo de usuario
// UsrPwd = contraseña
// UsrDNI = DNI
// UsrTel = Telefono movil
// UsrNom1 = Primer Nombre
// UsrApe1 = Primer Apellido
// UsrGen = Genero(Hombre o mujer)
// UsrEstCiv = Estado Civil(Soltero, casado, union libre,viudo)
// UsrTipViv =Tipo de vivienda(Propia, rentada)
// UsrTipCli = Tipo de cliente(Asalariado,comerciante)
// UsrIng = Ingresos mensuales(flotante)
// UsrNumDep = Numero de dependientes(personas a cargo)
// UsrFchNac = Fecha de nacimiento

// UsrFchLabIni = Fecha de inicio de labores




function VerticalLinearStepper2(){
    const gContext = useContext(AppContext);
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [inputIdentidad, set_inputIdentidad] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputNombre1, set_inputNombre1] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputNombre2, set_inputNombre2] = useState("");
    const [inputNombre3, set_inputNombre3] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputNombre4, set_inputNombre4] = useState("");
    const [inputCorreo, set_inputCorreo] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputGenero, set_inputGenero] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputFechaNac, set_inputFechaNac] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputTelefono, set_inputTelefono] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputTelefonoCode, set_inputTelefonoCode] = useState({valor: '', validado: false, textoAyuda: "", blur: false});

    const [inputPass1, set_inputPass1] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputPass2, set_inputPass2] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    
    const [inputAceptoCondiciones, set_inputAceptoCondiciones] = useState(false);
    const [ventanaCondicionesOpen, set_ventanaCondicionesOpen] = useState(false);

    const [dataUsuarioRDB, set_dataUsuarioRDB] = useState(false);

    const [enviandoSMSTel, set_enviandoSMSTel] = useState(false);
    const [contadorReenvioSMS, set_contadorReenvioSMS] = useState(60);
    const [smsEnEspera, set_smsEnEspera] = useState(false);
    const [telefonoValidadoPorSMS, set_telefonoValidadoPorSMS] = useState(false);

    const [pasoValidacionGrupo0, set_pasoValidacionGrupo0] = useState(false);
    const [pasoValidacionGrupo1, set_pasoValidacionGrupo1] = useState(false);
    const [pasoValidacionGrupo2, set_pasoValidacionGrupo2] = useState(false);

    const [inputPassVisible, set_inputPassVisible] = useState(false);

    const [mensajeFinalError, set_mensajeFinalError] = useState("");
    const [mensajeFinalOk, set_mensajeFinalOk] = useState("");
    const [enviandoDataFinal, set_enviandoDataFinal] = useState(false);

    const [ventanaSeEncontoDataDB, set_ventanaSeEncontoDataDB] = useState(false);
    const [errorComprosDB, set_errorComprosDB] = useState([]);

    
    
    

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        set_mensajeFinalError("");
    };
    
    function handleChange_inputIdentidad(event){
        let valor = event.target.value.trim();
     
        let validado = false;
        let textoAyuda = "Debe ser de 13 caracteres.";
        let maxcaracteres = 13;
        
        if(valor.length > 0 ){
            let valorLimpio = valor.match(/\d/g) || [];
            if(valorLimpio.length > 0){
                valor = valorLimpio.join("");
            }else{
                valor = "";
            }
        }

        let diffcaracteres = (maxcaracteres-valor.length);

        if(diffcaracteres === 0){
            validado = true;
            textoAyuda = "";
            getDatosExternos(valor);
        }
        if(diffcaracteres > 0){
            textoAyuda = "Faltan "+diffcaracteres+" dígitos.";
        }
        if(diffcaracteres < 0){
            textoAyuda = "Máximo "+maxcaracteres+" dígitos.";
        }


        set_inputIdentidad({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputIdentidad.blur,
        });
    }

    function handleChange_inputNombre1(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Solo letras sin espacios";
        if(valor.length >= 1 && valor.match(/^[a-zA-ZÀ-ÿ]+$/)){
            validado = true;
            textoAyuda = "";
        }
        set_inputNombre1({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputNombre1.blur,
        });
    }

    function handleChange_inputTelefono(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Campo obligatorio";
        let maxcaracteres = 8;

        if(valor.length > 0 ){
            let valorLimpio = valor.match(/\d/g) || [];
            if(valorLimpio.length > 0){
                valor = valorLimpio.join("");
            }else{
                valor = "";
            }
        }

        let diffcaracteres = (maxcaracteres-valor.length);

        if(diffcaracteres === 0){
            textoAyuda = "";
            validado = true;    
        }

        if(diffcaracteres > 0){
            textoAyuda = "Faltan "+diffcaracteres+" dígitos.";
        }

        if(diffcaracteres < 0){
            textoAyuda = "Máximo "+maxcaracteres+" dígitos.";
        }

       
        set_inputTelefono({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputTelefono.blur,
        });
    }

    function handleChange_inputNombre2(event){
        set_inputNombre2(event.target.value);
    }

    function handleChange_inputNombre3(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Campo obligatorio";
        if(valor.length >= 1 && valor.match(/^[a-zA-ZÀ-ÿ]+$/)){
            validado = true;
            textoAyuda = "";
        }
        set_inputNombre3({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputNombre3.blur,
        });
    }

    function handleChange_inputNombre4(event){
        set_inputNombre4(event.target.value);
    }

    function handleChange_inputGenero(event){
        let textoAyuda = "Campo obligatorio";
        let valor = event.target.value;
        let validado = false;
        if(valor.length >= 1){
            validado = true;
        }
        set_inputGenero({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputGenero.blur,
        });
    }

    function handleChange_inputCorreo(event){
        let valor = event.target.value;
        let validado = false;
        let expreg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
        let textoAyuda = "Ingrese un correo valido";
        if(valor.match(expreg)){
            validado = true;
            textoAyuda = "";
        }
        set_inputCorreo({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputCorreo.blur,
        });
    }

    function handleChange_inputFechaNac(nuevoValor){
        let textoAyuda = "Campo obligatorio";
        let valor = nuevoValor;
        let validado = false;
        console.log(nuevoValor)
        console.log(moment().diff(nuevoValor?.$d, 'years'));
        if(moment().diff(nuevoValor?.$d, 'years') >= 21 && moment().diff(nuevoValor?.$d, 'years') <= 100){
            validado = true;
            textoAyuda = '';
        }
        if(moment().diff(nuevoValor?.$d, 'years') < 21){
            textoAyuda = "Necesitas al menos 21 años.";
        }
        set_inputFechaNac({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputFechaNac.blur,
        });
    }

    function handleChange_inputPass1(event){
        event.preventDefault();
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Min. 8 letras, 1 mayúscula y 1 carácter especial o número. ";
        let regexp = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\d]).{8,}$/;
        if(valor.match(regexp)){
            validado = true;
            textoAyuda = "";
        }
        set_inputPass1({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputPass1.blur,
        });
        set_inputPass2({
            ...inputPass2,
            blur: inputPass2.blur,
        });
    }

    function handleChange_inputPass2(event){
        event.preventDefault();
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Min. 8 letras, 1 mayúscula y 1 carácter especial o número.";
        let regexp = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\d]).{8,}$/;
        // console.log(valor);
        // console.log(inputPass1.valor);
        if(valor.match(regexp)){
            if(valor !== inputPass1.valor){
                validado = false;
                textoAyuda = "Esta contraseña no coincide con la primera.";
            }else{
                validado = true;
                textoAyuda = "";
            }
        }
        set_inputPass2({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputPass2.blur,
        });
    }

    function handleChange_inputTelefonoCode(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Campo obligatorio";
        if(valor.length === 6){
            validado = true;
            textoAyuda = "";
        }
        set_inputTelefonoCode({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
        });
    }

    const validarTel = () =>{
        set_enviandoSMSTel(true);
        axios.request({
            url: "https://app.arani.hn/api/app/otp_cre.php",
            method: "post",
            withCredentials: true,
            data: {
                UsrTel: inputTelefono.valor,
            },
        })
        .then((res) => {
            console.log(res);
            set_enviandoSMSTel(false);
            if(res.data.status === "ER"){
                set_inputTelefono({
                    valor: inputTelefono.valor, 
                    validado: false,
                    textoAyuda: "Error: "+res.data.payload.message,
                });
                set_contadorReenvioSMS(120);
            }
            if(res.data.status === "OK"){
                // console.log('cronome');  
                set_smsEnEspera(true);
                set_inputTelefono({
                    valor: inputTelefono.valor, 
                    validado: inputTelefono.validado,
                    textoAyuda: "",
                    // textoAyuda: "Dev test: "+res.data.payload.codigo_dev,
                });
                set_contadorReenvioSMS(120);
                var tempinterval = setInterval(() => {
                    set_contadorReenvioSMS(contadorReenvioSMS => contadorReenvioSMS -1);
                }, 1000);
                setTimeout(() => {
                    set_smsEnEspera(false);
                    clearInterval(tempinterval)
                }, 120000);
            }
        }).catch(err => {
            console.log(err);
            set_inputTelefono({
                valor: inputTelefono.valor, 
                validado: false,
                textoAyuda: "Error: "+err.message,
            });
            set_contadorReenvioSMS(120);
            set_enviandoSMSTel(false);
        });

      
    }

    const handleClick_mostrarpass = ()=>{
        set_inputPassVisible(!inputPassVisible);
    }

    const handleChange_inputAceptoCondiciones = (e)=>{
        set_inputAceptoCondiciones(e.target.checked);
        // if(e.target.checked){
        //     set_ventanaCondicionesOpen(true);
        // }
    }

    const fnValidarCodigoSMS = ()=>{
        axios.request({
            url: "https://app.arani.hn/api/app/otp_cmp.php",
            method: "post",
            withCredentials: true,
            data: {
                UsrTel: inputTelefono.valor,
                OtpCod: inputTelefonoCode.valor,
            },
        })
        .then((res) => {

            // -----------------------------------------
            // set_telefonoValidadoPorSMS(true);
            // -----------------------------------------

            //------------------
            if(res.data.status === "ER"){
                set_inputTelefonoCode({
                    valor: inputTelefonoCode.valor, 
                    validado: false,
                    textoAyuda: "Error: "+res.data.payload.message,
                });
            }
            if(res.data.status === "OK"){
                set_telefonoValidadoPorSMS(true);
            }    
        }).catch(err => {
            console.log(err);
            set_inputTelefonoCode({
                valor: inputTelefonoCode.valor, 
                validado: false,
                textoAyuda: "Error: "+err.message,
            });
        });
    }

    const getDatosExternos = (ID)=>{
        axios.request({
            url: "https://app.arani.hn/api/app/getDNI.php",
            method: "post",
            data: {
                ID: ID,
            },
        })
        .then((res) => {
            
            // set_ventanaSeEncontoDataDB(true);
            if(res.data.status === "ER"){
                
            }
            if(res.data.status === "OK"){
                console.log(res.data.payload);
                if(Object.keys(res.data.payload).length){
                    set_dataUsuarioRDB(res.data.payload);
                }else{
                    set_dataUsuarioRDB(false);
                }
                // set_ventanaSeEncontoDataDB(true);
                
            }
        }).catch(err => {
            console.log(err);
            
        });
    }


    // const cambiarDataFormPorDataDB = ()=>{
    //     set_inputGenero({...inputGenero, valor: '', validado: false});
    //     if(set_dataUsuarioRDB.COD_SEXO === '1'){
    //         set_inputGenero({...inputGenero, valor: 'M', validado: true});
    //     }
    //     if(set_dataUsuarioRDB.COD_SEXO === '2'){
    //         set_inputGenero({...inputGenero, valor: 'F', validado: true});
    //     }
    //     set_inputNombre1({...inputNombre1, valor: "", validado: false});
    //     if(set_dataUsuarioRDB.DES_PRIMER_NOMBRE){
    //         let txtori = set_dataUsuarioRDB.DES_PRIMER_NOMBRE.toLowerCase();
    //         let txtcapitalized =  txtori.charAt(0).toUpperCase()+ txtori.slice(1);
    //         set_inputNombre1({...inputNombre1, valor: txtcapitalized, validado: true});
    //     }
    //     set_inputNombre3({...inputNombre3, valor: "", validado: false});
    //     if(set_dataUsuarioRDB.DES_PRIMER_APELLIDO){
    //         let txtori = set_dataUsuarioRDB.DES_PRIMER_APELLIDO.toLowerCase();
    //         let txtcapitalized =  txtori.charAt(0).toUpperCase()+ txtori.slice(1);
    //         set_inputNombre3({...inputNombre3, valor: txtcapitalized, validado: true});
    //     }
    //     set_inputFechaNac({...inputFechaNac, valor: "", validado: false});
    //     if(set_dataUsuarioRDB.FECHA_NACIMIENTO){
    //         set_inputFechaNac({...inputFechaNac, valor: moment(set_dataUsuarioRDB.FECHA_NACIMIENTO)._d, validado: true});
    //     }
    // }

    const enviarARegistroApi = ()=>{
        set_enviandoDataFinal(true);
        axios.request({
            url: "https://app.arani.hn/api/app/register.php",
            method: "post",
            withCredentials: true,
            data: {
                "UsrDNI": inputIdentidad.valor,
                "UsrNom1": inputNombre1.valor,
                "UsrNom2": inputNombre2,
                "UsrApe1": inputNombre3.valor,
                "UsrApe2": inputNombre4,
                "UsrMail": inputCorreo.valor,
                "UsrGen": inputGenero.valor,
                "UsrPwd": inputPass1.valor,
                "UsrFchNac": moment(inputFechaNac.valor?.$d).format('YYYY-MM-DD'),
                "UsrTel": inputTelefono.valor
              },
        })
        .then((res) => {
            set_enviandoDataFinal(false);
            if(res.data.status === "ER"){
                set_mensajeFinalError(res.data.payload.message);
                set_mensajeFinalOk("");
            }
            if(res.data.status === "OK"){
                set_mensajeFinalError("");
                set_mensajeFinalOk("Cuenta creada correctamente.");
                procesar_login(inputCorreo.valor, inputPass1.valor, function(data){
                    gContext.set_logeado({estado: true, token: data.payload.sid});
                    localStorage.setItem('arani_session_id', data.payload.sid);
                    navigate("/");
                }, function(messageerr){
                    console.log(messageerr);
                });
            }
            if(res.data.status === "ER-API"){
                let errmsj_person_code = "El ID ya esta en uso";
                let errmsj_emain = "El correo ya esta en uso";
                let errmsj_mob_phone = "El teléfono ya esta en uso";
                
                let errorsMsjArra = [];
                if(res.data.errors.email){
                    errorsMsjArra.push(<div key={1}>{errmsj_emain}</div>);
                    set_inputCorreo({
                        valor: '',
                        validado: false,
                        textoAyuda: '',
                    });
                }
                if(res.data.errors.person_code){
                    errorsMsjArra.push(<div key={2}>{errmsj_person_code}</div>);
                    set_inputIdentidad({
                        valor: '',
                        validado: false,
                        textoAyuda: '',
                    });
                }
                if(res.data.errors.mob_phone){
                    errorsMsjArra.push(<div key={3}>{errmsj_mob_phone}</div>);
                    set_inputTelefono({
                        valor: '',
                        validado: false,
                        textoAyuda: '',
                    });
                    set_telefonoValidadoPorSMS(false);
                    set_smsEnEspera(false);
                    set_inputTelefonoCode({
                        valor: '',
                        validado: false,
                        textoAyuda: '',
                    });
                }
                set_mensajeFinalError(errorsMsjArra);
            }
        }).catch(err => {
            console.log(err.message);
            set_mensajeFinalError(err.message);
            set_mensajeFinalOk("");
            set_enviandoDataFinal(false);
        });
    }

    // Validar grupo0
    const validardorGrupo0 = ()=>{

        if(inputIdentidad?.validado && inputNombre1?.validado && inputNombre3?.validado){
            set_pasoValidacionGrupo0(true);
        }else{
            set_pasoValidacionGrupo0(false);
        }
    }
    useEffect(()=>{
        validardorGrupo0();
        // console.log(inputIdentidad);
        // eslint-disable-next-line
    },[inputIdentidad, inputNombre1, inputNombre3])
    // --------------------------------------

    // Validar grupo1
    const validardorGrupo1 = ()=>{
        // console.log(inputFechaNac.valor.$d);
        if(inputFechaNac?.validado && inputGenero?.validado && inputTelefono?.validado && telefonoValidadoPorSMS && inputCorreo.validado){
            set_pasoValidacionGrupo1(true);
        }else{
            set_pasoValidacionGrupo1(false);
        }
    }
    useEffect(()=>{
        validardorGrupo1();
        // eslint-disable-next-line
    },[inputFechaNac, inputGenero, inputTelefono, telefonoValidadoPorSMS, inputCorreo])
    // --------------------------------------

    // Validar grupo2
    const validardorGrupo2 = ()=>{

        if(inputPass1?.validado && inputPass2?.validado && inputAceptoCondiciones){
            set_pasoValidacionGrupo2(true);
        }else{
            set_pasoValidacionGrupo2(false);
        }
    }
    useEffect(()=>{
        validardorGrupo2();
        // eslint-disable-next-line
    },[inputPass1, inputPass2, inputAceptoCondiciones])
    // --------------------------------------


    useEffect(()=>{
        console.log('dataUsuarioRDB', dataUsuarioRDB);
        // console.log('inputGenero', inputGenero);
        let errorData = true;

        if(Object.keys(dataUsuarioRDB).length){
            errorData = false;
            let errorArrayElements = [];

            // let sexoCodeForm = (inputGenero.valor == 'F')?
            // if(dataUsuarioRDB.COD_SEXO === "1" ){
                
            // }

            // Nombre
            let nombreDB = dataUsuarioRDB.DES_PRIMER_NOMBRE?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")||"";
            let nombreForm = inputNombre1.valor?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            if(nombreDB !== nombreForm){
                errorData = true;
                errorArrayElements.push(<Typography sx={{color: 'red'}} key={"1"} variant="body2">- El primer nombre no es correcto.</Typography>);
            }

            // Nombre2
            let nombre2DB = dataUsuarioRDB.DES_SEGUNDO_NOMBRE?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")||"";
            console.log('nombre2DB', nombre2DB);
            let nombre2Form = inputNombre2.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            if(nombre2DB !== nombre2Form){
                errorData = true;
                errorArrayElements.push(<Typography sx={{color: 'red'}} key={"2"} variant="body2">- El segundo nombre no es correcto.</Typography>);
            }
    
            // Apellido
            let apellidoDB = dataUsuarioRDB.DES_PRIMER_APELLIDO?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")||"";
            let apellidoForm = inputNombre3.valor?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            if(apellidoDB !== apellidoForm){
                errorData = true;
                errorArrayElements.push(<Typography sx={{color: 'red'}} key={"3"} variant="body2">- El primer apellido no es correcto.</Typography>);
            }
    
            // Apellido2
            let apellido2DB = dataUsuarioRDB.DES_SEGUNDO_APELLIDO?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")||"";
            let apellido2Form = inputNombre4.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            if(apellido2DB !== apellido2Form){
                errorData = true;
                errorArrayElements.push(<Typography sx={{color: 'red'}} key={"4"} variant="body2">- El segundo apellido no es correcto.</Typography>);
            }
            

            let sexoDB = dataUsuarioRDB.COD_SEXO;
            let sexoForm = '';
            if(inputGenero.valor === 'F') sexoForm = '2';
            if(inputGenero.valor === 'M') sexoForm = '1';
            if(sexoDB !== sexoForm){
                errorData = true;
                errorArrayElements.push(<Typography sx={{color: 'red'}} key={"5"} variant="body2">- El sexo seleccionado no es correcto.</Typography>);
            }
            
            // Nacimiento
            let fechanacDB = moment(dataUsuarioRDB.FECHA_NACIMIENTO).format('L');
            let fechanacForm = moment(inputFechaNac.valor?.$d).format('L');
            // console.log('fechanacDB', fechanacDB);
            // console.log('fechanacForm', fechanacForm);
            if(fechanacDB !== fechanacForm){
                errorData = true;
                errorArrayElements.push(<Typography sx={{color: 'red'}} key={"6"} variant="body2">- La fecha de nacimiento no es correcta.</Typography>);
            }

            // set_ventanaSeEncontoDataDB(true);
            if(errorData){
                set_ventanaSeEncontoDataDB(true);
                set_errorComprosDB(errorArrayElements);
                // console.log('errorArrayElements', errorArrayElements);
            }else{
                set_ventanaSeEncontoDataDB(false);
                set_errorComprosDB(false);
                // console.log('errorArrayElements', errorArrayElements);
            }
        }else{
            set_ventanaSeEncontoDataDB(false);
        }


    },[dataUsuarioRDB, inputGenero, inputNombre1, inputNombre2, inputNombre3, inputNombre4, inputFechaNac]);

    return (
        <Box>
            <Typography variant="body1" sx={{mb: 3}} >
                Para empezar a solicitar préstamos debes rellenar los siguientes campos con la información correcta. 
            </Typography>
            <Stepper activeStep={activeStep} orientation="vertical">
                <Step key={0}>
                    <StepLabel optional={<Typography variant="caption">Primer paso</Typography>}>Identidad</StepLabel>
                    <StepContent>
                        <Box>
                            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                                <Grid item xs={12} sm={12}>
                                    <TextField 
                                        required 
                                        autoFocus={!inputIdentidad.valor} 
                                        autoComplete="off" 
                                        fullWidth 
                                        label="Número de identidad" 
                                        onBlur={()=>{set_inputIdentidad({...inputIdentidad, blur: true})}}
                                        value={inputIdentidad.valor} 
                                        onChange={handleChange_inputIdentidad} 
                                        error={(!inputIdentidad.validado && inputIdentidad.blur)} 
                                        helperText={inputIdentidad.textoAyuda} 
                                        />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        autoComplete="off"
                                        fullWidth
                                        label="Primer nombre"
                                        onBlur={()=>{set_inputNombre1({...inputNombre1, blur: true})}}
                                        value={inputNombre1.valor}
                                        onChange={handleChange_inputNombre1}
                                        error={(!inputNombre1.validado && inputNombre1.blur)} 
                                        helperText={inputNombre1.textoAyuda} 
                                        />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        autoComplete="off"
                                        fullWidth
                                        label="Segundo nombre"
                                        value={inputNombre2}
                                        onChange={handleChange_inputNombre2}
                                        helperText="" 
                                        />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        autoComplete="off"
                                        fullWidth
                                        label="Primer apellido"
                                        id="primerapellidoreg"
                                        required
                                        onBlur={()=>{set_inputNombre3({...inputNombre3, blur: true})}}
                                        value={inputNombre3.valor}
                                        onChange={handleChange_inputNombre3}
                                        error={(!inputNombre3.validado && inputNombre3.blur)}
                                        helperText={inputNombre3.textoAyuda}
                                        />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        autoComplete="off"
                                        fullWidth
                                        label="Segundo apellido"
                                        value={inputNombre4}
                                        onChange={handleChange_inputNombre4}
                                        helperText=""
                                        />
                                </Grid>
                                
                                <Grid item xs={12} sm={12}>
                                    <Button disabled={(pasoValidacionGrupo0)?false:true} variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }} >Paso siguiente</Button>
                                    <Button disabled={true} onClick={handleBack} sx={{ mt: 1, mr: 1 }} >Paso anterior</Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </StepContent>
                </Step>
                <Step key={1}>
                    <StepLabel optional={<Typography variant="caption">Segundo paso</Typography>}>Datos personales</StepLabel>
                    <StepContent>
                        <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    autoComplete="off"
                                    fullWidth
                                    label="Correo electrónico"
                                    required
                                    onBlur={()=>{set_inputCorreo({...inputCorreo, blur: true})}}
                                    value={inputCorreo.valor}
                                    onChange={handleChange_inputCorreo}
                                    error={(!inputCorreo.validado && inputCorreo.blur)}
                                    helperText={inputCorreo.textoAyuda}
                                    />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel onBlur={()=>{set_inputGenero({...inputGenero, blur: true})}} required error={(!inputGenero.validado && inputGenero.blur)}>Genero</InputLabel>
                                    <Select onBlur={()=>{set_inputGenero({...inputGenero, blur: true})}} required value={inputGenero.valor} onChange={handleChange_inputGenero} label="Genero" error={(!inputGenero.validado && inputGenero.blur)}>
                                        <MenuItem value={"M"}>Hombre</MenuItem>
                                        <MenuItem value={"F"}>Mujer</MenuItem>
                                    </Select>
                                    <FormHelperText>{inputGenero.textoAyuda}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"es"}>
                                    <DatePicker
                                        fullWidth
                                        openTo="year"
                                        maxDate={moment().subtract(21, 'years')._d}
                                        minDate={moment().subtract(80, 'years')._d}
                                        label="Nacimiento"
                                        value={inputFechaNac.valor}
                                        onChange={handleChange_inputFechaNac}
                                        renderInput={(params) => <TextField {...params} onBlur={()=>{set_inputFechaNac({...inputFechaNac, blur: true})}} autoComplete="off" fullWidth required helperText={inputFechaNac.textoAyuda} error={(!inputFechaNac.validado && inputFechaNac.blur)} />}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    autoComplete="off"
                                    label="Teléfono móvil"
                                    required 
                                    onBlur={()=>{set_inputTelefono({...inputTelefono, blur: true})}}
                                    disabled={(telefonoValidadoPorSMS || smsEnEspera)} 
                                    value={inputTelefono.valor} 
                                    onChange={handleChange_inputTelefono} 
                                    error={(!inputTelefono.validado && inputTelefono.blur)} 
                                    helperText={inputTelefono.textoAyuda} 
                                    />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Tooltip placement="top" title="Te enviaremos un mensaje de texto a tu teléfono celular con un código para que valides que realmente eres tú el dueño de ese teléfono. Ingresa ese código en el siguiente campo de texto llamado 'Código SMS'.">
                                    <span>
                                        <Button fullWidth disabled={(!inputTelefono.validado || enviandoSMSTel || smsEnEspera || telefonoValidadoPorSMS)} variant="contained" onClick={validarTel} sx={{ mt: 1, mr: 1 }} >{(enviandoSMSTel || smsEnEspera || telefonoValidadoPorSMS)?"Enviado":"Enviar sms"}</Button>
                                    </span>
                                </Tooltip>
                                {(smsEnEspera && !telefonoValidadoPorSMS) && <Typography variant="body2" sx={{textAlign: "center", color: 'silver'}} >Reenviar ({contadorReenvioSMS}s)</Typography>}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth autoComplete="off" disabled={(telefonoValidadoPorSMS || !smsEnEspera)}  label="Código SMS" required value={inputTelefonoCode.valor} onChange={handleChange_inputTelefonoCode} error={(!inputTelefonoCode.validado && smsEnEspera)} helperText={inputTelefonoCode.textoAyuda} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button fullWidth variant="contained" disabled={(!inputTelefonoCode.validado || telefonoValidadoPorSMS || !smsEnEspera)} onClick={fnValidarCodigoSMS} sx={{mt:1, mb:1}}>{(telefonoValidadoPorSMS)?"Validado":"Confirmar"}</Button>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <Button disabled={(pasoValidacionGrupo1)?false:true} variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }} >Paso siguiente</Button>
                                <Button disabled={false} onClick={handleBack} sx={{ mt: 1, mr: 1 }} >Paso anterior</Button>
                            </Grid>
                        </Grid>
                    </StepContent>
                </Step>
                <Step key={2}>
                    <StepLabel optional={<Typography variant="caption">Último paso</Typography>}>Datos de cuenta</StepLabel>
                    <StepContent>
                        <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                            <Grid item xs={12} sm={12}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel required error={(!inputPass1.validado && inputPass1.blur)}>Contraseña</InputLabel>
                                    <OutlinedInput 
                                        required 
                                        autoComplete="off" 
                                        fullWidth id="inputPass1" 
                                        type={(inputPassVisible) ? 'text' : 'password'} 
                                        value={inputPass1.valor} 
                                        onChange={handleChange_inputPass1} 
                                        onBlur={()=>{set_inputPass1({...inputPass1, blur: true})}}
                                        label="Contraseña" 
                                        error={(!inputPass1.validado && inputPass1.blur)}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClick_mostrarpass} onMouseDown={(e)=>{e.preventDefault()}} edge="end">
                                                    {(inputPassVisible) ? <span className="material-symbols-outlined">visibility_off</span>: <span className="material-symbols-outlined">visibility</span>}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        />
                                    <FormHelperText error={(!inputPass1.validado && inputPass1.blur)} >{inputPass1.textoAyuda}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel required error={(!inputPass2.validado && inputPass2.blur)}>Repetir contraseña</InputLabel>
                                    <OutlinedInput 
                                        required
                                        autoComplete="off"
                                        fullWidth
                                        id="inputPass2"
                                        onBlur={()=>{set_inputPass2({...inputPass2, blur: true})}}
                                        type={(inputPassVisible)?'text':'password'}
                                        value={inputPass2.valor}
                                        onChange={handleChange_inputPass2}
                                        label="Repetir contraseña"
                                        error={(!inputPass2.validado && inputPass2.blur)}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClick_mostrarpass} onMouseDown={(e)=>{e.preventDefault()}} edge="end">
                                                    {(inputPassVisible) ? <span className="material-symbols-outlined">visibility_off</span>: <span className="material-symbols-outlined">visibility</span>}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        />
                                    <FormHelperText error={(!inputPass2.validado && inputPass2.blur)}>{inputPass2.textoAyuda}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <Typography>
                                    <Checkbox checked={inputAceptoCondiciones} onChange={handleChange_inputAceptoCondiciones} />
                                    Acepto <a href="https://aranih.com/politicadeprivacidad.html" target="_blank" rel="noopener noreferrer">politica de privacidad</a>, <a href="https://aranih.com/terminosycondiciones.html" target="_blank" rel="noopener noreferrer">condiciones.</a>
                                </Typography>
                                <Dialog open={ventanaCondicionesOpen} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
                                    <DialogTitle id="alert-dialog-title">{"Terminos y condiciones"}</DialogTitle>
                                    <DialogContent>
                                            <TextoCondiciones />
                                    </DialogContent>
                                    <DialogActions>
                                    <Button onClick={()=>{ set_ventanaCondicionesOpen(false); set_inputAceptoCondiciones(false); }}>No acepto</Button>
                                    <Button autoFocus onClick={()=>{ set_ventanaCondicionesOpen(false); set_inputAceptoCondiciones(true); }}>Acepto</Button>
                                    </DialogActions>
                                </Dialog>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <Button variant="contained" disabled={!pasoValidacionGrupo2} onClick={handleNext} sx={{ mt: 1, mr: 1 }} >Siguiente</Button>
                                <Button disabled={false} onClick={handleBack} sx={{ mt: 1, mr: 1 }} >Volver</Button>
                            </Grid>
                        </Grid>
                    </StepContent>
                </Step>
            </Stepper>
            {activeStep === 3 && (
                <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                    <Grid item xs={12} sm={12}>
                        <Dialog open={ventanaSeEncontoDataDB} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
                            <DialogTitle id="alert-dialog-title">{"Coincidencia encontrada"}</DialogTitle>
                            <DialogContent sx={{maxWidth: '30rem'}}>
                                <Typography>Los datos proporcionados no concuerdan con nuestros registro, por favor revise que su información sea correcta.</Typography>
                                <Divider sx={{mb: 2, mt:2}}>Errores</Divider>
                                {errorComprosDB}
                            </DialogContent>
                            <DialogActions>
                            {/* <Button onClick={()=>{ set_ventanaSeEncontoDataDB(false); }}>Ignorar</Button> */}
                            <Button autoFocus onClick={()=>{ handleReset(); }}>Revisar</Button>
                            </DialogActions>
                        </Dialog>
                        <Typography sx={{}}>Has terminado todos los pasos, presiona el siguiente boton para terminar el proceso de registro.</Typography>
                        {mensajeFinalError && <Typography variant="body2" sx={{color: 'red', pt: 2, pb: 1}}><b>Error: </b>{mensajeFinalError}</Typography>}
                        {mensajeFinalOk && 
                            <Typography variant="body2" sx={{color: 'green', pt: 2, pb: 1}}>
                                <span style={{display: 'inline-block', verticalAlign: 'middle'}} className="material-symbols-outlined">check_circle</span>
                                <span style={{display: 'inline-block', verticalAlign: 'middle', marginLeft: '0.5rem', lineHeight: '1'}}>{mensajeFinalOk}</span>
                            </Typography>}
                    </Grid>
                    {mensajeFinalOk && 
                        <Grid item xs={12} sm={12}><Button component={Link} to="/login" fullWidth variant="contained" sx={{ mt: 1, mr: 1 }}>Volver al formulario de ingreso</Button></Grid>
                    }
                    {!mensajeFinalOk && 
                        <>
                            <Grid item xs={12} sm={6}><Button fullWidth disabled={enviandoDataFinal} onClick={enviarARegistroApi} variant="contained" sx={{ mt: 1, mr: 1 }}>{(enviandoDataFinal)?"Enviando...":"Terminar registro"}</Button></Grid>
                            <Grid item xs={12} sm={6}><Button fullWidth variant="text" onClick={handleReset} sx={{ mt: 1, mr: 1 }}>Reiniciar</Button></Grid>
                        </>
                    }
                </Grid>
            )}
        </Box>
    );
}


function Registro(){
    return (
        <Container disableGutters sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"    }} component="main" maxWidth="sm">
            <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", p: '4px'}}>
                <Box sx={{textAlign: 'center', pt: 2, pb: 5}}>
                    <img style={{ maxHeight: "5rem" }} alt="Logo Arani" src={logoArani} />
                </Box>
                <Paper>
                    <AppBar sx={{borderRadius: "0.5rem 0.5rem 0 0"}} position="static">
                        <Toolbar>
                            <IconButton component={Link} to="/login" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                                <span className="material-symbols-outlined">arrow_back</span>
                            </IconButton>
                            <Typography variant="h6" color="inherit" component="div">Registrarse una cuenta</Typography>
                        </Toolbar>
                    </AppBar>
                    <Box sx={{ p: 6 }}>
                        <VerticalLinearStepper2 />
                    </Box>
                </Paper>
                <BarraFinal />
            </Box>
        </Container>
    );
}

export default Registro;

function TextoCondiciones(){
    return (
        <div>
            The standard Lorem Ipsum passage, used since the 1500s
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC
            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
            1914 translation by H. Rackham
            "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"
            Section 1.10.33 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC
            "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
            1914 translation by H. Rackham
            "On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains."
        </div>
    )
}