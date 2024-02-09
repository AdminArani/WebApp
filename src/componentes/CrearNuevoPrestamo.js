import Box from "@mui/material/Box";
// import logoArani from "./images/logoarani.png";
import { Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, Divider, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, TextField, Typography, useMediaQuery } from "@mui/material";
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
        if(valor < params.pricelistData.PriMntDes){
            validado = false;
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
                console.log(res.data.payload.message);
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


    function crearPrestamoApi(){
        set_yaIntentoEnviar(true);
        // amount
        // productId
        // period
        // sid
        // purpose
        // console.log({
        //     sid: gContext.logeado.token,
        //     period: inputPeriodo.valor,
        //     amount: inputCantidadDinero.valor,
        //     purpose: inputProposito.valor,
        //     productId: params.productSelected.ProCod,
        //   });
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
            }
        }).catch(err => {
            set_enviandoAlApi(false);
            set_seRegistro(true);
            console.log(err.message);
        });
    }

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


    // useEffect(()=>{
    //     set_cargandoPermisoP(true);
    //     axios.request({
    //         url: "https://app.arani.hn/api/app/getPriceList.php",
    //         method: "post",
    //         withCredentials: true,
    //         data: {
    //             sid: gContext.logeado.token,
    //             productId: params.productSelected.ProCod,
    //           },
    //     })
    //     .then((res) => {
    //         set_cargandoPermisoP(false);
    //         if(res.data.status === "ER"){
    //         }
    //         if(res.data.status === "OK"){
    //             console.log(res.data.payload[params.productSelected.ProCod]);
    //             let datarango = res.data.payload[params.productSelected.ProCod];
    //             if(datarango){
    //                 set_permisoP(true);
    //                 set_params.pricelistData({
    //                     PriMntDes: datarango.PriMntDes,
    //                     PriMntHas: datarango.PriMntHas,
    //                     PriTerDes: datarango.PriTerDes,
    //                     PriTerHas: datarango.PriTerHas,
    //                 });
    //             }else{
    //                 set_permisoP(false);
    //             }
    //         }
    //     }).catch(err => {
    //         console.log(err.message);
    //     });
    //     // eslint-disable-next-line
    // },[]);
    
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

            // Sacamos el interes por periodo
            var interesPeriodo = params.pricelistData.PriInt;
            if(tipo === 'semanal') set_interesPeriodo(numeral(interesPeriodo/52.1429).format('0,0.00'));
            if(tipo === 'quincenal') set_interesPeriodo(numeral(interesPeriodo/26.0714).format('0,0.00'));
            if(tipo === 'mensual') set_interesPeriodo(numeral(interesPeriodo/12).format('0,0.00'));
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


    const change_inputAceptoContrato = (e)=>{
        set_inputAceptoContrato(e.target.checked);
        if(e.target.checked){
            set_ventanaContrato(true);
        }
    }

    const change_inputAceptoBanco = (e)=>{
        set_inputAceptoBanco(e.target.checked);
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


    useEffect(()=>{
        getInformacionUsuario();
        cargarContratoTemplate();
        // eslint-disable-next-line
    },[])

    return (
        <Box sx={{p: '4px'}}>
            
            <Box>
                {enviandoAlApi &&
                <div>
                    <Typography variant="body1" sx={{pt: 1, pb: 3}} >Enviando....</Typography>
                </div>
                }
                {(!enviandoAlApi && seRegistro) && 
                <div>
                    <Typography variant="h5" sx={{pt: 1, pb: 0}} >Solicitud de préstamo</Typography>
                    <Typography variant="body2" sx={{pt: 1, pb: 5}} >Su solicitud de préstamo ha sido enviada, ahora solo tiene que esperar a que nuestros agentes verifiquen su información para que el dinero sea desembolsado.</Typography>
                    <Typography variant="body2" sx={{}} >Resumen</Typography>
                    <Divider sx={{ mb: 1, mt: 1 }}></Divider>
                    <Typography variant="body2" sx={{}} >Cantidad: L {numeral(inputCantidadDinero.valor).format('0,0.00')}</Typography>
                    <Typography variant="body2" sx={{}} >Total de pagos: {inputPeriodo.valor/diasPorPerSel}</Typography>
                    <Typography variant="body2" sx={{}} >Periodicidad: {params.productSelected.ProTip}</Typography>
                    <Typography variant="body2" sx={{}} >Interes: {interesPeriodo}%</Typography>
                    <Divider sx={{ mb: 6, mt: 1 }}></Divider>
                   
                    <Button onClick={todobiencallback} variant="contained" sx={{ mt: 1, mr: 1 }} >Aceptar y continuar</Button>
                </div>
                }
                {(!enviandoAlApi && !seRegistro) && <>
                <Typography variant="body2" sx={{}} >Llena los campos siguientes para solicitar tu préstamo, una vez aprobado recibirás el dinero. </Typography>
                <Grid sx={{mt: 1, mb: 1}} container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            helperText={inputCantidadDinero.textoAyuda} 
                            required value={inputCantidadDinero.valor} 
                            onChange={handleChange_inputCantidadDinero} 
                            error={(!inputCantidadDinero.validado && yaIntentoEnviar)} 
                            autoComplete="off" 
                            fullWidth 
                            label="Cantidad de dinero" 
                            />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        {/* <TextField 
                            helperText={inputPeriodo.textoAyuda} 
                            required value={inputPeriodo.valor} 
                            onChange={handleChange_inputPeriodo} 
                            error={(!inputPeriodo.validado && yaIntentoEnviar)} 
                            autoComplete="off" 
                            fullWidth 
                            label="Tiempo para pagar (días)" 
                            /> */}
                        <FormControl fullWidth>
                            <InputLabel required error={(!inputPeriodo.validado && yaIntentoEnviar)}>A pagar en:</InputLabel>
                            <Select required value={inputPeriodo.valor} onChange={handleChange_inputPeriodo} label="Proposito del préstamo" error={(!inputPeriodo.validado && yaIntentoEnviar)}>
                               {listadoPeriodos}
                            </Select>
                        </FormControl>
                    </Grid>

                    

                    <Grid item xs={12} sm={12}>
                        <FormControl fullWidth>
                            <InputLabel error={(!inputProposito.validado && yaIntentoEnviar)}>Proposito del préstamo</InputLabel>
                            <Select value={inputProposito.valor} onChange={handleChange_inputProposito} label="Proposito del préstamo" error={(!inputProposito.validado && yaIntentoEnviar)}>
                                {Object.keys(params.purposeListaObj).map((key)=>{
                                    return (
                                        <MenuItem key={key} value={params.purposeListaObj[key].id}>{params.purposeListaObj[key].title}</MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    

                    <Grid item xs={12} sm={12}>
                        <div></div>
                        <FormControlLabel
                            label={"Mi información bancaria es correcta"}
                            control={<Checkbox checked={inputAceptoBanco} onChange={change_inputAceptoBanco} />}
                        />
                        <Dialog open={ventanaContrato} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
                            {/* <DialogTitle id="alert-dialog-title">Contrato de préstamo Arani</DialogTitle> */}
                            <DialogContent>
                                {parse(contratoFinal||"")}
                            </DialogContent>
                            <DialogActions>
                            <Button onClick={()=>{ set_ventanaContrato(false); set_inputAceptoContrato(false); }}>No acepto</Button>
                            <Button autoFocus onClick={()=>{ set_ventanaContrato(false); set_inputAceptoContrato(true); }}>Acepto</Button>
                            </DialogActions>
                        </Dialog>
                    </Grid>

                    <Grid item xs={12} sm={12}>
                        <Button onClick={()=>{set_openEditarBanco(true)}} variant="contained">Revisar o actualizar cuenta de banco</Button>
                        <Dialog onClose={()=>{set_openEditarBanco(false)}} open={openEditarBanco}>
                            <DialogContent>
                                <FormCambiarBanco setOpen={set_openEditarBanco} />
                            </DialogContent>
                        </Dialog>
                    </Grid>

                    <Grid item xs={12} sm={12}>
                        <FormControlLabel
                            disabled={!validadoParaContrato}
                            label={"Acepto el contrato de préstamo"}
                            control={<Checkbox checked={inputAceptoContrato} onChange={change_inputAceptoContrato} />}
                        />
                    </Grid>

                   

                    <Grid item xs={12} sm={12}>
                        Tasa {params.productSelected.ProTip} es de {interesPeriodo}%
                    </Grid>
                    
                   
                    <Grid onClick={()=>{set_yaIntentoEnviar(true)}} item xs={12} sm={12}>
                        <Button onClick={crearPrestamoApi} disabled={!botonEnviarHabilitado} variant="contained" sx={{ mt: 1, mr: 1 }} >Enviar solicitud</Button>
                        <Button onClick={()=>{cerrarVentana()}} variant="contained" sx={{ mt: 1, mr: 1 }} >Cancelar</Button>
                    </Grid>
                </Grid>
                </>
                }
                {/* {(!enviandoAlApi && !seRegistro && !permisoP) && <>
                    <Typography component={"div"} variant="body2" sx={{p: '0 0 2rem 0'}} >
                        {(cargandoPermisoP)?
                        <div>Cargando....</div>:
                        <><div>Tu perfil actual no permite solicitar este tipo de préstamo.</div><Button onClick={()=>{cerrarVentana()}} variant="contained" sx={{ mt: 1, mr: 1 }} >Cerrar</Button></>
                        }
                    </Typography>
                </>} */}
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
                <Typography variant="h5" sx={{}} >Actualizar banco</Typography>
                <Typography variant="body" sx={{mb: '1rem'}} >A la siguiente cuenta de banco se enviara el dinero del préstamo, si su cuenta de banco es correcta no la actulice.</Typography>
                <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputBanco({...inputBanco, blur: true})}} required error={(!inputBanco.validado && inputBanco.blur)}>Banco</InputLabel>
                        <Select onBlur={()=>{set_inputBanco({...inputBanco, blur: true})}} required value={inputBanco.valor} onChange={handleChange_inputBanco} label="Banco" error={(!inputBanco.validado && inputBanco.blur)}>
                            {Object.keys(apiCamposConstructor?.bank?.values).map((key)=>{
                                return ((key)?<MenuItem key={key} value={key}>{apiCamposConstructor?.bank?.values[key]}</MenuItem>:'');
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        helperText={inputCuentaBanco.textoAyuda} 
                        required value={inputCuentaBanco.valor} 
                        onBlur={()=>{set_inputCuentaBanco({...inputCuentaBanco, blur: true})}}
                        onChange={handleChange_inputCuentaBanco} 
                        error={(!inputCuentaBanco.validado && inputCuentaBanco.blur)} 
                        autoComplete="off" 
                        fullWidth 
                        label={"# de cuenta" }
                        />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <Typography variant="body2" sx={{mb: '1rem', color: '#ff4d4d'}} >{errorAjax}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar"}</Button>
                        <Button onClick={()=>{setOpen(false)}} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
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



// function textContrato(){
//     return "<h1>CONTRATO DE PRESTAMO</h1> Yo, $$NOMBRE COMPLETO$$, mayor de edad, HONDUREÑO, $$ESTADO CIVIL$$, con domicilio en $$CIUDAD$$, $$$DEPARTAMENTO$ y con IDENTIDAD No. $$IDENTIDAD$$, en adelante y para los efectos del presente contrato denominado como EL PRESTATARIO, declaro que he recibido en Préstamo de ARANI INVESTMENT S.A., que en lo sucesivo se denominará únicamente por abreviatura ARANI con Registro Tributario Nacional número 0801198100530, hemos convenido celebrar y en efecto celebramos un contrato de préstamo, que se regirá por las estipulaciones que a continuación se consignan: PRIMERO: CONDICIONES GENERALES DEL PRÉSTAMO A. Monto: ARANI otorga en calidad de préstamo al prestatario la suma de $$MONTO$$: B. Plazo: El plazo del préstamo será de $$PLAZOS$$. C. Forma de Pago: EL PRÉSTAMO SERÁ AMORTIZADO MEDIANTE CUOTAS $$NUMERO de CUOTAS$$ de CUOTAS FIJAS calculadas por ARANI una vez recaudados los fondos más el importe de los seguros que correspondan y ARANI considere necesarios anexados al plan de pagos y se compromete a pagarlo bajo los términos que ARANI estime conveniente, El préstamo cuenta con un seguro de deuda. D. Lugar de Pago: El prestatario pagará el préstamo en cualquiera de los medios digitales establecidos por ARANI, y demás formas que designe, sin necesidad de requerimiento alguno. E. Intereses. El préstamo devengará un interés del $$INTERESES$$ % calculado de acuerdo con las políticas de ARANI. Siendo convenido y entendido, e incondicionalmente aceptado que esta tasa de interés queda sujeta a la revisión periódica, a las variaciones tanto del Banco Central de Honduras, como a la política crediticia interna , a la flotación o liberación de tasas, a la fluctuación del Lempira y otras causas, en consecuencia, la tasa de interés se fijará en documento unilateral a juicio exclusivo de ARANI, sin comunicación previa al prestatario y de conformidad a los cambios que pudieran producirse en la fijación de la tasa de interés para operaciones activas. F. Destino: INVERSION $$MONTO$$ si el prestatario ha destinado los fondos a una finalidad distinta a la pactada en este contrato, ARANI aplicará un incremento a la tasa de interés de conformidad al uso que el prestatario le dio a la inversión según los productos financieros de ARANI y según su garantía. G. Capitalización: Se deducirá un porcentaje único del monto del préstamo a refinanciar, las comisiones de desembolso estipuladas según reglamento de crédito. H. Desembolsos: Al prestatario se le desembolsará el préstamo de acuerdo con las condiciones descritas en la resolución del crédito. I. Mora: a) Constituirá mora la falta de pago de una (1) cuota o más  en la fecha estipulada ya sea en capital o intereses y se le aplicará un recargo del $$MORA$$ % semanal calculado sobre el monto  del capital prestado , de igual manera queda claro que a la falta de pago de dos meses consecutivos ARANI dará derecho a ejecución judicial sin necesidad de requerimiento corriendo por cuenta del prestatario todos los gastos ocasionados por el proceso judicial.: En el presente contrato quedan ambas partes a dar fiel cumplimiento a todos y cada uno de los términos establecidos en el presente contrato. Para constancia firman este contrato en $$CIUDAD$$, A LOS $$DIAS EN LETRAS$$  DIAS DEL MES DE $$NOMBRE MES$$ DEL AÑO $$AÑO$$. Dicha fecha puede cambiar una vez liberados los fondos por parte de ARANI.";
// }