import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid, FormControl, MenuItem, InputLabel, Select, Autocomplete, TextField} from "@mui/material";

// Ubicacion Trabajo inicio
function FormEditUbicacionTrabajo({cerrar, reiniciarpantalla, usuarioDetalleFullR, usuarioDetalle}){

    const gContext = useContext(AppContext);
    const [validado, set_validado] = useState(false);
    const [enviandoForm, set_enviandoForm] = useState(false);
    
    const [inputDepartamento, set_inputDepartamento] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_inputDepartamento(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 0){
            validado = true;
            texto = "";
        }
        set_inputDepartamento({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputDepartamento.blur,
        });
    }

    const [inputMunicipio, set_inputMunicipio] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_inputMunicipio(e, newValue){
        if(!newValue) return false;
        let valor = newValue;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 0){
            validado = true;
            texto = "";
        }
        set_inputMunicipio({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputMunicipio.blur,
        });
    }

    const [inputLocalidad, set_inputLocalidad] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_inputLocalidad(e, newValue){
        if(!newValue) return false;
        // console.log(e);
        // console.log('inputLocalidad', newValue);
        let valor = newValue;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputLocalidad({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputLocalidad.blur,
        });
    }

    const [referenciaCasa, set_referenciaCasa] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_referenciaCasa(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Escriba algo";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_referenciaCasa({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: referenciaCasa.blur,
        });
    }

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    work_region: usuarioDetalleFullR?.deps.find(element => element.DepCod === inputDepartamento.valor).DepDsc,
                    work_county: usuarioDetalleFullR.muns.filter(element => element.DepCod === inputDepartamento.valor).find(element => element.MunCod === inputMunicipio.valor).MunDsc,
                    work_city: usuarioDetalleFullR.ubs.filter(element => element.MunCod === inputMunicipio.valor && element.DepCod === inputDepartamento.valor).find(element => element.LocCod === inputLocalidad.valor).LocDsc,
                    workplace_address: referenciaCasa.valor,
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
                reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    useEffect(()=>{
        if(inputDepartamento?.validado && inputMunicipio.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
    },[inputDepartamento, inputMunicipio]);

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Seleccione las opciones correspondientes a su lugar de trabajo.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputDepartamento({...inputDepartamento, blur: true})}} required error={(!inputDepartamento.validado && inputDepartamento.blur)}>Departamento</InputLabel>
                        <Select onBlur={()=>{set_inputDepartamento({...inputDepartamento, blur: true})}} required value={inputDepartamento.valor} onChange={handleChange_inputDepartamento} label="Departamento" error={(!inputDepartamento.validado && inputDepartamento.blur)}>
                            {usuarioDetalleFullR?.deps.map((element)=>{
                                return ((element.DepCod)?<MenuItem key={element.DepCod} value={element.DepCod}><span className="capitalize">{element.DepDsc}</span></MenuItem>:'');
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <Autocomplete
                            disablePortal={false}
                            id="combo-box-demo"
                            onChange={(e, newdata)=>handleChange_inputMunicipio(e, newdata.MunCod)}
                            options={usuarioDetalleFullR.muns.filter(element => element.DepCod === inputDepartamento.valor)}
                            getOptionLabel={(option) => option.MunDsc}
                            renderInput={(params) => <TextField inputProps={params.inputProps} onBlur={()=>{set_inputMunicipio({...inputMunicipio, blur: true})}} sx={{zIndex: 1000}} {...params} label="Municipio" error={(!inputMunicipio.validado && inputMunicipio.blur)} />}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <Autocomplete
                            disablePortal={false}
                            id="combo-box-demo"
                            onChange={(e, newdata)=>handleChange_inputLocalidad(e, newdata.LocCod)}
                            options={usuarioDetalleFullR.ubs.filter(element => element.MunCod === inputMunicipio.valor && element.DepCod === inputDepartamento.valor)}
                            getOptionLabel={(option) => option.LocDsc}
                            renderInput={(params) => <TextField onBlur={()=>{set_inputLocalidad({...inputLocalidad, blur: true})}} sx={{zIndex: 1000}} {...params} label="Colonia o Barrio" error={(!inputLocalidad.validado && inputLocalidad.blur)} />}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        autoComplete="off"
                        fullWidth
                        label="Referencia"
                        onBlur={()=>{set_referenciaCasa({...referenciaCasa, blur: true})}}
                        value={referenciaCasa.valor}
                        onChange={handleChange_referenciaCasa}
                        error={(!referenciaCasa.validado && referenciaCasa.blur)} 
                        helperText={referenciaCasa.textoAyuda} 
                        />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

export default FormEditUbicacionTrabajo;