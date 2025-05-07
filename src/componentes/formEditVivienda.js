import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid, FormControl, MenuItem, InputLabel, Select} from "@mui/material";



//Editar Vivienda
function FormEditVivienda({cerrar, reiniciarpantalla, apiCamposConstructor, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputVivienda, set_inputVivienda] = useState({ valor: usuarioDetalle ? usuarioDetalle.home_status : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);
    
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

    useEffect(()=>{
        if(inputVivienda?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputVivienda]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    home_status: inputVivienda.valor
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
            <Typography variant="body" sx={{mb: '1rem'}} >Ingresa el tipo de vivienda que tiene.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={12}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputVivienda({...inputVivienda, blur: true})}} required error={(!inputVivienda.validado && inputVivienda.blur)}>Vivienda</InputLabel>
                        <Select onBlur={()=>{set_inputVivienda({...inputVivienda, blur: true})}} required value={inputVivienda.valor} onChange={handleChange_inputVivienda} label="Vivienda" error={(!inputVivienda.validado && inputVivienda.blur)}>
                            {Object.keys(apiCamposConstructor?.home_status?.values).map((key)=>{
                                return ((key)?<MenuItem key={key} value={apiCamposConstructor?.home_status?.values[key]}><span className="capitalize">{apiCamposConstructor?.home_status?.values[key]}</span></MenuItem>:'');
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

export default FormEditVivienda;