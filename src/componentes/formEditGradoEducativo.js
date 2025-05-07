import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid, MenuItem, FormControl, Select, InputLabel} from "@mui/material";

// Editar Grado Educativo
function FormEditGradoEducativo({cerrar, reiniciarpantalla, apiCamposConstructor, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputGradoEducativo, set_inputGradoEducativo] = useState({ valor: usuarioDetalle ? usuarioDetalle.education : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);
    

    function handleChange_inputGradoEducativo(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Seleccione una opción.";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_inputGradoEducativo({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: inputGradoEducativo.blur,
        });
    }

    useEffect(()=>{
        if(inputGradoEducativo?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputGradoEducativo]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    education: inputGradoEducativo.valor
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
            <Typography variant="body" sx={{mb: '1rem'}} >Ingresa el grado educativo.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={12}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputGradoEducativo({...inputGradoEducativo, blur: true})}} required error={(!inputGradoEducativo.validado && inputGradoEducativo.blur)}>Grado educativo</InputLabel>
                        <Select onBlur={()=>{set_inputGradoEducativo({...inputGradoEducativo, blur: true})}} required value={inputGradoEducativo.valor} onChange={handleChange_inputGradoEducativo} label="Grado educativo" error={(!inputGradoEducativo.validado && inputGradoEducativo.blur)}>
                            {Object.keys(apiCamposConstructor?.education?.values).filter(key => apiCamposConstructor?.education?.values[key] !== "").map((key)=>{
                                return ((key)?<MenuItem key={key} value={key}>{apiCamposConstructor?.education?.values[key]}</MenuItem>:'');
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

export default FormEditGradoEducativo;