import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid, FormControl, MenuItem, InputLabel, Select} from "@mui/material";


//Editar Estado Civil

function FormEditEstadoCivil({cerrar, reiniciarpantalla, apiCamposConstructor, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputEstadoCivil, set_inputEstadoCivil] = useState({ valor: usuarioDetalle ? usuarioDetalle.marital_status : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);
    

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

    useEffect(()=>{
        if(inputEstadoCivil?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputEstadoCivil]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    marital_status: inputEstadoCivil.valor
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




    

    // useEffect(()=>{
    //     cargarDatosSeleccionables();
    //     // eslint-disable-next-line
    // }, []);

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingresa su estatus civil.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={12}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputEstadoCivil({...inputEstadoCivil, blur: true})}} required error={(!inputEstadoCivil.validado && inputEstadoCivil.blur)}>Estado Cívil</InputLabel>
                        <Select onBlur={()=>{set_inputEstadoCivil({...inputEstadoCivil, blur: true})}} required value={inputEstadoCivil.valor} onChange={handleChange_inputEstadoCivil} label="Estado Cívil" error={(!inputEstadoCivil.validado && inputEstadoCivil.blur)}>
                            {Object.keys(apiCamposConstructor?.marital_status?.values).map((key)=>{
                                return ((key)?<MenuItem key={key} value={key}>{apiCamposConstructor?.marital_status?.values[key]}</MenuItem>:'');
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Button disabled={(validado && !enviandoForm)?false:true} variant="contained" onClick={guardarDatos} sx={{ mt: 1, mr: 1 }} >{(enviandoForm)?"Enviando....":"Guardar cambios"}</Button>
                    <Button onClick={cerrar} sx={{ mt: 1, mr: 1 }} >Cerrar</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

export default FormEditEstadoCivil;