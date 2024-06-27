import Box from "@mui/material/Box";
// import logoArani from "./images/logoarani.png";
import { Button, Dialog, DialogContent, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography, useMediaQuery } from "@mui/material";
import { useContext, useEffect, useState } from "react";
// import axios from "axios";
import { AppContext } from "../App";
import axios from "axios";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/es';
import moment from "moment";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from "@emotion/react";

function TerminarRegistroForm({todobiencallback, cerrar}) {
    const gContext = useContext(AppContext);
    // const [cargando, set_cargando] = useState(false);
    // const [msgErrorForm, set_msgErrorForm] = useState(false);
    // const [yaIntentoEnviar, set_yaIntentoEnviar] = useState(false);
    const [botonEnviarHabilitado, set_botonEnviarHabilitado] = useState(false);
    const [seRegistro, set_seRegistro] = useState(false);

    const [inputCuentaBanco, set_inputCuentaBanco] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputBanco, set_inputBanco] = useState({valor: '', validado: false, textoAyuda: "", blur: false});
    const [inputEstadoCivil, set_inputEstadoCivil] = useState({valor: '', validado: false, textoAyuda: ""});
    const [inputVivienda, set_inputVivienda] = useState({valor: '', validado: false, textoAyuda: ""});
    const [inputTipoIngresos, set_inputTipoIngresos] = useState({valor: '', validado: false, textoAyuda: ""});
    const [inputIngresosMensuales, set_inputIngresosMensuales] = useState({valor: '', validado: false, textoAyuda: ""});
    const [inputNumeroDependientes, set_inputNumeroDependientes] = useState({valor: '', validado: false, textoAyuda: ""});
    const [inputFechaIngresoTrabajo, set_inputFechaIngresoTrabajo] = useState({valor: '', validado: false});
    const [inputTipoNegocio, set_inputTipoNegocio] = useState({valor: '', validado: false});
    const [cargandoRegister2, set_cargandoRegister2] = useState(false);
    const [apiCamposConstructor, set_apiCamposConstructor] = useState(false);
  

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

    function handleChange_inputEstadoCivil(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputEstadoCivil({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputEstadoCivil.blur,
        });
    }

    function handleChange_inputVivienda(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputVivienda({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputVivienda.blur,
        });
    }

    function handleChange_inputTipoIngresos(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputTipoIngresos({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputTipoIngresos.blur,
        });
    }

    function handleChange_inputIngresosMensuales(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Agregue un número.";
        if(parseInt(valor) >= 1){
            validado = true;
            texto = "";
            valor = parseInt(valor);
        }
        set_inputIngresosMensuales({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputIngresosMensuales.blur,
        });
    }


    function handleChange_inputNumeroDependientes(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Agregue un número.";
        if(parseInt(valor) >= 0){
            validado = true;
            texto = "";
            valor = parseInt(valor);
        }
        set_inputNumeroDependientes({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputNumeroDependientes.blur,
        });
    }

    function handleChange_inputFechaIngresoTrabajo(nuevoValor){
        let valor = nuevoValor;
        let validado = false;
        if(nuevoValor?.$d){
            validado = true;
        }
        set_inputFechaIngresoTrabajo({
            validado: validado,
            valor: valor,
            blur: inputFechaIngresoTrabajo.blur,
        });
    }

    function handleChange_inputTipoNegocio(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputTipoNegocio({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputTipoNegocio.blur,
        });
    }


    function enviarARegistroApi2(){
        // set_yaIntentoEnviar(true);
        set_cargandoRegister2(true);
        axios.request({
            url: "https://app.arani.hn/api/app/register2.php",
            method: "post",
            withCredentials: true,
            data: {
                sid: gContext.logeado.token,
                UsrBan: inputBanco.valor,
                UsrBanNum: inputCuentaBanco.valor,
                UsrEstCiv: inputEstadoCivil.valor,
                UsrTipCli: inputTipoIngresos.valor,
                UsrTipViv: inputVivienda.valor,
                UsrNumDep: inputNumeroDependientes.valor,
                UsrIng: inputIngresosMensuales.valor,
                UsrFchLabIni: moment(inputFechaIngresoTrabajo.valor?.$d).format('YYYY-MM-DD'),
                UsrBussines: inputTipoNegocio.valor,
              },
        })
        .then((res) => {
            set_cargandoRegister2(false);
            if(res.data.status === "ER"){
            }
            if(res.data.status === "OK"){
                set_seRegistro(true);
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    useEffect(()=>{

        set_botonEnviarHabilitado(false);

        if(inputTipoIngresos.valor === 'comerciante'){
            if( inputBanco.validado && 
                inputCuentaBanco.validado && 
                inputEstadoCivil.validado && 
                inputTipoIngresos.validado && 
                inputVivienda.validado && 
                inputNumeroDependientes.validado && 
                inputIngresosMensuales.validado && 
                inputFechaIngresoTrabajo.validado &&
                inputTipoNegocio.validado){
                set_botonEnviarHabilitado(true);
            }
        }
        
        if(inputTipoIngresos.valor === 'asalariado'){
            if( inputBanco.validado && 
                inputCuentaBanco.validado && 
                inputEstadoCivil.validado && 
                inputTipoIngresos.validado && 
                inputVivienda.validado && 
                inputNumeroDependientes.validado && 
                inputIngresosMensuales.validado && 
                inputFechaIngresoTrabajo.validado){
                set_botonEnviarHabilitado(true);
            }
        }

    }, [inputBanco, inputCuentaBanco, inputEstadoCivil, inputTipoIngresos, inputVivienda, inputNumeroDependientes, inputIngresosMensuales, inputFechaIngresoTrabajo, inputTipoNegocio]);


    function cargarDatosSeleccionables(){

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
                console.log(res.data.payload.data);
                set_apiCamposConstructor(res.data.payload.data);
            }
        }).catch(err => {
            console.log(err.message);
        });

    }


    useEffect(()=>{
        cargarDatosSeleccionables();
        // eslint-disable-next-line
    }, []);


    
    return (
        <Box sx={{p: '4px'}}>
            <Typography variant="h4" sx={{pt: 1, pb: 3}} >Completar registro</Typography>
            
            <Box>
                {seRegistro && 
                <div>
                    <Typography variant="body1" sx={{pt: 1, pb: 3}} >Se registro correctamente.</Typography>
                    <Button onClick={todobiencallback} variant="contained" sx={{ mt: 1, mr: 1 }} >Terminar</Button>
                </div>
                }
                {!seRegistro && <>
                <Typography variant="body2" sx={{}} >Para para poder continuar y poder solicitar préstamos es necesario que completes algunos campos adicionales. </Typography>
                {apiCamposConstructor && 
                <Grid sx={{mt: 1, mb: 1}} container spacing={3}>
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
                            label={"# de cuenta ("+apiCamposConstructor?.bank?.values[inputBanco.valor]+")." }
                            />
                    </Grid>
                    
                    
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel onBlur={()=>{set_inputVivienda({...inputVivienda, blur: true})}} required error={(!inputVivienda.validado && inputVivienda.blur)}>Vivienda</InputLabel>
                            <Select onBlur={()=>{set_inputVivienda({...inputVivienda, blur: true})}} required value={inputVivienda.valor} onChange={handleChange_inputVivienda} label="Vivienda" error={(!inputVivienda.validado && inputVivienda.blur)}>
                                {Object.keys(apiCamposConstructor?.home_status?.values).map((key)=>{
                                    return ((key)?<MenuItem key={key} value={apiCamposConstructor?.home_status?.values[key]}><span className="capitalize">{apiCamposConstructor?.home_status?.values[key]}</span></MenuItem>:'');
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel onBlur={()=>{set_inputNumeroDependientes({...inputNumeroDependientes, blur: true})}} required error={(!inputNumeroDependientes.validado && inputNumeroDependientes.blur)}># de dependientes</InputLabel>
                            <Select onBlur={()=>{set_inputNumeroDependientes({...inputNumeroDependientes, blur: true})}} required value={inputNumeroDependientes.valor} onChange={handleChange_inputNumeroDependientes} label="# de dependientes" error={(!inputNumeroDependientes.validado && inputNumeroDependientes.blur)}>
                                <MenuItem value={0}>0</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={8}>8</MenuItem>
                                <MenuItem value={9}>9</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel onBlur={()=>{set_inputTipoIngresos({...inputTipoIngresos, blur: true})}} required error={(!inputTipoIngresos.validado && inputTipoIngresos.blur)}>Actividad comercial</InputLabel>
                            <Select onBlur={()=>{set_inputTipoIngresos({...inputTipoIngresos, blur: true})}} required value={inputTipoIngresos.valor} onChange={handleChange_inputTipoIngresos} label="Actividad comercial" error={(!inputTipoIngresos.validado && inputTipoIngresos.blur)}>
                                {Object.keys(apiCamposConstructor?.income_status?.values).map((key)=>{
                                    return ((key)?<MenuItem key={key} value={apiCamposConstructor?.income_status?.values[key]}><span className="capitalize">{apiCamposConstructor?.income_status?.values[key]}</span></MenuItem>:'');
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            autoComplete="off" 
                            fullWidth 
                            label="Ingreso mensuales" 
                            required 
                            onBlur={()=>{set_inputIngresosMensuales({...inputIngresosMensuales, blur: true})}}
                            value={inputIngresosMensuales.valor} 
                            onChange={handleChange_inputIngresosMensuales} 
                            error={(!inputIngresosMensuales.validado && inputIngresosMensuales.blur)} 
                            helperText={inputIngresosMensuales.textoAyuda} 
                        />
                    </Grid>
                    {(inputTipoIngresos.valor === 'comerciante') && 
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel onBlur={()=>{set_inputTipoNegocio({...inputTipoNegocio, blur: true})}} required error={(!inputTipoNegocio.validado && inputTipoNegocio.blur)}>Tipo de negocio</InputLabel>
                            <Select onBlur={()=>{set_inputTipoNegocio({...inputTipoNegocio, blur: true})}} required value={inputTipoNegocio.valor} onChange={handleChange_inputTipoNegocio} label="Tipo de negocio" error={(!inputTipoNegocio.validado && inputTipoNegocio.blur)}>
                                {Object.keys(apiCamposConstructor?.business_type?.values).map((key)=>{
                                    return ((key)?<MenuItem key={key} value={key}>{apiCamposConstructor?.business_type?.values[key]}</MenuItem>:'');
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    }
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel onBlur={()=>{set_inputEstadoCivil({...inputEstadoCivil, blur: true})}} required error={(!inputEstadoCivil.validado && inputEstadoCivil.blur)}>Estado Cívil</InputLabel>
                            <Select onBlur={()=>{set_inputEstadoCivil({...inputEstadoCivil, blur: true})}} required value={inputEstadoCivil.valor} onChange={handleChange_inputEstadoCivil} label="Estado Cívil" error={(!inputEstadoCivil.validado && inputEstadoCivil.blur)}>
                                {Object.keys(apiCamposConstructor?.marital_status?.values).map((key)=>{
                                    return ((key)?<MenuItem key={key} value={key}>{apiCamposConstructor?.marital_status?.values[key]}</MenuItem>:'');
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"es"}>
                            <DatePicker
                                fullWidth
                                openTo="year"
                                maxDate={moment().subtract(0, 'years')._d}
                                minDate={moment().subtract(20, 'years')._d}
                                label="Inicio de labores"
                                value={inputFechaIngresoTrabajo.valor}
                                onChange={handleChange_inputFechaIngresoTrabajo}
                                renderInput={(params) => <TextField {...params} autoComplete="off" onBlur={()=>{set_inputFechaIngresoTrabajo({...inputFechaIngresoTrabajo, blur: true})}} fullWidth required error={(!inputFechaIngresoTrabajo.validado && inputFechaIngresoTrabajo.blur)} />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <Button onClick={enviarARegistroApi2} disabled={(!botonEnviarHabilitado || cargandoRegister2)} variant="contained" sx={{ mt: 1, mr: 1 }} >{(cargandoRegister2)?"Enviando...":"Guardar datos"}</Button>
                        <Button onClick={cerrar} variant="contained" sx={{ mt: 1, mr: 1 }} >Cancelar</Button>
                    </Grid>
                </Grid>
                }
                {!apiCamposConstructor && 
                <Typography variant="body2" sx={{p: '2rem 0', color: 'silver'}} >Cargando....</Typography>
                }
                </>
                }
            </Box>
        </Box>
    );
}

function TerminarRegistro({open, todosaliobienfn, cerrar}){
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    return (
        <Dialog fullScreen={fullScreen} onClose={cerrar} open={open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
        {/* <DialogTitle id="alert-dialog-title">{"Completar registro"}</DialogTitle> */}
        <DialogContent>
          <TerminarRegistroForm todobiencallback={todosaliobienfn} cerrar={cerrar} />
        </DialogContent>
        {/* <DialogActions>
          <Button>Disagree</Button>
          <Button autoFocus>Agree</Button>
        </DialogActions> */}
      </Dialog>
    );
}


export default TerminarRegistro;
