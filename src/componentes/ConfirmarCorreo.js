import config from '../config';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';

function ConfirmarCorreo({estadoMail, nombreMail}){
    const gContext = useContext(AppContext);

    const [open, setOpen] = useState(false);
    const [correoReenviado, setCorreoReenviado] = useState(false);  
    const [enviadno, setEnviadno] = useState(false);

    useEffect(()=>{
        console.log('estadoMail: ', estadoMail);
        if(estadoMail === "CMP"){
            setOpen(false);
        }else{
            setOpen(true);
        }
    },[estadoMail]);

    // Recarga el navegador
    const btnYaLoValide = () => {
        window.location.reload();
    };

    // Por medio de axios envio una peticion al servidor para reenviar el correo
    const reenviarCorreo = () => {
        setEnviadno(true);
        axios.request({
            url: `${config.apiUrl}/api/app/resendMail.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
              },
        })
        .then((res) => {
            setEnviadno(false);
            if(res.data.status === "ERS"){
                localStorage.removeItem('arani_session_id');
                gContext.set_logeado({estado: false, token: ''});
            }
            if(res.data.status === "OK"){
               setCorreoReenviado(true); 
            }
           
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Dialog open={open} maxWidth="xs">
        <DialogTitle>Validar correo</DialogTitle>
        <DialogContent dividers>
            <DialogContentText sx={{m: '1rem 0'}} >
            Parece que aún no has validado tu correo electrónico <b>{nombreMail}</b>. <br></br><br></br>Revisa tu bandeja de entrada y sigue las instrucciones para validar tu correo.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={btnYaLoValide} variant='contained' color="primary">Ya lo valide</Button>
            <Button
                onClick={() => {
                    reenviarCorreo();
                    setCorreoReenviado(true);
                    setTimeout(() => setCorreoReenviado(false), 60000);
                }}
                disabled={correoReenviado || enviadno}
                variant='outlined'
                color="primary"
            >
                {correoReenviado ? "Reenviar Correo (60s)" : "Reenviar Correo"}
            </Button>
        </DialogActions>
        </Dialog>
    );
}

export default ConfirmarCorreo;
