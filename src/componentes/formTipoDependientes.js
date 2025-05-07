import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid, MenuItem, FormControl, Select, InputLabel} from "@mui/material";

// TIPO DE DEPENDIENTES
function FormEditDependeti({cerrar, reiniciarpantalla, usuarioDetalle}){

    const gContext = useContext(AppContext);

    const [validado, set_validado] = useState(false);
    const [inputTipoDependientes, set_inputTipoDependientes] = useState({ valor: usuarioDetalle ? usuarioDetalle.dependents_who : '', validado: false, textoAyuda: "", blur: false });

    const [enviandoForm, set_enviandoForm] = useState(false);

    function handleChange_inputTipoDependientes(event){
        let valor = event.target.value;
        let validado = false;
        let textoAyuda = "Seleccione una opción.";
        if(valor !== ''){
            validado = true;
            textoAyuda = "";
        }
        set_inputTipoDependientes({
            valor: valor, 
            validado: validado,
            textoAyuda: textoAyuda,
            blur: inputTipoDependientes.blur,
        });
    }

    useEffect(()=>{
        if(inputTipoDependientes?.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputTipoDependientes]);

    function guardarDatos(){
        set_enviandoForm(true);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    dependents_who: inputTipoDependientes.valor,
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
            <Typography variant="body" sx={{mb: '1rem'}} >Ingrese el tipo de dependientes.</Typography>
            <Grid sx={{mt: 1, mb: 1}} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel onBlur={()=>{set_inputTipoDependientes({...inputTipoDependientes, blur: true})}} required error={(!inputTipoDependientes.validado && inputTipoDependientes.blur)}>Tipo de dependientes</InputLabel>
                        <Select onBlur={()=>{set_inputTipoDependientes({...inputTipoDependientes, blur: true})}} required value={inputTipoDependientes.valor} onChange={handleChange_inputTipoDependientes} label="Tipo de dependientes" error={(!inputTipoDependientes.validado && inputTipoDependientes.blur)}>
                            <MenuItem value={"Tus hijos"}>Tus hijos</MenuItem>
                            <MenuItem value={"Tu pareja"}>Tu pareja</MenuItem>
                            <MenuItem value={"Tus padres"}>Tus padres</MenuItem>
                            <MenuItem value={"Tus hermanos"}>Tus hermanos</MenuItem>
                            <MenuItem value={"No tengo dependientes"}>No tengo dependientes</MenuItem>
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

export default FormEditDependeti;