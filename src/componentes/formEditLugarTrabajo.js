import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, TextField, Typography, Box, Grid} from "@mui/material";

// Ubicaciion trabajo final 

function FormEditLugarTrabajo({cerrar, reiniciarpantalla, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputLugarTrabajo, set_inputLugarTrabajo] = useState({ valor: usuarioDetalle ? usuarioDetalle.workplace : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);

    function handleChange_inputLugarTrabajo(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Escriba algo mayor a 2 caracteres.";
        if(valor.length > 2){
            validado = true;
            textoAyuda = "";
        }
        set_inputLugarTrabajo({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputLugarTrabajo.blur,
        });
    }

    useEffect(()=>{
        if(inputLugarTrabajo?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputLugarTrabajo]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    workplace: inputLugarTrabajo.valor,
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

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography variant="body" sx={{mb: '1rem'}} >Ingrese el nombre de la empresa o negocio donde trabaja.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        autoComplete="off"
                        fullWidth
                        label="Lugar de trabajo"
                        onBlur={()=>{set_inputLugarTrabajo({...inputLugarTrabajo, blur: true})}}
                        value={inputLugarTrabajo.valor}
                        onChange={handleChange_inputLugarTrabajo}
                        error={(!inputLugarTrabajo.validado && inputLugarTrabajo.blur)} 
                        helperText={inputLugarTrabajo.textoAyuda} 
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

export default FormEditLugarTrabajo;