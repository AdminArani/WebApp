import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid, FormControl, MenuItem, InputLabel, Select, Autocomplete, TextField} from "@mui/material";

//Editar Ubicacion
function FormEditUbicacion({cerrar, reiniciarpantalla, usuarioDetalleFullR}){

    const gContext = useContext(AppContext);
    const [validado, set_validado] = useState(false);
    const [enviandoForm, set_enviandoForm] = useState(false);
    
    const [inputDepartamento, set_inputDepartamento] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_inputDepartamento(event){
        let valor = event.target.value;
        let validado = false;
        // console.log(event.target.value);
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
        set_inputMunicipio({...inputMunicipio, validado: false});
        set_inputLocalidad({...inputMunicipio, validado: false});
    }

    const [inputMunicipio, set_inputMunicipio] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_inputMunicipio(e, newValue){
        if(!newValue) return false;
        // console.log('inputMunicipi', newValue);
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
        set_inputLocalidad({...inputMunicipio, validado: false});
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

    const [numeroCasa, set_numeroCasa] = useState({valor: '', validado: false, textoAyuda: ""});
    function handleChange_numeroCasa(event){
        let valor = event.target.value;
        let validado = false;
        let texto = "Escriba algo";
        if(valor.length >= 1){
            validado = true;
            texto = "";
        }
        set_numeroCasa({
            validado: validado,
            valor: valor,
            textoAyuda: texto,
            blur: numeroCasa.blur,
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
        // console.log(usuarioDetalleFullR.ubs.filter(element => element.MunCod === inputMunicipio.valor && element.DepCod === inputDepartamento.valor).find(element => element.LocCod === inputLocalidad.valor).LocDsc);
        axios.request({
            url: `${config.apiUrl}/api/app/putProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
                array: {
                    region: usuarioDetalleFullR?.deps.find(element => element.DepCod === inputDepartamento.valor).DepDsc,
                    county: usuarioDetalleFullR.muns.filter(element => element.DepCod === inputDepartamento.valor).find(element => element.MunCod === inputMunicipio.valor).MunDsc,
                    city: usuarioDetalleFullR.ubs.filter(element => element.MunCod === inputMunicipio.valor && element.DepCod === inputDepartamento.valor).find(element => element.LocCod === inputLocalidad.valor).LocDsc,
                    house: numeroCasa.valor,
                    address_referece: referenciaCasa.valor,
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
        // console.log('usuarioDetalleFullR', usuarioDetalleFullR);
        if(inputDepartamento?.validado && inputMunicipio.validado && inputLocalidad.validado && numeroCasa.validado && referenciaCasa.validado){
            set_validado(true);
        }else{
            set_validado(false);
        }
        // eslint-disable-next-line
    },[inputDepartamento, inputMunicipio, inputLocalidad, numeroCasa, referenciaCasa]);

    return (
        <Box>
            <Typography variant="h5" sx={{}} >Editar</Typography>
            <Typography 
                variant="body" 
                sx={{
                    mb: '1.5rem'
                }}
            >
                Seleccione las opciones correspondientes a su residencia.
            </Typography>
            <Typography 
                variant="body2" 
                sx={{
                    mb: '1rem', 
                    color: 'gray', 
                    textAlign: 'justify', 
                    fontSize: '0.875rem', 
                    lineHeight: '1.5rem'
                }}
            >
                <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                    <li style={{ marginBottom: '0.5rem' }}>Por favor llenar todos los campos.</li>
                    <li style={{ marginBottom: '0.5rem' }}>La dirección (colonia y municipio) deben coincidir con la dirección que aparece en el recibo público cargado.</li>
                    <li>Si la colonia no aparece en el listado se debe ingresar la colonia en el campo de Referencia.</li>
                </ul>
            </Typography>
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
                <Grid item xs={12} sm={12}>
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
                        label="# de casa"
                        onBlur={()=>{set_numeroCasa({...numeroCasa, blur: true})}}
                        value={numeroCasa.valor}
                        onChange={handleChange_numeroCasa}
                        error={(!numeroCasa.validado && numeroCasa.blur)} 
                        helperText={numeroCasa.textoAyuda} 
                        />
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

export default FormEditUbicacion;