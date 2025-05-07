import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid, FormControl, MenuItem, InputLabel, Select} from "@mui/material";

//Editar tipo de ingreso

function FormEditTipoIngreso({cerrar, reiniciarpantalla, apiCamposConstructor, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputTipoIngresos, set_inputTipoIngresos] = useState({ valor: usuarioDetalle ? usuarioDetalle.income_status : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);
    
    const [inputTipoNegocio, set_inputTipoNegocio] = useState({valor: '', validado: false});

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

    useEffect(()=>{
        if(inputTipoIngresos?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputTipoIngresos]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    income_status: inputTipoIngresos.valor,
                    business_type: inputTipoNegocio.valor
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

    
    

    // useEffect(()=>{
    //     cargarDatosSeleccionables();
    //     // eslint-disable-next-line
    // }, []);

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingresa el tipo de ingreso que tiene actualmente.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={12}>
                    
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputTipoIngresos({...inputTipoIngresos, blur: true})}} required error={(!inputTipoIngresos.validado && inputTipoIngresos.blur)}>Actividad comercial</InputLabel>
                        <Select onBlur={()=>{set_inputTipoIngresos({...inputTipoIngresos, blur: true})}} required value={inputTipoIngresos.valor} onChange={handleChange_inputTipoIngresos} label="Actividad comercial" error={(!inputTipoIngresos.validado && inputTipoIngresos.blur)}>
                            {Object.keys(apiCamposConstructor?.income_status?.values).map((key)=>{
                                return ((key)?<MenuItem key={key} value={apiCamposConstructor?.income_status?.values[key]}><span className="capitalize">{apiCamposConstructor?.income_status?.values[key]}</span></MenuItem>:'');
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
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
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

export default FormEditTipoIngreso;