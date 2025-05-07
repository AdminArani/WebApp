import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid} from "@mui/material";
import logoArani from '../images/reciboluz.jpeg';

//Editar archivo 3
function FormEditFile3({reiniciarpantalla, usuarioFiles}){
    const gContext = useContext(AppContext);
    const [imageFiles3, set_imageFiles3] = useState(false);

    useEffect(()=>{
        console.log('usuarioFiles', usuarioFiles);
        
        let t21 = usuarioFiles.find(e=>e.type === "21");
        if(t21?.dir) set_imageFiles3(`${config.apiUrl}${t21?.dir}`);

        // eslint-disable-next-line
    }, []);

    

    const [cargandoArchivo3, set_cargandoArchivo3] = useState(false);
    const [subidoArchivo3, set_subidoArchivo3] = useState(false);
    const [imagendata3, set_imagendata3] = useState(false);
    function enviarArchivo3(e){
        console.log('event',e);

        let file = e.target.files[0];
        set_imagendata3(URL.createObjectURL(e.target.files[0]));
        const formData = new FormData();
        formData.append('file3', file);
        formData.append('sid', gContext.logeado?.token);

        set_cargandoArchivo3(true);
        axios.post(`${config.apiUrl}/api/app/putProfileFile.php`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        }).then((res) => {
            set_cargandoArchivo3(false);
            if(res.data.status === "ER"){
            }
            // if(res.data.status === "ERS"){
            //     localStorage.removeItem('arani_session_id');
            //     gContext.set_logeado({estado: false, token: ''});
            // }
            if(res.data.status === "OK"){
                set_subidoArchivo3(true);
                // reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Box>
        <Typography variant="h5" sx={{}}>Recibo público</Typography>
        <br />
        <Typography variant="body2" sx={{ textAlign: '' }}>
            Sube una foto clara de un recibo público de <strong>(los últimos 6 meses)</strong> de cualquiera de las siguientes empresas: <strong>EEH, UMAPS, Aguas de San Pedro, servicios de cable TIGO, Claro y Cable Color</strong>.  
            <br /> El recibo debe mostrar la dirección de su vivienda.  
            <br />
            <br />
            <strong>Si el recibo no cumple las condiciones mencionadas no será aceptado</strong>
        </Typography>
        <Grid sx={{ mt: 1, mb: 1 }} container spacing={2} alignItems="stretch">
            <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                {subidoArchivo3 && (
                    <Typography sx={{ textAlign: 'center', color: '#5aad55' }}>
                        Se subió correctamente
                    </Typography>
                )}
                {(subidoArchivo3 || imageFiles3) && (
                    <img
                        className="imgprevperfil"
                        src={imagendata3 || imageFiles3}
                        alt="preview"
                        style={{ width: '100%', height: 'auto', flexGrow: 1 }}
                    />
                )}
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                <img
                    src={logoArani} // Usa la imagen importada
                    alt="Logo Arani"
                    style={{ width: '100%', height: 'auto', flexGrow: 1 }}
                />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                    fullWidth
                    disabled={cargandoArchivo3 || subidoArchivo3}
                    variant="contained"
                    component="label"
                    startIcon={
                        <span className="material-symbols-outlined">cloud_upload</span>
                    }
                >
                    {cargandoArchivo3 ? 'Subiendo...' : 'Subir recibo público'}
                    <input
                        hidden
                        onChange={enviarArchivo3}
                        accept="image/*"
                        multiple
                        type="file"
                    />
                </Button>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button onClick={reiniciarpantalla} sx={{ mt: 1, mr: 1 }}>
                    Cerrar
                </Button>
            </Grid>
        </Grid>
    </Box>
    )
}

export default FormEditFile3;